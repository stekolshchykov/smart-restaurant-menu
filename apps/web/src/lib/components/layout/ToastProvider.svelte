<script lang="ts">
	import { toastStore, type ToastType } from '$lib/stores/toast.svelte';

	const typeStyles: Record<ToastType, string> = {
		success:
			'bg-[var(--color-success-bg)] text-[var(--color-success)] border-[var(--color-success)]/20',
		error: 'bg-[var(--color-error-bg)] text-[var(--color-error)] border-[var(--color-error)]/20',
		info: 'bg-[var(--color-info-bg)] text-[var(--color-info)] border-[var(--color-info)]/20'
	};

	const roleByType: Record<ToastType, 'status' | 'alert'> = {
		success: 'status',
		error: 'alert',
		info: 'status'
	};
</script>

<div
	class="fixed z-[100] flex flex-col gap-2 p-4 pointer-events-none md:top-4 md:right-4 md:items-end md:justify-start bottom-[max(1rem,var(--safe-area-bottom))] left-1/2 -translate-x-1/2 items-center justify-end w-full max-w-sm md:max-w-md md:translate-x-0 md:left-auto"
	aria-live="polite"
	aria-atomic="true"
>
	{#each toastStore.toasts as toast (toast.id)}
		<div
			role={roleByType[toast.type]}
			class="pointer-events-auto w-full rounded-[var(--radius-md)] border px-4 py-3 shadow-[var(--shadow-md)] motion-safe:transition-opacity motion-safe:duration-200 {typeStyles[
				toast.type
			]}"
		>
			<div class="flex items-start justify-between gap-3">
				<p class="text-sm font-medium">{toast.message}</p>
				<button
					type="button"
					class="shrink-0 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)]"
					aria-label="Закрыть уведомление"
					onclick={() => toast.remove()}
				>
					<span aria-hidden="true">×</span>
				</button>
			</div>
		</div>
	{/each}
</div>
