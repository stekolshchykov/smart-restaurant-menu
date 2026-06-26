import type { Order } from '../types.ts'
import { Layout } from '../components/layout/Layout.tsx'
import { OrderSummary } from '../components/order/OrderSummary.tsx'
import { Container } from '../components/ui/Container.tsx'
import { SlideUp } from '../components/ui/SlideUp.tsx'

export interface CartScreenProps {
  order: Order
  onRemoveItem: (id: string) => void
  onPlaceOrder: () => void
  onBackToMenu: () => void
}

export function CartScreen({
  order,
  onRemoveItem,
  onPlaceOrder,
  onBackToMenu,
}: CartScreenProps) {
  return (
    <Layout onBack={onBackToMenu} title="Your order">
      <Container size="lg" className="flex h-full flex-col pt-4">
        <SlideUp duration={0.45} className="flex-1 min-h-0">
          <OrderSummary
            order={order}
            onRemoveItem={onRemoveItem}
            onPlaceOrder={onPlaceOrder}
            onBackToMenu={onBackToMenu}
          />
        </SlideUp>
      </Container>
    </Layout>
  )
}
