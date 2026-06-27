<script lang="ts">
	import type { ProjectMode } from '@digital-menu/api-client';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import Select from '$lib/components/forms/Select.svelte';

	interface Props {
		name: string;
		slug: string;
		type: string;
		description: string;
		locale: string;
		currency: string;
		mode: ProjectMode;
		onNameInput: (value: string) => void;
	}

	let {
		name = $bindable(),
		slug = $bindable(),
		type = $bindable(),
		description = $bindable(),
		locale = $bindable(),
		currency = $bindable(),
		mode = $bindable(),
		onNameInput,
	}: Props = $props();

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
</script>

<div class="space-y-5">
	<TextInput
		label="Название заведения"
		name="name"
		placeholder="Например, Brasserie 12"
		required
		bind:value={name}
		oninput={onNameInput}
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
