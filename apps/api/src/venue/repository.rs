use bigdecimal::BigDecimal;
use chrono::{DateTime, Utc};
use sqlx::types::Json;
use sqlx::{query, query_as, Executor, PgPool};
use uuid::Uuid;

use crate::error::AppError;
use crate::venue::models::{CartAddon, CartItem};

#[derive(Debug, sqlx::FromRow)]
pub struct CartSessionRow {
    pub id: Uuid,
    pub table_id: Uuid,
    pub token: String,
    pub items: Json<Vec<CartItem>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, sqlx::FromRow)]
pub struct OrderRow {
    pub id: Uuid,
    pub cart_session_id: Option<Uuid>,
    pub table_id: Uuid,
    pub project_id: Uuid,
    pub status: String,
    pub total: BigDecimal,
    pub estimated_minutes: Option<i32>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, sqlx::FromRow)]
pub struct OrderItemRow {
    pub id: Uuid,
    pub order_id: Uuid,
    pub menu_item_id: Uuid,
    pub name: String,
    pub base_price: BigDecimal,
    pub addons: Json<Vec<CartAddon>>,
    pub quantity: i32,
    pub note: Option<String>,
}

#[derive(Debug, sqlx::FromRow)]
pub struct OrderAdminRow {
    pub id: Uuid,
    pub table_id: Uuid,
    pub table_label: String,
    pub status: String,
    pub total: BigDecimal,
    pub estimated_minutes: Option<i32>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

pub async fn get_cart_session_by_table(
    pool: &PgPool,
    table_id: Uuid,
) -> Result<Option<CartSessionRow>, AppError> {
    query_as::<_, CartSessionRow>(
        "SELECT id, table_id, token, items, created_at, updated_at
         FROM cart_sessions
         WHERE table_id = $1",
    )
    .bind(table_id)
    .fetch_optional(pool)
    .await
    .map_err(AppError::from)
}

pub async fn get_or_create_cart_session(
    pool: &PgPool,
    table_id: Uuid,
) -> Result<CartSessionRow, AppError> {
    let token = Uuid::new_v4().to_string();
    query_as::<_, CartSessionRow>(
        "INSERT INTO cart_sessions (table_id, token, items)
         VALUES ($1, $2, '[]')
         ON CONFLICT (table_id) DO UPDATE SET updated_at = now()
         RETURNING id, table_id, token, items, created_at, updated_at",
    )
    .bind(table_id)
    .bind(&token)
    .fetch_one(pool)
    .await
    .map_err(AppError::from)
}

pub async fn update_cart_items<'e, E>(
    executor: E,
    session_id: Uuid,
    items: &[CartItem],
) -> Result<(), AppError>
where
    E: Executor<'e, Database = sqlx::Postgres>,
{
    let value = serde_json::to_value(items).map_err(|e| AppError::Internal(e.into()))?;

    query("UPDATE cart_sessions SET items = $2, updated_at = now() WHERE id = $1")
        .bind(session_id)
        .bind(value)
        .execute(executor)
        .await?;

    Ok(())
}

pub async fn lock_cart_session<'e, E>(
    executor: E,
    session_id: Uuid,
) -> Result<Option<CartSessionRow>, AppError>
where
    E: Executor<'e, Database = sqlx::Postgres>,
{
    query_as::<_, CartSessionRow>(
        "SELECT id, table_id, token, items, created_at, updated_at
         FROM cart_sessions
         WHERE id = $1
         FOR UPDATE",
    )
    .bind(session_id)
    .fetch_optional(executor)
    .await
    .map_err(AppError::from)
}

pub async fn get_item_modifier_options(
    pool: &PgPool,
    item_id: Uuid,
) -> Result<Vec<crate::menu::models::ModifierOption>, AppError> {
    let groups = query_as::<_, crate::menu::models::ModifierGroup>(
        "SELECT id, menu_item_id, name, required, min_select, max_select, sort_order
         FROM modifier_groups
         WHERE menu_item_id = $1
         ORDER BY sort_order, name",
    )
    .bind(item_id)
    .fetch_all(pool)
    .await?;

    if groups.is_empty() {
        return Ok(Vec::new());
    }

    let group_ids: Vec<Uuid> = groups.iter().map(|g| g.id).collect();
    query_as::<_, crate::menu::models::ModifierOption>(
        "SELECT id, modifier_group_id, name, price, sort_order
         FROM modifier_options
         WHERE modifier_group_id = ANY($1)
         ORDER BY sort_order, name",
    )
    .bind(&group_ids)
    .fetch_all(pool)
    .await
    .map_err(AppError::from)
}

pub async fn get_item_modifier_groups(
    pool: &PgPool,
    item_id: Uuid,
) -> Result<Vec<crate::menu::models::ModifierGroup>, AppError> {
    query_as::<_, crate::menu::models::ModifierGroup>(
        "SELECT id, menu_item_id, name, required, min_select, max_select, sort_order
         FROM modifier_groups
         WHERE menu_item_id = $1
         ORDER BY sort_order, name",
    )
    .bind(item_id)
    .fetch_all(pool)
    .await
    .map_err(AppError::from)
}

pub async fn create_order<'e, E>(
    executor: E,
    cart_session_id: Uuid,
    table_id: Uuid,
    project_id: Uuid,
    total: &BigDecimal,
) -> Result<OrderRow, AppError>
where
    E: Executor<'e, Database = sqlx::Postgres>,
{
    query_as::<_, OrderRow>(
        "INSERT INTO orders (cart_session_id, table_id, project_id, total)
         VALUES ($1, $2, $3, $4)
         RETURNING id, cart_session_id, table_id, project_id, status, total, estimated_minutes, created_at, updated_at",
    )
    .bind(cart_session_id)
    .bind(table_id)
    .bind(project_id)
    .bind(total)
    .fetch_one(executor)
    .await
    .map_err(AppError::from)
}

pub async fn create_order_item<'e, E>(
    executor: E,
    order_id: Uuid,
    item: &CartItem,
) -> Result<(), AppError>
where
    E: Executor<'e, Database = sqlx::Postgres>,
{
    let addons_json =
        serde_json::to_value(&item.addons).map_err(|e| AppError::Internal(e.into()))?;

    query(
        "INSERT INTO order_items (order_id, menu_item_id, name, base_price, addons, quantity, note)
         VALUES ($1, $2, $3, $4, $5, $6, $7)",
    )
    .bind(order_id)
    .bind(item.menu_item_id)
    .bind(&item.name)
    .bind(&item.base_price)
    .bind(addons_json)
    .bind(item.quantity)
    .bind(item.note.as_deref())
    .execute(executor)
    .await?;

    Ok(())
}

pub async fn get_order_with_items(
    pool: &PgPool,
    order_id: Uuid,
) -> Result<Option<(OrderRow, Vec<OrderItemRow>)>, AppError> {
    let order = query_as::<_, OrderRow>(
        "SELECT o.id, o.cart_session_id, o.table_id, o.project_id, o.status, o.total, o.estimated_minutes, o.created_at, o.updated_at
         FROM orders o
         JOIN tables t ON t.id = o.table_id
         JOIN projects p ON p.id = o.project_id
         WHERE o.id = $1
           AND t.active = true
           AND p.status = 'published'",
    )
    .bind(order_id)
    .fetch_optional(pool)
    .await?;

    let Some(order) = order else {
        return Ok(None);
    };

    let items = query_as::<_, OrderItemRow>(
        "SELECT id, order_id, menu_item_id, name, base_price, addons, quantity, note
         FROM order_items
         WHERE order_id = $1
         ORDER BY id",
    )
    .bind(order_id)
    .fetch_all(pool)
    .await?;

    Ok(Some((order, items)))
}

pub async fn list_orders_by_project(
    pool: &PgPool,
    project_id: Uuid,
    status_filter: Option<&str>,
) -> Result<Vec<(OrderAdminRow, Vec<OrderItemRow>)>, AppError> {
    let orders = query_as::<_, OrderAdminRow>(
        "SELECT o.id,
                o.table_id,
                t.label AS table_label,
                o.status,
                o.total,
                o.estimated_minutes,
                o.created_at,
                o.updated_at
         FROM orders o
         JOIN tables t ON t.id = o.table_id
         WHERE o.project_id = $1
           AND ($2::text IS NULL OR o.status = $2)
         ORDER BY o.created_at DESC",
    )
    .bind(project_id)
    .bind(status_filter)
    .fetch_all(pool)
    .await?;

    if orders.is_empty() {
        return Ok(Vec::new());
    }

    let order_ids: Vec<Uuid> = orders.iter().map(|o| o.id).collect();
    let items = query_as::<_, OrderItemRow>(
        "SELECT id, order_id, menu_item_id, name, base_price, addons, quantity, note
         FROM order_items
         WHERE order_id = ANY($1)
         ORDER BY id",
    )
    .bind(&order_ids)
    .fetch_all(pool)
    .await?;

    let mut items_by_order: std::collections::HashMap<Uuid, Vec<OrderItemRow>> =
        items.into_iter().fold(std::collections::HashMap::new(), |mut acc, item| {
            acc.entry(item.order_id).or_default().push(item);
            acc
        });

    Ok(orders
        .into_iter()
        .map(|order| {
            let order_items = items_by_order.remove(&order.id).unwrap_or_default();
            (order, order_items)
        })
        .collect())
}

pub async fn get_order_by_id_for_project(
    pool: &PgPool,
    project_id: Uuid,
    order_id: Uuid,
) -> Result<Option<(OrderAdminRow, Vec<OrderItemRow>)>, AppError> {
    let order = query_as::<_, OrderAdminRow>(
        "SELECT o.id,
                o.table_id,
                t.label AS table_label,
                o.status,
                o.total,
                o.estimated_minutes,
                o.created_at,
                o.updated_at
         FROM orders o
         JOIN tables t ON t.id = o.table_id
         WHERE o.id = $1
           AND o.project_id = $2",
    )
    .bind(order_id)
    .bind(project_id)
    .fetch_optional(pool)
    .await?;

    let Some(order) = order else {
        return Ok(None);
    };

    let items = query_as::<_, OrderItemRow>(
        "SELECT id, order_id, menu_item_id, name, base_price, addons, quantity, note
         FROM order_items
         WHERE order_id = $1
         ORDER BY id",
    )
    .bind(order_id)
    .fetch_all(pool)
    .await?;

    Ok(Some((order, items)))
}

pub async fn update_order_status<'e, E>(
    executor: E,
    order_id: Uuid,
    status: &str,
) -> Result<(), AppError>
where
    E: Executor<'e, Database = sqlx::Postgres>,
{
    query("UPDATE orders SET status = $2, updated_at = now() WHERE id = $1")
        .bind(order_id)
        .bind(status)
        .execute(executor)
        .await?;

    Ok(())
}

#[derive(Debug, sqlx::FromRow)]
pub struct ServiceRequestAdminRow {
    pub id: Uuid,
    pub table_id: Uuid,
    pub table_label: String,
    pub r#type: String,
    pub status: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

pub async fn list_service_requests_by_project(
    pool: &PgPool,
    project_id: Uuid,
    status_filter: Option<&str>,
) -> Result<Vec<ServiceRequestAdminRow>, AppError> {
    query_as::<_, ServiceRequestAdminRow>(
        "SELECT sr.id,
                sr.table_id,
                t.label AS table_label,
                sr.type,
                sr.status,
                sr.created_at,
                sr.updated_at
         FROM service_requests sr
         JOIN tables t ON t.id = sr.table_id
         WHERE t.project_id = $1
           AND ($2::text IS NULL OR sr.status = $2)
         ORDER BY sr.created_at DESC",
    )
    .bind(project_id)
    .bind(status_filter)
    .fetch_all(pool)
    .await
    .map_err(AppError::from)
}

pub async fn get_service_request_by_id_for_project(
    pool: &PgPool,
    project_id: Uuid,
    request_id: Uuid,
) -> Result<Option<ServiceRequestAdminRow>, AppError> {
    query_as::<_, ServiceRequestAdminRow>(
        "SELECT sr.id,
                sr.table_id,
                t.label AS table_label,
                sr.type,
                sr.status,
                sr.created_at,
                sr.updated_at
         FROM service_requests sr
         JOIN tables t ON t.id = sr.table_id
         WHERE sr.id = $1
           AND t.project_id = $2",
    )
    .bind(request_id)
    .bind(project_id)
    .fetch_optional(pool)
    .await
    .map_err(AppError::from)
}

pub async fn update_service_request_status<'e, E>(
    executor: E,
    request_id: Uuid,
    status: &str,
) -> Result<(), AppError>
where
    E: Executor<'e, Database = sqlx::Postgres>,
{
    query("UPDATE service_requests SET status = $2, updated_at = now() WHERE id = $1")
        .bind(request_id)
        .bind(status)
        .execute(executor)
        .await?;

    Ok(())
}

pub async fn create_service_request(
    pool: &PgPool,
    table_id: Uuid,
    request_type: &str,
) -> Result<Uuid, AppError> {
    let row = query_as::<_, (Uuid,)>(
        "INSERT INTO service_requests (table_id, type)
         VALUES ($1, $2)
         RETURNING id",
    )
    .bind(table_id)
    .bind(request_type)
    .fetch_one(pool)
    .await?;

    Ok(row.0)
}
