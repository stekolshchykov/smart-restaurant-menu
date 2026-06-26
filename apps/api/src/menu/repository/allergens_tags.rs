use sqlx::{query_as, Executor, PgPool};
use uuid::Uuid;

use crate::error::AppError;
use crate::menu::models::{Allergen, CreateAllergenRequest, CreateTagRequest, Tag};

pub async fn list_allergens(pool: &PgPool, project_id: Uuid) -> Result<Vec<Allergen>, AppError> {
    query_as::<_, Allergen>(
        "SELECT id, project_id, name, code
         FROM allergens
         WHERE project_id = $1
         ORDER BY name",
    )
    .bind(project_id)
    .fetch_all(pool)
    .await
    .map_err(AppError::from)
}

pub async fn create_allergen<'e, E>(
    executor: E,
    project_id: Uuid,
    req: &CreateAllergenRequest,
) -> Result<Allergen, AppError>
where
    E: Executor<'e, Database = sqlx::Postgres>,
{
    query_as::<_, Allergen>(
        "INSERT INTO allergens (project_id, name, code)
         VALUES ($1, $2, $3)
         RETURNING id, project_id, name, code",
    )
    .bind(project_id)
    .bind(&req.name)
    .bind(&req.code)
    .fetch_one(executor)
    .await
    .map_err(AppError::from)
}

pub async fn list_tags(pool: &PgPool, project_id: Uuid) -> Result<Vec<Tag>, AppError> {
    query_as::<_, Tag>(
        "SELECT id, project_id, name, code, kind
         FROM tags
         WHERE project_id = $1
         ORDER BY name",
    )
    .bind(project_id)
    .fetch_all(pool)
    .await
    .map_err(AppError::from)
}

pub async fn create_tag<'e, E>(
    executor: E,
    project_id: Uuid,
    req: &CreateTagRequest,
) -> Result<Tag, AppError>
where
    E: Executor<'e, Database = sqlx::Postgres>,
{
    query_as::<_, Tag>(
        "INSERT INTO tags (project_id, name, code, kind)
         VALUES ($1, $2, $3, COALESCE($4, 'dietary'))
         RETURNING id, project_id, name, code, kind",
    )
    .bind(project_id)
    .bind(&req.name)
    .bind(&req.code)
    .bind(&req.kind)
    .fetch_one(executor)
    .await
    .map_err(AppError::from)
}
