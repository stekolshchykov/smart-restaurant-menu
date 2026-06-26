<script lang="ts">
	import { Share2 } from '@lucide/svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import Button from '$lib/components/Button.svelte';
</script>

<svelte:head>
	<title>Публикация — Digital Menu</title>
</svelte:head>

<div class="mx-auto max-w-3xl">
	<h1 class="text-2xl font-bold" style="font-family: var(--font-heading); color: var(--color-heading);">
		Публикация
	</h1>
	<div class="mt-8">
		<EmptyState
			icon={Share2}
			title="Выберите заведение"
			description="Настройки публикации доступны внутри карточки заведения."
		>
			<Button href="/app">К заведениям</Button>
		</EmptyState>
	</div>
</div>
