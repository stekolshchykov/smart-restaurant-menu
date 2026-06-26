import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, CheckCircle, ChefHat, Sparkles } from 'lucide-react'
import type { Order } from '../types.ts'
import { Layout } from '../components/layout/Layout.tsx'
import { OrderLineItemReadOnly } from '../components/order/OrderLineItemReadOnly.tsx'
import { OrderTimer } from '../components/order/OrderTimer.tsx'
import { PreparationStatus } from '../components/order/PreparationStatus.tsx'
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
import { orderTotal } from '../lib/calculations.ts'

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
  const elapsedSeconds = TEN_MINUTES - secondsRemaining

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
      <Container size="md" className="py-6 sm:py-10">
        <Stack gap={8} align="center" className="text-center">
          <StaggerContainer
            stagger={0.08}
            delayChildren={0.1}
            className="contents"
          >
            <StaggerItem>
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                className="relative inline-flex"
              >
                <Surface className="rounded-full border-0 bg-[var(--color-success-bg)] p-5 shadow-[var(--shadow-glow)]">
                  <CheckCircle className="h-12 w-12 text-[var(--color-success)]" />
                </Surface>
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3,
                    ease: 'easeInOut',
                  }}
                  className="absolute -top-1 -right-1"
                >
                  <Sparkles className="h-5 w-5 text-[var(--color-accent)]" />
                </motion.div>
              </motion.div>
            </StaggerItem>

            <StaggerItem>
              <Stack gap={2} align="center">
                <Heading level={1} variant="display">
                  Your order is being prepared
                </Heading>
                <Surface className="inline-flex items-center gap-2 border-0 bg-[var(--color-accent-bg)] px-4 py-1.5">
                  <ChefHat className="h-4 w-4 text-[var(--color-accent)]" />
                  <Text variant="body-sm" className="text-[var(--color-accent)]">
                    Order #{formatOrderNumber(order.id)}
                  </Text>
                </Surface>
              </Stack>
            </StaggerItem>

            <StaggerItem>
              <OrderTimer
                secondsRemaining={secondsRemaining}
                totalSeconds={TEN_MINUTES}
                label="Estimated ready time"
                size={180}
                statusText={(seconds) =>
                  seconds === 0
                    ? 'Your order is ready'
                    : 'We will bring it to your table soon'
                }
              />
            </StaggerItem>

            <StaggerItem>
              <PreparationStatus
                elapsedSeconds={elapsedSeconds}
                totalSeconds={TEN_MINUTES}
              />
            </StaggerItem>

            <StaggerItem className="w-full">
              <Surface elevated className="w-full max-w-lg p-5 text-left sm:p-6">
                <Flex align="center" gap={2} className="mb-4">
                  <ChefHat className="h-5 w-5 text-[var(--color-accent)]" />
                  <Heading level={2} variant="section" onSurface>
                    Your order
                  </Heading>
                </Flex>

                <Stack gap={4}>
                  {order.items.map((item) => (
                    <OrderLineItemReadOnly key={item.id} item={item} />
                  ))}
                </Stack>

                <Divider onSurface className="my-4" />

                <Flex justify="between" align="center">
                  <Heading level={3} variant="title" onSurface>
                    Total
                  </Heading>
                  <Price amount={total} size="lg" />
                </Flex>
              </Surface>
            </StaggerItem>

            <StaggerItem className="w-full">
              <Stack gap={3} className="w-full max-w-md">
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
