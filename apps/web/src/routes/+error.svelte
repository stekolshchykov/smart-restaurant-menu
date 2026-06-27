<script lang="ts">
	import { page } from '$app/stores';
	import Button from '$lib/components/Button.svelte';
	import { Home, AlertCircle } from '@lucide/svelte';

	const status = $derived($page.status);
	const message = $derived($page.error?.message ?? 'Что-то пошло не так');
</script>

<svelte:head>
	<title>{status} — Digital Menu</title>
</svelte:head>

<section class="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
	<div class="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-primary-bg)]">
		{#if status === 404}
			<span class="text-3xl font-bold text-[var(--color-primary)]">404</span>
		{:else}
			<AlertCircle class="h-10 w-10 text-[var(--color-primary)]" aria-hidden="true" />
		{/if}
	</div>
	<h1 class="text-3xl font-bold" style="font-family: var(--font-heading); color: var(--color-heading);">
		{status === 404 ? 'Страница не найдена' : 'Ошибка'}
	</h1>
	<p class="mt-3 max-w-md" style="color: var(--color-text-secondary);">
		{status === 404 ? 'Запрошенная страница не существует или была перемещена.' : message}
	</p>
	<div class="mt-8 flex gap-3">
		<Button href="/" variant="outline">
			<Home class="h-4 w-4" aria-hidden="true" />
			На главную
		</Button>
	</div>
</section>
