<script lang="ts">
	import { page } from '$app/stores';
</script>

<svelte:head>
	<title>{$page.params.slug} — Digital Menu</title>
</svelte:head>

<section class="p-6">
	<h1
		class="text-2xl font-bold"
		style="font-family: var(--font-heading); color: var(--color-heading);"
	>
		{$page.params.slug}
	</h1>
	<p class="mt-2" style="color: var(--color-text-secondary);">
		Промо-страница заведения.
	</p>
</section>
