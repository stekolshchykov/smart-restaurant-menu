use chrono::{DateTime, Utc};
use sqlx::{query, query_as, Executor};
use uuid::Uuid;

use crate::auth::models::User;
use crate::error::AppError;

#[derive(Debug, Clone, sqlx::FromRow)]
pub struct RefreshTokenRow {
    pub token_hash: String,
    pub user_id: Uuid,
    pub expires_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
    pub previous_token_hash: Option<String>,
}

pub async fn create_user<'e, E>(
    executor: E,
    email: &str,
    name: Option<&str>,
    password_hash: &str,
    role: &str,
) -> Result<User, AppError>
where
    E: Executor<'e, Database = sqlx::Postgres>,
{
    query_as::<_, User>(
        "INSERT INTO users (email, name, password_hash, role)
         VALUES ($1, $2, $3, $4)
         RETURNING id, email, name, password_hash, role, created_at, updated_at",
    )
    .bind(email)
    .bind(name)
    .bind(password_hash)
    .bind(role)
    .fetch_one(executor)
    .await
    .map_err(map_unique_violation)
}

pub async fn get_user_by_email<'e, E>(executor: E, email: &str) -> Result<Option<User>, AppError>
where
    E: Executor<'e, Database = sqlx::Postgres>,
{
    query_as::<_, User>(
        "SELECT id, email, name, password_hash, role, created_at, updated_at
         FROM users
         WHERE email = $1",
    )
    .bind(email)
    .fetch_optional(executor)
    .await
    .map_err(AppError::from)
}

pub async fn get_user_by_id<'e, E>(executor: E, id: Uuid) -> Result<Option<User>, AppError>
where
    E: Executor<'e, Database = sqlx::Postgres>,
{
    query_as::<_, User>(
        "SELECT id, email, name, password_hash, role, created_at, updated_at
         FROM users
         WHERE id = $1",
    )
    .bind(id)
    .fetch_optional(executor)
    .await
    .map_err(AppError::from)
}

pub async fn save_refresh_token<'e, E>(
    executor: E,
    token_hash: &str,
    user_id: Uuid,
    expires_at: DateTime<Utc>,
    previous_token_hash: Option<&str>,
) -> Result<(), AppError>
where
    E: Executor<'e, Database = sqlx::Postgres>,
{
    query(
        "INSERT INTO refresh_tokens (token_hash, user_id, expires_at, previous_token_hash)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (token_hash)
         DO UPDATE SET
             user_id = EXCLUDED.user_id,
             expires_at = EXCLUDED.expires_at,
             previous_token_hash = EXCLUDED.previous_token_hash",
    )
    .bind(token_hash)
    .bind(user_id)
    .bind(expires_at)
    .bind(previous_token_hash)
    .execute(executor)
    .await?;

    Ok(())
}

pub async fn get_refresh_token<'e, E>(
    executor: E,
    token_hash: &str,
) -> Result<Option<RefreshTokenRow>, AppError>
where
    E: Executor<'e, Database = sqlx::Postgres>,
{
    query_as::<_, RefreshTokenRow>(
        "SELECT token_hash, user_id, expires_at, created_at, previous_token_hash
         FROM refresh_tokens
         WHERE token_hash = $1",
    )
    .bind(token_hash)
    .fetch_optional(executor)
    .await
    .map_err(AppError::from)
}

pub async fn get_refresh_token_for_update<'e, E>(
    executor: E,
    token_hash: &str,
) -> Result<Option<RefreshTokenRow>, AppError>
where
    E: Executor<'e, Database = sqlx::Postgres>,
{
    query_as::<_, RefreshTokenRow>(
        "SELECT token_hash, user_id, expires_at, created_at, previous_token_hash
         FROM refresh_tokens
         WHERE token_hash = $1
         FOR UPDATE",
    )
    .bind(token_hash)
    .fetch_optional(executor)
    .await
    .map_err(AppError::from)
}

pub async fn get_refresh_token_by_previous_hash<'e, E>(
    executor: E,
    token_hash: &str,
) -> Result<Option<RefreshTokenRow>, AppError>
where
    E: Executor<'e, Database = sqlx::Postgres>,
{
    query_as::<_, RefreshTokenRow>(
        "SELECT token_hash, user_id, expires_at, created_at, previous_token_hash
         FROM refresh_tokens
         WHERE previous_token_hash = $1
         LIMIT 1",
    )
    .bind(token_hash)
    .fetch_optional(executor)
    .await
    .map_err(AppError::from)
}

pub async fn delete_refresh_token<'e, E>(executor: E, token_hash: &str) -> Result<(), AppError>
where
    E: Executor<'e, Database = sqlx::Postgres>,
{
    query("DELETE FROM refresh_tokens WHERE token_hash = $1")
        .bind(token_hash)
        .execute(executor)
        .await?;

    Ok(())
}

pub async fn delete_user_refresh_tokens<'e, E>(executor: E, user_id: Uuid) -> Result<(), AppError>
where
    E: Executor<'e, Database = sqlx::Postgres>,
{
    query("DELETE FROM refresh_tokens WHERE user_id = $1")
        .bind(user_id)
        .execute(executor)
        .await?;

    Ok(())
}

fn map_unique_violation(err: sqlx::Error) -> AppError {
    if let sqlx::Error::Database(db_err) = &err {
        if db_err.constraint() == Some("users_email_key") {
            return AppError::UserAlreadyExists;
        }
    }
    AppError::from(err)
}
