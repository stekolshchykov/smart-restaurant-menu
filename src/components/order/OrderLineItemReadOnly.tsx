import type { OrderLineItem } from '../../types.ts'
import { lineItemTotal } from '../../lib/calculations.ts'
import { formatCurrency } from '../../lib/formatters.ts'
import { Flex } from '../ui/Flex.tsx'
import { Stack } from '../ui/Stack.tsx'
import { Text } from '../ui/Text.tsx'

export interface OrderLineItemReadOnlyProps {
  item: OrderLineItem
}

export function OrderLineItemReadOnly({ item }: OrderLineItemReadOnlyProps) {
  const lineTotal = lineItemTotal(item)
  const hasAddons = item.addons.length > 0

  return (
    <div className="py-3">
      <Flex align="start" justify="between" gap={4}>
        <Flex gap={3} align="start" className="min-w-0 flex-1">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-bg)] text-xs font-semibold text-[var(--color-accent)]">
            {item.quantity}
          </span>

          <Stack gap={1} className="min-w-0 text-left">
            <Text
              variant="body"
              onSurface
              className="font-medium text-[var(--color-heading-on-surface)]"
            >
              {item.name}
            </Text>

            {hasAddons && (
              <Stack gap={1} className="gap-1">
                {item.addons.map((addon) => (
                  <Text
                    key={addon.id}
                    variant="body-sm"
                    onSurface
                    className="text-[var(--color-text-on-surface-secondary)]"
                  >
                    + {addon.quantity > 1 ? `${addon.quantity}× ` : ''}
                    {addon.name}{' '}
                    <span className="text-[var(--color-text-on-surface-muted)]">
                      ({formatCurrency(addon.price * addon.quantity)})
                    </span>
                  </Text>
                ))}
              </Stack>
            )}
          </Stack>
        </Flex>

        <Text
          variant="body"
          onSurface
          className="shrink-0 font-semibold text-[var(--color-primary)]"
        >
          {formatCurrency(lineTotal)}
        </Text>
      </Flex>
    </div>
  )
}
