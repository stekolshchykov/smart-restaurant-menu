import type { Order } from '../types.ts'
import { Layout } from '../components/layout/Layout.tsx'
import { BackButton } from '../components/layout/BackButton.tsx'
import { OrderSummary } from '../components/order/OrderSummary.tsx'
import { Container } from '../components/ui/Container.tsx'
import { SlideUp } from '../components/ui/SlideUp.tsx'
import { Stack } from '../components/ui/Stack.tsx'

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
    <Layout onLogoClick={onBackToMenu} showCartButton={false}>
      <Container size="lg" className="pb-8">
        <SlideUp duration={0.45}>
          <Stack gap={4}>
            <div className="pt-2">
              <BackButton onClick={onBackToMenu} />
            </div>

            <OrderSummary
              order={order}
              onRemoveItem={onRemoveItem}
              onPlaceOrder={onPlaceOrder}
              onBackToMenu={onBackToMenu}
            />
          </Stack>
        </SlideUp>
      </Container>
    </Layout>
  )
}
