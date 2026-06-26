<script lang="ts">
	import { page } from '$app/state';
	import { ArrowLeft, Table } from '@lucide/svelte';
	import Button from '$lib/components/Button.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';

	const id = $derived(page.params.id);
</script>

<svelte:head>
	<title>Столики — Digital Menu</title>
</svelte:head>

<div class="mx-auto max-w-5xl">
	<Button variant="ghost" href="/app/projects/{id}" class="mb-4 -ml-2 px-2">
		<ArrowLeft class="h-4 w-4" aria-hidden="true" />
		К обзору
	</Button>

	<h1 class="text-2xl font-bold" style="font-family: var(--font-heading); color: var(--color-heading);">
		Столики
	</h1>

	<div class="mt-8">
		<EmptyState
			icon={Table}
			title="Нет столиков"
			description="Здесь будет управление столами, токенами и QR-кодами."
		/>
	</div>
</div>
