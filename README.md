# The Golden Nugget — Digital Menu

A responsive, themeable digital restaurant menu prototype built with React, TypeScript and Vite.

**Live demo:** https://stekolshchykov.github.io/smart-restaurant-menu/

## Features

- **Menu from JSON** — categories, dishes, ingredients, allergens, tags, add-ons, chef notes, pairings, related dishes and badges are driven by a single JSON file.
- **Search & dietary filters** — search by dish name or ingredient, and filter by spicy, vegetarian, vegan and gluten-free.
- **Premium empty state** — when search or filters return nothing, a polished `EmptyMenuState` offers category shortcuts and one-tap reset.
- **Dish detail with add-ons** — tap any dish to see a large product image gallery on the left, with details, ingredients, allergens, optional extras, quantity and "Add to order" on the right.
- **Quick-add** — hover or focus any dish card to add it to the cart in one tap; dishes with required add-ons open detail first.
- **Toast feedback** — subtle confirmation appears after quick-add and service-request actions.
- **Cart** — review selected items, remove lines and see a running total.
- **Premium waiting screen** — after placing an order, a full-screen confirmation page shows a large circular countdown, live preparation stepper, order number, receipt-style order summary with add-ons and total, and a "Need anything else?" service block.
- **Floating cart bar** — when items are in the cart, a compact bottom bar appears with the item count and total, letting guests review and confirm their order without leaving the menu.
- **Service requests** — a floating Service button on every main screen opens quick actions (call waiter, water, napkins, cutlery, bill, help) with elegant toast feedback.
- **Kiosk / tablet mode** — a regular footer at the bottom of the page with a fullscreen toggle and admin unlock modal (PIN `123123`) so staff can exit fullscreen or reset the order. If a guest leaves fullscreen via a system gesture, a polite notice invites them back.
- **Menu-first layout** — the menu page shows only a compact centered restaurant header, category navigation and dishes. A minimal navigation header is used only on the detail, cart and waiting screens so the food stays front and centre.
- **Responsive** — optimised for phone, tablet and desktop viewports.
- **Themeable** — colours, fonts, shadows and radii are controlled by CSS variables for easy re-skinning.
- **Accessible** — skip-to-content link, visible focus rings, and reduced-motion support.
- **Persistent cart** — the current order is saved to `localStorage` and restored on reload (optional, can be disabled).

## Tech stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- Framer Motion
- Lucide React
- Oxlint

## Project structure

```
src/
├── components/
│   ├── ui/          # Reusable UI kit (Button, Card, Badge, Price, Stepper, IconButton, SearchInput, FilterChip, ...)
│   ├── menu/        # Menu feature components (MenuItemCard, CategorySection, CategoryNavigation, MenuIntroHeader, MenuItemDetails, AddonSelector, MenuFilterBar, EmptyMenuState)
│   ├── order/       # Order feature components (OrderSummary, OrderItem, OrderTimer, PreparationStatus, OrderLineItemReadOnly)
│   └── layout/      # Layout shell and header (Layout, Header, FloatingCartButton, ToastProvider, ServiceRequestButton, ServiceRequestPanel, KioskFooter, KioskProvider, FullscreenExitNotice, AdminUnlockModal)
├── screens/         # Top-level screens (MenuScreen, DetailScreen, CartScreen, WaitingScreen)
├── lib/             # Pure helpers and hooks (calculations, formatters, useMenuFilters, useFullscreen, useKiosk, KioskContext)
├── data/            # Fallback menu.json used during development
├── types.ts         # Shared TypeScript interfaces
├── theme.css        # CSS variables for theming
└── index.css        # Tailwind entry + global base styles
```

## How to run

```bash
npm install
npm run dev      # start the Vite dev server
npm run build    # type-check and build for production
npm run preview  # preview the production build locally
```

## How to customize the menu

Edit `public/menu.json` (this is what the deployed app fetches). During development, if the fetch fails, the app falls back to `src/data/menu.json`.

Service-request actions are configured in `src/data/serviceRequests.json` and rendered by `ServiceRequestPanel`.

### Kiosk mode

The footer sits at the bottom of the page (not fixed) and offers a one-tap fullscreen toggle. Staff can open the admin unlock modal from the footer and enter the prototype PIN (`123123`) to exit fullscreen, reset the current order, or return to the menu setup.

> **Production note:** for a real deployment, complement this web-app kiosk mode with the device's operating-system kiosk lockdown (e.g. iPad Guided Access, Android Screen Pinning, Windows Assigned Access, or ChromeOS kiosk app mode). Browser fullscreen alone cannot block every system gesture or hardware button.

The JSON structure follows the `MenuData` type in `src/types.ts`:

```ts
{
  restaurant: { name, logo, description, welcomeText, subtitle, tagline },
  categories: [
    {
      id: string,
      name: string,
      items: [
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
      ]
    }
  ]
}
```

## How to re-skin for another venue

Edit the CSS variables in `src/theme.css`. Changing `--color-primary`, `--color-accent`, `--font-sans`, `--font-heading`, `--radius-*` and `--shadow-*` is usually enough to give the app a new look.

## Deployment

The project is deployed automatically to GitHub Pages via the workflow in `.github/workflows/deploy.yml`. On every push to `main` the pipeline installs dependencies, runs the linter, builds the project, and publishes the `dist/` folder.
