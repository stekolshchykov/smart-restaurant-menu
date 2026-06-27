use s3::{AddressingStyle, Auth, Client};

use crate::error::AppError;

/// S3-compatible storage configuration parsed from the environment.
///
/// When `STORAGE_ENDPOINT` is empty or unset the API falls back to local disk
/// storage, so every field is optional at runtime.
#[derive(Debug, Clone)]
pub struct StorageConfig {
    pub endpoint: String,
    pub bucket: String,
    pub region: String,
    pub access_key: String,
    pub secret_key: String,
    pub use_path_style: bool,
}

impl StorageConfig {
    pub fn from_env() -> Option<Self> {
        let endpoint = std::env::var("STORAGE_ENDPOINT").ok()?;
        if endpoint.trim().is_empty() {
            return None;
        }

        Some(Self {
            endpoint: endpoint.trim_end_matches('/').to_string(),
            bucket: std::env::var("STORAGE_BUCKET")
                .ok()
                .filter(|s| !s.trim().is_empty())
                .unwrap_or_else(|| "digital-menu-uploads".to_string()),
            region: std::env::var("STORAGE_REGION")
                .ok()
                .filter(|s| !s.trim().is_empty())
                .unwrap_or_else(|| "us-east-1".to_string()),
            access_key: std::env::var("STORAGE_ACCESS_KEY").unwrap_or_default(),
            secret_key: std::env::var("STORAGE_SECRET_KEY").unwrap_or_default(),
            use_path_style: std::env::var("STORAGE_USE_PATH_STYLE")
                .map(|s| s.eq_ignore_ascii_case("true"))
                .unwrap_or(true),
        })
    }
}

/// Thin wrapper around an S3-compatible client.
#[derive(Clone)]
pub struct StorageClient {
    client: Client,
    bucket: String,
    public_url_base: String,
}

impl StorageClient {
    pub fn new(config: &StorageConfig) -> Result<Self, AppError> {
        let credentials = s3::Credentials::new(&config.access_key, &config.secret_key)
            .map_err(|err| AppError::Config(format!("invalid storage credentials: {err}")))?;

        let client = Client::builder(&config.endpoint)
            .map_err(|err| AppError::Config(format!("invalid storage endpoint: {err}")))?
            .region(&config.region)
            .auth(Auth::Static(credentials))
            .addressing_style(if config.use_path_style {
                AddressingStyle::Path
            } else {
                AddressingStyle::Auto
            })
            .build()
            .map_err(|err| AppError::Config(format!("failed to build storage client: {err}")))?;

        let public_url_base = format!("{}/{}", config.endpoint.trim_end_matches('/'), config.bucket);

        Ok(Self {
            client,
            bucket: config.bucket.clone(),
            public_url_base,
        })
    }

    /// Uploads `data` under `key` and returns the public URL.
    pub async fn upload(
        &self,
        key: &str,
        data: impl Into<bytes::Bytes>,
        content_type: &str,
    ) -> Result<String, AppError> {
        self.client
            .objects()
            .put(&self.bucket, key)
            .content_type(content_type)
            .map_err(|err| AppError::Config(format!("invalid content type: {err}")))?
            .body_bytes(data)
            .send()
            .await
            .map_err(|err| AppError::Internal(err.into()))?;

        Ok(format!("{}/{}", self.public_url_base, key))
    }

    /// Deletes the object referenced by `url` if it lives in this storage bucket.
    /// Non-managed URLs (empty strings, external URLs, local paths) are ignored.
    pub async fn delete_url(&self, url: &str) {
        let Some(key) = self.extract_key(url) else {
            return;
        };

        if let Err(err) = self
            .client
            .objects()
            .delete(&self.bucket, key)
            .send()
            .await
        {
            tracing::error!(key = key, url = url, error = ?err, "failed to delete storage object");
        }
    }

    /// Convenience helper to delete several URLs, logging per-object failures.
    pub async fn delete_urls<'a>(&self, urls: impl IntoIterator<Item = &'a str>) {
        for url in urls {
            self.delete_url(url).await;
        }
    }

    fn extract_key<'a>(&self, url: &'a str) -> Option<&'a str> {
        let prefix = format!("{}/", self.public_url_base);
        url.strip_prefix(&prefix).filter(|key| !key.is_empty())
    }
}
