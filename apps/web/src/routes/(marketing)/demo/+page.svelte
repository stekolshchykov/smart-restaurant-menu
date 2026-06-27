<script lang="ts">
	import type { MenuItem, ModifierOption } from '@digital-menu/api-client';
	import { ShoppingBag, X, Plus } from '@lucide/svelte';
	import CategoryChips from '$lib/components/venue/CategoryChips.svelte';
	import MenuItemCard from '$lib/components/venue/MenuItemCard.svelte';
	import DetailSheet from '$lib/components/venue/DetailSheet.svelte';
	import Container from '$lib/components/marketing/Container.svelte';
	import Button from '$lib/components/Button.svelte';
	import { demoCategories, demoProject } from './demo-menu';

	let selectedCategoryId = $state(demoCategories[0]?.id ?? null);
	let selectedItem = $state<MenuItem | null>(null);
	let detailOpen = $state(false);
	let cartCount = $state(0);
	let cartTotal = $state(0);
	let toast = $state<string | null>(null);

	const selectedCategory = $derived(
		demoCategories.find((category) => category.id === selectedCategoryId) ?? demoCategories[0],
	);

	function showDetail(item: MenuItem) {
		selectedItem = item;
		detailOpen = true;
	}

	function closeDetail() {
		detailOpen = false;
	}

	function quickAdd(item: MenuItem) {
		cartCount += 1;
		cartTotal += Number.parseFloat(item.price);
		showToast(`${item.name} добавлено в корзину`);
	}

	function addToCart(
		item: MenuItem,
		quantity: number,
		_modifiers: Record<string, ModifierOption>,
		_note: string,
	) {
		cartCount += quantity;
		cartTotal += Number.parseFloat(item.price) * quantity;
		showToast(`${item.name} × ${quantity} добавлено в корзину`);
	}

	function showToast(message: string) {
		toast = message;
		setTimeout(() => {
			toast = null;
		}, 2000);
	}
</script>

<svelte:head>
	<title>Демо меню — Digital Menu</title>
	<meta name="description" content="Интерактивное демо цифрового меню для гостей ресторана." />
</svelte:head>

<section class="border-b border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 py-12">
	<Container>
		<div class="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
			<div>
				<div class="flex items-center gap-2 text-sm" style="color: var(--color-text-muted);">
					<span>Демо</span>
					<span aria-hidden="true">·</span>
					<span>{demoProject.name}</span>
				</div>
				<h1
					class="mt-2 text-3xl font-bold md:text-4xl"
					style="font-family: var(--font-heading); color: var(--color-heading);"
				>
					{demoProject.name}
				</h1>
				<p class="mt-2 max-w-xl" style="color: var(--color-text-secondary);">
					{demoProject.description}
				</p>
			</div>
			<Button href="/register" class="shrink-0">Создать своё меню</Button>
		</div>
	</Container>
</section>

<section class="px-4 py-6">
	<Container>
		<CategoryChips
			categories={demoCategories}
			selectedId={selectedCategoryId}
			onSelect={(id) => (selectedCategoryId = id)}
		/>
	</Container>
</section>

<section class="px-4 pb-24">
	<Container>
		{#if selectedCategory}
			<h2 class="mb-4 text-xl font-semibold" style="color: var(--color-heading);">
				{selectedCategory.name}
			</h2>
			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each selectedCategory.items as item (item.id)}
					<MenuItemCard
						{item}
						currency={demoProject.currency}
						onTap={showDetail}
						onQuickAdd={quickAdd}
					/>
				{/each}
			</div>
		{:else}
			<p style="color: var(--color-text-muted);">Выберите категорию меню.</p>
		{/if}
	</Container>
</section>

<DetailSheet
	item={selectedItem}
	currency={demoProject.currency}
	open={detailOpen}
	onClose={closeDetail}
	onAddToCart={addToCart}
/>

{#if cartCount > 0}
	<div
		class="fixed right-4 bottom-4 left-4 z-40 flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--color-border-on-surface-subtle)] bg-[var(--color-surface)] px-4 py-3 shadow-[var(--shadow-lg)] md:left-auto md:min-w-[20rem]"
	>
		<div class="flex items-center gap-3">
			<div
				class="flex h-10 w-10 items-center justify-center rounded-full"
				style="background: var(--color-primary-bg); color: var(--color-primary);"
			>
				<ShoppingBag class="h-5 w-5" aria-hidden="true" />
			</div>
			<div>
				<p class="text-sm font-medium" style="color: var(--color-text-on-surface);">
					{cartCount} {cartCount === 1 ? 'позиция' : 'позиции'}
				</p>
				<p class="text-sm" style="color: var(--color-text-on-surface-muted);">
					Итого: {demoProject.currency}{cartTotal.toFixed(2)}
				</p>
			</div>
		</div>
		<button
			type="button"
			class="flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-[var(--color-bg)] transition-colors hover:bg-[var(--color-primary-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]"
			onclick={() => showToast('Оформление заказа доступно после регистрации')}
		>
			<Plus class="h-4 w-4" aria-hidden="true" />
			Заказать
		</button>
	</div>
{/if}

{#if toast}
	<div
		role="status"
		aria-live="polite"
		class="fixed top-20 left-1/2 z-50 -translate-x-1/2 rounded-[var(--radius-md)] bg-[var(--color-bg-elevated)] px-4 py-2 text-sm shadow-[var(--shadow-lg)]"
		style="color: var(--color-text);"
	>
		<div class="flex items-center gap-2">
			<span>{toast}</span>
			<button
				type="button"
				class="rounded p-1 hover:bg-[var(--color-border)]"
				aria-label="Закрыть уведомление"
				onclick={() => (toast = null)}
			>
				<X class="h-4 w-4" aria-hidden="true" />
			</button>
		</div>
	</div>
{/if}
