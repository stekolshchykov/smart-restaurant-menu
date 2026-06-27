mod common;

use common::{
    access_token, assert_price_eq, create_category, create_menu_item, create_modifier_group,
    create_modifier_option, create_project, extract_uuid, publish_project, register_user, spawn_app,
};
use reqwest::StatusCode;
use serde_json::json;
use serial_test::serial;

const EMAIL: &str = "owner@menu.test";
const PASSWORD: &str = "StrongP@ssw0rd";

async fn setup_project(app: &common::TestApp) -> (String, uuid::Uuid) {
    let token = access_token(&register_user(app, EMAIL, PASSWORD).await);
    let project = create_project(app, &token, "Menu Project", "menu-project").await;
    let project_id = extract_uuid(&project, "id");
    (token, project_id)
}

#[tokio::test]
#[serial]
async fn create_category_under_project() {
    let app = spawn_app().await;
    let (token, project_id) = setup_project(&app).await;

    let category = create_category(&app, &token, project_id, "Mains").await;

    assert_eq!(category["name"], "Mains");
    assert_eq!(category["projectId"], project_id.to_string());
}

#[tokio::test]
#[serial]
async fn create_menu_item_under_category() {
    let app = spawn_app().await;
    let (token, project_id) = setup_project(&app).await;
    let category = create_category(&app, &token, project_id, "Mains").await;
    let category_id = extract_uuid(&category, "id");

    let item = create_menu_item(&app, &token, category_id, "Burger", "12.50").await;

    assert_eq!(item["name"], "Burger");
    assert_eq!(item["categoryId"], category_id.to_string());
    assert_price_eq(&item["price"], "12.50");
    assert_eq!(item["currency"], "USD");
    assert_eq!(item["status"], "available");
}

#[tokio::test]
#[serial]
async fn create_modifier_group_and_options() {
    let app = spawn_app().await;
    let (token, project_id) = setup_project(&app).await;
    let category = create_category(&app, &token, project_id, "Mains").await;
    let item = create_menu_item(&app, &token, extract_uuid(&category, "id"), "Burger", "12.50").await;
    let item_id = extract_uuid(&item, "id");

    let group = create_modifier_group(&app, &token, item_id, "Size", true, 1, 1).await;
    assert_eq!(group["name"], "Size");
    assert_eq!(group["required"], true);
    assert_eq!(group["minOptions"], 1);
    assert_eq!(group["maxOptions"], 1);

    let option = create_modifier_option(&app, &token, extract_uuid(&group, "id"), "Large", "2.00").await;
    assert_eq!(option["name"], "Large");
    assert_price_eq(&option["price"], "2.00");
}

#[tokio::test]
#[serial]
async fn get_menu_tree_returns_full_structure() {
    let app = spawn_app().await;
    let (token, project_id) = setup_project(&app).await;
    let category = create_category(&app, &token, project_id, "Mains").await;
    let category_id = extract_uuid(&category, "id");
    let item = create_menu_item(&app, &token, category_id, "Burger", "12.50").await;
    let item_id = extract_uuid(&item, "id");
    let group = create_modifier_group(&app, &token, item_id, "Size", false, 0, 1).await;
    create_modifier_option(&app, &token, extract_uuid(&group, "id"), "Large", "2.00").await;

    let tree = common::get(&app, &format!("/projects/{}/menu", project_id), Some(&token))
        .await
        .assert_status(StatusCode::OK)
        .clone();

    let categories = tree["categories"].as_array().unwrap();
    assert_eq!(categories.len(), 1);
    assert_eq!(categories[0]["name"], "Mains");

    let items = categories[0]["items"].as_array().unwrap();
    assert_eq!(items.len(), 1);
    assert_eq!(items[0]["name"], "Burger");

    let groups = items[0]["modifierGroups"].as_array().unwrap();
    assert_eq!(groups.len(), 1);
    assert_eq!(groups[0]["options"].as_array().unwrap().len(), 1);
}

#[tokio::test]
#[serial]
async fn update_and_delete_menu_entities() {
    let app = spawn_app().await;
    let (token, project_id) = setup_project(&app).await;
    let category = create_category(&app, &token, project_id, "Mains").await;
    let category_id = extract_uuid(&category, "id");
    let item = create_menu_item(&app, &token, category_id, "Burger", "12.50").await;
    let item_id = extract_uuid(&item, "id");

    let updated_category = common::patch(
        &app,
        &format!("/categories/{}", category_id),
        json!({ "name": "Updated Mains", "sortOrder": 5 }),
        Some(&token),
    )
    .await
    .assert_status(StatusCode::OK)
    .clone();
    assert_eq!(updated_category["name"], "Updated Mains");
    assert_eq!(updated_category["sortOrder"], 5);

    let updated_item = common::patch(
        &app,
        &format!("/items/{}", item_id),
        json!({
            "name": "Double Burger",
            "price": "15.00",
            "status": "unavailable",
        }),
        Some(&token),
    )
    .await
    .assert_status(StatusCode::OK)
    .clone();
    assert_eq!(updated_item["name"], "Double Burger");
    assert_price_eq(&updated_item["price"], "15.00");
    assert_eq!(updated_item["status"], "unavailable");

    common::delete(&app, &format!("/items/{}", item_id), Some(&token))
        .await
        .assert_status(StatusCode::NO_CONTENT);

    let tree = common::get(&app, &format!("/projects/{}/menu", project_id), Some(&token))
        .await
        .assert_status(StatusCode::OK)
        .clone();
    assert!(tree["categories"][0]["items"].as_array().unwrap().is_empty());
}

#[tokio::test]
#[serial]
async fn availability_status_is_reflected_in_public_tree() {
    let app = spawn_app().await;
    let (token, project_id) = setup_project(&app).await;
    let category = create_category(&app, &token, project_id, "Mains").await;
    let item = create_menu_item(&app, &token, extract_uuid(&category, "id"), "Burger", "12.50").await;
    let item_id = extract_uuid(&item, "id");

    // Public tree shows the item when it is available.
    publish_project(&app, &token, project_id).await;
    let public = common::get(&app, "/public/projects/menu-project/menu", None)
        .await
        .assert_status(StatusCode::OK)
        .clone();
    assert_eq!(public["categories"][0]["items"].as_array().unwrap().len(), 1);

    common::patch(
        &app,
        &format!("/items/{}", item_id),
        json!({ "status": "hidden" }),
        Some(&token),
    )
    .await
    .assert_status(StatusCode::OK);

    let tree = common::get(&app, "/public/projects/menu-project/menu", None)
        .await
        .assert_status(StatusCode::OK)
        .clone();
    assert!(tree["categories"][0]["items"].as_array().unwrap().is_empty());
}

#[tokio::test]
#[serial]
async fn invalid_price_is_rejected() {
    let app = spawn_app().await;
    let (token, project_id) = setup_project(&app).await;
    let category = create_category(&app, &token, project_id, "Mains").await;

    let invalid = common::post(
        &app,
        &format!("/categories/{}/items", extract_uuid(&category, "id")),
        json!({
            "name": "Free?",
            "price": "-1.00",
        }),
        Some(&token),
    )
    .await;
    assert_eq!(invalid.status, StatusCode::BAD_REQUEST);
    assert_eq!(invalid.body["code"], "INVALID_PRICE");
}

#[tokio::test]
#[serial]
async fn modifier_selection_rules_are_validated() {
    let app = spawn_app().await;
    let (token, project_id) = setup_project(&app).await;
    let category = create_category(&app, &token, project_id, "Mains").await;
    let item = create_menu_item(&app, &token, extract_uuid(&category, "id"), "Burger", "12.50").await;

    let invalid = common::post(
        &app,
        &format!("/items/{}/modifier-groups", extract_uuid(&item, "id")),
        json!({
            "name": "Bad",
            "required": false,
            "minOptions": -1,
            "maxOptions": 1,
        }),
        Some(&token),
    )
    .await;
    assert_eq!(invalid.status, StatusCode::BAD_REQUEST);
    assert_eq!(invalid.body["code"], "INVALID_SELECTION");

    let invalid_max = common::post(
        &app,
        &format!("/items/{}/modifier-groups", extract_uuid(&item, "id")),
        json!({
            "name": "Bad",
            "required": false,
            "minOptions": 2,
            "maxOptions": 1,
        }),
        Some(&token),
    )
    .await;
    assert_eq!(invalid_max.status, StatusCode::BAD_REQUEST);
    assert_eq!(invalid_max.body["code"], "INVALID_SELECTION");
}
