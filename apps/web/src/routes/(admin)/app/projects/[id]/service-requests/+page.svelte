<script lang="ts">
	import { page } from '$app/stores';
	import { onMount, onDestroy } from 'svelte';
	import { Bell } from '@lucide/svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import ServiceRequestCard from '$lib/components/service-requests/ServiceRequestCard.svelte';
	import Button from '$lib/components/Button.svelte';
	import Sheet from '$lib/components/ui/Sheet.svelte';
	import { serviceRequests } from '$lib/stores/serviceRequests.svelte';
	import { projects } from '$lib/stores/projects.svelte';
	import { success as toastSuccess } from '$lib/stores/toast.svelte';
	import type { ServiceRequestStatus } from '@digital-menu/api-client';

	const projectId = $derived($page.params.id!);

	const statuses: { value: ServiceRequestStatus | 'all'; label: string }[] = [
		{ value: 'all', label: 'Все' },
		{ value: 'pending', label: 'Ожидают' },
		{ value: 'in_progress', label: 'В работе' },
		{ value: 'completed', label: 'Готовы' },
		{ value: 'cancelled', label: 'Отменены' },
	];

	const statusLabels: Record<ServiceRequestStatus, string> = {
		pending: 'Ожидает',
		in_progress: 'В работе',
		completed: 'Готово',
		cancelled: 'Отменена',
	};

	let filter = $state<ServiceRequestStatus | 'all'>('all');
	let updatingRequestId = $state<string | null>(null);
	let cancellingRequestId = $state<string | null>(null);

	const filteredRequests = $derived(
		filter === 'all' ? serviceRequests.requests : serviceRequests.requests.filter((r) => r.status === filter)
	);

	onMount(() => {
		serviceRequests.clearError();
		void projects.selectProject(projectId);
		void serviceRequests.loadRequests(projectId, filter === 'all' ? undefined : filter);
		serviceRequests.startAutoRefresh(projectId, filter === 'all' ? undefined : filter);
	});

	onDestroy(() => {
		serviceRequests.stopAutoRefresh();
	});

	function setFilter(value: ServiceRequestStatus | 'all') {
		filter = value;
		serviceRequests.stopAutoRefresh();
		void serviceRequests.loadRequests(projectId, filter === 'all' ? undefined : filter);
		serviceRequests.startAutoRefresh(projectId, filter === 'all' ? undefined : filter);
	}

	async function handleUpdateStatus(requestId: string, status: ServiceRequestStatus) {
		if (status === 'cancelled') {
			cancellingRequestId = requestId;
			return;
		}

		updatingRequestId = requestId;
		try {
			await serviceRequests.updateRequestStatus(projectId, requestId, status);
			toastSuccess(`Статус запроса обновлён: ${statusLabels[status]}`);
		} catch {
			// ошибка уже отображается через serviceRequests.error
		} finally {
			updatingRequestId = null;
		}
	}

	async function confirmCancel() {
		if (!cancellingRequestId) return;
		const requestId = cancellingRequestId;
		cancellingRequestId = null;
		updatingRequestId = requestId;
		try {
			await serviceRequests.updateRequestStatus(projectId, requestId, 'cancelled');
			toastSuccess('Запрос отменён');
		} catch {
			// ошибка уже отображается через serviceRequests.error
		} finally {
			updatingRequestId = null;
		}
	}

	function closeCancelSheet() {
		cancellingRequestId = null;
	}
</script>

<svelte:head>
	<title>Запросы обслуживания — Digital Menu</title>
</svelte:head>

<section class="mx-auto max-w-5xl">
	<div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<h1 class="text-2xl font-bold" style="font-family: var(--font-heading); color: var(--color-heading);">
			Запросы обслуживания
		</h1>
		<div class="flex flex-wrap gap-2" role="group" aria-label="Фильтр по статусу">
			{#each statuses as s}
				<button
					type="button"
					class="inline-flex min-h-11 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)] disabled:cursor-not-allowed disabled:opacity-50 {filter ===
					s.value
						? 'bg-[var(--color-primary)] text-[var(--color-bg)] hover:bg-[var(--color-primary-light)]'
						: 'border border-[var(--color-border-strong)] text-[var(--color-text)] hover:bg-[var(--color-primary-bg)]'}"
					aria-pressed={filter === s.value}
					onclick={() => setFilter(s.value)}
				>
					{s.label}
				</button>
			{/each}
		</div>
	</div>

	{#if serviceRequests.error}
		<p class="mb-4 rounded-md bg-[var(--color-error-bg)] p-3 text-sm text-[var(--color-error)]" role="alert">
			{serviceRequests.error}
		</p>
	{/if}

	{#if serviceRequests.loading && filteredRequests.length === 0}
		<div class="space-y-4">
			{#each [1, 2, 3] as _}
				<div class="h-32 animate-pulse rounded-[var(--radius-md)] bg-[var(--color-bg-elevated)]"></div>
			{/each}
		</div>
	{:else if filteredRequests.length === 0}
		<EmptyState
			icon={Bell}
			title="Нет запросов"
			description={filter === 'all'
				? 'Запросы обслуживания появятся здесь, как только гости их отправят.'
				: 'В выбранном статусе пока нет запросов.'}
		/>
	{:else}
		<div class="space-y-4">
			{#each filteredRequests as request (request.id)}
				<ServiceRequestCard
					{request}
					loading={updatingRequestId === request.id}
					onUpdateStatus={(status) => handleUpdateStatus(request.id, status)}
				/>
			{/each}
		</div>
	{/if}
</section>

<Sheet open={cancellingRequestId !== null} onClose={closeCancelSheet} title="Подтвердите отмену" position="center">
	<div class="flex flex-col gap-6 p-6">
		<p style="color: var(--color-text);">Отменить запрос? Это действие нельзя отменить.</p>
		<div class="flex flex-wrap justify-end gap-3">
			<Button variant="outline" onclick={closeCancelSheet}>Нет, оставить</Button>
			<Button onclick={confirmCancel} disabled={updatingRequestId !== null}>Да, отменить</Button>
		</div>
	</div>
</Sheet>
