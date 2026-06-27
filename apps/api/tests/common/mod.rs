#![allow(dead_code)]

use digital_menu_api::{config::AppConfig, routes::create_app, state::AppState};
use fs2::FileExt;
use reqwest::{Client, StatusCode};
use serde_json::{json, Value};
use sqlx::PgPool;
use std::fs::{File, OpenOptions};
use std::net::SocketAddr;
use std::path::PathBuf;
use uuid::Uuid;

/// Serialize tests within a single test binary (same process).
static TEST_MUTEX: std::sync::Mutex<()> = std::sync::Mutex::new(());

/// Shared test application handle.
///
/// Each test that calls [`spawn_app`] gets a fresh server on a random port and a
/// cleaned test database. Tests are serialized both within and across test
/// binaries so the shared `DATABASE_URL_TEST` database is never touched by more
/// than one test at a time.
pub struct TestApp {
    pub base_url: String,
    pub db: PgPool,
    pub client: Client,
    /// Holds the in-process mutex guard for the duration of the test.
    _process_guard: std::sync::MutexGuard<'static, ()>,
    /// Holds the cross-process file lock for the duration of the test.
    _file_lock: File,
}

/// Raw HTTP response wrapper for tests that need to inspect status codes.
pub struct ApiResponse {
    pub status: StatusCode,
    pub body: Value,
}

impl ApiResponse {
    /// Assert the response status and return the body for further checks.
    pub fn assert_status(&self, expected: StatusCode) -> &Value {
        assert_eq!(
            self.status, expected,
            "unexpected HTTP status {}, body: {}",
            self.status, self.body
        );
        &self.body
    }
}

/// Spawn the API bound to a random OS port against the test database.
///
/// Set `DATABASE_URL_TEST` to a PostgreSQL URL before running the tests, e.g.:
/// `DATABASE_URL_TEST=postgres://postgres:postgres@localhost:5433/digital_menu_test cargo test`
#[allow(clippy::await_holding_lock)]
pub async fn spawn_app() -> TestApp {
    dotenvy::dotenv().ok();
    std::env::set_var("APP_ENV", "test");

    // Acquire an in-process mutex so tests in the same binary never run in
    // parallel against the shared test database.
    let process_guard = TEST_MUTEX
        .lock()
        .unwrap_or_else(|poisoned| poisoned.into_inner());

    // Acquire a cross-process file lock so different test binaries also run
    // sequentially. This keeps the shared `DATABASE_URL_TEST` database isolated.
    let lock_path = std::env::var("DIGITAL_MENU_TEST_LOCK_PATH")
        .map(PathBuf::from)
        .unwrap_or_else(|_| std::env::temp_dir().join("digital_menu_test.lock"));
    let file_lock = OpenOptions::new()
        .write(true)
        .create(true)
        .truncate(false)
        .open(&lock_path)
        .expect("Failed to open test lock file");
    file_lock
        .lock_exclusive()
        .expect("Failed to acquire exclusive test lock");

    let database_url = std::env::var("DATABASE_URL_TEST")
        .expect("DATABASE_URL_TEST must be set to run integration tests");

    let db = PgPool::connect(&database_url)
        .await
        .expect("Failed to connect to the test database");

    sqlx::migrate!()
        .run(&db)
        .await
        .expect("Failed to run database migrations");

    clean_database(&db).await;

    let config = AppConfig {
        port: 0,
        database_url: database_url.clone(),
        jwt_secret: "test-secret-must-be-at-least-32-characters-long".to_string(),
        jwt_access_expiry_minutes: 15,
        jwt_refresh_expiry_days: 7,
        allowed_origins: "http://localhost:5173".to_string(),
        app_env: "test".to_string(),
        web_origin: "http://localhost:5173".to_string(),
        api_origin: "http://localhost:3000".to_string(),
        upload_dir: "uploads".to_string(),
    };

    let state = AppState::new(db.clone(), config.clone(), None);
    let app = create_app(state, &config);

    let listener = tokio::net::TcpListener::bind("127.0.0.1:0")
        .await
        .expect("Failed to bind to a random port");
    let port = listener
        .local_addr()
        .expect("Failed to get listener local address")
        .port();

    let server = axum::serve(listener, app.into_make_service_with_connect_info::<SocketAddr>());
    tokio::spawn(async move {
        let _ = server.await;
    });

    let client = Client::builder()
        .cookie_store(true)
        .build()
        .expect("Failed to build reqwest client");

    TestApp {
        base_url: format!("http://127.0.0.1:{}", port),
        db,
        client,
        _process_guard: process_guard,
        _file_lock: file_lock,
    }
}

async fn clean_database(db: &PgPool) {
    sqlx::query(
        "TRUNCATE TABLE
            service_requests,
            order_items,
            orders,
            cart_sessions,
            tables,
            item_tags,
            item_allergens,
            tags,
            allergens,
            modifier_options,
            modifier_groups,
            menu_items,
            categories,
            project_themes,
            projects,
            refresh_tokens,
            users
        RESTART IDENTITY CASCADE",
    )
    .execute(db)
    .await
    .expect("Failed to clean test database");
}

// ---------------------------------------------------------------------------
// Low-level HTTP helpers
// ---------------------------------------------------------------------------

pub fn url(app: &TestApp, path: &str) -> String {
    format!("{}{}", app.base_url, path)
}

fn build_request(
    _app: &TestApp,
    builder: reqwest::RequestBuilder,
    token: Option<&str>,
) -> reqwest::RequestBuilder {
    let builder = builder.header("content-type", "application/json");
    match token {
        Some(t) => builder.header("authorization", format!("Bearer {}", t)),
        None => builder,
    }
}

pub async fn get(app: &TestApp, path: &str, token: Option<&str>) -> ApiResponse {
    let response = build_request(app, app.client.get(url(app, path)), token)
        .send()
        .await
        .expect("Failed to execute GET request");
    ApiResponse {
        status: response.status(),
        body: response.json().await.unwrap_or(Value::Null),
    }
}

pub async fn post(app: &TestApp, path: &str, body: Value, token: Option<&str>) -> ApiResponse {
    let response = build_request(app, app.client.post(url(app, path)).json(&body), token)
        .send()
        .await
        .expect("Failed to execute POST request");
    ApiResponse {
        status: response.status(),
        body: response.json().await.unwrap_or(Value::Null),
    }
}

pub async fn patch(app: &TestApp, path: &str, body: Value, token: Option<&str>) -> ApiResponse {
    let response = build_request(app, app.client.patch(url(app, path)).json(&body), token)
        .send()
        .await
        .expect("Failed to execute PATCH request");
    ApiResponse {
        status: response.status(),
        body: response.json().await.unwrap_or(Value::Null),
    }
}

pub async fn delete(app: &TestApp, path: &str, token: Option<&str>) -> ApiResponse {
    let response = build_request(app, app.client.delete(url(app, path)), token)
        .send()
        .await
        .expect("Failed to execute DELETE request");
    ApiResponse {
        status: response.status(),
        body: response.json().await.unwrap_or(Value::Null),
    }
}

// ---------------------------------------------------------------------------
// High-level domain helpers
// ---------------------------------------------------------------------------

pub async fn register_user(app: &TestApp, email: &str, password: &str) -> Value {
    post(
        app,
        "/auth/register",
        json!({
            "email": email,
            "password": password,
            "name": "Test User"
        }),
        None,
    )
    .await
    .assert_status(StatusCode::CREATED)
    .clone()
}

pub async fn login_user(app: &TestApp, email: &str, password: &str) -> Value {
    post(
        app,
        "/auth/login",
        json!({
            "email": email,
            "password": password,
        }),
        None,
    )
    .await
    .assert_status(StatusCode::OK)
    .clone()
}

pub async fn create_project(app: &TestApp, token: &str, name: &str, slug: &str) -> Value {
    post(
        app,
        "/projects",
        json!({
            "name": name,
            "slug": slug,
            "type": "restaurant",
            "description": "A test project",
            "locale": "en",
            "currency": "USD",
            "mode": "menu_order",
        }),
        Some(token),
    )
    .await
    .assert_status(StatusCode::CREATED)
    .clone()
}

pub async fn create_category(
    app: &TestApp,
    token: &str,
    project_id: Uuid,
    name: &str,
) -> Value {
    post(
        app,
        &format!("/projects/{}/categories", project_id),
        json!({
            "name": name,
            "sortOrder": 0,
        }),
        Some(token),
    )
    .await
    .assert_status(StatusCode::CREATED)
    .clone()
}

pub async fn create_menu_item(
    app: &TestApp,
    token: &str,
    category_id: Uuid,
    name: &str,
    price: &str,
) -> Value {
    post(
        app,
        &format!("/categories/{}/items", category_id),
        json!({
            "name": name,
            "shortDescription": "Short",
            "description": "Description",
            "price": price,
            "status": "available",
            "quickAdd": true,
            "sortOrder": 0,
        }),
        Some(token),
    )
    .await
    .assert_status(StatusCode::CREATED)
    .clone()
}

pub async fn create_modifier_group(
    app: &TestApp,
    token: &str,
    item_id: Uuid,
    name: &str,
    required: bool,
    min_select: i32,
    max_select: i32,
) -> Value {
    post(
        app,
        &format!("/items/{}/modifier-groups", item_id),
        json!({
            "name": name,
            "required": required,
            "minOptions": min_select,
            "maxOptions": max_select,
            "sortOrder": 0,
        }),
        Some(token),
    )
    .await
    .assert_status(StatusCode::CREATED)
    .clone()
}

pub async fn create_modifier_option(
    app: &TestApp,
    token: &str,
    group_id: Uuid,
    name: &str,
    price: &str,
) -> Value {
    post(
        app,
        &format!("/modifier-groups/{}/options", group_id),
        json!({
            "name": name,
            "price": price,
            "sortOrder": 0,
        }),
        Some(token),
    )
    .await
    .assert_status(StatusCode::CREATED)
    .clone()
}

pub async fn create_table(app: &TestApp, token: &str, project_id: Uuid, label: &str) -> Value {
    post(
        app,
        &format!("/projects/{}/tables", project_id),
        json!({
            "label": label,
            "active": true,
            "sortOrder": 0,
        }),
        Some(token),
    )
    .await
    .assert_status(StatusCode::CREATED)
    .clone()
}

pub async fn publish_project(app: &TestApp, token: &str, project_id: Uuid) -> Value {
    post(
        app,
        &format!("/projects/{}/publish", project_id),
        json!({}),
        Some(token),
    )
    .await
    .assert_status(StatusCode::OK)
    .clone()
}

pub async fn unpublish_project(app: &TestApp, token: &str, project_id: Uuid) -> Value {
    post(
        app,
        &format!("/projects/{}/unpublish", project_id),
        json!({}),
        Some(token),
    )
    .await
    .assert_status(StatusCode::OK)
    .clone()
}

// ---------------------------------------------------------------------------
// Utility helpers
// ---------------------------------------------------------------------------

pub fn access_token(value: &Value) -> String {
    value["accessToken"]
        .as_str()
        .expect("missing accessToken in response")
        .to_string()
}

pub fn extract_uuid(value: &Value, key: &str) -> Uuid {
    value[key]
        .as_str()
        .unwrap_or_else(|| panic!("missing {} in response: {}", key, value))
        .parse()
        .expect("invalid UUID in response")
}

pub fn extract_str<'a>(value: &'a Value, key: &str) -> &'a str {
    value[key]
        .as_str()
        .unwrap_or_else(|| panic!("missing {} in response: {}", key, value))
}

/// Compare a price field serialized as a JSON string against an expected value.
pub fn assert_price_eq(value: &Value, expected: &str) {
    use bigdecimal::BigDecimal;
    let actual: BigDecimal = value
        .as_str()
        .unwrap_or_else(|| panic!("price is not a string: {}", value))
        .parse()
        .unwrap_or_else(|_| panic!("invalid price: {}", value));
    let expected: BigDecimal = expected.parse().unwrap();
    assert_eq!(actual, expected, "price mismatch");
}
