<script lang="ts">
	import { Upload, X } from '@lucide/svelte';
	import { api } from '$lib/api/client';
	import Button from '$lib/components/Button.svelte';

	interface Props {
		url?: string;
		onUpload?: (url: string) => void;
		onError?: (message: string) => void;
		label?: string;
	}

	let { url = '', onUpload, onError, label = 'Изображение' }: Props = $props();

	let uploading = $state(false);
	let inputRef = $state<HTMLInputElement | null>(null);

	async function handleFileChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		uploading = true;
		try {
			const response = await api.uploadImage(file);
			onUpload?.(response.url);
			if (inputRef) {
				inputRef.value = '';
			}
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Не удалось загрузить изображение';
			onError?.(message);
		} finally {
			uploading = false;
		}
	}

	function clearImage() {
		onUpload?.('');
	}
</script>

<div class="flex flex-col gap-2">
	<span class="text-sm font-medium text-[var(--color-text)]">{label}</span>

	{#if url}
		<div class="relative overflow-hidden rounded-lg border border-[var(--color-border)]">
			<img src={url} alt="Предпросмотр" class="h-40 w-full object-cover" />
			<button
				type="button"
				class="absolute right-2 top-2 rounded-full bg-[var(--color-bg-elevated)] p-1.5 text-[var(--color-text-secondary)] shadow-sm hover:text-[var(--color-error)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]"
				aria-label="Удалить изображение"
				onclick={clearImage}
			>
				<X class="h-4 w-4" aria-hidden="true" />
			</button>
		</div>
	{:else}
		<label
			class="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface)] p-6 text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-primary-bg)]"
		>
			<Upload class="h-6 w-6" aria-hidden="true" />
			<span class="text-sm">{uploading ? 'Загрузка…' : 'Нажмите, чтобы загрузить'}</span>
			<input
				bind:this={inputRef}
				type="file"
				accept="image/*"
				class="sr-only"
				disabled={uploading}
				onchange={handleFileChange}
			/>
		</label>
	{/if}
</div>
