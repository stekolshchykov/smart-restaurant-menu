mod common;

use common::{access_token, extract_uuid, login_user, register_user, spawn_app};
use reqwest::StatusCode;
use serde_json::json;
use serial_test::serial;

const EMAIL: &str = "owner@example.com";
const PASSWORD: &str = "StrongP@ssw0rd";

#[tokio::test]
#[serial]
async fn register_creates_user_and_returns_tokens() {
    let app = spawn_app().await;

    let body = register_user(&app, EMAIL, PASSWORD).await;

    assert!(!access_token(&body).is_empty());
    assert_eq!(body["user"]["email"], EMAIL);
    assert_eq!(body["user"]["role"], "owner");
    assert!(extract_uuid(&body["user"], "id") != uuid::Uuid::nil());
}

#[tokio::test]
#[serial]
async fn login_returns_tokens_for_valid_credentials() {
    let app = spawn_app().await;
    register_user(&app, EMAIL, PASSWORD).await;

    let body = login_user(&app, EMAIL, PASSWORD).await;

    assert!(!access_token(&body).is_empty());
    assert_eq!(body["user"]["email"], EMAIL);
}

#[tokio::test]
#[serial]
async fn refresh_issues_a_new_access_token() {
    let app = spawn_app().await;
    register_user(&app, EMAIL, PASSWORD).await;

    let first = login_user(&app, EMAIL, PASSWORD).await;
    let first_token = access_token(&first);

    let refreshed = common::post(&app, "/auth/refresh", json!({}), None)
        .await
        .assert_status(StatusCode::OK)
        .clone();

    assert!(!access_token(&refreshed).is_empty());
    assert_ne!(access_token(&refreshed), first_token);
    assert_eq!(refreshed["user"]["email"], EMAIL);
}

#[tokio::test]
#[serial]
async fn logout_revokes_refresh_token() {
    let app = spawn_app().await;
    register_user(&app, EMAIL, PASSWORD).await;
    login_user(&app, EMAIL, PASSWORD).await;

    common::post(&app, "/auth/logout", json!({}), None)
        .await
        .assert_status(StatusCode::NO_CONTENT);

    let after_logout = common::post(&app, "/auth/refresh", json!({}), None).await;
    assert_eq!(after_logout.status, StatusCode::UNAUTHORIZED);
}

#[tokio::test]
#[serial]
async fn me_returns_current_user() {
    let app = spawn_app().await;
    let auth = register_user(&app, EMAIL, PASSWORD).await;
    let token = access_token(&auth);

    let me = common::get(&app, "/auth/me", Some(&token)).await;
    me.assert_status(StatusCode::OK);
    assert_eq!(me.body["email"], EMAIL);
    assert_eq!(me.body["role"], "owner");
}

#[tokio::test]
#[serial]
async fn me_rejects_missing_token() {
    let app = spawn_app().await;
    let me = common::get(&app, "/auth/me", None).await;
    assert_eq!(me.status, StatusCode::UNAUTHORIZED);
}

#[tokio::test]
#[serial]
async fn login_rejects_invalid_credentials() {
    let app = spawn_app().await;
    register_user(&app, EMAIL, PASSWORD).await;

    let wrong_password = common::post(
        &app,
        "/auth/login",
        json!({
            "email": EMAIL,
            "password": "WrongP@ssw0rd",
        }),
        None,
    )
    .await;
    assert_eq!(wrong_password.status, StatusCode::UNAUTHORIZED);
    assert_eq!(wrong_password.body["code"], "INVALID_CREDENTIALS");

    let wrong_email = common::post(
        &app,
        "/auth/login",
        json!({
            "email": "other@example.com",
            "password": PASSWORD,
        }),
        None,
    )
    .await;
    assert_eq!(wrong_email.status, StatusCode::UNAUTHORIZED);
}

#[tokio::test]
#[serial]
async fn register_rejects_weak_passwords() {
    let app = spawn_app().await;

    for (label, password) in [
        ("too short", "Short1!"),
        ("no uppercase", "weakp@ssw0rd"),
        ("no lowercase", "WEAKP@SSW0RD"),
        ("no digit", "WeakP@ssword"),
        ("no special", "WeakPassw0rd"),
    ] {
        let response = common::post(
            &app,
            "/auth/register",
            json!({
                "email": format!("{}@example.com", label.replace(' ', "-")),
                "password": password,
            }),
            None,
        )
        .await;
        assert_eq!(
            response.status,
            StatusCode::BAD_REQUEST,
            "{} password should be rejected",
            label
        );
        assert_eq!(response.body["code"], "VALIDATION_ERROR");
    }
}

#[tokio::test]
#[serial]
async fn register_rejects_invalid_email_and_duplicate_email() {
    let app = spawn_app().await;

    let invalid_email = common::post(
        &app,
        "/auth/register",
        json!({
            "email": "not-an-email",
            "password": PASSWORD,
        }),
        None,
    )
    .await;
    assert_eq!(invalid_email.status, StatusCode::BAD_REQUEST);

    register_user(&app, EMAIL, PASSWORD).await;

    let duplicate = common::post(
        &app,
        "/auth/register",
        json!({
            "email": EMAIL,
            "password": PASSWORD,
        }),
        None,
    )
    .await;
    // Generic error to avoid leaking whether the email is already registered.
    assert_eq!(duplicate.status, StatusCode::BAD_REQUEST);
    assert_eq!(duplicate.body["code"], "REGISTRATION_FAILED");
}
