<script lang="ts">
	import type { ServiceRequestType } from '@digital-menu/api-client';
	import Sheet from '$lib/components/ui/Sheet.svelte';
	import { Banknote, Bell, CheckCircle, GlassWater, ScrollText, Users } from '@lucide/svelte';

	interface Props {
		open: boolean;
		onClose: () => void;
		onRequest: (type: ServiceRequestType) => Promise<void> | void;
	}

	let { open, onClose, onRequest }: Props = $props();

	const REQUESTS: { type: ServiceRequestType; label: string; icon: typeof Users }[] = [
		{ type: 'waiter', label: 'Официант', icon: Users },
		{ type: 'water', label: 'Вода', icon: GlassWater },
		{ type: 'napkins', label: 'Салфетки', icon: ScrollText },
		{ type: 'bill', label: 'Счёт', icon: Banknote },
	];

	let lastSent = $state<Record<ServiceRequestType, number>>({
		waiter: 0,
		water: 0,
		napkins: 0,
		bill: 0,
	});

	let justSent = $state<ServiceRequestType | null>(null);
	let sending = $state(false);
	let statusMessage = $state<string | null>(null);

	const typeLabels: Record<ServiceRequestType, string> = {
		waiter: 'Официант вызван',
		water: 'Запрос воды отправлен',
		napkins: 'Салфетки заказаны',
		bill: 'Счёт запрошен',
	};

	const COOLDOWN_MS = 30_000;

	const canSend = $derived((type: ServiceRequestType) => {
		return Date.now() - lastSent[type] > COOLDOWN_MS;
	});

	async function handleRequest(type: ServiceRequestType) {
		if (!canSend(type) || sending) return;
		sending = true;
		try {
			await onRequest(type);
			lastSent = { ...lastSent, [type]: Date.now() };
			justSent = type;
			statusMessage = typeLabels[type];
			setTimeout(() => {
				justSent = null;
			}, 2000);
		} finally {
			sending = false;
		}
	}
</script>

<Sheet open={open} onClose={onClose} title="Вызвать обслуживание">
	<div class="p-5">
		<div class="min-h-[2.5rem]" aria-live="polite" aria-atomic="true">
			{#if statusMessage}
				<p class="mb-3 rounded-[var(--radius-md)] bg-[var(--color-success-bg)] p-2 text-center text-sm font-medium text-[var(--color-success)]">
					{statusMessage}
				</p>
			{/if}
		</div>
		<div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
			{#each REQUESTS as request}
				{@const Icon = request.icon}
				<button
					type="button"
					class="flex min-h-[5.5rem] flex-col items-center justify-center gap-2 rounded-[var(--radius-md)] border p-4 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)] disabled:cursor-not-allowed disabled:opacity-50"
					class:border-[var(--color-primary)]={justSent === request.type}
					class:bg-[var(--color-primary-bg)]={justSent === request.type}
					class:border-[var(--color-border-on-surface-subtle)]={justSent !== request.type}
					class:bg-[var(--color-surface-elevated)]={justSent !== request.type}
					disabled={!canSend(request.type) || sending}
					onclick={() => handleRequest(request.type)}
				>
					{#if justSent === request.type}
						<CheckCircle class="h-6 w-6 text-[var(--color-success)]" aria-hidden="true" />
					{:else}
						<Icon class="h-6 w-6 text-[var(--color-primary)]" aria-hidden="true" />
					{/if}
					<span class="text-sm font-medium" style="color: var(--color-text-on-surface);">
						{request.label}
					</span>
				</button>
			{/each}
		</div>

		<div class="mt-4 rounded-[var(--radius-md)] bg-[var(--color-accent-bg)] p-3">
			<div class="flex items-start gap-3">
				<Bell class="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-accent)]" aria-hidden="true" />
				<p class="text-sm" style="color: var(--color-text-on-surface-secondary);">
					Каждый запрос можно отправлять не чаще одного раза в 30 секунд, чтобы избежать дублирования.
				</p>
			</div>
		</div>
	</div>
</Sheet>
