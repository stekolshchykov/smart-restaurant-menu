use std::collections::HashMap;

use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum AppError {
    #[error("Internal server error")]
    Internal(#[from] anyhow::Error),

    #[error("Configuration error: {0}")]
    Config(String),

    #[error("Database error: {0}")]
    Database(#[from] sqlx::Error),

    #[error("Invalid credentials")]
    InvalidCredentials,

    #[error("Unauthorized")]
    Unauthorized,

    #[error("Token expired")]
    TokenExpired,

    #[error("User already exists")]
    UserAlreadyExists,

    #[error("Forbidden")]
    Forbidden,

    #[error("Validation error")]
    ValidationError(HashMap<String, Vec<String>>),
}

impl AppError {
    pub fn status_code(&self) -> StatusCode {
        match self {
            AppError::Internal(_) | AppError::Config(_) | AppError::Database(_) => {
                StatusCode::INTERNAL_SERVER_ERROR
            }
            AppError::InvalidCredentials | AppError::Unauthorized | AppError::TokenExpired => {
                StatusCode::UNAUTHORIZED
            }
            AppError::UserAlreadyExists => StatusCode::CONFLICT,
            AppError::Forbidden => StatusCode::FORBIDDEN,
            AppError::ValidationError(_) => StatusCode::BAD_REQUEST,
        }
    }

    pub fn error_code(&self) -> &'static str {
        match self {
            AppError::Internal(_) => "INTERNAL_ERROR",
            AppError::Config(_) => "CONFIG_ERROR",
            AppError::Database(_) => "DATABASE_ERROR",
            AppError::InvalidCredentials => "INVALID_CREDENTIALS",
            AppError::Unauthorized => "UNAUTHORIZED",
            AppError::TokenExpired => "TOKEN_EXPIRED",
            AppError::UserAlreadyExists => "USER_ALREADY_EXISTS",
            AppError::Forbidden => "FORBIDDEN",
            AppError::ValidationError(_) => "VALIDATION_ERROR",
        }
    }
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let status = self.status_code();
        let code = self.error_code();

        let (message, errors) = match &self {
            AppError::Internal(err) => {
                tracing::error!(?err, "internal error");
                (self.to_string(), None)
            }
            AppError::Config(msg) => {
                tracing::error!("config error: {}", msg);
                (self.to_string(), None)
            }
            AppError::Database(err) => {
                tracing::error!(?err, "database error");
                (self.to_string(), None)
            }
            AppError::ValidationError(errors) => {
                ("Validation failed".to_string(), Some(errors.clone()))
            }
            _ => (self.to_string(), None),
        };

        let body = if let Some(errors) = errors {
            json!({
                "code": code,
                "message": message,
                "errors": errors,
            })
        } else {
            json!({
                "code": code,
                "message": message,
            })
        };

        (status, Json(body)).into_response()
    }
}
