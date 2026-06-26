# Agent Instructions — Digital Menu

## Project

A premium, themeable digital restaurant menu prototype for The Golden Nugget (Killarney, Ireland). Built as a static React app for phone/tablet/desktop, deployed to GitHub Pages.

## Tech stack

- React 19 + TypeScript
- Vite 8
- Tailwind CSS v4
- Framer Motion
- Lucide React
- Oxlint

## Commands

```bash
npm install        # install dependencies
npm run dev        # local dev server
npm run build      # type-check + production build (base /)
npm run lint       # oxlint
npm run preview    # preview the production build
GITHUB_PAGES=true npm run build   # build with GitHub Pages base path
```

## Architecture

Strict three-layer architecture:

1. **`src/screens/`** — top-level pages. They wire components and hold no layout styling or business logic beyond screen switching.
2. **`src/components/`** — feature components grouped by domain:
   - `ui/` — UI Kit primitives (`Button`, `Card`, `Image`, `Badge`, `Price`, `Stepper`, `IconButton`, `SearchInput`, `FilterChip`, `Toast`, etc.)
   - `menu/` — menu-specific components (`MenuItemCard`, `CategorySection`, `MenuItemDetails`, `MenuFilterBar`, `AddonSelector`, etc.)
   - `order/` — cart/order components (`OrderSummary`, `OrderItem`, `OrderTimer`, etc.)
   - `layout/` — shell components (`Layout`, `Header`, `MenuHeader`, `FloatingCartButton`, `ToastProvider`, `ToastContext`)
3. **`src/lib/`** — pure helpers, formatters, and hooks (`calculations.ts`, `useMenuFilters.ts`, `useToast.ts`).

Rules:
- Screens import from components; components import from UI Kit or `lib`. No reverse imports.
- Keep files under 300 lines.
- No inline one-off elements inside screens.
- Use Tailwind utility classes only; theme values must come from `src/theme.css` CSS variables.
- Global chrome (header, cart button, service button, toasts) is owned by `Layout` and `App.tsx`; individual screens do not re-implement it.

## State

All app state lives in `src/App.tsx`:

- `screen` — current screen (`menu` | `detail` | `cart` | `waiting`)
- `selectedItem` — dish shown on detail screen
- `order` — cart/order state, persisted to `localStorage`
- `menu` / `loading` — menu data fetched from `public/menu.json` with `src/data/menu.json` fallback

## Menu data

`public/menu.json` is fetched at runtime and is the file to edit for live content. `src/data/menu.json` is the fallback used during development or when the fetch fails. Keep both in sync when adding fields.

Rich fields available on each item:

```ts
{
  id, name, description, price, image, ingredients, allergens,
  addons: [{ id, name, price }],
  tags, isSpicy, isVegetarian, isVegan, isGlutenFree,
  featured?: boolean,
  badges?: string[],
  chefNote?: string,
  perfectWith?: [{ id, name, image }],
  relatedIds?: string[]
}
```

Images live in `public/images/` and are referenced as `images/<file>.jpg` in the JSON.

Service-request actions live in `src/data/serviceRequests.json` and are consumed by `ServiceRequestButton` / `ServiceRequestPanel`.

## Theming

Edit `src/theme.css` to re-skin. Key variables:

- `--color-primary`, `--color-accent`
- `--font-sans`, `--font-heading`
- `--radius-*`
- `--shadow-*`

## Deployment

GitHub Pages via `.github/workflows/deploy.yml`:

- Trigger: push to `main`
- Steps: install, lint, build with `GITHUB_PAGES=true`, deploy `dist/`
- Live URL: https://stekolshchykov.github.io/smart-restaurant-menu/

## Important notes

- `base` in `vite.config.ts` is conditional: `/` locally, `/smart-restaurant-menu/` for GitHub Pages.
- All asset paths in `menu.json` must remain relative so they work under the GitHub Pages subpath.
- Always run `npm run lint` and both `npm run build` / `GITHUB_PAGES=true npm run build` before pushing.
- Do not commit the GitHub token, `.env` files, or `dist/`.
