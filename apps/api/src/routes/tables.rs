use axum::{
    extract::{Path, State},
    http::{header, HeaderMap, StatusCode},
    response::{IntoResponse, Response},
    routing::{get, patch, post},
    Json, Router,
};
use uuid::Uuid;

use crate::auth::middleware::CurrentUser;
use crate::error::AppError;
use crate::projects::repository as projects_repo;
use crate::state::AppState;
use crate::tables::models::{BulkCreateRequest, CreateTableRequest, UpdateTableRequest};
use crate::tables::service;

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/projects/{id}/tables", get(list_tables).post(create_table))
        .route("/projects/{id}/tables/bulk", post(bulk_create_tables))
        .route("/tables/{id}", patch(update_table).delete(delete_table))
        .route("/tables/{id}/qr", get(qr_code))
        .route("/tables/{id}/qr-pdf", get(qr_pdf))
}

async fn list_tables(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(id): Path<Uuid>,
) -> Result<Json<Vec<crate::tables::models::TableResponse>>, AppError> {
    Ok(Json(service::list_tables(&state, &user, id).await?))
}

async fn create_table(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(id): Path<Uuid>,
    Json(req): Json<CreateTableRequest>,
) -> Result<(StatusCode, Json<crate::tables::models::TableResponse>), AppError> {
    let table = service::create_table(&state, &user, id, req).await?;
    Ok((StatusCode::CREATED, Json(table)))
}

async fn bulk_create_tables(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(id): Path<Uuid>,
    Json(req): Json<BulkCreateRequest>,
) -> Result<(StatusCode, Json<Vec<crate::tables::models::TableResponse>>), AppError> {
    let tables = service::bulk_create_tables(&state, &user, id, req).await?;
    Ok((StatusCode::CREATED, Json(tables)))
}

async fn update_table(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(id): Path<Uuid>,
    Json(req): Json<UpdateTableRequest>,
) -> Result<Json<crate::tables::models::TableResponse>, AppError> {
    Ok(Json(service::update_table(&state, &user, id, req).await?))
}

async fn delete_table(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(id): Path<Uuid>,
) -> Result<StatusCode, AppError> {
    service::delete_table(&state, &user, id).await?;
    Ok(StatusCode::NO_CONTENT)
}

async fn qr_code(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(id): Path<Uuid>,
) -> Result<Response, AppError> {
    let table = crate::tables::repository::get(&state.db, id)
        .await?
        .ok_or(AppError::TableNotFound)?;
    let project = projects_repo::get_project(&state.db, table.project_id)
        .await?
        .ok_or(AppError::ProjectNotFound)?;
    if project.owner_id != user.id {
        return Err(AppError::Forbidden);
    }

    let url = format!("{}/table/{}", state.config.web_origin(), table.token);
    let png = service::generate_qr_png(&url)?;
    Ok(image_response(png, "image/png"))
}

async fn qr_pdf(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(id): Path<Uuid>,
) -> Result<Response, AppError> {
    let table = crate::tables::repository::get(&state.db, id)
        .await?
        .ok_or(AppError::TableNotFound)?;
    let project = projects_repo::get_project(&state.db, table.project_id)
        .await?
        .ok_or(AppError::ProjectNotFound)?;
    if project.owner_id != user.id {
        return Err(AppError::Forbidden);
    }

    let url = format!("{}/table/{}", state.config.web_origin(), table.token);
    let qr_png = service::generate_qr_png(&url)?;
    let pdf = service::generate_table_pdf(&table, &project, &qr_png)?;
    Ok(image_response(pdf, "application/pdf"))
}

fn image_response(body: Vec<u8>, content_type: &'static str) -> Response {
    let mut headers = HeaderMap::new();
    headers.insert(header::CONTENT_TYPE, content_type.parse().unwrap());
    (headers, body).into_response()
}
