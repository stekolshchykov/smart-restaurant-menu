<script lang="ts">
	import type { LocalCartItem } from '$lib/stores/cart.svelte';
	import { formatMoney, getItemsTotal, getLineTotal } from '$lib/stores/cart.svelte';
	import Button from '$lib/components/Button.svelte';
	import Sheet from '$lib/components/ui/Sheet.svelte';

	interface Props {
		items: LocalCartItem[];
		currency?: string;
		open: boolean;
		onClose: () => void;
		onConfirm: () => void;
		tableLabel?: string;
		estimatedMinutes?: number | null;
		placing?: boolean;
	}

	let {
		items,
		currency = '€',
		open,
		onClose,
		onConfirm,
		tableLabel,
		estimatedMinutes,
		placing = false,
	}: Props = $props();

	const total = $derived(formatMoney(getItemsTotal(items), currency));
</script>

<Sheet open={open} onClose={onClose} title="Подтвердите заказ" class="max-h-[85vh]">
	<div class="flex max-h-[calc(85vh-4rem)] flex-col">
		<div class="flex-1 overflow-y-auto p-4">
			{#if tableLabel}
				<p class="mb-1 text-sm" style="color: var(--color-text-on-surface-secondary);">
					Стол {tableLabel}
				</p>
			{/if}
			{#if estimatedMinutes}
				<p class="mb-4 text-sm" style="color: var(--color-text-on-surface-secondary);">
					Ориентировочное время: {estimatedMinutes} мин
				</p>
			{/if}

			<ul class="flex flex-col gap-4">
				{#each items as item}
					<li
						class="rounded-[var(--radius-md)] border border-[var(--color-border-on-surface-subtle)] bg-[var(--color-surface-elevated)] p-3"
					>
						<div class="flex items-start justify-between gap-3">
							<div class="min-w-0 flex-1">
								<h3 class="font-semibold" style="color: var(--color-heading-on-surface);">
									{item.quantity} × {item.name}
								</h3>
								{#if item.modifiers.length > 0}
									<ul class="mt-1 space-y-0.5">
										{#each item.modifiers as mod}
											<li class="text-sm" style="color: var(--color-text-on-surface-secondary);">
												+ {mod.name}
												{formatMoney(Number.parseFloat(mod.price), currency)}
											</li>
										{/each}
									</ul>
								{/if}
								{#if item.note}
									<p
										class="mt-1 text-sm italic"
										style="color: var(--color-text-on-surface-muted);"
									>
										{item.note}
									</p>
								{/if}
							</div>
							<span class="font-semibold" style="color: var(--color-text-on-surface);">
								{formatMoney(getLineTotal(item), currency)}
							</span>
						</div>
					</li>
				{/each}
			</ul>

			<div
				class="mt-4 flex items-center justify-between border-t border-[var(--color-border-on-surface-subtle)] pt-4"
			>
				<span class="font-medium" style="color: var(--color-text-on-surface-secondary);">Итого</span>
				<span class="text-xl font-bold" style="color: var(--color-heading-on-surface);">
					{total}
				</span>
			</div>
		</div>

		<div class="border-t border-[var(--color-border-on-surface-subtle)] p-4">
			<div class="flex flex-col gap-3">
				<Button
					variant="primary"
					class="w-full"
					disabled={placing}
					onclick={() => void onConfirm()}
				>
					{placing ? 'Отправка...' : 'Подтвердить и отправить на кухню'}
				</Button>
				<Button variant="outline" class="w-full" disabled={placing} onclick={onClose}>
					Вернуться в корзину
				</Button>
			</div>
		</div>
	</div>
</Sheet>
