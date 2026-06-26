<script lang="ts">
	import type { Snippet } from 'svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { auth } from '$lib/stores/auth.svelte';
	import Button from '$lib/components/Button.svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	onMount(() => {
		// If we already know there is no authenticated user, redirect immediately.
		if (!auth.user && !auth.loading) {
			goto('/login');
		}
	});

	$effect(() => {
		if (!auth.user && !auth.loading) {
			goto('/login');
		}
	});
</script>

<div class="flex min-h-screen flex-col bg-[var(--color-bg)] text-[var(--color-text)]">
	<header
		class="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-6 py-4"
	>
		<span class="text-lg font-semibold" style="font-family: var(--font-heading); color: var(--color-heading);">
			Admin
		</span>
		{#if auth.user}
			<div class="flex items-center gap-4">
				<span class="text-sm" style="color: var(--color-text-secondary);">
					{auth.user.email}
				</span>
				<Button variant="outline" onclick={() => auth.logout()} disabled={auth.loading}>
					Выйти
				</Button>
			</div>
		{/if}
	</header>
	<main class="flex-1 p-6">
		{@render children()}
	</main>
</div>
