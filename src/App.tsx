import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { MenuData, MenuItem, Order, OrderAddon, Screen } from './types.ts'
import fallbackMenu from './data/menu.json'
import { LoadingScreen } from './components/layout/LoadingScreen.tsx'
import { FloatingCartButton } from './components/layout/FloatingCartButton.tsx'
import { KioskProvider } from './components/layout/KioskProvider.tsx'
import { ToastProvider } from './components/layout/ToastProvider.tsx'
import { MenuScreen } from './screens/MenuScreen.tsx'
import { DetailScreen } from './screens/DetailScreen.tsx'
import { CartScreen } from './screens/CartScreen.tsx'
import { WaitingScreen } from './screens/WaitingScreen.tsx'
import { cartItemCount, orderTotal } from './lib/calculations.ts'
import { Stack } from './components/ui/Stack.tsx'

const CART_KEY = 'digital-menu-cart'

const emptyOrder = (): Order => ({
  id: '',
  items: [],
  createdAt: new Date().toISOString(),
})

const generateOrderId = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

const lineItemId = (menuItemId: string, addons: OrderAddon[]): string => {
  const addonPart = addons
    .filter((a) => a.quantity > 0)
    .map((a) => `${a.id}:${a.quantity}`)
    .sort()
    .join('|')
  return `${menuItemId}:${addonPart || 'default'}:${Date.now().toString(36)}`
}

const pageTransition = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
  transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] as const },
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('menu')
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [order, setOrder] = useState<Order>(() => {
    try {
      const saved = localStorage.getItem(CART_KEY)
      return saved ? (JSON.parse(saved) as Order) : emptyOrder()
    } catch {
      return emptyOrder()
    }
  })
  const [orderNumber, setOrderNumber] = useState<string | null>(null)
  const [menu, setMenu] = useState<MenuData | null>(null)
  const [loading, setLoading] = useState(true)
  const didRestoreScreen = useRef(false)

  useEffect(() => {
    if (didRestoreScreen.current) return
    didRestoreScreen.current = true

    const hash = window.location.hash.replace(/^#\/?/, '')
    const validScreens: Screen[] = ['menu', 'detail', 'cart', 'waiting']
    if (!validScreens.includes(hash as Screen)) return

    const restored = hash as Screen
    if (restored === 'detail' && !selectedItem) return
    if (restored === 'cart' && order.items.length === 0) return
    if (restored === 'waiting' && !order.id) return

    setScreen(restored)
    if (restored === 'waiting' && order.id) {
      setOrderNumber(order.id)
    }
  }, [order.id, order.items.length, selectedItem])

  useEffect(() => {
    fetch('menu.json')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load menu')
        return res.json() as Promise<MenuData>
      })
      .then((data) => setMenu(data))
      .catch(() => setMenu(fallbackMenu as MenuData))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(order))
    } catch {
      // Ignore private-mode / quota errors; the cart simply won't persist.
    }
  }, [order])

  useEffect(() => {
    const nextHash = screen === 'menu' ? '' : `#/${screen}`
    if (window.location.hash !== nextHash) {
      window.location.hash = nextHash
    }
  }, [screen])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
    const main = document.getElementById('main-content')
    if (main) {
      main.focus({ preventScroll: true })
    }
  }, [screen])

  const openDetail = useCallback((item: MenuItem) => {
    setSelectedItem(item)
    setScreen('detail')
  }, [])

  const addToOrder = useCallback(
    (item: MenuItem, quantity: number, selectedAddons: Record<string, number>) => {
      const addons: OrderAddon[] = item.addons
        .filter((addon) => (selectedAddons[addon.id] || 0) > 0)
        .map((addon) => ({ ...addon, quantity: selectedAddons[addon.id] }))

      const newItem: Order['items'][number] = {
        id: lineItemId(item.id, addons),
        menuItemId: item.id,
        name: item.name,
        basePrice: item.price,
        addons,
        quantity,
      }

      setOrder((prev) => ({
        ...prev,
        items: [...prev.items, newItem],
        createdAt: new Date().toISOString(),
      }))
      setScreen('menu')
    },
    [],
  )

  const quickAddToOrder = useCallback((item: MenuItem) => {
    if (item.addons.length > 0) {
      setSelectedItem(item)
      setScreen('detail')
      return
    }

    const newItem: Order['items'][number] = {
      id: lineItemId(item.id, []),
      menuItemId: item.id,
      name: item.name,
      basePrice: item.price,
      addons: [],
      quantity: 1,
    }

    setOrder((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
      createdAt: new Date().toISOString(),
    }))
  }, [])

  const removeFromOrder = useCallback((lineItemId: string) => {
    setOrder((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== lineItemId),
    }))
  }, [])

  const placeOrder = useCallback(() => {
    const id = generateOrderId()
    setOrder((prev) => ({ ...prev, id, createdAt: new Date().toISOString() }))
    setOrderNumber(id)
    setScreen('waiting')
  }, [])

  const backToMenu = useCallback(() => {
    setScreen('menu')
  }, [])

  const startNewOrder = useCallback(() => {
    setOrder(emptyOrder())
    setOrderNumber(null)
    setScreen('menu')
  }, [])

  if (loading || !menu) {
    return <LoadingScreen />
  }

  const adminActions = {
    onResetOrder: startNewOrder,
    onBackToSetup: startNewOrder,
  }

  return (
    <ToastProvider>
      <KioskProvider adminActions={adminActions}>
        <Stack gap={0} className="relative flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {screen === 'menu' && (
            <motion.div key="menu" {...pageTransition} className="min-h-svh">
              <MenuScreen
                menu={menu}
                onItemClick={openDetail}
                onQuickAdd={quickAddToOrder}
              />
            </motion.div>
          )}

        {screen === 'detail' && selectedItem && (
          <motion.div key="detail" {...pageTransition} className="min-h-svh">
            <DetailScreen
              item={selectedItem}
              menu={menu}
              onAddToOrder={addToOrder}
              onBack={backToMenu}
            />
          </motion.div>
        )}

        {screen === 'cart' && (
          <motion.div key="cart" {...pageTransition} className="min-h-svh">
            <CartScreen
              order={order}
              onRemoveItem={removeFromOrder}
              onPlaceOrder={placeOrder}
              onBackToMenu={backToMenu}
            />
          </motion.div>
        )}

        {screen === 'waiting' && orderNumber && (
          <motion.div key="waiting" {...pageTransition} className="min-h-svh">
            <WaitingScreen
              order={order}
              onBackToMenu={backToMenu}
              onStartNewOrder={startNewOrder}
            />
          </motion.div>
        )}
      </AnimatePresence>

        <FloatingCartButton
          itemCount={cartItemCount(order)}
          total={orderTotal(order)}
          onClick={() => setScreen('cart')}
          hidden={screen === 'cart' || screen === 'waiting' || screen === 'detail'}
        />
      </Stack>
      </KioskProvider>
    </ToastProvider>
  )
}
