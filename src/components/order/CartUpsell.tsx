import { Plus, Sparkles } from 'lucide-react'
import type { MenuData, MenuItem, Order } from '../../types.ts'
import { Button } from '../ui/Button.tsx'
import { Flex } from '../ui/Flex.tsx'
import { Heading } from '../ui/Heading.tsx'
import { Image } from '../ui/Image.tsx'
import { Price } from '../ui/Price.tsx'
import { Stack } from '../ui/Stack.tsx'
import { Surface } from '../ui/Surface.tsx'
import { Text } from '../ui/Text.tsx'

export interface CartUpsellProps {
  menu: MenuData
  order: Order
  onAdd: (item: MenuItem) => void
}

const MAIN_COURSE_CATEGORIES = new Set([
  'starters',
  'soups',
  'salads',
  'meat',
  'fish',
  'pasta',
  'pizza',
  'vegetarian',
])

function findItem(menu: MenuData, id: string): MenuItem | undefined {
  for (const category of menu.categories) {
    const item = category.items.find((i) => i.id === id)
    if (item) return item
  }
  return undefined
}

function findCategoryId(menu: MenuData, itemId: string): string | undefined {
  return menu.categories.find((c) => c.items.some((i) => i.id === itemId))?.id
}

export function CartUpsell({ menu, order, onAdd }: CartUpsellProps) {
  const orderedIds = new Set(order.items.map((i) => i.menuItemId))
  const orderedCategories = new Set(
    order.items.map((i) => findCategoryId(menu, i.menuItemId)).filter(Boolean),
  )

  const recommendations: MenuItem[] = []
  const addIfNew = (item?: MenuItem) => {
    if (item && !orderedIds.has(item.id) && !recommendations.some((r) => r.id === item.id)) {
      recommendations.push(item)
    }
  }

  // Use explicit "perfect with" pairings from ordered items first.
  order.items.forEach((lineItem) => {
    const item = findItem(menu, lineItem.menuItemId)
    item?.perfectWith?.forEach((pairing) => addIfNew(findItem(menu, pairing.id)))
  })

  // Fallback category rules: suggest drinks with mains, desserts after mains/starters.
  const hasMains = [...orderedCategories].some((id) => MAIN_COURSE_CATEGORIES.has(id as string))
  const hasDrinks = orderedCategories.has('drinks')
  const hasDesserts = orderedCategories.has('desserts')

  if (hasMains && !hasDrinks) {
    menu.categories
      .find((c) => c.id === 'drinks')
      ?.items.slice(0, 2)
      .forEach(addIfNew)
  }

  if (hasMains && !hasDesserts) {
    menu.categories
      .find((c) => c.id === 'desserts')
      ?.items.slice(0, 2)
      .forEach(addIfNew)
  }

  const picks = recommendations.slice(0, 3)
  if (picks.length === 0) return null

  return (
    <Surface className="p-4 sm:p-5">
      <Stack gap={3}>
        <Flex align="center" gap={2}>
          <Sparkles className="h-4 w-4 text-[var(--color-accent)]" />
          <Heading level={3} variant="title" onSurface className="text-base">
            Goes great with
          </Heading>
        </Flex>

        <Stack gap={3}>
          {picks.map((item) => (
            <Flex
              key={item.id}
              align="center"
              gap={3}
              className="rounded-[var(--radius-lg)] border border-[var(--color-border-on-surface-subtle)] p-2 pr-3"
            >
              <Image
                src={item.image}
                alt=""
                aspectRatio="square"
                className="h-14 w-14 shrink-0 rounded-[var(--radius-md)]"
              />
              <div className="min-w-0 flex-1">
                <Text
                  variant="body"
                  onSurface
                  className="truncate font-medium text-[var(--color-heading-on-surface)]"
                >
                  {item.name}
                </Text>
                <Text variant="caption" onSurface className="line-clamp-1">
                  {item.description}
                </Text>
              </div>
              <div className="shrink-0 text-right">
                <Price amount={item.price} size="sm" onSurface />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onAdd(item)}
                  iconLeft={<Plus className="h-4 w-4" />}
                  className="mt-1 px-2"
                >
                  Add
                </Button>
              </div>
            </Flex>
          ))}
        </Stack>
      </Stack>
    </Surface>
  )
}
