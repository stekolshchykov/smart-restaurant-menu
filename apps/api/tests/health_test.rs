mod common;

use common::spawn_app;
use reqwest::StatusCode;
use serial_test::serial;

#[tokio::test]
#[serial]
async fn health_and_version_endpoints_return_ok() {
    let app = spawn_app().await;

    let health = common::get(&app, "/health", None).await;
    health.assert_status(StatusCode::OK);
    assert_eq!(health.body["status"], "ok");

    let version = common::get(&app, "/version", None).await;
    version.assert_status(StatusCode::OK);
    assert_eq!(version.body["version"], "0.0.1");
}
