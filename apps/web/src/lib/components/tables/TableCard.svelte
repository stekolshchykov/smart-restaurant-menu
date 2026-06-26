<script lang="ts">
	import { Trash2, Download } from '@lucide/svelte';
	import type { Table } from '@digital-menu/api-client';
	import { api } from '$lib/api/client';
	import Button from '$lib/components/Button.svelte';
	import QrPreview from './QrPreview.svelte';

	interface Props {
		table: Table;
		onToggle?: (table: Table, active: boolean) => void;
		onDelete?: (table: Table) => void;
	}

	let { table, onToggle, onDelete }: Props = $props();

	const pdfUrl = $derived(api.getTableQrPdfUrl(table.id));

	function handleToggle(event: Event) {
		const target = event.target as HTMLInputElement;
		onToggle?.(table, target.checked);
	}
</script>

<article
	class="flex flex-col gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-4 sm:flex-row sm:items-center sm:justify-between"
	aria-label="Столик {table.label}"
>
	<div class="flex items-center gap-4">
		<QrPreview tableId={table.id} />
		<div>
			<h3 class="font-semibold" style="color: var(--color-heading);">
				{table.label}
			</h3>
			<p class="mt-0.5 text-sm font-mono" style="color: var(--color-text-muted);">
				{table.token}
			</p>
			<label class="mt-2 inline-flex cursor-pointer items-center gap-2 text-sm" style="color: var(--color-text-secondary);">
				<input
					type="checkbox"
					checked={table.active}
					onchange={handleToggle}
					class="h-4 w-4 rounded border-[var(--color-border-strong)] bg-[var(--color-bg)] text-[var(--color-primary)] focus:ring-[var(--color-focus-ring)]"
				/>
				{table.active ? 'Активен' : 'Неактивен'}
			</label>
		</div>
	</div>

	<div class="flex items-center gap-2 sm:flex-col sm:items-end">
		<Button variant="outline" href={pdfUrl} class="px-3 py-1.5" download>
			<Download class="h-4 w-4" aria-hidden="true" />
			<span class="sr-only sm:not-sr-only">PDF</span>
		</Button>
		<Button variant="ghost" class="px-3 py-1.5 text-[var(--color-error)] hover:bg-[var(--color-error-bg)]" onclick={() => onDelete?.(table)}>
			<Trash2 class="h-4 w-4" aria-hidden="true" />
			<span class="sr-only sm:not-sr-only">Удалить</span>
		</Button>
	</div>
</article>
