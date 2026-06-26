use axum::{
    extract::{Path, State},
    http::StatusCode,
    routing::{delete, get, patch, post},
    Json, Router,
};
use uuid::Uuid;

use crate::auth::middleware::CurrentUser;
use crate::error::AppError;
use crate::projects::models::{
    CreateProjectRequest, ProjectResponse, PublicationStatusResponse, UpdateProjectRequest,
    UpdateProjectThemeRequest,
};
use crate::projects::service;
use crate::state::AppState;

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/", get(list_projects))
        .route("/", post(create_project))
        .route("/{id}", get(get_project))
        .route("/{id}", patch(update_project))
        .route("/{id}", delete(delete_project))
        .route("/{id}/theme", patch(update_theme))
        .route("/{id}/publish", post(publish_project))
        .route("/{id}/unpublish", post(unpublish_project))
        .route("/{id}/publication-status", get(publication_status))
}

async fn list_projects(
    State(state): State<AppState>,
    user: CurrentUser,
) -> Result<Json<Vec<ProjectResponse>>, AppError> {
    Ok(Json(service::list_projects(&state, &user).await?))
}

async fn create_project(
    State(state): State<AppState>,
    user: CurrentUser,
    Json(req): Json<CreateProjectRequest>,
) -> Result<(StatusCode, Json<ProjectResponse>), AppError> {
    let project = service::create_project(&state, &user, req).await?;
    Ok((StatusCode::CREATED, Json(project)))
}

async fn get_project(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(id): Path<Uuid>,
) -> Result<Json<ProjectResponse>, AppError> {
    Ok(Json(service::get_project(&state, &user, id).await?))
}

async fn update_project(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(id): Path<Uuid>,
    Json(req): Json<UpdateProjectRequest>,
) -> Result<Json<ProjectResponse>, AppError> {
    Ok(Json(service::update_project(&state, &user, id, req).await?))
}

async fn delete_project(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(id): Path<Uuid>,
) -> Result<StatusCode, AppError> {
    service::delete_project(&state, &user, id).await?;
    Ok(StatusCode::NO_CONTENT)
}

async fn update_theme(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(id): Path<Uuid>,
    Json(req): Json<UpdateProjectThemeRequest>,
) -> Result<Json<ProjectResponse>, AppError> {
    Ok(Json(service::update_theme(&state, &user, id, req).await?))
}

async fn publish_project(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(id): Path<Uuid>,
) -> Result<Json<ProjectResponse>, AppError> {
    Ok(Json(
        service::publication::publish_project(&state, &user, id).await?,
    ))
}

async fn unpublish_project(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(id): Path<Uuid>,
) -> Result<Json<ProjectResponse>, AppError> {
    Ok(Json(
        service::publication::unpublish_project(&state, &user, id).await?,
    ))
}

async fn publication_status(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(id): Path<Uuid>,
) -> Result<Json<PublicationStatusResponse>, AppError> {
    Ok(Json(
        service::publication::get_publication_status(&state, &user, id).await?,
    ))
}
