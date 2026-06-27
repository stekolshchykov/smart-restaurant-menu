<script lang="ts">
	import { HelpCircle } from '@lucide/svelte';
	import Container from '$lib/components/marketing/Container.svelte';
	import SectionHeader from '$lib/components/marketing/SectionHeader.svelte';
	import PricingCard from '$lib/components/marketing/PricingCard.svelte';

	const plans = [
		{
			name: 'Бесплатный старт',
			price: '€0',
			description: 'Идеально для знакомства с платформой и небольших точек.',
			features: [
				'1 заведение',
				'До 30 позиций меню',
				'1 язык',
				'QR-коды для 5 столов',
				'Базовая аналитика',
				'Email-поддержка',
			],
			cta: 'Начать бесплатно',
		},
		{
			name: 'Pro',
			price: '€29',
			description: 'Для работающих кафе, ресторанов и баров.',
			features: [
				'1 заведение',
				'Неограниченное меню',
				'Неограниченные столы',
				'Мультиязычность',
				'Приём заказов за столом',
				'Расширенная аналитика',
				'Приоритетная поддержка',
			],
			featured: true,
			cta: 'Выбрать Pro',
		},
		{
			name: 'Enterprise',
			price: 'По запросу',
			period: '',
			description: 'Для сетевых заведений, франшиз и крупных холдингов.',
			features: [
				'Несколько заведений',
				'Персональная интеграция',
				'Брендирование под вас',
				'API и вебхуки',
				'Приоритетная поддержка',
				'SLA и безопасность',
			],
			cta: 'Связаться',
			ctaHref: '/register',
		},
	];

	const faqs = [
		{
			q: 'Можно ли сменить тариф позже?',
			a: 'Да, вы можете перейти на Pro или Enterprise в любой момент из личного кабинета.',
		},
		{
			q: 'Нужно ли устанавливать приложение?',
			a: 'Нет. Гости открывают меню в браузере по QR-коду, администраторы работают в веб-панели.',
		},
		{
			q: 'Какие способы оплаты поддерживаются?',
			a: 'В базовой версии заказ передаётся в заведение, оплата происходит офлайн. Интеграции с платёжными системами доступны в Enterprise.',
		},
	];
</script>

<svelte:head>
	<title>Тарифы — Digital Menu</title>
	<meta name="description" content="Прозрачные тарифы Digital Menu: бесплатный старт, Pro и Enterprise." />
</svelte:head>

<section class="px-4 py-16 md:py-24">
	<Container>
		<SectionHeader
			eyebrow="Тарифы"
			title="Прозрачные цены для любого масштаба"
			subtitle="Начните бесплатно и переходите на Pro, когда понадобится больше возможностей."
		/>
		<div class="grid gap-6 md:grid-cols-3">
			{#each plans as plan}
				<PricingCard
					name={plan.name}
					price={plan.price}
					period={plan.period}
					description={plan.description}
					features={plan.features}
					featured={plan.featured}
					cta={plan.cta}
					ctaHref={plan.ctaHref}
				/>
			{/each}
		</div>
	</Container>
</section>

<section class="border-y border-[var(--color-border)] px-4 py-16 md:py-24">
	<Container>
		<SectionHeader
			eyebrow="FAQ"
			title="Частые вопросы"
			subtitle="Ответы на вопросы о тарифах и возможностях платформы."
		/>
		<div class="mx-auto grid max-w-3xl gap-6">
			{#each faqs as faq}
				<details
					class="group rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-5"
				>
					<summary
						class="flex cursor-pointer list-none items-center justify-between text-base font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)]"
						style="color: var(--color-heading);"
					>
						{faq.q}
						<HelpCircle
							class="h-5 w-5 shrink-0 transition-transform group-open:rotate-180"
							style="color: var(--color-text-muted);"
							aria-hidden="true"
						/>
					</summary>
					<p class="mt-3 text-sm leading-relaxed" style="color: var(--color-text-secondary);">
						{faq.a}
					</p>
				</details>
			{/each}
		</div>
	</Container>
</section>
