import type { OrderAddon } from '../../types.ts'
import { Flex } from '../ui/Flex.tsx'
import { Text } from '../ui/Text.tsx'

export interface SelectedAddonSummaryProps {
  addons: OrderAddon[]
}

export function SelectedAddonSummary({ addons }: SelectedAddonSummaryProps) {
  if (addons.length === 0) return null

  return (
    <Flex gap={2} wrap>
      {addons.map((addon) => (
        <Text
          key={addon.id}
          variant="body-sm"
          onSurface
          className="rounded-full bg-[var(--color-accent-bg)] px-2.5 py-1 text-[var(--color-accent)]"
        >
          {addon.quantity}× {addon.name}
        </Text>
      ))}
    </Flex>
  )
}
