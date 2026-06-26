<script lang="ts">
	import { page } from '$app/state';
	import { ArrowLeft, UtensilsCrossed } from '@lucide/svelte';
	import Button from '$lib/components/Button.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';

	const id = $derived(page.params.id);
</script>

<svelte:head>
	<title>Меню — Digital Menu</title>
</svelte:head>

<div class="mx-auto max-w-5xl">
	<Button variant="ghost" href="/app/projects/{id}" class="mb-4 -ml-2 px-2">
		<ArrowLeft class="h-4 w-4" aria-hidden="true" />
		К обзору
	</Button>

	<h1 class="text-2xl font-bold" style="font-family: var(--font-heading); color: var(--color-heading);">
		Меню
	</h1>

	<div class="mt-8">
		<EmptyState
			icon={UtensilsCrossed}
			title="Меню пока пусто"
			description="Здесь будет редактор категорий, блюд, модификаторов и аллергенов."
		/>
	</div>
</div>
