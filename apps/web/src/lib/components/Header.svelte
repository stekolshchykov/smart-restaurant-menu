<script lang="ts">
	import { Utensils } from '@lucide/svelte';
	import { auth } from '$lib/stores/auth.svelte';
	import Button from './Button.svelte';
</script>

<header
	class="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-bg-elevated)]/80 backdrop-blur"
>
	<div
		class="mx-auto flex h-14 max-w-[var(--max-content-width)] items-center justify-between px-4"
	>
		<a
			href="/"
			class="flex items-center gap-2 text-lg"
			style="font-family: var(--font-heading); color: var(--color-heading);"
		>
			<Utensils class="h-5 w-5" style="color: var(--color-primary);" />
			<span>Digital Menu</span>
		</a>
		<nav class="flex items-center gap-3">
			{#if auth.user}
				<Button variant="ghost" href="/app">Кабинет</Button>
				<Button variant="outline" onclick={() => auth.logout()} disabled={auth.loading}>
					Выйти
				</Button>
			{:else}
				<Button variant="ghost" href="/login">Вход</Button>
				<Button href="/register">Регистрация</Button>
			{/if}
		</nav>
	</div>
</header>
