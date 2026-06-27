use crate::error::AppError;
use crate::state::AppState;
use crate::venue::models::{OrderItemResponse, OrderResponse, PlaceOrderResponse};
use crate::venue::repository;

use super::cart::cart_total;
use super::project_table::accessible_table;
use uuid::Uuid;

pub async fn place_order(
    state: &AppState,
    table_token: &str,
) -> Result<PlaceOrderResponse, AppError> {
    let table = accessible_table(&state.db, table_token).await?;

    let mut tx = state.db.begin().await?;

    let session = repository::get_or_create_cart_session(&state.db, table.id).await?;

    let locked = repository::lock_cart_session(&mut *tx, session.id).await?;
    let Some(locked) = locked else {
        return Err(AppError::CartSessionNotFound);
    };

    let cart_items = locked.items.0;
    if cart_items.is_empty() {
        return Err(AppError::EmptyCart);
    }

    let total = cart_total(&cart_items);

    let order =
        repository::create_order(&mut *tx, session.id, table.id, table.project_id, &total).await?;

    for item in &cart_items {
        repository::create_order_item(&mut *tx, order.id, item).await?;
    }

    repository::update_cart_items(&mut *tx, session.id, &[]).await?;
    tx.commit().await?;

    Ok(PlaceOrderResponse {
        order_id: order.id,
        status: order.status,
        total: order.total,
        estimated_minutes: order.estimated_minutes,
    })
}

pub async fn get_order(state: &AppState, order_token: &str) -> Result<OrderResponse, AppError> {
    let order_id = Uuid::parse_str(order_token).map_err(|_| AppError::OrderNotFound)?;
    let (order, order_items) = repository::get_order_with_items(&state.db, order_id)
        .await?
        .ok_or(AppError::OrderNotFound)?;

    let items = order_items
        .into_iter()
        .map(|i| OrderItemResponse {
            id: i.id,
            menu_item_id: i.menu_item_id,
            name: i.name,
            base_price: i.base_price,
            addons: i.addons.0,
            quantity: i.quantity,
            note: i.note,
        })
        .collect();

    Ok(OrderResponse {
        id: order.id,
        status: order.status,
        total: order.total,
        items,
        estimated_minutes: order.estimated_minutes,
        created_at: order.created_at,
    })
}
