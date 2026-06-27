<script lang="ts">
	import type { OrderResponse } from '@digital-menu/api-client';
	import { CheckCircle, ChefHat, Clock, Receipt, Sparkles, UtensilsCrossed } from '@lucide/svelte';
	import { onMount } from 'svelte';

	interface Props {
		order: OrderResponse;
		tableLabel?: string;
		currency?: string;
		onAddAnother?: () => void;
		onStartNew?: () => void;
		onRefresh?: () => Promise<void> | void;
	}

	let { order, tableLabel, currency = '€', onAddAnother, onStartNew, onRefresh }: Props = $props();

	const POLL_INTERVAL_MS = 10_000;

	let celebrate = $state(true);
	let justUpdated = $state(false);

	const estimatedSeconds = $derived((order.estimatedMinutes ?? 10) * 60);
	const createdAt = $derived(new Date(order.createdAt).getTime());
	const elapsedSeconds = $derived(Math.max(0, Math.floor((Date.now() - createdAt) / 1000)));
	const secondsRemaining = $derived(Math.max(0, estimatedSeconds - elapsedSeconds));
	const progress = $derived(
		elapsedSeconds >= estimatedSeconds ? 100 : (elapsedSeconds / estimatedSeconds) * 100,
	);

	const statusText = $derived.by(() => {
		switch (order.status) {
			case 'ready':
			case 'served':
				return 'Ваш заказ готов';
			case 'cancelled':
				return 'Заказ отменён';
			case 'preparing':
				return 'Готовим ваш заказ';
			case 'submitted':
			default:
				return secondsRemaining < 120 ? 'Почти готово' : 'Готовим ваш заказ';
		}
	});

	const total = $derived(
		order.items
			.reduce((sum, item) => {
				const addonsTotal = item.addons.reduce(
					(modSum, mod) => modSum + Number.parseFloat(mod.price),
					0,
				);
				return sum + (Number.parseFloat(item.basePrice) + addonsTotal) * item.quantity;
			}, 0)
			.toFixed(2),
	);

	const itemCount = $derived(order.items.reduce((sum, item) => sum + item.quantity, 0));

	function formatTimeMMSS(seconds: number): string {
		const m = Math.floor(seconds / 60);
		const s = seconds % 60;
		return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
	}

	function formatOrderNumber(orderId: string): string {
		return orderId.slice(-6).toUpperCase();
	}

	onMount(() => {
		celebrate = true;

		const timer = setTimeout(() => {
			celebrate = false;
		}, 1200);

		let pollTimer: ReturnType<typeof setTimeout> | null = null;

		async function poll() {
			if (!onRefresh) return;
			try {
				await onRefresh();
				justUpdated = true;
				setTimeout(() => {
					justUpdated = false;
				}, 1000);
			} finally {
				pollTimer = setTimeout(poll, POLL_INTERVAL_MS);
			}
		}

		pollTimer = setTimeout(poll, POLL_INTERVAL_MS);

		return () => {
			clearTimeout(timer);
			if (pollTimer) clearTimeout(pollTimer);
		};
	});
</script>

<section class="flex min-h-screen flex-col items-center px-4 py-8" aria-label="Статус заказа">
	<div class="flex w-full max-w-md flex-col items-center gap-6">
		<div class="relative">
			<div
				class="rounded-full border border-[var(--color-success)]/20 bg-[var(--color-success-bg)] p-5"
				style="box-shadow: var(--shadow-glow);"
			>
				<CheckCircle class="relative z-10 h-12 w-12 text-[var(--color-success)]" aria-hidden="true" />
			</div>
			{#if celebrate}
				<div class="absolute -top-1 -right-1">
					<Sparkles class="h-5 w-5 text-[var(--color-accent)]" aria-hidden="true" />
				</div>
			{/if}
		</div>

		<div class="text-center">
			<h1
				class="text-3xl font-bold sm:text-4xl"
				style="font-family: var(--font-heading); color: var(--color-heading);"
			>
				Заказ принят
			</h1>
			<div class="mt-3 flex flex-wrap items-center justify-center gap-2">
				<span
					class="inline-flex items-center gap-1 rounded-full bg-[var(--color-success-bg)] px-3 py-1 text-xs font-medium"
					style="color: var(--color-success);"
				>
					<CheckCircle class="h-3 w-3" aria-hidden="true" />
					Подтверждён
				</span>
				<span
					class="inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] px-3 py-1 text-xs font-medium"
					style="color: var(--color-text-secondary);"
				>
					<ChefHat class="h-3 w-3" aria-hidden="true" />
					#{formatOrderNumber(order.id)}
				</span>
			</div>
		</div>

		<div
			class="w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-5 text-center"
			aria-live="polite"
			aria-atomic="true"
		>
			<p class="text-sm" style="color: var(--color-text-secondary);">Ориентировочное время ожидания</p>
			<div
				class="mt-2 text-5xl font-bold tracking-tight"
				style="font-family: var(--font-heading); color: var(--color-heading);"
			>
				{formatTimeMMSS(secondsRemaining)}
			</div>
			<p class="mt-1 text-sm font-medium" style="color: var(--color-primary-light);">{statusText}</p>
			{#if justUpdated}
				<p class="sr-only" role="status">Статус заказа обновлён</p>
			{/if}
			<div class="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
				<div
					class="h-full rounded-full bg-[var(--color-primary)] transition-all duration-1000 ease-linear motion-reduce:transition-none"
					style="width: {progress}%"
				></div>
			</div>
		</div>

		<div class="w-full overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border-on-surface-subtle)] bg-[var(--color-surface)]">
			<div class="border-b border-[var(--color-border-on-surface-subtle)] p-4">
				<div class="flex items-center justify-between gap-3">
					<div class="flex items-center gap-3">
						<div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-bg)]">
							<Receipt class="h-5 w-5 text-[var(--color-accent)]" aria-hidden="true" />
						</div>
						<div>
							<h2 class="font-semibold" style="color: var(--color-heading-on-surface);">Ваш заказ</h2>
							<p class="text-sm" style="color: var(--color-text-on-surface-secondary);">
								{itemCount} {itemCount === 1 ? 'позиция' : 'позиции'}
							</p>
						</div>
					</div>
					{#if tableLabel}
						<span
							class="rounded-full bg-[var(--color-primary-bg)] px-2.5 py-1 text-xs font-medium"
							style="color: var(--color-primary);"
						>
							Стол {tableLabel}
						</span>
					{/if}
				</div>
			</div>

			<ul class="divide-y divide-dashed divide-[var(--color-border-on-surface-subtle)] px-4">
				{#each order.items as item}
					<li class="py-3">
						<div class="flex items-start justify-between gap-3">
							<div>
								<p class="font-medium" style="color: var(--color-text-on-surface);">
									{item.name}
								</p>
								{#if item.addons.length > 0}
									<p class="text-sm" style="color: var(--color-text-on-surface-secondary);">
										{item.addons.map((m) => m.name).join(', ')}
									</p>
								{/if}
								{#if item.note}
									<p class="text-sm italic" style="color: var(--color-text-on-surface-muted);">
										{item.note}
									</p>
								{/if}
							</div>
							<div class="text-right">
								<span class="text-sm" style="color: var(--color-text-on-surface-secondary);">×{item.quantity}</span>
								<p class="font-medium" style="color: var(--color-text-on-surface);">
									{currency}{(
										(Number.parseFloat(item.basePrice) +
											item.addons.reduce((sum, m) => sum + Number.parseFloat(m.price), 0)) *
										item.quantity
									).toFixed(2)}
								</p>
							</div>
						</div>
					</li>
				{/each}
			</ul>

			<div class="flex items-center justify-between border-t border-[var(--color-border-on-surface-subtle)] p-4">
				<span class="font-medium" style="color: var(--color-text-on-surface-secondary);">Итого</span>
				<span class="text-xl font-bold" style="color: var(--color-heading-on-surface);">
					{currency}{total}
				</span>
			</div>
		</div>

		<div class="w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-4">
			<div class="flex items-center gap-4">
				<div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-bg)]">
					<Clock class="h-5 w-5 text-[var(--color-accent)]" aria-hidden="true" />
				</div>
				<div>
					<p class="font-medium" style="color: var(--color-text);">Нужна помощь?</p>
					<p class="text-sm" style="color: var(--color-text-secondary);">
						Позовите официанта, попросите воды, салфетки или счёт через кнопку обслуживания.
					</p>
				</div>
			</div>
		</div>

		<div class="grid w-full gap-3 sm:grid-cols-2">
			{#if onAddAnother}
				<button
					type="button"
					class="inline-flex items-center justify-center gap-2 rounded-[var(--radius-button)] border border-[var(--color-border-strong)] px-5 py-3.5 font-semibold text-[var(--color-text)] transition-colors hover:bg-[var(--color-primary-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]"
					onclick={onAddAnother}
				>
					<UtensilsCrossed class="h-4 w-4" aria-hidden="true" />
					Добавить
				</button>
			{/if}
			{#if onStartNew}
				<button
					type="button"
					class="inline-flex items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--color-primary)] px-5 py-3.5 font-semibold text-[var(--color-bg)] transition-colors hover:bg-[var(--color-primary-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]"
					onclick={onStartNew}
				>
					<Sparkles class="h-4 w-4" aria-hidden="true" />
					Новый заказ
				</button>
			{/if}
		</div>
	</div>
</section>
