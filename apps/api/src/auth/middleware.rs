use axum::{
    extract::{FromRef, FromRequestParts},
    http::request::Parts,
};
use serde::Serialize;
use uuid::Uuid;

use crate::auth::{jwt, repository};
use crate::error::AppError;
use crate::state::AppState;

#[derive(Debug, Clone, Serialize)]
pub struct CurrentUser {
    pub id: Uuid,
    pub email: String,
    pub role: String,
}

impl<S> FromRequestParts<S> for CurrentUser
where
    AppState: FromRef<S>,
    S: Send + Sync,
{
    type Rejection = AppError;

    async fn from_request_parts(parts: &mut Parts, state: &S) -> Result<Self, Self::Rejection> {
        let state = AppState::from_ref(state);

        let auth_header = parts
            .headers
            .get("authorization")
            .and_then(|value| value.to_str().ok())
            .ok_or(AppError::Unauthorized)?;

        let token = auth_header
            .strip_prefix("Bearer ")
            .ok_or(AppError::Unauthorized)?;

        let claims = jwt::decode_access_token(token, &state.config.jwt_secret)?;
        let user_id = Uuid::parse_str(&claims.sub).map_err(|_| AppError::Unauthorized)?;

        let user = repository::get_user_by_id(&state.db, user_id)
            .await?
            .ok_or(AppError::Unauthorized)?;

        Ok(Self {
            id: user.id,
            email: user.email,
            role: user.role,
        })
    }
}
