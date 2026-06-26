# The Golden Nugget — Digital Menu

A responsive, themeable digital restaurant menu prototype built with React, TypeScript and Vite.

## Features

- **Menu from JSON** — categories, dishes, ingredients, allergens, tags and add-ons are driven by a single JSON file.
- **Dish detail with add-ons** — tap any dish to see details, choose extras and add the configured item to the cart.
- **Cart** — review selected items, remove lines and see a running total.
- **Order timer** — after placing an order, the waiting screen shows a live countdown until the estimated ready time.
- **Responsive** — optimised for phone, tablet and desktop viewports.
- **Themeable** — colours, fonts, shadows and radii are controlled by CSS variables for easy re-skinning.
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
│   ├── ui/          # Reusable UI kit (Button, Card, Badge, Price, QuantitySelector, IconButton)
│   ├── menu/        # Menu feature components (MenuItemCard, CategorySection, CategoryNavigation, MenuItemDetails, AddonSelector)
│   ├── order/       # Order feature components (OrderSummary, OrderItem, OrderTimer)
│   └── layout/      # Layout shell and header (Layout, Header)
├── screens/         # Top-level screens (MenuScreen, DetailScreen, CartScreen, WaitingScreen)
├── lib/             # Pure helpers (calculations, formatters)
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
          tags, isSpicy, isVegetarian, isVegan, isGlutenFree
        }
      ]
    }
  ]
}
```

## How to re-skin for another venue

Edit the CSS variables in `src/theme.css`. Changing `--color-primary`, `--color-accent`, `--font-sans`, `--font-heading`, `--radius-*` and `--shadow-*` is usually enough to give the app a new look. Dark-mode colours are defined in the same file under `prefers-color-scheme: dark`.

## Screenshots

UI screenshots for desktop and iPad are available in `.kimi/output/screenshots/`.
