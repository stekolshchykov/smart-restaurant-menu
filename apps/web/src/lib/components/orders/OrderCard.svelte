<script lang="ts">
	import { ChevronDown, ChevronUp } from '@lucide/svelte';
	import type { OrderListItemResponse, OrderStatus } from '@digital-menu/api-client';
	import Badge from '$lib/components/Badge.svelte';
	import Button from '$lib/components/Button.svelte';

	interface Props {
		order: OrderListItemResponse;
		currency?: string;
		loading?: boolean;
		onUpdateStatus: (status: OrderStatus) => void;
	}

	let { order, currency = '€', loading = false, onUpdateStatus }: Props = $props();

	let expanded = $state(false);

	const statusConfig: Record<
		OrderStatus,
		{ label: string; variant: 'default' | 'success' | 'warning' | 'error' | 'info' }
	> = {
		submitted: { label: 'Получен', variant: 'default' },
		preparing: { label: 'Готовится', variant: 'warning' },
		ready: { label: 'Готов', variant: 'success' },
		served: { label: 'Подан', variant: 'info' },
		cancelled: { label: 'Отменён', variant: 'error' },
	};

	const actions: { status: OrderStatus; label: string; variant: 'primary' | 'outline' | 'ghost' }[] =
		$derived.by(() => {
			switch (order.status) {
				case 'submitted':
					return [
						{ status: 'preparing', label: 'В работу', variant: 'primary' },
						{ status: 'cancelled', label: 'Отменить', variant: 'outline' },
					];
				case 'preparing':
					return [
						{ status: 'ready', label: 'Готов', variant: 'primary' },
						{ status: 'cancelled', label: 'Отменить', variant: 'outline' },
					];
				case 'ready':
					return [
						{ status: 'served', label: 'Подан', variant: 'primary' },
						{ status: 'cancelled', label: 'Отменить', variant: 'outline' },
					];
				default:
					return [];
			}
		});

	const itemCount = $derived(order.items.reduce((sum, item) => sum + item.quantity, 0));

	function formatTime(iso: string): string {
		const date = new Date(iso);
		return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
	}

	function formatDate(iso: string): string {
		const date = new Date(iso);
		return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
	}
</script>

<article
	class="flex flex-col gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-4 transition-shadow hover:shadow-[var(--shadow-md)]"
	aria-labelledby="order-{order.id}-label"
>
	<div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
		<div class="flex-1">
			<div class="flex flex-wrap items-center gap-2">
				<h3 id="order-{order.id}-label" class="text-base font-semibold" style="color: var(--color-heading);">
					Стол {order.tableLabel}
				</h3>
				<Badge variant={statusConfig[order.status].variant}>
					{statusConfig[order.status].label}
				</Badge>
			</div>
			<p class="mt-1 text-xs" style="color: var(--color-text-muted);">
				#{order.id.slice(-6).toUpperCase()} · {formatDate(order.createdAt)} {formatTime(order.createdAt)}
			</p>
		</div>
		<div class="text-right">
			<p class="text-lg font-bold" style="color: var(--color-primary-light);">
				{currency}{Number(order.total).toFixed(2)}
			</p>
			<p class="text-xs" style="color: var(--color-text-muted);">
				{itemCount} {itemCount === 1 ? 'позиция' : 'позиции'}
			</p>
		</div>
	</div>

	<div class="flex flex-wrap items-center gap-2">
		<button
			type="button"
			class="inline-flex items-center gap-1 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)]"
			style="color: var(--color-text-secondary);"
			aria-expanded={expanded}
			onclick={() => (expanded = !expanded)}
		>
			{#if expanded}
				<ChevronUp class="h-4 w-4" aria-hidden="true" />
			{:else}
				<ChevronDown class="h-4 w-4" aria-hidden="true" />
			{/if}
			{expanded ? 'Скрыть позиции' : 'Показать позиции'}
		</button>
	</div>

	{#if expanded}
		<ul class="divide-y divide-dashed divide-[var(--color-border)]" role="list" aria-label="Позиции заказа">
			{#each order.items as item (item.id)}
				<li class="py-3">
					<div class="flex items-start justify-between gap-3">
						<div class="min-w-0 flex-1">
							<p class="text-sm font-medium" style="color: var(--color-text);">
								{item.name}
							</p>
							{#if item.addons.length > 0}
								<p class="text-xs" style="color: var(--color-text-secondary);">
									{item.addons.map((addon) => addon.name).join(', ')}
								</p>
							{/if}
							{#if item.note}
								<p class="text-xs italic" style="color: var(--color-text-muted);">
									Примечание: {item.note}
								</p>
							{/if}
						</div>
						<div class="text-right">
							<span class="text-sm" style="color: var(--color-text-secondary);">×{item.quantity}</span>
						</div>
					</div>
				</li>
			{/each}
		</ul>
	{/if}

	{#if actions.length > 0}
		<div class="flex flex-wrap gap-2 pt-2">
			{#each actions as action (action.status)}
				<Button
					variant={action.variant}
					disabled={loading}
					onclick={() => onUpdateStatus(action.status)}
				>
					{action.label}
				</Button>
			{/each}
		</div>
	{/if}
</article>
