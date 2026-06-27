<script lang="ts">
	import { onMount } from 'svelte';
	import { auth } from '$lib/stores/auth.svelte';
	import ToastProvider from '$lib/components/layout/ToastProvider.svelte';
	import '../app.css';

	onMount(() => {
		void auth.loadUser();
	});
</script>

<svelte:head>
	<title>Digital Menu SaaS</title>
	<meta name="description" content="Цифровое меню для ресторанов, кафе и баров" />
</svelte:head>

<slot />

<ToastProvider />
