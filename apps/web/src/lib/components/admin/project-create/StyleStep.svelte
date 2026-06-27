<script lang="ts">
	import type { ProjectAppearance, ProjectButtonShape, ProjectCardStyle } from '@digital-menu/api-client';
	import Select from '$lib/components/forms/Select.svelte';

	interface Props {
		appearance: ProjectAppearance;
		accentColor: string;
		cardStyle: ProjectCardStyle;
		buttonShape: ProjectButtonShape;
		largePhotos: boolean;
		promoPage: boolean;
	}

	let {
		appearance = $bindable(),
		accentColor = $bindable(),
		cardStyle = $bindable(),
		buttonShape = $bindable(),
		largePhotos = $bindable(),
		promoPage = $bindable(),
	}: Props = $props();

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
</script>

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
