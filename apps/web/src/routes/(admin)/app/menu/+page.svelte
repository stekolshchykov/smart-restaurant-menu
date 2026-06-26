<script lang="ts">
	import { UtensilsCrossed } from '@lucide/svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import Button from '$lib/components/Button.svelte';
</script>

<svelte:head>
	<title>Меню — Digital Menu</title>
</svelte:head>

<div class="mx-auto max-w-3xl">
	<h1 class="text-2xl font-bold" style="font-family: var(--font-heading); color: var(--color-heading);">
		Меню
	</h1>
	<div class="mt-8">
		<EmptyState
			icon={UtensilsCrossed}
			title="Выберите заведение"
			description="Редактор меню доступен внутри карточки заведения."
		>
			<Button href="/app">К заведениям</Button>
		</EmptyState>
	</div>
</div>
