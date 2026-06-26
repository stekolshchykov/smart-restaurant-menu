import { Wine } from 'lucide-react'
import type { ParingItem } from '../../types'
import { Flex } from '../ui/Flex.tsx'
import { Heading } from '../ui/Heading.tsx'
import { Image } from '../ui/Image.tsx'
import { Text } from '../ui/Text.tsx'

export interface PerfectWithProps {
  items: ParingItem[]
  onSelect?: (id: string) => void
}

export function PerfectWith({ items, onSelect }: PerfectWithProps) {
  if (items.length === 0) return null

  return (
    <div>
      <Flex align="center" gap={2} className="mb-3">
        <Wine className="h-5 w-5 text-[var(--color-accent)]" />
        <Heading level={2} variant="section" onSurface>
          Perfect with
        </Heading>
      </Flex>

      <div className="scrollbar-hide -mx-1 flex gap-3 overflow-x-auto px-1">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect?.(item.id)}
            className="shrink-0 overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border-on-surface-subtle)] bg-[var(--color-surface)] text-left transition-shadow duration-[var(--transition-fast)] hover:shadow-[var(--shadow-md)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)]"
            style={{ width: '8rem' }}
          >
            <Image
              src={item.image}
              alt={item.name}
              aspectRatio="square"
              className="rounded-none"
            />
            <div className="p-2">
              <Text variant="caption" onSurface className="line-clamp-2">
                {item.name}
              </Text>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
