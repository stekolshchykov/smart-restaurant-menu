# Agent Instructions — Digital Menu SaaS

## Project

A premium digital restaurant menu SaaS. Three surfaces:

- **Marketing site** — sells the service to venue owners.
- **Admin panel** — SaaS workspace to create projects, menus, tables, QR codes and publish.
- **Customer-facing venue site** — branded public menu/order interface for guests.

Stack: SvelteKit 2 + Svelte 5 Runes + TypeScript + Tailwind CSS v4 (frontend), Rust axum + tokio + sqlx + PostgreSQL (backend).

## Tech stack

- **Frontend**: SvelteKit 2, Svelte 5 Runes, TypeScript, Tailwind CSS v4, Vite 6, `@lucide/svelte`.
- **Backend**: Rust axum, tokio, sqlx (PostgreSQL), serde, config, tracing, argon2, jsonwebtoken, tower-http.
- **Shared packages**: `@digital-menu/shared-types`, `@digital-menu/api-client`.
- **Database**: PostgreSQL 16.
- **Local infrastructure**: Docker Compose.

## Monorepo layout

```
digital-menu/
├── apps/
│   ├── web/              # SvelteKit: marketing + admin + public venue
│   └── api/              # Rust axum backend
├── packages/
│   ├── shared-types/     # TypeScript DTOs
│   └── api-client/       # Typed fetch client
├── prototype/            # legacy React/Vite prototype (reference only)
├── docker-compose.yml
└── AGENTS.md
```

## Commands

```bash
# Install all workspace dependencies
npm install

# Start local database (PostgreSQL exposed on host port 5433)
npm run db:up

# Seed a demo user, project, menu and tables (requires running Postgres and apps/api/.env)
npm run db:seed

# Run backend (needs DATABASE_URL and JWT_SECRET in apps/api/.env)
cd apps/api && cp .env.example .env
# Default dev ports: API 3001, web 5173, PostgreSQL host port 5433
cargo run

# Backend-only commands
(cd apps/api && cargo check)
(cd apps/api && cargo clippy -- -D warnings)
DATABASE_URL_TEST=postgres://postgres:postgres@localhost:5433/digital_menu_test cargo test --manifest-path apps/api/Cargo.toml -- --test-threads=1

# Run frontend dev server
npm run web:dev

# Web-only commands
(cd apps/web && npm run check)   # svelte-kit sync + svelte-check
(cd apps/web && npm run lint)    # same as check; placeholder for oxlint/eslint
(cd apps/web && npm run build)
(cd apps/web && npm run preview)

# Root workspace commands
npm run check      # runs workspace checks where defined
npm run lint       # runs web lint and `cargo clippy -- -D warnings`
npm run lint:web   # web-only lint
npm run lint:api   # api-only clippy
npm run test       # runs workspace tests where defined (Vitest for web, cargo test for API)
npm run build      # builds all workspaces

# Full local stack
npm run db:up
cargo run --manifest-path apps/api/Cargo.toml
npm run web:dev

# Docker Compose production-like deployment
# 1. Copy and fill in production values (especially JWT_SECRET and origins).
cp .env.example .env
# 2. Build and start Postgres + API + web with healthchecks.
docker compose up --build -d
# 3. View logs
docker compose logs -f
# 4. Stop (add --volumes to remove the Postgres volume)
docker compose down

# Build standalone Docker images
docker build -t digital-menu-api ./apps/api
docker build -t digital-menu-web -f ./apps/web/Dockerfile .

# Validate the Compose file without building
docker compose config
```

## CI / CD

Workflow files live in `.github/workflows/`:
- `ci.yml` — type-check, web lint, web build, API clippy (`-D warnings`) and API `cargo test` on every push/PR to `main`.
- `deploy.yml` — production build of the web release artifact, API release binary, and Docker images for both services on every push to `main`.

## Backend architecture

Routes → Services → Repositories → sqlx.

Modules:
- `auth` — register, login, refresh, logout, `/auth/me`.
- `projects` — project CRUD, themes, publication.
- `menu` — categories, menu items, modifier groups/options, allergens, tags.
- `tables` — tables, public tokens, QR code/PDF generation.
- `venue` — public venue endpoints, cart sessions, orders, service requests.
- `uploads` — image upload. When `STORAGE_ENDPOINT` is set, images go to a MinIO/S3-compatible bucket and public URLs are returned; otherwise they fall back to local disk (`/uploads`).

Auth: JWT access token + httpOnly refresh cookie. Argon2id password hashing.

## Frontend architecture

Route groups:
- `(marketing)/` — landing, product, solutions, demo, login, register, faq.
- `(admin)/app/` — protected admin panel.
- `(venue)/` — public surfaces:
  - `/venue/[slug]` — promo page
  - `/venue/[slug]/menu` — general menu
  - `/table/[token]` — table-specific menu/order
  - `/order/[token]` — public order status

Use Svelte 5 runes. Domain stores live in `apps/web/src/lib/stores/*.svelte.ts`. Venue-specific components live in `apps/web/src/lib/components/venue/`.

## Shared packages

- `packages/shared-types` — source of truth for API DTOs. Both API and web should reference these TypeScript contracts. Rust types mirror them; keep in sync.
- `packages/api-client` — typed fetch wrapper with credentials and error handling. Used by web.
- All backend JSON responses are **camelCase** (`#[serde(rename_all = "camelCase")]`) so they match `shared-types` exactly.

## Rules

- Keep files under 300 lines.
- Use Tailwind utility classes only; theme values come from `apps/web/src/lib/theme.css` CSS variables.
- No inline one-off elements inside SvelteKit routes; extract to components or UI Kit.
- UI Kit primitives live in `apps/web/src/lib/components/ui/`.
- Empty states are full components, not inline placeholders.
- Focus-visible, reduced motion and ARIA live regions are required for premium UI.
- Rust: prefer runtime-checked `sqlx::query`/`query_as` for velocity; repository pattern for SQL.
- Never commit `.env`, GitHub tokens, or `target/` / `build/` / `.svelte-kit`.

## Prototype

The `prototype/` directory contains the legacy React/Vite implementation. It is reference only; do not modify it unless explicitly asked. The SaaS is a full rewrite in SvelteKit + Rust.

## Environment

Copy `apps/api/.env.example` to `apps/api/.env` and fill in real values before running the API.

For Docker Compose deployments, copy the root `.env.example` to `.env` and set all variables,
especially `JWT_SECRET`, `WEB_ORIGIN`, `API_ORIGIN`, `ALLOWED_ORIGINS`, `API_PORT` and `WEB_PORT`.
The Compose file defaults to a production-like layout: API on `3001` and the web Node adapter on `3000`.

Default dev ports (local `cargo run` / `npm run web:dev`):
- Web: `5173`
- API: `3001` (set via `PORT`)
- PostgreSQL host port: `5433` (mapped to container `5432`)

Default Docker Compose ports:
- Web: `3000` (Node adapter production build)
- API: `3001`
- PostgreSQL host port: `5433`

Required API variables:
- `DATABASE_URL` — PostgreSQL connection string.
- `DATABASE_URL_TEST` — PostgreSQL connection string for integration tests.
- `JWT_SECRET` — at least 32 characters.
- `JWT_ACCESS_EXPIRY_MINUTES`, `JWT_REFRESH_EXPIRY_DAYS` — token lifetimes.
- `ALLOWED_ORIGINS`, `WEB_ORIGIN`, `API_ORIGIN` — CORS and link generation.
- `APP_ENV` — set to `production` for deployed environments.

Optional object-storage variables (MinIO/S3-compatible):
- `STORAGE_ENDPOINT` — S3 API endpoint, e.g. `http://185.237.204.37:9000`. When unset, uploads stay on local disk.
- `STORAGE_BUCKET` — bucket name (default: `digital-menu-uploads`).
- `STORAGE_ACCESS_KEY`, `STORAGE_SECRET_KEY` — bucket credentials.
- `STORAGE_REGION` — region for signing (default: `us-east-1`).
- `STORAGE_USE_PATH_STYLE` — `true` for MinIO path-style URLs (default: `true`).

When storage is configured, deleting or replacing menu-item images, category images, and project theme logo/hero images removes the corresponding objects from the bucket.

Healthcheck endpoints:
- API: `GET /health`
- Web: `GET /health` (custom SvelteKit endpoint)

Never commit `.env`, GitHub tokens, or `target/` / `build/` / `.svelte-kit`.
