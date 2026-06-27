<script lang="ts">
	import type { MenuItem } from '@digital-menu/api-client';
	import { Plus } from '@lucide/svelte';
	import { formatMoney } from '$lib/stores/cart.svelte';

	interface Props {
		item: MenuItem;
		currency?: string;
		onTap?: (item: MenuItem) => void;
		onQuickAdd?: (item: MenuItem) => void;
	}

	let { item, currency = '€', onTap, onQuickAdd }: Props = $props();

	const imageUrl = $derived(item.imageUrl ?? item.images[0] ?? null);
	const hasImage = $derived(!!imageUrl);
	const unavailable = $derived(item.status === 'unavailable');

	function handleTap(event: MouseEvent | KeyboardEvent) {
		if (unavailable) return;
		if ((event.target as HTMLElement)?.closest('[data-quick-add]')) return;
		onTap?.(item);
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			handleTap(event);
		}
	}

	function handleQuickAdd(event: MouseEvent) {
		event.stopPropagation();
		if (unavailable) return;
		onQuickAdd?.(item);
	}
</script>

<div
	class="group relative flex gap-4 overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border-on-surface-subtle)] bg-[var(--color-surface)] p-3 shadow-[var(--shadow-sm)] transition-shadow focus-within:shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-md)]"
	class:opacity-60={unavailable}
	class:grayscale={unavailable}
	role="button"
	tabindex="0"
	aria-label="{item.name}{item.shortDescription ? ', ' + item.shortDescription : ''}, {formatMoney(item.price, currency)}"
	aria-disabled={unavailable}
	onclick={handleTap}
	onkeydown={handleKeyDown}
>
	{#if unavailable}
		<span
			class="absolute top-2 right-2 z-10 rounded-full bg-[var(--color-bg-overlay)] px-2 py-0.5 text-xs font-medium"
			style="color: var(--color-text);"
		>
			Недоступно
		</span>
	{/if}

	{#if hasImage}
		<div class="shrink-0 overflow-hidden rounded-[var(--radius-sm)]">
			<img
				src={imageUrl}
				alt=""
				width="96"
				height="96"
				class="h-24 w-24 object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none"
				loading="lazy"
				decoding="async"
			/>
		</div>
	{/if}

	<div class="flex min-w-0 flex-1 flex-col justify-between">
		<div>
			<h3
				class="font-semibold"
				style="font-family: var(--font-heading); color: var(--color-heading-on-surface);"
			>
				{item.name}
			</h3>
			{#if item.shortDescription}
				<p class="mt-0.5 line-clamp-2 text-sm" style="color: var(--color-text-on-surface-secondary);">
					{item.shortDescription}
				</p>
			{/if}
		</div>

		<div class="mt-2 flex items-center justify-between">
			<span class="font-semibold" style="color: var(--color-text-on-surface);">
				{formatMoney(item.price, currency)}
			</span>

			{#if item.quickAdd && onQuickAdd && !unavailable}
				<button
					type="button"
					data-quick-add
					class="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-primary)] text-[var(--color-bg)] transition-colors hover:bg-[var(--color-primary-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]"
					aria-label="Быстро добавить {item.name}"
					onclick={handleQuickAdd}
				>
					<Plus class="h-5 w-5" aria-hidden="true" />
				</button>
			{/if}
		</div>
	</div>
</div>
