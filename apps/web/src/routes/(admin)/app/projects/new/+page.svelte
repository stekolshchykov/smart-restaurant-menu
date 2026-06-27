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
	import FormError from '$lib/components/forms/FormError.svelte';
	import ProjectInfoStep from '$lib/components/admin/project-create/ProjectInfoStep.svelte';
	import StyleStep from '$lib/components/admin/project-create/StyleStep.svelte';
	import ReviewStep from '$lib/components/admin/project-create/ReviewStep.svelte';

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
			<ProjectInfoStep
				bind:name
				bind:slug
				bind:type
				bind:description
				bind:locale
				bind:currency
				bind:mode
				onNameInput={handleNameInput}
			/>
		{:else if currentStep === 1}
			<StyleStep
				bind:appearance
				bind:accentColor
				bind:cardStyle
				bind:buttonShape
				bind:largePhotos
				bind:promoPage
			/>
		{:else}
			<ReviewStep {name} {slug} {type} {mode} {appearance} {accentColor} />
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
