use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, FromRow, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Project {
    pub id: Uuid,
    pub owner_id: Uuid,
    pub name: String,
    pub slug: String,
    #[serde(rename = "type")]
    #[sqlx(rename = "type")]
    pub r#type: String,
    pub description: Option<String>,
    pub locale: String,
    pub currency: String,
    pub mode: String,
    pub status: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, FromRow, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectTheme {
    pub project_id: Uuid,
    pub appearance: String,
    pub accent_color: String,
    pub card_style: String,
    pub button_shape: String,
    #[serde(rename = "largePhotos")]
    #[sqlx(rename = "show_large_photos")]
    pub show_large_photos: bool,
    #[serde(rename = "promoPage")]
    #[sqlx(rename = "use_promo_page")]
    pub use_promo_page: bool,
    pub logo_url: Option<String>,
    pub hero_url: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateProjectRequest {
    pub name: String,
    pub slug: String,
    #[serde(rename = "type")]
    pub r#type: Option<String>,
    pub description: Option<String>,
    pub locale: Option<String>,
    pub currency: Option<String>,
    pub mode: Option<String>,
}

#[derive(Debug, Default, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateProjectRequest {
    pub name: Option<String>,
    pub slug: Option<String>,
    #[serde(rename = "type")]
    pub r#type: Option<String>,
    pub description: Option<String>,
    pub locale: Option<String>,
    pub currency: Option<String>,
    pub mode: Option<String>,
    pub status: Option<String>,
}

#[derive(Debug, Default, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateProjectThemeRequest {
    pub appearance: Option<String>,
    pub accent_color: Option<String>,
    pub card_style: Option<String>,
    pub button_shape: Option<String>,
    #[serde(rename = "largePhotos")]
    pub show_large_photos: Option<bool>,
    #[serde(rename = "promoPage")]
    pub use_promo_page: Option<bool>,
    pub logo_url: Option<String>,
    pub hero_url: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectResponse {
    pub id: Uuid,
    pub owner_id: Uuid,
    pub name: String,
    pub slug: String,
    #[serde(rename = "type")]
    pub r#type: String,
    pub description: Option<String>,
    pub locale: String,
    pub currency: String,
    pub mode: String,
    pub status: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub theme: ProjectThemeResponse,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectThemeResponse {
    pub project_id: Uuid,
    pub appearance: String,
    pub accent_color: String,
    pub card_style: String,
    pub button_shape: String,
    #[serde(rename = "largePhotos")]
    pub show_large_photos: bool,
    #[serde(rename = "promoPage")]
    pub use_promo_page: bool,
    pub logo_url: Option<String>,
    pub hero_url: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PublicationChecks {
    pub has_name: bool,
    pub has_menu: bool,
    pub has_tables: bool,
    pub theme_ready: bool,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PublicationChecklistItem {
    pub key: String,
    pub label: String,
    pub passed: bool,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PublicationStatusResponse {
    pub project_id: Uuid,
    pub slug: String,
    pub status: String,
    pub mode: String,
    pub ready: bool,
    pub checks: PublicationChecks,
    pub checklist: Vec<PublicationChecklistItem>,
}
