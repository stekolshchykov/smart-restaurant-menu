<script lang="ts">
	import type { LocalCartItem } from '$lib/stores/cart.svelte';
	import { formatMoney, getItemsTotal, getLineTotal } from '$lib/stores/cart.svelte';
	import Sheet from '$lib/components/ui/Sheet.svelte';
	import { Minus, Plus, Trash2 } from '@lucide/svelte';

	interface Props {
		items: LocalCartItem[];
		currency?: string;
		open: boolean;
		onClose: () => void;
		onUpdateQuantity: (localId: string, quantity: number) => void;
		onRemove: (localId: string) => void;
		onUpdateNote?: (localId: string, note: string) => void;
		onPlaceOrder: () => void;
		placing?: boolean;
	}

	let {
		items,
		currency = '€',
		open,
		onClose,
		onUpdateQuantity,
		onRemove,
		onUpdateNote = () => {},
		onPlaceOrder,
		placing = false,
	}: Props = $props();

	const total = $derived(formatMoney(getItemsTotal(items), currency));
</script>

<Sheet open={open} onClose={onClose} title="Ваш заказ" class="max-h-[85vh]">
	<div class="flex max-h-[calc(85vh-4rem)] flex-col">
		<div class="flex-1 overflow-y-auto p-4">
			{#if items.length === 0}
				<p class="py-8 text-center" style="color: var(--color-text-on-surface-secondary);">
					Корзина пуста
				</p>
			{:else}
				<ul class="flex flex-col gap-4">
					{#each items as item}
						<li
							class="rounded-[var(--radius-md)] border border-[var(--color-border-on-surface-subtle)] bg-[var(--color-surface-elevated)] p-3"
						>
							<div class="flex items-start justify-between gap-3">
								<div class="min-w-0 flex-1">
									<h3 class="font-semibold" style="color: var(--color-heading-on-surface);">
										{item.name}
									</h3>
									{#if item.modifiers.length > 0}
										<ul class="mt-1 space-y-0.5">
											{#each item.modifiers as mod}
												<li
													class="text-sm"
													style="color: var(--color-text-on-surface-secondary);"
												>
													+ {mod.name}
													{formatMoney(Number.parseFloat(mod.price), currency)}
												</li>
											{/each}
										</ul>
									{/if}
									<div class="mt-2">
										<label for="note-{item.localId}" class="sr-only">Примечание</label>
										<input
											id="note-{item.localId}"
											type="text"
											value={item.note}
											placeholder="Примечание"
											class="w-full rounded-md border border-[var(--color-border-on-surface-subtle)] bg-[var(--color-surface)] px-2 py-1.5 text-sm placeholder:text-[var(--color-text-on-surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)]"
											style="color: var(--color-text-on-surface);"
											oninput={(e) => onUpdateNote(item.localId, e.currentTarget.value)}
										/>
									</div>
								</div>
								<button
									type="button"
									class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--color-error)] transition-colors hover:bg-[var(--color-error-bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)]"
									aria-label="Удалить {item.name}"
									onclick={() => onRemove(item.localId)}
								>
									<Trash2 class="h-5 w-5" aria-hidden="true" />
								</button>
							</div>

							<div class="mt-3 flex items-center justify-between">
								<div
									class="flex items-center gap-2 rounded-full border border-[var(--color-border-on-surface-subtle)] bg-[var(--color-surface)] px-1.5 py-1"
								>
									<button
										type="button"
										class="flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-[var(--color-surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)]"
										aria-label="Уменьшить"
										onclick={() => onUpdateQuantity(item.localId, item.quantity - 1)}
									>
										<Minus
											class="h-4 w-4"
											style="color: var(--color-text-on-surface);"
											aria-hidden="true"
										/>
									</button>
									<span
										class="min-w-6 text-center text-sm font-medium"
										style="color: var(--color-text-on-surface);"
									>
										{item.quantity}
									</span>
									<button
										type="button"
										class="flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-[var(--color-surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)]"
										aria-label="Увеличить"
										onclick={() => onUpdateQuantity(item.localId, item.quantity + 1)}
									>
										<Plus
											class="h-4 w-4"
											style="color: var(--color-text-on-surface);"
											aria-hidden="true"
										/>
									</button>
								</div>

								<span class="font-semibold" style="color: var(--color-text-on-surface);">
									{formatMoney(getLineTotal(item), currency)}
								</span>
							</div>
						</li>
					{/each}
				</ul>
			{/if}
		</div>

		{#if items.length > 0}
			<div class="border-t border-[var(--color-border-on-surface-subtle)] p-4">
				<div class="mb-3 flex items-center justify-between">
					<span class="font-medium" style="color: var(--color-text-on-surface-secondary);"
						>Итого</span
					>
					<span class="text-xl font-bold" style="color: var(--color-heading-on-surface);">
						{total}
					</span>
				</div>
				<button
					type="button"
					class="w-full rounded-[var(--radius-button)] bg-[var(--color-primary)] py-3.5 font-semibold text-[var(--color-bg)] transition-colors hover:bg-[var(--color-primary-light)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)] disabled:cursor-not-allowed disabled:opacity-50"
					disabled={placing}
					onclick={onPlaceOrder}
				>
					{placing ? 'Оформление...' : 'Заказать'}
				</button>
			</div>
		{/if}
	</div>
</Sheet>
