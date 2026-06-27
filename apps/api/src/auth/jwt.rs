use chrono::{Duration, Utc};
use jsonwebtoken::{
    decode, encode, errors::ErrorKind, DecodingKey, EncodingKey, Header, Validation,
};
use serde::{Deserialize, Serialize};

use crate::auth::models::User;
use crate::error::AppError;

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Claims {
    pub sub: String,
    pub email: String,
    pub role: String,
    pub exp: usize,
    pub jti: String,
}

pub fn create_access_token(
    user: &User,
    secret: &str,
    expiry_minutes: i64,
) -> Result<String, AppError> {
    let exp = Utc::now() + Duration::minutes(expiry_minutes);
    let claims = Claims {
        sub: user.id.to_string(),
        email: user.email.clone(),
        role: user.role.clone(),
        exp: exp.timestamp() as usize,
        jti: uuid::Uuid::new_v4().to_string(),
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )
    .map_err(|err| {
        tracing::error!(?err, "failed to create access token");
        AppError::Internal(err.into())
    })
}

pub fn decode_access_token(token: &str, secret: &str) -> Result<Claims, AppError> {
    decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret.as_bytes()),
        &Validation::default(),
    )
    .map(|data| data.claims)
    .map_err(|err| match err.kind() {
        ErrorKind::ExpiredSignature => AppError::TokenExpired,
        _ => {
            tracing::debug!(?err, "failed to decode access token");
            AppError::Unauthorized
        }
    })
}
