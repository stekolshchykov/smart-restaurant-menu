import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ShoppingBag, UtensilsCrossed } from 'lucide-react'
import type { Order } from '../../types.ts'
import { orderTotal } from '../../lib/calculations.ts'
import { Button } from '../ui/Button.tsx'
import { Divider } from '../ui/Divider.tsx'
import { EmptyState } from '../ui/EmptyState.tsx'
import { Flex } from '../ui/Flex.tsx'
import { Price } from '../ui/Price.tsx'
import { StaggerContainer, StaggerItem } from '../ui/StaggerContainer.tsx'
import { Stack } from '../ui/Stack.tsx'
import { Surface } from '../ui/Surface.tsx'
import { Text } from '../ui/Text.tsx'
import { OrderItem } from './OrderItem.tsx'

export interface OrderSummaryProps {
  order: Order
  onRemoveItem: (id: string) => void
  onPlaceOrder: () => void
}

export function OrderSummary({
  order,
  onRemoveItem,
  onPlaceOrder,
}: OrderSummaryProps) {
  const total = orderTotal(order)
  const hasItems = order.items.length > 0
  const shouldReduceMotion = useReducedMotion()

  return (
    <Surface className="flex h-full flex-col lg:grid lg:h-auto lg:grid-cols-[1fr_22rem] lg:grid-rows-[auto_1fr]">
      <Flex align="center" gap={3} className="col-span-full p-4 pb-2">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-bg)]">
          <ShoppingBag size={24} className="text-[var(--color-accent)]" />
        </div>
        <Stack gap={0}>
          <Text variant="body" onSurface className="font-medium">
            {hasItems
              ? `${order.items.length} item${order.items.length === 1 ? '' : 's'}`
              : 'Nothing selected yet'}
          </Text>
        </Stack>
      </Flex>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 scrollbar-hide lg:max-h-[calc(100svh-var(--header-total-height)-theme(spacing.20))]">
        <AnimatePresence mode="popLayout">
          {hasItems ? (
            <StaggerContainer
              key="list"
              className="flex flex-col gap-3 pb-4"
              aria-label="Order items"
            >
              {order.items.map((item) => (
                <StaggerItem key={item.id}>
                  <OrderItem
                    item={item}
                    onRemove={() => onRemoveItem(item.id)}
                  />
                </StaggerItem>
              ))}
            </StaggerContainer>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: shouldReduceMotion ? 1 : 0, scale: shouldReduceMotion ? 1 : 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: shouldReduceMotion ? 1 : 0, scale: shouldReduceMotion ? 1 : 0.96 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
            >
              <EmptyState
                icon={<UtensilsCrossed size={32} className="text-[var(--color-accent)]" />}
                title="Your cart is empty"
                description="Browse the menu and add your favourite dishes to get started."
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {hasItems && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="shrink-0 p-4 pt-0 lg:sticky lg:top-[var(--header-total-height)] lg:self-start"
        >
          <Surface className="p-4">
            <Flex align="center" justify="between" className="mb-3">
              <Text variant="label" onSurface>
                Subtotal
              </Text>
              <Price amount={total} size="md" onSurface />
            </Flex>

            <Divider onSurface className="mb-3" />

            <Flex align="center" justify="between" className="mb-4">
              <Text variant="label" onSurface>
                Total
              </Text>
              <motion.div
                key={total}
                initial={{ scale: shouldReduceMotion ? 1 : 0.92, opacity: shouldReduceMotion ? 1 : 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : {
                        type: 'spring',
                        stiffness: 450,
                        damping: 18,
                      }
                }
              >
                <Price amount={total} size="lg" onSurface />
              </motion.div>
            </Flex>

            <Button
              onClick={onPlaceOrder}
              variant="primary"
              size="lg"
              fullWidth
            >
              Place Order
            </Button>
          </Surface>
        </motion.div>
      )}
    </Surface>
  )
}
