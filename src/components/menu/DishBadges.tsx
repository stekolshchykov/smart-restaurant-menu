import type { MenuItem } from '../../types'
import { Badge } from '../ui/Badge.tsx'

export interface DishBadgesProps {
  item: MenuItem
  className?: string
}

export function DishBadges({ item, className = '' }: DishBadgesProps) {
  const badges: { label: string; variant: Parameters<typeof Badge>[0]['variant'] }[] = []

  if (item.featured) {
    badges.push({ label: "Chef's choice", variant: 'featured' })
  }

  item.badges?.forEach((badge) => {
    badges.push({ label: badge, variant: 'featured' })
  })

  if (item.isSpicy) badges.push({ label: 'Spicy', variant: 'accent' })
  if (item.isVegetarian) badges.push({ label: 'Vegetarian', variant: 'default' })
  if (item.isVegan) badges.push({ label: 'Vegan', variant: 'default' })
  if (item.isGlutenFree) badges.push({ label: 'Gluten-free', variant: 'outline' })

  if (badges.length === 0) return null

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {badges.map((badge) => (
        <Badge key={badge.label} variant={badge.variant}>
          {badge.label}
        </Badge>
      ))}
    </div>
  )
}
