import type { OrderLineItem } from '../../types.ts'
import { lineItemTotal } from '../../lib/calculations.ts'
import { Flex } from '../ui/Flex.tsx'
import { Heading } from '../ui/Heading.tsx'
import { Price } from '../ui/Price.tsx'
import { Stack } from '../ui/Stack.tsx'
import { Text } from '../ui/Text.tsx'

export interface OrderLineItemReadOnlyProps {
  item: OrderLineItem
}

export function OrderLineItemReadOnly({ item }: OrderLineItemReadOnlyProps) {
  const lineTotal = lineItemTotal(item)

  return (
    <Flex align="start" justify="between" gap={4}>
      <Stack gap={1} className="min-w-0 flex-1 text-left">
        <Heading level={4} variant="title" onSurface className="truncate">
          <Text
            as="span"
            variant="body"
            className="mr-2 text-[var(--color-accent)]"
          >
            {item.quantity}×
          </Text>
          {item.name}
        </Heading>

        {item.addons.length > 0 && (
          <Stack gap={1}>
            {item.addons.map((addon) => (
              <Text key={addon.id} variant="body-sm" onSurface>
                {addon.quantity > 1 ? `${addon.quantity}× ` : '+ '}
                {addon.name}
              </Text>
            ))}
          </Stack>
        )}
      </Stack>

      <Price amount={lineTotal} size="md" onSurface className="shrink-0" />
    </Flex>
  )
}
