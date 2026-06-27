# Project PRD — Digital Menu SaaS

## Vision

Transform the existing premium digital-menu prototype into a full SaaS for restaurants, cafés and bars. The product is sold to owners as "a menu that looks like your venue, not an online shop", giving guests a no-app mobile/tablet flow with a configurable digitization level: promo only, menu only, menu + service, or menu + order.

## Product surfaces

1. **Marketing site** — sells the service to venue owners.
2. **Admin panel** — SaaS workspace to create projects, build menus, manage tables, generate QR codes and publish.
3. **Customer-facing venue site** — branded public menu/order interface for guests:
   - `/venue/:slug` — promo page
   - `/venue/:slug/menu` — general menu without a table
   - `/table/:token` — table-specific menu and order flow
   - `/order/:token` — public order status screen

## Core product constants

- Real restaurant-menu look and feel.
- Compact top block with logo, categories and dish cards.
- Quick add, detailed dish sheet, gallery, ingredients, allergens, add-ons.
- Cart, waiting screen and service requests.
- Fullscreen/kiosk mode, responsive layout, premium UI.
- Accessibility: skip-to-content, focus-visible, reduced motion, ARIA live regions.

## Roles

- **Owner** — manages the project, domain/publication/billing and access.
- **Admin/Manager** — configures menu, tables, links and publication.
- **Editor** — edits menu content, cannot change critical settings or access.

## Project lifecycle

Create project → venue basics → visual style and logo → create/import menu → add tables → generate links/QR → preview → publish.

## Publication modes

- **Promo only** — venue showcase only.
- **Menu only** — digital menu without cart or ordering.
- **Menu + service** — menu + waiter/water/napkins/bill requests.
- **Menu + order** — menu with cart and order placement.

## Implementation phases

### Phase 1 — Foundation
- Monorepo setup: `apps/web`, `apps/api`, `packages/shared-types`, `packages/api-client`.
- Docker Compose PostgreSQL, sqlx migrations, shared types.
- JWT auth: register, login, refresh, logout, `/auth/me`.

### Phase 2 — Projects & themes
- Project CRUD with slug, type, locale, currency, mode, status.
- `project_themes`: appearance, accent color, card style, button shape, large photos, promo-page toggle, logo/hero URLs.

### Phase 3 — Menu catalog
- Categories, menu items, modifier groups/options, allergens, tags.
- Menu tree endpoint for the admin.
- Image upload to local disk (`/uploads`).

### Phase 4 — Tables & QR
- Tables with labels, public tokens, active flag.
- Bulk table creation.
- QR code PNG and printable PDF endpoints.

### Phase 5 — Admin UI & publication
- SvelteKit admin route group `(admin)/app/`.
- Project list, project detail, menu editor, tables editor, publish flow.
- Readiness checks and publish/unpublish actions.

### Phase 6 — Public venue API + UI ✅ Completed
- Public venue module: `apps/api/src/routes/venue.rs` + `apps/api/src/venue/`.
- Public endpoints under `/public/...` (no auth).
- SvelteKit `(venue)/` route group: `/venue/[slug]`, `/venue/[slug]/menu`, `/table/[token]`, `/order/[token]`.
- Venue stores: `apps/web/src/lib/stores/venue.svelte.ts`, `apps/web/src/lib/stores/cart.svelte.ts`.
- Venue UI components: `MenuItemCard`, `DetailSheet`, `CartBar`, `CartSheet`, `CategoryChips`.

### Phase 7 — Marketing site ✅ Completed
- SvelteKit `(marketing)/` route group.
- Pages: `/`, `/product`, `/solutions/cafe`, `/solutions/restaurant`, `/solutions/bar`, `/demo`, `/faq`, `/login`, `/register`.
- Focus on conversion, clear value prop and CTA to register.

### Phase 8 — Tests, lint, deployment ✅ Completed
- Lint: `oxlint` for web, `clippy` for API.
- Type-check: `svelte-check` + `cargo check`.
- Tests: Vitest for web, `cargo test` integration tests for API.
- CI: `.github/workflows/ci.yml` runs lint, type-check, build and API tests on every push/PR to `main`; `.github/workflows/deploy.yml` builds the production web release artifact, API release binary, and Docker images for both services on every push to `main`.
- Deployment: Docker Compose (Postgres + API + web), Node adapter for SvelteKit, `uploads` volume, env-based configuration.
- Security: never commit `.env`, refresh tokens stored httpOnly, Argon2id password hashing.
- The legacy GitHub Pages prototype remains in `prototype/` for reference only.

## Public API endpoints

All public endpoints are unauthenticated. Slug/table-token lookup fails with a generic 404 when the project is not published or the table is inactive.

| Method | Endpoint | Request DTO | Response DTO | Purpose |
|--------|----------|-------------|--------------|---------|
| GET | `/public/projects/:slug` | — | `PublicProjectResponse` | Promo/venue info |
| GET | `/public/projects/:slug/menu` | — | `PublicMenuResponse` | Full menu tree |
| GET | `/public/tables/:token` | — | `PublicTableResponse` | Table + project info |
| GET | `/public/tables/:token/cart` | — | `CartSessionResponse` | Get/create cart |
| POST | `/public/tables/:token/cart/items` | `AddToCartRequest` | `CartSessionResponse` | Add item |
| PATCH | `/public/tables/:token/cart/items/:cartItemId` | `{ quantity }` | `CartSessionResponse` | Update quantity |
| DELETE | `/public/tables/:token/cart/items/:cartItemId` | — | `CartSessionResponse` | Remove item |
| POST | `/public/tables/:token/orders` | — | `PlaceOrderResponse` | Place order |
| GET | `/public/orders/:orderToken` | — | `OrderResponse` | Order status |
| POST | `/public/tables/:token/service-requests` | `CreateServiceRequestRequest` | `{ id, status }` | Create request |

Key DTOs (source of truth in `packages/shared-types`; backend serializes camelCase via `#[serde(rename_all = "camelCase")]`):
- `PublicProjectResponse` — `id`, `name`, `slug`, `type`, `description`, `locale`, `currency`, `mode`, `theme`
- `PublicMenuResponse` — `{ categories: CategoryWithItems[] }`
- `PublicTableResponse` — `tableId`, `label`, `token`, `project`
- `AddToCartRequest` — `menuItemId`, `quantity`, `addonIds`, `note`
- `CartSessionResponse` — `token`, `tableId`, `items`, `total`
- `CartItem` / `CartAddon` — snapshot of ordered item + selected add-ons
- `PlaceOrderResponse` — `orderId`, `status`, `total`, `estimatedMinutes`
- `OrderResponse` — `id`, `status`, `total`, `items`, `createdAt`
- `CreateServiceRequestRequest` / service-request response — `type`, `status`

## Public routes

| Route | Group | Purpose |
|-------|-------|---------|
| `/venue/[slug]` | `(venue)/` | Promo page for a published project |
| `/venue/[slug]/menu` | `(venue)/` | General menu without table context |
| `/table/[token]` | `(venue)/` | Table-specific menu, cart and service requests |
| `/order/[token]` | `(venue)/` | Guest-facing order status/waiting screen |

## Data model

Core entities:

- `users` — accounts, password hash, role.
- `refresh_tokens` — httpOnly-rotated refresh storage.
- `projects` — slug, name, type, description, locale, currency, mode, status.
- `project_themes` — appearance, accent, card/button style, photos, promo toggle, logo/hero URLs.
- `categories` / `menu_items` — catalog with availability, quick-add, images, ingredients.
- `modifier_groups` / `modifier_options` — item-level add-ons.
- `allergens` / `tags` + `item_allergens` / `item_tags` — many-to-many.
- `tables` — project tables, public token, active flag, sort order.
- `cart_sessions` — per-table cart stored as JSONB items.
- `orders` / `order_items` — placed order snapshot and line items.
- `service_requests` — per-table requests (waiter, water, napkins, bill, other).

### API contract shape

- All JSON requests and responses use **camelCase** keys. Rust models apply `#[serde(rename_all = "camelCase")]` so database `snake_case` columns are exposed as camelCase.
- `packages/shared-types` is the source of truth for TypeScript consumers; Rust DTOs mirror them and the fields are aligned (e.g. `largePhotos`, `quickAdd`, `minOptions`).

### Venue module

- `apps/api/src/routes/venue.rs` mounts the public venue router under `/public`.
- `apps/api/src/venue/service.rs` and `apps/api/src/venue/repository.rs` handle project/table lookup, cart mutation, order placement and service requests.
- Cart items are snapshots (item name, base price, add-ons) so the guest sees exactly what was ordered even if the menu changes later.

### Cart / order / service-request model

- A `cart_sessions` row is tied to one `tables` row and identified by a UUID token.
- `items` is JSONB; each entry records `menuItemId`, name, `basePrice`, selected add-ons, quantity and note.
- Placing an order copies the cart into `orders` + `order_items`, then clears the cart.
- `orders.status` is stage-based: `pending` → `preparing` → `ready` → `served`; `cancelled` / `paid` are terminal.
- `service_requests` has `type` and `status` (`pending`, `in_progress`, `completed`, `cancelled`).

## UI Kit principles

- Refined hospitality interface.
- Contrasting typography, generous whitespace, large photos, calm palette.
- Dish cards: opacity + translateY 8–12 px.
- Detail sheet: from bottom edge.
- Cart bar: anchored bottom.
- Motion timings:
  - Fast interaction: 120–160 ms
  - Standard state change: 180–240 ms
  - Panel/sheet: 240–320 ms
  - Hero/promo transitions: 300–400 ms
- `prefers-reduced-motion`: replace motion with fade.

## Accessibility & performance

- Touch targets minimum 24×24 px, key controls closer to 44×44 px.
- Focus-visible required.
- Dynamic statuses via ARIA live regions.
- Critical public screens target good Core Web Vitals.
- First-load table menu: skeleton and lightweight first screen.

## Privacy

- Guests do not need an account.
- Table flow uses session + table token + order token.
- Data minimisation: collect only what the scenario requires.

## Known constraints

- No real online payment in MVP.
- No real-time kitchen status; waiting screen shows stage-based statuses.
- Single-location workspace; multi-location is next phase.

## Recent decisions & resolved issues

- **camelCase API contract**: Backend responses were aligned from `snake_case` to `camelCase` using `#[serde(rename_all = "camelCase")]`. `packages/shared-types` is the canonical TypeScript contract.
- **Shared-types drift**: Resolved. Rust DTO fields were reconciled with `packages/shared-types` (e.g. `largePhotos`, `quickAdd`, `minOptions`) and the API contract now matches the TypeScript source of truth.
- **Tests**: Backend test harness is `cargo test`; web test harness is Vitest via `npm run test`.

## Current state

- Backend runs on Rust (axum + sqlx + PostgreSQL) in `apps/api/`.
- Frontend runs on SvelteKit 2 + Svelte 5 Runes + Tailwind CSS v4 in `apps/web/`.
- Shared TypeScript contracts live in `packages/shared-types`; typed fetch client in `packages/api-client`.
- Phases 1–8 are complete: auth, projects/themes, menu catalog, tables/QR, admin UI/publication, public venue API + UI, marketing site, and polish/tests/CI/deployment.
- MVP is product-ready.

## Testing setup

### Web — Vitest

- Test runner: [Vitest](https://vitest.dev/) configured in `apps/web/`.
- Unit and component tests live alongside source code under `apps/web/src/`.
- Run from the repo root:
  ```bash
  npm run test
  ```
- Type-check and lint before running tests:
  ```bash
  npm run check
  npm run lint:web
  ```

### API — cargo integration tests

- Rust integration tests use a real PostgreSQL database.
- Tests are executed with `cargo test` from `apps/api/`.
- Required environment variable for the test database:
  ```bash
  DATABASE_URL_TEST=postgres://postgres:postgres@localhost:5433/digital_menu_test cargo test --manifest-path apps/api/Cargo.toml
  ```
- Start the local test database with `npm run db:up` before running API tests.

## CI workflow

- `.github/workflows/ci.yml` runs on every push and pull request to `main`:
  - **lint-web**: installs Node dependencies, runs `npm run check`, `npm run lint:web`, and `npm run build`.
  - **lint-api**: spins up a PostgreSQL 16 service, creates `digital_menu_test`, runs `cargo clippy -- -D warnings`, and runs `cargo test`.
- `.github/workflows/deploy.yml` builds the production web release artifact (`npm run build`), the API release binary, and Docker images for both services on every push to `main`.

## Current state

- **Auth & security**: JWT access/refresh tokens with reuse detection, Argon2 passwords, rate limiting, CSP + HSTS + security headers, read-only API containers.
- **Admin workspace**: project CRUD, menu/theme editor, table/QR management, order-management page with status filters, per-order loading, cancel confirmation, and 5-second auto-refresh.
- **Order-management API**: `GET /projects/{id}/orders`, `GET /projects/{id}/orders/{id}`, `PATCH /projects/{id}/orders/{id}/status` with validated transitions; 51 integration tests including 7 admin order tests; DB index on `orders.status`.
- **Guest venue**: table-specific menu, quick add, detail sheet with modifiers, cart with quantity/note editing, modifier prices, order confirmation sheet, service requests, and waiting-screen order polling.
- **Staff operations**: admin orders page with status filters/auto-refresh and admin service-requests page with status filters/auto-refresh; both have per-item loading and cancel confirmation.
- **Price formatting**: centralized `formatMoney` helper used across venue cards, detail sheet, cart, order confirmation, admin menu, and modifier editor; screen-reader labels no longer read raw `7.5000`.
- **Accessibility & UX**: global `ToastProvider` with `aria-live="polite"`, focus-visible styling, disabled-link fix, reduced-motion support, SEO meta, `+error.svelte`.
- **PWA / offline**: installable manifest with scope/id/screenshots, explicit-scope service-worker registration with update prompt, stale-while-revalidate runtime cache for public venue/menu/table data, and offline fallback page.

## Verification

The following commands pass on a clean checkout after `npm install` and with the local PostgreSQL container running (`npm run db:up`):

```bash
# API lint
cargo clippy -- -D warnings

# API tests
DATABASE_URL_TEST=postgres://postgres:postgres@localhost:5433/digital_menu_test cargo test

# Web type-check
npm run check

# Workspace lint
npm run lint

# Production build
npm run build

# Workspace tests
npm run test
```
