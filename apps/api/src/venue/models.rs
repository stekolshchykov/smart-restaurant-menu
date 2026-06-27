use bigdecimal::BigDecimal;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::menu::models::MenuTreeResponse;
use crate::projects::models::ProjectThemeResponse;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PublicProjectResponse {
    pub id: Uuid,
    pub name: String,
    pub slug: String,
    #[serde(rename = "type")]
    pub r#type: String,
    pub description: Option<String>,
    pub locale: String,
    pub currency: String,
    pub mode: String,
    pub theme: ProjectThemeResponse,
    pub contact_info: Option<String>,
}

pub type PublicMenuResponse = MenuTreeResponse;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PublicTableResponse {
    pub table_id: Uuid,
    pub label: String,
    pub token: String,
    pub project: PublicProjectResponse,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CartAddon {
    pub id: Uuid,
    pub name: String,
    pub price: BigDecimal,
    pub quantity: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CartItem {
    pub id: String,
    pub menu_item_id: Uuid,
    pub name: String,
    pub base_price: BigDecimal,
    pub addons: Vec<CartAddon>,
    pub quantity: i32,
    pub note: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CartSessionResponse {
    pub token: String,
    pub table_id: Uuid,
    pub items: Vec<CartItem>,
    pub total: BigDecimal,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AddToCartRequest {
    pub menu_item_id: Uuid,
    pub quantity: i32,
    pub addon_ids: Vec<String>,
    pub note: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PlaceOrderResponse {
    pub order_id: Uuid,
    pub status: String,
    pub total: BigDecimal,
    pub estimated_minutes: Option<i32>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct OrderItemResponse {
    pub id: Uuid,
    pub menu_item_id: Uuid,
    pub name: String,
    pub base_price: BigDecimal,
    pub addons: Vec<CartAddon>,
    pub quantity: i32,
    pub note: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct OrderResponse {
    pub id: Uuid,
    pub status: String,
    pub total: BigDecimal,
    pub items: Vec<OrderItemResponse>,
    pub estimated_minutes: Option<i32>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ServiceRequestRequest {
    #[serde(rename = "type")]
    pub r#type: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateServiceRequestStatusRequest {
    pub status: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateOrderStatusRequest {
    pub status: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ServiceRequestListItemResponse {
    pub id: Uuid,
    pub table_id: Uuid,
    pub table_label: String,
    #[serde(rename = "type")]
    pub r#type: String,
    pub status: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ServiceRequestDetailResponse {
    pub id: Uuid,
    pub table_id: Uuid,
    pub table_label: String,
    #[serde(rename = "type")]
    pub r#type: String,
    pub status: String,
    pub elapsed_seconds: i64,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct OrderListItemResponse {
    pub id: Uuid,
    pub table_id: Uuid,
    pub table_label: String,
    pub status: String,
    pub total: BigDecimal,
    pub item_count: i32,
    pub items: Vec<OrderItemResponse>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct OrderDetailResponse {
    pub id: Uuid,
    pub table_id: Uuid,
    pub table_label: String,
    pub status: String,
    pub total: BigDecimal,
    pub item_count: i32,
    pub items: Vec<OrderItemResponse>,
    pub estimated_minutes: Option<i32>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}
