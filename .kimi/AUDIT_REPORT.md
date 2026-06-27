# Глубокий аудит Digital Menu SaaS

**Дата аудита:** 2026-06-27  
**Объект:** репозиторий `/Users/mk/Documents/Personal/Code/digital-menu`  
**Метод:** мультиагентный статический аудит + кросс-проверка критических путей ведущим аудитором  
**Основание:** PRD.md, AGENTS.md, кодовая база apps/api (Rust), apps/web (SvelteKit), packages/shared-types, packages/api-client, инфраструктура Docker/CI/CD.

---

## 1. Executive Summary

Проект находится на стадии **MVP, неготового к production**. Архитектурно выбран стек корректен (SvelteKit 5 Runes + Rust axum/sqlx + PostgreSQL), базовые CRUD, ownership-проверки и миграции сделаны аккуратно, но в критических местах присутствуют **логические дыры, нарушения безопасности и расхождения с PRD**, которые при реальном запуске приведут к финансовым потерям, компрометации аккаунтов и плохому UX.

| Уровень риска | Количество | Главные классы проблем |
|---------------|------------|------------------------|
| **CRITICAL**  | 5          | Хранение access token в localStorage; публичные transactional endpoint'ы игнорируют режим публикации; race condition в корзине; отсутствие server-side защиты админки; mismatch API-контрактов, ведущий к runtime-ошибкам. |
| **HIGH**      | 10         | Rate limiter доверяет client-side IP; не ревалидируется корзина при оформлении заказа; refresh flow не используется; cookie Secure зависит от APP_ENV; слабая валидация JWT_SECRET; публикация обходит readiness checklist; quick add не блокирует обязательные модификаторы; CSP/картинки из любого источника; отсутствие RBAC/ролей; публичные загрузки без авторизации; PostgreSQL порт выставлен наружу в Compose. |
| **MEDIUM**    | 18+        | Дублирующиеся индексы, отсутствие CHECK-ограничений, неатомарное создание проекта, client-only cooldown сервис-запросов, несоответствие PRD по маркетингу/онбордингу/public-UI, и т.д. |
| **LOW**       | 15+        | Косметика, информационное раскрытие версии, примечания к документации. |

**Ключевой вывод:** код работает на happy path, но не защищён от одновременных гостей за одним столом, не соблюдает собственную бизнес-модель публикации, хранит токены аутентификации в уязвимом месте и значительно отстаёт от PRD по guest-facing и admin UX. Перед production необходим security- и product-pass.

---

## 2. Критические находки (CRITICAL)

### C-1. Access token пользователя хранится в `localStorage` (XSS → захват аккаунта)
- **Файлы:** `apps/web/src/lib/stores/auth.svelte.ts:5-27`, `:106-107`, `:125-126`, `:182`
- **Суть:** JWT access token пишется в `localStorage` под ключом `dm_access_token` и применяется к `ApiClient` уже при импорте модуля.
- **Угроза:** Любой XSS-вектор (загруженный SVG, взломанная зависимость, сторонний скрипт) немедленно приводит к краже токена и полному доступу к аккаунту владельца.
- **Почему критично:** владелец ресторана = доступ к проектам, меню, заказам, QR-кодам, финансовым данным.
- **Исправление:**
  - Вернуть access token только в теле JSON, но **не хранить его в localStorage**.
  - Хранить в памяти страницы.
  - Refresh token уже выдаётся как `httpOnly` cookie — нужно реализовать автоматический `POST /auth/refresh` при 401 и повтор запроса.
  - Добавить `+layout.server.ts` для `/app/**`, который читает/валидирует токен на сервере.

### C-2. Публичные transactional endpoint'ы не проверяют `project.mode`
- **Файлы:** `apps/api/src/venue/service/project_table.rs:12-14`, `apps/api/src/venue/service/cart.rs:99-223`, `apps/api/src/venue/service/orders.rs:10-48`, `apps/api/src/venue/service/service_requests.rs`, `apps/api/src/routes/venue.rs:28-38`
- **Суть:** `accessible_table()` проверяет только `project.status == "published"` и `table.active`. `add_to_cart`, `place_order`, `create_service_request` никогда не смотрят `project.mode`.
- **Угроза:** заведение в режиме `menu_only` или `promo_only` всё равно получает заказы и сервис-запросы. Это прямое нарушение бизнес-логики и PRD §3, §8.
- **Сценарий:**
  1. Владелец создаёт проект с `mode: "menu_only"`, публикует.
  2. Гость сканирует QR, видит меню.
  3. Frontend (или злоумышленник напрямую) шлёт `POST /public/tables/{token}/cart/items` и `POST /public/tables/{token}/orders`.
  4. Система принимает заказ, хотя self-ordering отключён.
- **Исправление:** добавить единый helper `check_project_mode(action)` и вызывать в каждом public endpoint перед операцией.

### C-3. Race condition в корзине — потеря позиций при одновременных запросах
- **Файлы:** `apps/api/src/venue/service/cart.rs:196-214` (`add_to_cart`), `:225-251` (`remove_from_cart`), `:253-284` (`update_cart_item_quantity`), `apps/api/src/venue/repository.rs:72-88` (`get_or_create_cart_session`)
- **Суть:** операции читают JSONB-корзину и пишут её отдельным `UPDATE`. Между чтением и записью другой запрос может изменить состояние.
- **Сценарий:** два гостя за одним столом одновременно добавляют блюда; один из запросов перезаписывает результат другого.
- **Исправление:** оборачивать мутацию в транзакцию, вызывать `repository::lock_cart_session(... FOR UPDATE)` до чтения, затем писать. `place_order` уже использует `lock_cart_session`, но cart-mutation — нет.

### C-4. Админ-роуты защищены только на клиенте
- **Файлы:** `apps/web/src/routes/(admin)/app/+layout.svelte:14-18`; отсутствует `apps/web/src/routes/(admin)/app/+layout.server.ts`
- **Суть:** редирект на `/login` выполняется в `$effect` после гидратации. SSR отдаёт админ-шелл неаутентифицированному пользователю.
- **Угроза:** утечка структуры админки, а любые future server load functions будут незащищены.
- **Исправление:** создать `+layout.server.ts`, который читает access token (cookie или заголовок) и валидирует его через API до рендера.

### C-5. Расхождения API-контрактов, приводящие к runtime-ошибкам
- **Файлы:** `packages/shared-types/index.ts` vs `apps/api/src/menu/models.rs`, `apps/api/src/auth/models.rs`, `apps/api/src/auth/middleware.rs`
- **Ключевые mismatch'ы:**
  - `/auth/me` возвращает `CurrentUser { id, email, role }`, а shared type `MeResponse = UserResponse` ожидает `name`, `createdAt` → `undefined`.
  - `MenuItem` не содержит `currency`, хотя backend шлёт `currency: string`.
  - `ModifierGroup.itemId` в shared types, backend шлёт `menuItemId`.
  - `ModifierOption.groupId` в shared types, backend шлёт `modifierGroupId`.
  - `Allergen`/`Tag` не содержат `code`, `kind`.
  - `CategoryWithItems extends Category`, но backend шлёт только `{id,name,sort_order,items}`.
  - `CreateCategoryRequest.sortOrder` optional в shared types, required в backend.
  - `ProjectResponse.description` required string в shared types, backend возвращает `Option<String>`.
- **Угроза:** TypeScript «обманывает» разработчика; при реальном использовании поля `undefined`, формы падают, расчёты ломаются.
- **Исправление:** выровнять shared types и backend response structs; добавить compile-time проверку (zod/valibot) или contract tests.

---

## 3. Высокоприоритетные находки (HIGH)

### H-1. Rate limiter доверяет `X-Forwarded-For` слева направо
- **Файл:** `apps/api/src/rate_limit.rs:72-88`
- **Проблема:** берётся **первое** (client-controlled) значение `X-Forwarded-For`. За reverse proxy это позволяет подменять IP и обходить лимит.
- **Исправление:** брать **правое** значение от доверенного proxy или использовать `ConnectInfo` по умолчанию.

### H-2. `place_order` не ревалидирует корзину
- **Файлы:** `apps/api/src/venue/service/orders.rs:10-48`, `apps/api/src/venue/repository.rs:109-126`
- **Проблема:** заказ создаётся из snapshot'а корзины. Не проверяются актуальная доступность блюд, текущие цены, текущие ограничения модификаторов.
- **Сценарий:** админ скрыл блюдо или поменял цену между добавлением в корзину и оформлением — заказ уйдёт с устаревшими данными.
- **Исправление:** внутри транзакции `place_order` перезагрузить каждый `menu_item`, пересчитать total и проверить constraints.

### H-3. Refresh token flow не используется frontend
- **Файлы:** `apps/web/src/lib/stores/auth.svelte.ts:55-97`, `packages/api-client/index.ts:151-153`
- **Проблема:** метод `api.refresh()` существует, но при 401 frontend сбрасывает токен и выходит. Пользователь вылетает через 15 минут.
- **Исправление:** добавить response interceptor, который при 401 вызывает `/auth/refresh` и повторяет запрос.

### H-4. Cookie Secure flag зависит от `APP_ENV`
- **Файл:** `apps/api/src/auth/service.rs:262-282`
- **Проблема:** `secure(config.app_env == "production")`. Если оператор ошибётся со `APP_ENV` или использует `staging` поверх HTTPS, refresh cookie уйдёт без `Secure`.
- **Исправление:** по умолчанию `Secure=true`; отключать только явным `COOKIE_INSECURE=true`.

### H-5. `JWT_SECRET` валидируется только по длине
- **Файлы:** `apps/api/src/config.rs:48-51`, `apps/api/.env.example:4`
- **Проблема:** `aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa` (32 символа) пройдёт валидацию. Примерный secret в `.env.example` — реальный риск copy-paste в production.
- **Исправление:** проверять энтропию/разнообразие символов; увеличить минимум до 64; вести deny-list примерных строк.

### H-6. Публикация обходит readiness checklist
- **Файлы:** `apps/api/src/projects/service/publication.rs` (если есть), `apps/api/src/projects/service.rs:105-154` (`update_project`)
- **Проблема:** `PATCH /projects/{id}` принимает `status` и позволяет установить `"published"` без проверок readiness.
- **Исправление:** либо убрать `status` из `UpdateProjectRequest`, либо при `status == "published"` запускать те же проверки, что и в publish endpoint.

### H-7. Quick add не блокирует обязательные модификаторы
- **Файлы:** `apps/web/src/lib/components/venue/MenuItemCard.svelte:92-103`, `apps/web/src/routes/(venue)/table/[token]/+page.svelte:72-75`
- **Проблема:** quick-add кнопка показывается по флагу `item.quickAdd`, но не проверяет `modifierGroups.some(g => g.required)`. Блюдо с обязательным выбором размера/прожарки добавляется некорректно.
- **Исправление:** единый helper `canQuickAdd(item)`; при false открывать `DetailSheet`.

### H-8. CSP разрешает картинки с любого источника и `unsafe-inline` скрипты
- **Файл:** `apps/web/src/hooks.server.ts:11-21`, `:37-43`
- **Проблема:** `img-src 'self' data: blob: *` и `script-src 'self' 'unsafe-inline'` ослабляют защиту от XSS.
- **Исправление:** ограничить `img-src` API_ORIGIN + доверенными CDN; убрать `'unsafe-inline'` через nonce/hashes.

### H-9. Отсутствует RBAC / ролевая модель
- **Файлы:** `apps/api/src/auth/middleware.rs:12-18`, `apps/api/migrations/001_users.sql:6`
- **Проблема:** PRD §2 требует Owner/Admin/Editor. В БД есть колонка `role`, но она не используется; все protected endpoint'ы проверяют только владельца.
- **Исправление:** добавить `RequireRole` extractor и разметить endpoint'ы.

### H-10. Публичные uploads доступны без авторизации
- **Файлы:** `apps/api/src/routes/mod.rs:72`, `apps/api/src/routes/uploads.rs:31-34`
- **Проблема:** любой, кто знает URL `/uploads/{uuid}.{ext}`, может скачать загруженное админом изображение. Это приемлемо для menu-фото, но рискованно, если админ загрузит конфиденциальный файл.
- **Исправление:** документировать политику или добавить auth-guarded handler для приватных assets.

### H-11. PostgreSQL порт выставлен наружу в Docker Compose
- **Файл:** `docker-compose.yml:8-9`
- **Проблема:** `5433:5432` без ограничения `127.0.0.1` открывает БД на хост-сети.
- **Исправление:** убрать mapping для production или привязать к `127.0.0.1:5433:5432` только для локальной отладки.

### H-12. `deploy.yml` не публикует и не деплоит образы
- **Файл:** `.github/workflows/deploy.yml:72-89`
- **Проблема:** workflow только локально собирает образы и валидирует compose. Нет `docker push`, нет деплоя.
- **Исправление:** добавить login + build-push-action + шаг развёртывания (GitHub Environment / SSH / webhook).

---

## 4. Средние находки (MEDIUM) — кратко

### Бизнес-логика / backend
- **Service-request cooldown только на клиенте:** `ServiceRequestPanel.svelte:39` (30 сек вместо 60–90), сбрасывается при reload. Нужна серверная проверка.
- **Дубликаты заказов не обрабатываются:** повторный `POST /orders` после таймаута сети вернёт `EMPTY_CART`, а не idempotency-ответ.
- **Один cart на весь стол:** `cart_sessions` unique по `table_id`. Несколько гостей за одним столом делят одну корзину — не соответствует ожиданиям QR-per-guest.
- **Modifier `sort_order` сбрасывается в 0:** `apps/api/src/menu/repository/modifiers.rs` использует `unwrap_or(0)` + `COALESCE`, из-за чего `0` не считается NULL.
- **Partial update min/max модификаторов:** `update_group` валидирует merged значения, но в БД пишет только переданные поля, оставляя неконсистентную пару.
- **Bulk create без уникальности label:** нет `UNIQUE (project_id, label)`; можно создать два "Стол 1".
- **Token length 6 символов:** ~1 млрд комбинаций; при масштабе и обходе rate limit возможен перебор.

### База данных
- **Дублирующиеся индексы:** `idx_modifier_groups_menu_item_id`, `idx_modifier_options_*`, `idx_order_items_order_id`, `idx_projects_slug`, `idx_refresh_tokens_token_hash`.
- **Отсутствуют CHECK-ограничения для enum:** `users.role`, `projects.status`, `projects.mode`, `menu_items.availability_status`, `tags.kind`, theme-колонки.
- **Нет per-project уникальности** у `allergens.name`, `tags.name`, `categories.name`.
- **Недостающие композитные индексы:** `menu_items(category_id, sort_order, name)`, `orders(project_id, status, created_at DESC)` и др.
- **Валюта item vs project:** `menu_items.currency` может расходиться с `projects.currency`.

### Frontend / UX / PRD
- **Маркетинговый сайт не соответствует PRD:** отсутствуют `/product`, `/solutions/*`, `/faq`; hero-копия и CTA не те; нет trust-strip и animated preview switcher.
- **Онбординг не 5 шагов:** только 3 шага (`ProjectInfoStep`, `StyleStep`, `ReviewStep`), нет inline menu/tables/publish.
- **Нет загрузки logo/hero в onboarding'е:** поля есть в theme, но UI отсутствует.
- **Promo page с фейковыми данными:** hardcoded часы/адрес/телефон.
- **Waiting screen без stage tracker:** только countdown и progress bar; нет статусов "Подтверждён → Готовится → Скоро принесём".
- **Tables:** нет bulk ranges `A1-A12`, copy link, rename, printable QR layout.
- **Menu manager:** нет duplicate, drag-to-reorder, hide/toggle availability, JSON import, preview.
- **Service requests:** нет sticky dock, confirm sheet, cooldown; на waiting screen нет shortcuts.

### Инфраструктура
- **Нет TLS/reverse proxy в Compose:** только HTTP; HSTS `preload` выставлен преждевременно.
- **Web Dockerfile hardcodes ORIGIN:** `ENV ORIGIN=http://localhost:3000`.
- **Миграции запускаются в main.rs на каждом старте:** риск для production.
- **Нет resource limits в Compose.**
- **Нет бэкапов/DR strategy** для Postgres и uploads.
- **Base images не закреплены digest'ом.**
- **Нет container scanning в CI.**

---

## 5. Низкоприоритетные находки (LOW)

- `/version` раскрывает версию (`apps/api/src/routes/mod.rs:60`).
- `Button.svelte` не имеет визуального loading spinner.
- `theme.ts` не применяет `cardStyle` и `largePhotos`.
- Marketing `/about` не в PRD route map.
- Mixed `$app/stores` vs `$app/state` в routes.
- `EmptyState` role="region" не всегда семантически точно.
- `TextInput`/`PasswordInput`/`Select` используют `focus:ring` вместо `focus-visible:ring`.
- `VenueSkeleton` игнорирует `prefers-reduced-motion`.
- Password requirement list — не семантический `<ul>`.

---

## 6. Перекрёстные риски (комбинации)

1. **XSS + localStorage token + отсутствие server-side admin guard:** любая XSS на marketing/public странице не только крадёт токен, но и даёт полный доступ к админке без дополнительных барьеров.
2. **Race condition корзины + отсутствие mode enforcement:** в заведении `menu_order` несколько гостей за одним столом могут одновременно потерять/перезаписать позиции, а режим `menu_only` всё равно примет заказ.
3. **Слабый JWT secret + cookie без Secure:** если оператор скопирует `.env.example`, токены можно подделать, а refresh cookie может утечь по HTTP.
4. **PRD gaps + API contract mismatch:** frontend не может корректно отобразить promo page и waiting screen, потому что данные либо отсутствуют, либо имеют другие имена полей.
5. **Отсутствие бэкапов + migrations в main.rs:** ошибка в миграции может одновременно сломать все реплики и привести к потере данных.

---

## 7. Приоритезированный план исправлений

### Неделя 1 — блокирующие риски
1. Убрать access token из `localStorage`; реализовать memory-only + `/auth/refresh` interceptor.
2. Добавить server-side guard для `/app/**`.
3. Ввести проверку `project.mode` во всех public transactional endpoint'ах.
4. Оборачивать cart mutations в транзакцию с `FOR UPDATE`.
5. Исправить critical API contract mismatches (`/auth/me`, `currency`, `menuItemId`, `modifierGroupId`, `CategoryWithItems`).

### Неделя 2 — безопасность и целостность
6. Исправить `client_key` в rate limiter.
7. Сделать cookie `Secure` default-true.
8. Усилить валидацию `JWT_SECRET` (entropy + длина 64).
9. Ревалидировать корзину в `place_order`.
10. Убрать `'unsafe-inline'` и `img-src *` из CSP.
11. Закрыть PostgreSQL порт в Compose; добавить reverse proxy/TLS.

### Неделя 3 — бизнес-логика и PRD
12. Внедрить readiness checks в publish flow.
13. Добавить server-side cooldown сервис-запросов.
14. Исправить modifier `sort_order` и min/max partial update.
15. Реализовать quick-add gate на required modifiers.
16. Добавить недостающие marketing routes и онбординг по PRD.
17. Добавить stage tracker в waiting screen.

### Неделя 4 — БД, инфраструктура, полировка
18. Cleanup duplicate indexes, добавить CHECK constraints и composite indexes.
19. Вынести миграции из main.rs в init job для production.
20. Добавить бэкапы Postgres и uploads.
21. Допилить deploy.yml (push образов + deploy job).
22. Добавить container scanning и dependency monitoring.

---

## 8. Вопросы, требующие решения продукта / заказчика

1. **Модель корзины:** один shared cart на стол или per-session/per-guest cart? Это влияет на схему и concurrency.
2. **Публикация:** readiness checklist — блокирующий или advisory? Должен ли `PATCH /projects/{id}` позволять менять `status`?
3. **Ролевая модель:** реализовывать Owner/Admin/Editor в MVP или отложить?
4. **Контактные данные promo page:** какая схема address/hours/phone/socials/booking?
5. **Upload policy:** все картинки публичны или нужна приватность?
6. **HSTS preload:** намерены ли подавать домен в hstspreload.org?
7. **Target deployment platform:** VPS, Kubernetes, fly.io, облако? От этого зависит доработка CI/CD.
8. **Многоязычность:** заложить сейчас locale-aware структуру или отложить?
9. **Ценообразование корзины:** фиксировать цены при добавлении или пересчитывать при оформлении?

---

## 9. Примечание о базе знаний

Проверена Kimi Base (memory MCP). В базе знаний **отсутствует контекст проекта digital-menu**; все сущности относятся к другому проекту (TrustMatcher/Dofamin). Это создаёт риск, что межсессионный контекст, решения и уроки не сохраняются. Рекомендуется после устранения критических находок зафиксировать архитектурные и security-решения проекта в базе знаний.

---

## 10. Рекомендации по процессу

- Ввести **pre-merge checklist** с пунктами: "проверено отсутствие localStorage для токенов", "mode enforcement", "ownership check", "contract tests".
- Добавить **contract tests** между backend и shared-types (например, snapshot JSON responses).
- Настроить **cargo audit** и **npm audit** в CI с fail on critical/high.
- Внедрить **E2E-тесты** для сценариев: регистрация → onboarding → publish → guest scan → order → waiting screen.

---

*Отчёт подготовлен мультиагентным аудитом с последующей кросс-проверкой ведущим аудитором. Конкретные строки и файлы приведены для воспроизводимости.*
