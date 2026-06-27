use axum::{
    extract::{Path, State},
    http::StatusCode,
    routing::{get, patch, post},
    Json, Router,
};

use crate::error::AppError;
use crate::state::AppState;
use crate::venue::models::{
    AddToCartRequest, CartSessionResponse, OrderResponse, PlaceOrderResponse, PublicMenuResponse,
    PublicProjectResponse, PublicTableResponse, ServiceRequestRequest,
};
use crate::venue::service;

#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateCartItemRequest {
    pub quantity: i32,
}

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/public/projects/{slug}", get(get_public_project))
        .route("/public/projects/{slug}/menu", get(get_public_menu))
        .route("/public/tables/{token}", get(get_public_table))
        .route("/public/tables/{token}/cart", get(get_cart))
        .route("/public/tables/{token}/cart/items", post(add_to_cart))
        .route(
            "/public/tables/{token}/cart/items/{cart_item_id}",
            patch(update_cart_item).delete(remove_cart_item),
        )
        .route("/public/tables/{token}/orders", post(place_order))
        .route("/public/orders/{order_token}", get(get_order))
        .route(
            "/public/tables/{token}/service-requests",
            post(create_service_request),
        )
}

async fn get_public_project(
    State(state): State<AppState>,
    Path(slug): Path<String>,
) -> Result<Json<PublicProjectResponse>, AppError> {
    Ok(Json(
        service::get_public_project_by_slug(&state, &slug).await?,
    ))
}

async fn get_public_menu(
    State(state): State<AppState>,
    Path(slug): Path<String>,
) -> Result<Json<PublicMenuResponse>, AppError> {
    Ok(Json(service::get_public_menu_by_slug(&state, &slug).await?))
}

async fn get_public_table(
    State(state): State<AppState>,
    Path(token): Path<String>,
) -> Result<Json<PublicTableResponse>, AppError> {
    Ok(Json(service::get_public_table(&state, &token).await?))
}

async fn get_cart(
    State(state): State<AppState>,
    Path(token): Path<String>,
) -> Result<Json<CartSessionResponse>, AppError> {
    Ok(Json(
        service::get_or_create_cart_session(&state, &token).await?,
    ))
}

async fn add_to_cart(
    State(state): State<AppState>,
    Path(token): Path<String>,
    Json(req): Json<AddToCartRequest>,
) -> Result<(StatusCode, Json<CartSessionResponse>), AppError> {
    let session = service::add_to_cart(&state, &token, req).await?;
    Ok((StatusCode::CREATED, Json(session)))
}

async fn update_cart_item(
    State(state): State<AppState>,
    Path((token, cart_item_id)): Path<(String, String)>,
    Json(req): Json<UpdateCartItemRequest>,
) -> Result<Json<CartSessionResponse>, AppError> {
    Ok(Json(
        service::update_cart_item_quantity(&state, &token, &cart_item_id, req.quantity).await?,
    ))
}

async fn remove_cart_item(
    State(state): State<AppState>,
    Path((token, cart_item_id)): Path<(String, String)>,
) -> Result<Json<CartSessionResponse>, AppError> {
    Ok(Json(
        service::remove_from_cart(&state, &token, &cart_item_id).await?,
    ))
}

async fn place_order(
    State(state): State<AppState>,
    Path(token): Path<String>,
) -> Result<(StatusCode, Json<PlaceOrderResponse>), AppError> {
    let order = service::place_order(&state, &token).await?;
    Ok((StatusCode::CREATED, Json(order)))
}

async fn get_order(
    State(state): State<AppState>,
    Path(order_token): Path<String>,
) -> Result<Json<OrderResponse>, AppError> {
    Ok(Json(service::get_order(&state, &order_token).await?))
}

async fn create_service_request(
    State(state): State<AppState>,
    Path(token): Path<String>,
    Json(req): Json<ServiceRequestRequest>,
) -> Result<(StatusCode, Json<serde_json::Value>), AppError> {
    let body = service::create_service_request(&state, &token, req).await?;
    Ok((StatusCode::CREATED, Json(body)))
}
