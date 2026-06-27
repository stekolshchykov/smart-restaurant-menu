<script lang="ts">
	import { page } from '$app/stores';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import CartBar from '$lib/components/venue/CartBar.svelte';
	import CartSheet from '$lib/components/venue/CartSheet.svelte';
	import CategoryChips from '$lib/components/venue/CategoryChips.svelte';
	import OrderConfirmationSheet from '$lib/components/venue/OrderConfirmationSheet.svelte';
	import DetailSheet from '$lib/components/venue/DetailSheet.svelte';
	import MenuItemCard from '$lib/components/venue/MenuItemCard.svelte';
	import ServiceRequestPanel from '$lib/components/venue/ServiceRequestPanel.svelte';
	import VenueSkeleton from '$lib/components/venue/VenueSkeleton.svelte';
	import { cart } from '$lib/stores/cart.svelte';
	import { venue } from '$lib/stores/venue.svelte';
	import { success as toastSuccess } from '$lib/stores/toast.svelte';
	import type { MenuItem, ModifierOption } from '@digital-menu/api-client';
	import { Bell, Utensils } from '@lucide/svelte';
	import { onMount } from 'svelte';

	const token = $derived($page.params.token!);
	const table = $derived(venue.table);
	const menu = $derived(venue.menu);
	const loading = $derived(venue.loading);
	const error = $derived(venue.error);

	let selectedCategoryId = $state<string | null>(null);
	let detailItem = $state<MenuItem | null>(null);
	let detailOpen = $state(false);
	let cartOpen = $state(false);
	let confirmationOpen = $state(false);
	let serviceOpen = $state(false);

	const project = $derived(table?.project ?? null);
	const mode = $derived(project?.mode ?? 'menu_order');
	const currency = $derived(project?.currency ?? '€');
	const categories = $derived(menu?.categories ?? []);
	const selectedCategory = $derived(
		categories.find((c) => c.id === selectedCategoryId) ?? categories[0] ?? null,
	);

	const showOrderControls = $derived(mode === 'menu_order');
	const showServiceControls = $derived(mode === 'menu_service' || mode === 'menu_order');
	const showMenu = $derived(mode !== 'promo_only');
	const detailAddLabel = $derived(showOrderControls ? 'Добавить' : 'Закрыть');

	onMount(() => {
		venue.reset();
		cart.initForToken(token);
		void loadTableAndMenu();
	});

	async function loadTableAndMenu() {
		try {
			const tableResponse = await venue.loadTable(token);
			const menuResponse = await venue.loadMenu(tableResponse.project.slug);
			if (menuResponse.categories.length > 0 && !selectedCategoryId) {
				selectedCategoryId = menuResponse.categories[0].id;
			}
		} catch {
			// Errors are surfaced through venue.error.
		}
	}

	function openDetail(item: MenuItem) {
		detailItem = item;
		detailOpen = true;
	}

	function closeDetail() {
		detailOpen = false;
	}

	function handleQuickAdd(item: MenuItem) {
		if (!showOrderControls) return;
		cart.quickAdd(item);
		toastSuccess(`Добавлено: ${item.name}`);
	}

	function handleAddToCart(
		item: MenuItem,
		quantity: number,
		modifiers: Record<string, ModifierOption>,
		note: string,
	) {
		if (!showOrderControls) {
			closeDetail();
			return;
		}
		cart.addItem(item, quantity, modifiers, note);
		toastSuccess(`Добавлено: ${item.name} ×${quantity}`);
	}

	function openCart() {
		cartOpen = true;
	}

	function closeCart() {
		cartOpen = false;
	}

	function openConfirmation() {
		if (!showOrderControls) return;
		closeCart();
		confirmationOpen = true;
	}

	function closeConfirmation() {
		confirmationOpen = false;
	}
	function backToCart() {
		closeConfirmation();
		openCart();
	}

	async function placeOrder() {
		if (!showOrderControls) return;
		try {
			await venue.placeOrder(token, cart.items);
			toastSuccess('Заказ оформлен. Готовим ваш заказ.');
			cart.clearCart();
			closeConfirmation(); closeCart();
		} catch {
			// Errors are surfaced through venue.error.
		}
	}

	async function createServiceRequest(type: import('@digital-menu/api-client').ServiceRequestType) {
		try {
			await venue.createServiceRequest(token, type);
			const labels: Record<string, string> = {
				waiter: 'Официант вызван',
				water: 'Запрос на воду отправлен',
				napkins: 'Запрос на салфетки отправлен',
				bill: 'Запрос на счёт отправлен',
			};
			toastSuccess(labels[type] ?? 'Запрос отправлен');
		} catch {
			// Errors are surfaced through venue.error.
		}
	}
</script>

<svelte:head>
	{#if project}
		<title>Стол {table?.label ?? ''} — {project.name}</title>
		<meta name="description" content={project.description ?? `Меню стола ${table?.label ?? ''} в ${project.name}`} />
		<meta property="og:title" content={`Стол ${table?.label ?? ''} — ${project.name}`} />
		<meta property="og:description" content={project.description ?? `Меню стола ${table?.label ?? ''} в ${project.name}`} />
		<meta property="og:type" content="website" />
		{#if project.theme?.logoUrl}
			<meta property="og:image" content={project.theme.logoUrl} />
		{/if}
	{:else}
		<title>Стол — Digital Menu</title>
	{/if}
</svelte:head>

<section class="min-h-screen pb-28" aria-label="Меню стола">
	{#if table}
		<header class="border-b border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 py-4">
			<div class="mx-auto flex max-w-4xl items-center justify-between">
				<div>
					<p class="text-sm" style="color: var(--color-text-secondary);">
						{project?.name ?? 'Заведение'}
					</p>
					<h1
						class="text-xl font-bold"
						style="font-family: var(--font-heading); color: var(--color-heading);"
					>
						Стол {table.label}
					</h1>
				</div>
				{#if showServiceControls}
					<button
						type="button"
						class="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-primary-bg)] text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)] hover:text-[var(--color-bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)]"
						aria-label="Вызвать обслуживание"
						onclick={() => (serviceOpen = true)}
					>
						<Bell class="h-5 w-5" aria-hidden="true" />
					</button>
				{/if}
			</div>
		</header>
	{/if}

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
	{:else if menu && showMenu}
		<CategoryChips
			categories={menu.categories}
			selectedId={selectedCategory?.id ?? null}
			onSelect={(id) => (selectedCategoryId = id)}
		/>

		<div class="mx-auto max-w-4xl px-4 py-6">
			{#if selectedCategory}
				<section aria-labelledby="category-{selectedCategory.id}">
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
								currency={currency}
								onTap={openDetail}
								onQuickAdd={showOrderControls ? handleQuickAdd : undefined}
							/>
						{/each}
					</div>
				</section>
			{/if}
		</div>
	{:else if menu && !showMenu}
		<div class="p-6">
			<EmptyState
				icon={Utensils}
				title="Меню недоступно"
				description="В этом режиме меню скрыто."
			/>
		</div>
	{/if}
</section>

<DetailSheet
	item={detailItem}
	currency={currency}
	open={detailOpen}
	onClose={closeDetail}
	onAddToCart={handleAddToCart}
	addLabel={detailAddLabel}
/>

{#if showOrderControls}
	<CartBar count={cart.count} total={cart.totalFor(currency)} onOpen={openCart} />

	<CartSheet
		items={cart.items}
		currency={currency}
		open={cartOpen}
		onClose={closeCart}
		onUpdateQuantity={cart.updateQuantity}
		onRemove={cart.removeItem}
		onUpdateNote={cart.updateNote}
		onPlaceOrder={openConfirmation}
		placing={venue.loading}
	/>

	<OrderConfirmationSheet
		items={cart.items}
		currency={currency}
		open={confirmationOpen}
		onClose={backToCart}
		onConfirm={placeOrder}
		tableLabel={table?.label}
		placing={venue.loading}
	/>
{/if}

{#if showServiceControls}
	<ServiceRequestPanel
		open={serviceOpen}
		onClose={() => (serviceOpen = false)}
		onRequest={createServiceRequest}
	/>
{/if}

{#if venue.error}
	<div
		class="fixed right-4 bottom-28 left-4 z-40 rounded-[var(--radius-md)] bg-[var(--color-error-bg)] px-4 py-3 text-sm"
		style="color: var(--color-error);"
		role="alert"
	>
		{venue.error}
	</div>
{/if}
