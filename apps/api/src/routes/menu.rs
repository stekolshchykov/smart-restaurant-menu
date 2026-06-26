use axum::{
    extract::{Path, State},
    http::StatusCode,
    routing::{get, patch, post},
    Json, Router,
};
use uuid::Uuid;

use crate::auth::middleware::CurrentUser;
use crate::error::AppError;
use crate::menu::models::{
    CreateAllergenRequest, CreateCategoryRequest, CreateMenuItemRequest,
    CreateModifierGroupRequest, CreateModifierOptionRequest, CreateTagRequest, MenuTreeResponse,
    UpdateCategoryRequest, UpdateMenuItemRequest, UpdateModifierGroupRequest,
    UpdateModifierOptionRequest,
};
use crate::menu::service;
use crate::state::AppState;

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/projects/{id}/menu", get(get_menu_tree))
        .route("/projects/{id}/categories", post(create_category))
        .route(
            "/projects/{id}/allergens",
            get(list_allergens).post(create_allergen),
        )
        .route("/projects/{id}/tags", get(list_tags).post(create_tag))
        .route(
            "/categories/{id}",
            patch(update_category).delete(delete_category),
        )
        .route("/categories/{id}/items", post(create_menu_item))
        .route(
            "/items/{id}",
            get(get_menu_item)
                .patch(update_menu_item)
                .delete(delete_menu_item),
        )
        .route("/items/{id}/modifier-groups", post(create_modifier_group))
        .route(
            "/modifier-groups/{id}",
            patch(update_modifier_group).delete(delete_modifier_group),
        )
        .route(
            "/modifier-groups/{id}/options",
            post(create_modifier_option),
        )
        .route(
            "/modifier-options/{id}",
            patch(update_modifier_option).delete(delete_modifier_option),
        )
}

async fn get_menu_tree(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(id): Path<Uuid>,
) -> Result<Json<MenuTreeResponse>, AppError> {
    Ok(Json(service::get_menu_tree(&state, &user, id).await?))
}

async fn create_category(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(id): Path<Uuid>,
    Json(req): Json<CreateCategoryRequest>,
) -> Result<(StatusCode, Json<crate::menu::models::Category>), AppError> {
    let category = service::create_category(&state, &user, id, req).await?;
    Ok((StatusCode::CREATED, Json(category)))
}

async fn update_category(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(id): Path<Uuid>,
    Json(req): Json<UpdateCategoryRequest>,
) -> Result<Json<crate::menu::models::Category>, AppError> {
    Ok(Json(
        service::update_category(&state, &user, id, req).await?,
    ))
}

async fn delete_category(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(id): Path<Uuid>,
) -> Result<StatusCode, AppError> {
    service::delete_category(&state, &user, id).await?;
    Ok(StatusCode::NO_CONTENT)
}

async fn create_menu_item(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(id): Path<Uuid>,
    Json(req): Json<CreateMenuItemRequest>,
) -> Result<(StatusCode, Json<crate::menu::models::MenuItemResponse>), AppError> {
    let item = service::create_menu_item(&state, &user, id, req).await?;
    Ok((StatusCode::CREATED, Json(item)))
}

async fn get_menu_item(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(id): Path<Uuid>,
) -> Result<Json<crate::menu::models::MenuItemResponse>, AppError> {
    Ok(Json(service::get_menu_item(&state, &user, id).await?))
}

async fn update_menu_item(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(id): Path<Uuid>,
    Json(req): Json<UpdateMenuItemRequest>,
) -> Result<Json<crate::menu::models::MenuItemResponse>, AppError> {
    Ok(Json(
        service::update_menu_item(&state, &user, id, req).await?,
    ))
}

async fn delete_menu_item(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(id): Path<Uuid>,
) -> Result<StatusCode, AppError> {
    service::delete_menu_item(&state, &user, id).await?;
    Ok(StatusCode::NO_CONTENT)
}

async fn create_modifier_group(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(id): Path<Uuid>,
    Json(req): Json<CreateModifierGroupRequest>,
) -> Result<(StatusCode, Json<crate::menu::models::ModifierGroup>), AppError> {
    let group = service::create_modifier_group(&state, &user, id, req).await?;
    Ok((StatusCode::CREATED, Json(group)))
}

async fn update_modifier_group(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(id): Path<Uuid>,
    Json(req): Json<UpdateModifierGroupRequest>,
) -> Result<Json<crate::menu::models::ModifierGroup>, AppError> {
    Ok(Json(
        service::update_modifier_group(&state, &user, id, req).await?,
    ))
}

async fn delete_modifier_group(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(id): Path<Uuid>,
) -> Result<StatusCode, AppError> {
    service::delete_modifier_group(&state, &user, id).await?;
    Ok(StatusCode::NO_CONTENT)
}

async fn create_modifier_option(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(id): Path<Uuid>,
    Json(req): Json<CreateModifierOptionRequest>,
) -> Result<(StatusCode, Json<crate::menu::models::ModifierOption>), AppError> {
    let option = service::create_modifier_option(&state, &user, id, req).await?;
    Ok((StatusCode::CREATED, Json(option)))
}

async fn update_modifier_option(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(id): Path<Uuid>,
    Json(req): Json<UpdateModifierOptionRequest>,
) -> Result<Json<crate::menu::models::ModifierOption>, AppError> {
    Ok(Json(
        service::update_modifier_option(&state, &user, id, req).await?,
    ))
}

async fn delete_modifier_option(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(id): Path<Uuid>,
) -> Result<StatusCode, AppError> {
    service::delete_modifier_option(&state, &user, id).await?;
    Ok(StatusCode::NO_CONTENT)
}

async fn list_allergens(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(id): Path<Uuid>,
) -> Result<Json<Vec<crate::menu::models::Allergen>>, AppError> {
    Ok(Json(service::list_allergens(&state, &user, id).await?))
}

async fn create_allergen(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(id): Path<Uuid>,
    Json(req): Json<CreateAllergenRequest>,
) -> Result<(StatusCode, Json<crate::menu::models::Allergen>), AppError> {
    let allergen = service::create_allergen(&state, &user, id, req).await?;
    Ok((StatusCode::CREATED, Json(allergen)))
}

async fn list_tags(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(id): Path<Uuid>,
) -> Result<Json<Vec<crate::menu::models::Tag>>, AppError> {
    Ok(Json(service::list_tags(&state, &user, id).await?))
}

async fn create_tag(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(id): Path<Uuid>,
    Json(req): Json<CreateTagRequest>,
) -> Result<(StatusCode, Json<crate::menu::models::Tag>), AppError> {
    let tag = service::create_tag(&state, &user, id, req).await?;
    Ok((StatusCode::CREATED, Json(tag)))
}
