import { api } from '$lib/api/client';
import type { CreateMenuItemRequest, MenuItemResponse, UpdateMenuItemRequest } from '@digital-menu/api-client';
import { getErrorMessage, menuState } from './state.svelte';

export async function createItem(
	categoryId: string,
	body: CreateMenuItemRequest,
): Promise<MenuItemResponse> {
	menuState.setLoading(true);
	menuState.setError(null);

	try {
		const item = await api.createItem(categoryId, body);
		menuState.updateMenuTree(
			menuState.menuTree?.categories.map((c) =>
				c.id === categoryId ? { ...c, items: [...c.items, item] } : c,
			) ?? [],
		);
		menuState.selectItem(item.id);
		return item;
	} catch (err) {
		menuState.setError(getErrorMessage(err));
		throw err;
	} finally {
		menuState.setLoading(false);
	}
}

export async function updateItem(id: string, body: UpdateMenuItemRequest): Promise<MenuItemResponse> {
	menuState.setLoading(true);
	menuState.setError(null);

	try {
		const item = await api.updateItem(id, body);
		menuState.updateMenuTree(
			menuState.menuTree?.categories.map((c) => ({
				...c,
				items: c.items.map((i) => (i.id === id ? item : i)),
			})) ?? [],
		);
		return item;
	} catch (err) {
		menuState.setError(getErrorMessage(err));
		throw err;
	} finally {
		menuState.setLoading(false);
	}
}

export async function deleteItem(id: string): Promise<void> {
	menuState.setLoading(true);
	menuState.setError(null);

	try {
		await api.deleteItem(id);
		menuState.updateMenuTree(
			menuState.menuTree?.categories.map((c) => ({
				...c,
				items: c.items.filter((i) => i.id !== id),
			})) ?? [],
		);
		if (menuState.selectedItemId === id) {
			menuState.selectItem(null);
		}
	} catch (err) {
		menuState.setError(getErrorMessage(err));
		throw err;
	} finally {
		menuState.setLoading(false);
	}
}
