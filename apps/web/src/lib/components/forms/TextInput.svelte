<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props {
		id?: string;
		label: string;
		type?: 'text' | 'email' | 'tel' | 'url';
		name: string;
		value?: string;
		placeholder?: string;
		required?: boolean;
		disabled?: boolean;
		autofocus?: boolean;
		autocomplete?: HTMLInputAttributes['autocomplete'];
		error?: string;
		oninput?: (value: string) => void;
	}

	let {
		id,
		label,
		type = 'text',
		name,
		value = $bindable(''),
		placeholder,
		required = false,
		disabled = false,
		autofocus = false,
		autocomplete,
		error,
		oninput
	}: Props = $props();

	const inputId = $derived(id ?? name);

	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		value = target.value;
		oninput?.(value);
	}

	const base =
		'w-full rounded-md border bg-[var(--color-surface)] px-4 py-2.5 text-[var(--color-text-on-surface)] placeholder:text-[var(--color-text-on-surface-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)] disabled:cursor-not-allowed disabled:opacity-50';
	const border =
		'border-[var(--color-border-on-surface)] focus:border-[var(--color-primary)]';
	const borderError = 'border-[var(--color-error)] focus:border-[var(--color-error)]';
</script>

<div class="flex flex-col gap-1.5">
	<label for={inputId} class="text-sm font-medium text-[var(--color-text)]">
		{label}
		{#if required}
			<span aria-hidden="true" class="text-[var(--color-error)]">*</span>
		{/if}
	</label>
	<!-- svelte-ignore a11y_autofocus -->
	<input
		id={inputId}
		{name}
		{type}
		{placeholder}
		{required}
		{disabled}
		{autofocus}
		{autocomplete}
		aria-invalid={error ? 'true' : undefined}
		aria-describedby={error ? `${inputId}-error` : undefined}
		class="{base} {error ? borderError : border}"
		{value}
		oninput={handleInput}
	/>
	{#if error}
		<span id="{inputId}-error" class="text-sm text-[var(--color-error)]" role="alert">
			{error}
		</span>
	{/if}
</div>
