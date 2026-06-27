use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;
use crate::menu::service::tree;
use crate::projects::models::{Project, ProjectTheme, ProjectThemeResponse};
use crate::projects::repository as projects_repo;
use crate::state::AppState;
use crate::tables::repository as tables_repo;
use crate::venue::models::{PublicMenuResponse, PublicProjectResponse, PublicTableResponse};

fn is_public_project(project: &Project) -> bool {
    project.status == "published"
}

fn theme_response(theme: Option<ProjectTheme>) -> ProjectThemeResponse {
    match theme {
        Some(t) => ProjectThemeResponse {
            project_id: t.project_id,
            appearance: t.appearance,
            accent_color: t.accent_color,
            card_style: t.card_style,
            button_shape: t.button_shape,
            show_large_photos: t.show_large_photos,
            use_promo_page: t.use_promo_page,
            logo_url: t.logo_url,
            hero_url: t.hero_url,
        },
        None => ProjectThemeResponse {
            project_id: Uuid::nil(),
            appearance: "dark".to_string(),
            accent_color: "#c9a227".to_string(),
            card_style: "editorial".to_string(),
            button_shape: "rounded".to_string(),
            show_large_photos: true,
            use_promo_page: true,
            logo_url: None,
            hero_url: None,
        },
    }
}

fn to_public_project_response(
    project: Project,
    theme: Option<ProjectTheme>,
) -> PublicProjectResponse {
    PublicProjectResponse {
        id: project.id,
        name: project.name,
        slug: project.slug,
        r#type: project.r#type,
        description: project.description,
        locale: project.locale,
        currency: project.currency,
        mode: project.mode,
        theme: theme_response(theme),
        contact_info: None,
    }
}

pub async fn accessible_table(
    pool: &PgPool,
    token: &str,
) -> Result<crate::tables::models::Table, AppError> {
    let table = tables_repo::get_by_token(pool, token)
        .await?
        .ok_or(AppError::TableNotFound)?;

    if !table.active {
        return Err(AppError::TableNotFound);
    }

    let project = projects_repo::get_project(pool, table.project_id)
        .await?
        .ok_or(AppError::ProjectNotFound)?;

    if !is_public_project(&project) {
        return Err(AppError::TableNotFound);
    }

    Ok(table)
}

pub async fn get_public_project_by_slug(
    state: &AppState,
    slug: &str,
) -> Result<PublicProjectResponse, AppError> {
    let project = projects_repo::get_project_by_slug(&state.db, slug)
        .await?
        .ok_or(AppError::ProjectNotFound)?;

    if !is_public_project(&project) {
        return Err(AppError::ProjectNotPublished);
    }

    let theme = projects_repo::get_theme(&state.db, project.id).await?;
    Ok(to_public_project_response(project, theme))
}

pub async fn get_public_menu_by_slug(
    state: &AppState,
    slug: &str,
) -> Result<PublicMenuResponse, AppError> {
    let project = projects_repo::get_project_by_slug(&state.db, slug)
        .await?
        .ok_or(AppError::ProjectNotFound)?;

    if project.status != "published" || project.mode == "promo_only" {
        return Err(AppError::ProjectNotPublished);
    }

    tree::get_public_menu_tree(state, project.id).await
}

pub async fn get_public_table(
    state: &AppState,
    token: &str,
) -> Result<PublicTableResponse, AppError> {
    let table = accessible_table(&state.db, token).await?;
    let project = projects_repo::get_project(&state.db, table.project_id)
        .await?
        .ok_or(AppError::ProjectNotFound)?;
    let theme = projects_repo::get_theme(&state.db, project.id).await?;

    Ok(PublicTableResponse {
        table_id: table.id,
        label: table.label,
        token: table.token,
        project: to_public_project_response(project, theme),
    })
}
