<script lang="ts">
	import type { Snippet, Component } from 'svelte';
	import type { LucideProps } from '@lucide/svelte';

	interface Props {
		icon?: Component<LucideProps>;
		title: string;
		description: string;
		children?: Snippet;
	}

	let { icon: IconComponent, title, description, children }: Props = $props();
</script>

<div
	class="flex flex-col items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-8 text-center"
	role="region"
	aria-label={title}
>
	{#if IconComponent}
		<div class="mb-4 rounded-full bg-[var(--color-primary-bg)] p-3">
			<IconComponent class="h-6 w-6 text-[var(--color-primary)]" aria-hidden="true" />
		</div>
	{/if}
	<h3 class="text-lg font-semibold" style="color: var(--color-heading);">
		{title}
	</h3>
	<p class="mt-1 max-w-sm text-sm" style="color: var(--color-text-secondary);">
		{description}
	</p>
	{#if children}
		<div class="mt-5">
			{@render children()}
		</div>
	{/if}
</div>
