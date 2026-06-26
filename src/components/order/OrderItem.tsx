import { motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import type { OrderLineItem } from '../../types'
import { lineItemTotal } from '../../lib/calculations'
import { Divider } from '../ui/Divider'
import { Heading } from '../ui/Heading'
import { IconButton } from '../ui/IconButton'
import { Price } from '../ui/Price'
import { Surface } from '../ui/Surface'
import { Text } from '../ui/Text'

export interface OrderItemProps {
  item: OrderLineItem
  onRemove: () => void
}

export function OrderItem({ item, onRemove }: OrderItemProps) {
  const lineTotal = lineItemTotal(item)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -28, scale: 0.98 }}
      transition={{
        duration: 0.25,
        ease: [0.4, 0, 0.2, 1],
      }}
    >
      <Surface className="flex items-start gap-4 p-4">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex items-start justify-between gap-3">
            <Heading level={3} variant="title" onSurface className="flex-1">
              {item.quantity > 1 && (
                <Text as="span" variant="body" className="mr-2 text-[var(--color-accent)]">
                  {item.quantity}×
                </Text>
              )}
              {item.name}
            </Heading>
            <Price amount={item.basePrice * item.quantity} size="sm" onSurface className="shrink-0" />
          </div>

          {item.addons.length > 0 && (
            <div className="flex flex-col gap-1">
              {item.addons.map((addon) => (
                <div
                  key={addon.id}
                  className="flex items-center justify-between gap-2"
                >
                  <Text variant="body-sm" onSurface>
                    {addon.quantity > 1 ? `${addon.quantity}× ` : '+ '}
                    {addon.name}
                  </Text>
                  <Price amount={addon.price * addon.quantity} size="sm" onSurface />
                </div>
              ))}
            </div>
          )}

          <Divider onSurface className="my-1" />

          <div className="flex items-center justify-between">
            <Text variant="body-sm" onSurface>
              Line total
            </Text>
            <Price amount={lineTotal} size="md" onSurface />
          </div>
        </div>

        <IconButton
          aria-label={`Remove ${item.name}`}
          onClick={onRemove}
          variant="ghost"
          size="md"
          className="shrink-0 rounded-[var(--radius-md)] text-[var(--color-error)] hover:bg-[var(--color-error-bg)] hover:ring-1 hover:ring-[var(--color-error)]/30"
        >
          <Trash2 size={20} />
        </IconButton>
      </Surface>
    </motion.div>
  )
}
