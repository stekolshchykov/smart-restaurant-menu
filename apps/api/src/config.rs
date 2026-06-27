use config::{Config, ConfigError, Environment};
use serde::Deserialize;

#[derive(Debug, Clone, Deserialize)]
pub struct AppConfig {
    pub port: u16,
    pub database_url: String,
    pub jwt_secret: String,
    pub jwt_access_expiry_minutes: i64,
    pub jwt_refresh_expiry_days: i64,
    pub allowed_origins: String,
    #[serde(default = "default_app_env")]
    pub app_env: String,
    #[serde(default = "default_web_origin")]
    pub web_origin: String,
    #[serde(default = "default_api_origin")]
    pub api_origin: String,
    #[serde(default = "default_upload_dir")]
    pub upload_dir: String,
}

fn default_app_env() -> String {
    "development".to_string()
}

fn default_web_origin() -> String {
    "http://localhost:5173".to_string()
}

fn default_api_origin() -> String {
    "http://localhost:3001".to_string()
}

fn default_upload_dir() -> String {
    "uploads".to_string()
}

impl AppConfig {
    pub fn from_env() -> Result<Self, ConfigError> {
        dotenvy::dotenv().ok();

        Config::builder()
            .add_source(Environment::default())
            .build()?
            .try_deserialize()
    }

    pub fn validate(&self) -> anyhow::Result<()> {
        if self.jwt_secret.len() < 32 {
            anyhow::bail!("JWT_SECRET must be at least 32 characters long");
        }
        if self.jwt_access_expiry_minutes <= 0 || self.jwt_access_expiry_minutes > 1440 {
            anyhow::bail!(
                "JWT_ACCESS_EXPIRY_MINUTES must be between 1 and 1440 (got {})",
                self.jwt_access_expiry_minutes
            );
        }
        if self.jwt_refresh_expiry_days <= 0 || self.jwt_refresh_expiry_days > 90 {
            anyhow::bail!(
                "JWT_REFRESH_EXPIRY_DAYS must be between 1 and 90 (got {})",
                self.jwt_refresh_expiry_days
            );
        }
        if self.app_env == "production" {
            if self.allowed_origins.trim().is_empty() {
                anyhow::bail!("ALLOWED_ORIGINS must not be empty in production");
            }
            if self.allowed_origins().contains(&"*") {
                anyhow::bail!("Wildcard CORS origin (*) is not allowed in production");
            }
        }
        if self.upload_dir.is_empty() || self.upload_dir.contains('\0') {
            anyhow::bail!("UPLOAD_DIR must be a non-empty path");
        }
        Ok(())
    }

    pub fn web_origin(&self) -> &str {
        self.web_origin.trim_end_matches('/')
    }

    pub fn api_origin(&self) -> &str {
        self.api_origin.trim_end_matches('/')
    }

    pub fn allowed_origins(&self) -> Vec<&str> {
        self.allowed_origins
            .split(',')
            .map(str::trim)
            .filter(|s| !s.is_empty())
            .collect()
    }
}
