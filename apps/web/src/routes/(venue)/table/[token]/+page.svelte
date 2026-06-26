<script lang="ts">
	import { page } from '$app/stores';
</script>

<svelte:head>
	<title>Стол — Digital Menu</title>
</svelte:head>

<section class="p-6">
	<h1
		class="text-2xl font-bold"
		style="font-family: var(--font-heading); color: var(--color-heading);"
	>
		Меню стола
	</h1>
	<p class="mt-2" style="color: var(--color-text-secondary);">
		Токен: {$page.params.token}
	</p>
</section>
