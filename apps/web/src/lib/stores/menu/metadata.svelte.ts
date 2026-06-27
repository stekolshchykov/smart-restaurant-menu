import { api } from '$lib/api/client';
import type { Allergen, CreateAllergenRequest, CreateTagRequest, Tag } from '@digital-menu/api-client';
import { getErrorMessage, menuState } from './state.svelte';

export async function loadAllergens(projectId: string) {
	try {
		const list = await api.getAllergens(projectId);
		menuState.allergens = list;
	} catch (err) {
		menuState.setError(getErrorMessage(err));
	}
}

export async function createAllergen(
	projectId: string,
	body: CreateAllergenRequest,
): Promise<Allergen> {
	try {
		const allergen = await api.createAllergen(projectId, body);
		menuState.allergens = [...menuState.allergens, allergen];
		return allergen;
	} catch (err) {
		menuState.setError(getErrorMessage(err));
		throw err;
	}
}

export async function loadTags(projectId: string) {
	try {
		const list = await api.getTags(projectId);
		menuState.tags = list;
	} catch (err) {
		menuState.setError(getErrorMessage(err));
	}
}

export async function createTag(projectId: string, body: CreateTagRequest): Promise<Tag> {
	try {
		const tag = await api.createTag(projectId, body);
		menuState.tags = [...menuState.tags, tag];
		return tag;
	} catch (err) {
		menuState.setError(getErrorMessage(err));
		throw err;
	}
}
