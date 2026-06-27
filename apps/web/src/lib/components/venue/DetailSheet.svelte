<script lang="ts">
	import type { MenuItem, ModifierOption } from '@digital-menu/api-client';
	import { Minus, Plus, X } from '@lucide/svelte';
	import { formatMoney } from '$lib/stores/cart.svelte';
	import Sheet from '$lib/components/ui/Sheet.svelte';

	interface Props {
		item: MenuItem | null;
		currency?: string;
		open: boolean;
		onClose: () => void;
		onAddToCart: (
			item: MenuItem,
			quantity: number,
			modifiers: Record<string, ModifierOption>,
			note: string,
		) => void;
		addLabel?: string;
	}

	let { item, currency = '€', open, onClose, onAddToCart, addLabel = 'Добавить' }: Props = $props();

	let quantity = $state(1);
	let selectedModifiers = $state<Record<string, ModifierOption>>({});
	let note = $state('');

	const hasImage = $derived(!!item && (item.imageUrl || item.images.length > 0));
	const galleryImages = $derived(item?.images ?? (item?.imageUrl ? [item.imageUrl] : []));

	const basePrice = $derived(Number.parseFloat(item?.price ?? '0'));
	const modifiersTotal = $derived(
		Object.values(selectedModifiers).reduce((sum, option) => sum + Number.parseFloat(option.price), 0),
	);
	const totalPrice = $derived(formatMoney((basePrice + modifiersTotal) * quantity, currency));

	function isSelected(groupId: string, optionId: string): boolean {
		return selectedModifiers[groupId]?.id === optionId;
	}

	function toggleModifier(groupId: string, option: ModifierOption) {
		if (selectedModifiers[groupId]?.id === option.id) {
			const next = { ...selectedModifiers };
			delete next[groupId];
			selectedModifiers = next;
		} else {
			selectedModifiers = { ...selectedModifiers, [groupId]: option };
		}
	}

	function canAdd(): boolean {
		if (!item) return false;
		for (const group of item.modifierGroups) {
			if (group.required && !selectedModifiers[group.id]) {
				return false;
			}
		}
		return true;
	}

	function handleAdd() {
		if (!item || !canAdd()) return;
		onAddToCart(item, quantity, selectedModifiers, note);
		reset();
		onClose();
	}

	function reset() {
		quantity = 1;
		selectedModifiers = {};
		note = '';
	}

	$effect(() => {
		if (open) {
			reset();
		}
	});

	function handleClose() {
		reset();
		onClose();
	}
</script>

<Sheet open={open && !!item} onClose={handleClose} title={item?.name ?? 'Подробности'}>
	{#snippet header(titleId)}
		<h2
			id={titleId}
			class="text-xl font-bold"
			style="font-family: var(--font-heading); color: var(--color-heading-on-surface);"
		>
			{item?.name ?? 'Подробности'}
		</h2>
	{/snippet}

	<div class="flex max-h-[90vh] flex-col overflow-hidden">
		<div class="relative shrink-0">
			{#if hasImage}
				<div class="flex aspect-video w-full snap-x snap-mandatory overflow-x-auto">
					{#each galleryImages as image}
						<img
							src={image}
							alt=""
							class="h-full w-full shrink-0 snap-center object-cover"
						/>
					{/each}
				</div>
			{/if}

			<button
				type="button"
				class="absolute top-3 right-3 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-bg)]/80 text-[var(--color-text)] backdrop-blur-sm transition-colors hover:bg-[var(--color-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]"
				aria-label="Закрыть"
				onclick={handleClose}
			>
				<X class="h-5 w-5" aria-hidden="true" />
			</button>
		</div>

		<div class="flex-1 overflow-y-auto p-5">
			<div class="flex items-start justify-between gap-4">
				<h2
					class="text-2xl font-bold"
					style="font-family: var(--font-heading); color: var(--color-heading-on-surface);"
				>
					{item?.name ?? ''}
				</h2>
				<span class="text-lg font-semibold" style="color: var(--color-primary-dark);">
					{formatMoney(item?.price ?? '0', currency)}
				</span>
			</div>

			{#if item?.description}
				<p class="mt-2" style="color: var(--color-text-on-surface-secondary);">
					{item.description}
				</p>
			{/if}

			{#if item && item.ingredients.length > 0}
				<div class="mt-4">
					<h3 class="text-xs font-semibold uppercase tracking-wide" style="color: var(--color-text-on-surface-muted);">
						Ингредиенты
					</h3>
					<p class="mt-1 text-sm" style="color: var(--color-text-on-surface-secondary);">
						{item.ingredients.join(' · ')}
					</p>
				</div>
			{/if}

			{#if item && item.allergens.length > 0}
				<div class="mt-4">
					<h3 class="text-xs font-semibold uppercase tracking-wide" style="color: var(--color-text-on-surface-muted);">
						Аллергены
					</h3>
					<div class="mt-1 flex flex-wrap gap-1.5">
						{#each item.allergens as allergen}
							<span
								class="rounded-full bg-[var(--color-error-bg)] px-2 py-0.5 text-xs"
								style="color: var(--color-error);"
							>
								{allergen.name}
							</span>
						{/each}
					</div>
				</div>
			{/if}

			{#if item}
				{#each item.modifierGroups as group}
					<div class="mt-5">
						<div class="mb-2 flex items-center justify-between">
							<h3 class="font-semibold" style="color: var(--color-heading-on-surface);">
								{group.name}
							</h3>
							{#if group.required}
								<span class="text-xs" style="color: var(--color-error);">Обязательно</span>
							{/if}
						</div>
						<div class="flex flex-col gap-2">
							{#each group.options as option}
								<button
									type="button"
									class="flex items-center justify-between rounded-[var(--radius-md)] border px-4 py-3 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)] disabled:opacity-50"
									class:border-[var(--color-primary)]={isSelected(group.id, option.id)}
									class:bg-[var(--color-primary-bg)]={isSelected(group.id, option.id)}
									class:border-[var(--color-border-on-surface-subtle)]={!isSelected(group.id, option.id)}
									class:bg-[var(--color-surface-elevated)]={!isSelected(group.id, option.id)}
									aria-pressed={isSelected(group.id, option.id)}
									onclick={() => toggleModifier(group.id, option)}
								>
									<span style="color: var(--color-text-on-surface);">{option.name}</span>
									<span class="font-medium" style="color: var(--color-text-on-surface-secondary);">
										+{formatMoney(option.price, currency)}
									</span>
								</button>
							{/each}
						</div>
					</div>
				{/each}
			{/if}

			<div class="mt-5">
				<label for="item-note" class="text-xs font-semibold uppercase tracking-wide" style="color: var(--color-text-on-surface-muted);">
					Комментарий
				</label>
				<textarea
					id="item-note"
					bind:value={note}
					rows="2"
					class="mt-1 w-full rounded-[var(--radius-md)] border border-[var(--color-border-on-surface-subtle)] bg-[var(--color-surface-elevated)] px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]"
					style="color: var(--color-text-on-surface); resize: none;"
					placeholder="Например, без лука"
				></textarea>
			</div>
		</div>

		<div class="border-t border-[var(--color-border-on-surface-subtle)] p-4">
			<div class="flex items-center justify-between gap-4">
				<div class="flex items-center gap-3 rounded-full border border-[var(--color-border-on-surface-subtle)] bg-[var(--color-surface-elevated)] px-2 py-1">
					<button
						type="button"
						class="flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-[var(--color-surface-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]"
						aria-label="Уменьшить количество"
						disabled={quantity <= 1}
						onclick={() => quantity--}
					>
						<Minus class="h-4 w-4" style="color: var(--color-text-on-surface);" aria-hidden="true" />
					</button>
					<span class="min-w-6 text-center font-medium" style="color: var(--color-text-on-surface);">
						{quantity}
					</span>
					<button
						type="button"
						class="flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-[var(--color-surface-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]"
						aria-label="Увеличить количество"
						onclick={() => quantity++}
					>
						<Plus class="h-4 w-4" style="color: var(--color-text-on-surface);" aria-hidden="true" />
					</button>
				</div>

				<button
					type="button"
					class="flex flex-1 items-center justify-between rounded-[var(--radius-button)] bg-[var(--color-primary)] px-5 py-3 font-semibold text-[var(--color-bg)] transition-colors hover:bg-[var(--color-primary-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)] disabled:cursor-not-allowed disabled:opacity-50"
					disabled={!canAdd()}
					onclick={handleAdd}
				>
					<span>{addLabel}</span>
					<span>{totalPrice}</span>
				</button>
			</div>
		</div>
	</div>
</Sheet>
