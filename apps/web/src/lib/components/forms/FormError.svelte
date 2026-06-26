<script lang="ts">
	interface Props {
		message?: string | null;
	}

	let { message }: Props = $props();
</script>

{#if message}
	<div
		class="rounded-md bg-[var(--color-error-bg)] px-4 py-3 text-sm text-[var(--color-error)]"
		role="alert"
		aria-live="assertive"
	>
		{message}
	</div>
{/if}
