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
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Stepper } from '../ui/Stepper'
import { Divider } from '../ui/Divider'
import { FadeIn } from '../ui/FadeIn'
import { Flex } from '../ui/Flex'
import { Heading } from '../ui/Heading'
import { Image } from '../ui/Image'
import { Price } from '../ui/Price'
import { Stack } from '../ui/Stack'
import { Surface } from '../ui/Surface'
import { Text } from '../ui/Text'

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

  const infoSections = (
    <>
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
    </>
  )

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8">
      <FadeIn delay={0} direction="up" className="lg:contents">
        <motion.div
          ref={imageRef}
          className="-mx-4 w-[calc(100%+2rem)] overflow-hidden rounded-none sm:mx-0 sm:w-full sm:rounded-[var(--radius-lg)] lg:sticky lg:top-[calc(var(--header-total-height)+1.5rem)] lg:self-start lg:rounded-[var(--radius-lg)]"
          style={{ scale: imageScale }}
        >
          <Image
            src={item.image}
            alt={item.name}
            aspectRatio="video"
            priority
            className="max-h-[60vh] w-full rounded-none object-cover sm:rounded-[var(--radius-lg)]"
          />
        </motion.div>
      </FadeIn>

      <Surface className="p-4 sm:p-6 lg:self-start">
        <Stack gap={6}>
          <FadeIn delay={0.1} direction="up">
            <Stack gap={2}>
              <Heading level={1} variant="display" onSurface>
                {item.name}
              </Heading>
              <Price amount={item.price} size="lg" onSurface />
              <Text variant="body" onSurface>
                {item.description}
              </Text>
            </Stack>
          </FadeIn>

          {infoSections}
        </Stack>
      </Surface>
    </div>
  )
}
