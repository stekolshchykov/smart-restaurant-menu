<script lang="ts">
	interface Props {
		variant?: 'page' | 'menu' | 'card';
		count?: number;
	}

	let { variant = 'page', count = 4 }: Props = $props();
</script>

{#if variant === 'page'}
	<div class="mx-auto max-w-4xl px-4 py-8">
		<div class="mx-auto mb-8 max-w-xl space-y-4 text-center">
			<div class="mx-auto h-10 w-3/4 animate-pulse rounded-lg bg-[var(--color-border)]"></div>
			<div class="mx-auto h-5 w-1/2 animate-pulse rounded-lg bg-[var(--color-border-subtle)]"></div>
		</div>
		<div class="grid gap-4 sm:grid-cols-3">
			{#each Array(3) as _}
				<div class="h-32 animate-pulse rounded-[var(--radius-md)] bg-[var(--color-bg-elevated)]"></div>
			{/each}
		</div>
	</div>
{:else if variant === 'menu'}
	<div class="sticky top-0 z-20 -mx-4 overflow-x-auto border-b border-[var(--color-border)] bg-[var(--color-bg)]/95 px-4 py-3 backdrop-blur-sm">
		<div class="flex gap-2">
			{#each Array(4) as _}
				<div class="h-9 w-24 animate-pulse rounded-full bg-[var(--color-bg-elevated)]"></div>
			{/each}
		</div>
	</div>
	<div class="mx-auto max-w-4xl px-4 py-6">
		<div class="mb-4 h-8 w-40 animate-pulse rounded-lg bg-[var(--color-border)]"></div>
		<div class="grid gap-4 sm:grid-cols-2">
			{#each Array(count) as _}
				<div class="h-32 animate-pulse rounded-[var(--radius-md)] bg-[var(--color-bg-elevated)]"></div>
			{/each}
		</div>
	</div>
{:else}
	<div class="h-32 animate-pulse rounded-[var(--radius-md)] bg-[var(--color-bg-elevated)]"></div>
{/if}
