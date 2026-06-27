use std::str::FromStr;

use bigdecimal::BigDecimal;
use digital_menu_api::{
    auth::{middleware::CurrentUser, models::RegisterRequest, repository as auth_repo, service as auth_service},
    config::AppConfig,
    menu::models::{
        CreateCategoryRequest, CreateMenuItemRequest, CreateModifierGroupRequest,
        CreateModifierOptionRequest,
    },
    menu::repository::categories as categories_repo,
    menu::service::{categories, items, modifiers},
    projects::models::CreateProjectRequest,
    projects::repository as projects_repo,
    projects::service::{create_project, publication},
    state::AppState,
    tables::models::CreateTableRequest,
    tables::service::create_table,
};
use sqlx::postgres::PgPoolOptions;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "info".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    let config = AppConfig::from_env()?;
    config.validate()?;

    let db = PgPoolOptions::new()
        .max_connections(2)
        .connect(&config.database_url)
        .await?;

    sqlx::migrate!().run(&db).await?;

    let state = AppState::new(db, config);

    let demo_email = "demo@digitalmenu.local";
    let demo_password = "DemoPass123!";

    let current_user = match auth_repo::get_user_by_email(&state.db, demo_email).await? {
        Some(existing) => {
            tracing::info!(email = %existing.email, id = %existing.id, "demo user already exists");
            CurrentUser {
                id: existing.id,
                email: existing.email,
                role: existing.role,
            }
        }
        None => {
            let (auth_response, _cookie) = auth_service::register(
                &state,
                RegisterRequest {
                    email: demo_email.to_string(),
                    name: Some("Demo Owner".to_string()),
                    password: demo_password.to_string(),
                },
            )
            .await?;
            tracing::info!(email = %auth_response.user.email, id = %auth_response.user.id, "created demo user");
            CurrentUser {
                id: auth_response.user.id,
                email: auth_response.user.email,
                role: auth_response.user.role,
            }
        }
    };

    let (project_id, _project_status) = match projects_repo::get_project_by_slug(&state.db, "golden-nugget").await? {
        Some(existing) => {
            tracing::info!(project_id = %existing.id, "demo project already exists");
            (existing.id, existing.status)
        }
        None => {
            let project = create_project(
                &state,
                &current_user,
                CreateProjectRequest {
                    name: "The Golden Nugget".to_string(),
                    slug: "golden-nugget".to_string(),
                    r#type: Some("restaurant".to_string()),
                    description: Some("Premium demo restaurant in Killarney, Ireland".to_string()),
                    locale: Some("ru".to_string()),
                    currency: Some("EUR".to_string()),
                    mode: Some("menu_order".to_string()),
                },
            )
            .await?;
            tracing::info!(project_id = %project.id, "created demo project");
            (project.id, project.status)
        }
    };

    let category_count = categories_repo::count_by_project(&state.db, project_id).await?;
    if category_count == 0 {
    let starters = categories::create(
        &state,
        &current_user,
        project_id,
        CreateCategoryRequest {
            name: "Starters".to_string(),
            sort_order: 1,
        },
    )
    .await?;

    let mains = categories::create(
        &state,
        &current_user,
        project_id,
        CreateCategoryRequest {
            name: "Mains".to_string(),
            sort_order: 2,
        },
    )
    .await?;

    let _soup = items::create(
        &state,
        &current_user,
        starters.id,
        CreateMenuItemRequest {
            name: "Soup of the Day".to_string(),
            short_description: Some("Seasonal vegetables with sourdough".to_string()),
            description: Some(
                "A warming bowl of today’s freshest seasonal vegetables, served with toasted sourdough.".to_string(),
            ),
            price: BigDecimal::from_str("7.50")?,
            image_url: None,
            images: None,
            ingredients: Some(vec![
                "seasonal vegetables".to_string(),
                "sourdough".to_string(),
            ]),
            availability_status: Some("available".to_string()),
            quick_add_enabled: Some(true),
            sort_order: Some(1),
            allergen_ids: None,
            tag_ids: None,
        },
    )
    .await?;

    let burger = items::create(
        &state,
        &current_user,
        mains.id,
        CreateMenuItemRequest {
            name: "Classic Burger".to_string(),
            short_description: Some("Beef patty, cheddar, house sauce".to_string()),
            description: Some(
                "Grass-fed beef patty with melted cheddar, pickles, lettuce and our signature house sauce.".to_string(),
            ),
            price: BigDecimal::from_str("14.00")?,
            image_url: None,
            images: None,
            ingredients: Some(vec![
                "beef".to_string(),
                "cheddar".to_string(),
                "brioche bun".to_string(),
            ]),
            availability_status: Some("available".to_string()),
            quick_add_enabled: Some(true),
            sort_order: Some(1),
            allergen_ids: None,
            tag_ids: None,
        },
    )
    .await?;

    let group = modifiers::create_group(
        &state,
        &current_user,
        burger.id,
        CreateModifierGroupRequest {
            name: "Extras".to_string(),
            required: false,
            min_select: 0,
            max_select: 3,
            sort_order: Some(1),
        },
    )
    .await?;

    modifiers::create_option(
        &state,
        &current_user,
        group.id,
        CreateModifierOptionRequest {
            name: "Bacon".to_string(),
            price: BigDecimal::from_str("2.00")?,
            sort_order: Some(1),
        },
    )
    .await?;

    modifiers::create_option(
        &state,
        &current_user,
        group.id,
        CreateModifierOptionRequest {
            name: "Avocado".to_string(),
            price: BigDecimal::from_str("1.50")?,
            sort_order: Some(2),
        },
    )
    .await?;

    create_table(
        &state,
        &current_user,
        project_id,
        CreateTableRequest {
            label: "Table 1".to_string(),
            active: Some(true),
            sort_order: Some(1),
        },
    )
    .await?;

    create_table(
        &state,
        &current_user,
        project_id,
        CreateTableRequest {
            label: "Table 2".to_string(),
            active: Some(true),
            sort_order: Some(2),
        },
    )
    .await?;
    } // end if category_count == 0

    let published = publication::publish_project(&state, &current_user, project_id).await?;

    tracing::info!(
        project_id = %published.id,
        slug = %published.slug,
        "demo project published and ready at {}/table/<token>",
        state.config.web_origin()
    );

    Ok(())
}
