use axum::{extract::State, http::StatusCode, Json};
use tower_cookies::Cookies;

use crate::auth::{
    middleware::CurrentUser,
    models::{AuthResponse, LoginRequest, RegisterRequest},
    service,
};
use crate::error::AppError;
use crate::state::AppState;

pub async fn register(
    State(state): State<AppState>,
    cookies: Cookies,
    Json(req): Json<RegisterRequest>,
) -> Result<(StatusCode, Json<AuthResponse>), AppError> {
    let (response, cookie) = service::register(&state, req).await?;
    cookies.add(cookie);
    Ok((StatusCode::CREATED, Json(response)))
}

pub async fn login(
    State(state): State<AppState>,
    cookies: Cookies,
    Json(req): Json<LoginRequest>,
) -> Result<Json<AuthResponse>, AppError> {
    let (response, cookie) = service::login(&state, req).await?;
    cookies.add(cookie);
    Ok(Json(response))
}

pub async fn refresh(
    State(state): State<AppState>,
    cookies: Cookies,
) -> Result<Json<AuthResponse>, AppError> {
    let refresh_cookie = cookies.get("refresh_token");
    let (response, cookie) = service::refresh(&state, refresh_cookie).await?;
    cookies.add(cookie);
    Ok(Json(response))
}

pub async fn logout(
    State(state): State<AppState>,
    cookies: Cookies,
) -> Result<StatusCode, AppError> {
    let refresh_cookie = cookies.get("refresh_token");
    let clear_cookie = service::logout(&state, refresh_cookie).await?;
    cookies.remove(clear_cookie);
    Ok(StatusCode::NO_CONTENT)
}

pub async fn me(user: CurrentUser) -> Json<CurrentUser> {
    Json(user)
}
