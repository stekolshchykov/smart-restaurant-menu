import { useRef } from 'react'
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion'
import type { MenuItem, OrderAddon } from '../../types'
import { formatCurrency } from '../../lib/formatters'
import { AddonSelector } from './AddonSelector'
import { ChefNote } from './ChefNote'
import { DishBadges } from './DishBadges'
import { DishGallery } from './DishGallery'
import { PerfectWith } from './PerfectWith'
import { RelatedDishes } from './RelatedDishes'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Divider } from '../ui/Divider'
import { FadeIn } from '../ui/FadeIn'
import { Flex } from '../ui/Flex'
import { Heading } from '../ui/Heading'
import { Image } from '../ui/Image'
import { Price } from '../ui/Price'
import { Stack } from '../ui/Stack'
import { Stepper } from '../ui/Stepper'
import { Surface } from '../ui/Surface'
import { Text } from '../ui/Text'

export interface MenuItemDetailsProps {
  item: MenuItem
  relatedItems: MenuItem[]
  quantity: number
  onQuantityChange: (quantity: number) => void
  selectedAddons: Record<string, number>
  onAddonChange: (addonId: string, quantity: number) => void
  onAddToOrder: () => void
  onRelatedItemClick: (item: MenuItem) => void
  onPairingClick?: (id: string) => void
}

export function MenuItemDetails({
  item,
  relatedItems,
  quantity,
  onQuantityChange,
  selectedAddons,
  onAddonChange,
  onAddToOrder,
  onRelatedItemClick,
  onPairingClick,
}: MenuItemDetailsProps) {
  const shouldReduceMotion = useReducedMotion()
  const imageRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: imageRef,
    offset: ['start end', 'end start'],
  })
  const imageScale = useTransform(
    scrollYProgress,
    [0, 1],
    shouldReduceMotion ? [1, 1] : [1, 1.08],
  )

  const addonsTotal = item.addons.reduce(
    (sum, addon) => sum + addon.price * (selectedAddons[addon.id] || 0),
    0,
  )
  const unitTotal = item.price + addonsTotal
  const total = unitTotal * quantity

  const selectedAddonList: OrderAddon[] = item.addons
    .filter((addon) => (selectedAddons[addon.id] || 0) > 0)
    .map((addon) => ({ ...addon, quantity: selectedAddons[addon.id] }))

  const visualBlock = (
    <FadeIn delay={0} direction="up">
      <motion.div
        ref={imageRef}
        className="overflow-hidden rounded-[var(--radius-lg)]"
        style={{ scale: imageScale }}
      >
        <Image
          src={item.image}
          alt={item.name}
          aspectRatio="video"
          priority
          className="max-h-[55vh] w-full object-cover"
        />
      </motion.div>

      <DishGallery item={item} perfectWith={item.perfectWith} className="mt-4" />

      {item.perfectWith && item.perfectWith.length > 0 && (
        <div className="mt-6">
          <PerfectWith
            items={item.perfectWith}
            onSelect={onPairingClick}
          />
        </div>
      )}

      {relatedItems.length > 0 && (
        <div className="mt-6">
          <RelatedDishes
            items={relatedItems}
            onItemClick={onRelatedItemClick}
          />
        </div>
      )}
    </FadeIn>
  )

  const infoBlock = (
    <Surface className="p-4 sm:p-6">
      <Stack gap={6}>
        <FadeIn delay={0.05} direction="up">
          <Stack gap={3}>
            <DishBadges item={item} />
            <Heading level={1} variant="display" onSurface>
              {item.name}
            </Heading>
            <Price amount={item.price} size="lg" onSurface />
            <Text variant="body" onSurface>
              {item.description}
            </Text>
          </Stack>
        </FadeIn>

        {item.chefNote && (
          <FadeIn delay={0.1} direction="up">
            <ChefNote note={item.chefNote} />
          </FadeIn>
        )}

        {item.ingredients.length > 0 && (
          <FadeIn delay={0.15} direction="up">
            <Stack gap={2}>
              <Heading level={2} variant="section" onSurface>
                Ingredients
              </Heading>
              <Flex gap={2} wrap>
                {item.ingredients.map((ingredient) => (
                  <Badge key={ingredient} variant="outline">
                    {ingredient}
                  </Badge>
                ))}
              </Flex>
            </Stack>
          </FadeIn>
        )}

        {item.allergens.length > 0 && (
          <FadeIn delay={0.2} direction="up">
            <Stack gap={2}>
              <Heading level={2} variant="section" onSurface>
                Allergens
              </Heading>
              <Flex gap={2} wrap>
                {item.allergens.map((allergen) => (
                  <Badge key={allergen} variant="error">
                    {allergen}
                  </Badge>
                ))}
              </Flex>
            </Stack>
          </FadeIn>
        )}

        {item.addons.length > 0 && (
          <FadeIn delay={0.25} direction="up">
            <Stack gap={3}>
              <Heading level={2} variant="section" onSurface>
                Extras
              </Heading>
              <AddonSelector
                addons={item.addons}
                selected={selectedAddons}
                onChange={onAddonChange}
              />
            </Stack>
          </FadeIn>
        )}

        <FadeIn delay={0.3} direction="up">
          <Divider onSurface />
        </FadeIn>

        <FadeIn delay={0.35} direction="up">
          <Stack gap={4}>
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

            {selectedAddonList.length > 0 && (
              <Text variant="body-sm" onSurface>
                {selectedAddonList.map((addon) => (
                  <span key={addon.id} className="mr-3">
                    {addon.quantity}× {addon.name}
                  </span>
                ))}
              </Text>
            )}
          </Stack>
        </FadeIn>

        <FadeIn delay={0.4} direction="up">
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
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8">
      <div className="lg:sticky lg:top-[calc(var(--header-total-height)+1rem)] lg:self-start">
        {visualBlock}
      </div>
      {infoBlock}
    </div>
  )
}
