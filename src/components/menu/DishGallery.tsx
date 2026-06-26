import type { MenuItem, ParingItem } from '../../types'
import { Image } from '../ui/Image.tsx'
import { Text } from '../ui/Text.tsx'

export interface DishGalleryProps {
  item: MenuItem
  perfectWith?: ParingItem[]
  className?: string
}

export function DishGallery({ item, perfectWith, className = '' }: DishGalleryProps) {
  const thumbnails = perfectWith?.slice(0, 3) ?? []

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <Image
        src={item.image}
        alt={item.name}
        aspectRatio="video"
        priority
        className="max-h-[55vh] w-full rounded-[var(--radius-lg)] object-cover"
      />

      {thumbnails.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {thumbnails.map((pairing) => (
            <div
              key={pairing.id}
              className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)]"
            >
              <Image
                src={pairing.image}
                alt={pairing.name}
                aspectRatio="square"
                className="rounded-none"
              />
              <div className="px-2 py-1.5">
                <Text variant="caption" className="line-clamp-1">
                  {pairing.name}
                </Text>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
