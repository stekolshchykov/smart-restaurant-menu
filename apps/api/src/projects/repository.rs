use sqlx::{query, query_as, Executor, PgPool};
use uuid::Uuid;

use crate::error::AppError;
use crate::projects::models::{
    CreateProjectRequest, Project, ProjectTheme, UpdateProjectRequest, UpdateProjectThemeRequest,
};

pub async fn create_project<'e, E>(
    executor: E,
    owner_id: Uuid,
    req: &CreateProjectRequest,
) -> Result<Project, AppError>
where
    E: Executor<'e, Database = sqlx::Postgres>,
{
    query_as::<_, Project>(
        "INSERT INTO projects (owner_id, name, slug, type, description, locale, currency, mode)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id, owner_id, name, slug, type, description, locale, currency, mode, status, created_at, updated_at",
    )
    .bind(owner_id)
    .bind(&req.name)
    .bind(&req.slug)
    .bind(&req.r#type)
    .bind(&req.description)
    .bind(&req.locale)
    .bind(&req.currency)
    .bind(&req.mode)
    .fetch_one(executor)
    .await
    .map_err(map_unique_violation)
}

pub async fn list_projects(pool: &PgPool, owner_id: Uuid) -> Result<Vec<Project>, AppError> {
    query_as::<_, Project>(
        "SELECT id, owner_id, name, slug, type, description, locale, currency, mode, status, created_at, updated_at
         FROM projects
         WHERE owner_id = $1
         ORDER BY created_at DESC",
    )
    .bind(owner_id)
    .fetch_all(pool)
    .await
    .map_err(AppError::from)
}

pub async fn get_project(pool: &PgPool, id: Uuid) -> Result<Option<Project>, AppError> {
    query_as::<_, Project>(
        "SELECT id, owner_id, name, slug, type, description, locale, currency, mode, status, created_at, updated_at
         FROM projects
         WHERE id = $1",
    )
    .bind(id)
    .fetch_optional(pool)
    .await
    .map_err(AppError::from)
}

pub async fn get_project_by_slug(pool: &PgPool, slug: &str) -> Result<Option<Project>, AppError> {
    query_as::<_, Project>(
        "SELECT id, owner_id, name, slug, type, description, locale, currency, mode, status, created_at, updated_at
         FROM projects
         WHERE slug = $1",
    )
    .bind(slug)
    .fetch_optional(pool)
    .await
    .map_err(AppError::from)
}

pub async fn update_project<'e, E>(
    executor: E,
    id: Uuid,
    req: &UpdateProjectRequest,
) -> Result<Project, AppError>
where
    E: Executor<'e, Database = sqlx::Postgres>,
{
    query_as::<_, Project>(
        "UPDATE projects
         SET
             name = COALESCE($2, name),
             slug = COALESCE($3, slug),
             type = COALESCE($4, type),
             description = COALESCE($5, description),
             locale = COALESCE($6, locale),
             currency = COALESCE($7, currency),
             mode = COALESCE($8, mode),
             status = COALESCE($9, status),
             updated_at = now()
         WHERE id = $1
         RETURNING id, owner_id, name, slug, type, description, locale, currency, mode, status, created_at, updated_at",
    )
    .bind(id)
    .bind(&req.name)
    .bind(&req.slug)
    .bind(&req.r#type)
    .bind(&req.description)
    .bind(&req.locale)
    .bind(&req.currency)
    .bind(&req.mode)
    .bind(&req.status)
    .fetch_one(executor)
    .await
    .map_err(map_unique_violation)
}

pub async fn delete_project<'e, E>(executor: E, id: Uuid) -> Result<(), AppError>
where
    E: Executor<'e, Database = sqlx::Postgres>,
{
    let result = query("DELETE FROM projects WHERE id = $1")
        .bind(id)
        .execute(executor)
        .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::ProjectNotFound);
    }

    Ok(())
}

pub async fn create_or_update_theme<'e, E>(
    executor: E,
    project_id: Uuid,
    req: &UpdateProjectThemeRequest,
) -> Result<ProjectTheme, AppError>
where
    E: Executor<'e, Database = sqlx::Postgres>,
{
    query_as::<_, ProjectTheme>(
        "INSERT INTO project_themes (
            project_id, appearance, accent_color, card_style, button_shape,
            show_large_photos, use_promo_page, logo_url, hero_url
         )
         VALUES (
            $1,
            COALESCE($2, 'dark'),
            COALESCE($3, '#c9a227'),
            COALESCE($4, 'elevated'),
            COALESCE($5, 'rounded'),
            COALESCE($6, true),
            COALESCE($7, true),
            $8,
            $9
         )
         ON CONFLICT (project_id)
         DO UPDATE SET
             appearance = COALESCE(EXCLUDED.appearance, project_themes.appearance),
             accent_color = COALESCE(EXCLUDED.accent_color, project_themes.accent_color),
             card_style = COALESCE(EXCLUDED.card_style, project_themes.card_style),
             button_shape = COALESCE(EXCLUDED.button_shape, project_themes.button_shape),
             show_large_photos = COALESCE(EXCLUDED.show_large_photos, project_themes.show_large_photos),
             use_promo_page = COALESCE(EXCLUDED.use_promo_page, project_themes.use_promo_page),
             logo_url = COALESCE(EXCLUDED.logo_url, project_themes.logo_url),
             hero_url = COALESCE(EXCLUDED.hero_url, project_themes.hero_url),
             updated_at = now()
         RETURNING project_id, appearance, accent_color, card_style, button_shape,
                   show_large_photos, use_promo_page, logo_url, hero_url, created_at, updated_at",
    )
    .bind(project_id)
    .bind(&req.appearance)
    .bind(&req.accent_color)
    .bind(&req.card_style)
    .bind(&req.button_shape)
    .bind(req.show_large_photos)
    .bind(req.use_promo_page)
    .bind(&req.logo_url)
    .bind(&req.hero_url)
    .fetch_one(executor)
    .await
    .map_err(AppError::from)
}

pub async fn get_theme(pool: &PgPool, project_id: Uuid) -> Result<Option<ProjectTheme>, AppError> {
    query_as::<_, ProjectTheme>(
        "SELECT project_id, appearance, accent_color, card_style, button_shape,
                show_large_photos, use_promo_page, logo_url, hero_url, created_at, updated_at
         FROM project_themes
         WHERE project_id = $1",
    )
    .bind(project_id)
    .fetch_optional(pool)
    .await
    .map_err(AppError::from)
}

fn map_unique_violation(err: sqlx::Error) -> AppError {
    if let sqlx::Error::Database(db_err) = &err {
        if db_err.constraint() == Some("projects_slug_key") {
            return AppError::SlugTaken;
        }
    }
    AppError::from(err)
}
