use sqlx::{query, query_as, query_scalar, Executor, PgPool};
use uuid::Uuid;

use crate::error::AppError;
use crate::menu::models::{
    CreateModifierGroupRequest, CreateModifierOptionRequest, ModifierGroup, ModifierOption,
    UpdateModifierGroupRequest, UpdateModifierOptionRequest,
};

pub async fn create_group<'e, E>(
    executor: E,
    menu_item_id: Uuid,
    req: &CreateModifierGroupRequest,
) -> Result<ModifierGroup, AppError>
where
    E: Executor<'e, Database = sqlx::Postgres>,
{
    query_as::<_, ModifierGroup>(
        "INSERT INTO modifier_groups (menu_item_id, name, required, min_select, max_select, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, menu_item_id, name, required, min_select, max_select, sort_order",
    )
    .bind(menu_item_id)
    .bind(&req.name)
    .bind(req.required)
    .bind(req.min_select)
    .bind(req.max_select)
    .bind(req.sort_order)
    .fetch_one(executor)
    .await
    .map_err(AppError::from)
}

pub async fn get_group(pool: &PgPool, id: Uuid) -> Result<Option<ModifierGroup>, AppError> {
    query_as::<_, ModifierGroup>(
        "SELECT id, menu_item_id, name, required, min_select, max_select, sort_order
         FROM modifier_groups
         WHERE id = $1",
    )
    .bind(id)
    .fetch_optional(pool)
    .await
    .map_err(AppError::from)
}

pub async fn group_project_id(pool: &PgPool, id: Uuid) -> Result<Option<Uuid>, AppError> {
    query_scalar::<_, Uuid>(
        "SELECT c.project_id
         FROM modifier_groups g
         JOIN menu_items i ON i.id = g.menu_item_id
         JOIN categories c ON c.id = i.category_id
         WHERE g.id = $1",
    )
    .bind(id)
    .fetch_optional(pool)
    .await
    .map_err(AppError::from)
}

pub async fn update_group<'e, E>(
    executor: E,
    id: Uuid,
    req: &UpdateModifierGroupRequest,
) -> Result<ModifierGroup, AppError>
where
    E: Executor<'e, Database = sqlx::Postgres>,
{
    query_as::<_, ModifierGroup>(
        "UPDATE modifier_groups
         SET name = COALESCE($2, name),
             required = COALESCE($3, required),
             min_select = COALESCE($4, min_select),
             max_select = COALESCE($5, max_select),
             sort_order = COALESCE($6, sort_order)
         WHERE id = $1
         RETURNING id, menu_item_id, name, required, min_select, max_select, sort_order",
    )
    .bind(id)
    .bind(&req.name)
    .bind(req.required)
    .bind(req.min_select)
    .bind(req.max_select)
    .bind(req.sort_order)
    .fetch_one(executor)
    .await
    .map_err(AppError::from)
}

pub async fn delete_group<'e, E>(executor: E, id: Uuid) -> Result<(), AppError>
where
    E: Executor<'e, Database = sqlx::Postgres>,
{
    let result = query("DELETE FROM modifier_groups WHERE id = $1")
        .bind(id)
        .execute(executor)
        .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::ModifierGroupNotFound);
    }

    Ok(())
}

pub async fn list_groups_for_items(
    pool: &PgPool,
    item_ids: &[Uuid],
) -> Result<Vec<ModifierGroup>, AppError> {
    query_as::<_, ModifierGroup>(
        "SELECT id, menu_item_id, name, required, min_select, max_select, sort_order
         FROM modifier_groups
         WHERE menu_item_id = ANY($1)
         ORDER BY sort_order, name",
    )
    .bind(item_ids)
    .fetch_all(pool)
    .await
    .map_err(AppError::from)
}

pub async fn create_option<'e, E>(
    executor: E,
    modifier_group_id: Uuid,
    req: &CreateModifierOptionRequest,
) -> Result<ModifierOption, AppError>
where
    E: Executor<'e, Database = sqlx::Postgres>,
{
    query_as::<_, ModifierOption>(
        "INSERT INTO modifier_options (modifier_group_id, name, price, sort_order)
         VALUES ($1, $2, $3, $4)
         RETURNING id, modifier_group_id, name, price, sort_order",
    )
    .bind(modifier_group_id)
    .bind(&req.name)
    .bind(&req.price)
    .bind(req.sort_order)
    .fetch_one(executor)
    .await
    .map_err(AppError::from)
}

pub async fn get_option(pool: &PgPool, id: Uuid) -> Result<Option<ModifierOption>, AppError> {
    query_as::<_, ModifierOption>(
        "SELECT id, modifier_group_id, name, price, sort_order
         FROM modifier_options
         WHERE id = $1",
    )
    .bind(id)
    .fetch_optional(pool)
    .await
    .map_err(AppError::from)
}

pub async fn option_project_id(pool: &PgPool, id: Uuid) -> Result<Option<Uuid>, AppError> {
    query_scalar::<_, Uuid>(
        "SELECT c.project_id
         FROM modifier_options o
         JOIN modifier_groups g ON g.id = o.modifier_group_id
         JOIN menu_items i ON i.id = g.menu_item_id
         JOIN categories c ON c.id = i.category_id
         WHERE o.id = $1",
    )
    .bind(id)
    .fetch_optional(pool)
    .await
    .map_err(AppError::from)
}

pub async fn update_option<'e, E>(
    executor: E,
    id: Uuid,
    req: &UpdateModifierOptionRequest,
) -> Result<ModifierOption, AppError>
where
    E: Executor<'e, Database = sqlx::Postgres>,
{
    query_as::<_, ModifierOption>(
        "UPDATE modifier_options
         SET name = COALESCE($2, name),
             price = COALESCE($3, price),
             sort_order = COALESCE($4, sort_order)
         WHERE id = $1
         RETURNING id, modifier_group_id, name, price, sort_order",
    )
    .bind(id)
    .bind(&req.name)
    .bind(&req.price)
    .bind(req.sort_order)
    .fetch_one(executor)
    .await
    .map_err(AppError::from)
}

pub async fn delete_option<'e, E>(executor: E, id: Uuid) -> Result<(), AppError>
where
    E: Executor<'e, Database = sqlx::Postgres>,
{
    let result = query("DELETE FROM modifier_options WHERE id = $1")
        .bind(id)
        .execute(executor)
        .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::ModifierOptionNotFound);
    }

    Ok(())
}

pub async fn list_options_for_groups(
    pool: &PgPool,
    group_ids: &[Uuid],
) -> Result<Vec<ModifierOption>, AppError> {
    query_as::<_, ModifierOption>(
        "SELECT id, modifier_group_id, name, price, sort_order
         FROM modifier_options
         WHERE modifier_group_id = ANY($1)
         ORDER BY sort_order, name",
    )
    .bind(group_ids)
    .fetch_all(pool)
    .await
    .map_err(AppError::from)
}
