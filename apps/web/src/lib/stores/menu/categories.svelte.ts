import { api } from '$lib/api/client';
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from '@digital-menu/api-client';
import { getErrorMessage, menuState } from './state.svelte';

export async function createCategory(
	projectId: string,
	body: CreateCategoryRequest,
): Promise<Category> {
	menuState.setLoading(true);
	menuState.setError(null);

	try {
		const category = await api.createCategory(projectId, body);
		menuState.updateMenuTree([...(menuState.menuTree?.categories ?? []), { ...category, items: [] }]);
		menuState.selectCategory(category.id);
		return category;
	} catch (err) {
		menuState.setError(getErrorMessage(err));
		throw err;
	} finally {
		menuState.setLoading(false);
	}
}

export async function updateCategory(id: string, body: UpdateCategoryRequest): Promise<Category> {
	menuState.setLoading(true);
	menuState.setError(null);

	try {
		const category = await api.updateCategory(id, body);
		menuState.updateMenuTree(
			menuState.menuTree?.categories.map((c) => (c.id === id ? { ...c, ...category } : c)) ?? [],
		);
		return category;
	} catch (err) {
		menuState.setError(getErrorMessage(err));
		throw err;
	} finally {
		menuState.setLoading(false);
	}
}

export async function deleteCategory(id: string): Promise<void> {
	menuState.setLoading(true);
	menuState.setError(null);

	try {
		await api.deleteCategory(id);
		const remaining = menuState.menuTree?.categories.filter((c) => c.id !== id) ?? [];
		menuState.updateMenuTree(remaining);

		if (menuState.selectedCategoryId === id) {
			menuState.selectCategory(remaining[0]?.id ?? null);
		}
	} catch (err) {
		menuState.setError(getErrorMessage(err));
		throw err;
	} finally {
		menuState.setLoading(false);
	}
}
