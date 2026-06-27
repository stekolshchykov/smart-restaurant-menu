<script lang="ts">
	import { QrCode, Sparkles, Users } from '@lucide/svelte';
	import Container from '$lib/components/marketing/Container.svelte';
	import SectionHeader from '$lib/components/marketing/SectionHeader.svelte';
	import Button from '$lib/components/Button.svelte';

	const values = [
		{
			title: 'Простота',
			description:
				'Мы убрали всё лишнее, чтобы запуск цифрового меню занимал минуты, а не недели. Никаких сложных интеграций для старта.',
			icon: Sparkles,
		},
		{
			title: 'Гибкость',
			description:
				'Подходит для одного кафе, сети заведений или фуд-корта. Настраивайте внешний вид, языки и режимы работы под себя.',
			icon: QrCode,
		},
		{
			title: 'Забота о гостях',
			description:
				'Аллергены, диетические фильтры, мультиязычность и удобный интерфейс помогают гостям чувствовать себя уверенно.',
			icon: Users,
		},
	];
</script>

<svelte:head>
	<title>О продукте — Digital Menu</title>
	<meta name="description" content="Digital Menu — современная платформа для цифровых меню ресторанов, кафе и баров." />
</svelte:head>

<section class="px-4 py-16 md:py-24">
	<Container>
		<div class="mx-auto max-w-3xl text-center">
			<h1
				class="text-3xl font-bold md:text-5xl"
				style="font-family: var(--font-heading); color: var(--color-heading);"
			>
				О продукте
			</h1>
			<p class="mt-6 text-lg" style="color: var(--color-text-secondary);">
				Digital Menu помогает заведениям общественного питания создавать стильные цифровые меню,
				управлять столами и принимать заказы от гостей через QR-коды. Мы верим, что технологии
				должны работать на сервис, а не усложнять его.
			</p>
		</div>
	</Container>
</section>

<section class="border-y border-[var(--color-border)] px-4 py-16 md:py-24">
	<Container>
		<SectionHeader
			eyebrow="Наши принципы"
			title="Почему Digital Menu"
			subtitle="Три опоры, на которых построена платформа."
		/>
		<div class="grid gap-6 md:grid-cols-3">
			{#each values as value}
				<article
					class="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6"
				>
					<div
						class="mb-4 flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)]"
						style="background: var(--color-primary-bg); color: var(--color-primary);"
					>
						<value.icon class="h-6 w-6" aria-hidden="true" />
					</div>
					<h3 class="text-lg font-semibold" style="color: var(--color-heading);">
						{value.title}
					</h3>
					<p class="mt-2 text-sm leading-relaxed" style="color: var(--color-text-secondary);">
						{value.description}
					</p>
				</article>
			{/each}
		</div>
	</Container>
</section>

<section class="px-4 py-16 md:py-24">
	<Container>
		<div class="mx-auto max-w-3xl text-center">
			<h2
				class="text-2xl font-bold md:text-3xl"
				style="font-family: var(--font-heading); color: var(--color-heading);"
			>
				Готовы попробовать?
			</h2>
			<p class="mt-4" style="color: var(--color-text-secondary);">
				Создайте аккаунт, добавьте первые позиции и увидите, как ваше меню преображается для
				гостей.
			</p>
			<div class="mt-8 flex flex-wrap justify-center gap-4">
				<Button href="/register" class="px-8 py-3 text-base">Начать бесплатно</Button>
				<Button href="/demo" variant="outline" class="px-8 py-3 text-base">Посмотреть демо</Button>
			</div>
		</div>
	</Container>
</section>
