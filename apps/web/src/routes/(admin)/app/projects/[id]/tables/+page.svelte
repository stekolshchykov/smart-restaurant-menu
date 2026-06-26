<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { ArrowLeft, Plus, Table, Users } from '@lucide/svelte';
	import { tables } from '$lib/stores/tables.svelte';
	import Button from '$lib/components/Button.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import TableCard from '$lib/components/tables/TableCard.svelte';
	import BulkCreateModal from '$lib/components/tables/BulkCreateModal.svelte';

	const id = $derived(page.params.id ?? '');
	const hasTables = $derived(tables.tables.length > 0);

	let showBulkModal = $state(false);

	onMount(() => {
		if (id) {
			void tables.loadTables(id);
		}
	});

	async function handleAddTable() {
		if (!id) return;
		const nextNumber = tables.tables.length + 1;
		await tables.createTable(id, { label: `Стол ${nextNumber}`, active: true });
	}

	async function handleBulkCreate(data: { prefix: string; start: number; end: number }) {
		if (!id) return;
		await tables.bulkCreate(id, data);
		showBulkModal = false;
	}

	async function handleToggle(table: import('@digital-menu/api-client').Table, active: boolean) {
		await tables.updateTable(table.id, { active });
	}

	async function handleDelete(table: import('@digital-menu/api-client').Table) {
		if (confirm(`Удалить столик «${table.label}»?`)) {
			await tables.deleteTable(table.id);
		}
	}
</script>

<svelte:head>
	<title>Столики — Digital Menu</title>
</svelte:head>

<div class="mx-auto max-w-5xl">
	<Button variant="ghost" href="/app/projects/{id}" class="mb-4 -ml-2 px-2">
		<ArrowLeft class="h-4 w-4" aria-hidden="true" />
		К обзору
	</Button>

	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<h1 class="text-2xl font-bold" style="font-family: var(--font-heading); color: var(--color-heading);">
			Столики
		</h1>
		<div class="flex flex-wrap items-center gap-2">
			<Button variant="outline" onclick={handleAddTable} disabled={tables.loading}>
				<Plus class="h-4 w-4" aria-hidden="true" />
				Добавить столик
			</Button>
			<Button variant="outline" onclick={() => (showBulkModal = true)} disabled={tables.loading}>
				<Users class="h-4 w-4" aria-hidden="true" />
				Создать несколько
			</Button>
		</div>
	</div>

	{#if tables.error}
		<div class="mt-4 rounded-lg border border-[var(--color-error)] bg-[var(--color-error-bg)] p-3 text-sm text-[var(--color-error)]" role="alert">
			{tables.error}
		</div>
	{/if}

	<div class="mt-8">
		{#if tables.loading && !hasTables}
			<p style="color: var(--color-text-secondary);">Загрузка…</p>
		{:else if hasTables}
			<ul class="grid gap-4 sm:grid-cols-2" role="list" aria-label="Список столиков">
				{#each tables.tables as table (table.id)}
					<li>
						<TableCard
							{table}
							onToggle={handleToggle}
							onDelete={handleDelete}
						/>
					</li>
				{/each}
			</ul>
		{:else}
			<EmptyState
				icon={Table}
				title="Нет столиков"
				description="Добавьте первый столик или создайте несколько сразу — для каждого будет сгенерирован QR-код."
			>
				<div class="flex flex-wrap justify-center gap-2">
					<Button onclick={handleAddTable}>
						<Plus class="h-4 w-4" aria-hidden="true" />
						Добавить столик
					</Button>
					<Button variant="outline" onclick={() => (showBulkModal = true)}>
						Создать несколько
					</Button>
				</div>
			</EmptyState>
		{/if}
	</div>
</div>

<BulkCreateModal
	open={showBulkModal}
	loading={tables.loading}
	error={tables.error}
	onSubmit={handleBulkCreate}
	onClose={() => {
		showBulkModal = false;
		tables.clearError();
	}}
/>
