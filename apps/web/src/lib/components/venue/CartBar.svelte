<script lang="ts">
	import { ShoppingBag } from '@lucide/svelte';

	interface Props {
		count: number;
		total: string;
		onOpen: () => void;
	}

	let { count, total, onOpen }: Props = $props();
</script>

{#if count > 0}
	<div class="fixed right-0 bottom-0 left-0 z-40 p-4" style="bottom: var(--safe-area-bottom);">
		<button
			type="button"
			class="mx-auto flex max-w-md min-h-14 items-center justify-between bg-[var(--color-primary)] px-5 py-3.5 text-[var(--color-bg)] shadow-[var(--shadow-lg)] transition-transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)] motion-reduce:transition-none motion-reduce:hover:scale-100"
			style="border-radius: var(--radius-button);"
			onclick={onOpen}
			aria-label="Открыть корзину, {count} позиций, итого {total}"
		>
			<div class="flex items-center gap-3">
				<div class="relative">
					<ShoppingBag class="h-6 w-6" aria-hidden="true" />
					<span
						class="absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-bg)] px-1 text-xs font-bold"
						style="color: var(--color-primary);"
					>
						{count}
					</span>
				</div>
				<span class="font-semibold">Ваш заказ</span>
			</div>
			<span class="font-bold">{total}</span>
		</button>
	</div>
{/if}
