# UI/UX Audit Report — The Golden Nugget Digital Menu

**Project:** `/Users/mk/Documents/Personal/Code/digital-menu`  
**Date:** 2026-06-26  
**Auditors:** UI Designer, UX Researcher, Product Designer, Accessibility Expert (multi-agent mode)  
**Live build:** `http://localhost:5173/`  
**Screenshots:** `screenshots/audit/`

---

## 1. Methodology

1. **Parallel specialist review.** Four independent agents inspected the codebase and the running app from the perspective of UI design, UX research, product/conversion, and accessibility.
2. **Cross-verification.** Every issue in this report was reproduced in code, in the rendered UI, or by automated contrast calculation. Issues that turned out to be intentional design decisions (e.g., dark-only theme, menu screen without a top header) were not included.
3. **Impact scoring.** Each recommendation is rated by expected product impact (`High / Medium / Low`) and implementation complexity (`Easy / Medium / Hard`).
4. **Sorting.** The TOP-50 list is ordered by impact first; within the same impact level, lower-effort wins are placed earlier.

---

## 2. Verified findings at a glance

| Dimension | Key problems found |
|-----------|-------------------|
| **Visual design** | Addon text is invisible on the cream surface; gold-on-cream price contrast fails WCAG; `--spacing-20` is undefined; `Surface inverse` is semantically misleading; category headings compete with the page title. |
| **UX** | "Add to order" instantly returns to menu with no toast; no quantity editing or merging in cart; "Place Order" has no confirmation; floating cart is hidden on detail; detail deep-link is lost on refresh. |
| **Accessibility** | Toasts are not live regions; page transitions ignore reduced motion; modals lack focus trap / `Esc`; category tablist lacks arrow keys; no `h1` on cart/waiting. |
| **Product / conversion** | Generic/repeated `chefNote` copy and odd `perfectWith` pairings; no reviews, social proof, allergy disclaimer, or payment/kitchen reassurance; missing favorites, recent orders, and cart upsells. |

---

## 3. TOP-50 improvements

| # | Problem | Location | Why it is a problem | Proposed solution | User effect | Impact | Effort |
|---|---------|----------|---------------------|-------------------|-------------|--------|--------|
| 1 | **Addon names and descriptions are invisible on the detail page** | `src/components/menu/AddonSelector.tsx:43-55` (inside `MenuItemDetails.tsx:120`) | `Text` components render with canvas colors (`#f5f1ea`) on a cream surface (`#fdfbf7`), giving a contrast ratio of ~1.09:1. The stepper value also uses `onSurface={false}` (`AddonSelector.tsx:65`), making quantities unreadable. | Pass an `onSurface` prop through `AddonSelector` and apply it to every `Text`, `Price`, and `Stepper` node inside it. | Guests can actually read and choose extras. | High | Easy |
| 2 | **Price contrast on light cards fails WCAG** | `src/components/ui/Price.tsx:19`; used in `MenuItemCard.tsx:64`, `MenuItemDetails.tsx:71`, `OrderSummary.tsx`, `OrderItem.tsx:68` | Gold `#c9a227` on cream `#fdfbf7` is 2.34:1, below the 4.5:1 AA threshold for normal text and the 3:1 threshold for large text. | Introduce an `onSurface` mode for `Price` that uses `--color-heading-on-surface` on light backgrounds, keeping gold only for dark canvases. | Prices become readable for everyone, including low-vision guests and bright screens. | High | Easy |
| 3 | **No confirmation before placing an order** | `src/App.tsx:172-177`; `src/components/order/OrderSummary.tsx:130-137` | A single accidental tap commits the order. There is no review of total, table number, or estimated wait time. | Add a full-screen or bottom-sheet confirmation step: show items, total, table, estimated wait, and "Confirm & send to kitchen". | Reduces order anxiety and mis-taps; increases trust. | High | Medium |
| 4 | **"Add to order" from detail gives no feedback and dumps the user back to the menu** | `src/App.tsx:137` (`setScreen('menu')`); `src/screens/MenuScreen.tsx:127-132` (toast only for quick-add) | Guests customizing a dish are abruptly returned to the menu with no confirmation that the item was added. | Show a toast from `addToOrder` and either stay on detail with an option to "Continue browsing" / "View cart", or animate the floating cart. | Guests feel in control and know the action succeeded. | High | Easy |
| 5 | **Cart has no quantity editing and creates duplicate line items** | `src/components/order/OrderItem.tsx:72-80`; `src/App.tsx:132-136` | Changing quantity requires removing and re-adding; identical items are appended as new rows, making the cart hard to scan. | Add +/- steppers in `OrderItem` and merge identical `menuItemId + addons` rows in `App.tsx` by incrementing quantity. | Faster cart management and clearer order review. | High | Medium |
| 6 | **Service and admin modals lack focus trap and Escape-to-close** | `src/components/layout/ServiceRequestPanel.tsx:46-48`; `src/components/layout/AdminUnlockModal.tsx:78` | Keyboard users can tab out of the modal into the dimmed background, and `Esc` does nothing. WCAG 2.4.3 / 1.4.13 failure. | Implement focus trapping and close on `Esc` for both dialogs; return focus to trigger on close. | Accessible, predictable modal behavior. | High | Medium |
| 7 | **Menu content is generic and undermines trust** | `public/menu.json` lines 1643, 1787, 2109, 2176, 2266, 2403; dessert `perfectWith` pairings (e.g., Coca-Cola with desserts) | Repeated `chefNote` phrases and mismatched "perfect with" suggestions make the restaurant feel templated rather than crafted. | Rewrite `chefNote`/`description` copy per dish, remove odd drink pairings from desserts, and add category-appropriate recommendations. | Guests perceive care and culinary credibility. | High | Easy |
| 8 | **No order-level customization / note field** | `src/types.ts:66-73` (`OrderLineItem` has no `note`); detail/cart UI lacks input | Guests cannot request "no onions", "well done", "sauce on the side" — a basic expectation in restaurants. | Add an optional `note` field to `OrderLineItem` and expose a "Special requests" textarea on detail and cart. | Reduces back-and-forth with staff and order errors. | High | Medium |
| 9 | **Floating cart button is hidden on the detail screen** | `src/App.tsx:248` | A guest customizing an item loses cart context and must go back to the menu to review the cart. | Remove `screen === 'detail'` from the hidden logic (or add a header cart icon on detail). | One-tap access to cart from any screen. | High | Easy |
| 10 | **Page transitions ignore reduced-motion preference** | `src/App.tsx:36-41` | The horizontal slide always plays, even for guests who prefer reduced motion. | Wrap `pageTransition` with `useReducedMotion()` and disable `x` offsets when preferred. | Prevents vestibular discomfort. | High | Easy |
| 11 | **Toasts are not announced to screen readers** | `src/components/layout/ToastProvider.tsx:33` | The toast container has no `role="status"` / `aria-live`, so dynamic feedback is silent to assistive tech. | Add `role="status" aria-live="polite" aria-atomic="true"` to the toast region. | All guests receive timely feedback. | High | Easy |
| 12 | **No favorites, recent orders, or persistent dietary filters** | `src/App.tsx` state; `src/lib/useMenuFilters.ts:47-48` | The app resets on every session, missing retention and repeat-order velocity. | Persist favorites, last N orders, and active filters to `localStorage`; add a "Order again" shortcut. | Returning guests order faster and feel recognized. | High | Medium |
| 13 | **Cart misses upsell opportunities** | `src/components/order/OrderSummary.tsx:91-139` | The cart only lists selected items; `perfectWith` data is unused at the conversion point. | Show a "Goes great with" section in the cart using `perfectWith` or category rules (drinks with mains, desserts after mains). | Increases average order value. | High | Medium |
| 14 | **No trust signals: reviews, ratings, popularity, staff story** | `src/components/menu/MenuItemCard.tsx`; `src/components/menu/MenuItemDetails.tsx`; `MenuIntroHeader.tsx` | 92% of diners read reviews; the current UI has only a handful of static `badges`. | Add static ratings, "Guest favourite" / "Served today" counters, and a short brand/staff note in the intro. | Builds confidence and guides choice. | High | Medium |
| 15 | **No estimated preparation time per dish** | `src/types.ts:7-28`; card/detail UI | Guests cannot judge whether to order drinks first or how long a dish takes. | Add a `prepTimeMinutes` field and display it on cards and detail. | Helps planning and reduces perceived wait anxiety. | High | Medium |
| 16 | **No allergy/safety disclaimer** | `src/components/menu/MenuItemDetails.tsx:101-113` | Allergens are listed, but there is no legal/safety note to inform staff of severe allergies. | Add a small disclaimer line: "Please inform your server of any allergies." | Increases safety and trust. | High | Easy |
| 17 | **No payment or kitchen-submission reassurance** | `src/screens/CartScreen.tsx`; `src/components/order/OrderSummary.tsx` | After "Place Order" the app shows a local timer, but guests don't know if the order reached the kitchen or how payment works. | Add copy such as "Sent to the kitchen" and surface the table number; optionally show a payment option. | Removes uncertainty at the most critical conversion moment. | High | Medium |
| 18 | **Heading hierarchy has no `h1` on cart/waiting** | `src/components/layout/Header.tsx:37-43`; `src/screens/CartScreen.tsx:21` | The page title is rendered as `h2`; screen-reader users lose top-level orientation. | Make `Header` render `level={1}` for the current page title and adjust subsequent headings. | Better navigation for assistive tech. | Medium | Easy |
| 19 | **Category navigation uses `tablist` but has no arrow-key navigation** | `src/components/ui/ToggleGroup.tsx:28-59`; `src/components/menu/CategoryNavigation.tsx:24-35` | ARIA `role="tablist"` expects Left/Right/Home/End keys; only `Tab` works. | Implement arrow-key navigation or change roles to `radiogroup`/`radio`. | Predictable keyboard navigation. | Medium | Medium |
| 20 | **Image loading shows black pulse placeholders for too long** | `src/components/ui/Image.tsx:39`; `public/menu.json` | Below-fold images are lazy-loaded and appear as grey/black blocks on first view (visible in `screenshots/audit/desktop-menu.png`). | Eager-load the first 6-8 images and use a blur-up / dominant-color placeholder. | Faster perceived load and richer first impression. | Medium | Medium |
| 21 | **Undefined CSS variable breaks desktop cart layout** | `src/components/order/OrderSummary.tsx:49` (`var(--spacing-20)`); `src/theme.css` | `--spacing-20` does not exist, so the `max-height` declaration is invalid and the order list can overflow the viewport. | Define `--spacing-20` in `theme.css` or replace with a concrete value (e.g., `5rem`). | Correct scroll behavior in cart. | High | Easy |
| 22 | **`Surface inverse` does not actually invert the background** | `src/components/ui/Surface.tsx:16-23` | The prop only swaps the border color; the background stays cream, which is misleading and contributed to the addon contrast bug. | Make `inverse` render a dark surface (`--color-bg-elevated`) or rename the prop to `borderInverse`. | Clearer component API and correct contrast. | Medium | Medium |
| 23 | **Detail section headings compete with the dish name** | `src/components/menu/MenuItemDetails.tsx:88-103` | "Ingredients" / "Allergens" / "Extras" use the same serif `Heading` weight as the dish title, flattening hierarchy. | Use `Text variant="label"` for section labels or a smaller `Heading` variant. | Cleaner visual hierarchy. | Medium | Easy |
| 24 | **No celebration micro-moment after placing an order** | `src/screens/WaitingScreen.tsx` | The transition from cart to waiting is functional but emotionally flat. | Add a brief confetti burst, checkmark ripple, or haptic pulse on "Place Order". | Creates a delightful "wow" moment. | Medium | Medium |
| 25 | **No personalized greeting** | `src/components/menu/MenuIntroHeader.tsx:32-45` | The intro always shows the same static tagline. | Add a time-of-day greeting ("Good evening, table 07"). | Makes the experience feel personal and welcoming. | Low | Easy |
| 26 | **Empty states are functional but generic** | `src/components/menu/EmptyMenuState.tsx:27-173`; `src/components/ui/EmptyState.tsx` | Copy is robotic and misses a chance to guide the guest. | Rewrite with warmer tone, clearer next actions, and on-brand voice. | friendlier failure recovery. | Low | Easy |
| 27 | **No "Chef recommends" featured carousel** | `src/screens/MenuScreen.tsx:148-201` | `featured` and `badges` exist but are buried in the grid. | Add a horizontal "Chef recommends" strip at the top using featured dishes. | Helps indecisive guests and highlights premium items. | Medium | Medium |
| 28 | **Disabled buttons still show hover states** | `src/components/ui/Button.tsx:38-53`; `src/components/ui/IconButton.tsx:26-41`; `src/components/ui/FilterChip.tsx:30-34` | Hover styles are not prefixed with `disabled:`, so disabled controls react visually. | Add `disabled:` variants to hover utilities. | More polished, less confusing interactions. | Low | Easy |
| 29 | **Custom `Checkbox` lacks focus-visible ring** | `src/components/ui/Checkbox.tsx` | The focusable `div` has no visible focus indicator. | Add `focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)]`. | Keyboard users can see focused checkboxes. | Medium | Easy |
| 30 | **Skip-to-content link duplicates its label** | `src/components/ui/SkipToContent.tsx:17-18` | Visually hidden text plus an `aria-hidden` visible span can cause duplicate announcements in some browsers. | Use a single label, visually hidden until focused. | Cleaner screen-reader announcement. | Medium | Easy |
| 31 | **Menu cards have verbose accessible names** | `src/components/menu/MenuItemCard.tsx:33`; `src/components/ui/Card.tsx:29-33` | The whole card is a `role="button"` whose name is derived from all child text (heading + description + price + badges). | Add `aria-labelledby` pointing to the dish-name heading ID. | Faster, clearer screen-reader navigation. | Medium | Easy |
| 32 | **Search result count is not announced dynamically** | `src/components/menu/MenuFilterBar.tsx:76-78` | The count updates visually but is not a live region, so screen-reader users don't hear the change. | Add `aria-live="polite"` to the count container or link the search field to it via `aria-describedby`. | Inclusive filtering feedback. | Medium | Easy |
| 33 | **OrderTimer produces overlapping live-region announcements** | `src/components/order/OrderTimer.tsx:96,107` | Two `aria-live="polite"` regions can speak over each other every second. | Use a single visually hidden live region for status and keep the visible timer non-live. | Calmer screen-reader experience. | Medium | Easy |
| 34 | **Loading screen lacks `role="status"`** | `src/components/layout/LoadingScreen.tsx:9-14` | Good text content, but not exposed as a status region. | Add `role="status"` to the container. | Screen readers announce loading state. | Low | Easy |
| 35 | **`scroll-behavior: smooth` ignores reduced motion** | `src/index.css:13` | Smooth scrolling can cause vestibular issues. | Wrap `scroll-behavior: smooth` in `@media (prefers-reduced-motion: no-preference)`. | Respects motion preferences. | Low | Easy |
| 36 | **Back button `aria-label` is always "Back to menu"** | `src/components/layout/Header.tsx:27` | On cart or waiting screens the label is inaccurate. | Pass the previous screen name and label dynamically ("Back to menu", "Back to cart"). | Accurate screen-reader context. | Low | Easy |
| 37 | **Menu card images have redundant alt text** | `src/components/menu/MenuItemCard.tsx:37` | The image alt duplicates the card heading inside a button. | Use `alt=""` because the dish name is already a heading, or associate the image with the heading. | Less repetitive screen-reader output. | Low | Easy |
| 38 | **Detail screen is lost on refresh / deep-link** | `src/App.tsx:68` | If a user refreshes on `#/detail`, `selectedItem` is null and the app drops them back to menu. | Persist `selectedItem` alongside the order or resolve it from `menu` by id. | Working deep-links and refresh resilience. | Medium | Easy |
| 39 | **No explicit error UI if menu data fails to load** | `src/App.tsx:78-87`; `src/components/layout/LoadingScreen.tsx:9-15` | If both network fetch and bundled fallback fail, the spinner stays indefinitely. | Add an error state with a retry button. | Clear failure recovery. | Low | Easy |
| 40 | **Quick-add button is nested inside the card button** | `src/components/menu/MenuItemCard.tsx:33,54-56` | A button inside a button is invalid HTML and fragile for keyboard/pointer events. | Render the quick-add button outside the card or make the card itself the only action. | Robust, accessible cards. | Low | Medium |
| 41 | **Safe-area handling is inconsistent** | `src/components/layout/FloatingCartButton.tsx:36`; `src/components/layout/ServiceRequestButton.tsx:40`; `src/components/layout/FullscreenExitNotice.tsx:25` | These use `env(safe-area-inset-bottom)` directly while the rest of the app uses `--safe-area-bottom`. | Standardize on the theme variable everywhere. | Cleaner code, consistent spacing. | Low | Easy |
| 42 | **Duplicate bottom padding on waiting screen** | `src/screens/WaitingScreen.tsx:245` | The same safe-area + floating-chrome bottom padding is applied twice (also in `Layout.tsx:42-44`). | Remove the duplicate padding from `WaitingScreen`. | Correct spacing. | Low | Easy |
| 43 | **Desktop detail layout floats when content is short** | `src/components/menu/ProductDetailLayout.tsx`; `src/screens/DetailScreen.tsx` | The info panel can end with the CTA high on the screen, leaving a large dark void below. | Make the panel fill available height or center content vertically on desktop. | More balanced composition. | Medium | Medium |
| 44 | **`font-heading` utility is dead in Tailwind v4** | `src/components/ui/Heading.tsx:22-23`; `src/index.css:28-37` | The component uses `font-heading`, but the font only works because of a global `h1-h6` rule. | Add a Tailwind v4 font utility or remove the dead class and rely on explicit `font-family` tokens. | Predictable typography. | High | Easy |
| 45 | **Screenshots in `screenshots/` are out of sync with current UI** | `screenshots/desktop-menu-v3.png`, etc. | Existing screenshots show a light header and older layout that no longer exists. | Regenerate screenshots after the next design pass. | Accurate documentation and marketing assets. | Low | Medium |
| 46 | **No haptic or sound feedback on key actions** | `src/App.tsx`; `src/components/layout/ServiceRequestButton.tsx` | Mobile/tablet users get no tactile confirmation on add-to-order or service request. | Add subtle haptics (Vibration API) and optional tap sounds, respecting reduced-motion / mute. | More tactile, premium feel. | Medium | Medium |
| 47 | **No "Order again" shortcut from the waiting screen** | `src/screens/WaitingScreen.tsx:245-257` | After ordering, a guest who wants another round must start from scratch. | Add an "Add another round" button that returns to menu while keeping the current order visible. | Encourages additional orders. | Medium | Medium |
| 48 | **Badge default variant has low contrast on cards** | `src/components/ui/Badge.tsx:23`; `src/components/menu/SelectedAddonSummary.tsx:19-20` | Gold-on-gold-tint (`2.34:1` on cream) is hard to read. | Use darker text or higher-contrast backgrounds for badges on light surfaces. | Better readability of dietary/featured labels. | Medium | Easy |
| 49 | **No prep-time or "when to order" guidance in cart** | `src/components/order/OrderSummary.tsx` | Guests don't know which items take longer; they may order everything at once. | Surface per-dish prep time and suggest ordering drinks/starters first. | Smarter ordering flow. | Medium | Medium |
| 50 | **Category tabs become disabled without explanation** | `src/components/ui/ToggleGroup.tsx:40`; `src/components/menu/CategoryNavigation.tsx` | When filters are active, empty categories are disabled but users don't know why. | Add a tooltip or `aria-label` explaining "No dishes match the current filters". | Less confusion when filtering. | Low | Easy |

---

## 4. Consolidated recommendation

**Ship first (biggest UX/product lift for the least effort):**
1. Fix addon text visibility (`#1`).
2. Fix price contrast on light surfaces (`#2`).
3. Rewrite generic menu copy and remove odd pairings (`#7`).
4. Add a confirmation step before placing an order (`#3`).
5. Add feedback toast after "Add to order" from detail (`#4`).
6. Make toasts a live region and respect reduced motion (`#10`, `#11`).
7. Add quantity editing + merge duplicates in cart (`#5`).
8. Add focus trap / `Esc` to modals (`#6`).
9. Show floating cart on detail (`#9`).
10. Add allergy disclaimer and kitchen-submission reassurance (`#16`, `#17`).

These ten changes move the product from a polished prototype to a credible, accessible, restaurant-grade ordering experience.

---

## 5. Appendix: evidence files

- `src/theme.css` — design tokens causing contrast issues.
- `src/components/ui/Price.tsx`, `Text.tsx`, `Heading.tsx`, `Badge.tsx`, `Button.tsx`, `Surface.tsx`, `Card.tsx`, `Image.tsx`, `Stepper.tsx`, `FilterChip.tsx`, `ToggleGroup.tsx`, `Checkbox.tsx`, `Toast.tsx`.
- `src/components/menu/MenuItemCard.tsx`, `MenuItemDetails.tsx`, `AddonSelector.tsx`, `CategoryNavigation.tsx`, `MenuFilterBar.tsx`, `MenuIntroHeader.tsx`, `EmptyMenuState.tsx`.
- `src/components/order/OrderSummary.tsx`, `OrderItem.tsx`, `OrderTimer.tsx`.
- `src/components/layout/Header.tsx`, `Layout.tsx`, `FloatingCartButton.tsx`, `ServiceRequestButton.tsx`, `ServiceRequestPanel.tsx`, `AdminUnlockModal.tsx`, `ToastProvider.tsx`, `LoadingScreen.tsx`.
- `src/App.tsx`, `src/types.ts`, `src/lib/useMenuFilters.ts`, `src/lib/formatters.ts`.
- `public/menu.json`, `src/data/menu.json`, `src/data/serviceRequests.json`.
- `screenshots/audit/` — current UI captures used for visual verification.
