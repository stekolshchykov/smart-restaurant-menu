import type { MenuItem, ModifierOption } from '@digital-menu/api-client';

export interface LocalCartModifier {
	optionId: string;
	name: string;
	price: string;
}

export interface LocalCartItem {
	localId: string;
	menuItemId: string;
	name: string;
	basePrice: string;
	quantity: number;
	modifiers: LocalCartModifier[];
	note: string;
}

function lineItemKey(menuItemId: string, modifiers: LocalCartModifier[], note: string): string {
	const modifierPart = modifiers
		.map((m) => `${m.optionId}:${m.name}`)
		.sort()
		.join('|');
	const normalizedNote = note.trim();
	return `${menuItemId}:${modifierPart || 'default'}:${normalizedNote || 'none'}`;
}

function parsePrice(price: string): number {
	return Number.parseFloat(price);
}

export function getLineTotal(item: LocalCartItem): number {
	const modifiersTotal = item.modifiers.reduce((sum, mod) => sum + parsePrice(mod.price), 0);
	return (parsePrice(item.basePrice) + modifiersTotal) * item.quantity;
}

export function getItemsTotal(items: LocalCartItem[]): number {
	return items.reduce((sum, item) => sum + getLineTotal(item), 0);
}

export function formatMoney(value: string | number, currency = '€'): string {
	return `${currency}${Number.parseFloat(String(value)).toFixed(2)}`;
}

function readStoredCart(token: string): LocalCartItem[] {
	if (typeof localStorage === 'undefined') return [];
	try {
		const raw = localStorage.getItem(`dm_cart_${token}`);
		return raw ? (JSON.parse(raw) as LocalCartItem[]) : [];
	} catch {
		return [];
	}
}

function saveStoredCart(token: string, items: LocalCartItem[]) {
	if (typeof localStorage === 'undefined') return;
	try {
		localStorage.setItem(`dm_cart_${token}`, JSON.stringify(items));
	} catch {
		// Ignore storage errors.
	}
}

function createCartStore() {
	let items = $state<LocalCartItem[]>([]);
	let activeToken = $state<string>('');

	const count = $derived(items.reduce((sum, item) => sum + item.quantity, 0));

	function totalFor(currency = '€'): string {
		return formatMoney(getItemsTotal(items), currency);
	}

	function initForToken(token: string) {
		activeToken = token;
		items = readStoredCart(token);
	}

	function addItem(
		menuItem: MenuItem,
		quantity: number,
		selectedModifiers: Record<string, ModifierOption>,
		note = '',
	) {
		const modifiers: LocalCartModifier[] = Object.values(selectedModifiers).map((option) => ({
			optionId: option.id,
			name: option.name,
			price: option.price,
		}));

		const key = lineItemKey(menuItem.id, modifiers, note);
		const existingIndex = items.findIndex((item) => item.localId === key);

		if (existingIndex >= 0) {
			const updated = [...items];
			updated[existingIndex] = {
				...updated[existingIndex],
				quantity: updated[existingIndex].quantity + quantity,
			};
			items = updated;
		} else {
			items = [
				...items,
				{
					localId: key,
					menuItemId: menuItem.id,
					name: menuItem.name,
					basePrice: menuItem.price,
					quantity,
					modifiers,
					note: note.trim(),
				},
			];
		}

		if (activeToken) {
			saveStoredCart(activeToken, items);
		}
	}

	function quickAdd(menuItem: MenuItem) {
		addItem(menuItem, 1, {});
	}

	function removeItem(localId: string) {
		items = items.filter((item) => item.localId !== localId);
		if (activeToken) {
			saveStoredCart(activeToken, items);
		}
	}

	function updateQuantity(localId: string, quantity: number) {
		if (quantity <= 0) {
			removeItem(localId);
			return;
		}
		items = items.map((item) => (item.localId === localId ? { ...item, quantity } : item));
		if (activeToken) {
			saveStoredCart(activeToken, items);
		}
	}

	function clearCart() {
		items = [];
		if (activeToken) {
			saveStoredCart(activeToken, []);
		}
	}

	function updateNote(localId: string, note: string) {
		items = items.map((item) => (item.localId === localId ? { ...item, note } : item));
		if (activeToken) {
			saveStoredCart(activeToken, items);
		}
	}

	return {
		get items() {
			return items;
		},
		get count() {
			return count;
		},
		totalFor,
		initForToken,
		addItem,
		quickAdd,
		removeItem,
		updateQuantity,
		updateNote,
		clearCart,
	};
}

export const cart = createCartStore();
