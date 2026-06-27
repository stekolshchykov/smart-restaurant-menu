<script lang="ts">
	interface Option {
		value: string;
		label: string;
	}

	interface Props {
		id?: string;
		label: string;
		name: string;
		value?: string;
		options: Option[];
		required?: boolean;
		disabled?: boolean;
		error?: string;
		onchange?: (value: string) => void;
	}

	let {
		id,
		label,
		name,
		value = $bindable(''),
		options,
		required = false,
		disabled = false,
		error,
		onchange
	}: Props = $props();

	const inputId = $derived(id ?? name);

	function handleChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		value = target.value;
		onchange?.(value);
	}

	const base =
		'w-full rounded-md border bg-[var(--color-surface)] px-4 py-2.5 text-[var(--color-text-on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)] disabled:cursor-not-allowed disabled:opacity-50 appearance-none';
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
		<select
			id={inputId}
			{name}
			{required}
			{disabled}
			aria-invalid={error ? 'true' : undefined}
			aria-describedby={error ? `${inputId}-error` : undefined}
			class="{base} {error ? borderError : border} pr-10"
			bind:value
			onchange={handleChange}
		>
			{#each options as option}
				<option value={option.value}>{option.label}</option>
			{/each}
		</select>
		<div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[var(--color-text-on-surface-muted)]">
			<svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
				<path
					fill-rule="evenodd"
					d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
					clip-rule="evenodd"
				/>
			</svg>
		</div>
	</div>
	{#if error}
		<span id="{inputId}-error" class="text-sm text-[var(--color-error)]" role="alert">
			{error}
		</span>
	{/if}
</div>
