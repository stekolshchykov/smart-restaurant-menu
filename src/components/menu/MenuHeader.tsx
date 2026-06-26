import type { Restaurant } from '../../types'
import { Container } from '../ui/Container.tsx'
import { Heading } from '../ui/Heading.tsx'
import { Image } from '../ui/Image.tsx'
import { Text } from '../ui/Text.tsx'

export interface MenuHeaderProps {
  restaurant: Restaurant
}

export function MenuHeader({ restaurant }: MenuHeaderProps) {
  return (
    <div className="border-b border-[var(--color-border)] bg-[var(--color-bg)]/95 py-4 backdrop-blur-sm">
      <Container size="xl">
        <div className="flex items-center gap-4">
          {restaurant.logo && (
            <Image
              src={restaurant.logo}
              alt=""
              aspectRatio="square"
              className="h-14 w-14 shrink-0 rounded-full"
            />
          )}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <Heading level={1} variant="title" className="text-xl sm:text-2xl">
                {restaurant.name}
              </Heading>
              <Text variant="caption" className="hidden sm:block">
                {restaurant.subtitle}
              </Text>
            </div>

            <Text variant="body-sm" className="mt-0.5 line-clamp-1">
              {restaurant.description}
            </Text>
          </div>
        </div>
      </Container>
    </div>
  )
}
