<script lang="ts">
	interface Props {
		eyebrow?: string;
		title: string;
		subtitle?: string;
		centered?: boolean;
	}

	let { eyebrow, title, subtitle, centered = true }: Props = $props();
</script>

<div class="mb-10 md:mb-14" class:text-center={centered}>
	{#if eyebrow}
		<span
			class="mb-3 inline-block text-xs font-semibold uppercase tracking-wider"
			style="color: var(--color-primary);"
		>
			{eyebrow}
		</span>
	{/if}
	<h2
		class="text-3xl font-bold md:text-4xl"
		style="font-family: var(--font-heading); color: var(--color-heading);"
	>
		{title}
	</h2>
	{#if subtitle}
		<p class="mx-auto mt-4 max-w-2xl text-lg" style="color: var(--color-text-secondary);">
			{subtitle}
		</p>
	{/if}
</div>
