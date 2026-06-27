mod common;

use common::{
    access_token, create_project, extract_uuid, publish_project, register_user, spawn_app,
    unpublish_project,
};
use reqwest::StatusCode;
use serde_json::json;
use serial_test::serial;

const OWNER_EMAIL: &str = "owner@projects.test";
const OTHER_EMAIL: &str = "other@projects.test";
const PASSWORD: &str = "StrongP@ssw0rd";

#[tokio::test]
#[serial]
async fn create_project_uses_defaults_and_returns_theme() {
    let app = spawn_app().await;
    let token = access_token(&register_user(&app, OWNER_EMAIL, PASSWORD).await);

    let project = create_project(&app, &token, "Test Project", "test-project").await;

    assert_eq!(project["name"], "Test Project");
    assert_eq!(project["slug"], "test-project");
    assert_eq!(project["type"], "restaurant");
    assert_eq!(project["locale"], "en");
    assert_eq!(project["currency"], "USD");
    assert_eq!(project["mode"], "menu_order");
    assert_eq!(project["status"], "draft");
    assert!(project["theme"]["appearance"].is_string());
}

#[tokio::test]
#[serial]
async fn get_project_returns_owned_project() {
    let app = spawn_app().await;
    let token = access_token(&register_user(&app, OWNER_EMAIL, PASSWORD).await);
    let project = create_project(&app, &token, "Test Project", "test-project").await;
    let id = extract_uuid(&project, "id");

    let fetched = common::get(&app, &format!("/projects/{}", id), Some(&token))
        .await
        .assert_status(StatusCode::OK)
        .clone();

    assert_eq!(fetched["id"], project["id"]);
}

#[tokio::test]
#[serial]
async fn other_user_cannot_access_project() {
    let app = spawn_app().await;
    let owner_token = access_token(&register_user(&app, OWNER_EMAIL, PASSWORD).await);
    let other_token = access_token(&register_user(&app, OTHER_EMAIL, PASSWORD).await);
    let project = create_project(&app, &owner_token, "Owner Project", "owner-project").await;
    let id = extract_uuid(&project, "id");

    let fetched = common::get(&app, &format!("/projects/{}", id), Some(&other_token)).await;
    assert_eq!(fetched.status, StatusCode::FORBIDDEN);

    let updated = common::patch(
        &app,
        &format!("/projects/{}", id),
        json!({ "name": "Hacked" }),
        Some(&other_token),
    )
    .await;
    assert_eq!(updated.status, StatusCode::FORBIDDEN);
}

#[tokio::test]
#[serial]
async fn update_project_changes_fields() {
    let app = spawn_app().await;
    let token = access_token(&register_user(&app, OWNER_EMAIL, PASSWORD).await);
    let project = create_project(&app, &token, "Old", "old-slug").await;
    let id = extract_uuid(&project, "id");

    let updated = common::patch(
        &app,
        &format!("/projects/{}", id),
        json!({
            "name": "New",
            "slug": "new-slug",
            "description": "Updated description",
            "mode": "menu_service",
        }),
        Some(&token),
    )
    .await
    .assert_status(StatusCode::OK)
    .clone();

    assert_eq!(updated["name"], "New");
    assert_eq!(updated["slug"], "new-slug");
    assert_eq!(updated["description"], "Updated description");
    assert_eq!(updated["mode"], "menu_service");
}

#[tokio::test]
#[serial]
async fn update_theme_changes_appearance_and_accent_color() {
    let app = spawn_app().await;
    let token = access_token(&register_user(&app, OWNER_EMAIL, PASSWORD).await);
    let project = create_project(&app, &token, "Themed", "themed").await;
    let id = extract_uuid(&project, "id");

    let updated = common::patch(
        &app,
        &format!("/projects/{}/theme", id),
        json!({
            "appearance": "light",
            "accentColor": "#ff0000",
            "cardStyle": "editorial",
            "buttonShape": "pill",
            "largePhotos": false,
            "promoPage": false,
        }),
        Some(&token),
    )
    .await
    .assert_status(StatusCode::OK)
    .clone();

    assert_eq!(updated["theme"]["appearance"], "light");
    assert_eq!(updated["theme"]["accentColor"], "#ff0000");
    assert_eq!(updated["theme"]["cardStyle"], "editorial");
    assert_eq!(updated["theme"]["buttonShape"], "pill");
    assert_eq!(updated["theme"]["largePhotos"], false);
    assert_eq!(updated["theme"]["promoPage"], false);
}

#[tokio::test]
#[serial]
async fn publish_and_unpublish_change_status() {
    let app = spawn_app().await;
    let token = access_token(&register_user(&app, OWNER_EMAIL, PASSWORD).await);
    let project = create_project(&app, &token, "Publish Me", "publish-me").await;
    let id = extract_uuid(&project, "id");

    let published = publish_project(&app, &token, id).await;
    assert_eq!(published["status"], "published");

    let status = common::get(&app, &format!("/projects/{}/publication-status", id), Some(&token))
        .await
        .assert_status(StatusCode::OK)
        .clone();
    assert_eq!(status["status"], "published");
    assert_eq!(status["slug"], "publish-me");

    let unpublished = unpublish_project(&app, &token, id).await;
    assert_eq!(unpublished["status"], "draft");
}

#[tokio::test]
#[serial]
async fn list_projects_returns_only_own_projects() {
    let app = spawn_app().await;
    let owner_auth = register_user(&app, OWNER_EMAIL, PASSWORD).await;
    let owner_token = access_token(&owner_auth);
    let owner_id = extract_uuid(&owner_auth["user"], "id").to_string();
    let other_token = access_token(&register_user(&app, OTHER_EMAIL, PASSWORD).await);

    create_project(&app, &owner_token, "Owner A", "owner-a").await;
    create_project(&app, &owner_token, "Owner B", "owner-b").await;
    create_project(&app, &other_token, "Other", "other-project").await;

    let owner_list = common::get(&app, "/projects", Some(&owner_token))
        .await
        .assert_status(StatusCode::OK)
        .clone();
    assert_eq!(owner_list.as_array().unwrap().len(), 2);
    assert!(owner_list
        .as_array()
        .unwrap()
        .iter()
        .all(|p| p["ownerId"] == owner_id));

    let other_list = common::get(&app, "/projects", Some(&other_token))
        .await
        .assert_status(StatusCode::OK)
        .clone();
    assert_eq!(other_list.as_array().unwrap().len(), 1);
}

#[tokio::test]
#[serial]
async fn create_project_rejects_invalid_slug_and_duplicate_slug() {
    let app = spawn_app().await;
    let token = access_token(&register_user(&app, OWNER_EMAIL, PASSWORD).await);

    let invalid_slug = common::post(
        &app,
        "/projects",
        json!({
            "name": "Bad",
            "slug": "Bad Slug!",
        }),
        Some(&token),
    )
    .await;
    assert_eq!(invalid_slug.status, StatusCode::BAD_REQUEST);
    assert_eq!(invalid_slug.body["code"], "INVALID_SLUG");

    create_project(&app, &token, "Taken", "taken-slug").await;

    let duplicate = common::post(
        &app,
        "/projects",
        json!({
            "name": "Also Taken",
            "slug": "taken-slug",
        }),
        Some(&token),
    )
    .await;
    assert_eq!(duplicate.status, StatusCode::CONFLICT);
    assert_eq!(duplicate.body["code"], "SLUG_TAKEN");
}

#[tokio::test]
#[serial]
async fn update_project_rejects_invalid_mode() {
    let app = spawn_app().await;
    let token = access_token(&register_user(&app, OWNER_EMAIL, PASSWORD).await);
    let project = create_project(&app, &token, "Mode Test", "mode-test").await;
    let id = extract_uuid(&project, "id");

    let invalid = common::patch(
        &app,
        &format!("/projects/{}", id),
        json!({ "mode": "invalid_mode" }),
        Some(&token),
    )
    .await;
    assert_eq!(invalid.status, StatusCode::BAD_REQUEST);
    assert_eq!(invalid.body["code"], "INVALID_MODE");
}
