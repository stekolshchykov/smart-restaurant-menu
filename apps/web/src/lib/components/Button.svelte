<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		type?: 'button' | 'submit';
		variant?: 'primary' | 'outline' | 'ghost';
		href?: string;
		class?: string;
		children: Snippet;
		onclick?: (event: MouseEvent) => void;
	}

	let {
		type = 'button',
		variant = 'primary',
		href,
		class: className = '',
		children,
		onclick
	}: Props = $props();

	const base =
		'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)] disabled:cursor-not-allowed disabled:opacity-50';

	const variants = {
		primary:
			'bg-[var(--color-primary)] text-[var(--color-bg)] hover:bg-[var(--color-primary-light)]',
		outline:
			'border border-[var(--color-border-strong)] text-[var(--color-text)] hover:bg-[var(--color-primary-bg)]',
		ghost: 'text-[var(--color-text-secondary)] hover:bg-[var(--color-primary-bg)] hover:text-[var(--color-text)]'
	};
</script>

{#if href}
	<a {href} class="{base} {variants[variant]} {className}">
		{@render children()}
	</a>
{:else}
	<button {type} {onclick} class="{base} {variants[variant]} {className}">
		{@render children()}
	</button>
{/if}
