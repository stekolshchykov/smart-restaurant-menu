<script lang="ts">
	import { Save, Trash2, Plus } from '@lucide/svelte';
	import type {
		Allergen,
		AvailabilityStatus,
		CreateModifierGroupRequest,
		CreateModifierOptionRequest,
		MenuItem,
		Tag,
		UpdateMenuItemRequest,
		UpdateModifierGroupRequest,
		UpdateModifierOptionRequest,
	} from '@digital-menu/api-client';
	import Button from '$lib/components/Button.svelte';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import Select from '$lib/components/forms/Select.svelte';
	import ImageUpload from './ImageUpload.svelte';
	import ModifierGroupEditor from './ModifierGroupEditor.svelte';

	interface Props {
		item: MenuItem;
		allergens: Allergen[];
		tags: Tag[];
		loading?: boolean;
		onUpdate: (id: string, body: UpdateMenuItemRequest) => void;
		onDelete: (id: string) => void;
		onCreateModifierGroup: (itemId: string, body: CreateModifierGroupRequest) => void;
		onUpdateModifierGroup: (id: string, body: UpdateModifierGroupRequest) => void;
		onDeleteModifierGroup: (id: string) => void;
		onCreateModifierOption: (groupId: string, body: CreateModifierOptionRequest) => void;
		onUpdateModifierOption: (id: string, body: UpdateModifierOptionRequest) => void;
		onDeleteModifierOption: (id: string) => void;
	}

	let {
		item,
		allergens,
		tags,
		loading = false,
		onUpdate,
		onDelete,
		onCreateModifierGroup,
		onUpdateModifierGroup,
		onDeleteModifierGroup,
		onCreateModifierOption,
		onUpdateModifierOption,
		onDeleteModifierOption,
	}: Props = $props();

	let name = $state('');
	let shortDescription = $state('');
	let description = $state('');
	let price = $state('');
	let imageUrl = $state('');
	let images = $state<string[]>([]);
	let ingredients = $state('');
	let status = $state<AvailabilityStatus>('available');
	let quickAdd = $state(false);
	let sortOrder = $state('0');
	let selectedAllergenIds = $state(new Set<string>());
	let selectedTagIds = $state(new Set<string>());

	let newImageUrl = $state('');

	$effect(() => {
		name = item.name;
		shortDescription = item.shortDescription ?? '';
		description = item.description ?? '';
		price = item.price;
		imageUrl = item.imageUrl ?? '';
		images = [...(item.images ?? [])];
		ingredients = (item.ingredients ?? []).join(', ');
		status = item.status;
		quickAdd = item.quickAdd;
		sortOrder = String(item.sortOrder);
		selectedAllergenIds = new Set(item.allergens.map((a) => a.id));
		selectedTagIds = new Set(item.tags.map((t) => t.id));
	});

	const statusOptions = [
		{ value: 'available', label: 'Доступно' },
		{ value: 'unavailable', label: 'Недоступно' },
		{ value: 'hidden', label: 'Скрыто' },
	];

	function handleImageUpload(url: string) {
		imageUrl = url;
	}

	function addImageUrl() {
		const url = newImageUrl.trim();
		if (url && !images.includes(url)) {
			images = [...images, url];
			newImageUrl = '';
		}
	}

	function removeImage(url: string) {
		images = images.filter((i) => i !== url);
	}

	function toggleAllergen(id: string) {
		const next = new Set(selectedAllergenIds);
		if (next.has(id)) {
			next.delete(id);
		} else {
			next.add(id);
		}
		selectedAllergenIds = next;
	}

	function toggleTag(id: string) {
		const next = new Set(selectedTagIds);
		if (next.has(id)) {
			next.delete(id);
		} else {
			next.add(id);
		}
		selectedTagIds = next;
	}

	function handleSubmit(event: Event) {
		event.preventDefault();
		onUpdate(item.id, {
			name: name.trim(),
			shortDescription: shortDescription.trim() || null,
			description: description.trim() || null,
			price: price.trim(),
			imageUrl: imageUrl.trim() || null,
			images,
			ingredients: ingredients
				.split(',')
				.map((i) => i.trim())
				.filter(Boolean),
			status,
			quickAdd,
			sortOrder: Number(sortOrder) || 0,
			allergenIds: Array.from(selectedAllergenIds),
			tagIds: Array.from(selectedTagIds),
		});
	}
</script>

<form onsubmit={handleSubmit} class="space-y-6">
	<div class="flex items-center justify-between gap-2">
		<h2 class="text-lg font-semibold text-[var(--color-heading)]">{item.name}</h2>
		<button
			type="button"
			class="rounded p-1 text-[var(--color-text-secondary)] hover:text-[var(--color-error)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)]"
			aria-label="Удалить блюдо"
			onclick={() => onDelete(item.id)}
		>
			<Trash2 class="h-4 w-4" aria-hidden="true" />
		</button>
	</div>

	<div class="space-y-4">
		<TextInput label="Название" name="name" bind:value={name} required />
		<TextInput label="Короткое описание" name="shortDescription" bind:value={shortDescription} />
		<div class="flex flex-col gap-1.5">
			<label for="description" class="text-sm font-medium text-[var(--color-text)]">Описание</label>
			<textarea
				id="description"
				name="description"
				rows="3"
				class="w-full rounded-md border border-[var(--color-border-on-surface)] bg-[var(--color-surface)] px-4 py-2.5 text-[var(--color-text-on-surface)] placeholder:text-[var(--color-text-on-surface-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]"
				bind:value={description}
			></textarea>
		</div>
		<div class="grid gap-4 sm:grid-cols-2">
			<TextInput label="Цена" name="price" bind:value={price} required />
			<TextInput label="Порядок сортировки" name="sortOrder" bind:value={sortOrder} />
		</div>

		<Select label="Доступность" name="status" options={statusOptions} bind:value={status} />

		<label class="flex items-center justify-between rounded-md border border-[var(--color-border)] px-4 py-3">
			<span class="text-sm text-[var(--color-text)]">Быстрое добавление в корзину</span>
			<input type="checkbox" bind:checked={quickAdd} class="h-5 w-5 accent-[var(--color-primary)]" />
		</label>

		<ImageUpload url={imageUrl} onUpload={handleImageUpload} />

		<div class="space-y-2">
			<span class="text-sm font-medium text-[var(--color-text)]">Дополнительные изображения</span>
			{#if images.length > 0}
				<ul class="space-y-2">
					{#each images as image (image)}
						<li class="flex items-center gap-2">
							<img src={image} alt="" class="h-12 w-12 rounded object-cover" />
							<span class="flex-1 truncate text-xs text-[var(--color-text-secondary)]">{image}</span>
							<button
								type="button"
								class="rounded p-1 text-[var(--color-text-secondary)] hover:text-[var(--color-error)]"
								onclick={() => removeImage(image)}
							>
								<Trash2 class="h-4 w-4" aria-hidden="true" />
							</button>
						</li>
					{/each}
				</ul>
			{/if}
			<div class="flex gap-2">
				<div class="flex-1">
					<TextInput label="URL изображения" name="new-image" placeholder="URL изображения" bind:value={newImageUrl} />
				</div>
				<Button type="button" onclick={addImageUrl} disabled={!newImageUrl.trim()}>
					<Plus class="h-4 w-4" aria-hidden="true" />
				</Button>
			</div>
		</div>

		<TextInput label="Ингредиенты (через запятую)" name="ingredients" bind:value={ingredients} />

		{#if allergens.length > 0}
			<div class="space-y-2">
				<span class="text-sm font-medium text-[var(--color-text)]">Аллергены</span>
				<div class="flex flex-wrap gap-2">
					{#each allergens as allergen (allergen.id)}
						<label class="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] px-3 py-1.5 text-sm text-[var(--color-text)]">
							<input
								type="checkbox"
								checked={selectedAllergenIds.has(allergen.id)}
								class="h-4 w-4 accent-[var(--color-primary)]"
								onchange={() => toggleAllergen(allergen.id)}
							/>
							{allergen.name}
						</label>
					{/each}
				</div>
			</div>
		{/if}

		{#if tags.length > 0}
			<div class="space-y-2">
				<span class="text-sm font-medium text-[var(--color-text)]">Теги</span>
				<div class="flex flex-wrap gap-2">
					{#each tags as tag (tag.id)}
						<label class="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] px-3 py-1.5 text-sm text-[var(--color-text)]">
							<input
								type="checkbox"
								checked={selectedTagIds.has(tag.id)}
								class="h-4 w-4 accent-[var(--color-primary)]"
								onchange={() => toggleTag(tag.id)}
							/>
							{tag.name}
						</label>
					{/each}
				</div>
			</div>
		{/if}
	</div>

	<Button type="submit" disabled={loading || !name.trim() || !price.trim()}>
		<Save class="h-4 w-4" aria-hidden="true" />
		{loading ? 'Сохранение…' : 'Сохранить блюдо'}
	</Button>

	<ModifierGroupEditor
		groups={item.modifierGroups}
		onCreateGroup={(body) => onCreateModifierGroup(item.id, body)}
		onUpdateGroup={onUpdateModifierGroup}
		onDeleteGroup={onDeleteModifierGroup}
		onCreateOption={onCreateModifierOption}
		onUpdateOption={onUpdateModifierOption}
		onDeleteOption={onDeleteModifierOption}
	/>
</form>
