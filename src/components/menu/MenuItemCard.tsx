import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import type { MenuItem } from '../../types'
import { Badge } from '../ui/Badge'
import { Card } from '../ui/Card'
import { Heading } from '../ui/Heading'
import { Image } from '../ui/Image'
import { Price } from '../ui/Price'
import { Stack } from '../ui/Stack'
import { Text } from '../ui/Text'

export interface MenuItemCardProps {
  item: MenuItem
  onClick: () => void
}

export function MenuItemCard({ item, onClick }: MenuItemCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const badges = [
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
    <motion.div
      className="h-full"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card onClick={onClick} hover className="flex h-full flex-col">
        <Image
          src={item.image}
          alt={item.name}
          aspectRatio="4/3"
          hoverZoom
          className="rounded-none"
        />

        <Stack gap={3} className="flex-1 p-4">
          <div className="flex items-start justify-between gap-2">
            <Heading level={3} variant="title" onSurface>
              {item.name}
            </Heading>
            <Price amount={item.price} onSurface />
          </div>

          <Text variant="body-sm" onSurface className="line-clamp-2">
            {item.description}
          </Text>

          <motion.div
            className="mt-auto flex items-center gap-1"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : -8 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          >
            <Text variant="caption" onSurface>
              View
            </Text>
            <Text variant="caption" onSurface as="span">
              <ArrowRight className="h-4 w-4" />
            </Text>
          </motion.div>

          {(badges.length > 0 || item.tags?.length) && (
            <div className="flex flex-wrap gap-1.5">
              {badges.map((badge) => (
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
    </motion.div>
  )
}
