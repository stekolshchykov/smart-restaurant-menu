use std::path::{Path, PathBuf};

use axum::{
    extract::{Multipart, State},
    http::StatusCode,
    Json,
};
use serde::Serialize;
use uuid::Uuid;

use crate::auth::middleware::CurrentUser;
use crate::error::AppError;
use crate::state::AppState;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UploadResponse {
    pub url: String,
}

const MAX_FILE_SIZE: usize = 5 * 1024 * 1024; // 5 MB
const MAX_FILENAME_LEN: usize = 255;
const ALLOWED_EXTENSIONS: &[&str] = &["jpg", "jpeg", "png", "webp", "gif"];
const ALLOWED_CONTENT_TYPES: &[&str] = &[
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
];

pub async fn upload_image(
    _user: CurrentUser,
    State(state): State<AppState>,
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

    validate_file_name(&file_name)?;

    let data = field.bytes().await.map_err(|_| AppError::InvalidUpload)?;
    if data.is_empty() {
        return Err(AppError::InvalidUpload);
    }
    if data.len() > MAX_FILE_SIZE {
        return Err(AppError::FileTooLarge);
    }

    let ext = Path::new(&file_name)
        .extension()
        .and_then(|e| e.to_str())
        .map(|s| s.to_lowercase())
        .ok_or(AppError::InvalidFileType)?;

    if !ALLOWED_EXTENSIONS.contains(&ext.as_str()) {
        return Err(AppError::InvalidFileType);
    }

    let content_type = content_type.as_deref().unwrap_or("");
    if !ALLOWED_CONTENT_TYPES.contains(&content_type) {
        return Err(AppError::InvalidFileType);
    }

    if !has_image_signature(&data, &ext) {
        return Err(AppError::InvalidFileType);
    }

    let filename = format!("{uuid}.{ext}", uuid = Uuid::new_v4());
    let upload_dir = PathBuf::from(&state.config.upload_dir);
    let path = upload_dir.join(&filename);

    // Defense in depth: ensure the resolved path stays inside the upload directory.
    let canonical_base = tokio::fs::canonicalize(&upload_dir)
        .await
        .unwrap_or_else(|_| upload_dir.clone());
    if let Ok(canonical_path) = tokio::fs::canonicalize(&path).await {
        if !canonical_path.starts_with(&canonical_base) {
            return Err(AppError::InvalidUpload);
        }
    }

    tokio::fs::write(&path, data)
        .await
        .map_err(|err| AppError::Internal(err.into()))?;

    Ok((
        StatusCode::CREATED,
        Json(UploadResponse {
            url: format!("{}/uploads/{filename}", state.config.api_origin()),
        }),
    ))
}

fn validate_file_name(file_name: &str) -> Result<(), AppError> {
    if file_name.is_empty() || file_name.len() > MAX_FILENAME_LEN {
        return Err(AppError::InvalidUpload);
    }
    if file_name.contains('\0') || file_name.contains("..") {
        return Err(AppError::InvalidUpload);
    }
    // Reject any path separators so the original name cannot escape the upload directory.
    if file_name.contains('/') || file_name.contains('\\') {
        return Err(AppError::InvalidUpload);
    }
    Ok(())
}

fn has_image_signature(data: &[u8], ext: &str) -> bool {
    match ext {
        "png" => data.starts_with(&[0x89, 0x50, 0x4E, 0x47]),
        "jpg" | "jpeg" => data.starts_with(&[0xFF, 0xD8, 0xFF]),
        "gif" => data.starts_with(b"GIF87a") || data.starts_with(b"GIF89a"),
        "webp" => {
            data.len() >= 12 && &data[0..4] == b"RIFF" && &data[8..12] == b"WEBP"
        }
        _ => false,
    }
}
