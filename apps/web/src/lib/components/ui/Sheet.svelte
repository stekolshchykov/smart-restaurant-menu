<script lang="ts">
	import type { Snippet } from 'svelte';
	import { browser } from '$app/environment';
	import { X } from '@lucide/svelte';

	interface Props {
		open: boolean;
		onClose: () => void;
		title: string;
		position?: 'bottom' | 'center' | 'right';
		children: Snippet;
		header?: Snippet<[string]>;
		class?: string;
		closeLabel?: string;
	}

	let {
		open,
		onClose,
		title,
		position = 'bottom',
		children,
		header,
		class: className = '',
		closeLabel = 'Закрыть',
	}: Props = $props();

	let dialog = $state<HTMLDialogElement | null>(null);
	let titleId = $state(`sheet-title-${typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2, 9)}`);
	let previouslyFocused = $state<HTMLElement | null>(null);

	const positionClasses = {
		bottom: 'items-end',
		center: 'items-center',
		right: 'items-end justify-end',
	};

	const panelClasses = {
		bottom: 'mb-0 w-full max-w-2xl rounded-t-[var(--radius-lg)]',
		center: 'w-full max-w-lg rounded-[var(--radius-lg)]',
		right: 'h-full w-full max-w-md rounded-l-[var(--radius-lg)]',
	};

	$effect(() => {
		if (!browser || !dialog) return;

		if (open && !dialog.open) {
			previouslyFocused = document.activeElement as HTMLElement;
			dialog.showModal();
		} else if (!open && dialog.open) {
			dialog.close();
			previouslyFocused?.focus();
		}
	});

	function handleClose() {
		onClose();
		previouslyFocused?.focus();
	}

	function handleCancel(event: Event) {
		event.preventDefault();
		handleClose();
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === dialog) {
			handleClose();
		}
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			handleClose();
		}
	}
</script>

{#if open}
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<dialog
		bind:this={dialog}
		class="fixed inset-0 z-50 m-0 flex max-h-none max-w-none bg-transparent p-0 {positionClasses[position]}"
		class:h-full={position === 'right'}
		class:w-full={position === 'right'}
		aria-modal="true"
		aria-labelledby={titleId}
		oncancel={handleCancel}
		onclick={handleBackdropClick}
		onkeydown={handleKeyDown}
	>
		<div
			class="flex max-h-[90vh] flex-col overflow-hidden bg-[var(--color-surface)] shadow-[var(--shadow-xl)] motion-safe:transition-transform motion-safe:duration-200 {panelClasses[position]} {className}"
		>
			<div class="flex shrink-0 items-center justify-between border-b border-[var(--color-border-on-surface-subtle)] p-4">
				{#if header}
					{@render header(titleId)}
				{:else}
					<h2
						id={titleId}
						class="text-xl font-bold"
						style="font-family: var(--font-heading); color: var(--color-heading-on-surface);"
					>
						{title}
					</h2>
				{/if}
				<button
					type="button"
					class="flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-[var(--color-surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)]"
					aria-label={closeLabel}
					onclick={handleClose}
				>
					<X class="h-5 w-5" style="color: var(--color-text-on-surface);" aria-hidden="true" />
				</button>
			</div>
			<div class="flex-1 overflow-y-auto">
				{@render children()}
			</div>
		</div>
	</dialog>
{/if}
