<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { Plus, Store } from '@lucide/svelte';
	import { projects } from '$lib/stores/projects.svelte';
	import Button from '$lib/components/Button.svelte';
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import FormError from '$lib/components/forms/FormError.svelte';

	onMount(() => {
		void projects.loadProjects();
	});

	function openProject(project: import('@digital-menu/api-client').ProjectResponse) {
		void goto(`/app/projects/${project.id}`);
	}

	function openSettings(project: import('@digital-menu/api-client').ProjectResponse) {
		void goto(`/app/projects/${project.id}/settings`);
	}
</script>

<svelte:head>
	<title>Ваши заведения — Digital Menu</title>
</svelte:head>

<div class="mx-auto max-w-5xl">
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold" style="font-family: var(--font-heading); color: var(--color-heading);">
			Ваши заведения
		</h1>
		<Button href="/app/projects/new">
			<Plus class="h-4 w-4" aria-hidden="true" />
			Создать заведение
		</Button>
	</div>

	{#if projects.error}
		<div class="mt-4">
			<FormError message={projects.error} />
		</div>
	{/if}

	{#if projects.loading && projects.projects.length === 0}
		<p class="mt-8" style="color: var(--color-text-secondary);">Загрузка…</p>
	{:else if projects.projects.length === 0}
		<div class="mt-8">
			<EmptyState
				icon={Store}
				title="Пока нет заведений"
				description="Создайте первое заведение, чтобы начать работу с цифровым меню."
			>
				<Button href="/app/projects/new">
					<Plus class="h-4 w-4" aria-hidden="true" />
					Создать заведение
				</Button>
			</EmptyState>
		</div>
	{:else}
		<div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each projects.projects as project (project.id)}
				<ProjectCard {project} onOpen={openProject} onSettings={openSettings} />
			{/each}
		</div>
	{/if}
</div>
