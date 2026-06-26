# Project PRD — Digital Menu for Tablet

## Vision
Build a polished, presentation-ready digital restaurant menu prototype that feels like a premium in-venue kiosk experience — not an e-commerce site. Every screen, card, button and transition must look appetising, expensive and intentional.

## Functional Requirements
1. **Home / Menu Screen**: compact centered menu intro (logo, restaurant name, short tagline, table number), no fixed chrome on top, sticky category navigation, large appetising dish cards built from JSON.
2. **Dish Cards**: each card shows image, name, price, short description, dietary tags and, on hover/focus, a quick-add button that adds the dish to the order in one tap.
3. **Dish Detail Screen**: two-column presentation with a focused visual panel on the left (large main image + thumbnail gallery for switching views, no navigation CTAs) and an information/order panel on the right containing name, price, description, chef's note, dietary/allergen info, ingredients, optional add-ons, quantity selector and "Add to Order".
4. **Cart / Order Screen**: clean list of selected items with add-ons, quantities, per-line prices, total, remove, back to menu, and "Place Order".
5. **Waiting Screen**: premium full-screen confirmation with animated success mark, order-number badge, large circular countdown timer as the visual centerpiece, live preparation stepper, receipt-style order summary card showing items, add-ons, quantities and total, a "Need anything else?" service block, and back-to-menu / start-new-order actions.
6. **Service Requests**: a floating Service button available on every main screen opens a panel of quick actions (call waiter, water, napkins, cutlery, bill, help) with toast feedback and a temporary "Requested" state.
7. **Data**: all menu content comes from a single local JSON file; easy to edit categories and dishes.
8. **Theming**: colour scheme, typography, radii and shadows configurable via CSS variables for quick re-skinning.
9. **Search & dietary filters**: guests can search by dish/ingredient and filter by spicy, vegetarian, vegan, and gluten-free.
10. **Premium empty state**: when filters or search yield no results, guests see a polished `EmptyMenuState` block with category suggestions, reset filters, and show-all actions instead of a bare "not found" message.
11. **Toast feedback**: subtle confirmation toasts appear after quick-add and service-request actions.
12. **Accessibility**: skip-to-content link, visible focus rings, and reduced-motion support throughout the UI Kit.
13. **Kiosk / tablet mode**: a regular footer at the bottom of the page with a fullscreen toggle and an admin unlock modal (PIN `123123`) so staff can exit fullscreen or reset the order; a graceful notice appears if a guest leaves fullscreen via a system gesture.
14. **Cart**: a floating bottom cart bar appears only when items are in the order; the header is minimal and never turns the top of the menu into an e-commerce interface.

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
Refine the menu presentation so the top of the page feels like a real restaurant menu: replace the fixed header and bar-style menu header with a compact centered `MenuIntroHeader`, make the `Header` a minimal navigation bar used only on detail/cart/waiting screens, convert `KioskFooter` into a regular footer at the bottom of the page, and keep the cart as a floating bottom bar that appears only when needed. Update documentation and verify lint, build, and the live GitHub Pages deployment.

> **Production note:** real restaurant tablets should use the device's operating-system kiosk lockdown (iPad Guided Access, Android Screen Pinning, Windows Assigned Access, ChromeOS kiosk app mode) in addition to the web-app fullscreen mode.

## Decisions Log
- 2026-06-26: Chose React + Vite + Tailwind for fast prototyping and easy theming. Rationale: widely known, no build complexity, CSS variables enable quick re-skinning for other venues.
- 2026-06-26: Decided to generate menu data from real venue research plus realistic Irish-pub dishes because the live website does not expose a structured menu. Rationale: prototype needs complete, believable data.
- 2026-06-26: Switched to a stricter Pages → Components → UI Kit architecture and premium visual direction. Rationale: user needs a presentation-ready prototype, not a generic e-commerce template; isolating UI Kit enables rapid re-skinning and consistent quality.
- 2026-06-26: Added inline search and dietary filter chips rather than a full-screen search overlay or sidebar filters. Rationale: keeps category context visible, works across mobile/tablet/desktop, and reuses existing sticky category nav pattern.
- 2026-06-26: Centralised filter logic in `src/lib/useMenuFilters.ts`. Rationale: keeps `MenuScreen` focused on wiring and makes the filtering algorithm testable and reusable.
- 2026-06-26: Added `prefers-reduced-motion` support to all motion primitives via Framer Motion's `useReducedMotion()`. Rationale: inclusive kiosk/tablet experience; avoids vestibular discomfort while preserving functionality.
- 2026-06-26: Replaced the tall landing-page hero with a compact `MenuHeader` to focus on browsing dishes. Rationale: a real menu should get guests to food faster, not feel like a marketing page.
- 2026-06-26: Added quick-add button on dish cards plus toast confirmation. Rationale: regulars and tablet users can order fast without opening the detail screen.
- 2026-06-26: Expanded dish detail with chef notes, "Perfect with" pairings, related dishes, featured badges and card badges. Rationale: increases appetite appeal and helps guests discover combinations.
- 2026-06-26: Added a global floating Service button connected at `Layout` level with a `ServiceRequestPanel` for quick in-venue requests. Rationale: tablets in a restaurant must let guests call for help without leaving the current screen.
- 2026-06-26: Redesigned the Waiting screen with a large circular timer, preparation-status stepper, elevated order-summary card and refined typography. Rationale: the post-order moment should reassure guests and feel as premium as the rest of the experience.
- 2026-06-26: Replaced the bare filtered-empty state with a reusable `EmptyMenuState` component that offers category shortcuts and reset/show-all actions. Rationale: empty states are still part of the restaurant experience and should guide guests back to food, not feel like errors.
- 2026-06-26: Added a kiosk/tablet mode layer (`KioskFooter`, `useFullscreen`, `KioskProvider`, `AdminUnlockModal`, `FullscreenExitNotice`) and a reusable `TextInput` UI Kit primitive. Rationale: a real in-venue tablet needs fullscreen lockdown cues and a staff override, while keeping the web-app honest about what it cannot block (system gestures, hardware buttons).
- 2026-06-26: Replaced the bar-style `MenuHeader` and prominent fixed `Header` with a compact centered `MenuIntroHeader` and a minimal navigation `Header` used only on detail/cart/waiting screens. Converted `KioskFooter` from a fixed bar to a regular footer. Rationale: a digital restaurant menu should read like a real menu, not a landing page or online shop; the chrome must stay out of the guest's way.
