use std::net::SocketAddr;

use digital_menu_api::{config::AppConfig, error::AppError, routes::create_app, state::AppState};
use sqlx::postgres::PgPoolOptions;
use tokio::signal;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenvy::dotenv().ok();

    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env().unwrap_or_else(|_| "info".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    let config = AppConfig::from_env().map_err(|err| AppError::Config(err.to_string()))?;
    config.validate()?;

    let db = PgPoolOptions::new()
        .max_connections(5)
        .connect(&config.database_url)
        .await?;

    sqlx::migrate!().run(&db).await?;

    tokio::fs::create_dir_all("uploads").await?;

    let state = AppState::new(db, config.clone());
    let app = create_app(state, &config);

    let addr = SocketAddr::from(([0, 0, 0, 0], config.port));
    tracing::info!("Listening on {}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal())
        .await?;

    Ok(())
}

async fn shutdown_signal() {
    let ctrl_c = async {
        signal::ctrl_c()
            .await
            .expect("failed to install Ctrl+C handler");
    };

    #[cfg(unix)]
    let terminate = async {
        signal::unix::signal(signal::unix::SignalKind::terminate())
            .expect("failed to install signal handler")
            .recv()
            .await;
    };

    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    tokio::select! {
        _ = ctrl_c => {},
        _ = terminate => {},
    }

    tracing::info!("shutdown signal received, shutting down");
}
