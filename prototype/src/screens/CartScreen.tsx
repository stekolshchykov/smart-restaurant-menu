import type { MenuData, MenuItem, Order } from '../types.ts'
import { Layout } from '../components/layout/Layout.tsx'
import { OrderSummary } from '../components/order/OrderSummary.tsx'
import { Container } from '../components/ui/Container.tsx'
import { SlideUp } from '../components/ui/SlideUp.tsx'

export interface CartScreenProps {
  menu: MenuData
  order: Order
  onRemoveItem: (id: string) => void
  onUpdateQuantity: (id: string, quantity: number) => void
  onUpdateNote: (id: string, note: string) => void
  onPlaceOrder: () => void
  onBackToMenu: () => void
  onUpsellAdd: (item: MenuItem) => void
}

export function CartScreen({
  menu,
  order,
  onRemoveItem,
  onUpdateQuantity,
  onUpdateNote,
  onPlaceOrder,
  onBackToMenu,
  onUpsellAdd,
}: CartScreenProps) {
  return (
    <Layout onBack={onBackToMenu} title="Your order" backLabel="Back to menu" titleLevel={1}>
      <Container size="lg" className="flex h-full flex-col pt-4">
        <SlideUp duration={0.45} className="flex-1 min-h-0">
          <OrderSummary
            menu={menu}
            order={order}
            onRemoveItem={onRemoveItem}
            onUpdateQuantity={onUpdateQuantity}
            onUpdateNote={onUpdateNote}
            onPlaceOrder={onPlaceOrder}
            onBackToMenu={onBackToMenu}
            onUpsellAdd={onUpsellAdd}
          />
        </SlideUp>
      </Container>
    </Layout>
  )
}
