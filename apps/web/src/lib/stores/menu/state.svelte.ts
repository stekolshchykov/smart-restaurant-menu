import { api } from '$lib/api/client';
import type {
	Allergen,
	ApiError,
	CategoryWithItems,
	MenuTreeResponse,
	Tag,
} from '@digital-menu/api-client';

export function getErrorMessage(err: unknown): string {
	const apiError = err as ApiError | undefined;
	if (apiError?.message) return apiError.message;
	if (err instanceof Error) return err.message;
	return 'Что-то пошло не так. Попробуйте ещё раз.';
}

export const menuState = createMenuState();

function createMenuState() {
	let menuTree = $state<MenuTreeResponse | null>(null);
	let allergens = $state<Allergen[]>([]);
	let tags = $state<Tag[]>([]);
	let selectedCategoryId = $state<string | null>(null);
	let selectedItemId = $state<string | null>(null);
	let loading = $state(false);
	let error = $state<string | null>(null);

	const selectedCategory = $derived(
		menuTree?.categories.find((c) => c.id === selectedCategoryId) ?? null,
	);

	const selectedItem = $derived(
		selectedCategory?.items.find((item) => item.id === selectedItemId) ?? null,
	);

	function setLoading(value: boolean) {
		loading = value;
	}

	function setError(message: string | null) {
		error = message;
	}

	function selectCategory(id: string | null) {
		selectedCategoryId = id;
		selectedItemId = null;
	}

	function selectItem(id: string | null) {
		selectedItemId = id;
	}

	function clearError() {
		error = null;
	}

	async function loadMenu(projectId: string) {
		setLoading(true);
		setError(null);

		try {
			const tree = await api.getMenu(projectId);
			menuTree = tree;

			if (tree.categories.length > 0 && !selectedCategoryId) {
				selectedCategoryId = tree.categories[0].id;
			}
		} catch (err) {
			setError(getErrorMessage(err));
		} finally {
			setLoading(false);
		}
	}

	function updateMenuTree(categories: CategoryWithItems[]) {
		menuTree = { categories };
	}

	return {
		get menuTree() {
			return menuTree;
		},
		get allergens() {
			return allergens;
		},
		set allergens(value: Allergen[]) {
			allergens = value;
		},
		get tags() {
			return tags;
		},
		set tags(value: Tag[]) {
			tags = value;
		},
		get selectedCategoryId() {
			return selectedCategoryId;
		},
		get selectedItemId() {
			return selectedItemId;
		},
		get selectedCategory() {
			return selectedCategory;
		},
		get selectedItem() {
			return selectedItem;
		},
		get loading() {
			return loading;
		},
		get error() {
			return error;
		},
		setLoading,
		setError,
		selectCategory,
		selectItem,
		clearError,
		loadMenu,
		updateMenuTree,
	};
}
