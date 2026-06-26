import type { Addon } from '../../types.ts'
import { Flex } from '../ui/Flex.tsx'
import { Price } from '../ui/Price.tsx'
import { Stack } from '../ui/Stack.tsx'
import { Stepper } from '../ui/Stepper.tsx'
import { Text } from '../ui/Text.tsx'

export interface AddonSelectorProps {
  addons: Addon[]
  selected: Record<string, number>
  onChange: (id: string, quantity: number) => void
  max?: number
  onSurface?: boolean
}

type AddonWithDescription = Addon & { description?: string }

export function AddonSelector({
  addons,
  selected,
  onChange,
  max = 5,
  onSurface = true,
}: AddonSelectorProps) {
  if (addons.length === 0) {
    return null
  }

  return (
    <Stack gap={0}>
      {addons.map((addon) => {
        const quantity = selected[addon.id] ?? 0
        const isSelected = quantity > 0
        const addonWithDescription = addon as AddonWithDescription

        return (
          <Flex
            key={addon.id}
            align="center"
            justify="between"
            gap={3}
            className="border-b border-[var(--color-border)] py-3 last:border-b-0"
          >
            <Stack gap={1} className="min-w-0 flex-1">
              <Text
                variant="body"
                onSurface={onSurface}
                className={`truncate font-medium ${
                  isSelected ? 'text-[var(--color-accent)]' : ''
                }`}
              >
                {addon.name}
              </Text>
              {addonWithDescription.description && (
                <Text
                  variant="body-sm"
                  onSurface={onSurface}
                  className="truncate"
                >
                  {addonWithDescription.description}
                </Text>
              )}
              <Price amount={addon.price} size="sm" onSurface={onSurface} />
            </Stack>
            <div className="shrink-0">
              <Stepper
                value={quantity}
                min={0}
                max={max}
                onChange={(value) => onChange(addon.id, value)}
                size="md"
                onSurface={onSurface}
                aria-label={`Quantity of ${addon.name}`}
              />
            </div>
          </Flex>
        )
      })}
    </Stack>
  )
}
