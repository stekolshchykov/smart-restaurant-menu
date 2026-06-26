import { api } from '$lib/api/client';
import type {
  Allergen,
  ApiError,
  Category,
  CategoryWithItems,
  CreateAllergenRequest,
  CreateCategoryRequest,
  CreateMenuItemRequest,
  CreateModifierGroupRequest,
  CreateModifierOptionRequest,
  CreateTagRequest,
  MenuItem,
  MenuItemResponse,
  MenuTreeResponse,
  ModifierGroup,
  ModifierOption,
  Tag,
  UpdateCategoryRequest,
  UpdateMenuItemRequest,
  UpdateModifierGroupRequest,
  UpdateModifierOptionRequest,
} from '@digital-menu/api-client';

function getErrorMessage(err: unknown): string {
  const apiError = err as ApiError | undefined;
  if (apiError?.message) return apiError.message;
  if (err instanceof Error) return err.message;
  return 'Что-то пошло не так. Попробуйте ещё раз.';
}

function createMenuStore() {
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

  function selectCategory(id: string | null) {
    selectedCategoryId = id;
    selectedItemId = null;
  }

  function selectItem(id: string | null) {
    selectedItemId = id;
  }

  function setLoading(value: boolean) {
    loading = value;
  }

  function setError(message: string | null) {
    error = message;
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

  async function createCategory(
    projectId: string,
    body: CreateCategoryRequest,
  ): Promise<Category> {
    setLoading(true);
    setError(null);

    try {
      const category = await api.createCategory(projectId, body);
      const categoryWithItems: CategoryWithItems = { ...category, items: [] };
      menuTree = {
        categories: [...(menuTree?.categories ?? []), categoryWithItems],
      };
      selectedCategoryId = category.id;
      selectedItemId = null;
      return category;
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function updateCategory(id: string, body: UpdateCategoryRequest): Promise<Category> {
    setLoading(true);
    setError(null);

    try {
      const category = await api.updateCategory(id, body);
      menuTree = {
        categories:
          menuTree?.categories.map((c) =>
            c.id === id ? { ...c, ...category } : c,
          ) ?? [],
      };
      return category;
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function deleteCategory(id: string): Promise<void> {
    setLoading(true);
    setError(null);

    try {
      await api.deleteCategory(id);
      const remaining = menuTree?.categories.filter((c) => c.id !== id) ?? [];
      menuTree = { categories: remaining };

      if (selectedCategoryId === id) {
        selectedCategoryId = remaining[0]?.id ?? null;
        selectedItemId = null;
      }
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function createItem(
    categoryId: string,
    body: CreateMenuItemRequest,
  ): Promise<MenuItemResponse> {
    setLoading(true);
    setError(null);

    try {
      const item = await api.createItem(categoryId, body);
      menuTree = {
        categories:
          menuTree?.categories.map((c) =>
            c.id === categoryId ? { ...c, items: [...c.items, item] } : c,
          ) ?? [],
      };
      selectedItemId = item.id;
      return item;
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function updateItem(id: string, body: UpdateMenuItemRequest): Promise<MenuItemResponse> {
    setLoading(true);
    setError(null);

    try {
      const item = await api.updateItem(id, body);
      menuTree = {
        categories:
          menuTree?.categories.map((c) => ({
            ...c,
            items: c.items.map((i) => (i.id === id ? item : i)),
          })) ?? [],
      };
      return item;
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function deleteItem(id: string): Promise<void> {
    setLoading(true);
    setError(null);

    try {
      await api.deleteItem(id);
      menuTree = {
        categories:
          menuTree?.categories.map((c) => ({
            ...c,
            items: c.items.filter((i) => i.id !== id),
          })) ?? [],
      };
      if (selectedItemId === id) {
        selectedItemId = null;
      }
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function createModifierGroup(
    itemId: string,
    body: CreateModifierGroupRequest,
  ): Promise<ModifierGroup> {
    setLoading(true);
    setError(null);

    try {
      const group = await api.createModifierGroup(itemId, body);
      menuTree = {
        categories:
          menuTree?.categories.map((c) => ({
            ...c,
            items: c.items.map((i) =>
              i.id === itemId
                ? { ...i, modifierGroups: [...i.modifierGroups, group] }
                : i,
            ),
          })) ?? [],
      };
      return group;
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function updateModifierGroup(
    id: string,
    body: UpdateModifierGroupRequest,
  ): Promise<ModifierGroup> {
    setLoading(true);
    setError(null);

    try {
      const group = await api.updateModifierGroup(id, body);
      menuTree = {
        categories:
          menuTree?.categories.map((c) => ({
            ...c,
            items: c.items.map((i) => ({
              ...i,
              modifierGroups: i.modifierGroups.map((g) =>
                g.id === id ? { ...g, ...group } : g,
              ),
            })),
          })) ?? [],
      };
      return group;
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function deleteModifierGroup(id: string): Promise<void> {
    setLoading(true);
    setError(null);

    try {
      await api.deleteModifierGroup(id);
      menuTree = {
        categories:
          menuTree?.categories.map((c) => ({
            ...c,
            items: c.items.map((i) => ({
              ...i,
              modifierGroups: i.modifierGroups.filter((g) => g.id !== id),
            })),
          })) ?? [],
      };
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function createModifierOption(
    groupId: string,
    body: CreateModifierOptionRequest,
  ): Promise<ModifierOption> {
    setLoading(true);
    setError(null);

    try {
      const option = await api.createModifierOption(groupId, body);
      menuTree = {
        categories:
          menuTree?.categories.map((c) => ({
            ...c,
            items: c.items.map((i) => ({
              ...i,
              modifierGroups: i.modifierGroups.map((g) =>
                g.id === groupId
                  ? { ...g, options: [...g.options, option] }
                  : g,
              ),
            })),
          })) ?? [],
      };
      return option;
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function updateModifierOption(
    id: string,
    body: UpdateModifierOptionRequest,
  ): Promise<ModifierOption> {
    setLoading(true);
    setError(null);

    try {
      const option = await api.updateModifierOption(id, body);
      menuTree = {
        categories:
          menuTree?.categories.map((c) => ({
            ...c,
            items: c.items.map((i) => ({
              ...i,
              modifierGroups: i.modifierGroups.map((g) => ({
                ...g,
                options: g.options.map((o) => (o.id === id ? { ...o, ...option } : o)),
              })),
            })),
          })) ?? [],
      };
      return option;
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function deleteModifierOption(id: string): Promise<void> {
    setLoading(true);
    setError(null);

    try {
      await api.deleteModifierOption(id);
      menuTree = {
        categories:
          menuTree?.categories.map((c) => ({
            ...c,
            items: c.items.map((i) => ({
              ...i,
              modifierGroups: i.modifierGroups.map((g) => ({
                ...g,
                options: g.options.filter((o) => o.id !== id),
              })),
            })),
          })) ?? [],
      };
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function loadAllergens(projectId: string) {
    try {
      const list = await api.getAllergens(projectId);
      allergens = list;
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function createAllergen(
    projectId: string,
    body: CreateAllergenRequest,
  ): Promise<Allergen> {
    try {
      const allergen = await api.createAllergen(projectId, body);
      allergens = [...allergens, allergen];
      return allergen;
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    }
  }

  async function loadTags(projectId: string) {
    try {
      const list = await api.getTags(projectId);
      tags = list;
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function createTag(projectId: string, body: CreateTagRequest): Promise<Tag> {
    try {
      const tag = await api.createTag(projectId, body);
      tags = [...tags, tag];
      return tag;
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    }
  }

  function clearError() {
    error = null;
  }

  return {
    get menuTree() {
      return menuTree;
    },
    get allergens() {
      return allergens;
    },
    get tags() {
      return tags;
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
    loadMenu,
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
    selectCategory,
    selectItem,
    clearError,
  };
}

export const menu = createMenuStore();
