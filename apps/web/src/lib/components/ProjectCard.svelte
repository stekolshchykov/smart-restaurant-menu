<script lang="ts">
	import { Briefcase, Settings, ExternalLink } from '@lucide/svelte';
	import type { ProjectResponse } from '@digital-menu/api-client';
	import Badge from '$lib/components/Badge.svelte';
	import Button from '$lib/components/Button.svelte';

	interface Props {
		project: ProjectResponse;
		onOpen?: (project: ProjectResponse) => void;
		onSettings?: (project: ProjectResponse) => void;
	}

	let { project, onOpen, onSettings }: Props = $props();

	const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
		draft: 'default',
		ready: 'info',
		published: 'success',
		attention: 'warning'
	};

	const statusLabel: Record<string, string> = {
		draft: 'Черновик',
		ready: 'Готов',
		published: 'Опубликован',
		attention: 'Требует внимания'
	};

	const modeLabel: Record<string, string> = {
		promo_only: 'Только promo',
		menu_only: 'Меню',
		menu_service: 'Меню + вызов',
		menu_order: 'Меню + заказ'
	};

	function formatDate(value: string): string {
		return new Date(value).toLocaleDateString('ru-RU', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}
</script>

<article
	class="flex flex-col justify-between rounded-2xl border border-[var(--color-border-on-surface)] bg-[var(--color-surface)] p-5 shadow-sm transition-shadow hover:shadow-md"
>
	<div>
		<div class="flex items-start justify-between gap-3">
			<div class="flex items-center gap-3">
				<div class="rounded-lg bg-[var(--color-primary-bg)] p-2">
					<Briefcase class="h-5 w-5 text-[var(--color-primary)]" aria-hidden="true" />
				</div>
				<div>
					<h3 class="font-semibold" style="color: var(--color-heading-on-surface);">
						{project.name}
					</h3>
					<p class="text-sm" style="color: var(--color-text-on-surface-muted);">
						/{project.slug}
					</p>
				</div>
			</div>
			<Badge variant={statusVariant[project.status] ?? 'default'}>
				{statusLabel[project.status] ?? project.status}
			</Badge>
		</div>
		<div class="mt-4 flex flex-wrap gap-2">
			<Badge variant="info">{modeLabel[project.mode] ?? project.mode}</Badge>
			<Badge variant="default">{project.type}</Badge>
		</div>
		{#if project.description}
			<p class="mt-3 line-clamp-2 text-sm" style="color: var(--color-text-on-surface-secondary);">
				{project.description}
			</p>
		{/if}
	</div>
	<div class="mt-5 flex items-center justify-between">
		<span class="text-xs" style="color: var(--color-text-on-surface-muted);">
			Обновлено {formatDate(project.updatedAt)}
		</span>
		<div class="flex items-center gap-2">
			<Button variant="outline" class="px-3 py-1.5" onclick={() => onOpen?.(project)}>
				<ExternalLink class="h-4 w-4" aria-hidden="true" />
				<span class="sr-only">Открыть</span>
			</Button>
			<Button variant="ghost" class="px-3 py-1.5" onclick={() => onSettings?.(project)}>
				<Settings class="h-4 w-4" aria-hidden="true" />
				<span class="sr-only">Настройки</span>
			</Button>
		</div>
	</div>
</article>
