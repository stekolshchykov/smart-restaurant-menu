import { motion, useReducedMotion } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import type { OrderLineItem } from '../../types.ts'
import { lineItemTotal } from '../../lib/calculations.ts'
import { Divider } from '../ui/Divider.tsx'
import { IconButton } from '../ui/IconButton.tsx'
import { Price } from '../ui/Price.tsx'
import { Stepper } from '../ui/Stepper.tsx'
import { Surface } from '../ui/Surface.tsx'
import { Text } from '../ui/Text.tsx'
import { TextArea } from '../ui/TextArea.tsx'

export interface OrderItemProps {
  item: OrderLineItem
  onRemove: () => void
  onQuantityChange: (quantity: number) => void
  onNoteChange?: (note: string) => void
}

export function OrderItem({
  item,
  onRemove,
  onQuantityChange,
  onNoteChange,
}: OrderItemProps) {
  const lineTotal = lineItemTotal(item)
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      layout={!shouldReduceMotion}
      initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: shouldReduceMotion ? 0 : -12, scale: shouldReduceMotion ? 1 : 0.98 }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.25,
        ease: [0.4, 0, 0.2, 1],
      }}
    >
      <Surface className="flex items-start gap-4 p-4">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex items-start justify-between gap-3">
            <Text variant="body" onSurface className="flex-1 font-medium">
              {item.quantity > 1 && (
                <Text as="span" variant="body" className="mr-2 text-[var(--color-accent)]">
                  {item.quantity}×
                </Text>
              )}
              {item.name}
            </Text>
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

          {item.note && (
            <Text variant="caption" onSurface>
              Note: {item.note}
            </Text>
          )}

          {onNoteChange && (
            <TextArea
              value={item.note ?? ''}
              onChange={onNoteChange}
              placeholder="Special requests, e.g. no onions"
              rows={2}
              className="pt-1"
            />
          )}

          <Divider onSurface className="my-1" />

          <div className="flex items-center justify-between gap-3">
            <Stepper
              value={item.quantity}
              min={1}
              onChange={onQuantityChange}
              size="sm"
              onSurface
            />
            <div className="flex items-center gap-2">
              <Text variant="label" onSurface>
                Line total
              </Text>
              <Price amount={lineTotal} size="md" onSurface />
            </div>
          </div>
        </div>

        <IconButton
          aria-label={`Remove ${item.name}`}
          onClick={onRemove}
          variant="ghost"
          size="md"
          className="shrink-0 text-[var(--color-error)] hover:bg-[var(--color-error-bg)]"
        >
          <Trash2 size={20} />
        </IconButton>
      </Surface>
    </motion.div>
  )
}
