use axum::{
    http::{HeaderName, HeaderValue, Method},
    routing::{get, post},
    Router,
};
use tower_cookies::CookieManagerLayer;
use tower_http::{
    cors::{Any, CorsLayer},
    services::ServeDir,
};

use crate::config::AppConfig;
use crate::state::AppState;

pub mod auth;
pub mod health;
pub mod menu;
pub mod projects;
pub mod tables;
pub mod uploads;

pub fn create_app(state: AppState, config: &AppConfig) -> Router {
    Router::new()
        .route("/health", get(health::health_check))
        .route("/version", get(version))
        .route("/auth/register", post(auth::register))
        .route("/auth/login", post(auth::login))
        .route("/auth/refresh", post(auth::refresh))
        .route("/auth/logout", post(auth::logout))
        .route("/auth/me", get(auth::me))
        .nest("/projects", projects::router())
        .merge(menu::router())
        .merge(tables::router())
        .route("/uploads/image", post(uploads::upload_image))
        .nest_service("/uploads", ServeDir::new("uploads"))
        .layer(CookieManagerLayer::new())
        .layer(cors_layer(config))
        .with_state(state)
}

async fn version() -> axum::Json<serde_json::Value> {
    axum::Json(serde_json::json!({ "version": "0.0.1" }))
}

fn cors_layer(config: &AppConfig) -> CorsLayer {
    let origins = config.allowed_origins();

    if origins.contains(&"*") {
        return CorsLayer::new()
            .allow_origin(Any)
            .allow_methods(Any)
            .allow_headers(Any);
    }

    let allowed_origins: Vec<HeaderValue> = origins
        .into_iter()
        .filter_map(|origin| HeaderValue::from_str(origin).ok())
        .collect();

    CorsLayer::new()
        .allow_origin(tower_http::cors::AllowOrigin::list(allowed_origins))
        .allow_methods([
            Method::GET,
            Method::POST,
            Method::PUT,
            Method::PATCH,
            Method::DELETE,
            Method::OPTIONS,
        ])
        .allow_headers([
            HeaderName::from_static("content-type"),
            HeaderName::from_static("authorization"),
        ])
        .allow_credentials(true)
}
