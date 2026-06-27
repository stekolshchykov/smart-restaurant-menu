<script lang="ts">
	import { page } from '$app/stores';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import MenuItemCard from '$lib/components/venue/MenuItemCard.svelte';
	import VenueSkeleton from '$lib/components/venue/VenueSkeleton.svelte';
	import Button from '$lib/components/Button.svelte';
	import { venue } from '$lib/stores/venue.svelte';
	import { Clock, MapPin, Phone, Utensils } from '@lucide/svelte';
	import { onMount } from 'svelte';

	const slug = $derived($page.params.slug!);
	const project = $derived(venue.project);
	const loading = $derived(venue.loading);
	const error = $derived(venue.error);

	const signatureDishes = $derived(
		venue.menu?.categories.flatMap((category) =>
			category.items.filter((item) => item.status === 'available').slice(0, 2),
		) ?? [],
	);

	onMount(() => {
		venue.reset();
		void venue.loadProject(slug);
		void venue.loadMenu(slug);
	});
</script>

<svelte:head>
	{#if project}
		<title>{project.name} — Digital Menu</title>
		<meta name="description" content={project.description ?? project.name} />
		<meta property="og:title" content={project.name} />
		<meta property="og:description" content={project.description ?? project.name} />
		<meta property="og:type" content="website" />
		{#if project.theme?.logoUrl}
			<meta property="og:image" content={project.theme.logoUrl} />
		{/if}
	{:else}
		<title>{slug} — Digital Menu</title>
	{/if}
</svelte:head>

<section class="min-h-screen pb-24">
	{#if loading && !project}
		<VenueSkeleton variant="page" />
	{:else if error && !project}
		<div class="p-6">
			<EmptyState
				icon={Utensils}
				title="Не удалось загрузить заведение"
				description={error}
			>
				<Button variant="outline" onclick={() => venue.loadProject(slug)}>
					Попробовать снова
				</Button>
			</EmptyState>
		</div>
	{:else if project}
		<div class="relative">
			<div class="absolute inset-0 bg-gradient-to-b from-[var(--color-bg-elevated)] to-transparent"></div>
			<div class="relative px-6 pt-12 pb-8 text-center">
				<h1
					class="text-4xl font-bold sm:text-5xl"
					style="font-family: var(--font-heading); color: var(--color-heading);"
				>
					{project.name}
				</h1>
				{#if project.description}
					<p class="mx-auto mt-4 max-w-xl text-lg" style="color: var(--color-text-secondary);">
						{project.description}
					</p>
				{/if}
				<div class="mt-6 flex justify-center gap-3">
					<Button href="/venue/{slug}/menu">
						<Utensils class="h-4 w-4" aria-hidden="true" />
						Посмотреть меню
					</Button>
				</div>
			</div>
		</div>

		<div class="mx-auto grid max-w-4xl gap-4 px-6 py-8 sm:grid-cols-3">
			<div class="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-4">
				<div class="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary-bg)]">
					<Clock class="h-5 w-5 text-[var(--color-primary)]" aria-hidden="true" />
				</div>
				<h2 class="font-semibold" style="color: var(--color-heading);">Часы работы</h2>
				<p class="mt-1 text-sm" style="color: var(--color-text-secondary);">
					Ежедневно 10:00 — 23:00
				</p>
			</div>
			<div class="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-4">
				<div class="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary-bg)]">
					<MapPin class="h-5 w-5 text-[var(--color-primary)]" aria-hidden="true" />
				</div>
				<h2 class="font-semibold" style="color: var(--color-heading);">Адрес</h2>
				<p class="mt-1 text-sm" style="color: var(--color-text-secondary);">
					Центральная площадь, 1
				</p>
			</div>
			<div class="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-4">
				<div class="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary-bg)]">
					<Phone class="h-5 w-5 text-[var(--color-primary)]" aria-hidden="true" />
				</div>
				<h2 class="font-semibold" style="color: var(--color-heading);">Контакты</h2>
				<p class="mt-1 text-sm" style="color: var(--color-text-secondary);">
					+1 234 567 89 00
				</p>
			</div>
		</div>

		{#if signatureDishes.length > 0}
			<div class="mx-auto max-w-4xl px-6 py-8">
				<h2
					class="mb-4 text-2xl font-bold"
					style="font-family: var(--font-heading); color: var(--color-heading);"
				>
					Рекомендуем
				</h2>
				<div class="grid gap-4 sm:grid-cols-2">
					{#each signatureDishes as dish}
						<MenuItemCard item={dish} currency={project.currency} />
					{/each}
				</div>
			</div>
		{/if}
	{/if}
</section>
