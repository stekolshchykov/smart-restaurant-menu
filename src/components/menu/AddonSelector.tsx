import type { Addon } from '../../types'
import { Flex } from '../ui/Flex'
import { Price } from '../ui/Price'
import { Stack } from '../ui/Stack'
import { Stepper } from '../ui/Stepper'
import { Surface } from '../ui/Surface'
import { Text } from '../ui/Text'

export interface AddonSelectorProps {
  addons: Addon[]
  selected: Record<string, number>
  onChange: (id: string, quantity: number) => void
}

type AddonWithDescription = Addon & { description?: string }

export function AddonSelector({
  addons,
  selected,
  onChange,
}: AddonSelectorProps) {
  if (addons.length === 0) {
    return null
  }

  return (
    <Stack gap={3}>
      {addons.map((addon) => {
        const quantity = selected[addon.id] ?? 0
        const isSelected = quantity > 0
        const addonWithDescription = addon as AddonWithDescription

        return (
          <Surface
            key={addon.id}
            className={`p-3 transition-colors duration-[var(--transition-fast)] ${
              isSelected
                ? '!border-[var(--color-accent)] !bg-[var(--color-accent-bg)]'
                : ''
            }`}
          >
            <Flex align="center" justify="between" gap={3}>
              <Stack gap={1} className="min-w-0 flex-1">
                <Text
                  variant="body"
                  onSurface
                  className={`font-medium ${
                    isSelected ? '!text-[var(--color-accent-dark)]' : ''
                  }`}
                >
                  {addon.name}
                </Text>
                {addonWithDescription.description && (
                  <Text variant="body-sm" onSurface>
                    {addonWithDescription.description}
                  </Text>
                )}
                <Price amount={addon.price} size="sm" onSurface />
              </Stack>
              <Stepper
                value={quantity}
                min={0}
                max={5}
                onChange={(value) => onChange(addon.id, value)}
                size="md"
                onSurface
              />
            </Flex>
          </Surface>
        )
      })}
    </Stack>
  )
}
