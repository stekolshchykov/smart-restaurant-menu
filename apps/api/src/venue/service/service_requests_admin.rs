use chrono::Utc;
use uuid::Uuid;

use crate::auth::middleware::CurrentUser;
use crate::error::AppError;
use crate::projects::models::Project;
use crate::projects::repository as projects_repository;
use crate::state::AppState;
use crate::venue::models::{
    ServiceRequestDetailResponse, ServiceRequestListItemResponse,
};
use crate::venue::repository::{self, ServiceRequestAdminRow};

const VALID_SERVICE_REQUEST_STATUSES: &[&str] =
    &["pending", "in_progress", "completed", "cancelled"];

pub async fn list_project_service_requests(
    state: &AppState,
    current_user: &CurrentUser,
    project_id: Uuid,
    status_filter: Option<&str>,
) -> Result<Vec<ServiceRequestListItemResponse>, AppError> {
    load_owned_project(&state.db, project_id, current_user).await?;

    let rows = repository::list_service_requests_by_project(&state.db, project_id, status_filter)
        .await?;
    Ok(rows.into_iter().map(map_list_item).collect())
}

pub async fn update_service_request_status(
    state: &AppState,
    current_user: &CurrentUser,
    project_id: Uuid,
    request_id: Uuid,
    new_status: String,
) -> Result<ServiceRequestDetailResponse, AppError> {
    load_owned_project(&state.db, project_id, current_user).await?;

    let request = repository::get_service_request_by_id_for_project(&state.db, project_id, request_id)
        .await?
        .ok_or(AppError::ServiceRequestNotFound)?;

    if !VALID_SERVICE_REQUEST_STATUSES.contains(&new_status.as_str())
        || !is_valid_transition(&request.status, &new_status)
    {
        return Err(AppError::InvalidServiceRequestStatusTransition);
    }

    repository::update_service_request_status(&state.db, request_id, &new_status).await?;

    let request = repository::get_service_request_by_id_for_project(&state.db, project_id, request_id)
        .await?
        .ok_or(AppError::ServiceRequestNotFound)?;

    Ok(map_detail(request))
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
        ("pending", "in_progress")
            | ("pending", "cancelled")
            | ("in_progress", "completed")
            | ("in_progress", "cancelled")
    )
}

fn map_list_item(row: ServiceRequestAdminRow) -> ServiceRequestListItemResponse {
    ServiceRequestListItemResponse {
        id: row.id,
        table_id: row.table_id,
        table_label: row.table_label,
        r#type: row.r#type,
        status: row.status,
        created_at: row.created_at,
        updated_at: row.updated_at,
    }
}

fn map_detail(row: ServiceRequestAdminRow) -> ServiceRequestDetailResponse {
    let elapsed_seconds = Utc::now()
        .signed_duration_since(row.created_at)
        .num_seconds()
        .max(0);

    ServiceRequestDetailResponse {
        id: row.id,
        table_id: row.table_id,
        table_label: row.table_label,
        r#type: row.r#type,
        status: row.status,
        elapsed_seconds,
        created_at: row.created_at,
        updated_at: row.updated_at,
    }
}
