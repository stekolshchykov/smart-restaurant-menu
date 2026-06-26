<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
		children: Snippet;
	}

	let { variant = 'default', children }: Props = $props();

	const variants = {
		default: 'bg-[var(--color-primary-bg)] text-[var(--color-primary-light)]',
		success: 'bg-[var(--color-success-bg)] text-[var(--color-success)]',
		warning: 'bg-[var(--color-warning-bg)] text-[var(--color-warning)]',
		error: 'bg-[var(--color-error-bg)] text-[var(--color-error)]',
		info: 'bg-[var(--color-info-bg)] text-[var(--color-info)]'
	};
</script>

<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {variants[variant]}">
	{@render children()}
</span>
