<script lang="ts">
	import { Plus, Trash2, ChevronDown, ChevronUp, Pencil } from '@lucide/svelte';
	import type {
		CreateModifierGroupRequest,
		CreateModifierOptionRequest,
		ModifierGroup,
		ModifierOption,
		UpdateModifierGroupRequest,
		UpdateModifierOptionRequest,
	} from '@digital-menu/api-client';
	import Button from '$lib/components/Button.svelte';
	import TextInput from '$lib/components/forms/TextInput.svelte';

	interface Props {
		groups: ModifierGroup[];
		onCreateGroup: (body: CreateModifierGroupRequest) => void;
		onUpdateGroup: (id: string, body: UpdateModifierGroupRequest) => void;
		onDeleteGroup: (id: string) => void;
		onCreateOption: (groupId: string, body: CreateModifierOptionRequest) => void;
		onUpdateOption: (id: string, body: UpdateModifierOptionRequest) => void;
		onDeleteOption: (id: string) => void;
	}

	let {
		groups,
		onCreateGroup,
		onUpdateGroup,
		onDeleteGroup,
		onCreateOption,
		onUpdateOption,
		onDeleteOption,
	}: Props = $props();

	let editingGroupId = $state<string | null>(null);
	let newGroupName = $state('');
	let newGroupRequired = $state(false);
	let newGroupMin = $state('0');
	let newGroupMax = $state('1');

	let activeOptionGroupId = $state<string | null>(null);
	let editingOptionId = $state<string | null>(null);
	let newOptionName = $state('');
	let newOptionPrice = $state('0');

	function resetGroupForm() {
		newGroupName = '';
		newGroupRequired = false;
		newGroupMin = '0';
		newGroupMax = '1';
		editingGroupId = null;
	}

	function startEditGroup(group: ModifierGroup) {
		editingGroupId = group.id;
		newGroupName = group.name;
		newGroupRequired = group.required;
		newGroupMin = String(group.minOptions);
		newGroupMax = String(group.maxOptions);
	}

	function submitGroup() {
		const body = {
			name: newGroupName.trim(),
			required: newGroupRequired,
			minOptions: Number(newGroupMin) || 0,
			maxOptions: Number(newGroupMax) || 1,
		};

		if (editingGroupId) {
			onUpdateGroup(editingGroupId, body);
		} else {
			onCreateGroup(body);
		}
		resetGroupForm();
	}

	function resetOptionForm() {
		newOptionName = '';
		newOptionPrice = '0';
		editingOptionId = null;
		activeOptionGroupId = null;
	}

	function startEditOption(groupId: string, option: ModifierOption) {
		activeOptionGroupId = groupId;
		editingOptionId = option.id;
		newOptionName = option.name;
		newOptionPrice = option.price;
	}

	function submitOption(groupId: string) {
		const body = {
			name: newOptionName.trim(),
			price: newOptionPrice,
		};

		if (editingOptionId) {
			onUpdateOption(editingOptionId, body);
		} else {
			onCreateOption(groupId, body);
		}
		resetOptionForm();
	}

	function toggleGroup(group: ModifierGroup) {
		if (editingGroupId === group.id) {
			resetGroupForm();
		} else {
			startEditGroup(group);
		}
	}
</script>

<div class="space-y-4">
	<h3 class="text-sm font-medium text-[var(--color-text)]">Модификаторы</h3>

	{#if groups.length === 0}
		<p class="text-sm text-[var(--color-text-secondary)]">Нет модификаторов.</p>
	{/if}

	{#each groups as group (group.id)}
		<div class="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
			<div class="flex items-center justify-between gap-2">
				<button
					type="button"
					class="flex flex-1 items-center gap-2 text-left text-sm font-medium text-[var(--color-text)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)]"
					onclick={() => toggleGroup(group)}
				>
					{#if editingGroupId === group.id}
						<ChevronUp class="h-4 w-4" aria-hidden="true" />
					{:else}
						<ChevronDown class="h-4 w-4" aria-hidden="true" />
					{/if}
					<span>{group.name}</span>
					{#if group.required}
						<span class="text-xs text-[var(--color-error)]">обязательно</span>
					{/if}
				</button>
				<button
					type="button"
					class="rounded p-1 text-[var(--color-text-secondary)] hover:text-[var(--color-error)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)]"
					aria-label="Удалить группу {group.name}"
					onclick={() => onDeleteGroup(group.id)}
				>
					<Trash2 class="h-4 w-4" aria-hidden="true" />
				</button>
			</div>

			{#if editingGroupId === group.id}
				<div class="mt-4 space-y-3">
					<TextInput label="Название группы" name="group-name" bind:value={newGroupName} />
					<label class="flex items-center gap-2 text-sm text-[var(--color-text)]">
						<input type="checkbox" bind:checked={newGroupRequired} class="h-4 w-4 accent-[var(--color-primary)]" />
						Обязательная группа
					</label>
					<div class="grid gap-3 sm:grid-cols-2">
						<TextInput label="Минимум" name="group-min" bind:value={newGroupMin} />
						<TextInput label="Максимум" name="group-max" bind:value={newGroupMax} />
					</div>
					<div class="flex gap-2">
						<Button type="button" onclick={submitGroup} disabled={!newGroupName.trim()}>
							Сохранить группу
						</Button>
						<Button type="button" variant="outline" onclick={resetGroupForm}>Отмена</Button>
					</div>
				</div>
			{/if}

			{#if group.options.length > 0}
				<ul class="mt-3 space-y-2">
					{#each group.options as option (option.id)}
						<li class="rounded-md bg-[var(--color-bg-elevated)] px-3 py-2">
							{#if editingOptionId === option.id && activeOptionGroupId === group.id}
								<div class="flex flex-col gap-2 sm:flex-row">
									<div class="flex-1">
										<TextInput label="Название" name="option-name" bind:value={newOptionName} />
									</div>
									<div class="w-full sm:w-28">
										<TextInput label="Цена" name="option-price" bind:value={newOptionPrice} />
									</div>
								</div>
								<div class="mt-2 flex gap-2">
									<Button type="button" onclick={() => submitOption(group.id)} disabled={!newOptionName.trim()}>
										Сохранить
									</Button>
									<Button type="button" variant="outline" onclick={resetOptionForm}>Отмена</Button>
								</div>
							{:else}
								<div class="flex items-center justify-between gap-2">
									<div>
										<span class="text-sm text-[var(--color-text)]">{option.name}</span>
										<span class="ml-2 text-sm text-[var(--color-text-secondary)]">+{option.price}</span>
									</div>
									<div class="flex items-center gap-1">
										<button
											type="button"
											class="rounded p-1 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)]"
											aria-label="Редактировать опцию {option.name}"
											onclick={() => startEditOption(group.id, option)}
										>
											<Pencil class="h-4 w-4" aria-hidden="true" />
										</button>
										<button
											type="button"
											class="rounded p-1 text-[var(--color-text-secondary)] hover:text-[var(--color-error)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)]"
											aria-label="Удалить опцию {option.name}"
											onclick={() => onDeleteOption(option.id)}
										>
											<Trash2 class="h-4 w-4" aria-hidden="true" />
										</button>
									</div>
								</div>
							{/if}
						</li>
					{/each}
				</ul>
			{/if}

			{#if editingOptionId === null || activeOptionGroupId !== group.id}
				<div class="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
					<div class="flex-1">
						<TextInput label="Новая опция" name="new-option-name-{group.id}" placeholder="Новая опция" bind:value={newOptionName} />
					</div>
					<div class="w-full sm:w-28">
						<TextInput label="Цена" name="new-option-price-{group.id}" placeholder="Цена" bind:value={newOptionPrice} />
					</div>
					<Button type="button" onclick={() => submitOption(group.id)} disabled={!newOptionName.trim()}>
						<Plus class="h-4 w-4" aria-hidden="true" />
					</Button>
				</div>
			{/if}
		</div>
	{/each}

	{#if editingGroupId === null}
		<div class="rounded-lg border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface)] p-4">
			<div class="space-y-3">
				<TextInput label="Название новой группы" name="new-group-name" bind:value={newGroupName} />
				<label class="flex items-center gap-2 text-sm text-[var(--color-text)]">
					<input type="checkbox" bind:checked={newGroupRequired} class="h-4 w-4 accent-[var(--color-primary)]" />
					Обязательная группа
				</label>
				<div class="grid gap-3 sm:grid-cols-2">
					<TextInput label="Минимум" name="new-group-min" bind:value={newGroupMin} />
					<TextInput label="Максимум" name="new-group-max" bind:value={newGroupMax} />
				</div>
				<Button type="button" onclick={submitGroup} disabled={!newGroupName.trim()}>
					<Plus class="h-4 w-4" aria-hidden="true" />
					Добавить группу
				</Button>
			</div>
		</div>
	{/if}
</div>
