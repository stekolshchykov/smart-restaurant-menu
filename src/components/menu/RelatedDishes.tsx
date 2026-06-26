import type { MenuItem } from '../../types'
import { Heading } from '../ui/Heading.tsx'
import { Image } from '../ui/Image.tsx'
import { Price } from '../ui/Price.tsx'
import { Text } from '../ui/Text.tsx'

export interface RelatedDishesProps {
  items: MenuItem[]
  onItemClick: (item: MenuItem) => void
}

export function RelatedDishes({ items, onItemClick }: RelatedDishesProps) {
  if (items.length === 0) return null

  return (
    <div>
      <Heading level={2} variant="section" onSurface className="mb-3">
        You may also like
      </Heading>

      <div className="scrollbar-hide -mx-1 flex gap-3 overflow-x-auto px-1">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onItemClick(item)}
            className="shrink-0 overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border-on-surface-subtle)] bg-[var(--color-surface)] text-left transition-shadow duration-[var(--transition-fast)] hover:shadow-[var(--shadow-md)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)]"
            style={{ width: '10rem' }}
          >
            <Image
              src={item.image}
              alt={item.name}
              aspectRatio="4/3"
              className="rounded-none"
            />
            <div className="p-2">
              <Text variant="body-sm" onSurface className="line-clamp-1 font-medium">
                {item.name}
              </Text>
              <Price amount={item.price} size="sm" onSurface />
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
