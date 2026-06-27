<script lang="ts">
	import { page } from '$app/state';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { ArrowLeft, Share2, Globe, Copy, CheckCircle2 } from '@lucide/svelte';
	import { projects } from '$lib/stores/projects.svelte';
	import { publish } from '$lib/stores/publish.svelte';
	import Button from '$lib/components/Button.svelte';
	import Badge from '$lib/components/Badge.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import ReadinessChecklist from '$lib/components/publish/ReadinessChecklist.svelte';

	const id = $derived(page.params.id ?? '');
	const project = $derived(projects.currentProject);
	const origin = $derived(browser && typeof window !== 'undefined' ? window.location.origin : '');
	const publicUrl = $derived(project && origin ? `${origin}/venue/${project.slug}` : '');
	const isPublished = $derived(publish.status?.status === 'published');
	const allReady = $derived(publish.status?.ready ?? false);

	let copied = $state(false);

	onMount(() => {
		if (id) {
			void projects.selectProject(id);
			void publish.loadStatus(id);
		}
	});

	async function handlePublish() {
		if (!id) return;
		await publish.publish(id);
		void projects.selectProject(id);
	}

	async function handleUnpublish() {
		if (!id) return;
		await publish.unpublish(id);
		void projects.selectProject(id);
	}

	async function copyUrl() {
		if (!publicUrl) return;
		try {
			await navigator.clipboard.writeText(publicUrl);
			copied = true;
			setTimeout(() => (copied = false), 2000);
		} catch {
			// Ignore clipboard errors.
		}
	}
</script>

<svelte:head>
	<title>Публикация — Digital Menu</title>
</svelte:head>

<div class="mx-auto max-w-5xl">
	<Button variant="ghost" href="/app/projects/{id}" class="mb-4 -ml-2 px-2">
		<ArrowLeft class="h-4 w-4" aria-hidden="true" />
		К обзору
	</Button>

	<h1 class="text-2xl font-bold" style="font-family: var(--font-heading); color: var(--color-heading);">
		Публикация
	</h1>

	{#if publish.error}
		<div class="mt-4 rounded-lg border border-[var(--color-error)] bg-[var(--color-error-bg)] p-3 text-sm text-[var(--color-error)]" role="alert">
			{publish.error}
		</div>
	{/if}

	<div class="mt-8">
		{#if publish.loading && !publish.status}
			<p style="color: var(--color-text-secondary);">Загрузка…</p>
		{:else if publish.status}
			<div class="flex flex-col gap-6 lg:flex-row">
				<div class="flex-1 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6">
					<div class="flex items-center gap-3">
						<div class="rounded-full bg-[var(--color-primary-bg)] p-2">
							<Globe class="h-5 w-5 text-[var(--color-primary)]" aria-hidden="true" />
						</div>
						<div>
							<h2 class="font-semibold" style="color: var(--color-heading);">
								Статус публикации
							</h2>
							<p class="text-sm" style="color: var(--color-text-muted);">
								{project?.status === 'published' ? 'Опубликовано' : 'Ещё не публиковалось'}
							</p>
						</div>
						<Badge variant={isPublished ? 'success' : 'default'}>
							{isPublished ? 'Опубликовано' : 'Не опубликовано'}
						</Badge>
					</div>

					{#if publicUrl}
						<div class="mt-6">
							<label for="public-url" class="text-sm font-medium" style="color: var(--color-text-secondary);">
								Публичная ссылка
							</label>
							<div class="mt-1.5 flex items-center gap-2">
								<input
									id="public-url"
									type="text"
									readonly
									value={publicUrl}
									class="flex-1 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]"
								/>
								<Button variant="outline" class="px-3" onclick={copyUrl}>
									{#if copied}
										<CheckCircle2 class="h-4 w-4 text-[var(--color-success)]" aria-hidden="true" />
									{:else}
										<Copy class="h-4 w-4" aria-hidden="true" />
									{/if}
									<span class="sr-only">Копировать</span>
								</Button>
							</div>
						</div>
					{/if}

					<div class="mt-6 flex flex-wrap gap-2">
						{#if isPublished}
							<Button onclick={handleUnpublish} disabled={publish.loading}>
								Снять с публикации
							</Button>
						{:else}
							<Button onclick={handlePublish} disabled={publish.loading || !allReady}>
								{publish.loading ? 'Публикация…' : 'Опубликовать'}
							</Button>
						{/if}
					</div>
				</div>

				<div class="flex-1 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6">
					<h2 class="font-semibold" style="color: var(--color-heading);">
						Готовность к публикации
					</h2>
					<div class="mt-4">
						{#if publish.status.checklist.length > 0}
							<ReadinessChecklist checks={publish.status.checklist} />
						{:else}
							<p class="text-sm" style="color: var(--color-text-muted);">
								Нет проверок готовности.
							</p>
						{/if}
					</div>
				</div>
			</div>
		{:else}
			<EmptyState
				icon={Share2}
				title="Публикация"
				description="Здесь будет управление доменом, публикацией и ссылками для гостей."
			/>
		{/if}
	</div>
</div>
