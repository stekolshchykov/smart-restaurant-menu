<script lang="ts">
	import type { ProjectAppearance, ProjectMode } from '@digital-menu/api-client';

	interface Props {
		name: string;
		slug: string;
		type: string;
		mode: ProjectMode;
		appearance: ProjectAppearance;
		accentColor: string;
	}

	let { name, slug, type, mode, appearance, accentColor }: Props = $props();

	const types = [
		{ value: 'restaurant', label: 'Ресторан' },
		{ value: 'cafe', label: 'Кафе' },
		{ value: 'bar', label: 'Бар' },
		{ value: 'hotel', label: 'Отель' },
		{ value: 'foodcourt', label: 'Фуд-корт' },
		{ value: 'other', label: 'Другое' }
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
</script>

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
