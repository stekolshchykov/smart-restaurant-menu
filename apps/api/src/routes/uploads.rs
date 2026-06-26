use std::path::Path;

use axum::{extract::Multipart, http::StatusCode, Json};
use serde::Serialize;
use uuid::Uuid;

use crate::error::AppError;

#[derive(Debug, Serialize)]
pub struct UploadResponse {
    pub url: String,
}

pub async fn upload_image(
    mut multipart: Multipart,
) -> Result<(StatusCode, Json<UploadResponse>), AppError> {
    let field = multipart
        .next_field()
        .await
        .map_err(|_| AppError::InvalidUpload)?
        .ok_or(AppError::InvalidUpload)?;

    let file_name = field
        .file_name()
        .ok_or(AppError::InvalidUpload)?
        .to_string();
    let content_type = field.content_type().map(|s| s.to_string());

    let data = field.bytes().await.map_err(|_| AppError::InvalidUpload)?;
    if data.is_empty() {
        return Err(AppError::InvalidUpload);
    }

    let is_image = content_type
        .as_deref()
        .map(|ct| ct.starts_with("image/"))
        .unwrap_or(false);
    if !is_image {
        return Err(AppError::InvalidUpload);
    }

    let ext = Path::new(&file_name)
        .extension()
        .and_then(|e| e.to_str())
        .map(|s| s.to_lowercase());

    let filename = format!(
        "{}{}",
        Uuid::new_v4(),
        ext.map(|e| format!(".{e}")).unwrap_or_default()
    );
    let path = Path::new("uploads").join(&filename);

    tokio::fs::write(&path, data)
        .await
        .map_err(|err| AppError::Internal(err.into()))?;

    Ok((
        StatusCode::CREATED,
        Json(UploadResponse {
            url: format!("/uploads/{filename}"),
        }),
    ))
}
