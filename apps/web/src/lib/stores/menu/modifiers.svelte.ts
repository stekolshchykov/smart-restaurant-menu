import { api } from '$lib/api/client';
import type {
	CreateModifierGroupRequest,
	CreateModifierOptionRequest,
	ModifierGroup,
	ModifierOption,
	UpdateModifierGroupRequest,
	UpdateModifierOptionRequest,
} from '@digital-menu/api-client';
import { getErrorMessage, menuState } from './state.svelte';

function updateItems(
	mapper: (item: NonNullable<typeof menuState.menuTree>['categories'][number]['items'][number]) => typeof item,
) {
	menuState.updateMenuTree(
		menuState.menuTree?.categories.map((c) => ({
			...c,
			items: c.items.map(mapper),
		})) ?? [],
	);
}

export async function createModifierGroup(
	itemId: string,
	body: CreateModifierGroupRequest,
): Promise<ModifierGroup> {
	menuState.setLoading(true);
	menuState.setError(null);

	try {
		const group = await api.createModifierGroup(itemId, body);
		updateItems((i) =>
			i.id === itemId ? { ...i, modifierGroups: [...i.modifierGroups, group] } : i,
		);
		return group;
	} catch (err) {
		menuState.setError(getErrorMessage(err));
		throw err;
	} finally {
		menuState.setLoading(false);
	}
}

export async function updateModifierGroup(
	id: string,
	body: UpdateModifierGroupRequest,
): Promise<ModifierGroup> {
	menuState.setLoading(true);
	menuState.setError(null);

	try {
		const group = await api.updateModifierGroup(id, body);
		updateItems((i) => ({
			...i,
			modifierGroups: i.modifierGroups.map((g) => (g.id === id ? { ...g, ...group } : g)),
		}));
		return group;
	} catch (err) {
		menuState.setError(getErrorMessage(err));
		throw err;
	} finally {
		menuState.setLoading(false);
	}
}

export async function deleteModifierGroup(id: string): Promise<void> {
	menuState.setLoading(true);
	menuState.setError(null);

	try {
		await api.deleteModifierGroup(id);
		updateItems((i) => ({
			...i,
			modifierGroups: i.modifierGroups.filter((g) => g.id !== id),
		}));
	} catch (err) {
		menuState.setError(getErrorMessage(err));
		throw err;
	} finally {
		menuState.setLoading(false);
	}
}

export async function createModifierOption(
	groupId: string,
	body: CreateModifierOptionRequest,
): Promise<ModifierOption> {
	menuState.setLoading(true);
	menuState.setError(null);

	try {
		const option = await api.createModifierOption(groupId, body);
		updateItems((i) => ({
			...i,
			modifierGroups: i.modifierGroups.map((g) =>
				g.id === groupId ? { ...g, options: [...g.options, option] } : g,
			),
		}));
		return option;
	} catch (err) {
		menuState.setError(getErrorMessage(err));
		throw err;
	} finally {
		menuState.setLoading(false);
	}
}

export async function updateModifierOption(
	id: string,
	body: UpdateModifierOptionRequest,
): Promise<ModifierOption> {
	menuState.setLoading(true);
	menuState.setError(null);

	try {
		const option = await api.updateModifierOption(id, body);
		updateItems((i) => ({
			...i,
			modifierGroups: i.modifierGroups.map((g) => ({
				...g,
				options: g.options.map((o) => (o.id === id ? { ...o, ...option } : o)),
			})),
		}));
		return option;
	} catch (err) {
		menuState.setError(getErrorMessage(err));
		throw err;
	} finally {
		menuState.setLoading(false);
	}
}

export async function deleteModifierOption(id: string): Promise<void> {
	menuState.setLoading(true);
	menuState.setError(null);

	try {
		await api.deleteModifierOption(id);
		updateItems((i) => ({
			...i,
			modifierGroups: i.modifierGroups.map((g) => ({
				...g,
				options: g.options.filter((o) => o.id !== id),
			})),
		}));
	} catch (err) {
		menuState.setError(getErrorMessage(err));
		throw err;
	} finally {
		menuState.setLoading(false);
	}
}
