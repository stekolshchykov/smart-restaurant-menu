<script lang="ts">
	import type { CreateCategoryRequest, UpdateCategoryRequest } from '@digital-menu/api-client';
	import Button from '$lib/components/Button.svelte';
	import TextInput from '$lib/components/forms/TextInput.svelte';

	interface Props {
		category?: { name: string; sortOrder: number } | null;
		loading?: boolean;
		onSubmit: (body: CreateCategoryRequest | UpdateCategoryRequest) => void;
		onCancel?: () => void;
	}

	let {
		category = null,
		loading = false,
		onSubmit,
		onCancel,
	}: Props = $props();

	let name = $state('');
	let sortOrder = $state('0');

	$effect(() => {
		name = category?.name ?? '';
		sortOrder = String(category?.sortOrder ?? 0);
	});

	function handleSubmit(event: Event) {
		event.preventDefault();
		onSubmit({
			name: name.trim(),
			sortOrder: Number(sortOrder) || 0,
		});
	}
</script>

<form onsubmit={handleSubmit} class="space-y-4">
	<TextInput label="Название категории" name="name" bind:value={name} required />
	<TextInput label="Порядок сортировки" name="sortOrder" bind:value={sortOrder} />

	<div class="flex items-center gap-2">
		<Button type="submit" disabled={loading || !name.trim()}>
			{loading ? 'Сохранение…' : category ? 'Сохранить' : 'Создать'}
		</Button>
		{#if onCancel}
			<Button type="button" variant="outline" onclick={onCancel}>Отмена</Button>
		{/if}
	</div>
</form>
