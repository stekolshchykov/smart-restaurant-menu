# API Agent Notes — Digital Menu SaaS

## Scope

Rust axum backend in `apps/api/`. Serves the admin, marketing and public venue APIs, plus static uploads.

## Migrations

- Migration files live in `apps/api/migrations/`.
- Migrations are embedded with `sqlx::migrate!()` and run automatically on startup.
- Manual run (requires `sqlx-cli`): `cargo sqlx migrate run`.

## Commands

```bash
# Run the API server (needs apps/api/.env)
cd apps/api && cargo run

# Check / lint
cargo check --manifest-path apps/api/Cargo.toml
cargo clippy --manifest-path apps/api/Cargo.toml -- -D warnings

# Unit / integration tests (requires a running PostgreSQL test database)
DATABASE_URL_TEST=postgres://postgres:postgres@localhost:5433/digital_menu_test cargo test --manifest-path apps/api/Cargo.toml
```

All JSON responses use camelCase keys (`#[serde(rename_all = "camelCase")]`) to match `packages/shared-types`.

## CI

The API is exercised by `.github/workflows/ci.yml`:
- Runs `cargo clippy -- -D warnings`.
- Starts a PostgreSQL 16 service, creates `digital_menu_test`, and runs `cargo test`.
- Builds a release binary with `cargo build --release`.

## Docker

The API is containerised in `apps/api/Dockerfile` as a multi-stage Rust build.

```bash
# Build the API image
docker build -t digital-menu-api ./apps/api

# Run with a database container (see root docker-compose.yml for full stack)
docker run --rm -p 3001:3000 \
  -e DATABASE_URL=postgres://postgres:postgres@host.docker.internal:5433/digital_menu \
  -e JWT_SECRET=change-me-min-32-characters-long-secret \
  -e ALLOWED_ORIGINS=http://localhost:5173 \
  -e WEB_ORIGIN=http://localhost:5173 \
  -e API_ORIGIN=http://localhost:3001 \
  digital-menu-api
```

The release binary is uploaded by `.github/workflows/deploy.yml` as `api-release`.

## Route groups

### Auth routes

No authentication required:

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`

Auth flow: JWT access token returned in the JSON response, refresh token delivered as an httpOnly cookie (`refresh_token`). Passwords are hashed with Argon2id.

### Protected routes

Require `Authorization: Bearer <access_token>` (enforced by `CurrentUser` middleware):

- `/projects/*` — project CRUD, themes, publication status.
- `/projects/{id}/menu`, `/categories/*`, `/items/*`, `/modifier-groups/*`, `/modifier-options/*`, `/projects/{id}/allergens`, `/projects/{id}/tags` — menu catalog management.
- `/projects/{id}/tables`, `/tables/{id}/*` — table management and QR/PDF generation.
- `POST /uploads/image` — image upload.

### Public routes

No authentication required:

- `GET /health`, `GET /version`
- `/public/projects/{slug}` and `/public/projects/{slug}/menu`
- `/public/tables/{token}` and `/public/tables/{token}/*` (cart, orders, service-requests)
- `/public/orders/{order_token}`
- `/uploads/*` — static uploaded files

## Module map

- `auth` — JWT, password hashing, middleware.
- `config` — env-based configuration and validation.
- `error` — unified `AppError` type.
- `menu` — catalog services and repositories.
- `projects` — project/theme/publication services and repositories.
- `routes` — axum routers (`auth`, `health`, `menu`, `projects`, `tables`, `uploads`, `venue`).
- `state` — shared `AppState` (DB pool + config).
- `tables` — table CRUD and QR/PDF generation.
- `venue` — public venue, cart, orders and service requests.

## Environment

See `apps/api/.env.example` for local development and the root `.env.example` for Docker Compose.
Key variables:

- `DATABASE_URL`
- `PORT` (default dev: `3001`)
- `JWT_SECRET` (≥32 chars)
- `JWT_ACCESS_EXPIRY_MINUTES`, `JWT_REFRESH_EXPIRY_DAYS`
- `ALLOWED_ORIGINS`, `WEB_ORIGIN`, `API_ORIGIN`
- `APP_ENV`

Never commit `.env` or `target/`.
