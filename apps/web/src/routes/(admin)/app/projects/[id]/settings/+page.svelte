<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { ArrowLeft, Save, Trash2 } from '@lucide/svelte';
	import type { ProjectAppearance, ProjectButtonShape, ProjectCardStyle, ProjectMode } from '@digital-menu/api-client';
	import { projects } from '$lib/stores/projects.svelte';
	import Button from '$lib/components/Button.svelte';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import Select from '$lib/components/forms/Select.svelte';
	import FormError from '$lib/components/forms/FormError.svelte';

	const id = $derived(page.params.id ?? '');

	onMount(() => {
		if (id) {
			void projects.selectProject(id);
		}
	});

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

	let nameError = $state('');
	let slugError = $state('');
	let themeError = $state('');

	$effect(() => {
		const project = projects.currentProject;
		if (project) {
			name = project.name;
			slug = project.slug;
			type = project.type;
			description = project.description;
			locale = project.locale;
			currency = project.currency;
			mode = project.mode;

			const theme = project.theme;
			if (theme) {
				appearance = theme.appearance;
				accentColor = theme.accentColor;
				cardStyle = theme.cardStyle;
				buttonShape = theme.buttonShape;
				largePhotos = theme.largePhotos;
				promoPage = theme.promoPage;
			}
		}
	});

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

	const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

	function validateProject(): boolean {
		nameError = '';
		slugError = '';

		if (!name.trim()) {
			nameError = 'Введите название заведения.';
		}
		if (!slug.trim()) {
			slugError = 'Введите slug.';
		} else if (!slugPattern.test(slug.trim())) {
			slugError = 'Slug может содержать только строчные буквы, цифры и дефисы.';
		}

		return !nameError && !slugError;
	}

	function validateTheme(): boolean {
		themeError = '';
		if (!/^#[0-9a-fA-F]{6}$/.test(accentColor)) {
			themeError = 'Выберите корректный акцентный цвет.';
			return false;
		}
		return true;
	}

	async function handleSave() {
		if (!id || !validateProject()) return;
		await projects.updateProject(id, {
			name: name.trim(),
			slug: slug.trim(),
			type,
			description: description.trim(),
			locale,
			currency,
			mode
		});
	}

	async function handleSaveTheme() {
		if (!id || !validateTheme()) return;
		await projects.updateTheme(id, {
			appearance,
			accentColor,
			cardStyle,
			buttonShape,
			largePhotos,
			promoPage
		});
	}

	async function handleDelete() {
		if (!id) return;
		if (!confirm('Удалить заведение? Это действие нельзя отменить.')) return;
		await projects.deleteProject(id);
		window.location.href = '/app';
	}
</script>

<svelte:head>
	<title>Настройки — Digital Menu</title>
</svelte:head>

<div class="mx-auto max-w-3xl space-y-8">
	<Button variant="ghost" href="/app/projects/{id}" class="mb-4 -ml-2 px-2">
		<ArrowLeft class="h-4 w-4" aria-hidden="true" />
		К обзору
	</Button>

	<h1 class="text-2xl font-bold" style="font-family: var(--font-heading); color: var(--color-heading);">
		Настройки заведения
	</h1>

	{#if projects.error}
		<div class="mt-4">
			<FormError message={projects.error} />
		</div>
	{/if}

	<form
		class="mt-6 space-y-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6"
		 onsubmit={(e) => {
			e.preventDefault();
			void handleSave();
		}}
	>
		<TextInput label="Название" name="name" required bind:value={name} error={nameError} />
		<TextInput label="Slug" name="slug" required bind:value={slug} error={slugError} />
		<Select label="Тип заведения" name="type" options={types} bind:value={type} />
		<TextInput label="Описание" name="description" bind:value={description} />
		<div class="grid gap-5 sm:grid-cols-2">
			<Select label="Язык" name="locale" options={locales} bind:value={locale} />
			<Select label="Валюта" name="currency" options={currencies} bind:value={currency} />
		</div>
		<Select label="Режим работы" name="mode" options={modes} bind:value={mode} />

		<div class="flex items-center justify-between pt-4">
			<Button type="button" variant="outline" onclick={handleDelete} class="text-[var(--color-error)] border-[var(--color-error)] hover:bg-[var(--color-error-bg)]">
				<Trash2 class="h-4 w-4" aria-hidden="true" />
				Удалить
			</Button>
			<Button type="submit" disabled={projects.loading}>
				<Save class="h-4 w-4" aria-hidden="true" />
				Сохранить
			</Button>
		</div>
	</form>

	<form
		class="space-y-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6"
		 onsubmit={(e) => {
			e.preventDefault();
			void handleSaveTheme();
		}}
	>
		<h2 class="text-lg font-semibold" style="color: var(--color-heading);">Тема оформления</h2>

		{#if themeError}
			<FormError message={themeError} />
		{/if}

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

		<div class="flex justify-end pt-2">
			<Button type="submit" disabled={projects.loading}>
				<Save class="h-4 w-4" aria-hidden="true" />
				Сохранить тему
			</Button>
		</div>
	</form>
</div>
