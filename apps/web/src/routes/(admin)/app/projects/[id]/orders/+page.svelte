<script lang="ts">
	import { page } from '$app/stores';
	import { onMount, onDestroy } from 'svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import OrderCard from '$lib/components/orders/OrderCard.svelte';
	import Sheet from '$lib/components/ui/Sheet.svelte';
	import Button from '$lib/components/Button.svelte';
	import { orders } from '$lib/stores/orders.svelte';
	import { projects } from '$lib/stores/projects.svelte';
	import { success as toastSuccess } from '$lib/stores/toast.svelte';
	import type { OrderManagementStatus } from '@digital-menu/shared-types';
	import type { OrderStatus } from '@digital-menu/api-client';
	import { ClipboardList } from '@lucide/svelte';

	const projectId = $derived($page.params.id!);

	const statuses: { value: OrderManagementStatus | 'all'; label: string }[] = [
		{ value: 'all', label: 'Все' },
		{ value: 'submitted', label: 'Новые' },
		{ value: 'preparing', label: 'Готовятся' },
		{ value: 'ready', label: 'Готовы' },
		{ value: 'served', label: 'Подано' },
		{ value: 'cancelled', label: 'Отменены' }
	];

	let filter = $state<OrderManagementStatus | 'all'>('all');
	let updatingOrderId = $state<string | null>(null);
	let cancellingOrderId = $state<string | null>(null);

	const cancellingShortId = $derived(
		cancellingOrderId ? cancellingOrderId.slice(-6).toUpperCase() : ''
	);

	const filteredOrders = $derived(
		filter === 'all' ? orders.orders : orders.orders.filter((o) => o.status === filter)
	);

	const currency = $derived(projects.currentProject?.currency ?? '€');

	onMount(() => {
		orders.clearError();
		void projects.selectProject(projectId);
		void orders.loadOrders(projectId, filter === 'all' ? undefined : filter);
		orders.startAutoRefresh(projectId, filter === 'all' ? undefined : filter);
	});

	onDestroy(() => {
		orders.stopAutoRefresh();
	});

	function setFilter(value: OrderManagementStatus | 'all') {
		filter = value;
		orders.stopAutoRefresh();
		void orders.loadOrders(projectId, filter === 'all' ? undefined : filter);
		orders.startAutoRefresh(projectId, filter === 'all' ? undefined : filter);
	}

	const statusLabels: Record<OrderStatus, string> = {
		submitted: 'Получен',
		preparing: 'Готовится',
		ready: 'Готов',
		served: 'Подан',
		cancelled: 'Отменён'
	};

	async function handleUpdateStatus(orderId: string, status: OrderStatus) {
		if (status === 'cancelled') {
			cancellingOrderId = orderId;
			return;
		}

		updatingOrderId = orderId;
		try {
			await orders.updateOrderStatus(projectId, orderId, status);
			toastSuccess(`Статус заказа обновлён: ${statusLabels[status]}`);
		} catch {
			// ошибка уже отображается через orders.error
		} finally {
			updatingOrderId = null;
		}
	}

	async function confirmCancel() {
		if (!cancellingOrderId) return;
		const orderId = cancellingOrderId;
		cancellingOrderId = null;
		updatingOrderId = orderId;
		try {
			await orders.updateOrderStatus(projectId, orderId, 'cancelled');
			toastSuccess('Заказ отменён');
		} catch {
			// ошибка уже отображается через orders.error
		} finally {
			updatingOrderId = null;
		}
	}

	function closeCancelSheet() {
		cancellingOrderId = null;
	}
</script>

<svelte:head>
	<title>Заказы — Digital Menu</title>
</svelte:head>

<section class="mx-auto max-w-5xl">
	<div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<h1 class="text-2xl font-bold" style="font-family: var(--font-heading); color: var(--color-heading);">
			Заказы
		</h1>
		<div class="flex flex-wrap gap-2" role="group" aria-label="Фильтр по статусу">
			{#each statuses as s}
				<button
					type="button"
					class="inline-flex min-h-11 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)] disabled:cursor-not-allowed disabled:opacity-50 {filter ===
					s.value
						? 'bg-[var(--color-primary)] text-[var(--color-bg)] hover:bg-[var(--color-primary-light)]'
						: 'border border-[var(--color-border-strong)] text-[var(--color-text)] hover:bg-[var(--color-primary-bg)]'}"
					aria-pressed={filter === s.value}
					onclick={() => setFilter(s.value)}
				>
					{s.label}
				</button>
			{/each}
		</div>
	</div>

	{#if orders.error}
		<p class="mb-4 rounded-md bg-[var(--color-error-bg)] p-3 text-sm text-[var(--color-error)]" role="alert">
			{orders.error}
		</p>
	{/if}

	{#if orders.loading && filteredOrders.length === 0}
		<div class="space-y-4">
			{#each [1, 2, 3] as _}
				<div class="h-32 animate-pulse rounded-[var(--radius-md)] bg-[var(--color-bg-elevated)]"></div>
			{/each}
		</div>
	{:else if filteredOrders.length === 0}
		<EmptyState
			icon={ClipboardList}
			title="Нет заказов"
			description={filter === 'all'
				? 'Заказы появятся здесь, как только гости их оформят.'
				: 'В выбранном статусе пока нет заказов.'}
		/>
	{:else}
		<div class="space-y-4">
			{#each filteredOrders as order (order.id)}
				<OrderCard
					{order}
					{currency}
					loading={updatingOrderId === order.id}
					onUpdateStatus={(status) => handleUpdateStatus(order.id, status)}
				/>
			{/each}
		</div>
	{/if}
</section>

<Sheet open={cancellingOrderId !== null} onClose={closeCancelSheet} title="Подтвердите отмену" position="center">
	<div class="flex flex-col gap-6 p-6">
		<p style="color: var(--color-text);">
			Отменить заказ #{cancellingShortId}? Это действие нельзя отменить.
		</p>
		<div class="flex flex-wrap justify-end gap-3">
			<Button variant="outline" onclick={closeCancelSheet}>
				Нет, оставить
			</Button>
			<Button onclick={confirmCancel} disabled={updatingOrderId !== null}>
				Да, отменить
			</Button>
		</div>
	</div>
</Sheet>
