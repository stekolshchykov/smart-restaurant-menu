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
}

export function MenuItemCard({ item, onClick, onQuickAdd }: MenuItemCardProps) {
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

  return (
    <Card onClick={onClick} hover className="group flex h-full flex-col">
      <div className="relative">
        <Image
          src={item.image}
          alt={item.name}
          aspectRatio="4/3"
          hoverZoom
          className="rounded-none"
        />

        {(item.featured || item.badges?.length) && (
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {item.featured && <Badge variant="featured">Chef's choice</Badge>}
            {item.badges?.slice(0, 2).map((badge) => (
              <Badge key={badge} variant="featured">
                {badge}
              </Badge>
            ))}
          </div>
        )}

        <div className="absolute right-3 bottom-3 translate-y-2 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 [@media(hover:none)]:translate-y-0 [@media(hover:none)]:opacity-100">
          <QuickAddButton onClick={onQuickAdd} label={`Quick add ${item.name}`} />
        </div>
      </div>

      <Stack gap={3} className="flex-1 p-4">
        <div className="flex min-w-0 items-start justify-between gap-2">
          <Heading level={3} variant="title" onSurface className="min-w-0 truncate">
            {item.name}
          </Heading>
          <Price amount={item.price} onSurface className="shrink-0" />
        </div>

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
    </Card>
  )
}
