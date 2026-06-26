<script lang="ts">
	import type { Snippet } from 'svelte';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { auth } from '$lib/stores/auth.svelte';
	import Button from '$lib/components/Button.svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	onMount(() => {
		if (!auth.user && !auth.loading) {
			goto('/login');
		}
	});

	$effect(() => {
		if (!auth.user && !auth.loading) {
			goto('/login');
		}
	});

	const navItems = [
		{ href: '/app', label: 'Заведения' },
		{ href: '/app/menu', label: 'Меню' },
		{ href: '/app/tables', label: 'Столики' },
		{ href: '/app/publish', label: 'Публикация' }
	];

	function isActive(href: string): boolean {
		if (href === '/app') {
			return page.url.pathname === '/app' || page.url.pathname.startsWith('/app/projects');
		}
		return page.url.pathname.startsWith(href);
	}
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
	<div class="flex flex-1">
		<aside
			class="hidden w-56 border-r border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-4 md:block"
			aria-label="Административное меню"
		>
			<nav>
				<ul class="flex flex-col gap-1">
					{#each navItems as item}
						<li>
							<a
								href={item.href}
								class="block rounded-md px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]"
								class:bg-[var(--color-primary-bg)]={isActive(item.href)}
								class:text-[var(--color-primary-light)]={isActive(item.href)}
								class:text-[var(--color-text-secondary)]={!isActive(item.href)}
								class:hover:bg-[var(--color-primary-bg)]={!isActive(item.href)}
								class:hover:text-[var(--color-text)]={!isActive(item.href)}
							>
								{item.label}
							</a>
						</li>
					{/each}
				</ul>
			</nav>
		</aside>
		<main class="flex-1 p-6">
			{@render children()}
		</main>
	</div>
</div>
