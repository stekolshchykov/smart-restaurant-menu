mod common;

use common::{
    access_token, create_project, create_table, extract_str, extract_uuid, publish_project,
    register_user, spawn_app,
};
use reqwest::StatusCode;
use serde_json::{json, Value};
use serial_test::serial;
use uuid::Uuid;

const EMAIL: &str = "owner@service-requests.test";
const OTHER_EMAIL: &str = "other@service-requests.test";
const PASSWORD: &str = "StrongP@ssw0rd";

async fn setup_project(app: &common::TestApp) -> (String, Uuid, Uuid, String) {
    let token = access_token(&register_user(app, EMAIL, PASSWORD).await);
    let project = create_project(app, &token, "Service Request Project", "service-request-project").await;
    let project_id = extract_uuid(&project, "id");
    publish_project(app, &token, project_id).await;

    let table = create_table(app, &token, project_id, "T1").await;
    let table_id = extract_uuid(&table, "id");
    let table_token = extract_str(&table, "token").to_string();

    (token, project_id, table_id, table_token)
}

async fn create_service_request(app: &common::TestApp, table_token: &str, request_type: &str) -> Value {
    common::post(
        app,
        &format!("/public/tables/{}/service-requests", table_token),
        json!({ "type": request_type }),
        None,
    )
    .await
    .assert_status(StatusCode::CREATED)
    .clone()
}

async fn patch_status(
    app: &common::TestApp,
    project_id: Uuid,
    request_id: Uuid,
    status: &str,
    token: &str,
) -> Value {
    common::patch(
        app,
        &format!("/projects/{}/service-requests/{}/status", project_id, request_id),
        json!({ "status": status }),
        Some(token),
    )
    .await
    .assert_status(StatusCode::OK)
    .clone()
}

async fn assert_transition_rejected(
    app: &common::TestApp,
    project_id: Uuid,
    request_id: Uuid,
    status: &str,
    token: &str,
) {
    let response = common::patch(
        app,
        &format!("/projects/{}/service-requests/{}/status", project_id, request_id),
        json!({ "status": status }),
        Some(token),
    )
    .await;
    assert_eq!(response.status, StatusCode::BAD_REQUEST);
    assert_eq!(
        response.body["code"], "INVALID_SERVICE_REQUEST_STATUS_TRANSITION",
        "transition to {} should have been rejected",
        status
    );
}

#[tokio::test]
#[serial]
async fn admin_service_request_endpoints_require_authentication() {
    let app = spawn_app().await;
    let app = &app;
    let project_id = Uuid::new_v4();
    let request_id = Uuid::new_v4();

    let list = common::get(app, &format!("/projects/{}/service-requests", project_id), None).await;
    assert_eq!(list.status, StatusCode::UNAUTHORIZED);
    assert_eq!(list.body["code"], "UNAUTHORIZED");
    let update = common::patch(
        app,
        &format!("/projects/{}/service-requests/{}/status", project_id, request_id),
        json!({ "status": "in_progress" }),
        None,
    )
    .await;
    assert_eq!(update.status, StatusCode::UNAUTHORIZED);
    assert_eq!(update.body["code"], "UNAUTHORIZED");
}

#[tokio::test]
#[serial]
async fn admin_service_requests_only_accessible_by_project_owner() {
    let app = spawn_app().await;
    let app = &app;
    let (owner_token, owner_project_id, _, owner_table_token) = setup_project(app).await;
    let request = create_service_request(app, &owner_table_token, "waiter").await;
    let request_id = extract_uuid(&request, "id");
    let other_token = access_token(&register_user(app, OTHER_EMAIL, PASSWORD).await);
    let other_project = create_project(app, &other_token, "Other Project", "other-sr-project").await;
    let other_project_id = extract_uuid(&other_project, "id");

    let list = common::get(
        app,
        &format!("/projects/{}/service-requests", other_project_id),
        Some(&owner_token),
    )
    .await;
    assert_eq!(list.status, StatusCode::FORBIDDEN);
    assert_eq!(list.body["code"], "FORBIDDEN");

    let update = common::patch(
        app,
        &format!(
            "/projects/{}/service-requests/{}/status",
            other_project_id, request_id
        ),
        json!({ "status": "in_progress" }),
        Some(&owner_token),
    )
    .await;
    assert_eq!(update.status, StatusCode::FORBIDDEN);
    assert_eq!(update.body["code"], "FORBIDDEN");

    let reverse = common::get(
        app,
        &format!("/projects/{}/service-requests", owner_project_id),
        Some(&other_token),
    )
    .await;
    assert_eq!(reverse.status, StatusCode::FORBIDDEN);
}

#[tokio::test]
#[serial]
async fn list_project_service_requests_returns_table_labels() {
    let app = spawn_app().await;
    let app = &app;
    let (token, project_id, table_id, table_token) = setup_project(app).await;

    let request = create_service_request(app, &table_token, "water").await;
    let request_id = extract_uuid(&request, "id");
    let list = common::get(
        app,
        &format!("/projects/{}/service-requests", project_id),
        Some(&token),
    )
    .await
    .assert_status(StatusCode::OK)
    .clone();

    let requests = list.as_array().expect("requests should be an array");
    assert_eq!(requests.len(), 1);
    assert_eq!(requests[0]["id"], request_id.to_string());
    assert_eq!(requests[0]["tableId"], table_id.to_string());
    assert_eq!(requests[0]["tableLabel"], "T1");
    assert_eq!(requests[0]["type"], "water");
    assert_eq!(requests[0]["status"], "pending");
}

#[tokio::test]
#[serial]
async fn list_project_service_requests_status_filter() {
    let app = spawn_app().await;
    let app = &app;
    let (token, project_id, _, table_token) = setup_project(app).await;

    let request1 = create_service_request(app, &table_token, "waiter").await;
    let request1_id = extract_uuid(&request1, "id");

    let request2 = create_service_request(app, &table_token, "napkins").await;
    let request2_id = extract_uuid(&request2, "id");

    patch_status(app, project_id, request1_id, "in_progress", &token).await;

    let pending = common::get(
        app,
        &format!("/projects/{}/service-requests?status=pending", project_id),
        Some(&token),
    )
    .await
    .assert_status(StatusCode::OK)
    .clone();
    let pending_requests = pending.as_array().unwrap();
    assert_eq!(pending_requests.len(), 1);
    assert_eq!(pending_requests[0]["id"], request2_id.to_string());

    let in_progress = common::get(
        app,
        &format!("/projects/{}/service-requests?status=in_progress", project_id),
        Some(&token),
    )
    .await
    .assert_status(StatusCode::OK)
    .clone();
    let in_progress_requests = in_progress.as_array().unwrap();
    assert_eq!(in_progress_requests.len(), 1);
    assert_eq!(in_progress_requests[0]["id"], request1_id.to_string());

    let invalid = common::get(
        app,
        &format!("/projects/{}/service-requests?status=not_a_status", project_id),
        Some(&token),
    )
    .await
    .assert_status(StatusCode::OK)
    .clone();
    assert!(invalid.as_array().unwrap().is_empty());
}

#[tokio::test]
#[serial]
async fn update_service_request_status_allows_valid_transitions() {
    let app = spawn_app().await;
    let app = &app;
    let (token, project_id, _, table_token) = setup_project(app).await;

    let request = create_service_request(app, &table_token, "bill").await;
    let request_id = extract_uuid(&request, "id");

    let in_progress = patch_status(app, project_id, request_id, "in_progress", &token).await;
    assert_eq!(in_progress["status"], "in_progress");
    assert!(in_progress["elapsedSeconds"].as_i64().is_some());

    let completed = patch_status(app, project_id, request_id, "completed", &token).await;
    assert_eq!(completed["status"], "completed");

    let request2 = create_service_request(app, &table_token, "water").await;
    let request2_id = extract_uuid(&request2, "id");
    let cancelled = patch_status(app, project_id, request2_id, "cancelled", &token).await;
    assert_eq!(cancelled["status"], "cancelled");

    let request3 = create_service_request(app, &table_token, "napkins").await;
    let request3_id = extract_uuid(&request3, "id");
    patch_status(app, project_id, request3_id, "in_progress", &token).await;
    let cancelled3 = patch_status(app, project_id, request3_id, "cancelled", &token).await;
    assert_eq!(cancelled3["status"], "cancelled");
}

#[tokio::test]
#[serial]
async fn update_service_request_status_rejects_invalid_transitions() {
    let app = spawn_app().await;
    let app = &app;
    let (token, project_id, _, table_token) = setup_project(app).await;

    let request = create_service_request(app, &table_token, "waiter").await;
    let request_id = extract_uuid(&request, "id");

    assert_transition_rejected(app, project_id, request_id, "completed", &token).await;

    let invalid = common::patch(
        app,
        &format!("/projects/{}/service-requests/{}/status", project_id, request_id),
        json!({ "status": "unknown" }),
        Some(&token),
    )
    .await;
    assert_eq!(invalid.status, StatusCode::BAD_REQUEST);
    assert_eq!(invalid.body["code"], "INVALID_SERVICE_REQUEST_STATUS_TRANSITION");

    patch_status(app, project_id, request_id, "in_progress", &token).await;
    assert_transition_rejected(app, project_id, request_id, "pending", &token).await;

    let request2 = create_service_request(app, &table_token, "water").await;
    let request2_id = extract_uuid(&request2, "id");
    patch_status(app, project_id, request2_id, "in_progress", &token).await;
    patch_status(app, project_id, request2_id, "completed", &token).await;
    assert_transition_rejected(app, project_id, request2_id, "cancelled", &token).await;
}

#[tokio::test]
#[serial]
async fn update_service_request_status_returns_404_for_missing_request() {
    let app = spawn_app().await;
    let app = &app;
    let (token, project_id, _, _) = setup_project(app).await;

    let missing = common::patch(
        app,
        &format!("/projects/{}/service-requests/{}/status", project_id, Uuid::new_v4()),
        json!({ "status": "in_progress" }),
        Some(&token),
    )
    .await;
    assert_eq!(missing.status, StatusCode::NOT_FOUND);
    assert_eq!(missing.body["code"], "SERVICE_REQUEST_NOT_FOUND");
}
