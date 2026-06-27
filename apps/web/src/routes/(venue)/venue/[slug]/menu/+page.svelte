<script lang="ts">
	import { page } from '$app/stores';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import CategoryChips from '$lib/components/venue/CategoryChips.svelte';
	import DetailSheet from '$lib/components/venue/DetailSheet.svelte';
	import MenuItemCard from '$lib/components/venue/MenuItemCard.svelte';
	import VenueSkeleton from '$lib/components/venue/VenueSkeleton.svelte';
	import { venue } from '$lib/stores/venue.svelte';
	import type { MenuItem } from '@digital-menu/api-client';
	import { Utensils } from '@lucide/svelte';
	import { onMount } from 'svelte';

	const slug = $derived($page.params.slug!);
	const menu = $derived(venue.menu);
	const project = $derived(venue.project);
	const loading = $derived(venue.loading);
	const error = $derived(venue.error);

	let selectedCategoryId = $state<string | null>(null);
	let detailItem = $state<MenuItem | null>(null);
	let detailOpen = $state(false);

	const categories = $derived(menu?.categories ?? []);
	const selectedCategory = $derived(
		categories.find((c) => c.id === selectedCategoryId) ?? categories[0] ?? null,
	);

	onMount(() => {
		venue.reset();
		void venue.loadProject(slug);
		void venue.loadMenu(slug).then((response) => {
			if (response.categories.length > 0) {
				selectedCategoryId = response.categories[0].id;
			}
		});
	});

	function openDetail(item: MenuItem) {
		detailItem = item;
		detailOpen = true;
	}

	function closeDetail() {
		detailOpen = false;
	}

	function handleAddToCart(
		_item: MenuItem,
		_quantity: number,
		_modifiers: Record<string, import('@digital-menu/api-client').ModifierOption>,
		_note: string,
	) {
		// Menu-only page has no cart; just close the detail.
		closeDetail();
	}
</script>

<svelte:head>
	{#if project}
		<title>Меню — {project.name}</title>
		<meta name="description" content={project.description ?? `Меню заведения ${project.name}`} />
		<meta property="og:title" content={`Меню — ${project.name}`} />
		<meta property="og:description" content={project.description ?? `Меню заведения ${project.name}`} />
		<meta property="og:type" content="website" />
		{#if project.theme?.logoUrl}
			<meta property="og:image" content={project.theme.logoUrl} />
		{/if}
	{:else}
		<title>Меню — {slug}</title>
	{/if}
</svelte:head>

<section class="min-h-screen pb-8" aria-label="Меню заведения">
	{#if loading && !menu}
		<VenueSkeleton variant="menu" />
	{:else if error && !menu}
		<div class="p-6">
			<EmptyState
				icon={Utensils}
				title="Не удалось загрузить меню"
				description={error}
			/>
		</div>
	{:else if menu}
		<CategoryChips
			categories={menu.categories}
			selectedId={selectedCategory?.id ?? null}
			onSelect={(id) => (selectedCategoryId = id)}
		/>

		<div class="mx-auto max-w-4xl px-4 py-6">
			{#if selectedCategory}
				<section class="mb-8" aria-labelledby="category-{selectedCategory.id}">
					<h2
						id="category-{selectedCategory.id}"
						class="mb-4 text-2xl font-bold"
						style="font-family: var(--font-heading); color: var(--color-heading);"
					>
						{selectedCategory.name}
					</h2>
					<div class="grid gap-4 sm:grid-cols-2">
						{#each selectedCategory.items.filter((item) => item.status !== 'hidden') as item}
							<MenuItemCard
								item={item}
								currency={project?.currency ?? '€'}
								onTap={openDetail}
							/>
						{/each}
					</div>
				</section>
			{/if}
		</div>
	{/if}
</section>

<DetailSheet
	item={detailItem}
	currency={project?.currency ?? '€'}
	open={detailOpen}
	onClose={closeDetail}
	onAddToCart={handleAddToCart}
	addLabel="Закрыть"
/>
