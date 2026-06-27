<script lang="ts">
	import { Banknote, Bell, GlassWater, ScrollText, Users } from '@lucide/svelte';
	import type { ServiceRequestListItemResponse, ServiceRequestStatus } from '@digital-menu/api-client';
	import Button from '$lib/components/Button.svelte';
	import ServiceRequestStatusBadge from './ServiceRequestStatusBadge.svelte';

	interface Props {
		request: ServiceRequestListItemResponse;
		loading?: boolean;
		onUpdateStatus: (status: ServiceRequestStatus) => void;
	}

	let { request, loading = false, onUpdateStatus }: Props = $props();

	const typeConfig: Record<
		ServiceRequestListItemResponse['type'],
		{ label: string; icon: typeof Users }
	> = {
		waiter: { label: 'Официант', icon: Users },
		water: { label: 'Вода', icon: GlassWater },
		napkins: { label: 'Салфетки', icon: ScrollText },
		bill: { label: 'Счёт', icon: Banknote },
	};

	const actions: { status: ServiceRequestStatus; label: string; variant: 'primary' | 'outline' }[] =
		$derived.by(() => {
			switch (request.status) {
				case 'pending':
					return [
						{ status: 'in_progress', label: 'В работу', variant: 'primary' },
						{ status: 'cancelled', label: 'Отменить', variant: 'outline' },
					];
				case 'in_progress':
					return [
						{ status: 'completed', label: 'Готово', variant: 'primary' },
						{ status: 'cancelled', label: 'Отменить', variant: 'outline' },
					];
				default:
					return [];
			}
		});

	const TypeIcon = $derived(typeConfig[request.type].icon);
	const typeLabel = $derived(typeConfig[request.type].label);

	function elapsedText(iso: string): string {
		const date = new Date(iso);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffSec = Math.floor(diffMs / 1000);
		const diffMin = Math.floor(diffSec / 60);
		const diffHour = Math.floor(diffMin / 60);

		if (diffMin < 1) return 'только что';
		if (diffHour < 1) return `${diffMin} мин`;
		if (diffHour < 24) return `${diffHour} ч`;
		return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
	}
</script>

<article
	class="flex flex-col gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-4 transition-shadow hover:shadow-[var(--shadow-md)]"
	aria-labelledby="service-request-{request.id}-label"
>
	<div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
		<div class="flex-1">
			<div class="flex flex-wrap items-center gap-2">
				<h3
					id="service-request-{request.id}-label"
					class="text-base font-semibold"
					style="color: var(--color-heading);"
				>
					Стол {request.tableLabel}
				</h3>
				<ServiceRequestStatusBadge status={request.status} />
			</div>
			<p class="mt-1 flex items-center gap-1.5 text-xs" style="color: var(--color-text-muted);">
				<Bell class="h-3.5 w-3.5" aria-hidden="true" />
				<span>#{request.id.slice(-6).toUpperCase()} · {elapsedText(request.createdAt)}</span>
			</p>
		</div>
		<div class="flex items-center gap-2 text-right">
			<TypeIcon class="h-5 w-5 text-[var(--color-primary)]" aria-hidden="true" />
			<span class="text-sm font-medium" style="color: var(--color-text-secondary);">
				{typeLabel}
			</span>
		</div>
	</div>

	{#if actions.length > 0}
		<div class="flex flex-wrap gap-2 pt-2">
			{#each actions as action (action.status)}
				<Button variant={action.variant} disabled={loading} onclick={() => onUpdateStatus(action.status)}>
					{action.label}
				</Button>
			{/each}
		</div>
	{/if}
</article>
