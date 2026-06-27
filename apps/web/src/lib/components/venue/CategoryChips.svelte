<script lang="ts">
	import type { Category, CategoryWithItems } from '@digital-menu/api-client';

	interface Props {
		categories: (Category | CategoryWithItems)[];
		selectedId: string | null;
		onSelect: (id: string) => void;
	}

	let { categories, selectedId, onSelect }: Props = $props();
</script>

<div
	class="sticky top-0 z-20 -mx-4 overflow-x-auto border-b border-[var(--color-border)] bg-[var(--color-bg)]/95 px-4 py-3 backdrop-blur-sm"
	role="tablist"
	aria-label="Категории меню"
>
	<div class="flex gap-2">
		{#each categories as category}
			<button
				type="button"
				role="tab"
				aria-selected={selectedId === category.id}
				class="shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]"
				class:bg-[var(--color-primary)]={selectedId === category.id}
				class:text-[var(--color-bg)]={selectedId === category.id}
				class:bg-[var(--color-primary-bg)]={selectedId !== category.id}
				class:text-[var(--color-text)]={selectedId !== category.id}
				onclick={() => onSelect(category.id)}
			>
				{category.name}
			</button>
		{/each}
	</div>
</div>
