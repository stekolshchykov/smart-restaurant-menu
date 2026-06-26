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
}

fn default_app_env() -> String {
    "development".to_string()
}

fn default_web_origin() -> String {
    "http://localhost:5173".to_string()
}

fn default_api_origin() -> String {
    "http://localhost:3000".to_string()
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
