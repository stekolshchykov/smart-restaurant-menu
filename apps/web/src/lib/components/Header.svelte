<script lang="ts">
	import { page } from '$app/state';
	import { Menu, X, Utensils } from '@lucide/svelte';
	import { auth } from '$lib/stores/auth.svelte';
	import Button from './Button.svelte';

	let mobileOpen = $state(false);

	const navItems = [
		{ href: '/#features', label: 'Возможности' },
		{ href: '/#how-it-works', label: 'Как это работает' },
		{ href: '/pricing', label: 'Тарифы' },
		{ href: '/demo', label: 'Демо' },
		{ href: '/about', label: 'О продукте' },
	];

	function isActive(href: string): boolean {
		if (href.startsWith('/#')) return false;
		return page.url.pathname === href;
	}
</script>

<header
	class="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-bg-elevated)]/80 backdrop-blur"
>
	<div
		class="mx-auto flex h-14 max-w-[var(--max-content-width)] items-center justify-between px-4"
	>
		<a
			href="/"
			class="flex items-center gap-2 text-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)]"
			style="font-family: var(--font-heading); color: var(--color-heading);"
		>
			<Utensils class="h-5 w-5" style="color: var(--color-primary);" aria-hidden="true" />
			<span>Digital Menu</span>
		</a>

		<nav class="hidden items-center gap-1 md:flex" aria-label="Основная навигация">
			{#each navItems as item}
				<a
					href={item.href}
					class="rounded-md px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)]"
					class:text-[var(--color-primary-light)]={isActive(item.href)}
					class:text-[var(--color-text-secondary)]={!isActive(item.href)}
					class:hover:text-[var(--color-text)]={!isActive(item.href)}
				>
					{item.label}
				</a>
			{/each}
		</nav>

		<div class="hidden items-center gap-3 md:flex">
			{#if auth.user}
				<Button variant="ghost" href="/app">Кабинет</Button>
				<Button variant="outline" onclick={() => auth.logout()} disabled={auth.loading}>
					Выйти
				</Button>
			{:else}
				<Button variant="ghost" href="/login">Вход</Button>
				<Button href="/register">Регистрация</Button>
			{/if}
		</div>

		<button
			type="button"
			class="flex h-10 w-10 items-center justify-center rounded-md md:hidden"
			style="color: var(--color-text-secondary);"
			aria-label={mobileOpen ? 'Закрыть меню' : 'Открыть меню'}
			aria-expanded={mobileOpen}
			aria-controls="mobile-menu"
			onclick={() => (mobileOpen = !mobileOpen)}
		>
			{#if mobileOpen}
				<X class="h-6 w-6" aria-hidden="true" />
			{:else}
				<Menu class="h-6 w-6" aria-hidden="true" />
			{/if}
		</button>
	</div>

	{#if mobileOpen}
		<div
			id="mobile-menu"
			class="border-b border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 pb-4 md:hidden"
		>
			<nav class="flex flex-col gap-1" aria-label="Мобильная навигация">
				{#each navItems as item}
					<a
						href={item.href}
						class="rounded-md px-3 py-2.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)]"
						class:text-[var(--color-primary-light)]={isActive(item.href)}
						class:text-[var(--color-text-secondary)]={!isActive(item.href)}
						onclick={() => (mobileOpen = false)}
					>
						{item.label}
					</a>
				{/each}
			</nav>
			<div class="mt-3 flex flex-col gap-2 border-t border-[var(--color-border)] pt-3">
				{#if auth.user}
					<Button variant="ghost" href="/app" class="w-full justify-start">Кабинет</Button>
					<Button
						variant="outline"
						onclick={() => {
							mobileOpen = false;
							auth.logout();
						}}
						disabled={auth.loading}
						class="w-full"
					>
						Выйти
					</Button>
				{:else}
					<Button variant="ghost" href="/login" class="w-full justify-start">Вход</Button>
					<Button href="/register" class="w-full">Регистрация</Button>
				{/if}
			</div>
		</div>
	{/if}
</header>
