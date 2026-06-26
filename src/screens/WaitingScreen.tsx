import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, CheckCircle, UtensilsCrossed } from 'lucide-react'
import type { Order } from '../types.ts'
import { Layout } from '../components/layout/Layout.tsx'
import { OrderTimer } from '../components/order/OrderTimer.tsx'
import { Button } from '../components/ui/Button.tsx'
import { Container } from '../components/ui/Container.tsx'
import { Divider } from '../components/ui/Divider.tsx'
import { Flex } from '../components/ui/Flex.tsx'
import { Heading } from '../components/ui/Heading.tsx'
import { Price } from '../components/ui/Price.tsx'
import { Stack } from '../components/ui/Stack.tsx'
import {
  StaggerContainer,
  StaggerItem,
} from '../components/ui/StaggerContainer.tsx'
import { Surface } from '../components/ui/Surface.tsx'
import { Text } from '../components/ui/Text.tsx'
import { formatOrderNumber } from '../lib/formatters.ts'
import { lineItemTotal, orderTotal } from '../lib/calculations.ts'

export interface WaitingScreenProps {
  order: Order
  onBackToMenu: () => void
  onStartNewOrder: () => void
}

const TEN_MINUTES = 10 * 60

export function WaitingScreen({
  order,
  onBackToMenu,
  onStartNewOrder,
}: WaitingScreenProps) {
  const [secondsRemaining, setSecondsRemaining] = useState(TEN_MINUTES)
  const total = useMemo(() => orderTotal(order), [order])

  useEffect(() => {
    setSecondsRemaining(TEN_MINUTES)
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [order.id])

  return (
    <Layout showCartButton={false} onLogoClick={onStartNewOrder}>
      <Container size="md" className="py-8">
        <Stack gap={6} align="center" className="text-center">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          >
            <Surface className="rounded-full border-0 bg-[var(--color-success-bg)] p-4">
              <CheckCircle className="h-12 w-12 text-[var(--color-success)]" />
            </Surface>
          </motion.div>

          <StaggerContainer
            stagger={0.08}
            delayChildren={0.15}
            className="contents"
          >
            <StaggerItem>
              <Stack gap={2} align="center">
                <Heading level={1} variant="display">
                  Your order is being prepared
                </Heading>
                <Text variant="body">Order {formatOrderNumber(order.id)}</Text>
              </Stack>
            </StaggerItem>

            <StaggerItem>
              <OrderTimer
                secondsRemaining={secondsRemaining}
                totalSeconds={TEN_MINUTES}
              />
            </StaggerItem>

            <StaggerItem className="w-full">
              <Surface className="w-full p-4 text-left">
                <Flex align="center" gap={2} className="mb-3">
                  <UtensilsCrossed className="h-5 w-5 text-[var(--color-accent)]" />
                  <Heading level={2} variant="section" onSurface>
                    Ordered items
                  </Heading>
                </Flex>

                <Stack gap={2}>
                  {order.items.map((item) => (
                    <Flex
                      key={item.id}
                      justify="between"
                      align="center"
                      gap={4}
                    >
                      <Flex gap={2} align="center" className="min-w-0 flex-1">
                        <Text
                          variant="body"
                          onSurface
                          className="w-8 shrink-0 text-right tabular-nums"
                        >
                          {item.quantity}×
                        </Text>
                        <Text
                          variant="body"
                          onSurface
                          className="truncate text-left"
                        >
                          {item.name}
                        </Text>
                      </Flex>
                      <Price amount={lineItemTotal(item)} size="sm" onSurface />
                    </Flex>
                  ))}
                </Stack>

                <Divider onSurface className="my-3" />

                <Flex justify="between" align="center">
                  <Heading level={3} variant="title" onSurface>
                    Total
                  </Heading>
                  <Price amount={total} size="lg" onSurface />
                </Flex>
              </Surface>
            </StaggerItem>

            <StaggerItem className="w-full">
              <Stack gap={3} className="w-full">
                <Button
                  variant="outline-inverse"
                  size="lg"
                  fullWidth
                  onClick={onBackToMenu}
                  iconLeft={<ArrowLeft className="h-4 w-4" />}
                >
                  Back to menu
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={onStartNewOrder}
                >
                  Start new order
                </Button>
              </Stack>
            </StaggerItem>
          </StaggerContainer>
        </Stack>
      </Container>
    </Layout>
  )
}
