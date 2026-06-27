use std::sync::Arc;

use sqlx::PgPool;

use crate::config::AppConfig;
use crate::storage::StorageClient;

#[derive(Clone)]
pub struct AppState {
    pub db: PgPool,
    pub config: Arc<AppConfig>,
    pub storage: Option<Arc<StorageClient>>,
}

impl AppState {
    pub fn new(db: PgPool, config: AppConfig, storage: Option<Arc<StorageClient>>) -> Self {
        Self {
            db,
            config: Arc::new(config),
            storage,
        }
    }
}
