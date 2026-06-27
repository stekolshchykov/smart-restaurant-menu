<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		type?: 'button' | 'submit';
		variant?: 'primary' | 'outline' | 'ghost';
		href?: string;
		download?: boolean | string;
		class?: string;
		disabled?: boolean;
		ariaLabel?: string;
		children: Snippet;
		onclick?: (event: MouseEvent) => void;
	}

	let {
		type = 'button',
		variant = 'primary',
		href,
		download,
		class: className = '',
		disabled = false,
		ariaLabel,
		children,
		onclick
	}: Props = $props();

	const base =
		'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)] disabled:cursor-not-allowed disabled:opacity-50 min-h-11 min-w-11';

	const variants = {
		primary:
			'bg-[var(--color-primary)] text-[var(--color-bg)] hover:bg-[var(--color-primary-light)]',
		outline:
			'border border-[var(--color-border-strong)] text-[var(--color-text)] hover:bg-[var(--color-primary-bg)]',
		ghost: 'text-[var(--color-text-secondary)] hover:bg-[var(--color-primary-bg)] hover:text-[var(--color-text)]'
	};
</script>

{#if href && !disabled}
	<a {href} {download} class="{base} {variants[variant]} {className}" aria-label={ariaLabel}>
		{@render children()}
	</a>
{:else if href && disabled}
	<span class="{base} {variants[variant]} {className}" aria-disabled="true" aria-label={ariaLabel}>
		{@render children()}
	</span>
{:else}
	<button {type} {onclick} {disabled} class="{base} {variants[variant]} {className}" aria-label={ariaLabel}>
		{@render children()}
	</button>
{/if}
