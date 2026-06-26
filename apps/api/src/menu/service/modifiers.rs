use uuid::Uuid;

use crate::auth::middleware::CurrentUser;
use crate::error::AppError;
use crate::menu::models::{
    CreateModifierGroupRequest, CreateModifierOptionRequest, ModifierGroup, ModifierOption,
    UpdateModifierGroupRequest, UpdateModifierOptionRequest,
};
use crate::menu::repository::{items, modifiers as repo};
use crate::menu::service::helpers::{ensure_project_owner, validate_price, validate_selection};
use crate::state::AppState;

pub async fn create_group(
    state: &AppState,
    user: &CurrentUser,
    menu_item_id: Uuid,
    req: CreateModifierGroupRequest,
) -> Result<ModifierGroup, AppError> {
    let project_id = items::project_id(&state.db, menu_item_id)
        .await?
        .ok_or(AppError::MenuItemNotFound)?;
    ensure_project_owner(state, user, project_id).await?;
    validate_selection(req.min_select, req.max_select)?;

    repo::create_group(&state.db, menu_item_id, &req).await
}

pub async fn update_group(
    state: &AppState,
    user: &CurrentUser,
    id: Uuid,
    req: UpdateModifierGroupRequest,
) -> Result<ModifierGroup, AppError> {
    let project_id = repo::group_project_id(&state.db, id)
        .await?
        .ok_or(AppError::ModifierGroupNotFound)?;
    ensure_project_owner(state, user, project_id).await?;

    let min = req.min_select.unwrap_or(0);
    let max = req.max_select.unwrap_or(min.max(1));
    if req.min_select.is_some() || req.max_select.is_some() {
        validate_selection(min, max)?;
    }

    repo::update_group(&state.db, id, &req).await
}

pub async fn delete_group(state: &AppState, user: &CurrentUser, id: Uuid) -> Result<(), AppError> {
    let project_id = repo::group_project_id(&state.db, id)
        .await?
        .ok_or(AppError::ModifierGroupNotFound)?;
    ensure_project_owner(state, user, project_id).await?;
    repo::delete_group(&state.db, id).await
}

pub async fn create_option(
    state: &AppState,
    user: &CurrentUser,
    modifier_group_id: Uuid,
    req: CreateModifierOptionRequest,
) -> Result<ModifierOption, AppError> {
    let project_id = repo::group_project_id(&state.db, modifier_group_id)
        .await?
        .ok_or(AppError::ModifierGroupNotFound)?;
    ensure_project_owner(state, user, project_id).await?;
    validate_price(&req.price)?;

    repo::create_option(&state.db, modifier_group_id, &req).await
}

pub async fn update_option(
    state: &AppState,
    user: &CurrentUser,
    id: Uuid,
    req: UpdateModifierOptionRequest,
) -> Result<ModifierOption, AppError> {
    let project_id = repo::option_project_id(&state.db, id)
        .await?
        .ok_or(AppError::ModifierOptionNotFound)?;
    ensure_project_owner(state, user, project_id).await?;

    if let Some(price) = &req.price {
        validate_price(price)?;
    }

    repo::update_option(&state.db, id, &req).await
}

pub async fn delete_option(state: &AppState, user: &CurrentUser, id: Uuid) -> Result<(), AppError> {
    let project_id = repo::option_project_id(&state.db, id)
        .await?
        .ok_or(AppError::ModifierOptionNotFound)?;
    ensure_project_owner(state, user, project_id).await?;
    repo::delete_option(&state.db, id).await
}
