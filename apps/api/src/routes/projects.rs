use axum::{
    extract::{Path, Query, State},
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
use crate::venue::models::{
    OrderDetailResponse, OrderListItemResponse, ServiceRequestDetailResponse,
    ServiceRequestListItemResponse, UpdateOrderStatusRequest, UpdateServiceRequestStatusRequest,
};
use crate::venue::service::{orders_admin, service_requests_admin};

#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct OrderStatusFilter {
    status: Option<String>,
}

#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct ServiceRequestStatusFilter {
    status: Option<String>,
}

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/", get(list_projects))
        .route("/", post(create_project))
        .route("/{project_id}/orders", get(list_project_orders))
        .route("/{project_id}/orders/{order_id}", get(get_project_order))
        .route(
            "/{project_id}/orders/{order_id}/status",
            patch(update_project_order_status),
        )
        .route("/{project_id}/service-requests", get(list_project_service_requests))
        .route(
            "/{project_id}/service-requests/{request_id}/status",
            patch(update_project_service_request_status),
        )
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
) -> Result<Json<PublicationStatusResponse>, AppError> {
    service::publication::publish_project(&state, &user, id).await?;
    Ok(Json(
        service::publication::get_publication_status(&state, &user, id).await?,
    ))
}

async fn unpublish_project(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(id): Path<Uuid>,
) -> Result<Json<PublicationStatusResponse>, AppError> {
    service::publication::unpublish_project(&state, &user, id).await?;
    Ok(Json(
        service::publication::get_publication_status(&state, &user, id).await?,
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

async fn list_project_orders(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(project_id): Path<Uuid>,
    Query(filter): Query<OrderStatusFilter>,
) -> Result<Json<Vec<OrderListItemResponse>>, AppError> {
    Ok(Json(
        orders_admin::list_project_orders(&state, &user, project_id, filter.status.as_deref())
            .await?,
    ))
}

async fn get_project_order(
    State(state): State<AppState>,
    user: CurrentUser,
    Path((project_id, order_id)): Path<(Uuid, Uuid)>,
) -> Result<Json<OrderDetailResponse>, AppError> {
    Ok(Json(
        orders_admin::get_order_detail(&state, &user, project_id, order_id).await?,
    ))
}

async fn update_project_order_status(
    State(state): State<AppState>,
    user: CurrentUser,
    Path((project_id, order_id)): Path<(Uuid, Uuid)>,
    Json(req): Json<UpdateOrderStatusRequest>,
) -> Result<Json<OrderDetailResponse>, AppError> {
    Ok(Json(
        orders_admin::update_order_status(&state, &user, project_id, order_id, req.status).await?,
    ))
}

async fn list_project_service_requests(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(project_id): Path<Uuid>,
    Query(filter): Query<ServiceRequestStatusFilter>,
) -> Result<Json<Vec<ServiceRequestListItemResponse>>, AppError> {
    Ok(Json(
        service_requests_admin::list_project_service_requests(
            &state,
            &user,
            project_id,
            filter.status.as_deref(),
        )
        .await?,
    ))
}

async fn update_project_service_request_status(
    State(state): State<AppState>,
    user: CurrentUser,
    Path((project_id, request_id)): Path<(Uuid, Uuid)>,
    Json(req): Json<UpdateServiceRequestStatusRequest>,
) -> Result<Json<ServiceRequestDetailResponse>, AppError> {
    Ok(Json(
        service_requests_admin::update_service_request_status(
            &state,
            &user,
            project_id,
            request_id,
            req.status,
        )
        .await?,
    ))
}
