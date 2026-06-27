mod common;

use common::{
    access_token, create_project, create_table, extract_str, extract_uuid, publish_project,
    register_user, spawn_app,
};
use reqwest::StatusCode;
use serde_json::json;
use serial_test::serial;

const EMAIL: &str = "owner@tables.test";
const OTHER_EMAIL: &str = "other@tables.test";
const PASSWORD: &str = "StrongP@ssw0rd";

async fn setup_project(app: &common::TestApp) -> (String, uuid::Uuid) {
    let token = access_token(&register_user(app, EMAIL, PASSWORD).await);
    let project = create_project(app, &token, "Table Project", "table-project").await;
    let project_id = extract_uuid(&project, "id");
    (token, project_id)
}

#[tokio::test]
#[serial]
async fn create_table_returns_token_and_links() {
    let app = spawn_app().await;
    let (token, project_id) = setup_project(&app).await;

    let table = create_table(&app, &token, project_id, "Table 1").await;

    assert_eq!(table["label"], "Table 1");
    assert_eq!(table["projectId"], project_id.to_string());
    assert!(!extract_str(&table, "token").is_empty());
    assert!(extract_str(&table, "publicUrl").contains("/table/"));
    assert!(extract_str(&table, "qrUrl").contains("/tables/"));
    assert_eq!(table["active"], true);
}

#[tokio::test]
#[serial]
async fn bulk_create_tables() {
    let app = spawn_app().await;
    let (token, project_id) = setup_project(&app).await;

    let tables = common::post(
        &app,
        &format!("/projects/{}/tables/bulk", project_id),
        json!({
            "prefix": "T",
            "start": 1,
            "end": 5,
        }),
        Some(&token),
    )
    .await
    .assert_status(StatusCode::CREATED)
    .clone();

    let array = tables.as_array().unwrap();
    assert_eq!(array.len(), 5);
    assert!(array.iter().enumerate().all(|(i, t)| {
        let expected = format!("T{}", i + 1);
        t["label"] == expected
    }));
}

#[tokio::test]
#[serial]
async fn list_tables_for_project() {
    let app = spawn_app().await;
    let (token, project_id) = setup_project(&app).await;

    create_table(&app, &token, project_id, "A").await;
    create_table(&app, &token, project_id, "B").await;

    let list = common::get(&app, &format!("/projects/{}/tables", project_id), Some(&token))
        .await
        .assert_status(StatusCode::OK)
        .clone();
    assert_eq!(list.as_array().unwrap().len(), 2);
}

#[tokio::test]
#[serial]
async fn qr_code_returns_png() {
    let app = spawn_app().await;
    let (token, project_id) = setup_project(&app).await;
    let table = create_table(&app, &token, project_id, "QR Test").await;
    let id = extract_uuid(&table, "id");

    let response = common::get(&app, &format!("/tables/{}/qr", id), Some(&token)).await;
    assert_eq!(response.status, StatusCode::OK);
    // The helper parses JSON bodies; QR returns binary, so we need a raw request here.
    let raw = app
        .client
        .get(common::url(&app, &format!("/tables/{}/qr", id)))
        .header("authorization", format!("Bearer {}", token))
        .send()
        .await
        .expect("Failed to request QR");
    assert_eq!(raw.status(), StatusCode::OK);
    assert_eq!(
        raw.headers()
            .get("content-type")
            .and_then(|v| v.to_str().ok()),
        Some("image/png")
    );
}

#[tokio::test]
#[serial]
async fn qr_pdf_returns_pdf() {
    let app = spawn_app().await;
    let (token, project_id) = setup_project(&app).await;
    let table = create_table(&app, &token, project_id, "PDF Test").await;
    let id = extract_uuid(&table, "id");

    let raw = app
        .client
        .get(common::url(&app, &format!("/tables/{}/qr-pdf", id)))
        .header("authorization", format!("Bearer {}", token))
        .send()
        .await
        .expect("Failed to request PDF");
    assert_eq!(raw.status(), StatusCode::OK);
    assert_eq!(
        raw.headers()
            .get("content-type")
            .and_then(|v| v.to_str().ok()),
        Some("application/pdf")
    );
}

#[tokio::test]
#[serial]
async fn inactive_table_is_not_publicly_accessible() {
    let app = spawn_app().await;
    let (token, project_id) = setup_project(&app).await;
    publish_project(&app, &token, project_id).await;
    let table = create_table(&app, &token, project_id, "Inactive").await;
    let table_id = extract_uuid(&table, "id");
    let token_str = extract_str(&table, "token").to_string();

    // First confirm public access works.
    let public = common::get(&app, &format!("/public/tables/{}", token_str), None).await;
    public.assert_status(StatusCode::OK);

    // Deactivate the table.
    common::patch(
        &app,
        &format!("/tables/{}", table_id),
        json!({ "active": false }),
        Some(&token),
    )
    .await
    .assert_status(StatusCode::OK);

    let inactive = common::get(&app, &format!("/public/tables/{}", token_str), None).await;
    assert_eq!(inactive.status, StatusCode::NOT_FOUND);
}

#[tokio::test]
#[serial]
async fn other_user_cannot_access_table_endpoints() {
    let app = spawn_app().await;
    let owner_token = access_token(&register_user(&app, EMAIL, PASSWORD).await);
    let other_token = access_token(&register_user(&app, OTHER_EMAIL, PASSWORD).await);
    let project = create_project(&app, &owner_token, "Owner Tables", "owner-tables").await;
    let project_id = extract_uuid(&project, "id");
    let table = create_table(&app, &owner_token, project_id, "Owner Table").await;
    let table_id = extract_uuid(&table, "id");

    let list = common::get(
        &app,
        &format!("/projects/{}/tables", project_id),
        Some(&other_token),
    )
    .await;
    assert_eq!(list.status, StatusCode::FORBIDDEN);

    let qr = common::get(&app, &format!("/tables/{}/qr", table_id), Some(&other_token)).await;
    assert_eq!(qr.status, StatusCode::FORBIDDEN);
}
