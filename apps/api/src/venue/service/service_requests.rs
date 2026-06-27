use serde_json::json;

use crate::error::AppError;
use crate::state::AppState;
use crate::venue::models::ServiceRequestRequest;
use crate::venue::repository;

use super::project_table::accessible_table;

const SERVICE_REQUEST_TYPES: &[&str] = &["waiter", "water", "napkins", "bill"];

pub async fn create_service_request(
    state: &AppState,
    table_token: &str,
    req: ServiceRequestRequest,
) -> Result<serde_json::Value, AppError> {
    let table = accessible_table(&state.db, table_token).await?;

    if !SERVICE_REQUEST_TYPES.contains(&req.r#type.as_str()) {
        return Err(AppError::InvalidServiceRequestType);
    }

    let id = repository::create_service_request(&state.db, table.id, &req.r#type).await?;
    Ok(json!({ "id": id, "status": "pending" }))
}
