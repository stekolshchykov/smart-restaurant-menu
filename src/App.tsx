import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import type { MenuData, MenuItem, Screen } from './types.ts'
import fallbackMenu from './data/menu.json'
import { LoadingScreen } from './components/layout/LoadingScreen.tsx'
import { FloatingCartButton } from './components/layout/FloatingCartButton.tsx'
import { KioskProvider } from './components/layout/KioskProvider.tsx'
import { MenuScreen } from './screens/MenuScreen.tsx'
import { DetailScreen } from './screens/DetailScreen.tsx'
import { CartScreen } from './screens/CartScreen.tsx'
import { WaitingScreen } from './screens/WaitingScreen.tsx'
import { cartItemCount, orderTotal } from './lib/calculations.ts'
import { useOrder } from './lib/useOrder.ts'
import { useToast } from './lib/useToast.ts'
import { Stack } from './components/ui/Stack.tsx'

const SELECTED_ITEM_KEY = 'digital-menu-selected-item'

const findItemById = (menu: MenuData, id: string): MenuItem | undefined => {
  for (const category of menu.categories) {
    const item = category.items.find((i) => i.id === id)
    if (item) return item
  }
  return undefined
}

export default function App() {
  const { show } = useToast()
  const shouldReduceMotion = useReducedMotion()

  const pageTransition = {
    initial: { opacity: shouldReduceMotion ? 1 : 0, x: shouldReduceMotion ? 0 : 24 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: shouldReduceMotion ? 1 : 0, x: shouldReduceMotion ? 0 : -24 },
    transition: { duration: shouldReduceMotion ? 0 : 0.25, ease: [0.4, 0, 0.2, 1] as const },
  }

  const [screen, setScreen] = useState<Screen>('menu')
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [orderNumber, setOrderNumber] = useState<string | null>(null)
  const [menu, setMenu] = useState<MenuData | null>(null)
  const [loading, setLoading] = useState(true)
  const didRestoreScreen = useRef(false)

  const {
    order,
    addToOrder,
    quickAddToOrder,
    removeFromOrder,
    updateOrderItemQuantity,
    updateLineItemNote,
    placeOrder,
    resetOrder,
  } = useOrder()

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
    if (didRestoreScreen.current || !menu) return
    didRestoreScreen.current = true

    const hash = window.location.hash.replace(/^#\/?/, '')
    const validScreens: Screen[] = ['menu', 'detail', 'cart', 'waiting']
    if (!validScreens.includes(hash as Screen)) return

    const restored = hash as Screen
    if (restored === 'detail') {
      const savedId = localStorage.getItem(SELECTED_ITEM_KEY)
      const resolved = savedId ? findItemById(menu, savedId) : undefined
      if (!resolved) return
      setSelectedItem(resolved)
    }
    if (restored === 'cart' && order.items.length === 0) return
    if (restored === 'waiting' && !order.id) return

    setScreen(restored)
    if (restored === 'waiting' && order.id) {
      setOrderNumber(order.id)
    }
  }, [menu, order.id, order.items.length])

  useEffect(() => {
    try {
      if (selectedItem) {
        localStorage.setItem(SELECTED_ITEM_KEY, selectedItem.id)
      } else {
        localStorage.removeItem(SELECTED_ITEM_KEY)
      }
    } catch {
      // Ignore private-mode / quota errors.
    }
  }, [selectedItem])

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

  const handleAddToOrder = useCallback(
    (item: MenuItem, quantity: number, selectedAddons: Record<string, number>, note = '') => {
      addToOrder(item, quantity, selectedAddons, note)
      show(`Added ${item.name} to order`)
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(18)
      }
    },
    [addToOrder, show],
  )

  const handleQuickAdd = useCallback(
    (item: MenuItem) => {
      if (item.addons.length > 0) {
        openDetail(item)
        return
      }
      quickAddToOrder(item)
      show(`Added ${item.name} to order`)
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(18)
      }
    },
    [openDetail, quickAddToOrder, show],
  )

  const handlePlaceOrder = useCallback(() => {
    const id = placeOrder()
    setOrderNumber(id)
    setScreen('waiting')
  }, [placeOrder])

  const backToMenu = useCallback(() => {
    setScreen('menu')
  }, [])

  const startNewOrder = useCallback(() => {
    resetOrder()
    setOrderNumber(null)
    setScreen('menu')
  }, [resetOrder])

  if (loading) {
    return <LoadingScreen />
  }

  if (!menu) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center px-6 text-center">
        <h1 className="font-heading text-2xl font-bold">Menu unavailable</h1>
        <p className="mt-2 text-[var(--color-text-secondary)]">
          We couldn’t load the menu right now. Please refresh the page to try again.
        </p>
      </div>
    )
  }

  const adminActions = {
    onResetOrder: startNewOrder,
    onBackToSetup: startNewOrder,
  }

  return (
    <KioskProvider adminActions={adminActions}>
      <Stack gap={0} className="relative flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {screen === 'menu' && (
            <motion.div key="menu" {...pageTransition} className="w-full">
              <MenuScreen
                menu={menu}
                onItemClick={openDetail}
                onQuickAdd={handleQuickAdd}
              />
            </motion.div>
          )}

        {screen === 'detail' && selectedItem && (
          <motion.div key="detail" {...pageTransition} className="w-full">
            <DetailScreen
              item={selectedItem}
              onAddToOrder={handleAddToOrder}
              onBack={backToMenu}
            />
          </motion.div>
        )}

        {screen === 'cart' && (
          <motion.div key="cart" {...pageTransition} className="w-full">
            <CartScreen
              menu={menu}
              order={order}
              onRemoveItem={removeFromOrder}
              onUpdateQuantity={updateOrderItemQuantity}
              onUpdateNote={updateLineItemNote}
              onPlaceOrder={handlePlaceOrder}
              onBackToMenu={backToMenu}
              onUpsellAdd={handleQuickAdd}
            />
          </motion.div>
        )}

        {screen === 'waiting' && orderNumber && (
          <motion.div key="waiting" {...pageTransition} className="w-full">
            <WaitingScreen
              order={order}
              onAddAnotherRound={backToMenu}
              onStartNewOrder={startNewOrder}
            />
          </motion.div>
        )}
      </AnimatePresence>

        <FloatingCartButton
          itemCount={cartItemCount(order)}
          total={orderTotal(order)}
          onClick={() => setScreen('cart')}
          hidden={screen === 'cart' || screen === 'waiting'}
        />
      </Stack>
    </KioskProvider>
  )
}
