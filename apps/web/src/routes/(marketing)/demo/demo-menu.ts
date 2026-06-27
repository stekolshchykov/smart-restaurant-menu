import type { CategoryWithItems, MenuItem } from '@digital-menu/api-client';

const now = new Date().toISOString();

export const demoProject = {
	id: 'demo-project',
	slug: 'demo',
	name: 'Bistro Demo',
	type: 'restaurant',
	description: 'Демонстрационное меню цифрового сервиса Digital Menu.',
	locale: 'ru',
	currency: '€',
	mode: 'menu_order' as const,
	status: 'published' as const,
};

const makeItem = (overrides: Partial<MenuItem> & { id: string; name: string; price: string }): MenuItem => ({
	id: overrides.id,
	categoryId: overrides.categoryId ?? '',
	name: overrides.name,
	shortDescription: overrides.shortDescription ?? null,
	description: overrides.description ?? null,
	price: overrides.price,
	imageUrl: overrides.imageUrl ?? null,
	images: overrides.images ?? [],
	ingredients: overrides.ingredients ?? [],
	status: overrides.status ?? 'available',
	quickAdd: overrides.quickAdd ?? true,
	sortOrder: overrides.sortOrder ?? 0,
	allergens: overrides.allergens ?? [],
	tags: overrides.tags ?? [],
	modifierGroups: overrides.modifierGroups ?? [],
	createdAt: now,
	updatedAt: now,
});

export const demoCategories: CategoryWithItems[] = [
	{
		id: 'cat-starters',
		projectId: 'demo-project',
		name: 'Закуски',
		sortOrder: 0,
		createdAt: now,
		updatedAt: now,
		items: [
			makeItem({
				id: 'item-1',
				categoryId: 'cat-starters',
				name: 'Тартар из лосося',
				shortDescription: 'Свежий лосось, авокадо, лайм и тосты из бриоши.',
				description:
					'Нежный тартар из свежего лосося с кубиками авокадо, соком лайма и лёгкой заправкой. Подаётся с хрустящими тостами из бриоши.',
				price: '14.50',
				ingredients: ['лосось', 'авокадо', 'лайм', 'бриошь'],
				allergens: [{ id: 'a1', projectId: 'demo-project', name: 'Рыба', createdAt: now, updatedAt: now }],
				tags: [{ id: 't1', projectId: 'demo-project', name: 'Популярное', createdAt: now, updatedAt: now }],
			}),
			makeItem({
				id: 'item-2',
				categoryId: 'cat-starters',
				name: 'Капрезе',
				shortDescription: 'Моцарелла буффало, томаты, базилик и бальзамик.',
				price: '10.00',
				ingredients: ['моцарелла', 'томаты', 'базилик', 'бальзамик'],
			}),
		],
	},
	{
		id: 'cat-mains',
		projectId: 'demo-project',
		name: 'Основные',
		sortOrder: 1,
		createdAt: now,
		updatedAt: now,
		items: [
			makeItem({
				id: 'item-3',
				categoryId: 'cat-mains',
				name: 'Стейк рибай',
				shortDescription: 'Говяжий рибай, картофельное пюре и овощи гриль.',
				description:
					'Сочный рибай из мраморной говядины, приготовленный на гриле до нужной степени прожарки. Подаётся с нежным картофельным пюре и сезонными овощами гриль.',
				price: '28.00',
				ingredients: ['говядина', 'картофель', 'овощи', 'масло'],
				modifierGroups: [
					{
						id: 'mg-1',
						itemId: 'item-3',
						name: 'Степень прожарки',
						required: true,
						minOptions: 1,
						maxOptions: 1,
						sortOrder: 0,
						createdAt: now,
						updatedAt: now,
						options: [
							{ id: 'opt-1', groupId: 'mg-1', name: 'Medium rare', price: '0.00', sortOrder: 0, createdAt: now, updatedAt: now },
							{ id: 'opt-2', groupId: 'mg-1', name: 'Medium', price: '0.00', sortOrder: 1, createdAt: now, updatedAt: now },
							{ id: 'opt-3', groupId: 'mg-1', name: 'Well done', price: '0.00', sortOrder: 2, createdAt: now, updatedAt: now },
						],
					},
				],
			}),
			makeItem({
				id: 'item-4',
				categoryId: 'cat-mains',
				name: 'Паста карбонара',
				shortDescription: 'Спагетти, гуанчиале, яйцо и пармезан.',
				price: '16.50',
				ingredients: ['спагетти', 'гуанчиале', 'яйцо', 'пармезан'],
			}),
		],
	},
	{
		id: 'cat-drinks',
		projectId: 'demo-project',
		name: 'Напитки',
		sortOrder: 2,
		createdAt: now,
		updatedAt: now,
		items: [
			makeItem({
				id: 'item-5',
				categoryId: 'cat-drinks',
				name: 'Домашний лимонад',
				shortDescription: 'Свежие лимоны, мята, имбирь и газированная вода.',
				price: '5.50',
			}),
			makeItem({
				id: 'item-6',
				categoryId: 'cat-drinks',
				name: 'Эспрессо',
				shortDescription: 'Крепкий итальянский эспрессо.',
				price: '3.00',
			}),
		],
	},
];
