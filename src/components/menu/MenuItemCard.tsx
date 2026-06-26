import { useId } from 'react'
import type { MenuItem } from '../../types'
import { Badge } from '../ui/Badge'
import { Card } from '../ui/Card'
import { Heading } from '../ui/Heading'
import { Image } from '../ui/Image'
import { Price } from '../ui/Price'
import { QuickAddButton } from '../ui/QuickAddButton'
import { Stack } from '../ui/Stack'
import { Text } from '../ui/Text'

export interface MenuItemCardProps {
  item: MenuItem
  onClick: () => void
  onQuickAdd: () => void
  priority?: boolean
}

export function MenuItemCard({ item, onClick, onQuickAdd, priority = false }: MenuItemCardProps) {
  const headingId = useId()
  const dietaryBadges = [
    item.isSpicy && { label: 'Spicy', variant: 'accent' as const },
    item.isVegetarian && { label: 'Vegetarian', variant: 'default' as const },
    item.isVegan && { label: 'Vegan', variant: 'default' as const },
    item.isGlutenFree && { label: 'Gluten-free', variant: 'outline' as const },
  ].filter(
    (
      badge,
    ): badge is {
      label: string
      variant: 'accent' | 'default' | 'outline'
    } => Boolean(badge),
  )

  const showTrust =
    (item.rating !== undefined && item.reviewCount !== undefined) ||
    (item.popularity ?? 0) > 0

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onClick()
    }
  }

  return (
    <Card className="group relative flex h-full flex-col">
      <div
        role="button"
        tabIndex={0}
        aria-labelledby={headingId}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        className="flex h-full cursor-pointer flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)]"
      >
        <div className="relative">
          <Image
            src={item.image}
            alt=""
            aspectRatio="4/3"
            hoverZoom
            priority={priority}
            className="rounded-none"
          />

          {(item.featured || item.badges?.length) && (
            <div className="pointer-events-none absolute top-3 left-3 flex flex-wrap gap-1.5">
              {item.featured && <Badge variant="featured">Chef's choice</Badge>}
              {item.badges?.slice(0, 2).map((badge) => (
                <Badge key={badge} variant="featured">
                  {badge}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <Stack gap={3} className="flex-1 p-4">
          <div className="flex min-w-0 items-start justify-between gap-2">
            <Heading level={3} variant="title" onSurface id={headingId} className="min-w-0 truncate">
              {item.name}
            </Heading>
            <Price amount={item.price} onSurface className="shrink-0" />
          </div>

          {showTrust && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {item.rating !== undefined && item.reviewCount !== undefined && (
                <Badge variant="default">
                  ★ {item.rating.toFixed(1)} · {item.reviewCount}
                </Badge>
              )}
              {(item.popularity ?? 0) > 80 && (
                <Badge variant="featured">Guest favourite</Badge>
              )}
              {(item.popularity ?? 0) > 50 && (item.popularity ?? 0) <= 80 && (
                <Badge variant="default">Served today</Badge>
              )}
            </div>
          )}

          <Text variant="body-sm" onSurface className="line-clamp-2">
            {item.description}
          </Text>

          {(dietaryBadges.length > 0 || item.tags?.length) && (
            <div className="mt-auto flex flex-wrap gap-1.5">
              {dietaryBadges.map((badge) => (
                <Badge key={badge.label} variant={badge.variant}>
                  {badge.label}
                </Badge>
              ))}
              {item.tags?.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </Stack>
      </div>

      <div className="absolute right-3 bottom-3 z-10 translate-y-2 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 [@media(hover:none)]:translate-y-0 [@media(hover:none)]:opacity-90 [@media(hover:none)]:scale-90">
        <QuickAddButton onClick={onQuickAdd} label={`Quick add ${item.name}`} />
      </div>
    </Card>
  )
}
