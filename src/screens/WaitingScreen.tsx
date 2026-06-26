import { useEffect, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  Bell,
  CheckCircle,
  ChefHat,
  Receipt,
  Sparkles,
  UtensilsCrossed,
} from 'lucide-react'
import type { Order } from '../types.ts'
import { Layout } from '../components/layout/Layout.tsx'
import { OrderLineItemReadOnly } from '../components/order/OrderLineItemReadOnly.tsx'
import { OrderTimer } from '../components/order/OrderTimer.tsx'
import { PreparationStatus } from '../components/order/PreparationStatus.tsx'
import { Badge } from '../components/ui/Badge.tsx'
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

function DecorativeBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div
        className="absolute -top-1/4 left-1/2 h-[60rem] w-[60rem] -translate-x-1/2 rounded-full opacity-30 blur-3xl"
        style={{
          background:
            'radial-gradient(circle, var(--color-primary-bg) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute top-1/3 -right-1/4 h-[40rem] w-[40rem] rounded-full opacity-20 blur-3xl"
        style={{
          background:
            'radial-gradient(circle, var(--color-success-bg) 0%, transparent 70%)',
        }}
      />
    </div>
  )
}

export function WaitingScreen({
  order,
  onBackToMenu,
  onStartNewOrder,
}: WaitingScreenProps) {
  const [secondsRemaining, setSecondsRemaining] = useState(TEN_MINUTES)
  const [timerSize, setTimerSize] = useState(220)
  const total = useMemo(() => orderTotal(order), [order])
  const elapsedSeconds = TEN_MINUTES - secondsRemaining
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    const updateSize = () => {
      setTimerSize(window.innerWidth < 640 ? 180 : 220)
    }
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

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
    <Layout onBack={onBackToMenu} title="Order confirmed">
      <DecorativeBackground />

      <Container size="md" className="relative z-10 py-6 sm:py-10">
        <StaggerContainer
          stagger={0.1}
          delayChildren={0.15}
          className="flex flex-col items-center gap-8"
        >
          <StaggerItem className="flex flex-col items-center gap-4 text-center">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { type: 'spring', stiffness: 260, damping: 18 }
              }
              className="relative inline-flex"
            >
              <div className="rounded-full border border-[var(--color-success)]/20 bg-[var(--color-success-bg)] p-5 shadow-[var(--shadow-glow)]">
                <CheckCircle className="h-12 w-12 text-[var(--color-success)]" />
              </div>
              <motion.div
                animate={{ rotate: [0, 12, -12, 0] }}
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : {
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 3,
                        ease: 'easeInOut',
                      }
                }
                className="absolute -top-1 -right-1"
              >
                <Sparkles className="h-5 w-5 text-[var(--color-accent)]" />
              </motion.div>
            </motion.div>

            <Stack gap={2} align="center">
              <Heading level={1} variant="display" className="text-3xl sm:text-5xl">
                Order confirmed
              </Heading>

              <Flex gap={2} align="center" wrap className="justify-center">
                <Badge variant="success" className="h-7 gap-1 px-3 text-xs">
                  <CheckCircle className="h-3 w-3" />
                  Confirmed
                </Badge>
                <Badge variant="outline" className="h-7 gap-1 px-3 text-xs">
                  <ChefHat className="h-3 w-3" />
                  Order #{formatOrderNumber(order.id)}
                </Badge>
              </Flex>
            </Stack>
          </StaggerItem>

          <StaggerItem className="w-full max-w-sm">
            <OrderTimer
              secondsRemaining={secondsRemaining}
              totalSeconds={TEN_MINUTES}
              label="Estimated waiting time"
              size={timerSize}
              statusText={(seconds) =>
                seconds === 0
                  ? 'Your order is ready'
                  : seconds < 120
                    ? 'Almost ready'
                    : 'Preparing your order'
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
            <Surface elevated className="w-full overflow-hidden">
              <div className="border-b border-[var(--color-border-on-surface-subtle)] bg-[var(--color-surface-elevated)] p-4 sm:p-5">
                <Flex align="center" justify="between" gap={3}>
                  <Flex align="center" gap={3}>
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-bg)]">
                      <Receipt className="h-5 w-5 text-[var(--color-accent)]" />
                    </div>
                    <Stack gap={0}>
                      <Heading level={2} variant="section" onSurface className="text-xl">
                        Your order
                      </Heading>
                      <Text variant="body-sm" onSurface>
                        {order.items.length}{' '}
                        {order.items.length === 1 ? 'item' : 'items'}
                      </Text>
                    </Stack>
                  </Flex>

                  <Badge variant="default" className="hidden sm:inline-flex">
                    Table 07
                  </Badge>
                </Flex>
              </div>

              <div className="px-4 sm:px-5">
                <Stack gap={0}>
                  {order.items.map((item, index) => (
                    <div key={item.id}>
                      <OrderLineItemReadOnly item={item} />
                      {index < order.items.length - 1 && (
                        <Divider onSurface className="border-dashed" />
                      )}
                    </div>
                  ))}
                </Stack>
              </div>

              <div className="border-t border-[var(--color-border-on-surface-subtle)] bg-[var(--color-surface)] p-4 sm:p-5">
                <Flex justify="between" align="center">
                  <Text variant="label" onSurface>
                    Total
                  </Text>
                  <Price amount={total} size="lg" onSurface />
                </Flex>
              </div>
            </Surface>
          </StaggerItem>

          <StaggerItem className="w-full">
            <Surface className="w-full p-4 sm:p-5">
              <Flex align="center" gap={4} className="flex-col sm:flex-row">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-bg)]">
                  <Bell className="h-5 w-5 text-[var(--color-accent)]" />
                </div>
                <Stack gap={1} className="text-center sm:text-left">
                  <Text variant="label" onSurface>
                    Need anything else?
                  </Text>
                  <Text variant="body-sm" onSurface>
                    Call your waiter, ask for water, napkins, cutlery or the bill using the Service button.
                  </Text>
                </Stack>
                <div className="hidden sm:block" />
              </Flex>
            </Surface>
          </StaggerItem>

          <StaggerItem className="w-full pb-[calc(var(--safe-area-bottom)+var(--floating-chrome-bottom))]">
            <div className="mx-auto w-full max-w-lg">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={onStartNewOrder}
                iconLeft={<UtensilsCrossed className="h-4 w-4" />}
              >
                Start new order
              </Button>
            </div>
          </StaggerItem>
        </StaggerContainer>
      </Container>
    </Layout>
  )
}
