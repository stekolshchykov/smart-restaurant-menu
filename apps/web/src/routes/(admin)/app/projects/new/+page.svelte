<script lang="ts">
	import { goto } from '$app/navigation';
	import { ChevronLeft, ChevronRight, Check } from '@lucide/svelte';
	import type {
		ProjectAppearance,
		ProjectButtonShape,
		ProjectCardStyle,
		ProjectMode,
	} from '@digital-menu/api-client';
	import { projects } from '$lib/stores/projects.svelte';
	import Button from '$lib/components/Button.svelte';
	import Stepper from '$lib/components/Stepper.svelte';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import Select from '$lib/components/forms/Select.svelte';
	import FormError from '$lib/components/forms/FormError.svelte';

	const steps = [{ label: 'Проект' }, { label: 'Стиль' }, { label: 'Проверка' }];

	let currentStep = $state(0);

	let name = $state('');
	let slug = $state('');
	let type = $state('restaurant');
	let description = $state('');
	let locale = $state('ru');
	let currency = $state('RUB');
	let mode = $state<ProjectMode>('menu_order');

	let appearance = $state<ProjectAppearance>('dark');
	let accentColor = $state('#c9a227');
	let cardStyle = $state<ProjectCardStyle>('elevated');
	let buttonShape = $state<ProjectButtonShape>('rounded');
	let largePhotos = $state(true);
	let promoPage = $state(false);

	const types = [
		{ value: 'restaurant', label: 'Ресторан' },
		{ value: 'cafe', label: 'Кафе' },
		{ value: 'bar', label: 'Бар' },
		{ value: 'hotel', label: 'Отель' },
		{ value: 'foodcourt', label: 'Фуд-корт' },
		{ value: 'other', label: 'Другое' }
	];

	const locales = [
		{ value: 'ru', label: 'Русский' },
		{ value: 'en', label: 'English' },
		{ value: 'kk', label: 'Қазақша' },
		{ value: 'uz', label: "O'zbek" }
	];

	const currencies = [
		{ value: 'RUB', label: '₽ — Российский рубль' },
		{ value: 'USD', label: '$ — Доллар США' },
		{ value: 'EUR', label: '€ — Евро' },
		{ value: 'KZT', label: '₸ — Казахстанский тенге' },
		{ value: 'UZS', label: "so'm — Узбекский сум" }
	];

	const modes = [
		{ value: 'promo_only', label: 'Только promo-страница' },
		{ value: 'menu_only', label: 'Меню без заказа' },
		{ value: 'menu_service', label: 'Меню + вызов персонала' },
		{ value: 'menu_order', label: 'Меню + онлайн-заказ' }
	];

	const appearances = [
		{ value: 'dark', label: 'Тёмная' },
		{ value: 'light', label: 'Светлая' },
		{ value: 'auto', label: 'Как в системе' }
	];

	const cardStyles = [
		{ value: 'flat', label: 'Плоская' },
		{ value: 'elevated', label: 'С тенью' },
		{ value: 'outlined', label: 'С рамкой' }
	];

	const buttonShapes = [
		{ value: 'rounded', label: 'Скруглённые' },
		{ value: 'pill', label: 'Капсулы' },
		{ value: 'square', label: 'Прямоугольные' }
	];

	const accentOptions = [
		'#c9a227',
		'#6b8e6e',
		'#b85c5c',
		'#5a8aa8',
		'#8b6bb8',
		'#c9904e',
		'#4a9e9e',
		'#d946a3'
	];

	function generateSlug(value: string): string {
		return value
			.toLowerCase()
			.trim()
			.replace(/[^\w\s-]/g, '')
			.replace(/\s+/g, '-')
			.replace(/-+/g, '-');
	}

	function handleNameInput(value: string) {
		if (slug === '' || slug === generateSlug(name.slice(0, -1))) {
			slug = generateSlug(value);
		}
	}

	function canProceed(): boolean {
		if (currentStep === 0) {
			return name.trim().length > 0 && slug.trim().length > 0;
		}
		return true;
	}

	function nextStep() {
		if (currentStep < steps.length - 1 && canProceed()) {
			currentStep += 1;
		}
	}

	function prevStep() {
		if (currentStep > 0) {
			currentStep -= 1;
		}
	}

	async function handleCreate() {
		const project = await projects.createProject({
			name: name.trim(),
			slug: slug.trim(),
			type,
			description: description.trim(),
			locale,
			currency,
			mode
		});

		await projects.updateTheme(project.id, {
			appearance,
			accentColor,
			cardStyle,
			buttonShape,
			largePhotos,
			promoPage
		});

		void goto('/app');
	}
</script>

<svelte:head>
	<title>Создать заведение — Digital Menu</title>
</svelte:head>

<div class="mx-auto max-w-3xl">
	<h1 class="text-2xl font-bold" style="font-family: var(--font-heading); color: var(--color-heading);">
		Создать заведение
	</h1>

	<div class="mt-6">
		<Stepper {steps} current={currentStep} />
	</div>

	{#if projects.error}
		<div class="mt-6">
			<FormError message={projects.error} />
		</div>
	{/if}

	<div class="mt-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6">
		{#if currentStep === 0}
			<div class="space-y-5">
				<TextInput
					label="Название заведения"
					name="name"
					placeholder="Например, Brasserie 12"
					required
					bind:value={name}
					oninput={handleNameInput}
				/>
				<TextInput
					label="Slug"
					name="slug"
					placeholder="brasserie-12"
					required
					bind:value={slug}
				/>
				<p class="text-xs" style="color: var(--color-text-muted);">
					Используется в адресе: /venue/{slug || 'slug'}
				</p>
				<Select label="Тип заведения" name="type" options={types} bind:value={type} />
				<TextInput
					label="Описание"
					name="description"
					placeholder="Короткое описание для гостей"
					bind:value={description}
				/>
				<div class="grid gap-5 sm:grid-cols-2">
					<Select label="Язык" name="locale" options={locales} bind:value={locale} />
					<Select label="Валюта" name="currency" options={currencies} bind:value={currency} />
				</div>
				<Select label="Режим работы" name="mode" options={modes} bind:value={mode} />
			</div>
		{:else if currentStep === 1}
			<div class="space-y-6">
				<Select label="Оформление" name="appearance" options={appearances} bind:value={appearance} />

				<div>
					<span class="mb-2 block text-sm font-medium text-[var(--color-text)]">Акцентный цвет</span>
					<div class="flex flex-wrap gap-3" role="group" aria-label="Акцентный цвет">
						{#each accentOptions as color}
							<button
								type="button"
								class="h-10 w-10 rounded-full border-2 transition-transform focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]"
								class:border-[var(--color-primary)]={accentColor === color}
								class:border-transparent={accentColor !== color}
								style="background-color: {color};"
								aria-label="Выбрать цвет {color}"
								aria-pressed={accentColor === color}
								onclick={() => (accentColor = color)}
							></button>
						{/each}
						<input
							type="color"
							bind:value={accentColor}
							class="h-10 w-10 cursor-pointer rounded-full border-0 bg-transparent p-0"
							aria-label="Свой акцентный цвет"
						/>
					</div>
				</div>

				<Select label="Стиль карточек" name="cardStyle" options={cardStyles} bind:value={cardStyle} />
				<Select label="Форма кнопок" name="buttonShape" options={buttonShapes} bind:value={buttonShape} />

				<div class="flex flex-col gap-4">
					<label class="flex items-center justify-between rounded-md border border-[var(--color-border)] px-4 py-3">
						<span class="text-sm text-[var(--color-text)]">Крупные фото блюд</span>
						<input
							type="checkbox"
							bind:checked={largePhotos}
							class="h-5 w-5 accent-[var(--color-primary)]"
						/>
					</label>
					<label class="flex items-center justify-between rounded-md border border-[var(--color-border)] px-4 py-3">
						<span class="text-sm text-[var(--color-text)]">Promo-страница заведения</span>
						<input
							type="checkbox"
							bind:checked={promoPage}
							class="h-5 w-5 accent-[var(--color-primary)]"
						/>
					</label>
				</div>
			</div>
		{:else}
			<div class="space-y-4 text-[var(--color-text)]">
				<div class="rounded-lg border border-[var(--color-border)] p-4">
					<h3 class="text-sm font-medium text-[var(--color-text-muted)]">Название</h3>
					<p class="mt-1 font-medium">{name}</p>
				</div>
				<div class="rounded-lg border border-[var(--color-border)] p-4">
					<h3 class="text-sm font-medium text-[var(--color-text-muted)]">Адрес</h3>
					<p class="mt-1 font-medium">/venue/{slug}</p>
				</div>
				<div class="grid gap-4 sm:grid-cols-2">
					<div class="rounded-lg border border-[var(--color-border)] p-4">
						<h3 class="text-sm font-medium text-[var(--color-text-muted)]">Тип</h3>
						<p class="mt-1 font-medium">{types.find((t) => t.value === type)?.label}</p>
					</div>
					<div class="rounded-lg border border-[var(--color-border)] p-4">
						<h3 class="text-sm font-medium text-[var(--color-text-muted)]">Режим</h3>
						<p class="mt-1 font-medium">{modes.find((m) => m.value === mode)?.label}</p>
					</div>
				</div>
				<div class="grid gap-4 sm:grid-cols-2">
					<div class="rounded-lg border border-[var(--color-border)] p-4">
						<h3 class="text-sm font-medium text-[var(--color-text-muted)]">Оформление</h3>
						<p class="mt-1 font-medium">{appearances.find((a) => a.value === appearance)?.label}</p>
					</div>
					<div class="rounded-lg border border-[var(--color-border)] p-4">
						<h3 class="text-sm font-medium text-[var(--color-text-muted)]">Акцент</h3>
						<div class="mt-1 flex items-center gap-2">
							<span class="inline-block h-4 w-4 rounded-full" style="background-color: {accentColor};"></span>
							<span class="font-medium">{accentColor}</span>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>

	<div class="mt-6 flex items-center justify-between">
		<Button variant="outline" onclick={prevStep} disabled={currentStep === 0}>
			<ChevronLeft class="h-4 w-4" aria-hidden="true" />
			Назад
		</Button>

		{#if currentStep < steps.length - 1}
			<Button onclick={nextStep} disabled={!canProceed()}>
				Далее
				<ChevronRight class="h-4 w-4" aria-hidden="true" />
			</Button>
		{:else}
			<Button onclick={handleCreate} disabled={projects.loading || !canProceed()}>
				{#if projects.loading}
					Создание…
				{:else}
					<Check class="h-4 w-4" aria-hidden="true" />
					Создать заведение
				{/if}
			</Button>
		{/if}
	</div>
</div>
