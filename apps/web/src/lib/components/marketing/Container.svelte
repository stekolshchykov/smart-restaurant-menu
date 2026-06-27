<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		class?: string;
	}

	let { children, class: className = '' }: Props = $props();
</script>

<div class="mx-auto w-full max-w-[var(--max-content-width)] px-4 sm:px-6 lg:px-8 {className}">
	{@render children()}
</div>
