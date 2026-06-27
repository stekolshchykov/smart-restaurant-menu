<script lang="ts">
	import { Eye, EyeOff } from '@lucide/svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props {
		id?: string;
		label: string;
		name: string;
		value?: string;
		placeholder?: string;
		required?: boolean;
		disabled?: boolean;
		autocomplete?: HTMLInputAttributes['autocomplete'];
		error?: string;
		oninput?: (value: string) => void;
	}

	let {
		id,
		label,
		name,
		value = $bindable(''),
		placeholder,
		required = false,
		disabled = false,
		autocomplete,
		error,
		oninput
	}: Props = $props();

	let show = $state(false);
	const inputId = $derived(id ?? name);
	const type = $derived(show ? 'text' : 'password');

	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		value = target.value;
		oninput?.(value);
	}

	function toggle() {
		show = !show;
	}

	const base =
		'w-full rounded-md border bg-[var(--color-surface)] px-4 py-2.5 pr-12 text-[var(--color-text-on-surface)] placeholder:text-[var(--color-text-on-surface-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)] disabled:cursor-not-allowed disabled:opacity-50';
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
	<div class="relative">
		<input
			id={inputId}
			{name}
			{type}
			{placeholder}
			{required}
			{disabled}
			{autocomplete}
			aria-invalid={error ? 'true' : undefined}
			aria-describedby={error ? `${inputId}-error` : undefined}
			class="{base} {error ? borderError : border}"
			{value}
			oninput={handleInput}
		/>
		<button
			type="button"
			aria-label={show ? 'Скрыть пароль' : 'Показать пароль'}
			aria-pressed={show}
			class="absolute inset-y-0 right-0 flex items-center justify-center px-3 text-[var(--color-text-on-surface-muted)] transition-colors hover:text-[var(--color-text-on-surface)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)]"
			onclick={toggle}
			{disabled}
		>
			{#if show}
				<EyeOff class="h-5 w-5" />
			{:else}
				<Eye class="h-5 w-5" />
			{/if}
		</button>
	</div>
	{#if error}
		<span id="{inputId}-error" class="text-sm text-[var(--color-error)]" role="alert">
			{error}
		</span>
	{/if}
</div>
