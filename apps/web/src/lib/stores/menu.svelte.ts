import { menuState } from './menu/state.svelte';
import {
	createCategory,
	deleteCategory,
	updateCategory,
} from './menu/categories.svelte';
import { createItem, deleteItem, updateItem } from './menu/items.svelte';
import {
	createModifierGroup,
	createModifierOption,
	deleteModifierGroup,
	deleteModifierOption,
	updateModifierGroup,
	updateModifierOption,
} from './menu/modifiers.svelte';
import { createAllergen, createTag, loadAllergens, loadTags } from './menu/metadata.svelte';

export const menu = {
	get menuTree() {
		return menuState.menuTree;
	},
	get allergens() {
		return menuState.allergens;
	},
	get tags() {
		return menuState.tags;
	},
	get selectedCategoryId() {
		return menuState.selectedCategoryId;
	},
	get selectedItemId() {
		return menuState.selectedItemId;
	},
	get selectedCategory() {
		return menuState.selectedCategory;
	},
	get selectedItem() {
		return menuState.selectedItem;
	},
	get loading() {
		return menuState.loading;
	},
	get error() {
		return menuState.error;
	},
	loadMenu: menuState.loadMenu,
	selectCategory: menuState.selectCategory,
	selectItem: menuState.selectItem,
	clearError: menuState.clearError,
	createCategory,
	updateCategory,
	deleteCategory,
	createItem,
	updateItem,
	deleteItem,
	createModifierGroup,
	updateModifierGroup,
	deleteModifierGroup,
	createModifierOption,
	updateModifierOption,
	deleteModifierOption,
	loadAllergens,
	createAllergen,
	loadTags,
	createTag,
};
