use bigdecimal::BigDecimal;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, FromRow, Serialize)]
pub struct Category {
    pub id: Uuid,
    pub project_id: Uuid,
    pub name: String,
    pub sort_order: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, FromRow, Serialize)]
pub struct MenuItem {
    pub id: Uuid,
    pub category_id: Uuid,
    pub name: String,
    pub short_description: Option<String>,
    pub description: Option<String>,
    pub price: BigDecimal,
    pub currency: String,
    pub image_url: Option<String>,
    pub images: Vec<String>,
    pub ingredients: Vec<String>,
    pub availability_status: String,
    pub quick_add_enabled: bool,
    pub sort_order: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, FromRow, Serialize)]
pub struct ModifierGroup {
    pub id: Uuid,
    pub menu_item_id: Uuid,
    pub name: String,
    pub required: bool,
    pub min_select: i32,
    pub max_select: i32,
    pub sort_order: i32,
}

#[derive(Debug, Clone, FromRow, Serialize)]
pub struct ModifierOption {
    pub id: Uuid,
    pub modifier_group_id: Uuid,
    pub name: String,
    pub price: BigDecimal,
    pub sort_order: i32,
}

#[derive(Debug, Clone, FromRow, Serialize)]
pub struct Allergen {
    pub id: Uuid,
    pub project_id: Uuid,
    pub name: String,
    pub code: Option<String>,
}

#[derive(Debug, Clone, FromRow, Serialize)]
pub struct Tag {
    pub id: Uuid,
    pub project_id: Uuid,
    pub name: String,
    pub code: Option<String>,
    pub kind: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateCategoryRequest {
    pub name: String,
    pub sort_order: i32,
}

#[derive(Debug, Deserialize)]
pub struct UpdateCategoryRequest {
    pub name: Option<String>,
    pub sort_order: Option<i32>,
}

#[derive(Debug, Deserialize)]
pub struct CreateMenuItemRequest {
    pub name: String,
    pub short_description: Option<String>,
    pub description: Option<String>,
    pub price: BigDecimal,
    pub image_url: Option<String>,
    pub images: Option<Vec<String>>,
    pub ingredients: Option<Vec<String>>,
    pub availability_status: Option<String>,
    pub quick_add_enabled: Option<bool>,
    pub sort_order: Option<i32>,
    pub allergen_ids: Option<Vec<Uuid>>,
    pub tag_ids: Option<Vec<Uuid>>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateMenuItemRequest {
    pub name: Option<String>,
    pub short_description: Option<String>,
    pub description: Option<String>,
    pub price: Option<BigDecimal>,
    pub image_url: Option<String>,
    pub images: Option<Vec<String>>,
    pub ingredients: Option<Vec<String>>,
    pub availability_status: Option<String>,
    pub quick_add_enabled: Option<bool>,
    pub sort_order: Option<i32>,
    pub allergen_ids: Option<Vec<Uuid>>,
    pub tag_ids: Option<Vec<Uuid>>,
}

#[derive(Debug, Deserialize)]
pub struct CreateModifierGroupRequest {
    pub name: String,
    pub required: bool,
    pub min_select: i32,
    pub max_select: i32,
    pub sort_order: i32,
}

#[derive(Debug, Deserialize)]
pub struct UpdateModifierGroupRequest {
    pub name: Option<String>,
    pub required: Option<bool>,
    pub min_select: Option<i32>,
    pub max_select: Option<i32>,
    pub sort_order: Option<i32>,
}

#[derive(Debug, Deserialize)]
pub struct CreateModifierOptionRequest {
    pub name: String,
    pub price: BigDecimal,
    pub sort_order: i32,
}

#[derive(Debug, Deserialize)]
pub struct UpdateModifierOptionRequest {
    pub name: Option<String>,
    pub price: Option<BigDecimal>,
    pub sort_order: Option<i32>,
}

#[derive(Debug, Deserialize)]
pub struct CreateAllergenRequest {
    pub name: String,
    pub code: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct CreateTagRequest {
    pub name: String,
    pub code: Option<String>,
    pub kind: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct MenuTreeResponse {
    pub categories: Vec<CategoryWithItems>,
}

#[derive(Debug, Serialize)]
pub struct CategoryWithItems {
    pub id: Uuid,
    pub name: String,
    pub sort_order: i32,
    pub items: Vec<MenuItemResponse>,
}

#[derive(Debug, Serialize)]
pub struct MenuItemResponse {
    pub id: Uuid,
    pub category_id: Uuid,
    pub name: String,
    pub short_description: Option<String>,
    pub description: Option<String>,
    pub price: BigDecimal,
    pub currency: String,
    pub image_url: Option<String>,
    pub images: Vec<String>,
    pub ingredients: Vec<String>,
    pub availability_status: String,
    pub quick_add_enabled: bool,
    pub sort_order: i32,
    pub allergens: Vec<Allergen>,
    pub tags: Vec<Tag>,
    pub modifier_groups: Vec<ModifierGroupResponse>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize)]
pub struct ModifierGroupResponse {
    pub id: Uuid,
    pub menu_item_id: Uuid,
    pub name: String,
    pub required: bool,
    pub min_select: i32,
    pub max_select: i32,
    pub sort_order: i32,
    pub options: Vec<ModifierOption>,
}
