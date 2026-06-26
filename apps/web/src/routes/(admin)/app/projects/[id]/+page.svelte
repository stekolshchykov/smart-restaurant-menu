<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { ArrowLeft, UtensilsCrossed, Table, Share2, Settings } from '@lucide/svelte';
	import { projects } from '$lib/stores/projects.svelte';
	import Button from '$lib/components/Button.svelte';
	import Badge from '$lib/components/Badge.svelte';

	const id = $derived(page.params.id ?? '');

	onMount(() => {
		if (id) {
			void projects.selectProject(id);
		}
	});

	const tabs = [
		{ href: 'menu', label: 'Меню', icon: UtensilsCrossed },
		{ href: 'tables', label: 'Столики', icon: Table },
		{ href: 'publish', label: 'Публикация', icon: Share2 },
		{ href: 'settings', label: 'Настройки', icon: Settings }
	];
</script>

<svelte:head>
	<title>{projects.currentProject?.name ?? 'Заведение'} — Digital Menu</title>
</svelte:head>

<div class="mx-auto max-w-5xl">
	<Button variant="ghost" href="/app" class="mb-4 -ml-2 px-2">
		<ArrowLeft class="h-4 w-4" aria-hidden="true" />
		К заведениям
	</Button>

	{#if projects.loading && !projects.currentProject}
		<p style="color: var(--color-text-secondary);">Загрузка…</p>
	{:else if projects.currentProject}
		{@const project = projects.currentProject}
		<div class="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6">
			<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 class="text-2xl font-bold" style="font-family: var(--font-heading); color: var(--color-heading);">
						{project.name}
					</h1>
					<p class="mt-1 text-sm" style="color: var(--color-text-muted);">/{project.slug}</p>
				</div>
				<Badge variant={project.status === 'published' ? 'success' : 'default'}>
					{project.status}
				</Badge>
			</div>

			<nav class="mt-6" aria-label="Разделы заведения">
				<ul class="flex flex-wrap gap-2">
					{#each tabs as tab}
						<li>
							<Button variant="outline" href="/app/projects/{id}/{tab.href}" class="gap-2">
								<tab.icon class="h-4 w-4" aria-hidden="true" />
								{tab.label}
							</Button>
						</li>
					{/each}
				</ul>
			</nav>

			<div class="mt-8 rounded-xl border border-[var(--color-border)] p-6" style="color: var(--color-text-secondary);">
				<p>Здесь будет обзор заведения: статистика, быстрые действия и последние заказы.</p>
			</div>
		</div>
	{:else}
		<p style="color: var(--color-text-secondary);">Заведение не найдено.</p>
	{/if}
</div>
