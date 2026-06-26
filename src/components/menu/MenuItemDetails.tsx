import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from 'framer-motion'
import type { MenuItem, OrderAddon } from '../../types.ts'
import { formatCurrency } from '../../lib/formatters.ts'
import { AddonSelector } from './AddonSelector.tsx'
import { ChefNote } from './ChefNote.tsx'
import { DishBadges } from './DishBadges.tsx'
import { ProductDetailLayout } from './ProductDetailLayout.tsx'
import { ProductVisualPanel } from './ProductVisualPanel.tsx'
import { SelectedAddonSummary } from './SelectedAddonSummary.tsx'
import { Badge } from '../ui/Badge.tsx'
import { Button } from '../ui/Button.tsx'
import { Divider } from '../ui/Divider.tsx'
import { FadeIn } from '../ui/FadeIn.tsx'
import { Flex } from '../ui/Flex.tsx'
import { Heading } from '../ui/Heading.tsx'
import { Price } from '../ui/Price.tsx'
import { Stack } from '../ui/Stack.tsx'
import { Stepper } from '../ui/Stepper.tsx'
import { Surface } from '../ui/Surface.tsx'
import { Text } from '../ui/Text.tsx'

export interface MenuItemDetailsProps {
  item: MenuItem
  quantity: number
  onQuantityChange: (quantity: number) => void
  selectedAddons: Record<string, number>
  onAddonChange: (addonId: string, quantity: number) => void
  onAddToOrder: () => void
}

export function MenuItemDetails({
  item,
  quantity,
  onQuantityChange,
  selectedAddons,
  onAddonChange,
  onAddToOrder,
}: MenuItemDetailsProps) {
  const shouldReduceMotion = useReducedMotion()
  const addonsTotal = item.addons.reduce(
    (sum, addon) => sum + addon.price * (selectedAddons[addon.id] || 0),
    0,
  )
  const unitTotal = item.price + addonsTotal
  const total = unitTotal * quantity

  const selectedAddonList: OrderAddon[] = item.addons
    .filter((addon) => (selectedAddons[addon.id] || 0) > 0)
    .map((addon) => ({ ...addon, quantity: selectedAddons[addon.id] }))

  const visualPanel = <ProductVisualPanel item={item} />

  const infoPanel = (
    <Surface className="p-4 sm:p-6">
      <Stack gap={3}>
        <FadeIn delay={0.05} direction="up">
          <Stack gap={2}>
            <DishBadges item={item} />
            <Heading
              level={1}
              variant="display"
              onSurface
              className="text-3xl sm:text-4xl lg:text-5xl"
            >
              {item.name}
            </Heading>
            <Price amount={item.price} size="xl" onSurface />
            <Text variant="body" onSurface className="leading-snug">
              {item.description}
            </Text>
          </Stack>
        </FadeIn>

        {item.chefNote && (
          <FadeIn delay={0.1} direction="up">
            <ChefNote note={item.chefNote} />
          </FadeIn>
        )}

        <FadeIn delay={0.15} direction="up">
          <Stack gap={3}>
            {item.ingredients.length > 0 && (
              <Stack gap={2}>
                <Text variant="label" onSurface>
                  Ingredients
                </Text>
                <Flex gap={2} wrap>
                  {item.ingredients.map((ingredient) => (
                    <Badge key={ingredient} variant="outline">
                      {ingredient}
                    </Badge>
                  ))}
                </Flex>
              </Stack>
            )}

            {item.allergens.length > 0 && (
              <Stack gap={2}>
                <Text variant="label" onSurface>
                  Allergens
                </Text>
                <Flex gap={2} wrap>
                  {item.allergens.map((allergen) => (
                    <Badge key={allergen} variant="error">
                      {allergen}
                    </Badge>
                  ))}
                </Flex>
              </Stack>
            )}
          </Stack>
        </FadeIn>

        {item.addons.length > 0 && (
          <FadeIn delay={0.2} direction="up">
            <Surface inverse className="p-4 sm:p-5">
              <Stack gap={3}>
                <Text variant="label" onSurface>
                  Extras
                </Text>
                <AddonSelector
                  addons={item.addons}
                  selected={selectedAddons}
                  onChange={onAddonChange}
                />
              </Stack>
            </Surface>
          </FadeIn>
        )}

        <FadeIn delay={0.25} direction="up">
          <Divider onSurface className="bg-[var(--color-border-on-surface-subtle)]" />
        </FadeIn>

        <FadeIn delay={0.3} direction="up">
          <Stack gap={3}>
            <Flex justify="between" align="center">
              <Text variant="body" onSurface className="font-medium">
                Quantity
              </Text>
              <Stepper
                value={quantity}
                min={1}
                onChange={onQuantityChange}
                onSurface
              />
            </Flex>

            <SelectedAddonSummary addons={selectedAddonList} />
          </Stack>
        </FadeIn>

        <FadeIn delay={0.3} direction="up">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={onAddToOrder}
            className="justify-between"
          >
            <span>Add to order</span>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={total}
                initial={{
                  opacity: shouldReduceMotion ? 1 : 0,
                  y: shouldReduceMotion ? 0 : -8,
                }}
                animate={{ opacity: 1, y: 0 }}
                exit={{
                  opacity: shouldReduceMotion ? 1 : 0,
                  y: shouldReduceMotion ? 0 : 8,
                }}
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : { duration: 0.2, ease: [0.4, 0, 0.2, 1] }
                }
                className="inline-block"
              >
                {formatCurrency(total)}
              </motion.span>
            </AnimatePresence>
          </Button>
        </FadeIn>
      </Stack>
    </Surface>
  )

  return (
    <ProductDetailLayout visual={visualPanel} info={infoPanel} />
  )
}
