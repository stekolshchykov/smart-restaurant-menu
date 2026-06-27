mod common;

use common::{
    access_token, assert_price_eq, create_category, create_menu_item, create_modifier_group,
    create_modifier_option, create_project, create_table, extract_str, extract_uuid,
    publish_project, register_user, spawn_app,
};
use reqwest::StatusCode;
use serde_json::{json, Value};
use serial_test::serial;
use uuid::Uuid;

const EMAIL: &str = "owner@orders.test";
const PASSWORD: &str = "StrongP@ssw0rd";

/// Create a registered user, published project, table and a single submitted order
/// containing one menu item with one addon.
async fn setup_owner_with_order(
    app: &common::TestApp,
) -> (String, Uuid, Uuid, Uuid, String, String) {
    let token = access_token(&register_user(app, EMAIL, PASSWORD).await);
    let project = create_project(app, &token, "Order Project", "order-project").await;
    let project_id = extract_uuid(&project, "id");

    let category = create_category(app, &token, project_id, "Menu").await;
    let category_id = extract_uuid(&category, "id");

    let item = create_menu_item(app, &token, category_id, "Burger", "12.00").await;
    let item_id = extract_uuid(&item, "id");

    let group = create_modifier_group(app, &token, item_id, "Size", false, 0, 1).await;
    let group_id = extract_uuid(&group, "id");
    let option = create_modifier_option(app, &token, group_id, "Large", "2.00").await;
    let option_id = extract_str(&option, "id").to_string();

    publish_project(app, &token, project_id).await;

    let table = create_table(app, &token, project_id, "T1").await;
    let _table_id = extract_uuid(&table, "id");
    let table_token = extract_str(&table, "token").to_string();

    common::post(
        app,
        &format!("/public/tables/{}/cart/items", table_token),
        json!({
            "menuItemId": item_id,
            "quantity": 1,
            "addonIds": [option_id.clone()],
        }),
        None,
    )
    .await
    .assert_status(StatusCode::CREATED);

    let order = common::post(
        app,
        &format!("/public/tables/{}/orders", table_token),
        json!({}),
        None,
    )
    .await
    .assert_status(StatusCode::CREATED)
    .clone();

    let order_id = extract_uuid(&order, "orderId");
    (token, project_id, order_id, item_id, option_id, table_token)
}

/// Add the same item with the same addon to the table's cart and place another order.
async fn place_another_order(
    app: &common::TestApp,
    table_token: &str,
    item_id: Uuid,
    option_id: &str,
) -> Uuid {
    common::post(
        app,
        &format!("/public/tables/{}/cart/items", table_token),
        json!({
            "menuItemId": item_id,
            "quantity": 1,
            "addonIds": [option_id],
        }),
        None,
    )
    .await
    .assert_status(StatusCode::CREATED);

    let order = common::post(
        app,
        &format!("/public/tables/{}/orders", table_token),
        json!({}),
        None,
    )
    .await
    .assert_status(StatusCode::CREATED)
    .clone();

    extract_uuid(&order, "orderId")
}

async fn patch_status(
    app: &common::TestApp,
    project_id: Uuid,
    order_id: Uuid,
    status: &str,
    token: &str,
) -> Value {
    common::patch(
        app,
        &format!("/projects/{}/orders/{}/status", project_id, order_id),
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
    order_id: Uuid,
    status: &str,
    token: &str,
) {
    let response = common::patch(
        app,
        &format!("/projects/{}/orders/{}/status", project_id, order_id),
        json!({ "status": status }),
        Some(token),
    )
    .await;

    assert_eq!(response.status, StatusCode::BAD_REQUEST);
    assert_eq!(
        response.body["code"], "INVALID_ORDER_STATUS_TRANSITION",
        "transition to {} should have been rejected",
        status
    );
}

#[tokio::test]
#[serial]
async fn admin_order_endpoints_require_authentication() {
    let app = spawn_app().await;
    let app = &app;
    let project_id = Uuid::new_v4();
    let order_id = Uuid::new_v4();

    let list = common::get(app, &format!("/projects/{}/orders", project_id), None).await;
    assert_eq!(list.status, StatusCode::UNAUTHORIZED);
    assert_eq!(list.body["code"], "UNAUTHORIZED");

    let detail = common::get(
        app,
        &format!("/projects/{}/orders/{}", project_id, order_id),
        None,
    )
    .await;
    assert_eq!(detail.status, StatusCode::UNAUTHORIZED);

    let update = common::patch(
        app,
        &format!("/projects/{}/orders/{}/status", project_id, order_id),
        json!({ "status": "preparing" }),
        None,
    )
    .await;
    assert_eq!(update.status, StatusCode::UNAUTHORIZED);
}

#[tokio::test]
#[serial]
async fn admin_orders_only_accessible_by_project_owner() {
    let app = spawn_app().await;
    let app = &app;
    let (owner_token, owner_project_id, owner_order_id, ..) = setup_owner_with_order(app).await;

    // Register a second user with their own project and order.
    let other_token = access_token(&register_user(app, "other@orders.test", PASSWORD).await);
    let other_project = create_project(app, &other_token, "Other Project", "other-project").await;
    let other_project_id = extract_uuid(&other_project, "id");

    let other_category = create_category(app, &other_token, other_project_id, "Other Menu").await;
    let other_category_id = extract_uuid(&other_category, "id");

    let other_item = create_menu_item(app, &other_token, other_category_id, "Salad", "8.00").await;
    let other_item_id = extract_uuid(&other_item, "id");

    publish_project(app, &other_token, other_project_id).await;

    let other_table = create_table(app, &other_token, other_project_id, "OT1").await;
    let other_table_token = extract_str(&other_table, "token").to_string();

    common::post(
        app,
        &format!("/public/tables/{}/cart/items", other_table_token),
        json!({
            "menuItemId": other_item_id,
            "quantity": 1,
            "addonIds": [],
        }),
        None,
    )
    .await
    .assert_status(StatusCode::CREATED);

    let other_order = common::post(
        app,
        &format!("/public/tables/{}/orders", other_table_token),
        json!({}),
        None,
    )
    .await
    .assert_status(StatusCode::CREATED)
    .clone();
    let other_order_id = extract_uuid(&other_order, "orderId");

    // Owner cannot list another user's project orders.
    let list = common::get(
        app,
        &format!("/projects/{}/orders", other_project_id),
        Some(&owner_token),
    )
    .await;
    assert_eq!(list.status, StatusCode::FORBIDDEN);
    assert_eq!(list.body["code"], "FORBIDDEN");

    // Owner cannot read another user's order detail.
    let detail = common::get(
        app,
        &format!("/projects/{}/orders/{}", other_project_id, other_order_id),
        Some(&owner_token),
    )
    .await;
    assert_eq!(detail.status, StatusCode::FORBIDDEN);
    assert_eq!(detail.body["code"], "FORBIDDEN");

    // Owner cannot update another user's order status.
    let update = common::patch(
        app,
        &format!(
            "/projects/{}/orders/{}/status",
            other_project_id, other_order_id
        ),
        json!({ "status": "preparing" }),
        Some(&owner_token),
    )
    .await;
    assert_eq!(update.status, StatusCode::FORBIDDEN);
    assert_eq!(update.body["code"], "FORBIDDEN");

    // The other user also cannot access the owner's project orders.
    let reverse = common::get(
        app,
        &format!("/projects/{}/orders", owner_project_id),
        Some(&other_token),
    )
    .await;
    assert_eq!(reverse.status, StatusCode::FORBIDDEN);

    let reverse_detail = common::get(
        app,
        &format!("/projects/{}/orders/{}", owner_project_id, owner_order_id),
        Some(&other_token),
    )
    .await;
    assert_eq!(reverse_detail.status, StatusCode::FORBIDDEN);
}

#[tokio::test]
#[serial]
async fn list_project_orders_includes_items_and_addons() {
    let app = spawn_app().await;
    let app = &app;
    let (token, project_id, order_id, item_id, ..) = setup_owner_with_order(app).await;

    let list = common::get(app, &format!("/projects/{}/orders", project_id), Some(&token))
        .await
        .assert_status(StatusCode::OK)
        .clone();

    let orders = list.as_array().expect("orders should be an array");
    assert_eq!(orders.len(), 1);

    let order = &orders[0];
    assert_eq!(order["id"], order_id.to_string());
    assert_eq!(order["status"], "submitted");
    assert_eq!(order["itemCount"], 1);
    assert_price_eq(&order["total"], "14.00");

    let items = order["items"].as_array().unwrap();
    assert_eq!(items.len(), 1);
    assert_eq!(items[0]["menuItemId"], item_id.to_string());
    assert_eq!(items[0]["name"], "Burger");
    assert_price_eq(&items[0]["basePrice"], "12.00");
    assert_eq!(items[0]["quantity"], 1);

    let addons = items[0]["addons"].as_array().unwrap();
    assert_eq!(addons.len(), 1);
    assert_eq!(addons[0]["name"], "Large");
    assert_price_eq(&addons[0]["price"], "2.00");
    assert_eq!(addons[0]["quantity"], 1);
}

#[tokio::test]
#[serial]
async fn list_project_orders_status_filter() {
    let app = spawn_app().await;
    let app = &app;
    let (token, project_id, order1_id, item_id, option_id, table_token) =
        setup_owner_with_order(app).await;

    let order2_id = place_another_order(app, &table_token, item_id, &option_id).await;

    // Move the first order forward so the two orders have different statuses.
    patch_status(app, project_id, order1_id, "preparing", &token).await;

    let submitted = common::get(
        app,
        &format!("/projects/{}/orders?status=submitted", project_id),
        Some(&token),
    )
    .await
    .assert_status(StatusCode::OK)
    .clone();
    let submitted_orders = submitted.as_array().unwrap();
    assert_eq!(submitted_orders.len(), 1);
    assert_eq!(submitted_orders[0]["id"], order2_id.to_string());

    let preparing = common::get(
        app,
        &format!("/projects/{}/orders?status=preparing", project_id),
        Some(&token),
    )
    .await
    .assert_status(StatusCode::OK)
    .clone();
    let preparing_orders = preparing.as_array().unwrap();
    assert_eq!(preparing_orders.len(), 1);
    assert_eq!(preparing_orders[0]["id"], order1_id.to_string());

    // An invalid status returns an empty list rather than an error.
    let invalid = common::get(
        app,
        &format!("/projects/{}/orders?status=not_a_status", project_id),
        Some(&token),
    )
    .await
    .assert_status(StatusCode::OK)
    .clone();
    assert!(invalid.as_array().unwrap().is_empty());
}

#[tokio::test]
#[serial]
async fn get_project_order_returns_detail_and_missing_order_is_404() {
    let app = spawn_app().await;
    let app = &app;
    let (token, project_id, order_id, ..) = setup_owner_with_order(app).await;

    let detail = common::get(
        app,
        &format!("/projects/{}/orders/{}", project_id, order_id),
        Some(&token),
    )
    .await
    .assert_status(StatusCode::OK)
    .clone();

    assert_eq!(detail["id"], order_id.to_string());
    assert_eq!(detail["status"], "submitted");
    assert_eq!(detail["itemCount"], 1);
    assert!(!detail["items"].as_array().unwrap().is_empty());

    let missing = common::get(
        app,
        &format!("/projects/{}/orders/{}", project_id, Uuid::new_v4()),
        Some(&token),
    )
    .await;
    assert_eq!(missing.status, StatusCode::NOT_FOUND);
    assert_eq!(missing.body["code"], "ORDER_NOT_FOUND");
}

#[tokio::test]
#[serial]
async fn update_order_status_allows_valid_transitions() {
    let app = spawn_app().await;
    let app = &app;
    let (token, project_id, order_id, item_id, option_id, table_token) =
        setup_owner_with_order(app).await;

    // submitted -> preparing -> ready -> served
    let preparing = patch_status(app, project_id, order_id, "preparing", &token).await;
    assert_eq!(preparing["status"], "preparing");

    let ready = patch_status(app, project_id, order_id, "ready", &token).await;
    assert_eq!(ready["status"], "ready");

    let served = patch_status(app, project_id, order_id, "served", &token).await;
    assert_eq!(served["status"], "served");

    // submitted -> cancelled
    let order2_id = place_another_order(app, &table_token, item_id, &option_id).await;
    let cancelled = patch_status(app, project_id, order2_id, "cancelled", &token).await;
    assert_eq!(cancelled["status"], "cancelled");

    // preparing -> cancelled
    let order3_id = place_another_order(app, &table_token, item_id, &option_id).await;
    patch_status(app, project_id, order3_id, "preparing", &token).await;
    let cancelled3 = patch_status(app, project_id, order3_id, "cancelled", &token).await;
    assert_eq!(cancelled3["status"], "cancelled");
}

#[tokio::test]
#[serial]
async fn update_order_status_rejects_invalid_transitions() {
    let app = spawn_app().await;
    let app = &app;
    let (token, project_id, order_id, item_id, option_id, table_token) =
        setup_owner_with_order(app).await;

    // submitted -> ready is not allowed.
    assert_transition_rejected(app, project_id, order_id, "ready", &token).await;

    // Unknown status string is rejected.
    let invalid = common::patch(
        app,
        &format!("/projects/{}/orders/{}/status", project_id, order_id),
        json!({ "status": "unknown" }),
        Some(&token),
    )
    .await;
    assert_eq!(invalid.status, StatusCode::BAD_REQUEST);
    assert_eq!(invalid.body["code"], "INVALID_ORDER_STATUS_TRANSITION");

    // preparing -> submitted is not allowed.
    patch_status(app, project_id, order_id, "preparing", &token).await;
    assert_transition_rejected(app, project_id, order_id, "submitted", &token).await;

    // served -> preparing is not allowed.
    let order2_id = place_another_order(app, &table_token, item_id, &option_id).await;
    patch_status(app, project_id, order2_id, "preparing", &token).await;
    patch_status(app, project_id, order2_id, "ready", &token).await;
    patch_status(app, project_id, order2_id, "served", &token).await;
    assert_transition_rejected(app, project_id, order2_id, "preparing", &token).await;
}
