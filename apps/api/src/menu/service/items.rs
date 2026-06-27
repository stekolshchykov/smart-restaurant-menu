use uuid::Uuid;

use crate::auth::middleware::CurrentUser;
use crate::error::AppError;
use crate::menu::models::{CreateMenuItemRequest, MenuItemResponse, UpdateMenuItemRequest};
use crate::menu::repository::{categories, items as repo};
use crate::menu::service::helpers::{
    build_item_response, ensure_allergens_belong_to_project, ensure_project_owner,
    ensure_tags_belong_to_project, validate_description, validate_image_url, validate_images,
    validate_ingredients, validate_name, validate_price, validate_short_description,
};
use crate::projects::repository as project_repository;
use crate::state::AppState;

const VALID_AVAILABILITY_STATUSES: &[&str] = &["available", "unavailable", "hidden"];

pub async fn create(
    state: &AppState,
    user: &CurrentUser,
    category_id: Uuid,
    req: CreateMenuItemRequest,
) -> Result<MenuItemResponse, AppError> {
    let project_id = categories::project_id(&state.db, category_id)
        .await?
        .ok_or(AppError::CategoryNotFound)?;
    ensure_project_owner(state, user, project_id).await?;
    validate_menu_item_fields(&req)?;
    validate_price(&req.price)?;

    let project = project_repository::get_project(&state.db, project_id)
        .await?
        .ok_or(AppError::ProjectNotFound)?;

    if let Some(status) = req.availability_status.as_deref() {
        validate_availability_status(status)?;
    }
    if let Some(ids) = req.allergen_ids.as_deref() {
        ensure_allergens_belong_to_project(&state.db, project_id, ids).await?;
    }
    if let Some(ids) = req.tag_ids.as_deref() {
        ensure_tags_belong_to_project(&state.db, project_id, ids).await?;
    }

    let mut tx = state.db.begin().await?;
    let item = repo::create(&mut *tx, category_id, &project.currency, &req).await?;

    if let Some(ids) = req.allergen_ids.as_deref() {
        if !ids.is_empty() {
            repo::add_allergens(&mut *tx, item.id, ids).await?;
        }
    }
    if let Some(ids) = req.tag_ids.as_deref() {
        if !ids.is_empty() {
            repo::add_tags(&mut *tx, item.id, ids).await?;
        }
    }

    tx.commit().await?;
    build_item_response(&state.db, item).await
}

pub async fn get(
    state: &AppState,
    user: &CurrentUser,
    id: Uuid,
) -> Result<MenuItemResponse, AppError> {
    let project_id = repo::project_id(&state.db, id)
        .await?
        .ok_or(AppError::MenuItemNotFound)?;
    ensure_project_owner(state, user, project_id).await?;

    let item = repo::get(&state.db, id)
        .await?
        .ok_or(AppError::MenuItemNotFound)?;
    build_item_response(&state.db, item).await
}

pub async fn update(
    state: &AppState,
    user: &CurrentUser,
    id: Uuid,
    req: UpdateMenuItemRequest,
) -> Result<MenuItemResponse, AppError> {
    let project_id = repo::project_id(&state.db, id)
        .await?
        .ok_or(AppError::MenuItemNotFound)?;
    ensure_project_owner(state, user, project_id).await?;

    validate_update_menu_item_fields(&req)?;
    if let Some(price) = &req.price {
        validate_price(price)?;
    }
    if let Some(status) = req.availability_status.as_deref() {
        validate_availability_status(status)?;
    }
    if let Some(ids) = req.allergen_ids.as_deref() {
        ensure_allergens_belong_to_project(&state.db, project_id, ids).await?;
    }
    if let Some(ids) = req.tag_ids.as_deref() {
        ensure_tags_belong_to_project(&state.db, project_id, ids).await?;
    }

    let mut tx = state.db.begin().await?;
    let item = repo::update(&mut *tx, id, &req).await?;

    if req.allergen_ids.is_some() {
        repo::clear_allergens(&mut *tx, id).await?;
        if let Some(ids) = req.allergen_ids.as_deref() {
            if !ids.is_empty() {
                repo::add_allergens(&mut *tx, id, ids).await?;
            }
        }
    }

    if req.tag_ids.is_some() {
        repo::clear_tags(&mut *tx, id).await?;
        if let Some(ids) = req.tag_ids.as_deref() {
            if !ids.is_empty() {
                repo::add_tags(&mut *tx, id, ids).await?;
            }
        }
    }

    tx.commit().await?;
    build_item_response(&state.db, item).await
}

pub async fn delete(state: &AppState, user: &CurrentUser, id: Uuid) -> Result<(), AppError> {
    let project_id = repo::project_id(&state.db, id)
        .await?
        .ok_or(AppError::MenuItemNotFound)?;
    ensure_project_owner(state, user, project_id).await?;
    repo::delete(&state.db, id).await
}

fn validate_menu_item_fields(req: &CreateMenuItemRequest) -> Result<(), AppError> {
    validate_name(&req.name)?;
    validate_short_description(req.short_description.as_deref())?;
    validate_description(req.description.as_deref())?;
    validate_image_url(req.image_url.as_deref())?;
    validate_images(req.images.as_deref())?;
    validate_ingredients(req.ingredients.as_deref())?;
    Ok(())
}

fn validate_update_menu_item_fields(req: &UpdateMenuItemRequest) -> Result<(), AppError> {
    if let Some(name) = &req.name {
        validate_name(name)?;
    }
    validate_short_description(req.short_description.as_deref())?;
    validate_description(req.description.as_deref())?;
    validate_image_url(req.image_url.as_deref())?;
    validate_images(req.images.as_deref())?;
    validate_ingredients(req.ingredients.as_deref())?;
    Ok(())
}

fn validate_availability_status(status: &str) -> Result<(), AppError> {
    if VALID_AVAILABILITY_STATUSES.contains(&status) {
        Ok(())
    } else {
        Err(AppError::ValidationError(Default::default()))
    }
}
