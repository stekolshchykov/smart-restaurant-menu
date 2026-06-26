# Agent Instructions — Digital Menu

## Coding conventions

- **TypeScript**: strict mode enabled; explicit types for props and shared data shapes. Shared types live in `src/types.ts`.
- **React**: functional components with hooks. Keep components focused; extract helpers to `src/lib/`.
- **Imports**: use `.tsx` / `.ts` extensions explicitly so Vite resolves files consistently.
- **Formatting**: 2-space indentation, single quotes, no semicolons in JSX.

## Component architecture (strict hierarchy)

```
Pages        →  src/screens/*        wire screens together, hold routing state
Components   →  src/components/*     feature components built exclusively from UI Kit
UI Kit       →  src/components/ui/*  low-level reusable primitives, no business logic
```

### UI Kit (`src/components/ui/`)

Generic primitives. They must not import menu/order types or know about application state.

- `Button`, `IconButton`
- `Card`, `Surface`
- `Image` — responsive image wrapper with aspect ratio, object-fit, placeholder/fallback, hover zoom, priority/fetchpriority
- `Badge`
- `Price`
- `Counter` — quantity stepper
- `Checkbox` / `Toggle` — for add-ons and binary choices
- `Section` — section wrapper with consistent vertical rhythm
- `Stack`, `Flex`, `Container` — layout primitives
- `Text`, `Heading` — typography primitives
- `Modal` / `Sheet` — overlay containers
- `Divider`
- `SearchInput` — accessible search field with clear button
- `FilterChip` — toggle pill for binary filters (dietary tags, etc.)
- `VisuallyHidden` — screen-reader-only text
- `SkipToContent` — focusable skip link

### Feature components (`src/components/menu/`, `src/components/order/`, `src/components/layout/`)

Built only from UI Kit primitives and shared types. They receive data via props and emit events.

- `MenuItemCard`, `CategorySection`, `CategoryNavigation`, `MenuItemDetails`, `AddonSelector`
- `MenuFilterBar`, `FilteredEmptyState`
- `OrderSummary`, `OrderItem`, `OrderTimer`, `FloatingCartButton`
- `Layout`, `Header`, `Hero`, `LoadingScreen`

### Screens (`src/screens/`)

Top-level views. They import feature components and wire them to `App.tsx` handlers. No inline styles, no one-off markup.

## State management

- Global app state lives in **`App.tsx`**.
- `App.tsx` owns: `screen`, `selectedItem`, `order`, `orderNumber`, `menu`, `loading`.
- `localStorage` persistence for the cart is implemented in `App.tsx` (`CART_KEY = 'digital-menu-cart'`). Remove the `useEffect` to disable.
- Feature components should remain stateless; local UI state (quantity, selected add-ons) lives in the screen or controlled component.
- Reusable derived-state logic belongs in **`src/lib/`** hooks (e.g., `useMenuFilters.ts`).

## Styling

- Use **Tailwind CSS v4** utility classes.
- Reference tokens from `src/theme.css` via CSS variables:
  - `bg-[var(--color-primary)]`
  - `text-[var(--color-text-secondary)]`
  - `rounded-[var(--radius-md)]`
- **No hard-coded hex values, spacing, shadows or radii in components.** Add tokens to `theme.css` instead.
- Global base styles and Tailwind import live in `src/index.css`.

## Accessibility

- Every interactive element must have a visible `focus-visible` ring using `--color-focus-ring`.
- Provide `aria-label`, `aria-pressed`, `aria-selected`, and `aria-live` attributes where appropriate.
- Use `VisuallyHidden` for supplementary screen-reader labels; use `SkipToContent` as the first focusable element on every page.
- Respect `prefers-reduced-motion` in every motion primitive via Framer Motion's `useReducedMotion()`.

## Adding a new screen

1. Create `src/screens/<Name>Screen.tsx` using existing feature components.
2. Add screen name to `Screen` union in `src/types.ts`.
3. Import screen in `src/App.tsx` and add an `AnimatePresence` branch.

## Adding a new component

1. Decide layer: `ui/`, `menu/`, `order/` or `layout/`.
2. For UI Kit: use only primitives and React/Tailwind; no domain types.
3. For feature components: compose from UI Kit; typed props interface; named export.
4. Keep files under 200 lines; extract sub-components if needed.

## Images

- Every dish must have a unique, relevant, high-quality image.
- Prefer direct Unsplash photo URLs (`https://images.unsplash.com/photo-<ID>?w=800&h=600&fit=crop`) or Pexels/TheMealDB direct URLs.
- Images are declared in `public/menu.json` (deploy source) and `src/data/menu.json` (fallback).
- Use the `Image` UI Kit primitive for consistent aspect ratios, hover effects and fallbacks.

## Testing / verification

Run before finishing:

```bash
npm run lint     # oxlint
npm run build    # type-check + production build
npm run preview  # smoke-test the built app
```

Manual verification flow:

1. Load the menu — all images unique and relevant.
2. Search for a dish or ingredient; verify results update and clear search works.
3. Toggle dietary filter chips; verify matching items remain and empty categories dim.
4. Tap a dish — detail view looks like a premium presentation.
5. Select add-ons/quantity, add to cart.
6. Open cart, remove item if desired, place order.
7. Waiting screen shows order number and live timer.
8. Enable OS reduced-motion setting and confirm animations are suppressed.
9. Tab through the page and confirm the skip-to-content link and focus rings are visible.
