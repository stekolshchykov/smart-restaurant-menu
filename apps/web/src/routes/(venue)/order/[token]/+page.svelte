<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import VenueSkeleton from '$lib/components/venue/VenueSkeleton.svelte';
	import WaitingScreen from '$lib/components/venue/WaitingScreen.svelte';
	import { venue } from '$lib/stores/venue.svelte';
	import { Receipt } from '@lucide/svelte';
	import { onMount } from 'svelte';

	const orderToken = $derived($page.params.token!);
	const order = $derived(venue.order);
	const loading = $derived(venue.loading);
	const error = $derived(venue.error);

	onMount(() => {
		venue.clearOrder();
		venue.clearError();
		void venue.loadOrder(orderToken);
	});

	async function handleRefresh() {
		await venue.loadOrder(orderToken);
	}

	function handleAddAnother() {
		const tableToken = venue.table?.token;
		if (tableToken) {
			void goto(`/table/${tableToken}`);
		}
	}

	function handleStartNew() {
		venue.clearOrder();
		const tableToken = venue.table?.token;
		if (tableToken) {
			void goto(`/table/${tableToken}`);
		}
	}
</script>

<svelte:head>
	{#if order}
		<title>Заказ #{order.id.slice(-6).toUpperCase()} — Digital Menu</title>
		<meta name="description" content={`Статус заказа: ${order.status}. Следите за приготовлением в реальном времени.`} />
		<meta property="og:title" content={`Заказ #${order.id.slice(-6).toUpperCase()} — Digital Menu`} />
		<meta property="og:description" content={`Статус заказа: ${order.status}`} />
		<meta property="og:type" content="website" />
	{:else}
		<title>Заказ — Digital Menu</title>
	{/if}
</svelte:head>

{#if loading && !order}
	<VenueSkeleton variant="card" />
{:else if error && !order}
	<div class="flex min-h-screen items-center justify-center p-6">
		<EmptyState
			icon={Receipt}
			title="Не удалось загрузить заказ"
			description={error}
		/>
	</div>
{:else if order}
	<WaitingScreen {order} tableLabel={venue.table?.label} onAddAnother={handleAddAnother} onStartNew={handleStartNew} onRefresh={handleRefresh} />
{/if}
