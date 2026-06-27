# Web Agent Notes — Digital Menu SaaS

## Scope

SvelteKit 2 application in `apps/web/`. Contains the marketing site, admin panel and customer-facing venue UI in a single app using route groups.

## Tech stack

- SvelteKit 2 + Svelte 5 Runes
- TypeScript
- Tailwind CSS v4 + `apps/web/src/lib/theme.css` CSS variables
- Vite 6
- `@lucide/svelte`
- `@digital-menu/shared-types` and `@digital-menu/api-client`

## Route groups

All routes live under `apps/web/src/routes/`:

- `(marketing)/` — public marketing and auth pages:
  - `/`, `/product`, `/solutions/cafe`, `/solutions/restaurant`, `/solutions/bar`, `/demo`, `/faq`, `/login`, `/register`
- `(admin)/app/` — protected admin workspace:
  - `/app`, `/app/projects`, `/app/projects/new`, `/app/projects/[id]`, `/app/projects/[id]/menu`, `/app/projects/[id]/tables`, `/app/projects/[id]/publish`, `/app/projects/[id]/settings`, `/app/menu`, `/app/tables`, `/app/publish`, `/app/profile`
- `(venue)/` — public venue pages:
  - `/venue/[slug]` — promo page
  - `/venue/[slug]/menu` — general menu
  - `/table/[token]` — table menu, cart, service requests
  - `/order/[token]` — order status / waiting screen

## Commands

```bash
# Dev server (from repo root)
npm run web:dev

# Or from apps/web/
cd apps/web && npm run dev

# Type-check
cd apps/web && npm run check

# Build / preview
cd apps/web && npm run build
cd apps/web && npm run preview

# Tests (from repo root; Vitest test suite)
npm run test
```

## State and API

- Domain stores: `apps/web/src/lib/stores/*.svelte.ts`.
  - `auth.svelte.ts` — current user, login/logout/refresh.
  - `projects.svelte.ts` — project list and CRUD.
  - `menu.svelte.ts` — menu catalog editing.
  - `tables.svelte.ts` — table and QR management.
  - `publish.svelte.ts` — publication status.
  - `venue.svelte.ts` — public venue/project/table/menu/cart/order loading.
  - `cart.svelte.ts` — local guest cart with `localStorage` persistence.
  - `toast.svelte.ts` — global toast notifications (`success`, `error`, `info`).
- API client: `apps/web/src/lib/api/client.ts` re-exports `ApiClient` from `@digital-menu/api-client`.
- Default dev API origin: `http://localhost:3001`.
- Backend responses are camelCase and map directly to `@digital-menu/shared-types`; `shared-types` is the source of truth for DTOs.

## UI Kit and theme

- Tailwind utility classes only.
- Theme values come from `apps/web/src/lib/theme.css` CSS variables.
- UI primitives and components live in `apps/web/src/lib/components/`.
- Venue-specific components: `apps/web/src/lib/components/venue/` (`MenuItemCard`, `DetailSheet`, `CartBar`, `CartSheet`, `CategoryChips`).
- Empty states are full components (`EmptyState.svelte`), not inline placeholders.

## CI / Deploy

Web checks are run by `.github/workflows/ci.yml`:
- `npm run check` — SvelteKit sync + `svelte-check`.
- `npm run lint:web` — web lint.
- `npm run build` — production build.

Production deployment uses `@sveltejs/adapter-node` and is containerised via Docker Compose.
The web container runs `node apps/web/build/index.js`.
Set `PUBLIC_API_ORIGIN` at build time so the browser client knows where the API lives.

```bash
# Local production preview
cd apps/web && npm run build && npm run preview

# Docker image (from repo root)
docker build -t digital-menu-web -f ./apps/web/Dockerfile .
```

The release artifact is uploaded by `.github/workflows/deploy.yml` as `web-build`.

## Rules

- Keep files under 300 lines.
- No inline one-off elements inside SvelteKit routes; extract to components or the UI Kit.
- Focus-visible, reduced motion and ARIA live regions are required.
- Public pages must be fast and defensive (handle missing project, inactive table, empty cart).
- Never commit `.env`, GitHub tokens, or `build/` / `.svelte-kit`.
