<script lang="ts">
	interface Step {
		label: string;
	}

	interface Props {
		steps: Step[];
		current: number;
	}

	let { steps, current }: Props = $props();
</script>

<nav aria-label="Прогресс">
	<ol class="flex w-full items-center">
		{#each steps as step, index}
			{@const isCompleted = index < current}
			{@const isCurrent = index === current}
			<li class="flex flex-1 items-center" class:last={index === steps.length - 1}>
				<div class="flex flex-col items-center">
					<div
						class="flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors"
						class:bg-[var(--color-primary)]={isCompleted || isCurrent}
						class:text-[var(--color-bg)]={isCompleted || isCurrent}
						class:bg-[var(--color-bg-elevated)]={!isCompleted && !isCurrent}
						class:text-[var(--color-text-muted)]={!isCompleted && !isCurrent}
						class:ring-2={isCurrent}
						class:ring-[var(--color-focus-ring)]={isCurrent}
						aria-current={isCurrent ? 'step' : undefined}
					>
						{#if isCompleted}
							✓
						{:else}
							{index + 1}
						{/if}
					</div>
					<span
						class="mt-1.5 text-xs font-medium transition-colors"
						class:text-[var(--color-text)]={isCompleted || isCurrent}
						class:text-[var(--color-text-muted)]={!isCompleted && !isCurrent}
					>
						{step.label}
					</span>
				</div>
				{#if index < steps.length - 1}
					<div
						class="mx-2 h-0.5 flex-1 rounded transition-colors"
						class:bg-[var(--color-primary)]={isCompleted}
						class:bg-[var(--color-border)]={!isCompleted}
						aria-hidden="true"
					></div>
				{/if}
			</li>
		{/each}
	</ol>
</nav>
