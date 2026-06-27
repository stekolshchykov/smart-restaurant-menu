mod common;

use common::{
    access_token, assert_price_eq, create_category, create_menu_item, create_modifier_group,
    create_modifier_option, create_project, create_table, extract_str, extract_uuid, publish_project,
    register_user, spawn_app,
};
use reqwest::StatusCode;
use serde_json::json;
use serial_test::serial;

const EMAIL: &str = "owner@venue.test";
const PASSWORD: &str = "StrongP@ssw0rd";

async fn setup_venue(app: &common::TestApp) -> (String, uuid::Uuid, uuid::Uuid, String, uuid::Uuid) {
    let token = access_token(&register_user(app, EMAIL, PASSWORD).await);
    let project = create_project(app, &token, "Venue Project", "venue-project").await;
    let project_id = extract_uuid(&project, "id");

    let category = create_category(app, &token, project_id, "Menu").await;
    let category_id = extract_uuid(&category, "id");
    let item = create_menu_item(app, &token, category_id, "Pizza", "10.00").await;
    let item_id = extract_uuid(&item, "id");

    publish_project(app, &token, project_id).await;
    let table = create_table(app, &token, project_id, "T1").await;
    let table_id = extract_uuid(&table, "id");
    let table_token = extract_str(&table, "token").to_string();

    (token, project_id, table_id, table_token, item_id)
}

#[tokio::test]
#[serial]
async fn public_project_endpoint_requires_publication() {
    let app = spawn_app().await;
    let token = access_token(&register_user(&app, EMAIL, PASSWORD).await);
    let project = create_project(&app, &token, "Draft", "draft-project").await;
    let project_id = extract_uuid(&project, "id");
    create_table(&app, &token, project_id, "T1").await;

    let unpublished = common::get(&app, "/public/projects/draft-project", None).await;
    assert_eq!(unpublished.status, StatusCode::NOT_FOUND);
    assert_eq!(unpublished.body["code"], "PROJECT_NOT_PUBLISHED");

    publish_project(&app, &token, project_id).await;

    let published = common::get(&app, "/public/projects/draft-project", None)
        .await
        .assert_status(StatusCode::OK)
        .clone();
    assert_eq!(published["name"], "Draft");
    assert_eq!(published["slug"], "draft-project");
}

#[tokio::test]
#[serial]
async fn public_menu_endpoint_returns_menu_tree() {
    let app = spawn_app().await;
    let (_token, _project_id, _table_id, _table_token, item_id) = setup_venue(&app).await;

    let menu = common::get(&app, "/public/projects/venue-project/menu", None)
        .await
        .assert_status(StatusCode::OK)
        .clone();

    assert_eq!(menu["categories"].as_array().unwrap().len(), 1);
    let items = menu["categories"][0]["items"].as_array().unwrap();
    assert_eq!(items.len(), 1);
    assert_eq!(items[0]["id"], item_id.to_string());
}

#[tokio::test]
#[serial]
async fn public_table_endpoint_returns_table_and_project() {
    let app = spawn_app().await;
    let (_token, _project_id, table_id, table_token, _item_id) = setup_venue(&app).await;

    let public = common::get(&app, &format!("/public/tables/{}", table_token), None)
        .await
        .assert_status(StatusCode::OK)
        .clone();
    assert_eq!(public["tableId"], table_id.to_string());
    assert_eq!(public["project"]["slug"], "venue-project");
}

#[tokio::test]
#[serial]
async fn cart_add_update_remove() {
    let app = spawn_app().await;
    let (_token, _project_id, _table_id, table_token, item_id) = setup_venue(&app).await;

    let add = common::post(
        &app,
        &format!("/public/tables/{}/cart/items", table_token),
        json!({
            "menuItemId": item_id,
            "quantity": 2,
            "addonIds": [],
        }),
        None,
    )
    .await
    .assert_status(StatusCode::CREATED)
    .clone();
    assert_eq!(add["items"].as_array().unwrap().len(), 1);
    assert_eq!(add["items"][0]["quantity"], 2);
    assert_price_eq(&add["total"], "20.00");

    let cart_item_id = extract_str(&add["items"][0], "id").to_string();

    let update = common::patch(
        &app,
        &format!("/public/tables/{}/cart/items/{}", table_token, cart_item_id),
        json!({ "quantity": 3 }),
        None,
    )
    .await
    .assert_status(StatusCode::OK)
    .clone();
    assert_eq!(update["items"][0]["quantity"], 3);
    assert_price_eq(&update["total"], "30.00");

    let remove = common::delete(
        &app,
        &format!("/public/tables/{}/cart/items/{}", table_token, cart_item_id),
        None,
    )
    .await
    .assert_status(StatusCode::OK)
    .clone();
    assert!(remove["items"].as_array().unwrap().is_empty());
    assert_price_eq(&remove["total"], "0");
}

#[tokio::test]
#[serial]
async fn place_order_and_poll_status() {
    let app = spawn_app().await;
    let (_token, _project_id, _table_id, table_token, item_id) = setup_venue(&app).await;

    common::post(
        &app,
        &format!("/public/tables/{}/cart/items", table_token),
        json!({
            "menuItemId": item_id,
            "quantity": 1,
            "addonIds": [],
        }),
        None,
    )
    .await
    .assert_status(StatusCode::CREATED);

    let order = common::post(&app, &format!("/public/tables/{}/orders", table_token), json!({}), None)
        .await
        .assert_status(StatusCode::CREATED)
        .clone();
    assert_eq!(order["status"], "submitted");
    assert_price_eq(&order["total"], "10.00");

    let order_id = extract_uuid(&order, "orderId").to_string();
    let polled = common::get(&app, &format!("/public/orders/{}", order_id), None)
        .await
        .assert_status(StatusCode::OK)
        .clone();
    assert_eq!(polled["id"], order_id);
    assert_eq!(polled["status"], "submitted");
    assert_eq!(polled["items"].as_array().unwrap().len(), 1);
}

#[tokio::test]
#[serial]
async fn service_request_is_created() {
    let app = spawn_app().await;
    let (_token, _project_id, _table_id, table_token, _item_id) = setup_venue(&app).await;

    let request = common::post(
        &app,
        &format!("/public/tables/{}/service-requests", table_token),
        json!({ "type": "waiter" }),
        None,
    )
    .await
    .assert_status(StatusCode::CREATED)
    .clone();
    assert!(request["id"].is_string());
    assert_eq!(request["status"], "pending");
}

#[tokio::test]
#[serial]
async fn modifier_min_max_rules_are_enforced() {
    let app = spawn_app().await;
    let (token, _project_id, _table_id, table_token, item_id) = setup_venue(&app).await;

    // Add a required group with min/max=1.
    let group = create_modifier_group(&app, &token, item_id, "Size", true, 1, 1).await;
    let group_id = extract_uuid(&group, "id");
    let option = create_modifier_option(&app, &token, group_id, "Large", "2.00").await;
    let option_id = extract_uuid(&option, "id").to_string();

    // Missing required option -> 400.
    let missing = common::post(
        &app,
        &format!("/public/tables/{}/cart/items", table_token),
        json!({
            "menuItemId": item_id,
            "quantity": 1,
            "addonIds": [],
        }),
        None,
    )
    .await;
    assert_eq!(missing.status, StatusCode::BAD_REQUEST);
    assert_eq!(missing.body["code"], "INVALID_SELECTION");

    // Two options from a max=1 group -> 400.
    let second_option = create_modifier_option(&app, &token, group_id, "Extra", "3.00").await;
    let too_many = common::post(
        &app,
        &format!("/public/tables/{}/cart/items", table_token),
        json!({
            "menuItemId": item_id,
            "quantity": 1,
            "addonIds": [option_id, extract_str(&second_option, "id")],
        }),
        None,
    )
    .await;
    assert_eq!(too_many.status, StatusCode::BAD_REQUEST);
    assert_eq!(too_many.body["code"], "INVALID_SELECTION");

    // Exactly one option -> 201.
    let ok = common::post(
        &app,
        &format!("/public/tables/{}/cart/items", table_token),
        json!({
            "menuItemId": item_id,
            "quantity": 1,
            "addonIds": [option_id],
        }),
        None,
    )
    .await;
    assert_eq!(ok.status, StatusCode::CREATED);
    assert_eq!(ok.body["items"][0]["addons"].as_array().unwrap().len(), 1);
    assert_price_eq(&ok.body["total"], "12.00");
}

#[tokio::test]
#[serial]
async fn unavailable_item_cannot_be_added_to_cart() {
    let app = spawn_app().await;
    let (token, _project_id, _table_id, table_token, item_id) = setup_venue(&app).await;

    common::patch(
        &app,
        &format!("/items/{}", item_id),
        json!({ "status": "unavailable" }),
        Some(&token),
    )
    .await
    .assert_status(StatusCode::OK);

    let add = common::post(
        &app,
        &format!("/public/tables/{}/cart/items", table_token),
        json!({
            "menuItemId": item_id,
            "quantity": 1,
            "addonIds": [],
        }),
        None,
    )
    .await;
    assert_eq!(add.status, StatusCode::NOT_FOUND);
    assert_eq!(add.body["code"], "MENU_ITEM_UNAVAILABLE");
}

#[tokio::test]
#[serial]
async fn empty_cart_cannot_place_order() {
    let app = spawn_app().await;
    let (_token, _project_id, _table_id, table_token, _item_id) = setup_venue(&app).await;

    let order = common::post(&app, &format!("/public/tables/{}/orders", table_token), json!({}), None).await;
    assert_eq!(order.status, StatusCode::BAD_REQUEST);
    assert_eq!(order.body["code"], "EMPTY_CART");
}

#[tokio::test]
#[serial]
async fn invalid_service_request_type_is_rejected() {
    let app = spawn_app().await;
    let (_token, _project_id, _table_id, table_token, _item_id) = setup_venue(&app).await;

    let request = common::post(
        &app,
        &format!("/public/tables/{}/service-requests", table_token),
        json!({ "type": "invalid" }),
        None,
    )
    .await;
    assert_eq!(request.status, StatusCode::BAD_REQUEST);
    assert_eq!(request.body["code"], "INVALID_SERVICE_REQUEST_TYPE");
}
