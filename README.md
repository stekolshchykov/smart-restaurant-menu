# The Golden Nugget — Digital Menu

A responsive, themeable digital restaurant menu prototype built with React, TypeScript and Vite.

**Live demo:** https://stekolshchykov.github.io/smart-restaurant-menu/

## Features

- **Menu from JSON** — categories, dishes, ingredients, allergens, tags, add-ons, chef notes, pairings, related dishes and badges are driven by a single JSON file.
- **Search & dietary filters** — search by dish name or ingredient, and filter by spicy, vegetarian, vegan and gluten-free.
- **Dish detail with add-ons** — tap any dish to see details, choose extras, read the chef's note, see recommended pairings and related dishes, and add the configured item to the cart.
- **Quick-add** — hover or focus any dish card to add it to the cart in one tap; dishes with required add-ons open detail first.
- **Toast feedback** — subtle confirmation appears after quick-add actions.
- **Cart** — review selected items, remove lines and see a running total.
- **Premium waiting screen** — after placing an order, see a large circular countdown, live preparation status, order number, and a polished summary of ordered dishes with add-ons and total.
- **Service requests** — a floating Service button on every main screen opens quick actions (call waiter, water, napkins, cutlery, bill, help) with elegant toast feedback.
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
│   ├── menu/        # Menu feature components (MenuItemCard, CategorySection, CategoryNavigation, MenuItemDetails, AddonSelector, MenuFilterBar)
│   ├── order/       # Order feature components (OrderSummary, OrderItem, OrderTimer, PreparationStatus, OrderLineItemReadOnly)
│   └── layout/      # Layout shell and header (Layout, Header, MenuHeader, FloatingCartButton, ToastProvider, ServiceRequestButton, ServiceRequestPanel)
├── screens/         # Top-level screens (MenuScreen, DetailScreen, CartScreen, WaitingScreen)
├── lib/             # Pure helpers and hooks (calculations, formatters, useMenuFilters)
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

The JSON structure follows the `MenuData` type in `src/types.ts`:

```ts
{
  restaurant: { name, logo, description, welcomeText, subtitle },
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
