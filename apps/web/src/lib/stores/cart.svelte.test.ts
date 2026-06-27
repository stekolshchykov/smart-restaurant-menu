import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { cart, type LocalCartItem } from './cart.svelte';
import type { MenuItem, ModifierOption } from '@digital-menu/api-client';

function createMenuItem(overrides: Partial<MenuItem> = {}): MenuItem {
	return {
		id: 'item-1',
		categoryId: 'cat-1',
		name: 'Burger',
		shortDescription: null,
		description: null,
		price: '12.50',
		imageUrl: null,
		images: [],
		ingredients: [],
		status: 'available',
		quickAdd: true,
		sortOrder: 0,
		allergens: [],
		tags: [],
		modifierGroups: [],
		createdAt: '2024-01-01T00:00:00Z',
		updatedAt: '2024-01-01T00:00:00Z',
		...overrides,
	};
}

function createModifier(overrides: Partial<ModifierOption> = {}): ModifierOption {
	return {
		id: 'mod-1',
		groupId: 'group-1',
		name: 'Cheese',
		price: '1.50',
		sortOrder: 0,
		createdAt: '2024-01-01T00:00:00Z',
		updatedAt: '2024-01-01T00:00:00Z',
		...overrides,
	};
}

describe('cart store', () => {
	beforeEach(() => {
		localStorage.clear();
		cart.initForToken('');
		cart.clearCart();
	});

	afterEach(() => {
		localStorage.clear();
	});

	it('starts empty', () => {
		expect(cart.items).toHaveLength(0);
		expect(cart.count).toBe(0);
		expect(cart.totalFor('€')).toBe('€0.00');
	});

	it('adds an item with quickAdd', () => {
		const item = createMenuItem();
		cart.quickAdd(item);

		expect(cart.items).toHaveLength(1);
		expect(cart.count).toBe(1);
		expect(cart.items[0].name).toBe('Burger');
		expect(cart.totalFor('€')).toBe('€12.50');
	});

	it('increases quantity when adding the same item again', () => {
		const item = createMenuItem();
		cart.quickAdd(item);
		cart.quickAdd(item);

		expect(cart.items).toHaveLength(1);
		expect(cart.count).toBe(2);
		expect(cart.totalFor('€')).toBe('€25.00');
	});

	it('adds modifiers and notes as separate line items', () => {
		const item = createMenuItem();
		const modifier = createModifier();
		cart.addItem(item, 1, { 'group-1': modifier }, 'No onions');

		expect(cart.items).toHaveLength(1);
		expect(cart.items[0].modifiers).toHaveLength(1);
		expect(cart.items[0].note).toBe('No onions');
		expect(cart.totalFor('€')).toBe('€14.00');
	});

	it('updates quantity and removes item at zero', () => {
		const item = createMenuItem();
		cart.quickAdd(item);
		const localId = cart.items[0].localId;

		cart.updateQuantity(localId, 3);
		expect(cart.count).toBe(3);

		cart.updateQuantity(localId, 0);
		expect(cart.items).toHaveLength(0);
		expect(cart.count).toBe(0);
	});

	it('removes an item by localId', () => {
		const item = createMenuItem({ id: 'item-2', name: 'Fries', price: '4.00' });
		cart.quickAdd(item);
		const localId = cart.items[0].localId;

		cart.removeItem(localId);

		expect(cart.items).toHaveLength(0);
		expect(cart.count).toBe(0);
	});

	it('clears the cart', () => {
		cart.quickAdd(createMenuItem());
		cart.quickAdd(createMenuItem({ id: 'item-3', name: 'Soda', price: '2.00' }));

		cart.clearCart();

		expect(cart.items).toHaveLength(0);
		expect(cart.count).toBe(0);
	});

	it('persists cart to localStorage when a token is active', () => {
		cart.initForToken('table-abc');
		cart.quickAdd(createMenuItem());

		const stored = localStorage.getItem('dm_cart_table-abc');
		expect(stored).toBeTruthy();

		const parsed: LocalCartItem[] = JSON.parse(stored!);
		expect(parsed).toHaveLength(1);
		expect(parsed[0].name).toBe('Burger');
	});

	it('loads persisted cart for a token', () => {
		const stored: LocalCartItem[] = [
			{
				localId: 'test-id',
				menuItemId: 'item-1',
				name: 'Loaded Burger',
				basePrice: '15.00',
				quantity: 2,
				modifiers: [],
				note: '',
			},
		];
		localStorage.setItem('dm_cart_table-xyz', JSON.stringify(stored));

		cart.initForToken('table-xyz');

		expect(cart.items).toHaveLength(1);
		expect(cart.count).toBe(2);
		expect(cart.totalFor('$')).toBe('$30.00');
	});
});
