<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { ArrowLeft, Save, Trash2 } from '@lucide/svelte';
	import type { ProjectMode } from '@digital-menu/api-client';
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

	async function handleSave() {
		if (!id) return;
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

<div class="mx-auto max-w-3xl">
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
		<TextInput label="Название" name="name" required bind:value={name} />
		<TextInput label="Slug" name="slug" required bind:value={slug} />
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
</div>
