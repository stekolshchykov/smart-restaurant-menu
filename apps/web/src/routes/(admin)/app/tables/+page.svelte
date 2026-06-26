<script lang="ts">
	import { Table } from '@lucide/svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import Button from '$lib/components/Button.svelte';
</script>

<svelte:head>
	<title>Столики — Digital Menu</title>
</svelte:head>

<div class="mx-auto max-w-3xl">
	<h1 class="text-2xl font-bold" style="font-family: var(--font-heading); color: var(--color-heading);">
		Столики
	</h1>
	<div class="mt-8">
		<EmptyState
			icon={Table}
			title="Выберите заведение"
			description="Управление столиками доступно внутри карточки заведения."
		>
			<Button href="/app">К заведениям</Button>
		</EmptyState>
	</div>
</div>
