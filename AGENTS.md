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

# Start local database
npm run db:up

# Run backend (needs DATABASE_URL and JWT_SECRET in apps/api/.env)
cd apps/api && cp .env.example .env
# Default ports: API 3001, PostgreSQL 5433 (5432 may be used by other projects)
cargo run

# Run frontend dev server
npm run web:dev

# Type-check / lint / build
npm run check     # svelte-check + cargo check via workspaces (add scripts as needed)
npm run lint      # oxlint for web, clippy for api
npm run build     # build all workspaces

# Full local stack
npm run db:up
cargo run --manifest-path apps/api/Cargo.toml
npm run web:dev
```

## Backend architecture

Routes → Services → Repositories → sqlx.

Modules:
- `auth` — register, login, refresh, logout.
- `projects` — project CRUD, themes, publication.
- `menu` — categories, menu items, modifier groups/options, allergens, tags.
- `tables` — tables, public tokens, QR links.
- `orders` — cart sessions, orders, order items.
- `service_requests` — waiter/water/bill/napkins requests.
- `media` — image upload/storage (local disk for MVP).

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

Use Svelte 5 runes. Domain stores live in `apps/web/src/lib/stores/domains/*.svelte.ts`.

## Shared packages

- `packages/shared-types` — source of truth for API DTOs. Both API and web should reference these TypeScript contracts. Rust types mirror them; keep in sync.
- `packages/api-client` — typed fetch wrapper with credentials and error handling. Used by web.

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

Copy `apps/api/.env.example` to `apps/api/.env` and fill in real values before running the API. `JWT_SECRET` must be at least 32 characters.
