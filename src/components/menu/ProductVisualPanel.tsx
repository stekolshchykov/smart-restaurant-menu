import type { MenuItem } from '../../types.ts'
import { Stack } from '../ui/Stack.tsx'
import { Text } from '../ui/Text.tsx'
import { AddonSelector } from './AddonSelector.tsx'
import { PerfectPairingCards } from './PerfectPairingCards.tsx'
import { ProductImageGallery } from './ProductImageGallery.tsx'

export interface ProductVisualPanelProps {
  item: MenuItem
  selectedAddons: Record<string, number>
  onAddonChange: (addonId: string, quantity: number) => void
}

export function ProductVisualPanel({
  item,
  selectedAddons,
  onAddonChange,
}: ProductVisualPanelProps) {
  const images = item.images && item.images.length > 0
    ? item.images
    : [item.image]

  return (
    <Stack gap={5}>
      <ProductImageGallery images={images} alt={item.name} />

      {item.addons.length > 0 && (
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-4 sm:p-5">
          <Stack gap={3}>
            <Text variant="label">
              Extras
            </Text>
            <AddonSelector
              addons={item.addons}
              selected={selectedAddons}
              onChange={onAddonChange}
            />
          </Stack>
        </div>
      )}

      {item.perfectWith && item.perfectWith.length > 0 && (
        <Stack gap={3}>
          <Text variant="label">
            {item.addons.length > 0 ? 'Goes well with' : 'Pairs beautifully with'}
          </Text>
          <PerfectPairingCards pairings={item.perfectWith} />
        </Stack>
      )}
    </Stack>
  )
}
