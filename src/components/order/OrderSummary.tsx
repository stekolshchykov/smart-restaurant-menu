import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ShoppingBag, UtensilsCrossed } from 'lucide-react'
import type { Order } from '../../types'
import { orderTotal } from '../../lib/calculations'
import { Button } from '../ui/Button'
import { Divider } from '../ui/Divider'
import { EmptyState } from '../ui/EmptyState'
import { Flex } from '../ui/Flex'
import { Heading } from '../ui/Heading'
import { IconButton } from '../ui/IconButton'
import { Price } from '../ui/Price'
import { StaggerContainer, StaggerItem } from '../ui/StaggerContainer'
import { Stack } from '../ui/Stack'
import { Surface } from '../ui/Surface'
import { Text } from '../ui/Text'
import { OrderItem } from './OrderItem'

export interface OrderSummaryProps {
  order: Order
  onRemoveItem: (id: string) => void
  onPlaceOrder: () => void
  onBackToMenu: () => void
}

export function OrderSummary({
  order,
  onRemoveItem,
  onPlaceOrder,
  onBackToMenu,
}: OrderSummaryProps) {
  const total = orderTotal(order)
  const hasItems = order.items.length > 0

  return (
    <Surface className="grid min-h-[calc(100vh-var(--header-total-height)-theme(spacing.8))] grid-cols-1 lg:min-h-0 lg:grid-cols-[1fr_22rem] lg:grid-rows-[auto_1fr]">
      <Flex align="center" justify="between" className="col-span-full p-4 pb-2">
        <Flex align="center" gap={3} className="flex-1">
          <Surface className="rounded-[var(--radius-md)] border-0 bg-[var(--color-accent-bg)] p-2">
            <ShoppingBag size={24} className="text-[var(--color-accent)]" />
          </Surface>
          <Stack gap={0}>
            <Heading level={2} variant="section" onSurface>
              Your Order
            </Heading>
            <Text variant="body-sm" onSurface>
              {hasItems
                ? `${order.items.length} item${order.items.length === 1 ? '' : 's'}`
                : 'Nothing selected yet'}
            </Text>
          </Stack>
        </Flex>

        <IconButton
          aria-label="Back to menu"
          onClick={onBackToMenu}
          variant="ghost"
        >
          <ArrowLeft size={20} />
        </IconButton>
      </Flex>

      <div className="overflow-y-auto px-4 scrollbar-hide lg:max-h-[calc(100vh-var(--header-total-height)-theme(spacing.20))]">
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
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
            >
              <EmptyState
                icon={<UtensilsCrossed size={32} className="text-[var(--color-accent)]" />}
                title="Your cart is empty"
                description="Browse the menu and add your favourite dishes to get started."
                action={
                  <Button onClick={onBackToMenu} variant="primary">
                    Browse Menu
                  </Button>
                }
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
          className="p-4 pt-0 lg:sticky lg:top-[var(--header-total-height)] lg:self-start"
        >
          <Surface className="p-4">
            <Flex align="center" justify="between" className="mb-3">
              <Text variant="body" onSurface>
                Subtotal
              </Text>
              <Price amount={total} size="md" onSurface />
            </Flex>

            <Divider onSurface className="mb-3" />

            <Flex align="center" justify="between" className="mb-4">
              <Heading level={3} variant="title" onSurface>
                Total
              </Heading>
              <motion.div
                key={total}
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 450,
                  damping: 18,
                }}
              >
                <Price amount={total} size="lg" onSurface />
              </motion.div>
            </Flex>

            <Stack gap={3}>
              <Button
                onClick={onPlaceOrder}
                variant="primary"
                size="lg"
                fullWidth
              >
                Place Order
              </Button>
              <Button
                onClick={onBackToMenu}
                variant="outline"
                size="md"
                fullWidth
              >
                Back to Menu
              </Button>
            </Stack>
          </Surface>
        </motion.div>
      )}
    </Surface>
  )
}
