<script lang="ts">
	import {
		QrCode,
		Globe,
		Leaf,
		Utensils,
		LayoutDashboard,
		BarChart3,
		Smartphone,
	} from '@lucide/svelte';
	import Button from '$lib/components/Button.svelte';
	import Container from '$lib/components/marketing/Container.svelte';
	import SectionHeader from '$lib/components/marketing/SectionHeader.svelte';
	import FeatureCard from '$lib/components/marketing/FeatureCard.svelte';
	import StepCard from '$lib/components/marketing/StepCard.svelte';
	import PricingCard from '$lib/components/marketing/PricingCard.svelte';

	const features = [
		{
			title: 'QR-заказы',
			description: 'Гости сканируют код за столом и оформляют заказ без установки приложений.',
			icon: QrCode,
		},
		{
			title: 'Обновления в реальном времени',
			description: 'Меняйте цены, составы и наличие — изменения появляются на всех устройствах мгновенно.',
			icon: Smartphone,
		},
		{
			title: 'Мультиязычность',
			description: 'Поддержка нескольких языков и локалей для туристических зон и международных сетей.',
			icon: Globe,
		},
		{
			title: 'Диетические фильтры',
			description: 'Отметки аллергенов, веганских, безглютеновых и других позиций для удобства гостей.',
			icon: Leaf,
		},
		{
			title: 'Управление столами',
			description: 'Создавайте столики, печатайте QR-коды и отслеживайте заказы по залу.',
			icon: LayoutDashboard,
		},
		{
			title: 'Аналитика',
			description: 'Смотрите популярные позиции, выручку по залу и пиковые часы в одном окне.',
			icon: BarChart3,
		},
	];

	const steps = [
		{ title: 'Создайте меню', description: 'Добавьте категории, блюда, ингредиенты, аллергены и фото.' },
		{ title: 'Распечатайте QR-коды', description: 'Сгенерируйте коды для каждого стола и разместите их в зале.' },
		{ title: 'Гости заказывают', description: 'Посетители сканируют код, выбирают блюда и отправляют заказ.' },
		{ title: 'Кухня получает заказ', description: 'Заказы поступают в админ-панель или на кухонный дисплей.' },
	];

	const plans = [
		{
			name: 'Бесплатный старт',
			price: '€0',
			description: 'Идеально для знакомства с платформой.',
			features: ['1 заведение', 'До 30 позиций меню', 'Базовая аналитика', 'QR-коды для 5 столов'],
			cta: 'Начать бесплатно',
		},
		{
			name: 'Pro',
			price: '€29',
			description: 'Для работающих кафе и ресторанов.',
			features: [
				'Неограниченное меню',
				'Неограниченные столы',
				'Мультиязычность',
				'Приём заказов за столом',
				'Расширенная аналитика',
			],
			featured: true,
			cta: 'Выбрать Pro',
		},
		{
			name: 'Enterprise',
			price: 'По запросу',
			period: '',
			description: 'Для сетевых заведений и франшиз.',
			features: [
				'Несколько заведений',
				'Персональная интеграция',
				'Приоритетная поддержка',
				'SLA и безопасность',
			],
			cta: 'Связаться',
			ctaHref: '/register',
		},
	];
</script>

<svelte:head>
	<title>Digital Menu — Цифровое меню для ресторанов</title>
	<meta
		name="description"
		content="Создавайте элегантные цифровые меню, управляйте столами и принимайте заказы за столом через QR-коды."
	/>
</svelte:head>

<section class="relative overflow-hidden px-4 py-20 md:py-28">
	<Container>
		<div class="mx-auto max-w-3xl text-center">
			<span
				class="mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium"
				style="background: var(--color-primary-bg); color: var(--color-primary);"
			>
				<Utensils class="h-3.5 w-3.5" aria-hidden="true" />
				QR-меню для современных заведений
			</span>
			<h1
				class="text-4xl font-bold leading-tight md:text-6xl"
				style="font-family: var(--font-heading); color: var(--color-heading);"
			>
				Цифровое меню, которое выглядит как ваше заведение
			</h1>
			<p class="mt-6 text-lg md:text-xl" style="color: var(--color-text-secondary);">
				Создавайте элегантные меню для гостей, управляйте позициями и получайте заказы за столом
				— без приложений и лишних затрат.
			</p>
			<div class="mt-8 flex flex-wrap justify-center gap-4">
				<Button href="/register" class="px-8 py-3 text-base">Начать бесплатно</Button>
				<Button href="/demo" variant="outline" class="px-8 py-3 text-base">Посмотреть демо</Button>
			</div>
		</div>
	</Container>
</section>

<section id="features" class="px-4 py-16 md:py-24">
	<Container>
		<SectionHeader
			eyebrow="Возможности"
			title="Всё, что нужно для цифрового сервиса"
			subtitle="От создания меню до аналитики посещений — в одной платформе."
		/>
		<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each features as feature}
				<FeatureCard title={feature.title} description={feature.description} icon={feature.icon} />
			{/each}
		</div>
	</Container>
</section>

<section id="how-it-works" class="border-y border-[var(--color-border)] px-4 py-16 md:py-24">
	<Container>
		<SectionHeader
			eyebrow="Как это работает"
			title="Запуск за четыре простых шага"
			subtitle="Никакой настройки инфраструктуры — только ваше меню и QR-коды."
		/>
		<div class="mx-auto grid max-w-3xl gap-2 md:grid-cols-2">
			{#each steps as step, index}
				<StepCard step={index + 1} title={step.title} description={step.description} />
			{/each}
		</div>
	</Container>
</section>

<section id="pricing" class="px-4 py-16 md:py-24">
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

<section class="px-4 py-16 md:py-24">
	<Container>
		<div
			class="flex flex-col items-center justify-between gap-8 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-6 py-12 md:flex-row md:px-12"
		>
			<div class="max-w-xl">
				<h2
					class="text-2xl font-bold md:text-3xl"
					style="font-family: var(--font-heading); color: var(--color-heading);"
				>
					Увидите Digital Menu в действии
				</h2>
				<p class="mt-3" style="color: var(--color-text-secondary);">
					Откройте демо-меню, чтобы оценить интерфейс гостя: категории, карточки блюд, детали
					и корзину.
				</p>
			</div>
			<div class="flex shrink-0 gap-4">
				<Button href="/demo" class="px-8 py-3 text-base">Открыть демо</Button>
				<Button href="/register" variant="outline" class="px-8 py-3 text-base">Регистрация</Button>
			</div>
		</div>
	</Container>
</section>
