<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { ArrowLeft, Plus, Pencil, Trash2, UtensilsCrossed } from '@lucide/svelte';
	import type { CreateCategoryRequest, UpdateCategoryRequest } from '@digital-menu/api-client';
	import { formatMoney } from '$lib/stores/cart.svelte';
	import { menu } from '$lib/stores/menu.svelte';
	import { projects } from '$lib/stores/projects.svelte';
	import Button from '$lib/components/Button.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import FormError from '$lib/components/forms/FormError.svelte';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import CategoryForm from '$lib/components/menu/CategoryForm.svelte';
	import ItemInspector from '$lib/components/menu/ItemInspector.svelte';

	const id = $derived(page.params.id ?? '');
	const project = $derived(projects.currentProject);

	onMount(() => {
		if (id) {
			void projects.selectProject(id);
			void menu.loadMenu(id);
			void menu.loadAllergens(id);
			void menu.loadTags(id);
		}
	});

	let showCategoryForm = $state(false);
	let editingCategoryId = $state<string | null>(null);
	let newItemName = $state('');
	let newItemPrice = $state('');

	const sortedCategories = $derived(
		[...(menu.menuTree?.categories ?? [])].sort((a, b) => a.sortOrder - b.sortOrder),
	);

	const selectedCategory = $derived(menu.selectedCategory);

	const sortedItems = $derived(
		[...(selectedCategory?.items ?? [])].sort((a, b) => a.sortOrder - b.sortOrder),
	);

	function handleCategorySubmit(body: CreateCategoryRequest | UpdateCategoryRequest) {
		if (editingCategoryId) {
			void menu.updateCategory(editingCategoryId, body);
		} else {
			void menu.createCategory(id, body as CreateCategoryRequest);
		}
		showCategoryForm = false;
		editingCategoryId = null;
	}

	function startEditCategory(categoryId: string) {
		editingCategoryId = categoryId;
		showCategoryForm = true;
	}

	function cancelCategoryForm() {
		showCategoryForm = false;
		editingCategoryId = null;
	}

	function handleCreateItem() {
		if (!selectedCategory || !newItemName.trim() || !newItemPrice.trim()) return;
		void menu.createItem(selectedCategory.id, {
			name: newItemName.trim(),
			price: newItemPrice.trim(),
		});
		newItemName = '';
		newItemPrice = '';
	}
</script>

<svelte:head>
	<title>Меню — Digital Menu</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-4">
	<Button variant="ghost" href="/app/projects/{id}" class="mb-4 -ml-2 px-2">
		<ArrowLeft class="h-4 w-4" aria-hidden="true" />
		К обзору
	</Button>

	<div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<h1 class="text-2xl font-bold" style="font-family: var(--font-heading); color: var(--color-heading);">
			Меню
		</h1>
		{#if menu.loading}
			<span class="text-sm text-[var(--color-text-secondary)]">Загрузка…</span>
		{/if}
	</div>

	{#if menu.error}
		<div class="mb-6">
			<FormError message={menu.error} />
		</div>
	{/if}

	{#if menu.menuTree && sortedCategories.length === 0 && !menu.loading && !showCategoryForm}
		<EmptyState
			icon={UtensilsCrossed}
			title="Меню пока пусто"
			description="Создайте первую категорию, чтобы начать добавлять блюда."
		>
			<Button onclick={() => (showCategoryForm = true)}>
				<Plus class="h-4 w-4" aria-hidden="true" />
				Добавить категорию
			</Button>
		</EmptyState>
	{:else}
		<div class="grid gap-6 lg:grid-cols-[280px_1fr_360px]">
			<!-- Categories -->
			<aside class="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-4">
				<div class="mb-4 flex items-center justify-between">
					<h2 class="text-sm font-semibold text-[var(--color-heading)]">Категории</h2>
					<Button
						type="button"
						variant="ghost"
						class="px-2 py-1"
						onclick={() => {
							showCategoryForm = true;
							editingCategoryId = null;
						}}
					>
						<Plus class="h-4 w-4" aria-hidden="true" />
					</Button>
				</div>

				{#if showCategoryForm}
					{@const category = editingCategoryId
						? sortedCategories.find((c) => c.id === editingCategoryId)
						: null}
					<div class="mb-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
						<CategoryForm
							category={category
								? { name: category.name, sortOrder: category.sortOrder }
								: null}
							onSubmit={handleCategorySubmit}
							onCancel={cancelCategoryForm}
						/>
					</div>
				{/if}

				<ul class="space-y-1" role="listbox" aria-label="Категории">
					{#each sortedCategories as category (category.id)}
						<li>
							<button
								type="button"
								class="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)]"
								class:bg-[var(--color-primary-bg)]={menu.selectedCategoryId === category.id}
								class:text-[var(--color-primary-light)]={menu.selectedCategoryId === category.id}
								class:text-[var(--color-text)]={menu.selectedCategoryId !== category.id}
								class:hover:bg-[var(--color-primary-bg)]={menu.selectedCategoryId !== category.id}
								role="option"
								aria-selected={menu.selectedCategoryId === category.id}
								onclick={() => menu.selectCategory(category.id)}
							>
								<span class="truncate">{category.name}</span>
								<span class="text-xs opacity-60">#{category.sortOrder}</span>
							</button>
							<div class="flex items-center gap-1 px-2">
								<button
									type="button"
									class="flex h-11 w-11 items-center justify-center rounded p-1 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)]"
									aria-label="Редактировать категорию {category.name}"
									onclick={() => startEditCategory(category.id)}
								>
									<Pencil class="h-3.5 w-3.5" aria-hidden="true" />
								</button>
								<button
									type="button"
									class="flex h-11 w-11 items-center justify-center rounded p-1 text-[var(--color-text-secondary)] hover:text-[var(--color-error)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)]"
									aria-label="Удалить категорию {category.name}"
									onclick={() => menu.deleteCategory(category.id)}
								>
									<Trash2 class="h-3.5 w-3.5" aria-hidden="true" />
								</button>
							</div>
						</li>
					{/each}
				</ul>
			</aside>

			<!-- Items -->
			<section class="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-4">
				{#if selectedCategory}
					<div class="mb-4 flex items-center justify-between">
						<h2 class="text-sm font-semibold text-[var(--color-heading)]">{selectedCategory.name}</h2>
						<span class="text-xs text-[var(--color-text-secondary)]">{sortedItems.length} блюд</span>
					</div>

					<div class="mb-4 flex flex-col gap-2 sm:flex-row">
						<div class="flex-1">
							<TextInput label="Название блюда" name="new-item-name" placeholder="Название блюда" bind:value={newItemName} />
						</div>
						<div class="w-full sm:w-32">
							<TextInput label="Цена" name="new-item-price" placeholder="Цена" bind:value={newItemPrice} />
						</div>
						<Button type="button" ariaLabel="Добавить блюдо" onclick={handleCreateItem} disabled={!newItemName.trim() || !newItemPrice.trim()}>
							<Plus class="h-4 w-4" aria-hidden="true" />
						</Button>
					</div>

					{#if sortedItems.length === 0}
						<p class="py-8 text-center text-sm text-[var(--color-text-secondary)]">
							В этой категории пока нет блюд.
						</p>
					{:else}
						<ul class="space-y-2">
							{#each sortedItems as item (item.id)}
								<li>
									<button
										type="button"
										class="flex w-full items-center justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)]"
										class:border-[var(--color-primary)]={menu.selectedItemId === item.id}
										onclick={() => menu.selectItem(item.id)}
									>
										<div>
											<p class="text-sm font-medium text-[var(--color-text)]">{item.name}</p>
											<p class="text-xs text-[var(--color-text-secondary)]">
												{item.status === 'available' ? 'Доступно' : item.status === 'unavailable' ? 'Недоступно' : 'Скрыто'}
											</p>
										</div>
										<span class="text-sm font-medium text-[var(--color-text)]">{formatMoney(item.price, project?.currency ?? '€')}</span>
									</button>
								</li>
							{/each}
						</ul>
					{/if}
				{:else}
					<p class="py-8 text-center text-sm text-[var(--color-text-secondary)]">
						Выберите категорию слева.
					</p>
				{/if}
			</section>

			<!-- Inspector -->
			<aside class="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-4">
				{#if menu.selectedItem}
					<ItemInspector
						item={menu.selectedItem}
						allergens={menu.allergens}
						tags={menu.tags}
						loading={menu.loading}
						onUpdate={menu.updateItem}
						onDelete={menu.deleteItem}
						onCreateModifierGroup={menu.createModifierGroup}
						onUpdateModifierGroup={menu.updateModifierGroup}
						onDeleteModifierGroup={menu.deleteModifierGroup}
						onCreateModifierOption={menu.createModifierOption}
						onUpdateModifierOption={menu.updateModifierOption}
						onDeleteModifierOption={menu.deleteModifierOption}
					/>
				{:else}
					<EmptyState
						icon={UtensilsCrossed}
						title="Ничего не выбрано"
						description="Выберите блюдо из списка, чтобы редактировать его."
					/>
				{/if}
			</aside>
		</div>
	{/if}
</div>
