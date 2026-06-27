use uuid::Uuid;

use crate::auth::middleware::CurrentUser;
use crate::error::AppError;
use crate::projects::models::Project;
use crate::projects::repository as projects_repository;
use crate::state::AppState;
use crate::venue::models::{OrderDetailResponse, OrderItemResponse, OrderListItemResponse};
use crate::venue::repository::{self, OrderAdminRow, OrderItemRow};

const VALID_ORDER_STATUSES: &[&str] = &["submitted", "preparing", "ready", "served", "cancelled"];

pub async fn list_project_orders(
    state: &AppState,
    current_user: &CurrentUser,
    project_id: Uuid,
    status_filter: Option<&str>,
) -> Result<Vec<OrderListItemResponse>, AppError> {
    load_owned_project(&state.db, project_id, current_user).await?;

    let rows = repository::list_orders_by_project(&state.db, project_id, status_filter).await?;
    Ok(rows.into_iter().map(|(order, items)| map_list_item(order, items)).collect())
}

pub async fn get_order_detail(
    state: &AppState,
    current_user: &CurrentUser,
    project_id: Uuid,
    order_id: Uuid,
) -> Result<OrderDetailResponse, AppError> {
    load_owned_project(&state.db, project_id, current_user).await?;

    let (order, items) = repository::get_order_by_id_for_project(&state.db, project_id, order_id)
        .await?
        .ok_or(AppError::OrderNotFound)?;

    Ok(map_detail(order, items))
}

pub async fn update_order_status(
    state: &AppState,
    current_user: &CurrentUser,
    project_id: Uuid,
    order_id: Uuid,
    new_status: String,
) -> Result<OrderDetailResponse, AppError> {
    load_owned_project(&state.db, project_id, current_user).await?;

    let (order, _items) = repository::get_order_by_id_for_project(&state.db, project_id, order_id)
        .await?
        .ok_or(AppError::OrderNotFound)?;

    if !VALID_ORDER_STATUSES.contains(&new_status.as_str())
        || !is_valid_transition(&order.status, &new_status)
    {
        return Err(AppError::InvalidOrderStatusTransition);
    }

    repository::update_order_status(&state.db, order_id, &new_status).await?;

    get_order_detail(state, current_user, project_id, order_id).await
}

async fn load_owned_project(
    pool: &sqlx::PgPool,
    project_id: Uuid,
    current_user: &CurrentUser,
) -> Result<Project, AppError> {
    let project = projects_repository::get_project(pool, project_id)
        .await?
        .ok_or(AppError::ProjectNotFound)?;

    if project.owner_id != current_user.id {
        return Err(AppError::Forbidden);
    }

    Ok(project)
}

fn is_valid_transition(from: &str, to: &str) -> bool {
    matches!(
        (from, to),
        ("submitted", "preparing")
            | ("submitted", "cancelled")
            | ("preparing", "ready")
            | ("preparing", "cancelled")
            | ("ready", "served")
            | ("ready", "cancelled")
    )
}

fn map_list_item(order: OrderAdminRow, items: Vec<OrderItemRow>) -> OrderListItemResponse {
    OrderListItemResponse {
        id: order.id,
        table_id: order.table_id,
        table_label: order.table_label,
        status: order.status,
        total: order.total,
        item_count: items.len() as i32,
        items: items.into_iter().map(map_item).collect(),
        created_at: order.created_at,
        updated_at: order.updated_at,
    }
}

fn map_detail(order: OrderAdminRow, items: Vec<OrderItemRow>) -> OrderDetailResponse {
    OrderDetailResponse {
        id: order.id,
        table_id: order.table_id,
        table_label: order.table_label,
        status: order.status,
        total: order.total,
        item_count: items.len() as i32,
        items: items.into_iter().map(map_item).collect(),
        estimated_minutes: order.estimated_minutes,
        created_at: order.created_at,
        updated_at: order.updated_at,
    }
}

fn map_item(row: OrderItemRow) -> OrderItemResponse {
    OrderItemResponse {
        id: row.id,
        menu_item_id: row.menu_item_id,
        name: row.name,
        base_price: row.base_price,
        addons: row.addons.0,
        quantity: row.quantity,
        note: row.note,
    }
}
