<script lang="ts">
	import { Check } from '@lucide/svelte';
	import Button from '$lib/components/Button.svelte';

	interface Props {
		name: string;
		price: string;
		period?: string;
		description: string;
		features: string[];
		featured?: boolean;
		cta: string;
		ctaHref?: string;
	}

	let {
		name,
		price,
		period = '/месяц',
		description,
		features,
		featured = false,
		cta,
		ctaHref = '/register',
	}: Props = $props();
</script>

<article
	class="relative flex flex-col rounded-[var(--radius-lg)] border p-6 md:p-8"
	class:border-[var(--color-primary)]={featured}
	class:border-[var(--color-border)]={!featured}
	class:bg-[var(--color-bg-elevated)]={!featured}
	class:bg-[var(--color-primary-bg)]={featured}
>
	{#if featured}
		<span
			class="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-semibold"
			style="background: var(--color-primary); color: var(--color-bg);"
		>
			Популярный
		</span>
	{/if}

	<h3 class="text-lg font-semibold" style="color: var(--color-heading);">{name}</h3>
	<p class="mt-2 text-sm" style="color: var(--color-text-secondary);">{description}</p>

	<div class="mt-5 flex items-baseline gap-1">
		<span class="text-4xl font-bold" style="color: var(--color-heading);">{price}</span>
		<span class="text-sm" style="color: var(--color-text-muted);">{period}</span>
	</div>

	<ul class="mt-6 flex flex-1 flex-col gap-3">
		{#each features as feature}
			<li class="flex items-start gap-3 text-sm" style="color: var(--color-text-secondary);">
				<Check class="mt-0.5 h-4 w-4 shrink-0" style="color: var(--color-primary);" aria-hidden="true" />
				<span>{feature}</span>
			</li>
		{/each}
	</ul>

	<Button
		href={ctaHref}
		variant={featured ? 'primary' : 'outline'}
		class="mt-8 w-full"
	>
		{cta}
	</Button>
</article>
