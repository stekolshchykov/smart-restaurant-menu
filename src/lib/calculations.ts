import type { Order, OrderLineItem } from '../types.ts'

export function calculateItemPrice(
  basePrice: number,
  addons: { price: number; quantity: number }[],
  quantity: number
): number {
  const addonsTotal = addons.reduce(
    (sum, addon) => sum + addon.price * addon.quantity,
    0
  )
  return roundToTwo((basePrice + addonsTotal) * quantity)
}

export function calculateOrderTotal(
  items: {
    basePrice: number
    addons: { price: number; quantity: number }[]
    quantity: number
  }[]
): number {
  const total = items.reduce(
    (sum, item) =>
      sum + calculateItemPrice(item.basePrice, item.addons, item.quantity),
    0
  )
  return roundToTwo(total)
}

export function lineItemTotal(item: OrderLineItem): number {
  const addonsTotal = item.addons.reduce(
    (sum, addon) => sum + addon.price * addon.quantity,
    0
  )
  return roundToTwo((item.basePrice + addonsTotal) * item.quantity)
}

export function orderTotal(order: Order): number {
  return roundToTwo(order.items.reduce((sum, item) => sum + lineItemTotal(item), 0))
}

export function cartItemCount(order: Order): number {
  return order.items.reduce((sum, item) => sum + item.quantity, 0)
}

function roundToTwo(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}
