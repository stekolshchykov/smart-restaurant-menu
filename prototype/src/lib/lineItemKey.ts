import type { OrderAddon } from '../types.ts'

export function lineItemKey(
  menuItemId: string,
  addons: Pick<OrderAddon, 'id' | 'quantity'>[],
  note?: string,
): string {
  const addonPart = addons
    .filter((a) => a.quantity > 0)
    .map((a) => `${a.id}:${a.quantity}`)
    .sort()
    .join('|')
  const normalizedNote = (note ?? '').trim()
  return `${menuItemId}:${addonPart || 'default'}:${normalizedNote || 'none'}`
}
