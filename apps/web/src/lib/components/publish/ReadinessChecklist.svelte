<script lang="ts">
	import { Check, X, AlertCircle } from '@lucide/svelte';
	import type { PublicationCheck } from '@digital-menu/api-client';

	interface Props {
		checks: PublicationCheck[];
	}

	let { checks }: Props = $props();
</script>

<ul class="flex flex-col gap-3" role="list" aria-label="Чеклист готовности">
	{#each checks as check (check.key)}
		<li class="flex items-start gap-3">
			<div class="mt-0.5 shrink-0">
				{#if check.passed}
					<div class="rounded-full bg-[var(--color-success-bg)] p-1">
						<Check class="h-4 w-4 text-[var(--color-success)]" aria-hidden="true" />
					</div>
				{:else}
					<div class="rounded-full bg-[var(--color-error-bg)] p-1">
						<X class="h-4 w-4 text-[var(--color-error)]" aria-hidden="true" />
					</div>
				{/if}
			</div>
			<div class="flex-1">
				<p class="text-sm font-medium" class:text-[var(--color-text)]={check.passed} class:text-[var(--color-text-secondary)]={!check.passed}>
					{check.label}
				</p>
			</div>
			{#if !check.passed}
				<AlertCircle class="h-4 w-4 shrink-0 text-[var(--color-warning)]" aria-hidden="true" />
			{/if}
		</li>
	{/each}
</ul>
