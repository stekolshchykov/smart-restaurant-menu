<script lang="ts">
	import { WifiOff } from '@lucide/svelte';
	import Button from '$lib/components/Button.svelte';
</script>

<svelte:head>
	<title>Нет подключения — Digital Menu</title>
</svelte:head>

<section class="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
	<div class="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-primary-bg)]">
		<WifiOff class="h-10 w-10 text-[var(--color-primary)]" aria-hidden="true" />
	</div>
	<h1 class="text-2xl font-bold" style="font-family: var(--font-heading); color: var(--color-heading);">
		Нет подключения к интернету
	</h1>
	<p class="mt-3 max-w-md" style="color: var(--color-text-secondary);">
		Похоже, связь прервалась. Проверьте сеть и попробуйте снова — меню загрузится, как только соединение восстановится.
	</p>
	<div class="mt-8">
		<Button onclick={() => window.location.reload()}>Попробовать снова</Button>
	</div>
</section>
