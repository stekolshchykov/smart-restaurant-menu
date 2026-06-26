use sqlx::{query, query_as, query_scalar, Executor, PgPool};
use uuid::Uuid;

use crate::error::AppError;
use crate::menu::models::{CreateMenuItemRequest, MenuItem, UpdateMenuItemRequest};

pub async fn list_by_project(pool: &PgPool, project_id: Uuid) -> Result<Vec<MenuItem>, AppError> {
    query_as::<_, MenuItem>(
        "SELECT i.id, i.category_id, i.name, i.short_description, i.description,
                i.price, i.currency, i.image_url, i.images, i.ingredients,
                i.availability_status, i.quick_add_enabled, i.sort_order,
                i.created_at, i.updated_at
         FROM menu_items i
         JOIN categories c ON c.id = i.category_id
         WHERE c.project_id = $1
         ORDER BY i.sort_order, i.name",
    )
    .bind(project_id)
    .fetch_all(pool)
    .await
    .map_err(AppError::from)
}

pub async fn get(pool: &PgPool, id: Uuid) -> Result<Option<MenuItem>, AppError> {
    query_as::<_, MenuItem>(
        "SELECT id, category_id, name, short_description, description,
                price, currency, image_url, images, ingredients,
                availability_status, quick_add_enabled, sort_order,
                created_at, updated_at
         FROM menu_items
         WHERE id = $1",
    )
    .bind(id)
    .fetch_optional(pool)
    .await
    .map_err(AppError::from)
}

pub async fn project_id(pool: &PgPool, id: Uuid) -> Result<Option<Uuid>, AppError> {
    query_scalar::<_, Uuid>(
        "SELECT c.project_id
         FROM menu_items i
         JOIN categories c ON c.id = i.category_id
         WHERE i.id = $1",
    )
    .bind(id)
    .fetch_optional(pool)
    .await
    .map_err(AppError::from)
}

pub async fn create<'e, E>(
    executor: E,
    category_id: Uuid,
    currency: &str,
    req: &CreateMenuItemRequest,
) -> Result<MenuItem, AppError>
where
    E: Executor<'e, Database = sqlx::Postgres>,
{
    query_as::<_, MenuItem>(
        "INSERT INTO menu_items (
            category_id, name, short_description, description, price, currency,
            image_url, images, ingredients, availability_status, quick_add_enabled, sort_order
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING id, category_id, name, short_description, description,
                   price, currency, image_url, images, ingredients,
                   availability_status, quick_add_enabled, sort_order,
                   created_at, updated_at",
    )
    .bind(category_id)
    .bind(&req.name)
    .bind(&req.short_description)
    .bind(&req.description)
    .bind(&req.price)
    .bind(currency)
    .bind(&req.image_url)
    .bind(req.images.as_deref().unwrap_or(&[]))
    .bind(req.ingredients.as_deref().unwrap_or(&[]))
    .bind(req.availability_status.as_deref().unwrap_or("available"))
    .bind(req.quick_add_enabled.unwrap_or(true))
    .bind(req.sort_order.unwrap_or(0))
    .fetch_one(executor)
    .await
    .map_err(AppError::from)
}

pub async fn update<'e, E>(
    executor: E,
    id: Uuid,
    req: &UpdateMenuItemRequest,
) -> Result<MenuItem, AppError>
where
    E: Executor<'e, Database = sqlx::Postgres>,
{
    query_as::<_, MenuItem>(
        "UPDATE menu_items
         SET name = COALESCE($2, name),
             short_description = COALESCE($3, short_description),
             description = COALESCE($4, description),
             price = COALESCE($5, price),
             image_url = COALESCE($6, image_url),
             images = COALESCE($7, images),
             ingredients = COALESCE($8, ingredients),
             availability_status = COALESCE($9, availability_status),
             quick_add_enabled = COALESCE($10, quick_add_enabled),
             sort_order = COALESCE($11, sort_order),
             updated_at = now()
         WHERE id = $1
         RETURNING id, category_id, name, short_description, description,
                   price, currency, image_url, images, ingredients,
                   availability_status, quick_add_enabled, sort_order,
                   created_at, updated_at",
    )
    .bind(id)
    .bind(&req.name)
    .bind(&req.short_description)
    .bind(&req.description)
    .bind(&req.price)
    .bind(&req.image_url)
    .bind(&req.images)
    .bind(&req.ingredients)
    .bind(&req.availability_status)
    .bind(req.quick_add_enabled)
    .bind(req.sort_order)
    .fetch_one(executor)
    .await
    .map_err(AppError::from)
}

pub async fn delete<'e, E>(executor: E, id: Uuid) -> Result<(), AppError>
where
    E: Executor<'e, Database = sqlx::Postgres>,
{
    let result = query("DELETE FROM menu_items WHERE id = $1")
        .bind(id)
        .execute(executor)
        .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::MenuItemNotFound);
    }

    Ok(())
}

pub async fn add_allergens<'e, E>(
    executor: E,
    item_id: Uuid,
    allergen_ids: &[Uuid],
) -> Result<(), AppError>
where
    E: Executor<'e, Database = sqlx::Postgres>,
{
    query(
        "INSERT INTO item_allergens (menu_item_id, allergen_id)
         SELECT $1, unnest($2::uuid[])
         ON CONFLICT DO NOTHING",
    )
    .bind(item_id)
    .bind(allergen_ids)
    .execute(executor)
    .await?;

    Ok(())
}

pub async fn clear_allergens<'e, E>(executor: E, item_id: Uuid) -> Result<(), AppError>
where
    E: Executor<'e, Database = sqlx::Postgres>,
{
    query("DELETE FROM item_allergens WHERE menu_item_id = $1")
        .bind(item_id)
        .execute(executor)
        .await?;

    Ok(())
}

pub async fn add_tags<'e, E>(executor: E, item_id: Uuid, tag_ids: &[Uuid]) -> Result<(), AppError>
where
    E: Executor<'e, Database = sqlx::Postgres>,
{
    query(
        "INSERT INTO item_tags (menu_item_id, tag_id)
         SELECT $1, unnest($2::uuid[])
         ON CONFLICT DO NOTHING",
    )
    .bind(item_id)
    .bind(tag_ids)
    .execute(executor)
    .await?;

    Ok(())
}

pub async fn clear_tags<'e, E>(executor: E, item_id: Uuid) -> Result<(), AppError>
where
    E: Executor<'e, Database = sqlx::Postgres>,
{
    query("DELETE FROM item_tags WHERE menu_item_id = $1")
        .bind(item_id)
        .execute(executor)
        .await?;

    Ok(())
}

#[derive(Debug, sqlx::FromRow)]
pub struct AllergenRow {
    pub menu_item_id: Uuid,
    pub id: Uuid,
    pub project_id: Uuid,
    pub name: String,
    pub code: Option<String>,
}

pub async fn list_allergens(
    pool: &PgPool,
    item_ids: &[Uuid],
) -> Result<Vec<AllergenRow>, AppError> {
    query_as::<_, AllergenRow>(
        "SELECT ia.menu_item_id, a.id, a.project_id, a.name, a.code
         FROM item_allergens ia
         JOIN allergens a ON a.id = ia.allergen_id
         WHERE ia.menu_item_id = ANY($1)
         ORDER BY a.name",
    )
    .bind(item_ids)
    .fetch_all(pool)
    .await
    .map_err(AppError::from)
}

#[derive(Debug, sqlx::FromRow)]
pub struct TagRow {
    pub menu_item_id: Uuid,
    pub id: Uuid,
    pub project_id: Uuid,
    pub name: String,
    pub code: Option<String>,
    pub kind: String,
}

pub async fn list_tags(pool: &PgPool, item_ids: &[Uuid]) -> Result<Vec<TagRow>, AppError> {
    query_as::<_, TagRow>(
        "SELECT it.menu_item_id, t.id, t.project_id, t.name, t.code, t.kind
         FROM item_tags it
         JOIN tags t ON t.id = it.tag_id
         WHERE it.menu_item_id = ANY($1)
         ORDER BY t.name",
    )
    .bind(item_ids)
    .fetch_all(pool)
    .await
    .map_err(AppError::from)
}
