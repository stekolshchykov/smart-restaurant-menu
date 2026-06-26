use uuid::Uuid;

use crate::auth::middleware::CurrentUser;
use crate::error::AppError;
use crate::menu::repository::{categories, items};
use crate::projects::models::{
    ProjectResponse, PublicationChecklistItem, PublicationChecks, PublicationStatusResponse,
    UpdateProjectRequest,
};
use crate::projects::repository;
use crate::state::AppState;
use crate::tables::repository as tables_repo;

const MODES_WITH_TABLES: &[&str] = &["menu_service", "menu_order"];

fn ensure_owner(
    project: &crate::projects::models::Project,
    current_user: &CurrentUser,
) -> Result<(), AppError> {
    if project.owner_id != current_user.id {
        return Err(AppError::Forbidden);
    }
    Ok(())
}

pub async fn publish_project(
    state: &AppState,
    current_user: &CurrentUser,
    project_id: Uuid,
) -> Result<ProjectResponse, AppError> {
    let project = repository::get_project(&state.db, project_id)
        .await?
        .ok_or(AppError::ProjectNotFound)?;
    ensure_owner(&project, current_user)?;

    let req = UpdateProjectRequest {
        status: Some("published".to_string()),
        ..Default::default()
    };
    let project = repository::update_project(&state.db, project_id, &req).await?;
    let theme = get_or_create_default_theme(&state.db, project_id).await?;
    Ok(crate::projects::service::to_response(project, theme))
}

pub async fn unpublish_project(
    state: &AppState,
    current_user: &CurrentUser,
    project_id: Uuid,
) -> Result<ProjectResponse, AppError> {
    let project = repository::get_project(&state.db, project_id)
        .await?
        .ok_or(AppError::ProjectNotFound)?;
    ensure_owner(&project, current_user)?;

    let req = UpdateProjectRequest {
        status: Some("draft".to_string()),
        ..Default::default()
    };
    let project = repository::update_project(&state.db, project_id, &req).await?;
    let theme = get_or_create_default_theme(&state.db, project_id).await?;
    Ok(crate::projects::service::to_response(project, theme))
}

pub async fn get_publication_status(
    state: &AppState,
    current_user: &CurrentUser,
    project_id: Uuid,
) -> Result<PublicationStatusResponse, AppError> {
    let project = repository::get_project(&state.db, project_id)
        .await?
        .ok_or(AppError::ProjectNotFound)?;
    ensure_owner(&project, current_user)?;

    let has_name = !project.name.trim().is_empty();
    let category_count = categories::count_by_project(&state.db, project_id).await?;
    let visible_items = items::count_visible_by_project(&state.db, project_id).await?;
    let has_menu = category_count > 0 && visible_items > 0;

    let requires_tables = MODES_WITH_TABLES.contains(&project.mode.as_str());
    let table_count = tables_repo::count_by_project(&state.db, project_id).await?;
    let has_tables = !requires_tables || table_count > 0;

    let theme = get_or_create_default_theme(&state.db, project_id).await?;
    let theme_ready = !theme.appearance.trim().is_empty() && !theme.accent_color.trim().is_empty();

    let ready = has_name && has_menu && has_tables && theme_ready;

    let checks = PublicationChecks {
        has_name,
        has_menu,
        has_tables,
        theme_ready,
    };

    let checklist = vec![
        PublicationChecklistItem {
            key: "has_name".to_string(),
            label: "Project name is set".to_string(),
            passed: has_name,
        },
        PublicationChecklistItem {
            key: "has_menu".to_string(),
            label: "Menu has at least one category and visible item".to_string(),
            passed: has_menu,
        },
        PublicationChecklistItem {
            key: "has_tables".to_string(),
            label: if requires_tables {
                "At least one table is created".to_string()
            } else {
                "Tables are optional for the selected mode".to_string()
            },
            passed: has_tables,
        },
        PublicationChecklistItem {
            key: "theme_ready".to_string(),
            label: "Theme appearance and accent color are set".to_string(),
            passed: theme_ready,
        },
    ];

    Ok(PublicationStatusResponse {
        project_id,
        slug: project.slug,
        status: project.status,
        mode: project.mode,
        ready,
        checks,
        checklist,
    })
}

async fn get_or_create_default_theme(
    pool: &sqlx::PgPool,
    project_id: Uuid,
) -> Result<crate::projects::models::ProjectTheme, AppError> {
    if let Some(theme) = repository::get_theme(pool, project_id).await? {
        Ok(theme)
    } else {
        repository::create_or_update_theme(
            pool,
            project_id,
            &crate::projects::models::UpdateProjectThemeRequest::default(),
        )
        .await
    }
}
