<script lang="ts">
	interface Props {
		step: number;
		title: string;
		description: string;
	}

	let { step, title, description }: Props = $props();
</script>

<article class="relative flex gap-5">
	<div class="flex flex-col items-center">
		<span
			class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold"
			style="background: var(--color-primary-bg); color: var(--color-primary);"
		>
			{step}
		</span>
		<div
			class="mt-3 hidden h-full w-px min-h-[3rem] lg:block"
			style="background: var(--color-border);"
		></div>
	</div>
	<div class="pb-8">
		<h3 class="text-lg font-semibold" style="color: var(--color-heading);">{title}</h3>
		<p class="mt-1 text-sm leading-relaxed" style="color: var(--color-text-secondary);">
			{description}
		</p>
	</div>
</article>
