use sqlx::{query, query_as, query_scalar, Executor, PgPool};
use uuid::Uuid;

use crate::error::AppError;
use crate::tables::models::{Table, UpdateTableRequest};

pub async fn create<'e, E>(
    executor: E,
    project_id: Uuid,
    label: &str,
    token: &str,
    active: bool,
    sort_order: i32,
) -> Result<Table, AppError>
where
    E: Executor<'e, Database = sqlx::Postgres>,
{
    query_as::<_, Table>(
        "INSERT INTO tables (project_id, label, token, active, sort_order)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, project_id, label, token, active, sort_order, created_at, updated_at",
    )
    .bind(project_id)
    .bind(label)
    .bind(token)
    .bind(active)
    .bind(sort_order)
    .fetch_one(executor)
    .await
    .map_err(AppError::from)
}

pub async fn list_by_project(pool: &PgPool, project_id: Uuid) -> Result<Vec<Table>, AppError> {
    query_as::<_, Table>(
        "SELECT id, project_id, label, token, active, sort_order, created_at, updated_at
         FROM tables
         WHERE project_id = $1
         ORDER BY sort_order, label",
    )
    .bind(project_id)
    .fetch_all(pool)
    .await
    .map_err(AppError::from)
}

pub async fn get(pool: &PgPool, id: Uuid) -> Result<Option<Table>, AppError> {
    query_as::<_, Table>(
        "SELECT id, project_id, label, token, active, sort_order, created_at, updated_at
         FROM tables
         WHERE id = $1",
    )
    .bind(id)
    .fetch_optional(pool)
    .await
    .map_err(AppError::from)
}

pub async fn get_by_token(pool: &PgPool, token: &str) -> Result<Option<Table>, AppError> {
    query_as::<_, Table>(
        "SELECT id, project_id, label, token, active, sort_order, created_at, updated_at
         FROM tables
         WHERE token = $1",
    )
    .bind(token)
    .fetch_optional(pool)
    .await
    .map_err(AppError::from)
}

pub async fn update<'e, E>(
    executor: E,
    id: Uuid,
    req: &UpdateTableRequest,
) -> Result<Table, AppError>
where
    E: Executor<'e, Database = sqlx::Postgres>,
{
    query_as::<_, Table>(
        "UPDATE tables
         SET label = COALESCE($2, label),
             active = COALESCE($3, active),
             sort_order = COALESCE($4, sort_order),
             updated_at = now()
         WHERE id = $1
         RETURNING id, project_id, label, token, active, sort_order, created_at, updated_at",
    )
    .bind(id)
    .bind(&req.label)
    .bind(req.active)
    .bind(req.sort_order)
    .fetch_one(executor)
    .await
    .map_err(AppError::from)
}

pub async fn delete<'e, E>(executor: E, id: Uuid) -> Result<(), AppError>
where
    E: Executor<'e, Database = sqlx::Postgres>,
{
    let result = query("DELETE FROM tables WHERE id = $1")
        .bind(id)
        .execute(executor)
        .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::TableNotFound);
    }

    Ok(())
}

pub async fn token_exists(pool: &PgPool, token: &str) -> Result<bool, AppError> {
    query_scalar::<_, bool>("SELECT EXISTS(SELECT 1 FROM tables WHERE token = $1)")
        .bind(token)
        .fetch_one(pool)
        .await
        .map_err(AppError::from)
}

pub async fn count_by_project(pool: &PgPool, project_id: Uuid) -> Result<i64, AppError> {
    query_scalar::<_, i64>("SELECT COUNT(*) FROM tables WHERE project_id = $1")
        .bind(project_id)
        .fetch_one(pool)
        .await
        .map_err(AppError::from)
}
