import type { Restaurant } from '../../types.ts'
import { TABLE_NUMBER } from '../../config.ts'
import { Container } from '../ui/Container.tsx'
import { Heading } from '../ui/Heading.tsx'
import { Image } from '../ui/Image.tsx'
import { Text } from '../ui/Text.tsx'

export interface MenuIntroHeaderProps {
  restaurant: Restaurant
  tableNumber?: string
}

export function MenuIntroHeader({
  restaurant,
  tableNumber = TABLE_NUMBER,
}: MenuIntroHeaderProps) {
  const tagline = restaurant.tagline || restaurant.subtitle

  return (
    <div className="border-b border-[var(--color-border)] bg-[var(--color-bg)]/95">
      <Container size="xl">
        <div className="flex flex-col items-center py-6 text-center sm:py-8">
          {restaurant.logo && (
            <Image
              src={restaurant.logo}
              alt=""
              aspectRatio="square"
              className="h-14 w-14 rounded-full shadow-[var(--shadow-md)] sm:h-16 sm:w-16"
            />
          )}

          <Heading
            level={1}
            variant="display"
            className="mt-3 sm:mt-4"
          >
            {restaurant.name}
          </Heading>

          <Text
            variant="muted"
            className="mt-1 max-w-md text-sm"
          >
            {tagline} · Table {tableNumber}
          </Text>
        </div>
      </Container>
    </div>
  )
}
