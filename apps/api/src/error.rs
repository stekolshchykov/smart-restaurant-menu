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

    #[error("Project not found")]
    ProjectNotFound,

    #[error("Slug already taken")]
    SlugTaken,

    #[error("Invalid slug")]
    InvalidSlug,

    #[error("Invalid project mode")]
    InvalidMode,

    #[error("Invalid project status")]
    InvalidProjectStatus,

    #[error("Category not found")]
    CategoryNotFound,

    #[error("Menu item not found")]
    MenuItemNotFound,

    #[error("Modifier group not found")]
    ModifierGroupNotFound,

    #[error("Modifier option not found")]
    ModifierOptionNotFound,

    #[error("Allergen not found")]
    AllergenNotFound,

    #[error("Tag not found")]
    TagNotFound,

    #[error("Invalid price")]
    InvalidPrice,

    #[error("Invalid selection count")]
    InvalidSelection,

    #[error("Invalid upload")]
    InvalidUpload,

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
            AppError::ProjectNotFound => StatusCode::NOT_FOUND,
            AppError::SlugTaken => StatusCode::CONFLICT,
            AppError::InvalidSlug | AppError::InvalidMode | AppError::InvalidProjectStatus => {
                StatusCode::BAD_REQUEST
            }
            AppError::CategoryNotFound => StatusCode::NOT_FOUND,
            AppError::MenuItemNotFound => StatusCode::NOT_FOUND,
            AppError::ModifierGroupNotFound => StatusCode::NOT_FOUND,
            AppError::ModifierOptionNotFound => StatusCode::NOT_FOUND,
            AppError::AllergenNotFound => StatusCode::NOT_FOUND,
            AppError::TagNotFound => StatusCode::NOT_FOUND,
            AppError::InvalidPrice | AppError::InvalidSelection | AppError::InvalidUpload => {
                StatusCode::BAD_REQUEST
            }
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
            AppError::ProjectNotFound => "PROJECT_NOT_FOUND",
            AppError::SlugTaken => "SLUG_TAKEN",
            AppError::InvalidSlug => "INVALID_SLUG",
            AppError::InvalidMode => "INVALID_MODE",
            AppError::InvalidProjectStatus => "INVALID_PROJECT_STATUS",
            AppError::CategoryNotFound => "CATEGORY_NOT_FOUND",
            AppError::MenuItemNotFound => "MENU_ITEM_NOT_FOUND",
            AppError::ModifierGroupNotFound => "MODIFIER_GROUP_NOT_FOUND",
            AppError::ModifierOptionNotFound => "MODIFIER_OPTION_NOT_FOUND",
            AppError::AllergenNotFound => "ALLERGEN_NOT_FOUND",
            AppError::TagNotFound => "TAG_NOT_FOUND",
            AppError::InvalidPrice => "INVALID_PRICE",
            AppError::InvalidSelection => "INVALID_SELECTION",
            AppError::InvalidUpload => "INVALID_UPLOAD",
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
