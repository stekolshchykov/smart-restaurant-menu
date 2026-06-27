# syntax=docker/dockerfile:1

# Multi-stage build for the Rust axum API.
# Build context: apps/api

FROM rust:1.88-slim-bookworm AS builder

WORKDIR /app

# Install native dependencies required by sqlx, OpenSSL and PostgreSQL.
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        pkg-config \
        libssl-dev \
        libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY Cargo.toml Cargo.lock ./
COPY src ./src
COPY migrations ./migrations

RUN --mount=type=cache,target=/usr/local/cargo/registry \
    cargo build --release

FROM debian:bookworm-slim AS runtime

# Runtime libraries for TLS and PostgreSQL.
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        ca-certificates \
        libpq5 \
        wget \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd -r app \
    && useradd -r -g app -s /sbin/nologin app

WORKDIR /app

COPY --from=builder /app/target/release/digital-menu-api /usr/local/bin/digital-menu-api

# Migrations are embedded in the binary, but keeping the folder is useful for audits.
COPY --from=builder /app/migrations ./migrations

# Uploads are written at runtime.
RUN mkdir -p /app/uploads && chown app:app /app/uploads

USER app

ENV PORT=3000
ENV APP_ENV=production
EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --spider -q http://localhost:${PORT}/health || exit 1

ENTRYPOINT ["digital-menu-api"]
