import { Star, TrendingUp, Users } from 'lucide-react'
import type { MenuItem } from '../../types.ts'
import { Flex } from '../ui/Flex.tsx'
import { Text } from '../ui/Text.tsx'

export interface ItemTrustSignalsProps {
  item: MenuItem
  className?: string
}

export function ItemTrustSignals({ item, className = '' }: ItemTrustSignalsProps) {
  const hasRating = item.rating !== undefined && item.reviewCount !== undefined
  const hasPopularity = (item.popularity ?? 0) > 0

  if (!hasRating && !hasPopularity) return null

  return (
    <Flex
      align="center"
      gap={3}
      wrap
      className={`text-xs ${className}`}
    >
      {hasRating && (
        <div className="flex items-center gap-1">
          <Star className="h-3.5 w-3.5 fill-[var(--color-accent)] text-[var(--color-accent)]" />
          <Text variant="caption" onSurface className="font-medium text-[var(--color-heading-on-surface)]">
            {item.rating!.toFixed(1)}
          </Text>
          <Text variant="caption" onSurface>
            <Users className="mr-0.5 inline h-3 w-3" />
            {item.reviewCount} reviews
          </Text>
        </div>
      )}

      {hasPopularity && (
        <div className="flex items-center gap-1">
          <TrendingUp className="h-3.5 w-3.5 text-[var(--color-text-on-surface-muted)]" />
          <Text variant="caption" onSurface>
            {item.popularity}% ordered this month
          </Text>
        </div>
      )}
    </Flex>
  )
}
