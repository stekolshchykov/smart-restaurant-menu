use std::sync::LazyLock;

use regex::Regex;
use sqlx::PgPool;
use uuid::Uuid;

use crate::auth::middleware::CurrentUser;
use crate::error::AppError;
use crate::projects::models::{
    CreateProjectRequest, Project, ProjectResponse, ProjectTheme, ProjectThemeResponse,
    UpdateProjectRequest, UpdateProjectThemeRequest,
};
use crate::projects::repository;
use crate::state::AppState;

static SLUG_RE: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"^[a-z0-9_-]{2,50}$").expect("slug regex is valid"));

const DEFAULT_LOCALE: &str = "ru";
const DEFAULT_CURRENCY: &str = "RUB";
const DEFAULT_MODE: &str = "menu_order";
const VALID_MODES: &[&str] = &["promo_only", "menu_only", "menu_service", "menu_order"];
const VALID_STATUSES: &[&str] = &["draft", "ready", "published", "attention"];

pub async fn create_project(
    state: &AppState,
    current_user: &CurrentUser,
    mut req: CreateProjectRequest,
) -> Result<ProjectResponse, AppError> {
    validate_slug(&req.slug)?;

    req.locale.get_or_insert_with(|| DEFAULT_LOCALE.to_string());
    req.currency
        .get_or_insert_with(|| DEFAULT_CURRENCY.to_string());
    req.mode.get_or_insert_with(|| DEFAULT_MODE.to_string());

    validate_mode(req.mode.as_deref().expect("mode was just set"))?;

    let mut tx = state.db.begin().await?;
    let project = repository::create_project(&mut *tx, current_user.id, &req).await?;
    let theme = repository::create_or_update_theme(
        &mut *tx,
        project.id,
        &UpdateProjectThemeRequest::default(),
    )
    .await?;
    tx.commit().await?;

    Ok(to_response(project, theme))
}

pub async fn list_projects(
    state: &AppState,
    current_user: &CurrentUser,
) -> Result<Vec<ProjectResponse>, AppError> {
    let projects = repository::list_projects(&state.db, current_user.id).await?;
    let mut responses = Vec::with_capacity(projects.len());

    for project in projects {
        let theme = get_or_create_default_theme(&state.db, project.id).await?;
        responses.push(to_response(project, theme));
    }

    Ok(responses)
}

pub async fn get_project(
    state: &AppState,
    current_user: &CurrentUser,
    id: Uuid,
) -> Result<ProjectResponse, AppError> {
    let project = repository::get_project(&state.db, id)
        .await?
        .ok_or(AppError::ProjectNotFound)?;

    ensure_owner(&project, current_user)?;

    let theme = get_or_create_default_theme(&state.db, id).await?;

    Ok(to_response(project, theme))
}

pub async fn update_project(
    state: &AppState,
    current_user: &CurrentUser,
    id: Uuid,
    req: UpdateProjectRequest,
) -> Result<ProjectResponse, AppError> {
    let existing = repository::get_project(&state.db, id)
        .await?
        .ok_or(AppError::ProjectNotFound)?;

    ensure_owner(&existing, current_user)?;

    if let Some(slug) = &req.slug {
        validate_slug(slug)?;
        if slug != &existing.slug
            && repository::get_project_by_slug(&state.db, slug)
                .await?
                .is_some()
        {
            return Err(AppError::SlugTaken);
        }
    }

    if let Some(mode) = &req.mode {
        validate_mode(mode)?;
    }

    if let Some(status) = &req.status {
        validate_status(status)?;
    }

    let project = repository::update_project(&state.db, id, &req).await?;
    let theme = get_or_create_default_theme(&state.db, id).await?;

    Ok(to_response(project, theme))
}

pub async fn delete_project(
    state: &AppState,
    current_user: &CurrentUser,
    id: Uuid,
) -> Result<(), AppError> {
    let project = repository::get_project(&state.db, id)
        .await?
        .ok_or(AppError::ProjectNotFound)?;

    ensure_owner(&project, current_user)?;

    repository::delete_project(&state.db, id).await
}

pub async fn update_theme(
    state: &AppState,
    current_user: &CurrentUser,
    id: Uuid,
    req: UpdateProjectThemeRequest,
) -> Result<ProjectResponse, AppError> {
    let project = repository::get_project(&state.db, id)
        .await?
        .ok_or(AppError::ProjectNotFound)?;

    ensure_owner(&project, current_user)?;

    let theme = repository::create_or_update_theme(&state.db, id, &req).await?;

    Ok(to_response(project, theme))
}

fn validate_slug(slug: &str) -> Result<(), AppError> {
    if SLUG_RE.is_match(slug) {
        Ok(())
    } else {
        Err(AppError::InvalidSlug)
    }
}

fn validate_mode(mode: &str) -> Result<(), AppError> {
    if VALID_MODES.contains(&mode) {
        Ok(())
    } else {
        Err(AppError::InvalidMode)
    }
}

fn validate_status(status: &str) -> Result<(), AppError> {
    if VALID_STATUSES.contains(&status) {
        Ok(())
    } else {
        Err(AppError::InvalidProjectStatus)
    }
}

fn ensure_owner(project: &Project, current_user: &CurrentUser) -> Result<(), AppError> {
    if project.owner_id != current_user.id {
        return Err(AppError::Forbidden);
    }
    Ok(())
}

async fn get_or_create_default_theme(
    pool: &PgPool,
    project_id: Uuid,
) -> Result<ProjectTheme, AppError> {
    if let Some(theme) = repository::get_theme(pool, project_id).await? {
        Ok(theme)
    } else {
        repository::create_or_update_theme(pool, project_id, &UpdateProjectThemeRequest::default())
            .await
    }
}

fn to_response(project: Project, theme: ProjectTheme) -> ProjectResponse {
    ProjectResponse {
        id: project.id,
        owner_id: project.owner_id,
        name: project.name,
        slug: project.slug,
        r#type: project.r#type,
        description: project.description,
        locale: project.locale,
        currency: project.currency,
        mode: project.mode,
        status: project.status,
        created_at: project.created_at,
        updated_at: project.updated_at,
        theme: ProjectThemeResponse {
            project_id: theme.project_id,
            appearance: theme.appearance,
            accent_color: theme.accent_color,
            card_style: theme.card_style,
            button_shape: theme.button_shape,
            show_large_photos: theme.show_large_photos,
            use_promo_page: theme.use_promo_page,
            logo_url: theme.logo_url,
            hero_url: theme.hero_url,
        },
    }
}
