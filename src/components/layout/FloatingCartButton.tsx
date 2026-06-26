import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ChevronRight, ShoppingBag } from 'lucide-react'
import { Button } from '../ui/Button'
import { Flex } from '../ui/Flex'
import { Price } from '../ui/Price'
import { Text } from '../ui/Text'

export interface FloatingCartButtonProps {
  itemCount: number
  total: number
  onClick: () => void
  hidden?: boolean
}

export function FloatingCartButton({
  itemCount,
  total,
  onClick,
  hidden = false,
}: FloatingCartButtonProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <AnimatePresence>
      {!hidden && itemCount > 0 && (
        <motion.div
          initial={{ y: shouldReduceMotion ? 0 : 100, opacity: shouldReduceMotion ? 1 : 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: shouldReduceMotion ? 0 : 100, opacity: shouldReduceMotion ? 1 : 0 }}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : { type: 'spring', stiffness: 400, damping: 28 }
          }
          className="fixed left-1/2 z-50 max-w-[calc(100%-6rem)] -translate-x-1/2"
          style={{ bottom: 'calc(env(safe-area-inset-bottom) + 1.25rem)' }}
        >
          <Button
            variant="primary"
            size="lg"
            onClick={onClick}
            iconLeft={<ShoppingBag className="h-5 w-5" />}
            iconRight={<ChevronRight className="h-5 w-5" />}
            className="rounded-full shadow-[var(--shadow-lg)]"
          >
            <Flex gap={3} align="center">
              <motion.span
                key={itemCount}
                layout={!shouldReduceMotion}
                initial={{ scale: shouldReduceMotion ? 1 : 0.8, opacity: shouldReduceMotion ? 1 : 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : { type: 'spring', stiffness: 500, damping: 30 }
                }
              >
                <Text variant="body" className="text-[var(--color-surface)]">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </Text>
              </motion.span>
              <motion.span layout={!shouldReduceMotion}>
                <Price
                  amount={total}
                  size="md"
                  className="text-[var(--color-surface)]"
                />
              </motion.span>
            </Flex>
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
