use uuid::Uuid;

use crate::auth::middleware::CurrentUser;
use crate::error::AppError;
use crate::menu::models::{Allergen, CreateAllergenRequest, CreateTagRequest, Tag};
use crate::menu::repository::allergens_tags as repo;
use crate::menu::service::helpers::ensure_project_owner;
use crate::state::AppState;

pub async fn list_allergens(
    state: &AppState,
    user: &CurrentUser,
    project_id: Uuid,
) -> Result<Vec<Allergen>, AppError> {
    ensure_project_owner(state, user, project_id).await?;
    repo::list_allergens(&state.db, project_id).await
}

pub async fn create_allergen(
    state: &AppState,
    user: &CurrentUser,
    project_id: Uuid,
    req: CreateAllergenRequest,
) -> Result<Allergen, AppError> {
    ensure_project_owner(state, user, project_id).await?;
    repo::create_allergen(&state.db, project_id, &req).await
}

pub async fn list_tags(
    state: &AppState,
    user: &CurrentUser,
    project_id: Uuid,
) -> Result<Vec<Tag>, AppError> {
    ensure_project_owner(state, user, project_id).await?;
    repo::list_tags(&state.db, project_id).await
}

pub async fn create_tag(
    state: &AppState,
    user: &CurrentUser,
    project_id: Uuid,
    req: CreateTagRequest,
) -> Result<Tag, AppError> {
    ensure_project_owner(state, user, project_id).await?;
    repo::create_tag(&state.db, project_id, &req).await
}
