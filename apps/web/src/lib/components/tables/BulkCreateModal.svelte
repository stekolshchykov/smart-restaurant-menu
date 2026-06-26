<script lang="ts">
	import { X } from '@lucide/svelte';
	import Button from '$lib/components/Button.svelte';
	import TextInput from '$lib/components/forms/TextInput.svelte';

	interface Props {
		open: boolean;
		loading?: boolean;
		error?: string | null;
		onSubmit?: (data: { prefix: string; start: number; end: number }) => void;
		onClose?: () => void;
	}

	let { open, loading = false, error = null, onSubmit, onClose }: Props = $props();

	let prefix = $state('Стол ');
	let start = $state(1);
	let end = $state(5);

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		onSubmit?.({ prefix, start, end });
	}

	function handleClose() {
		onClose?.();
	}

	function reset() {
		prefix = 'Стол ';
		start = 1;
		end = 5;
	}

	$effect(() => {
		if (open) {
			reset();
		}
	});

	const inputBase =
		'w-full rounded-md border border-[var(--color-border-on-surface)] bg-[var(--color-surface)] px-4 py-2.5 text-[var(--color-text-on-surface)] placeholder:text-[var(--color-text-on-surface-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]';
</script>

{#if open}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="bulk-create-title">
		<div class="absolute inset-0 bg-[var(--color-bg-overlay)]" onclick={handleClose} aria-hidden="true"></div>
		<div class="relative w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6 shadow-lg">
			<div class="flex items-center justify-between">
				<h2 id="bulk-create-title" class="text-lg font-semibold" style="color: var(--color-heading);">
					Массовое создание столиков
				</h2>
				<Button variant="ghost" class="px-2 py-1" onclick={handleClose}>
					<X class="h-4 w-4" aria-hidden="true" />
					<span class="sr-only">Закрыть</span>
				</Button>
			</div>

			<form class="mt-4 flex flex-col gap-4" onsubmit={handleSubmit}>
				<TextInput
					name="prefix"
					label="Префикс"
					bind:value={prefix}
					placeholder="Стол"
					required
				/>
				<div class="grid grid-cols-2 gap-4">
					<div class="flex flex-col gap-1.5">
						<label for="bulk-start" class="text-sm font-medium text-[var(--color-text)]">С</label>
						<input
							id="bulk-start"
							name="start"
							type="number"
							min="1"
							bind:value={start}
							required
							class={inputBase}
						/>
					</div>
					<div class="flex flex-col gap-1.5">
						<label for="bulk-end" class="text-sm font-medium text-[var(--color-text)]">По</label>
						<input
							id="bulk-end"
							name="end"
							type="number"
							min="1"
							bind:value={end}
							required
							class={inputBase}
						/>
					</div>
				</div>

				{#if error}
					<p class="text-sm text-[var(--color-error)]" role="alert">{error}</p>
				{/if}

				<div class="mt-2 flex justify-end gap-2">
					<Button variant="ghost" type="button" onclick={handleClose} disabled={loading}>
						Отмена
					</Button>
					<Button type="submit" disabled={loading}>
						{loading ? 'Создание…' : 'Создать'}
					</Button>
				</div>
			</form>
		</div>
	</div>
{/if}
