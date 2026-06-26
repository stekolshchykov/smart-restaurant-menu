# Project PRD — Digital Menu for Tablet

## Vision
Build a polished, presentation-ready digital restaurant menu prototype that feels like a premium in-venue kiosk experience — not an e-commerce site. Every screen, card, button and transition must look appetising, expensive and intentional.

## Functional Requirements
1. **Home / Menu Screen**: restaurant hero, sticky category navigation, large appetising dish cards built from JSON.
2. **Dish Detail Screen**: full-screen presentation with large image, name, price, description, ingredients, allergens, optional add-ons, quantity selector, and "Add to Order".
3. **Cart / Order Screen**: clean list of selected items with add-ons, quantities, per-line prices, total, remove, back to menu, and "Place Order".
4. **Waiting Screen**: elegant order confirmation with order number, 10-minute countdown timer, ordered dishes, and navigation buttons.
5. **Data**: all menu content comes from a single local JSON file; easy to edit categories and dishes.
6. **Theming**: colour scheme, typography, radii and shadows configurable via CSS variables for quick re-skinning.
7. **Search & dietary filters**: guests can search by dish/ingredient and filter by spicy, vegetarian, vegan, and gluten-free.
8. **Accessibility**: skip-to-content link, visible focus rings, and reduced-motion support throughout the UI Kit.

## Non-Functional Requirements
- Target device: tablet (landscape and portrait), but must also work on desktop and mobile.
- Touch-first UI: large buttons, cards, and spacing.
- Smooth, fast animations; no jank.
- Strict component architecture: Pages → Components → UI Kit.
- No backend, no real payment, no auth.
- Optional localStorage persistence for the cart.

## Architecture Decisions
- **Stack**: React 19 + TypeScript + Vite + Tailwind CSS v4 + Framer Motion + Lucide React.
- **State**: local React state in `App.tsx`; `localStorage` optional.
- **Component layers**:
  - `src/screens/` — top-level pages, no direct styling/logic beyond wiring.
  - `src/components/` — feature components composed from UI Kit.
  - `src/components/ui/` — UI Kit primitives: `Button`, `Card`, `Image`, `Badge`, `Price`, `Counter`, `Checkbox`, `Modal`, `Section`, `Stack`, `Text`, `Heading`, `Surface`, `IconButton`, `Layout` primitives.
- **Styling**: Tailwind with CSS custom properties in `src/theme.css`; no hard-coded values in components.
- **Images**: unique, relevant, high-quality food photography per dish; sourced from Unsplash/Pexels/TheMealDB direct URLs.
- **Menu source**: `public/menu.json` loaded at runtime with `src/data/menu.json` fallback.

## Constraints
- No real backend, payment, auth, printing, or kitchen integration.
- Must run offline after initial load (static build).
- Keep files under 300 lines.
- All non-source artifacts go into `.kimi/tmp/` or `.kimi/output/`.
- No inline one-off elements inside screens; everything must be a reusable component or UI Kit primitive.

## Current Focus
Complete the discoverability and accessibility pass: inline search, dietary filter chips, reduced-motion support, keyboard/screen-reader affordances, and updated documentation.

## Decisions Log
- 2026-06-26: Chose React + Vite + Tailwind for fast prototyping and easy theming. Rationale: widely known, no build complexity, CSS variables enable quick re-skinning for other venues.
- 2026-06-26: Decided to generate menu data from real venue research plus realistic Irish-pub dishes because the live website does not expose a structured menu. Rationale: prototype needs complete, believable data.
- 2026-06-26: Switched to a stricter Pages → Components → UI Kit architecture and premium visual direction. Rationale: user needs a presentation-ready prototype, not a generic e-commerce template; isolating UI Kit enables rapid re-skinning and consistent quality.
- 2026-06-26: Added inline search and dietary filter chips rather than a full-screen search overlay or sidebar filters. Rationale: keeps category context visible, works across mobile/tablet/desktop, and reuses existing sticky category nav pattern.
- 2026-06-26: Centralised filter logic in `src/lib/useMenuFilters.ts`. Rationale: keeps `MenuScreen` focused on wiring and makes the filtering algorithm testable and reusable.
- 2026-06-26: Added `prefers-reduced-motion` support to all motion primitives via Framer Motion's `useReducedMotion()`. Rationale: inclusive kiosk/tablet experience; avoids vestibular discomfort while preserving functionality.
