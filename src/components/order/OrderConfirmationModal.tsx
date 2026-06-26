import { ChefHat, Clock, ShoppingBag, X } from 'lucide-react'
import type { Order } from '../../types.ts'
import { TABLE_NUMBER } from '../../config.ts'
import { cartItemCount, orderTotal } from '../../lib/calculations.ts'
import { Button } from '../ui/Button.tsx'
import { Flex } from '../ui/Flex.tsx'
import { Heading } from '../ui/Heading.tsx'
import { IconButton } from '../ui/IconButton.tsx'
import { Price } from '../ui/Price.tsx'
import { Stack } from '../ui/Stack.tsx'
import { Surface } from '../ui/Surface.tsx'
import { Text } from '../ui/Text.tsx'

export interface OrderConfirmationModalProps {
  order: Order
  onConfirm: () => void
  onCancel: () => void
}

export function OrderConfirmationModal({
  order,
  onConfirm,
  onCancel,
}: OrderConfirmationModalProps) {
  const total = orderTotal(order)
  const itemCount = cartItemCount(order)

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center">
      <Surface
        elevated
        className="w-full max-w-md overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-order-title"
      >
        <div className="border-b border-[var(--color-border-on-surface-subtle)] p-4 sm:p-5">
          <Flex align="center" justify="between" gap={3}>
            <Heading
              level={2}
              variant="section"
              onSurface
              id="confirm-order-title"
              className="text-xl"
            >
              Confirm your order
            </Heading>
            <IconButton
              onClick={onCancel}
              aria-label="Cancel"
              variant="ghost"
              size="md"
            >
              <X className="h-5 w-5" />
            </IconButton>
          </Flex>
        </div>

        <div className="p-4 sm:p-5">
          <Stack gap={4}>
            <Flex align="center" gap={3}>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-bg)]">
                <ShoppingBag className="h-5 w-5 text-[var(--color-accent)]" />
              </div>
              <Stack gap={0}>
                <Text variant="body" onSurface className="font-medium">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'} for table {TABLE_NUMBER}
                </Text>
                <Text variant="body-sm" onSurface>
                  Double-check your selection before sending it to the kitchen.
                </Text>
              </Stack>
            </Flex>

            <Surface className="p-3">
              <Stack gap={2}>
                {order.items.map((item) => (
                  <Stack key={item.id} gap={1}>
                    <Flex justify="between" align="center" gap={3}>
                      <Text variant="body-sm" onSurface className="flex-1">
                        {item.quantity}× {item.name}
                      </Text>
                      <Text variant="body-sm" onSurface className="shrink-0 font-medium">
                        €{(item.basePrice * item.quantity).toFixed(2)}
                      </Text>
                    </Flex>
                    {item.addons.length > 0 && (
                      <Text variant="caption" onSurface>
                        + {item.addons.map((a) => `${a.quantity > 1 ? `${a.quantity}× ` : ''}${a.name}`).join(', ')}
                      </Text>
                    )}
                    {item.note && (
                      <Text variant="caption" onSurface>
                        Note: {item.note}
                      </Text>
                    )}
                  </Stack>
                ))}
              </Stack>
            </Surface>

            <Flex align="center" gap={2}>
              <Clock className="h-4 w-4 text-[var(--color-text-on-surface-muted)]" />
              <Text variant="body-sm" onSurface>
                Estimated wait: about 10–15 minutes
              </Text>
            </Flex>

            <Flex align="center" gap={2}>
              <ChefHat className="h-4 w-4 text-[var(--color-text-on-surface-muted)]" />
              <Text variant="body-sm" onSurface>
                Your order will be sent straight to the kitchen.
              </Text>
            </Flex>
          </Stack>
        </div>

        <div className="border-t border-[var(--color-border-on-surface-subtle)] p-4 sm:p-5">
          <Stack gap={3}>
            <Flex justify="between" align="center">
              <Text variant="label" onSurface>
                Total
              </Text>
              <Price amount={total} size="lg" onSurface />
            </Flex>

            <Flex gap={3}>
              <Button variant="outline" size="lg" fullWidth onClick={onCancel}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={onConfirm}
              >
                Confirm & send
              </Button>
            </Flex>
          </Stack>
        </div>
      </Surface>
    </div>
  )
}
