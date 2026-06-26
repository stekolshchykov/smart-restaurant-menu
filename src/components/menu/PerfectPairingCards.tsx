import type { ParingItem } from '../../types.ts'
import { Image } from '../ui/Image.tsx'
import { Text } from '../ui/Text.tsx'

export interface PerfectPairingCardsProps {
  pairings: ParingItem[]
}

export function PerfectPairingCards({ pairings }: PerfectPairingCardsProps) {
  if (pairings.length === 0) {
    return null
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {pairings.map((pairing) => (
        <div
          key={pairing.id}
          className="group overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] transition-colors duration-[var(--transition-fast)] hover:border-[var(--color-border-strong)]"
        >
          <Image
            src={pairing.image}
            alt={pairing.name}
            aspectRatio="square"
            className="rounded-none"
          />
          <div className="px-2 pb-2 pt-1">
            <Text variant="caption" className="line-clamp-1">
              {pairing.name}
            </Text>
          </div>
        </div>
      ))}
    </div>
  )
}
