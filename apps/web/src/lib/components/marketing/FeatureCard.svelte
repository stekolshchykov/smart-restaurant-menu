<script lang="ts">
	import type { Component } from 'svelte';

	interface Props {
		title: string;
		description: string;
		icon: Component;
	}

	let { title, description, icon: Icon }: Props = $props();
</script>

<article
	class="group rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6 transition-all hover:border-[var(--color-border-strong)] hover:bg-[var(--color-bg-elevated)]/80 hover:shadow-[var(--shadow-md)]"
>
	<div
		class="mb-4 flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)]"
		style="background: var(--color-primary-bg); color: var(--color-primary);"
	>
		<Icon class="h-6 w-6" aria-hidden="true" />
	</div>
	<h3 class="text-lg font-semibold" style="color: var(--color-heading);">{title}</h3>
	<p class="mt-2 text-sm leading-relaxed" style="color: var(--color-text-secondary);">
		{description}
	</p>
</article>
