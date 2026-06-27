use std::collections::{HashMap, HashSet};

use bigdecimal::{BigDecimal, Zero};
use sqlx::PgPool;
use uuid::Uuid;

use crate::auth::middleware::CurrentUser;
use crate::error::AppError;
use crate::menu::models::{
    Allergen, MenuItem, MenuItemResponse, ModifierGroupResponse, ModifierOption, Tag,
};
use crate::menu::repository::{allergens_tags, items, modifiers};
use crate::projects::repository as project_repository;
use crate::state::AppState;

const MAX_NAME_LEN: usize = 100;
const MAX_SHORT_DESCRIPTION_LEN: usize = 300;
const MAX_DESCRIPTION_LEN: usize = 2000;
const MAX_URL_LEN: usize = 2048;
const MAX_INGREDIENT_LEN: usize = 100;
const MAX_INGREDIENTS_COUNT: usize = 100;
const MAX_IMAGES_COUNT: usize = 10;

pub async fn ensure_project_owner(
    state: &AppState,
    user: &CurrentUser,
    project_id: Uuid,
) -> Result<(), AppError> {
    let project = project_repository::get_project(&state.db, project_id)
        .await?
        .ok_or(AppError::ProjectNotFound)?;

    if project.owner_id != user.id {
        return Err(AppError::Forbidden);
    }

    Ok(())
}

pub fn validate_price(price: &BigDecimal) -> Result<(), AppError> {
    if price < &BigDecimal::zero() {
        return Err(AppError::InvalidPrice);
    }
    Ok(())
}

pub fn validate_selection(min_select: i32, max_select: i32) -> Result<(), AppError> {
    if min_select < 0 || max_select < min_select {
        return Err(AppError::InvalidSelection);
    }
    Ok(())
}

pub fn validate_name(name: &str) -> Result<(), AppError> {
    let trimmed = name.trim();
    if trimmed.is_empty() || trimmed.len() > MAX_NAME_LEN {
        return Err(AppError::ValidationError(Default::default()));
    }
    Ok(())
}

pub fn validate_short_description(value: Option<&str>) -> Result<(), AppError> {
    if let Some(value) = value {
        if value.len() > MAX_SHORT_DESCRIPTION_LEN {
            return Err(AppError::ValidationError(Default::default()));
        }
    }
    Ok(())
}

pub fn validate_description(value: Option<&str>) -> Result<(), AppError> {
    if let Some(value) = value {
        if value.len() > MAX_DESCRIPTION_LEN {
            return Err(AppError::ValidationError(Default::default()));
        }
    }
    Ok(())
}

pub fn validate_image_url(value: Option<&str>) -> Result<(), AppError> {
    if let Some(url) = value {
        if url.len() > MAX_URL_LEN {
            return Err(AppError::ValidationError(Default::default()));
        }
        if url.is_empty() {
            return Ok(());
        }
        if url.starts_with("http://") || url.starts_with("https://") {
            return Ok(());
        }
        return Err(AppError::ValidationError(Default::default()));
    }
    Ok(())
}

pub fn validate_images(images: Option<&[String]>) -> Result<(), AppError> {
    if let Some(images) = images {
        if images.len() > MAX_IMAGES_COUNT {
            return Err(AppError::ValidationError(Default::default()));
        }
        for url in images {
            validate_image_url(Some(url))?;
        }
    }
    Ok(())
}

pub fn validate_ingredients(ingredients: Option<&[String]>) -> Result<(), AppError> {
    if let Some(ingredients) = ingredients {
        if ingredients.len() > MAX_INGREDIENTS_COUNT {
            return Err(AppError::ValidationError(Default::default()));
        }
        for ingredient in ingredients {
            if ingredient.trim().is_empty() || ingredient.len() > MAX_INGREDIENT_LEN {
                return Err(AppError::ValidationError(Default::default()));
            }
        }
    }
    Ok(())
}

pub async fn ensure_allergens_belong_to_project(
    pool: &PgPool,
    project_id: Uuid,
    ids: &[Uuid],
) -> Result<(), AppError> {
    if ids.is_empty() {
        return Ok(());
    }

    let existing: HashSet<Uuid> = allergens_tags::list_allergens(pool, project_id)
        .await?
        .into_iter()
        .map(|a| a.id)
        .collect();

    if ids.iter().all(|id| existing.contains(id)) {
        Ok(())
    } else {
        Err(AppError::AllergenNotFound)
    }
}

pub async fn ensure_tags_belong_to_project(
    pool: &PgPool,
    project_id: Uuid,
    ids: &[Uuid],
) -> Result<(), AppError> {
    if ids.is_empty() {
        return Ok(());
    }

    let existing: HashSet<Uuid> = allergens_tags::list_tags(pool, project_id)
        .await?
        .into_iter()
        .map(|t| t.id)
        .collect();

    if ids.iter().all(|id| existing.contains(id)) {
        Ok(())
    } else {
        Err(AppError::TagNotFound)
    }
}

pub async fn build_item_response(
    pool: &PgPool,
    item: MenuItem,
) -> Result<MenuItemResponse, AppError> {
    let ids = [item.id];
    let allergens = items::list_allergens(pool, &ids)
        .await?
        .into_iter()
        .map(|r| Allergen {
            id: r.id,
            project_id: r.project_id,
            name: r.name,
            code: r.code,
        })
        .collect();
    let tags = items::list_tags(pool, &ids)
        .await?
        .into_iter()
        .map(|r| Tag {
            id: r.id,
            project_id: r.project_id,
            name: r.name,
            code: r.code,
            kind: r.kind,
        })
        .collect();

    let groups = modifiers::list_groups_for_items(pool, &ids).await?;
    let group_ids: Vec<Uuid> = groups.iter().map(|g| g.id).collect();
    let options = modifiers::list_options_for_groups(pool, &group_ids).await?;

    let mut options_map: HashMap<Uuid, Vec<ModifierOption>> = HashMap::new();
    for option in options {
        options_map
            .entry(option.modifier_group_id)
            .or_default()
            .push(option);
    }

    let modifier_groups = groups
        .into_iter()
        .map(|g| ModifierGroupResponse {
            id: g.id,
            menu_item_id: g.menu_item_id,
            name: g.name,
            required: g.required,
            min_select: g.min_select,
            max_select: g.max_select,
            sort_order: g.sort_order,
            options: options_map.remove(&g.id).unwrap_or_default(),
        })
        .collect();

    Ok(to_item_response(item, allergens, tags, modifier_groups))
}

pub fn to_item_response(
    item: MenuItem,
    allergens: Vec<Allergen>,
    tags: Vec<Tag>,
    modifier_groups: Vec<ModifierGroupResponse>,
) -> MenuItemResponse {
    MenuItemResponse {
        id: item.id,
        category_id: item.category_id,
        name: item.name,
        short_description: item.short_description,
        description: item.description,
        price: item.price,
        currency: item.currency,
        image_url: item.image_url,
        images: item.images,
        ingredients: item.ingredients,
        availability_status: item.availability_status,
        quick_add_enabled: item.quick_add_enabled,
        sort_order: item.sort_order,
        allergens,
        tags,
        modifier_groups,
        created_at: item.created_at,
        updated_at: item.updated_at,
    }
}
