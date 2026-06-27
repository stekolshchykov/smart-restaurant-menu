<script lang="ts">
	import type { Snippet } from 'svelte';
	import { themeToStyle } from '$lib/theme';
	import { venue } from '$lib/stores/venue.svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	const project = $derived(venue.project ?? venue.table?.project ?? null);
	const themeStyle = $derived(themeToStyle(project?.theme));
</script>

<div class="venue-shell min-h-screen" style={themeStyle}>
	{@render children()}
</div>
