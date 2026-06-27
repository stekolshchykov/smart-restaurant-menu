use axum::{
    extract::Request,
    http::{
        header::{self, HeaderValue},
        HeaderName, Method,
    },
    middleware::{self, Next},
    response::Response,
    routing::{get, post},
    Router,
};
use tower_cookies::CookieManagerLayer;
use tower_http::{
    cors::{Any, CorsLayer},
    services::ServeDir,
};

use crate::config::AppConfig;
use crate::rate_limit;
use crate::state::AppState;

pub mod auth;
pub mod health;
pub mod menu;
pub mod projects;
pub mod tables;
pub mod uploads;
pub mod venue;

pub fn create_app(state: AppState, config: &AppConfig) -> Router {
    let rate_limit_enabled = config.app_env != "test";

    let auth_router = Router::new()
        .route("/auth/register", post(auth::register))
        .route("/auth/login", post(auth::login))
        .route("/auth/refresh", post(auth::refresh))
        .route("/auth/logout", post(auth::logout))
        .route("/auth/me", get(auth::me))
        .layer(CookieManagerLayer::new());
    let auth_router = if rate_limit_enabled {
        auth_router.route_layer(middleware::from_fn(rate_limit::auth_middleware))
    } else {
        auth_router
    };

    let protected_router = Router::new()
        .nest("/projects", projects::router())
        .merge(menu::router())
        .merge(tables::router())
        .route("/uploads/image", post(uploads::upload_image))
        .layer(CookieManagerLayer::new());
    let protected_router = if rate_limit_enabled {
        protected_router.route_layer(middleware::from_fn(rate_limit::general_middleware))
    } else {
        protected_router
    };

    let public_router = Router::new()
        .route("/health", get(health::health_check))
        .route("/version", get(version))
        .merge(venue::router());
    let public_router = if rate_limit_enabled {
        public_router.route_layer(middleware::from_fn(rate_limit::public_middleware))
    } else {
        public_router
    };

    Router::new()
        .merge(auth_router)
        .merge(protected_router)
        .merge(public_router)
        .nest_service("/uploads", ServeDir::new(config.upload_dir.clone()))
        .layer(middleware::from_fn(security_headers))
        .layer(cors_layer(config))
        .with_state(state)
}

async fn version() -> axum::Json<serde_json::Value> {
    axum::Json(serde_json::json!({ "version": "0.0.1" }))
}

fn cors_layer(config: &AppConfig) -> CorsLayer {
    let origins = config.allowed_origins();
    let is_production = config.app_env == "production";

    if origins.contains(&"*") && !is_production {
        return CorsLayer::new()
            .allow_origin(Any)
            .allow_methods(Any)
            .allow_headers(Any);
    }

    let allowed_origins: Vec<HeaderValue> = origins
        .into_iter()
        .filter_map(|origin| HeaderValue::from_str(origin).ok())
        .collect();

    if allowed_origins.is_empty() && !is_production {
        return CorsLayer::new()
            .allow_origin(Any)
            .allow_methods(Any)
            .allow_headers(Any);
    }

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

async fn security_headers(request: Request, next: Next) -> Response {
    let is_localhost = request
        .headers()
        .get(header::HOST)
        .and_then(|h| h.to_str().ok())
        .is_some_and(|host| host.starts_with("localhost"));

    let mut response = next.run(request).await;
    let headers = response.headers_mut();

    headers.insert(
        header::X_CONTENT_TYPE_OPTIONS,
        HeaderValue::from_static("nosniff"),
    );
    headers.insert(header::X_FRAME_OPTIONS, HeaderValue::from_static("DENY"));
    headers.insert(
        HeaderName::from_static("referrer-policy"),
        HeaderValue::from_static("strict-origin-when-cross-origin"),
    );
    headers.insert(
        HeaderName::from_static("permissions-policy"),
        HeaderValue::from_static("geolocation=(), microphone=(), camera=(), payment=()"),
    );

    // The API primarily serves JSON; a restrictive CSP is a safe default for any HTML response.
    let csp = if is_localhost {
        "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: blob:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
    } else {
        "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'"
    };
    headers.insert(
        HeaderName::from_static("content-security-policy"),
        HeaderValue::from_static(csp),
    );

    if !is_localhost {
        headers.insert(
            HeaderName::from_static("strict-transport-security"),
            HeaderValue::from_static("max-age=63072000; includeSubDomains; preload"),
        );
    }

    response
}
