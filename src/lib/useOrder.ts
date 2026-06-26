import { useCallback, useEffect, useState } from 'react'
import type { MenuItem, Order, OrderAddon } from '../types.ts'
import { lineItemKey } from './lineItemKey.ts'

const CART_KEY = 'digital-menu-cart'

const emptyOrder = (): Order => ({
  id: '',
  items: [],
  createdAt: new Date().toISOString(),
})

export function useOrder() {
  const [order, setOrder] = useState<Order>(() => {
    try {
      const saved = localStorage.getItem(CART_KEY)
      return saved ? (JSON.parse(saved) as Order) : emptyOrder()
    } catch {
      return emptyOrder()
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(order))
    } catch {
      // Ignore private-mode / quota errors; the cart simply won't persist.
    }
  }, [order])

  const addToOrder = useCallback(
    (item: MenuItem, quantity: number, selectedAddons: Record<string, number>, note = '') => {
      const addons: OrderAddon[] = item.addons
        .filter((addon) => (selectedAddons[addon.id] || 0) > 0)
        .map((addon) => ({ ...addon, quantity: selectedAddons[addon.id] }))

      const trimmedNote = note.trim()
      const id = lineItemKey(item.id, addons, trimmedNote)

      setOrder((prev) => {
        const existingIndex = prev.items.findIndex((i) => i.id === id)
        if (existingIndex >= 0) {
          const updated = [...prev.items]
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + quantity,
          }
          return { ...prev, items: updated, createdAt: new Date().toISOString() }
        }
        return {
          ...prev,
          items: [
            ...prev.items,
            {
              id,
              menuItemId: item.id,
              name: item.name,
              basePrice: item.price,
              addons,
              quantity,
              note: trimmedNote || undefined,
            },
          ],
          createdAt: new Date().toISOString(),
        }
      })
    },
    [],
  )

  const quickAddToOrder = useCallback((item: MenuItem) => {
    const id = lineItemKey(item.id, [])

    setOrder((prev) => {
      const existingIndex = prev.items.findIndex((i) => i.id === id)
      if (existingIndex >= 0) {
        const updated = [...prev.items]
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
        }
        return { ...prev, items: updated, createdAt: new Date().toISOString() }
      }
      return {
        ...prev,
        items: [
          ...prev.items,
          {
            id,
            menuItemId: item.id,
            name: item.name,
            basePrice: item.price,
            addons: [],
            quantity: 1,
          },
        ],
        createdAt: new Date().toISOString(),
      }
    })
  }, [])

  const removeFromOrder = useCallback((lineItemId: string) => {
    setOrder((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== lineItemId),
    }))
  }, [])

  const updateOrderItemQuantity = useCallback(
    (lineItemId: string, quantity: number) => {
      setOrder((prev) => ({
        ...prev,
        items:
          quantity <= 0
            ? prev.items.filter((item) => item.id !== lineItemId)
            : prev.items.map((item) =>
                item.id === lineItemId ? { ...item, quantity } : item,
              ),
        createdAt: new Date().toISOString(),
      }))
    },
    [],
  )

  const updateLineItemNote = useCallback(
    (lineItemId: string, note: string) => {
      setOrder((prev) => {
        const item = prev.items.find((i) => i.id === lineItemId)
        if (!item) return prev

        const trimmed = note.trim()
        const newId = lineItemKey(item.menuItemId, item.addons, trimmed)
        const existingIndex = prev.items.findIndex(
          (i) => i.id === newId && i.id !== lineItemId,
        )

        if (existingIndex >= 0) {
          const merged = [...prev.items]
          merged[existingIndex] = {
            ...merged[existingIndex],
            quantity: merged[existingIndex].quantity + item.quantity,
          }
          return {
            ...prev,
            items: merged.filter((i) => i.id !== lineItemId),
            createdAt: new Date().toISOString(),
          }
        }

        return {
          ...prev,
          items: prev.items.map((i) =>
            i.id === lineItemId ? { ...i, note: trimmed || undefined, id: newId } : i,
          ),
          createdAt: new Date().toISOString(),
        }
      })
    },
    [],
  )

  const placeOrder = useCallback(() => {
    const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
    setOrder((prev) => ({ ...prev, id, createdAt: new Date().toISOString() }))
    return id
  }, [])

  const resetOrder = useCallback(() => {
    setOrder(emptyOrder())
  }, [])

  return {
    order,
    addToOrder,
    quickAddToOrder,
    removeFromOrder,
    updateOrderItemQuantity,
    updateLineItemNote,
    placeOrder,
    resetOrder,
  }
}
