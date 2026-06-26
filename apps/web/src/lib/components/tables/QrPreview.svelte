<script lang="ts">
	import { api } from '$lib/api/client';

	interface Props {
		tableId: string;
		alt?: string;
		class?: string;
	}

	let { tableId, alt = 'QR-код столика', class: className = '' }: Props = $props();

	const src = $derived(api.getTableQrUrl(tableId));
</script>

<img
	{src}
	{alt}
	loading="lazy"
	class="h-24 w-24 rounded-lg border border-[var(--color-border-on-surface)] object-contain {className}"
/>
