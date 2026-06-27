<script lang="ts">
	import type { ServiceRequestStatus } from '@digital-menu/api-client';
	import Badge from '$lib/components/Badge.svelte';

	interface Props {
		status: ServiceRequestStatus;
	}

	let { status }: Props = $props();

	const config: Record<
		ServiceRequestStatus,
		{ label: string; variant: 'default' | 'success' | 'warning' | 'error' | 'info' }
	> = {
		pending: { label: 'Ожидает', variant: 'warning' },
		in_progress: { label: 'В работе', variant: 'info' },
		completed: { label: 'Готово', variant: 'success' },
		cancelled: { label: 'Отменена', variant: 'error' },
	};
</script>

<Badge variant={config[status].variant}>
	{config[status].label}
</Badge>
