use std::collections::HashMap;

use std::sync::LazyLock;

use base64::Engine;
use chrono::{Duration, Utc};
use cookie::{Cookie, SameSite};
use rand::RngCore;
use regex::Regex;

use crate::auth::{
    jwt, models, password,
    repository::{self},
};
use crate::config::AppConfig;
use crate::error::AppError;
use crate::state::AppState;

use models::{AuthResponse, LoginRequest, RegisterRequest, UserResponse};

static EMAIL_RE: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r"^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$")
        .expect("email regex is valid")
});

const REFRESH_COOKIE_NAME: &str = "refresh_token";
const REFRESH_TOKEN_BYTES: usize = 64;

pub async fn register(
    state: &AppState,
    req: RegisterRequest,
) -> Result<(AuthResponse, Cookie<'static>), AppError> {
    validate_registration(&req)?;

    if repository::get_user_by_email(&state.db, &req.email)
        .await?
        .is_some()
    {
        return Err(AppError::UserAlreadyExists);
    }

    let password_hash = password::hash_password(&req.password)?;
    let user = repository::create_user(
        &state.db,
        &req.email,
        req.name.as_deref(),
        &password_hash,
        "owner",
    )
    .await?;

    let access_token = jwt::create_access_token(
        &user,
        &state.config.jwt_secret,
        state.config.jwt_access_expiry_minutes,
    )?;
    let refresh_cookie = issue_refresh_cookie(state, user.id, &state.db).await?;

    Ok((
        AuthResponse {
            access_token,
            user: UserResponse::from(&user),
        },
        refresh_cookie,
    ))
}

pub async fn login(
    state: &AppState,
    req: LoginRequest,
) -> Result<(AuthResponse, Cookie<'static>), AppError> {
    validate_login(&req)?;

    let user = repository::get_user_by_email(&state.db, &req.email)
        .await?
        .ok_or(AppError::InvalidCredentials)?;

    if !password::verify_password(&req.password, &user.password_hash)? {
        return Err(AppError::InvalidCredentials);
    }

    let access_token = jwt::create_access_token(
        &user,
        &state.config.jwt_secret,
        state.config.jwt_access_expiry_minutes,
    )?;
    let refresh_cookie = issue_refresh_cookie(state, user.id, &state.db).await?;

    Ok((
        AuthResponse {
            access_token,
            user: UserResponse::from(&user),
        },
        refresh_cookie,
    ))
}

pub async fn refresh(
    state: &AppState,
    refresh_cookie: Option<Cookie<'_>>,
) -> Result<(AuthResponse, Cookie<'static>), AppError> {
    let cookie = refresh_cookie.ok_or(AppError::Unauthorized)?;
    let token = cookie.value();
    let token_hash = hash_refresh_token(token);

    let row = repository::get_refresh_token(&state.db, &token_hash)
        .await?
        .ok_or(AppError::Unauthorized)?;

    if row.expires_at < Utc::now() {
        return Err(AppError::TokenExpired);
    }

    let user = repository::get_user_by_id(&state.db, row.user_id)
        .await?
        .ok_or(AppError::Unauthorized)?;

    let mut tx = state.db.begin().await?;
    let new_refresh_cookie = issue_refresh_cookie(state, user.id, &mut *tx).await?;
    repository::delete_refresh_token(&mut *tx, &token_hash).await?;
    tx.commit().await?;

    let access_token = jwt::create_access_token(
        &user,
        &state.config.jwt_secret,
        state.config.jwt_access_expiry_minutes,
    )?;

    Ok((
        AuthResponse {
            access_token,
            user: UserResponse::from(&user),
        },
        new_refresh_cookie,
    ))
}

pub async fn logout(
    state: &AppState,
    refresh_cookie: Option<Cookie<'_>>,
) -> Result<Cookie<'static>, AppError> {
    if let Some(cookie) = refresh_cookie {
        let token_hash = hash_refresh_token(cookie.value());
        repository::delete_refresh_token(&state.db, &token_hash).await?;
    }

    Ok(build_cleared_refresh_cookie(&state.config))
}

fn validate_registration(req: &RegisterRequest) -> Result<(), AppError> {
    let mut errors: HashMap<String, Vec<String>> = HashMap::new();

    if !EMAIL_RE.is_match(&req.email) {
        errors
            .entry("email".to_string())
            .or_default()
            .push("Invalid email format".to_string());
    }

    if req.password.len() < 8 {
        errors
            .entry("password".to_string())
            .or_default()
            .push("Password must be at least 8 characters".to_string());
    }

    if errors.is_empty() {
        Ok(())
    } else {
        Err(AppError::ValidationError(errors))
    }
}

fn validate_login(req: &LoginRequest) -> Result<(), AppError> {
    let mut errors: HashMap<String, Vec<String>> = HashMap::new();

    if !EMAIL_RE.is_match(&req.email) {
        errors
            .entry("email".to_string())
            .or_default()
            .push("Invalid email format".to_string());
    }

    if req.password.is_empty() {
        errors
            .entry("password".to_string())
            .or_default()
            .push("Password is required".to_string());
    }

    if errors.is_empty() {
        Ok(())
    } else {
        Err(AppError::ValidationError(errors))
    }
}

async fn issue_refresh_cookie<'e, E>(
    state: &AppState,
    user_id: uuid::Uuid,
    executor: E,
) -> Result<Cookie<'static>, AppError>
where
    E: sqlx::Executor<'e, Database = sqlx::Postgres>,
{
    let token = generate_refresh_token();
    let token_hash = hash_refresh_token(&token);
    let expires_at = Utc::now() + Duration::days(state.config.jwt_refresh_expiry_days);

    repository::save_refresh_token(executor, &token_hash, user_id, expires_at).await?;

    Ok(build_refresh_cookie(token, &state.config))
}

fn generate_refresh_token() -> String {
    let mut bytes = vec![0u8; REFRESH_TOKEN_BYTES];
    rand::thread_rng().fill_bytes(&mut bytes);
    base64::engine::general_purpose::STANDARD.encode(bytes)
}

fn hash_refresh_token(token: &str) -> String {
    blake3::hash(token.as_bytes()).to_hex().to_string()
}

fn build_refresh_cookie(token: String, config: &AppConfig) -> Cookie<'static> {
    let max_age = cookie::time::Duration::days(config.jwt_refresh_expiry_days);

    Cookie::build((REFRESH_COOKIE_NAME, token))
        .http_only(true)
        .same_site(SameSite::Lax)
        .path("/")
        .secure(config.app_env == "production")
        .max_age(max_age)
        .build()
}

fn build_cleared_refresh_cookie(config: &AppConfig) -> Cookie<'static> {
    Cookie::build((REFRESH_COOKIE_NAME, ""))
        .http_only(true)
        .same_site(SameSite::Lax)
        .path("/")
        .secure(config.app_env == "production")
        .max_age(cookie::time::Duration::seconds(0))
        .build()
}
