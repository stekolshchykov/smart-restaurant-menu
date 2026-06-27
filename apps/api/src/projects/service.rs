use std::sync::LazyLock;

use regex::Regex;
use sqlx::PgPool;
use uuid::Uuid;

use crate::auth::middleware::CurrentUser;
use crate::error::AppError;
pub mod publication;

use crate::projects::models::{
    CreateProjectRequest, Project, ProjectResponse, ProjectTheme, ProjectThemeResponse,
    UpdateProjectRequest, UpdateProjectThemeRequest,
};
use crate::projects::repository;
use crate::state::AppState;

static SLUG_RE: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"^[a-z0-9_-]{2,50}$").expect("slug regex is valid"));
static LOCALE_RE: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"^[a-z]{2}(-[A-Z]{2})?$").expect("locale regex is valid"));
static CURRENCY_RE: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"^[A-Z]{3}$").expect("currency regex is valid"));
static HEX_COLOR_RE: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"^#[0-9A-Fa-f]{6}$").expect("hex color regex is valid"));

const DEFAULT_LOCALE: &str = "ru";
const DEFAULT_CURRENCY: &str = "RUB";
const DEFAULT_MODE: &str = "menu_order";
const DEFAULT_TYPE: &str = "restaurant";
const VALID_MODES: &[&str] = &["promo_only", "menu_only", "menu_service", "menu_order"];
const VALID_STATUSES: &[&str] = &["draft", "ready", "published", "attention"];
const VALID_TYPES: &[&str] = &["restaurant", "cafe", "bar", "hotel", "food_truck"];
const VALID_APPEARANCES: &[&str] = &["light", "dark", "auto"];
const VALID_CARD_STYLES: &[&str] = &["flat", "elevated", "outlined", "editorial"];
const VALID_BUTTON_SHAPES: &[&str] = &["rounded", "pill", "square"];
const MAX_NAME_LEN: usize = 100;
const MAX_DESCRIPTION_LEN: usize = 1000;
const MAX_URL_LEN: usize = 2048;

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
    req.r#type
        .get_or_insert_with(|| DEFAULT_TYPE.to_string());

    validate_project_fields(&req.name, req.description.as_deref())?;
    validate_mode(req.mode.as_deref().expect("mode was just set"))?;
    validate_type(req.r#type.as_deref().expect("type was just set"))?;
    validate_locale(req.locale.as_deref().expect("locale was just set"))?;
    validate_currency(req.currency.as_deref().expect("currency was just set"))?;

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

    if let Some(name) = &req.name {
        validate_name(name)?;
    }
    if let Some(description) = &req.description {
        validate_description(description)?;
    }
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

    if let Some(r#type) = &req.r#type {
        validate_type(r#type)?;
    }
    if let Some(locale) = &req.locale {
        validate_locale(locale)?;
    }
    if let Some(currency) = &req.currency {
        validate_currency(currency)?;
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
    validate_theme(&req)?;

    let theme = repository::create_or_update_theme(&state.db, id, &req).await?;

    Ok(to_response(project, theme))
}

fn validate_project_fields(name: &str, description: Option<&str>) -> Result<(), AppError> {
    validate_name(name)?;
    if let Some(description) = description {
        validate_description(description)?;
    }
    Ok(())
}

fn validate_name(name: &str) -> Result<(), AppError> {
    let trimmed = name.trim();
    if trimmed.is_empty() || trimmed.len() > MAX_NAME_LEN {
        return Err(AppError::ValidationError(Default::default()));
    }
    Ok(())
}

fn validate_description(description: &str) -> Result<(), AppError> {
    if description.len() > MAX_DESCRIPTION_LEN {
        return Err(AppError::ValidationError(Default::default()));
    }
    Ok(())
}

fn validate_slug(slug: &str) -> Result<(), AppError> {
    if SLUG_RE.is_match(slug) {
        Ok(())
    } else {
        Err(AppError::InvalidSlug)
    }
}

fn validate_type(r#type: &str) -> Result<(), AppError> {
    if VALID_TYPES.contains(&r#type) {
        Ok(())
    } else {
        Err(AppError::ValidationError(Default::default()))
    }
}

fn validate_locale(locale: &str) -> Result<(), AppError> {
    if LOCALE_RE.is_match(locale) {
        Ok(())
    } else {
        Err(AppError::ValidationError(Default::default()))
    }
}

fn validate_currency(currency: &str) -> Result<(), AppError> {
    if CURRENCY_RE.is_match(currency) {
        Ok(())
    } else {
        Err(AppError::ValidationError(Default::default()))
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

fn validate_theme(req: &UpdateProjectThemeRequest) -> Result<(), AppError> {
    if let Some(appearance) = &req.appearance {
        if !VALID_APPEARANCES.contains(&appearance.as_str()) {
            return Err(AppError::ValidationError(Default::default()));
        }
    }
    if let Some(accent_color) = &req.accent_color {
        if !HEX_COLOR_RE.is_match(accent_color) {
            return Err(AppError::ValidationError(Default::default()));
        }
    }
    if let Some(card_style) = &req.card_style {
        if !VALID_CARD_STYLES.contains(&card_style.as_str()) {
            return Err(AppError::ValidationError(Default::default()));
        }
    }
    if let Some(button_shape) = &req.button_shape {
        if !VALID_BUTTON_SHAPES.contains(&button_shape.as_str()) {
            return Err(AppError::ValidationError(Default::default()));
        }
    }
    if let Some(logo_url) = &req.logo_url {
        validate_image_url(logo_url)?;
    }
    if let Some(hero_url) = &req.hero_url {
        validate_image_url(hero_url)?;
    }
    Ok(())
}

fn validate_image_url(url: &str) -> Result<(), AppError> {
    if url.len() > MAX_URL_LEN {
        return Err(AppError::ValidationError(Default::default()));
    }
    if url.is_empty() {
        return Ok(());
    }
    if url.starts_with("http://") || url.starts_with("https://") {
        return Ok(());
    }
    Err(AppError::ValidationError(Default::default()))
}

fn ensure_owner(project: &Project, current_user: &CurrentUser) -> Result<(), AppError> {
    if project.owner_id != current_user.id {
        return Err(AppError::Forbidden);
    }
    Ok(())
}

pub async fn get_or_create_default_theme(
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

pub fn to_response(project: Project, theme: ProjectTheme) -> ProjectResponse {
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
