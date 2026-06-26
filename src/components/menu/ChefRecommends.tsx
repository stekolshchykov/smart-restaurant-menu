import { ChefHat } from 'lucide-react'
import type { MenuItem } from '../../types.ts'
import { Badge } from '../ui/Badge.tsx'
import { Card } from '../ui/Card.tsx'
import { Heading } from '../ui/Heading.tsx'
import { Image } from '../ui/Image.tsx'
import { Price } from '../ui/Price.tsx'
import { Stack } from '../ui/Stack.tsx'
import { Text } from '../ui/Text.tsx'

export interface ChefRecommendsProps {
  items: MenuItem[]
  onItemClick: (item: MenuItem) => void
}

export function ChefRecommends({ items, onItemClick }: ChefRecommendsProps) {
  if (items.length === 0) return null

  return (
    <div className="border-b border-[var(--color-border)] bg-[var(--color-bg)]/95 py-5">
      <div className="scrollbar-hide -mx-4 flex gap-4 overflow-x-auto px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="w-56 shrink-0">
          <Stack gap={2}>
            <Badge variant="featured" className="w-fit gap-1">
              <ChefHat className="h-3 w-3" />
              Chef recommends
            </Badge>
            <Heading level={2} variant="section" className="text-xl sm:text-2xl">
              Staff picks
            </Heading>
            <Text variant="muted" className="text-sm">
              Hand-picked dishes our kitchen is especially proud of tonight.
            </Text>
          </Stack>
        </div>

        {items.map((item, index) => (
          <Card
            key={item.id}
            onClick={() => onItemClick(item)}
            hover
            className="group w-64 shrink-0"
          >
            <div className="relative">
              <Image
                src={item.image}
                alt=""
                aspectRatio="16/9"
                priority={index < 3}
                className="rounded-none"
              />
              <div className="absolute top-2 left-2">
                <Badge variant="featured">Chef's choice</Badge>
              </div>
            </div>
            <Stack gap={2} className="p-3">
              <div className="flex items-start justify-between gap-2">
                <Heading level={3} variant="title" onSurface className="line-clamp-1 text-base">
                  {item.name}
                </Heading>
                <Price amount={item.price} size="sm" onSurface />
              </div>
              <Text variant="body-sm" onSurface className="line-clamp-2">
                {item.description}
              </Text>
            </Stack>
          </Card>
        ))}
      </div>
    </div>
  )
}
