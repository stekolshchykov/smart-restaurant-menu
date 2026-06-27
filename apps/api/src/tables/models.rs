use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, FromRow, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Table {
    pub id: Uuid,
    pub project_id: Uuid,
    pub label: String,
    pub token: String,
    pub active: bool,
    pub sort_order: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateTableRequest {
    pub label: String,
    pub active: Option<bool>,
    pub sort_order: Option<i32>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateTableRequest {
    pub label: Option<String>,
    pub active: Option<bool>,
    pub sort_order: Option<i32>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BulkCreateRequest {
    pub prefix: Option<String>,
    pub start: i32,
    pub end: i32,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TableResponse {
    pub id: Uuid,
    pub project_id: Uuid,
    pub label: String,
    pub token: String,
    pub active: bool,
    pub sort_order: i32,
    pub public_url: String,
    pub qr_url: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

pub fn to_response(table: Table, web_origin: &str, api_origin: &str) -> TableResponse {
    TableResponse {
        id: table.id,
        project_id: table.project_id,
        label: table.label,
        token: table.token.clone(),
        active: table.active,
        sort_order: table.sort_order,
        public_url: format!("{}/table/{}", web_origin, table.token),
        qr_url: format!("{}/tables/{}/qr", api_origin, table.id),
        created_at: table.created_at,
        updated_at: table.updated_at,
    }
}
