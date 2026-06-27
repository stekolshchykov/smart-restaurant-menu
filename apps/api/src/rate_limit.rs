use std::{
    collections::HashMap,
    net::SocketAddr,
    time::{Duration, Instant},
};

use axum::{
    extract::{ConnectInfo, Request},
    middleware::Next,
    response::Response,
};
use tokio::sync::Mutex;

use crate::error::AppError;

struct TokenBucket {
    tokens: f64,
    last_update: Instant,
}

struct RateLimiter {
    buckets: Mutex<HashMap<String, TokenBucket>>,
    last_cleanup: Mutex<Instant>,
    capacity: u32,
    refill_per_second: f64,
    cleanup_interval: Duration,
    stale_threshold: Duration,
}

impl RateLimiter {
    fn new(capacity: u32, refill_per_second: f64, cleanup_interval_secs: u64) -> Self {
        Self {
            buckets: Mutex::new(HashMap::new()),
            last_cleanup: Mutex::new(Instant::now()),
            capacity,
            refill_per_second,
            cleanup_interval: Duration::from_secs(cleanup_interval_secs),
            stale_threshold: Duration::from_secs(cleanup_interval_secs * 2),
        }
    }

    async fn check(&self, key: &str) -> bool {
        let mut buckets = self.buckets.lock().await;
        let now = Instant::now();

        // Prevent unbounded memory growth by pruning stale buckets periodically.
        let mut last_cleanup = self.last_cleanup.lock().await;
        if now.duration_since(*last_cleanup) >= self.cleanup_interval {
            buckets.retain(|_, bucket| now.duration_since(bucket.last_update) < self.stale_threshold);
            *last_cleanup = now;
        }

        let bucket = buckets.entry(key.to_string()).or_insert_with(|| TokenBucket {
            tokens: self.capacity as f64,
            last_update: now,
        });

        let elapsed = now.duration_since(bucket.last_update).as_secs_f64();
        bucket.tokens =
            (bucket.tokens + elapsed * self.refill_per_second).min(self.capacity as f64);
        bucket.last_update = now;

        if bucket.tokens >= 1.0 {
            bucket.tokens -= 1.0;
            true
        } else {
            false
        }
    }
}

fn client_key(req: &Request) -> String {
    if let Some(forwarded) = req
        .headers()
        .get("x-forwarded-for")
        .and_then(|v| v.to_str().ok())
        .and_then(|s| s.split(',').next())
        .map(|s| s.trim())
    {
        return forwarded.to_string();
    }

    req.extensions()
        .get::<ConnectInfo<SocketAddr>>()
        .map(|ConnectInfo(addr)| addr.ip())
        .map(|ip| ip.to_string())
        .unwrap_or_else(|| "unknown".to_string())
}

static RATE_LIMITING_ENABLED: std::sync::LazyLock<bool> =
    std::sync::LazyLock::new(|| std::env::var("APP_ENV").unwrap_or_default() != "test");

async fn limit(
    req: Request,
    next: Next,
    limiter: &'static RateLimiter,
) -> Result<Response, AppError> {
    if !*RATE_LIMITING_ENABLED {
        return Ok(next.run(req).await);
    }

    let key = client_key(&req);
    if limiter.check(&key).await {
        Ok(next.run(req).await)
    } else {
        Err(AppError::RateLimited)
    }
}

// Auth endpoints: 10 requests per minute, burst of 10.
static AUTH_LIMITER: std::sync::LazyLock<RateLimiter> =
    std::sync::LazyLock::new(|| RateLimiter::new(10, 10.0 / 60.0, 60));

// Public endpoints: 60 requests per minute, burst of 30.
static PUBLIC_LIMITER: std::sync::LazyLock<RateLimiter> =
    std::sync::LazyLock::new(|| RateLimiter::new(30, 1.0, 60));

// General API endpoints: 200 requests per minute, burst of 100.
static GENERAL_LIMITER: std::sync::LazyLock<RateLimiter> =
    std::sync::LazyLock::new(|| RateLimiter::new(100, 200.0 / 60.0, 300));

pub async fn auth_middleware(req: Request, next: Next) -> Result<Response, AppError> {
    limit(req, next, &AUTH_LIMITER).await
}

pub async fn public_middleware(req: Request, next: Next) -> Result<Response, AppError> {
    limit(req, next, &PUBLIC_LIMITER).await
}

pub async fn general_middleware(req: Request, next: Next) -> Result<Response, AppError> {
    limit(req, next, &GENERAL_LIMITER).await
}
