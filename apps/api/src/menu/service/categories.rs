use uuid::Uuid;

use crate::auth::middleware::CurrentUser;
use crate::error::AppError;
use crate::menu::models::{Category, CreateCategoryRequest, UpdateCategoryRequest};
use crate::menu::repository::categories as repo;
use crate::menu::service::helpers::ensure_project_owner;
use crate::state::AppState;

pub async fn create(
    state: &AppState,
    user: &CurrentUser,
    project_id: Uuid,
    req: CreateCategoryRequest,
) -> Result<Category, AppError> {
    ensure_project_owner(state, user, project_id).await?;
    repo::create(&state.db, project_id, &req).await
}

pub async fn update(
    state: &AppState,
    user: &CurrentUser,
    id: Uuid,
    req: UpdateCategoryRequest,
) -> Result<Category, AppError> {
    let project_id = repo::project_id(&state.db, id)
        .await?
        .ok_or(AppError::CategoryNotFound)?;
    ensure_project_owner(state, user, project_id).await?;
    repo::update(&state.db, id, &req).await
}

pub async fn delete(state: &AppState, user: &CurrentUser, id: Uuid) -> Result<(), AppError> {
    let project_id = repo::project_id(&state.db, id)
        .await?
        .ok_or(AppError::CategoryNotFound)?;
    ensure_project_owner(state, user, project_id).await?;
    repo::delete(&state.db, id).await
}
