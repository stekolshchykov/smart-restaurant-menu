# TASK.md — Digital Menu SaaS

Файл сформирован на основе аудита 2026-06-27. Здесь перечислены только те пункты, которые были подтверждены владельцем проекта для работы. Каждая задача содержит описание проблемы, место проявления, выбранное решение и примерные шаги реализации.

---

## T-00. Убрать rate limiting

**Статус:** pending  
**Тип:** backend  
**Где:** `apps/api/src/rate_limit.rs`, `apps/api/src/routes/mod.rs`

### Проблема
В API есть in-memory rate limiter. Владелец проекта принял решение, что для текущего этапа rate limiting не нужен и мешает разработке/тестированию.

### Решение
Полностью удалить rate limiting middleware из маршрутов и сам модуль `rate_limit.rs`. Убедиться, что тесты и CI не зависят от `APP_ENV=test` для отключения лимитов.

### Шаги
1. Удалить `apps/api/src/rate_limit.rs`.
2. Убрать `rate_limit::auth_middleware`, `rate_limit::public_middleware`, `rate_limit::general_middleware` из `apps/api/src/routes/mod.rs`.
3. Удалить `rate_limit` из `apps/api/src/lib.rs`, если он там объявлен.
4. Проверить `cargo check` и `cargo test`.

---

## T-01. Режимы публикации проекта не работают для гостя

**Статус:** pending  
**Тип:** backend  
**Где:** `apps/api/src/venue/service/project_table.rs`, `apps/api/src/venue/service/cart.rs`, `apps/api/src/venue/service/orders.rs`, `apps/api/src/venue/service/service_requests.rs`, `apps/api/src/routes/venue.rs`

### Проблема
При создании проекта можно выбрать режим:
- `promo_only`
- `menu_only`
- `menu_service`
- `menu_order`

Но backend в публичных endpoint'ах проверяет только `project.status == "published"` и `table.active`. Он не смотрит `project.mode`. Из-за этого в режиме `menu_only` гость всё равно может добавить блюдо в корзину и оформить заказ; в `promo_only` — тоже можно заказать и позвать официанта.

### Почему важно
Это прямое нарушение бизнес-логики и PRD. Владелец заведения выбирает режим, чтобы контролировать степень цифровизации, а система не соблюдает его выбор.

### Выбранное решение
Добавить единую проверку режима перед каждой публичной операцией:

| Режим | Разрешено | Запрещено |
|-------|-----------|-----------|
| `promo_only` | `GET /public/projects/{slug}` | menu, cart, orders, service requests |
| `menu_only` | promo + menu (`/public/projects/{slug}/menu`, `/public/tables/{token}`) | cart, orders, service requests |
| `menu_service` | promo + menu + service requests | cart, orders |
| `menu_order` | всё | — |

### Шаги
1. В `apps/api/src/venue/service/project_table.rs` или в отдельном helper'е создать функцию:
   ```rust
   fn check_mode_for_action(project: &Project, action: PublicAction) -> Result<(), AppError>
   ```
   где `PublicAction` — enum: `ViewMenu`, `AddToCart`, `PlaceOrder`, `ServiceRequest`.
2. Вызвать эту функцию в:
   - `get_public_menu_by_slug` (уже частично: отклоняет `promo_only`, но лучше использовать helper).
   - `add_to_cart`
   - `remove_from_cart`
   - `update_cart_item_quantity`
   - `place_order`
   - `create_service_request`
3. Вернуть понятную ошибку, например `AppError::ProjectModeNotAllowed`, со статусом 403 и кодом `PROJECT_MODE_NOT_ALLOWED`.
4. Добавить тесты в `apps/api/tests/venue_test.rs`:
   - создать проект в режиме `menu_only`, опубликовать, попытаться добавить в корзину → ожидаем 403;
   - тоже для `promo_only`;
   - для `menu_order` — операции разрешены.

---

## T-02. Race condition в корзине

**Статус:** pending  
**Тип:** backend  
**Где:** `apps/api/src/venue/service/cart.rs`, `apps/api/src/venue/repository.rs`

### Проблема
Операции с корзиной выполняются как read-modify-write:
1. `get_or_create_cart_session` читает JSONB `items`.
2. Сервис меняет массив в памяти.
3. `update_cart_items` записывает весь массив обратно.

Если два запроса приходят одновременно (два гостя за одним столом или double-tap), каждый читает старое состояние, и последний записавший перезаписывает изменения первого.

### Почему важно
Гость может не увидеть добавленное блюдо, изменение количества или удаление может затереть чужое изменение. Итоговый заказ будет неверным.

### Выбранное решение
Оборачивать каждую мутацию корзины в транзакцию и блокировать строку `cart_sessions` через `SELECT ... FOR UPDATE` до чтения.

### Шаги
1. В `apps/api/src/venue/repository.rs` добавить функцию:
   ```rust
   pub async fn get_cart_session_for_update<'e, E>(executor: E, table_id: Uuid) -> Result<Option<CartSessionRow>, AppError>
   ```
   с запросом:
   ```sql
   SELECT id, table_id, token, items, created_at, updated_at
   FROM cart_sessions
   WHERE table_id = $1
   FOR UPDATE
   ```
2. В `add_to_cart`, `remove_from_cart`, `update_cart_item_quantity`:
   - открыть транзакцию `state.db.begin()`;
   - вызвать `get_cart_session_for_update(&mut *tx, table.id).await?`;
   - если `None`, создать через `INSERT ... ON CONFLICT` в той же транзакции;
   - выполнить изменение;
   - вызвать `update_cart_items(&mut *tx, session.id, &cart_items)`;
   - закоммитить `tx.commit()`.
3. Убедиться, что `place_order` продолжает использовать `lock_cart_session` и что cart-mutation не вызывается вне транзакции.
4. Добавить тест на race condition: два параллельных `add_to_cart` должны привести к двум позициям, а не к одной.

---

## T-03. Админка проверяет авторизацию только в браузере

**Статус:** pending  
**Тип:** frontend  
**Где:** `apps/web/src/routes/(admin)/app/+layout.svelte`

### Проблема
`+layout.svelte` для админки делает редирект на `/login` в `$effect` после гидратации. SSR отдаёт HTML-шаблон админки неаутентифицированному пользователю.

### Почему важно
- Происходит мелькание админ-интерфейса.
- Если позже добавятся server load functions с sensitive data, они будут выполняться без проверки.
- Это не соответствует SvelteKit-best practices для защищённых зон.

### Выбранное решение
Добавить server-side guard через `+layout.server.ts` для `/app/**`.

### Шаги
1. Создать файл `apps/web/src/routes/(admin)/app/+layout.server.ts`.
2. В `load` функции:
   - прочитать access token из cookie `dm_access_token` (или из заголовка Authorization);
   - сделать server-side запрос к `GET /auth/me` API с этим токеном;
   - если 401/403 — редиректить на `/login` через `redirect(302, '/login')`;
   - если ок — вернуть пользователя в `data`, чтобы `+layout.svelte` мог использовать его без client-side загрузки.
3. Оставить client-side `$effect` в `+layout.svelte` как fallback для случаев, когда токен истекает во время сессии.
4. Убедиться, что SSR-рендер `/app` для незалогиненного пользователя возвращает 302, а не HTML.

---

## T-04. API contract mismatches между shared-types и backend

**Статус:** pending  
**Тип:** shared packages + backend  
**Где:** `packages/shared-types/index.ts`, `apps/api/src/menu/models.rs`, `apps/api/src/auth/models.rs`, `apps/api/src/auth/middleware.rs`, `apps/api/src/error.rs`

### Проблема
TypeScript-типы обещают поля, которых backend не отправляет, или используют другие имена. Конкретные mismatch'и:

1. `/auth/me` возвращает `CurrentUser { id, email, role }`, а shared type `MeResponse = UserResponse` ожидает `id`, `email`, `name`, `role`, `createdAt` → `name` и `createdAt` будут `undefined`.
2. `MenuItem` в shared-types не содержит `currency`, хотя backend шлёт `currency: string`.
3. `ModifierGroup` в shared-types использует `itemId: string`, backend шлёт `menuItemId`.
4. `ModifierOption` в shared-types использует `groupId: string`, backend шлёт `modifierGroupId`.
5. `Allergen` в shared-types не содержит `code: string | null`.
6. `Tag` в shared-types не содержит `code: string | null` и `kind: string`.
7. `CategoryWithItems extends Category`, но backend шлёт только `{id, name, sort_order, items}` → `projectId`, `createdAt`, `updatedAt` будут `undefined`.
8. `CreateCategoryRequest.sortOrder` optional в shared-types, required в backend.
9. `ProjectResponse.description` required string, backend возвращает `null`.
10. `CreateProjectRequest` требует `type`, `description`, `locale`, `currency`, `mode`, но backend имеет для них дефолты.
11. `ApiError` в shared-types имеет `field?: string`, backend возвращает `errors?: Record<string, string[]>`.
12. `AuthErrorCode` в shared-types snake_case, backend шлёт UPPER_SNAKE_CASE.
13. `ProjectCardStyle` в shared-types не содержит `'editorial'`, backend принимает.
14. `ProjectResponse` не содержит `ownerId`, backend возвращает.

### Почему важно
TypeScript не ловит эти ошибки на этапе сборки, но в runtime приложение обращается к `undefined`. Это приводит к падающим формам, неверным расчётам и сломанному UI.

### Выбранное решение
Выравнивание shared-types с реальными JSON-ответами backend'а. Для каждого endpoint'а сделать source of truth — либо backend response struct, либо shared type.

### Шаги
1. **Backend:**
   - В `apps/api/src/auth/models.rs` создать отдельный `MeResponse` с полями `id`, `email`, `name`, `role`, `createdAt` (или изменить `CurrentUser`, чтобы включить `name` и `createdAt`).
   - Убедиться, что `ProjectResponse` включает `ownerId`.
   - В `apps/api/src/error.rs` у `ValidationError` в JSON-ответе оставить `errors`, не `field`.
2. **Shared types (`packages/shared-types/index.ts`):**
   - `MeResponse` — отдельный интерфейс с `id`, `email`, `name`, `role`, `createdAt`.
   - `MenuItem` — добавить `currency: string`.
   - `ModifierGroup` — переименовать `itemId` в `menuItemId`.
   - `ModifierOption` — переименовать `groupId` в `modifierGroupId`.
   - `Allergen` — добавить `code: string | null`.
   - `Tag` — добавить `code: string | null`, `kind: string`.
   - `CategoryWithItems` — не наследовать `Category`, задать явно `{ id, name, sortOrder, items }`.
   - `CreateCategoryRequest` — сделать `sortOrder: number` required.
   - `ProjectResponse` — `description: string | null`, добавить `ownerId: string`.
   - `CreateProjectRequest` — сделать `type`, `description`, `locale`, `currency`, `mode` optional.
   - `ApiError` — заменить `field?: string` на `errors?: Record<string, string[]>`.
   - `AuthErrorCode` — перевести в UPPER_SNAKE_CASE.
   - `ProjectCardStyle` — добавить `'editorial'`.
3. **API client (`packages/api-client/index.ts`):**
   - Обновить `getMe()` чтобы возвращал `MeResponse`.
   - Обновить обработку ошибок для `errors` map.
4. **Frontend:**
   - Пройтись по использованию `itemId`, `groupId`, `field` и заменить на новые имена.
   - Добавить contract tests: для каждого важного endpoint'а зафиксировать snapshot JSON-ответа backend'а.

---

## T-05. Заказ оформляется по устаревшим ценам и доступности

**Статус:** pending  
**Тип:** backend  
**Где:** `apps/api/src/venue/service/orders.rs`, `apps/api/src/venue/repository.rs`

### Проблема
`place_order` берёт корзину из базы и создаёт заказ на её основе. Он не перепроверяет:
- доступны ли блюда сейчас (`availability_status == "available"`);
- не изменились ли цены;
- актуальны ли ограничения модификаторов.

### Почему важно
Админ мог скрыть блюдо, поменять цену или модификаторы после того, как гость добавил их в корзину. Гость заплатит старую цену или закажет то, что больше не продаётся.

### Выбранное решение
Внутри транзакции оформления заказа заново загрузить каждое блюдо и его модификаторы, проверить доступность и пересчитать итог по актуальным ценам.

### Шаги
1. В `place_order` после `lock_cart_session`:
   - для каждого `CartItem` получить актуальное `MenuItem` из `items::get`;
   - проверить `availability_status == "available"`, иначе `MenuItemUnavailable`;
   - получить актуальные `ModifierGroup` и `ModifierOption` для этого блюда;
   - проверить, что все выбранные addon'ы всё ещё существуют и принадлежат тем же группам;
   - пересчитать `unit_total = item.price + sum(option.price * quantity)`;
   - сложить в `total`.
2. Если что-то изменилось, вернуть ошибку с детализацией (например, `OrderValidationFailed` с указанием позиции).
3. Сохранить в `order_items` актуальные `base_price` и `addons` (имена и цены на момент заказа — для истории).
4. Обновить `CartSessionResponse` / `CartItem`, если нужно, чтобы frontend мог показать изменения.
5. Добавить тесты:
   - цена меняется между добавлением и заказом → заказ по новой цене;
   - блюдо скрывается → заказ отклоняется.

---

## T-06. Пользователь вылетает из аккаунта каждые 15 минут

**Статус:** pending  
**Тип:** frontend + API client  
**Где:** `apps/web/src/lib/stores/auth.svelte.ts`, `packages/api-client/index.ts`, `apps/api/src/routes/auth.rs`

### Проблема
Access token живёт 15 минут (`JWT_ACCESS_EXPIRY_MINUTES=15`). Когда он истекает, frontend не использует `/auth/refresh`, а сбрасывает сессию и отправляет на `/login`. Backend при этом уже умеет выдавать новый access token по refresh cookie.

### Почему важно
Владелец заведения будет разлогиниваться каждые 15 минут — критичный UX-баг для SaaS-админки.

### Выбранное решение
Добавить interceptor в API-клиент, который при 401 автоматически вызывает `/auth/refresh`, получает новый access token и повторяет исходный запрос.

### Шаги
1. В `packages/api-client/index.ts`:
   - добавить поле `private refreshing: Promise<void> | null`;
   - добавить метод `refresh(): Promise<void>`;
   - в `request<T>` при получении 401:
     - если `this.refreshing` — дождаться его завершения и повторить запрос;
     - иначе начать refresh, дождаться, обновить токен, повторить запрос;
     - если refresh не удался — пробросить ошибку дальше.
2. В `apps/web/src/lib/stores/auth.svelte.ts`:
   - подписаться на событие обновления токена из API client и сохранять его в `localStorage` (если остаётся текущая схема) или в памяти.
   - при logout вызывать `api.logout()` и очищать состояние.
3. Убедиться, что `credentials: 'include'` передаётся во всех запросах, чтобы refresh cookie отправлялся.
4. Добавить тест: истечение access token → автоматический refresh → повтор запроса.

---

## T-07. Можно опубликовать неполный проект

**Статус:** pending  
**Тип:** backend  
**Где:** `apps/api/src/projects/service.rs`, `apps/api/src/projects/service/publication.rs`

### Проблема
`UpdateProjectRequest` позволяет передать `status: "published"`. Backend проверяет только, что значение допустимо, но не проверяет readiness checklist (есть ли название, меню, столики и т.д.).

### Почему важно
Владелец может случайно опубликовать пустой проект, и гости увидят пустую страницу.

### Выбранное решение
При попытке установить `status: "published"` через `update_project` запускать те же проверки готовности, что используются на экране публикации. Если проверки не пройдены — возвращать ошибку.

### Шаги
1. В `apps/api/src/projects/service.rs` в `update_project`:
   - если `req.status == Some("published")`, вызвать существующую функцию readiness check;
   - если `ready == false`, вернуть `AppError::ProjectNotReady` с детализацией.
2. Альтернативно: убрать `status` из `UpdateProjectRequest` и разрешить публикацию только через dedicated endpoint `POST /projects/{id}/publish`.
3. Обновить frontend: кнопка «Опубликовать» должна чётко показывать, какие проверки не пройдены.
4. Добавить тест: попытка опубликовать проект без меню → 400.

---

## T-08. Быстрое добавление для блюд с обязательными модификаторами

**Статус:** pending  
**Тип:** frontend + backend  
**Где:** `apps/web/src/lib/components/venue/MenuItemCard.svelte`, `apps/web/src/routes/(venue)/table/[token]/+page.svelte`, `apps/api/src/venue/service/cart.rs`

### Проблема
Кнопка quick add показывается по флагу `item.quickAdd` и не проверяет обязательные модификаторы. Гость может добавить блюдо без обязательного выбора (например, размера пиццы).

### Выбранное решение
При quick add для блюд с обязательными модификаторами использовать значения по умолчанию. Если значения по умолчанию не заданы — открывать detail sheet.

### Шаги
1. В shared-types/backend добавить поле `defaultOptionIds?: string[]` или `default: boolean` к `ModifierOption`.
2. В UI:
   - при quick add проверять, есть ли у блюда `modifierGroups` с `required: true`;
   - если да — собирать `addonIds` из опций, помеченных как `default`;
   - если для обязательной группы нет default-опции — открывать `DetailSheet`.
3. В `cart.quickAdd` передавать собранные `addonIds`.
4. Backend `add_to_cart` уже валидирует обязательные модификаторы — убедиться, что ошибка `InvalidSelection` корректно обрабатывается frontend'ом.
5. Добавить UI-индикатор в `MenuItemCard`, что у блюда есть выбор по умолчанию.

---

## T-09. Ролевая модель: админ, клиент, посетитель

**Статус:** pending  
**Тип:** backend + frontend + БД  
**Где:** `apps/api/src/auth/middleware.rs`, `apps/api/migrations/001_users.sql`, `apps/web/src/routes/(admin)/app/+layout.svelte`

### Проблема
В базе есть колонка `role`, но весь функционал админки доступен любому залогиненному пользователю. PRD требует роли Owner/Admin/Editor, но владелец проекта уточнил, что достаточно трёх ролей:
- **админ** — управляет клиентами (tenant/platform admin);
- **клиент** — владелец заведения, управляет своими проектами;
- **посетитель** — гость, не аутентифицирован.

### Почему важно
Без разграничения прав администратор платформы и клиент имеют одинаковый доступ; редактор меню может менять критичные настройки.

### Выбранное решение
Внедрить три роли и проверять их на backend:
- `admin` — доступ к управлению пользователями/клиентами (future admin panel);
- `client` — доступ только к своим проектам (`owner_id == user.id`);
- `visitor` — неаутентифицирован, только public venue endpoints.

### Шаги
1. В `apps/api/migrations/001_users.sql` добавить CHECK-ограничение:
   ```sql
   ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'client', 'visitor'));
   ```
2. В `apps/api/src/auth/middleware.rs`:
   - расширить `CurrentUser` методами `is_admin()`, `is_client()`;
   - добавить extractor `RequireRole(Role)` или guard.
3. В protected routes:
   - оставить проверку владельца проекта для `client`;
   - добавить отдельный namespace/platform admin routes для `admin`.
4. В `apps/web/src/routes/(admin)/app/+layout.svelte`:
   - показывать/скрывать пункты меню в зависимости от роли;
   - для `admin` — показывать управление клиентами.
5. Добавить seed-данные для admin-пользователя.
6. Добавить тесты: `client` не может получить проект другого клиента; `admin` может получить любой проект.

---

## T-10. Cooldown сервис-запросов только в браузере

**Статус:** pending  
**Тип:** backend + frontend  
**Где:** `apps/web/src/lib/components/venue/ServiceRequestPanel.svelte`, `apps/api/src/venue/service/service_requests.rs`, `apps/api/src/venue/repository.rs`

### Проблема
Блокировка повторной отправки сервис-запроса хранится в компоненте (30 сек). При перезагрузке страницы cooldown сбрасывается, и гость может спамить запросы.

### Почему важно
Официант получит лавину повторных уведомлений.

### Выбранное решение
Перенести cooldown на backend. Для каждого стола и типа запроса хранить время последнего `pending`/`in_progress` запроса и отклонять новый, если прошло менее 60–90 секунд.

### Шаги
1. В `apps/api/migrations/008_guest_sessions.sql` или новой миграции добавить таблицу/колонку для отслеживания последнего сервис-запроса. Проще всего — добавить `last_service_request_at` в `tables` или создать отдельную таблицу `service_request_cooldowns (table_id, type, last_sent_at)`.
2. В `create_service_request`:
   - в транзакции проверить, есть ли незавершённый (`pending`/`in_progress`) запрос того же типа для этого стола;
   - если есть и прошло менее cooldown (например, 60 сек) — вернуть `429 Too Many Requests` или специальную ошибку с оставшимся временем;
   - иначе создать запрос и обновить `last_sent_at`.
3. В `ServiceRequestResponse` добавить поле `cooldownSeconds` или `canResendAt`.
4. В frontend:
   - убрать client-only cooldown;
   - использовать ответ backend для показа таймера.
5. Добавить тесты: два запроса подряд → второй отклонён; после cooldown → второй принят.

---

## T-11. Повторная попытка оформить заказ после сетевого таймаута

**Статус:** pending  
**Тип:** backend + frontend  
**Где:** `apps/api/src/venue/service/orders.rs`, `apps/web/src/lib/stores/venue.svelte.ts`

### Проблема
Если гость нажал «Оформить заказ», но связь прервалась, он не знает, ушёл ли заказ. При повторной попытке backend видит пустую корзину и возвращает «Корзина пуста» вместо уже созданного заказа.

### Почему важно
Гость теряет информацию о заказе и не может отследить статус.

### Выбранное решение
Добавить idempotency key к запросу оформления заказа. Если запрос с тем же ключом уже обработан — вернуть существующий заказ.

### Шаги
1. В `PlaceOrderRequest` добавить поле `idempotencyKey: string`.
2. В `orders` добавить колонку `idempotency_key TEXT UNIQUE`.
3. В `place_order`:
   - если `idempotencyKey` передан, проверить существование заказа с таким ключом;
   - если найден — вернуть его;
   - иначе — создать заказ и сохранить ключ.
4. В frontend генерировать `idempotencyKey` перед первой попыткой и сохранять его до успешного ответа (localStorage или sessionStorage).
5. Альтернатива (если idempotency сложно): привязать последний заказ к `cart_session` и возвращать его, если `place_order` вызван с пустой корзиной в течение N минут после создания.
6. Добавить тесты.

---

## T-12. Сортировка модификаторов сбрасывается при обновлении

**Статус:** pending  
**Тип:** backend  
**Где:** `apps/api/src/menu/repository/modifiers.rs`

### Проблема
`PATCH /modifier-groups/{id}` и `PATCH /modifier-options/{id}` используют `req.sort_order.unwrap_or(0)` и `COALESCE($n, sort_order)`. Поскольку `0` — валидное значение, а не `NULL`, `COALESCE` сохраняет `0`, затирая предыдущий `sort_order`.

### Почему важно
После редактирования группы/опции порядок модификаторов в меню сбивается.

### Выбранное решение
Передавать `sortOrder` как `Option<i32>` и биндить `None` в SQL `NULL`, чтобы `COALESCE` оставляло старое значение.

### Шаги
1. В `UpdateModifierGroupRequest` и `UpdateModifierOptionRequest` `sort_order` уже `Option<i32>`.
2. В репозитории убрать `unwrap_or(0)`:
   ```rust
   .bind(req.sort_order)
   ```
   и запрос:
   ```sql
   UPDATE modifier_groups
   SET name = COALESCE($2, name),
       required = COALESCE($3, required),
       min_select = COALESCE($4, min_select),
       max_select = COALESCE($5, max_select),
       sort_order = COALESCE($6, sort_order)
   WHERE id = $1
   ```
3. То же самое для `modifier_options`.
4. Добавить тест: обновить только имя группы — `sort_order` не меняется.

---

## T-13. Min/max модификаторов могут стать противоречивыми

**Статус:** pending  
**Тип:** backend  
**Где:** `apps/api/src/menu/service/modifiers.rs`

### Проблема
При частичном обновлении группы backend вычисляет валидные `min`/`max` из переданных значений, но в БД пишет только то, что прислали. Например, текущее `min=1, max=1`, запрос `{minSelect: 3}` валидируется как `(3,3)`, но в БД остаётся `min=3, max=1`.

### Почему важно
В базе оказывается невалидное правило, которое потом ломает валидацию выбора гостя.

### Выбранное решение
Загружать текущую группу, накладывать изменения, валидировать итоговую пару, затем писать оба поля.

### Шаги
1. В `update_group`:
   - получить текущую группу из БД;
   - `min_select = req.min_select.or(current.min_select)`;
   - `max_select = req.max_select.or(current.max_select)`;
   - запустить существующую валидацию на merged значениях;
   - в репозиторий передать и `min_select`, и `max_select`.
2. В репозитории `update_modifier_group` убрать `COALESCE` для `min_select`/`max_select` — писать явно.
3. Добавить тест: частичное обновление `minSelect` → `maxSelect` тоже обновляется до корректного значения.

---

## T-14. Маркетинговый сайт не соответствует PRD

**Статус:** pending  
**Тип:** frontend  
**Где:** `apps/web/src/routes/(marketing)/`

### Проблема
Отсутствуют страницы и блоки, заявленные в PRD:
- `/product`
- `/solutions/cafe`
- `/solutions/restaurant`
- `/solutions/bar`
- `/faq`
- trust-strip на главной;
- hero preview switcher (Promo / Menu / Admin);
- narrative stack «Для гостей / Для команды / Для владельца»;
- sticky vertical scroll в How it works.

### Почему важно
Маркетинговый сайт — основной канал продаж B2B SaaS. Несоответствие PRD снижает конверсию.

### Выбранное решение
Реализовать недостающие страницы и блоки по PRD.

### Шаги
1. Создать маршруты:
   - `apps/web/src/routes/(marketing)/product/+page.svelte`
   - `apps/web/src/routes/(marketing)/solutions/cafe/+page.svelte`
   - `apps/web/src/routes/(marketing)/solutions/restaurant/+page.svelte`
   - `apps/web/src/routes/(marketing)/solutions/bar/+page.svelte`
   - `apps/web/src/routes/(marketing)/faq/+page.svelte`
2. Обновить `apps/web/src/routes/(marketing)/+page.svelte`:
   - заменить hero-копию на PRD-вариант;
   - primary CTA — «Посмотреть демо», secondary — «Начать бесплатно»;
   - добавить trust-strip с 5 кликабельными тезисами;
   - добавить hero preview switcher с crossfade и reduced-motion.
3. Обновить Benefits в narrative stack.
4. Обновить How it works в sticky vertical layout.
5. Добавить ссылки в `Header.svelte` и footer.
6. Убедиться, что страницы адаптивны и соблюдают a11y.

---

## T-15. Создание проекта — не 5 шагов, а 3

**Статус:** pending  
**Тип:** frontend  
**Где:** `apps/web/src/routes/(admin)/app/projects/new/+page.svelte`, компоненты `ProjectInfoStep`, `StyleStep`, `ReviewStep`

### Проблема
Сейчас onboarding создания проекта состоит из 3 шагов: Проект → Стиль → Проверка. PRD требует 5 шагов: Проект → Стиль → Меню → Столики → Публикация.

### Почему важно
Пользователь после создания проекта попадает в дашборд с незаполненными меню и столами; onboarding не ведёт до результата.

### Выбранное решение
Расширить wizard до 5 шагов. На шагах Меню и Столики добавить минимальный быстрый ввод; на шаге Публикация — preview и кнопку опубликовать.

### Шаги
1. Добавить компоненты:
   - `MenuStep.svelte` — создание первой категории и первого блюда;
   - `TablesStep.svelte` — создание первого стола (ручное или bulk);
   - `PublishStep.svelte` — readiness checklist + кнопка «Опубликовать».
2. Обновить `+page.svelte`:
   - stepper: `Проект → Стиль → Меню → Столики → Публикация`;
   - состояние шага и валидация перехода;
   - сохранение черновика проекта после шага «Проект».
3. При успешной публикации редиректить в дашборд с уведомлением.
4. Обеспечить, что на шаге «Публикация» вызывается backend readiness check.

---

## T-16. В onboarding нет загрузки логотипа и hero-изображения

**Статус:** pending  
**Тип:** frontend  
**Где:** `apps/web/src/lib/components/admin/project-create/StyleStep.svelte`, `apps/web/src/lib/components/menu/ImageUpload.svelte`

### Проблема
В модели темы есть поля `logoUrl` и `heroUrl`, но в UI onboarding'а нет upload-контролов для них.

### Почему важно
Promo page и брендинг заведения остаются без визуальных assets.

### Выбранное решение
Добавить загрузку logo и hero image в шаг «Стиль» onboarding'а.

### Шаги
1. В `StyleStep.svelte` добавить два блока:
   - «Логотип заведения» — upload + preview;
   - «Обложка/hero image» — upload + preview.
2. Использовать существующий `ImageUpload.svelte` или адаптировать его.
3. После загрузки сохранять `logoUrl`/`heroUrl` через `updateTheme`.
4. Обеспечить, чтобы `ProjectThemeResponse` корректно возвращал URL'ы.
5. В promo page выводить logo и hero image.

---

## T-17. Promo page показывает фейковые контактные данные

**Статус:** pending  
**Тип:** backend + frontend + БД  
**Где:** `apps/web/src/routes/(venue)/venue/[slug]/+page.svelte`, `apps/api/src/venue/models.rs`, `apps/api/src/projects/models.rs`

### Проблема
Часы, адрес, телефон, соцсети и ссылка на бронирование захардкожены в promo page.

### Почему важно
Гости видят ложную информацию о заведении.

### Выбранное решение
Добавить структурированные контактные данные в проект и выводить их на promo page.

### Шаги
1. В БД (`apps/api/migrations/003_projects.sql` или новая миграция) добавить колонки:
   - `address TEXT`
   - `phone TEXT`
   - `hours TEXT`
   - `social_links JSONB` (или отдельная таблица)
   - `booking_url TEXT`
2. В backend models добавить эти поля в `Project`, `PublicProjectResponse`.
3. В `UpdateProjectRequest` добавить возможность редактировать контакты.
4. В админке (settings проекта) добавить форму контактной информации.
5. В `promo page` заменить hardcoded значения на данные из `PublicProjectResponse`.
6. Добавить fallback: если поля не заполнены — не показывать блок или показывать призыв заполнить.

---

## T-18. Экран ожидания заказа не показывает этапы

**Статус:** pending  
**Тип:** frontend  
**Где:** `apps/web/src/lib/components/venue/WaitingScreen.svelte`

### Проблема
Сейчас только countdown/progress bar. PRD требует stage tracker: `Отправлен → Подтверждён → Готовится → Скоро принесем`.

### Почему важно
Гость не понимает, на какой стадии его заказ.

### Выбранное решение
Заменить/дополнить экран stage tracker'ом по статусу заказа.

### Шаги
1. Определить mapping статусов backend → этапы UI:
   - `submitted` → «Отправлен»
   - (добавить `confirmed` если нужно) → «Подтверждён»
   - `preparing` → «Готовится»
   - `ready` → «Скоро принесем»
   - `served` → «Подан»
2. В `WaitingScreen.svelte` отрисовывать 4 шага, выделяя текущий.
3. Если `estimatedMinutes` отсутствует, показывать elapsed time вместо countdown.
4. Добавить ARIA live region для объявления смены статуса.
5. Добавить shortcuts для сервис-запросов на waiting screen.

---

## T-19. Массовое создание столов только цифровое

**Статус:** pending  
**Тип:** frontend + backend  
**Где:** `apps/web/src/lib/components/tables/BulkCreateModal.svelte`, `apps/api/src/tables/models.rs`

### Проблема
Bulk create принимает только числовой диапазон (`1–10`). PRD требует поддержки шаблонов: `A1–A12`, `Бар 1–Бар 8`, `Терраса 1–Терраса 15`.

### Почему важно
Владельцы не могут быстро создать именованные зоны.

### Выбранное решение
Расширить bulk create поддержкой буквенно-цифровых диапазонов.

### Шаги
1. В UI заменить поля `start`/`end` на более гибкие:
   - `prefix` (например, `A`, `Бар `, `Терраса `);
   - `start` и `end` могут быть строками с числовой частью (`A1`, `A12`).
2. В backend `BulkCreateRequest` добавить `start_label`/`end_label` или парсить `prefix + start/end`.
3. Реализовать парсинг диапазона:
   - извлечь буквенный префикс и числовую часть;
   - сгенерировать метки `prefix + number` для всех чисел от start до end.
4. Валидировать: `start <= end`, `end - start + 1 <= MAX_BULK`.
5. Добавить preview списка перед созданием.
6. Добавить тесты.

---

## T-20. У столов нет кнопок «Копировать ссылку» и «Переименовать»

**Статус:** pending  
**Тип:** frontend  
**Где:** `apps/web/src/lib/components/tables/TableCard.svelte`

### Проблема
В карточке стола есть PDF и удаление, но нет копирования ссылки и переименования.

### Почему важно
Владелец не может быстро поделиться ссылкой на стол или исправить название.

### Выбранное решение
Добавить кнопки copy link и rename в `TableCard`.

### Шаги
1. В `TableCard.svelte` добавить:
   - кнопку «Копировать ссылку» с использованием Clipboard API и тостом «Ссылка скопирована»;
   - кнопку «Переименовать», открывающую inline input или modal.
2. Для rename вызвать `PATCH /tables/{id}` с `{ label: "новое название" }`.
3. Обновить список столов после успешного rename.
4. Обеспечить валидацию: пустое название не принимается.

---

## T-21. QR-код не в виде printable layout

**Статус:** pending  
**Тип:** backend + frontend  
**Где:** `apps/api/src/tables/service.rs`, `apps/web/src/lib/components/tables/QrPreview.svelte`

### Проблема
QR выдаётся как простое изображение/PDF с названием заведения и стола. PRD требует printable layout: логотип, название заведения, номер стола, короткая инструкция, fallback-short URL.

### Почему важно
QR-листовка не готова к печати и размещению на столе.

### Выбранное решение
Доработать PDF шаблон согласно PRD.

### Шаги
1. В `generate_table_pdf` добавить:
   - логотип (если загружен);
   - название заведения крупным шрифтом;
   - номер/название стола;
   - короткую инструкцию: «Наведите камеру телефона, чтобы открыть меню»;
   - fallback URL коротким текстом.
2. Улучшить вёрстку PDF: отступы, выравнивание, размер QR-кода.
3. В `QrPreview.svelte` показывать preview готового layout.
4. Добавить кнопку «Скачать PDF» с правильным именем файла `{slug}-table-{label}.pdf`.

---

## T-22. В менеджере меню не хватает действий

**Статус:** pending  
**Тип:** frontend + backend  
**Где:** `apps/web/src/routes/(admin)/app/projects/[id]/menu/+page.svelte`

### Проблема
Сейчас можно только создать/редактировать/удалить категорию и блюдо. PRD требует:
- дублировать блюдо;
- перемещать/менять порядок категорий и блюд;
- скрывать / делать временно недоступным;
- открывать preview;
- импортировать из JSON.

### Почему важно
Управление меню неудобное и не соответствует MVP.

### Выбранное решение
Постепенно добавить недостающие actions.

### Шаги
1. **Duplicate блюда:**
   - добавить кнопку «Дублировать» в `ItemInspector`;
   - backend: `POST /items/{id}/duplicate` или `POST /items` с копией данных.
2. **Reorder:**
   - добавить drag-and-drop для категорий и блюд;
   - backend: `PATCH /categories/reorder` и `PATCH /items/reorder` с массивом id + sort_order.
3. **Hide / temporary unavailable:**
   - добавить quick toggle в `ItemInspector` и карточку блюда;
   - использовать статусы `available`, `hidden`, `unavailable`.
4. **Preview:**
   - добавить кнопку «Открыть preview», открывающую public menu в новой вкладке/модалке.
5. **JSON import:**
   - добавить кнопку «Импортировать из JSON»;
   - backend endpoint `POST /projects/{id}/menu/import` для bulk создания категорий и блюд.
6. Провести работу итерациями: сначала duplicate + hide, затем reorder, затем import.

---

## T-23. Уникальный номер стола

**Статус:** pending  
**Тип:** backend + frontend + БД  
**Где:** `apps/api/migrations/007_tables.sql`, `apps/api/src/tables/models.rs`, `apps/api/src/tables/service.rs`, `apps/web/src/lib/components/tables/TableCard.svelte`, `BulkCreateModal.svelte`

### Проблема
В базе нет уникального идентификатора стола в рамках проекта. `label` может быть любым, включая дубли, что ведёт к путанице.

### Выбранное решение
Добавить числовое поле `number` к таблице `tables`. Поле уникально в рамках `project_id`. `label` остаётся произвольным человекочитаемым названием.

### Шаги
1. В миграции добавить колонку `number INTEGER` и `UNIQUE (project_id, number)`.
2. При создании стола (ручном и bulk) генерировать `number` автоматически: `MAX(number) + 1` для проекта.
3. Позволить редактировать `number` вручную с проверкой уникальности.
4. В `TableResponse` добавить `number`.
5. В UI отображать `number` рядом с `label`: «Стол 12 — у окна».
6. В QR/PDF использовать `number` как основной идентификатор.
7. Добавить тесты на уникальность.

---

## T-24. Статус заказа «Подтверждён»

**Статус:** pending  
**Тип:** backend + frontend  
**Где:** `apps/api/src/venue/models.rs`, `apps/api/migrations/008_guest_sessions.sql`, `apps/web/src/lib/components/venue/WaitingScreen.svelte`

### Проблема
Сейчас цепочка статусов: `submitted → preparing → ready → served`. В PRD: `Отправлен → Подтверждён → Готовится → Скоро принесем`.

### Выбранное решение
Добавить статус `confirmed` между `submitted` и `preparing`.

### Шаги
1. Обновить CHECK constraint в `orders.status`.
2. Обновить `OrderStatus` в shared-types и backend models.
3. В admin panel добавить переход `submitted → confirmed → preparing`.
4. В `WaitingScreen.svelte` отрисовать 4 этапа.
5. Добавить/обновить тесты статусных переходов.

---

## T-25. Типизировать ответ при создании сервис-запроса

**Статус:** pending  
**Тип:** backend + shared types  
**Где:** `apps/api/src/routes/venue.rs`, `packages/shared-types/index.ts`

### Проблема
`POST /public/tables/{token}/service-requests` возвращает `Json<serde_json::Value>`.

### Выбранное решение
Создать `ServiceRequestCreatedResponse { id, status, createdAt }`.

### Шаги
1. В backend создать struct и возвращать его.
2. В shared-types добавить `ServiceRequestCreatedResponse`.
3. Обновить API client метод.
4. Добавить contract test.

---

## T-26. Счётчик позиций в заказе должен считать штуки

**Статус:** pending  
**Тип:** backend  
**Где:** `apps/api/src/venue/service/orders_admin.rs` или где формируется `OrderListItemResponse`

### Проблема
`item_count` = количество строк `order_items`, а не сумма `quantity`.

### Выбранное решение
`item_count = sum(quantity)`.

### Шаги
1. Найти место формирования `OrderListItemResponse`.
2. Заменить подсчёт строк на `items.iter().map(|i| i.quantity).sum()`.
3. Добавить тест с quantity > 1.

---

## T-27. Валюта блюда должна совпадать с валютой проекта

**Статус:** pending  
**Тип:** backend + БД  
**Где:** `apps/api/migrations/005_menu_catalog.sql`, `apps/api/src/menu/models.rs`, `apps/api/src/menu/service/items.rs`

### Проблема
`menu_items.currency` может отличаться от `projects.currency`.

### Выбранное решение
Убрать `currency` из `menu_items` и наследовать от проекта. Либо, если нужна гибкость, добавить валидацию при создании/обновлении блюда.

### Шаги
1. Решить: убрать поле или валидировать.
2. Если убирать — миграция DROP COLUMN, обновить models, убрать из shared types.
3. Если валидировать — в `create_item`/`update_item` проверять `item.currency == project.currency`.
4. Обновить тесты.

---

## T-28. Атомарное создание проекта с темой

**Статус:** pending  
**Тип:** frontend + backend  
**Где:** `apps/web/src/routes/(admin)/app/projects/new/+page.svelte`, `apps/api/src/projects/service.rs`

### Проблема
Создание проекта и обновление темы — два отдельных запроса. Если второй упадёт, проект остаётся без темы.

### Выбранное решение
Создавать проект вместе с дефолтной темой в одном backend-запросе.

### Шаги
1. В `CreateProjectRequest` добавить опциональные theme-поля.
2. В backend `create_project` в одной транзакции создавать `projects` и `project_themes`.
3. В frontend убрать отдельный `updateTheme` после `createProject`.
4. Добавить тест: создание проекта с темой возвращает theme.

---

## T-29. Service requests: sticky dock, confirm sheet, shortcuts на waiting screen

**Статус:** pending  
**Тип:** frontend  
**Где:** `apps/web/src/lib/components/venue/ServiceRequestPanel.svelte`, `apps/web/src/lib/components/venue/WaitingScreen.svelte`, `apps/web/src/routes/(venue)/table/[token]/+page.svelte`

### Проблема
Сервис-запросы открываются из шапки и отправляются сразу. Нет sticky dock, confirm sheet и shortcuts на waiting screen.

### Выбранное решение
Реализовать UI по PRD.

### Шаги
1. **Sticky dock:** добавить закреплённую панель снизу с кнопками: официант, вода, салфетки, счёт.
2. **Confirm sheet:** при тапе по кнопке показывать sheet «Отправить запрос официанту?» с подтверждением.
3. **Waiting screen shortcuts:** добавить блок сервис-запросов на экран ожидания заказа.
4. Обеспечить, чтобы cooldown (T-10) учитывался и в новых компонентах.

---

## T-30. MenuItemCard: вложенные интерактивные элементы

**Статус:** pending  
**Тип:** frontend / a11y  
**Где:** `apps/web/src/lib/components/venue/MenuItemCard.svelte`

### Проблема
Карточка имеет `role="button"`, а внутри неё кнопка quick-add. Получается кнопка внутри кнопки.

### Выбранное решение
Переверстать карточку: основная область — один tab stop, quick-add — отдельный sibling-элемент.

### Шаги
1. Убрать `role="button"` с внешнего контейнера.
2. Сделать карточку семантически `<button>` или `<a>`, но без вложенных кнопок.
3. Quick-add вынести рядом, не вкладывая.
4. Проверить keyboard navigation и screen reader.

---

## T-31. Loading spinner в Button

**Статус:** pending  
**Тип:** frontend  
**Где:** `apps/web/src/lib/components/Button.svelte`

### Проблема
В loading-состоянии кнопка только disabled и меняет текст.

### Выбранное решение
Добавить спиннер внутрь кнопки при `loading=true`.

### Шаги
1. Добавить prop `loading?: boolean`.
2. При `loading` показывать `<span class="spinner">` и сохранять/скрывать текст (или показывать вместе).
3. Обеспечить доступность: `aria-busy="true"`, `aria-label` с состоянием.
4. Использовать везде, где сейчас делают `disabled + "Отправляем..."`.

---

## T-32. Применять theme-флаги `cardStyle` и `largePhotos`

**Статус:** pending  
**Тип:** frontend  
**Где:** `apps/web/src/lib/theme.ts`, `apps/web/src/lib/components/venue/MenuItemCard.svelte`, `DetailSheet.svelte`

### Проблема
`cardStyle` (flat/elevated/outlined/editorial) и `largePhotos` сохраняются, но не влияют на UI.

### Выбранное решение
Применять флаги в venue-компонентах.

### Шаги
1. В `theme.ts` добавить CSS-классы для каждого `cardStyle`.
2. В `MenuItemCard` применять класс в зависимости от `theme.cardStyle`.
3. При `largePhotos` увеличивать размер изображений в карточках и detail sheet.
4. Добавить preview в админке.

---

## T-33. Header не должен мерцать состояние авторизации

**Статус:** pending  
**Тип:** frontend  
**Где:** `apps/web/src/lib/components/Header.svelte`, `apps/web/src/lib/stores/auth.svelte.ts`

### Проблема
На SSR `auth.user` null, поэтому залогиненный пользователь мельком видит «Вход / Регистрация».

### Выбранное решение
Передавать пользователя с сервера через `+layout.server.ts` и инициализировать auth store SSR-значением.

### Шаги
1. В `+layout.server.ts` (marketing + admin) получать пользователя по access token.
2. Передавать пользователя в `data`.
3. В `auth.svelte.ts` инициализировать `user` из `data.user` на сервере.
4. Убедиться, что Header рендерит правильное состояние с первого байта.

---

## T-34. Почистить индексы и добавить CHECK-ограничения

**Статус:** pending  
**Тип:** БД + миграции  
**Где:** `apps/api/migrations/*.sql`

### Проблема
Есть дублирующиеся индексы и отсутствуют CHECK constraints для enum-like колонок.

### Выбранное решение
Удалить дубли, добавить CHECK constraints.

### Шаги
1. Добавить миграцию `014_indexes_and_constraints.sql`.
2. Удалить дублирующиеся индексы:
   - `idx_modifier_groups_menu_item_id`
   - `idx_modifier_options_modifier_group_id`
   - `idx_order_items_order_id`
   - `idx_projects_slug`
   - `idx_refresh_tokens_token_hash`
3. Добавить CHECK constraints:
   - `users.role IN ('admin', 'client', 'visitor')`
   - `projects.status IN ('draft', 'ready', 'published', 'attention')`
   - `projects.mode IN ('promo_only', 'menu_only', 'menu_service', 'menu_order')`
   - `menu_items.availability_status IN ('available', 'unavailable', 'hidden')`
   - `orders.status IN ('submitted', 'confirmed', 'preparing', 'ready', 'served', 'cancelled')`
   - `service_requests.type IN ('waiter', 'water', 'napkins', 'bill')`
   - `service_requests.status IN ('pending', 'in_progress', 'completed', 'cancelled')`
4. Добавить композитные индексы для частых запросов.
5. Проверить `cargo test`.

---

## T-35. Summary-экран после массового создания столов

**Статус:** pending  
**Тип:** frontend  
**Где:** `apps/web/src/routes/(admin)/app/projects/[id]/tables/+page.svelte`, `BulkCreateModal.svelte`

### Проблема
После bulk create пользователь просто видит обновлённый список столов.

### Выбранное решение
Показать экран: «Создано N столиков, QR-коды готовы к печати» с кнопками Download PDF / Preview / Back.

### Шаги
1. После успешного `bulkCreateTables` открывать summary view (модалка или отдельный state).
2. Показывать количество созданных столов.
3. Кнопка «Скачать PDF» — скачать PDF со всеми QR новых столов.
4. Кнопка «Показать превью» — открыть список QR.
5. Кнопка «Вернуться к списку» — закрыть summary.

---

## T-36. Kiosk / tablet режим

**Статус:** pending  
**Тип:** frontend  
**Где:** `apps/web/src/routes/(venue)/table/[token]/+page.svelte`

### Проблема
Нет dedicated режима для планшета на столе.

### Выбранное решение
Добавить toggle kiosk mode и адаптивную вёрстку.

### Шаги
1. Добавить кнопку/toggle «Kiosk mode» в table menu.
2. В kiosk mode:
   - категории сбоку (постоянно видны);
   - корзина справа;
   - карточки блюд крупнее;
   - touch targets ≥ 44×44;
   - fullscreen API по запросу.
3. Добавить admin unlock modal с PIN для выхода (как в прототипе).
4. Обеспечить reduced motion и a11y.

---

## История решений

- **T-00:** rate limiting — удалить полностью.
- **T-01:** режимы публикации — enforce на backend.
- **T-02:** корзина — транзакции + `FOR UPDATE`.
- **T-03:** админка — server-side guard.
- **T-04:** API contracts — выровнять shared types с backend.
- **T-05:** заказ — ревалидировать актуальность и цены.
- **T-06:** refresh — автоматический interceptor.
- **T-07:** публикация — readiness check перед сменой статуса.
- **T-08:** quick add — default values для обязательных модификаторов.
- **T-09:** роли — админ / клиент / посетитель.
- **T-10:** service requests cooldown — перенести на backend.
- **T-11:** повторный заказ — idempotency key.
- **T-12:** modifier sort_order — Option + NULL.
- **T-13:** modifier min/max — merge + validate + write both.
- **T-14..T-22:** PRD gaps — реализовать по PRD.
- **T-23:** стол — уникальный числовой `number`.
- **T-24:** заказ — статус `confirmed`.
- **T-25:** service request response — типизировать.
- **T-26:** order item_count — считать штуки.
- **T-27:** валюта — наследовать от проекта.
- **T-28:** создание проекта — атомарно с темой.
- **T-29:** service requests UI — dock + confirm + shortcuts.
- **T-30:** MenuItemCard — убрать nested controls.
- **T-31:** Button — loading spinner.
- **T-32:** theme — применять `cardStyle` и `largePhotos`.
- **T-33:** Header — убрать auth flash.
- **T-34:** БД — cleanup indexes + CHECK constraints.
- **T-35:** tables bulk create — summary screen.
- **T-36:** kiosk/tablet режим.

---

*Файл TASK.md будет обновляться по мере уточнений и выполнения задач.*
