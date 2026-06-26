# Project PRD — Digital Menu SaaS

## Vision

Превратить существующий премиальный прототип цифрового меню в полноценный SaaS-сервис для заведений. Продукт продаётся владельцам как «меню, которое выглядит как ваше заведение, а не как интернет-магазин», и даёт гостям no-app mobile/tablet flow с возможностью выбрать степень цифровизации: promo only, menu only, menu + service, menu + order.

## Product surfaces

1. **Public marketing site** — продаёт сервис владельцам.
2. **Admin panel** — SaaS-кабинет для создания проекта, меню, столов, ссылок/QR и публикации.
3. **Customer-facing venue site** — публичный branded-интерфейс заведения:
   - `/venue/:slug` — promo page
   - `/venue/:slug/menu` — общее меню без стола
   - `/table/:token` — table-specific меню и заказ
   - `/order/:token` — публичный экран статуса заказа

## Core product constants (from existing prototype)

- Ощущение «настоящего ресторанного меню».
- Компактный верхний блок с логотипом, категории, карточки блюд.
- Quick add, детальная карточка блюда, галерея, ингредиенты, аллергены, добавки.
- Корзина, экран ожидания заказа, service requests.
- Fullscreen/kiosk mode, адаптивность, premium UI.
- Accessibility: skip-to-content, focus-visible, reduced motion, live regions.

## Roles

- **Owner** — управляет проектом, доменом/публикацией/тарифом и доступами.
- **Admin/Manager** — настраивает меню, столики, ссылки, публикацию.
- **Editor** — редактирует контент меню, не меняет критичные настройки и доступы.

## Project lifecycle

Создание проекта → базовая информация о заведении → визуальный стиль и логотип → создание/импорт меню → добавление столиков → генерация ссылок и QR → preview → publish.

## Publication modes

- **Promo only** — только витрина заведения.
- **Menu only** — цифровое меню без корзины и заказа.
- **Menu + service** — меню + запрос официанта/воды/салфеток/счёта.
- **Menu + order** — меню с корзиной и оформлением заказа.

## MVP scope

- Регистрация и вход.
- Профиль пользователя.
- Создание проекта-заведения (slug, тип, описание, язык, валюта, режим).
- Бренд-настройки проекта (логотип, hero, appearance, акцент, стиль карточек/кнопок, фото по умолчанию, promo page toggle).
- Создание категорий, блюд, модификаторов, аллергенов, тегов и фото.
- Quick add + detail logic (обязательные модификаторы ведут в detail).
- Создание столиков вручную и массово.
- Генерация ссылок и QR-кодов (printable PDF-layout).
- Promo page.
- Table menu (mobile/tablet/kiosk).
- Корзина и оформление заказа.
- Waiting screen со статусами.
- Service requests с подтверждением и cooldown.
- Preview + draft/publish.
- Базовые empty states, ошибки и onboarding-checklist.

## Out of MVP (next phase)

- Онлайн-оплата и split bill.
- Многоязычность UI для гостей.
- Несколько меню по тайм-слотам/дням недели.
- Multi-location workspace.
- Расширенная аналитика.
- Отзывы/гости/CRM.
- Тонкие role permissions.
- Кастомные домены.
- Сезонные specials.
- Waiter app.
- Внешние интеграции.
- NFC-метки.

## Architecture (target)

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS v4 + Framer Motion.
  - `apps/marketing` — marketing site.
  - `apps/admin` — admin panel SPA.
  - `apps/venue` — customer-facing venue SPA (evolution of existing prototype).
- **Backend**: Node.js + Fastify + TypeScript + Prisma + PostgreSQL.
  - REST API.
  - Session-based auth (Lucia-style secure cookies) или JWT + httpOnly refresh.
- **Shared packages**:
  - `packages/ui` — UI Kit.
  - `packages/types` — shared TypeScript contracts.
  - `packages/api-client` — typed API client.
- **Infrastructure**: Docker Compose для local/dev, деплой на VPS.

## Data model (MVP)

- `User`
- `Project` (slug, name, type, description, locale, currency, mode, theme, publication status)
- `ProjectTheme`
- `ProjectPublication` (draft vs published version)
- `Category`
- `MenuItem` (with availability, quick add eligibility, images, ingredients, allergens, tags)
- `ModifierGroup` + `ModifierOption`
- `Allergen`
- `Tag`
- `Table` + `TableLink` (public token)
- `CartSession`
- `Order` + `OrderItem`
- `ServiceRequest`

## Routes

**Marketing site**
- `/`, `/product`, `/solutions/cafe`, `/solutions/restaurant`, `/solutions/bar`, `/demo`, `/login`, `/register`, `/faq`

**Admin panel**
- `/app`, `/app/projects`, `/app/projects/new`, `/app/projects/:projectId`, `/app/projects/:projectId/menu`, `/app/projects/:projectId/tables`, `/app/projects/:projectId/publish`, `/app/projects/:projectId/settings`, `/app/profile`

**Public venue**
- `/venue/:slug`
- `/venue/:slug/menu`
- `/table/:token`
- `/order/:token`

## UI Kit principles

- Refined hospitality interface.
- Контрастная типографика, много воздуха, крупные фото, спокойная палитра.
- Карточки блюд: opacity + translateY 8–12px.
- Detail sheet: от нижней границы.
- Cart bar: снизу.
- Motion timings:
  - Fast interaction: 120–160ms
  - Standard state change: 180–240ms
  - Panel/sheet: 240–320ms
  - Hero/promo transitions: 300–400ms
- `prefers-reduced-motion`: заменять движение на fade.

## Accessibility & performance

- Touch targets минимум 24×24, ключевые контролы ближе к 44×44.
- Focus-visible обязателен.
- Динамические статусы через ARIA live regions.
- Critical public screens ориентированы на хорошие Core Web Vitals.
- First-load table menu: skeleton, лёгкий первый экран.

## Privacy

- Гостю не нужен аккаунт.
- Table flow использует session + table token + order token.
- Data minimisation: собираем только необходимое для сценария.

## Known constraints

- Нет реальной онлайн-оплаты в MVP.
- Нет real-time кухонного статуса; waiting screen показывает stage-based статусы.
- MVP single-location; multi-location — next phase.

## Current state

- Существующий прототип (`/Users/mk/Documents/Personal/Code/digital-menu`) реализован как static React app на Vite.
- В ветке `dev` есть незакоммиченные правки UI/UX аудита.
- Задача: трансформировать прототип в SaaS-фундамент, сохранив customer-facing UI и постепенно добавляя backend, admin и marketing surface.
