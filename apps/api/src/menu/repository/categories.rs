use sqlx::{query, query_as, query_scalar, Executor, PgPool};
use uuid::Uuid;

use crate::error::AppError;
use crate::menu::models::{Category, CreateCategoryRequest, UpdateCategoryRequest};

pub async fn list(pool: &PgPool, project_id: Uuid) -> Result<Vec<Category>, AppError> {
    query_as::<_, Category>(
        "SELECT id, project_id, name, sort_order, created_at, updated_at
         FROM categories
         WHERE project_id = $1
         ORDER BY sort_order, name",
    )
    .bind(project_id)
    .fetch_all(pool)
    .await
    .map_err(AppError::from)
}

pub async fn count_by_project(pool: &PgPool, project_id: Uuid) -> Result<i64, AppError> {
    query_scalar::<_, i64>("SELECT COUNT(*) FROM categories WHERE project_id = $1")
        .bind(project_id)
        .fetch_one(pool)
        .await
        .map_err(AppError::from)
}

pub async fn create<'e, E>(
    executor: E,
    project_id: Uuid,
    req: &CreateCategoryRequest,
) -> Result<Category, AppError>
where
    E: Executor<'e, Database = sqlx::Postgres>,
{
    query_as::<_, Category>(
        "INSERT INTO categories (project_id, name, sort_order)
         VALUES ($1, $2, $3)
         RETURNING id, project_id, name, sort_order, created_at, updated_at",
    )
    .bind(project_id)
    .bind(&req.name)
    .bind(req.sort_order)
    .fetch_one(executor)
    .await
    .map_err(AppError::from)
}

pub async fn get(pool: &PgPool, id: Uuid) -> Result<Option<Category>, AppError> {
    query_as::<_, Category>(
        "SELECT id, project_id, name, sort_order, created_at, updated_at
         FROM categories
         WHERE id = $1",
    )
    .bind(id)
    .fetch_optional(pool)
    .await
    .map_err(AppError::from)
}

pub async fn project_id(pool: &PgPool, id: Uuid) -> Result<Option<Uuid>, AppError> {
    query_scalar::<_, Uuid>("SELECT project_id FROM categories WHERE id = $1")
        .bind(id)
        .fetch_optional(pool)
        .await
        .map_err(AppError::from)
}

pub async fn update<'e, E>(
    executor: E,
    id: Uuid,
    req: &UpdateCategoryRequest,
) -> Result<Category, AppError>
where
    E: Executor<'e, Database = sqlx::Postgres>,
{
    query_as::<_, Category>(
        "UPDATE categories
         SET name = COALESCE($2, name),
             sort_order = COALESCE($3, sort_order),
             updated_at = now()
         WHERE id = $1
         RETURNING id, project_id, name, sort_order, created_at, updated_at",
    )
    .bind(id)
    .bind(&req.name)
    .bind(req.sort_order)
    .fetch_one(executor)
    .await
    .map_err(AppError::from)
}

pub async fn delete<'e, E>(executor: E, id: Uuid) -> Result<(), AppError>
where
    E: Executor<'e, Database = sqlx::Postgres>,
{
    let result = query("DELETE FROM categories WHERE id = $1")
        .bind(id)
        .execute(executor)
        .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::CategoryNotFound);
    }

    Ok(())
}
