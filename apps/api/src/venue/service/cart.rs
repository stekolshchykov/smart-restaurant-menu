use std::collections::HashMap;

use bigdecimal::{BigDecimal, Zero};
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;
use crate::menu::repository::items;
use crate::projects::models::Project;
use crate::projects::repository as projects_repo;
use crate::state::AppState;
use crate::venue::models::{AddToCartRequest, CartAddon, CartItem, CartSessionResponse};
use crate::venue::repository;

use super::project_table::accessible_table;

pub fn validation_error(field: &str, message: &str) -> AppError {
    let mut errors = HashMap::new();
    errors.insert(field.to_string(), vec![message.to_string()]);
    AppError::ValidationError(errors)
}

pub(crate) fn cart_total(items: &[CartItem]) -> BigDecimal {
    items.iter().fold(BigDecimal::zero(), |acc, item| {
        let addons_total = item.addons.iter().fold(BigDecimal::zero(), |sum, addon| {
            sum + (&addon.price * BigDecimal::from(addon.quantity))
        });
        let unit_total = &item.base_price + addons_total;
        acc + (unit_total * BigDecimal::from(item.quantity))
    })
}

fn generate_cart_item_id(menu_item_id: Uuid, addon_ids: &[Uuid], note: &Option<String>) -> String {
    let mut sorted = addon_ids.to_vec();
    sorted.sort();
    let note_str = note.as_deref().unwrap_or("");
    let input = format!(
        "{}:{}:{}",
        menu_item_id,
        sorted
            .iter()
            .map(Uuid::to_string)
            .collect::<Vec<_>>()
            .join(","),
        note_str
    );
    blake3::hash(input.as_bytes()).to_hex().to_string()
}

async fn validate_public_project_for_item(
    pool: &PgPool,
    menu_item_id: Uuid,
    table_project_id: Uuid,
) -> Result<Project, AppError> {
    let item = items::get(pool, menu_item_id)
        .await?
        .ok_or(AppError::MenuItemNotFound)?;

    if item.availability_status != "available" {
        return Err(AppError::MenuItemUnavailable);
    }

    let item_project_id = items::project_id(pool, menu_item_id)
        .await?
        .ok_or(AppError::MenuItemNotFound)?;

    if item_project_id != table_project_id {
        return Err(AppError::MenuItemNotFound);
    }

    let project = projects_repo::get_project(pool, item_project_id)
        .await?
        .ok_or(AppError::ProjectNotFound)?;

    if project.status != "published" {
        return Err(AppError::MenuItemNotFound);
    }

    Ok(project)
}

pub async fn get_or_create_cart_session(
    state: &AppState,
    table_token: &str,
) -> Result<CartSessionResponse, AppError> {
    let table = accessible_table(&state.db, table_token).await?;
    let session = repository::get_or_create_cart_session(&state.db, table.id).await?;
    let items = session.items.0;
    let total = cart_total(&items);

    Ok(CartSessionResponse {
        token: session.token,
        table_id: table.id,
        items,
        total,
    })
}

pub async fn add_to_cart(
    state: &AppState,
    table_token: &str,
    req: AddToCartRequest,
) -> Result<CartSessionResponse, AppError> {
    let table = accessible_table(&state.db, table_token).await?;

    if req.quantity < 1 {
        return Err(validation_error("quantity", "Quantity must be at least 1"));
    }

    let _project = validate_public_project_for_item(&state.db, req.menu_item_id, table.project_id).await?;

    let item = items::get(&state.db, req.menu_item_id)
        .await?
        .ok_or(AppError::MenuItemNotFound)?;

    let groups = repository::get_item_modifier_groups(&state.db, req.menu_item_id).await?;
    let options = repository::get_item_modifier_options(&state.db, req.menu_item_id).await?;

    let option_map: HashMap<Uuid, &crate::menu::models::ModifierOption> =
        options.iter().map(|o| (o.id, o)).collect();

    let mut parsed_addon_ids = Vec::with_capacity(req.addon_ids.len());
    for raw in &req.addon_ids {
        let id = Uuid::parse_str(raw).map_err(|_| AppError::InvalidAddon)?;
        if !option_map.contains_key(&id) {
            return Err(AppError::InvalidAddon);
        }
        parsed_addon_ids.push(id);
    }

    let mut selections: HashMap<Uuid, HashMap<Uuid, i32>> = HashMap::new();
    for id in &parsed_addon_ids {
        let option = option_map.get(id).expect("validated option");
        selections
            .entry(option.modifier_group_id)
            .or_default()
            .entry(*id)
            .and_modify(|c| *c += 1)
            .or_insert(1);
    }

    for group in &groups {
        let selected = selections.get(&group.id).cloned().unwrap_or_default();
        let total_count: i32 = selected.values().sum();

        if group.required && total_count == 0 {
            return Err(AppError::InvalidSelection);
        }
        if total_count < group.min_select {
            return Err(AppError::InvalidSelection);
        }
        if group.max_select > 0 && total_count > group.max_select {
            return Err(AppError::InvalidSelection);
        }

        if group.max_select == 1 {
            let mut deduped = HashMap::new();
            for (option_id, _) in selected {
                deduped.insert(option_id, 1);
            }
            selections.insert(group.id, deduped);
        }
    }

    let final_addon_ids: Vec<Uuid> = {
        let mut ids = Vec::new();
        for group in &groups {
            if let Some(selected) = selections.get(&group.id) {
                for (option_id, qty) in selected {
                    for _ in 0..*qty {
                        ids.push(*option_id);
                    }
                }
            }
        }
        ids.sort();
        ids
    };

    let mut addons: Vec<CartAddon> = Vec::new();
    for group in &groups {
        if let Some(selected) = selections.get(&group.id) {
            for (option_id, quantity) in selected {
                let option = option_map.get(option_id).expect("validated option");
                addons.push(CartAddon {
                    id: *option_id,
                    name: option.name.clone(),
                    price: option.price.clone(),
                    quantity: *quantity,
                });
            }
        }
    }
    addons.sort_by_key(|a| a.id);

    let cart_item_id = generate_cart_item_id(req.menu_item_id, &final_addon_ids, &req.note);
    let session = repository::get_or_create_cart_session(&state.db, table.id).await?;
    let mut cart_items = session.items.0;

    if let Some(existing) = cart_items.iter_mut().find(|i| i.id == cart_item_id) {
        existing.quantity += req.quantity;
    } else {
        cart_items.push(CartItem {
            id: cart_item_id,
            menu_item_id: req.menu_item_id,
            name: item.name,
            base_price: item.price,
            addons,
            quantity: req.quantity,
            note: req.note,
        });
    }

    repository::update_cart_items(&state.db, session.id, &cart_items).await?;
    let total = cart_total(&cart_items);

    Ok(CartSessionResponse {
        token: session.token,
        table_id: table.id,
        items: cart_items,
        total,
    })
}

pub async fn remove_from_cart(
    state: &AppState,
    table_token: &str,
    cart_item_id: &str,
) -> Result<CartSessionResponse, AppError> {
    let table = accessible_table(&state.db, table_token).await?;
    let session = repository::get_cart_session_by_table(&state.db, table.id)
        .await?
        .ok_or(AppError::CartSessionNotFound)?;

    let mut cart_items = session.items.0;
    let pos = cart_items
        .iter()
        .position(|i| i.id == cart_item_id)
        .ok_or(AppError::CartItemNotFound)?;
    cart_items.remove(pos);

    repository::update_cart_items(&state.db, session.id, &cart_items).await?;
    let total = cart_total(&cart_items);

    Ok(CartSessionResponse {
        token: session.token,
        table_id: table.id,
        items: cart_items,
        total,
    })
}

pub async fn update_cart_item_quantity(
    state: &AppState,
    table_token: &str,
    cart_item_id: &str,
    quantity: i32,
) -> Result<CartSessionResponse, AppError> {
    if quantity < 1 {
        return Err(validation_error("quantity", "Quantity must be at least 1"));
    }

    let table = accessible_table(&state.db, table_token).await?;
    let session = repository::get_cart_session_by_table(&state.db, table.id)
        .await?
        .ok_or(AppError::CartSessionNotFound)?;

    let mut cart_items = session.items.0;
    let item = cart_items
        .iter_mut()
        .find(|i| i.id == cart_item_id)
        .ok_or(AppError::CartItemNotFound)?;
    item.quantity = quantity;

    repository::update_cart_items(&state.db, session.id, &cart_items).await?;
    let total = cart_total(&cart_items);

    Ok(CartSessionResponse {
        token: session.token,
        table_id: table.id,
        items: cart_items,
        total,
    })
}
