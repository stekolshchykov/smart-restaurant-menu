use std::collections::HashMap;

use uuid::Uuid;

use crate::auth::middleware::CurrentUser;
use crate::error::AppError;
use crate::menu::models::{
    Allergen, CategoryWithItems, MenuItemResponse, MenuTreeResponse, ModifierGroupResponse,
    ModifierOption, Tag,
};
use crate::menu::repository::{categories, items, modifiers};
use crate::menu::service::helpers::{ensure_project_owner, to_item_response};
use crate::state::AppState;

pub async fn get_menu_tree(
    state: &AppState,
    user: &CurrentUser,
    project_id: Uuid,
) -> Result<MenuTreeResponse, AppError> {
    ensure_project_owner(state, user, project_id).await?;

    let categories_list = categories::list(&state.db, project_id).await?;
    let items = items::list_by_project(&state.db, project_id).await?;

    let item_ids: Vec<Uuid> = items.iter().map(|i| i.id).collect();

    let mut allergens_map: HashMap<Uuid, Vec<Allergen>> = HashMap::new();
    let mut tags_map: HashMap<Uuid, Vec<Tag>> = HashMap::new();
    let mut groups_map: HashMap<Uuid, Vec<ModifierGroupResponse>> = HashMap::new();

    if !item_ids.is_empty() {
        for row in items::list_allergens(&state.db, &item_ids).await? {
            allergens_map
                .entry(row.menu_item_id)
                .or_default()
                .push(Allergen {
                    id: row.id,
                    project_id: row.project_id,
                    name: row.name,
                    code: row.code,
                });
        }

        for row in items::list_tags(&state.db, &item_ids).await? {
            tags_map.entry(row.menu_item_id).or_default().push(Tag {
                id: row.id,
                project_id: row.project_id,
                name: row.name,
                code: row.code,
                kind: row.kind,
            });
        }

        let groups = modifiers::list_groups_for_items(&state.db, &item_ids).await?;
        let group_ids: Vec<Uuid> = groups.iter().map(|g| g.id).collect();
        let options = modifiers::list_options_for_groups(&state.db, &group_ids).await?;

        let mut options_map: HashMap<Uuid, Vec<ModifierOption>> = HashMap::new();
        for option in options {
            options_map
                .entry(option.modifier_group_id)
                .or_default()
                .push(option);
        }

        for group in groups {
            groups_map
                .entry(group.menu_item_id)
                .or_default()
                .push(ModifierGroupResponse {
                    id: group.id,
                    menu_item_id: group.menu_item_id,
                    name: group.name,
                    required: group.required,
                    min_select: group.min_select,
                    max_select: group.max_select,
                    sort_order: group.sort_order,
                    options: options_map.remove(&group.id).unwrap_or_default(),
                });
        }
    }

    let mut items_by_category: HashMap<Uuid, Vec<MenuItemResponse>> = HashMap::new();
    for item in items {
        let item_id = item.id;
        items_by_category
            .entry(item.category_id)
            .or_default()
            .push(to_item_response(
                item,
                allergens_map.remove(&item_id).unwrap_or_default(),
                tags_map.remove(&item_id).unwrap_or_default(),
                groups_map.remove(&item_id).unwrap_or_default(),
            ));
    }

    let categories_with_items = categories_list
        .into_iter()
        .map(|c| CategoryWithItems {
            id: c.id,
            name: c.name,
            sort_order: c.sort_order,
            items: items_by_category.remove(&c.id).unwrap_or_default(),
        })
        .collect();

    Ok(MenuTreeResponse {
        categories: categories_with_items,
    })
}

pub async fn get_public_menu_tree(
    state: &AppState,
    project_id: Uuid,
) -> Result<MenuTreeResponse, AppError> {
    let categories_list = categories::list(&state.db, project_id).await?;
    let items = items::list_public_by_project(&state.db, project_id).await?;

    let item_ids: Vec<Uuid> = items.iter().map(|i| i.id).collect();

    let mut allergens_map: HashMap<Uuid, Vec<Allergen>> = HashMap::new();
    let mut tags_map: HashMap<Uuid, Vec<Tag>> = HashMap::new();
    let mut groups_map: HashMap<Uuid, Vec<ModifierGroupResponse>> = HashMap::new();

    if !item_ids.is_empty() {
        for row in items::list_allergens(&state.db, &item_ids).await? {
            allergens_map
                .entry(row.menu_item_id)
                .or_default()
                .push(Allergen {
                    id: row.id,
                    project_id: row.project_id,
                    name: row.name,
                    code: row.code,
                });
        }

        for row in items::list_tags(&state.db, &item_ids).await? {
            tags_map.entry(row.menu_item_id).or_default().push(Tag {
                id: row.id,
                project_id: row.project_id,
                name: row.name,
                code: row.code,
                kind: row.kind,
            });
        }

        let groups = modifiers::list_groups_for_items(&state.db, &item_ids).await?;
        let group_ids: Vec<Uuid> = groups.iter().map(|g| g.id).collect();
        let options = modifiers::list_options_for_groups(&state.db, &group_ids).await?;

        let mut options_map: HashMap<Uuid, Vec<ModifierOption>> = HashMap::new();
        for option in options {
            options_map
                .entry(option.modifier_group_id)
                .or_default()
                .push(option);
        }

        for group in groups {
            groups_map
                .entry(group.menu_item_id)
                .or_default()
                .push(ModifierGroupResponse {
                    id: group.id,
                    menu_item_id: group.menu_item_id,
                    name: group.name,
                    required: group.required,
                    min_select: group.min_select,
                    max_select: group.max_select,
                    sort_order: group.sort_order,
                    options: options_map.remove(&group.id).unwrap_or_default(),
                });
        }
    }

    let mut items_by_category: HashMap<Uuid, Vec<MenuItemResponse>> = HashMap::new();
    for item in items {
        let item_id = item.id;
        items_by_category
            .entry(item.category_id)
            .or_default()
            .push(to_item_response(
                item,
                allergens_map.remove(&item_id).unwrap_or_default(),
                tags_map.remove(&item_id).unwrap_or_default(),
                groups_map.remove(&item_id).unwrap_or_default(),
            ));
    }

    let categories_with_items = categories_list
        .into_iter()
        .map(|c| CategoryWithItems {
            id: c.id,
            name: c.name,
            sort_order: c.sort_order,
            items: items_by_category.remove(&c.id).unwrap_or_default(),
        })
        .collect();

    Ok(MenuTreeResponse {
        categories: categories_with_items,
    })
}
