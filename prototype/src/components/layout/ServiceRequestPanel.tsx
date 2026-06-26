import { AnimatePresence, motion } from 'framer-motion'
import {
  CheckCircle,
  ConciergeBell,
  Droplets,
  HelpCircle,
  Receipt,
  ScrollText,
  Utensils,
  X,
} from 'lucide-react'
import type { ServiceRequest } from '../../types.ts'
import { useModalFocus } from '../../lib/useModalFocus.ts'
import { Button } from '../ui/Button.tsx'
import { Flex } from '../ui/Flex.tsx'
import { Heading } from '../ui/Heading.tsx'
import { IconButton } from '../ui/IconButton.tsx'
import { Stack } from '../ui/Stack.tsx'
import { Surface } from '../ui/Surface.tsx'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  waiter: ConciergeBell,
  water: Droplets,
  napkins: ScrollText,
  cutlery: Utensils,
  bill: Receipt,
  help: HelpCircle,
}

export interface ServiceRequestPanelProps {
  actions: ServiceRequest[]
  requestedId: string | null
  onSelect: (action: ServiceRequest) => void
  onClose: () => void
}

export function ServiceRequestPanel({
  actions,
  requestedId,
  onSelect,
  onClose,
}: ServiceRequestPanelProps) {
  const containerRef = useModalFocus(true, onClose)

  return (
    <Surface
      ref={containerRef}
      tabIndex={-1}
      elevated
      className="w-full max-w-sm p-5 sm:p-6 outline-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="service-panel-title"
    >
      <Flex align="center" justify="between" className="mb-5">
        <Heading level={3} variant="section" onSurface id="service-panel-title">
          How can we help?
        </Heading>
        <IconButton
          onClick={onClose}
          aria-label="Close service menu"
          variant="ghost"
          size="md"
        >
          <X className="h-5 w-5" />
        </IconButton>
      </Flex>

      <Stack gap={3}>
        {actions.map((action) => {
          const Icon = iconMap[action.id]
          const isRequested = requestedId === action.id
          const isBusy = requestedId !== null && !isRequested

          return (
            <AnimatePresence mode="wait" key={action.id}>
              {isRequested ? (
                <motion.div
                  key="requested"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    disabled
                    iconLeft={<CheckCircle className="h-5 w-5" />}
                    className="shadow-[var(--shadow-glow)]"
                  >
                    Requested
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="action"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    variant="outline"
                    size="lg"
                    fullWidth
                    disabled={isBusy}
                    iconLeft={Icon ? <Icon className="h-5 w-5" /> : undefined}
                    onClick={() => onSelect(action)}
                  >
                    {action.label}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          )
        })}
      </Stack>
    </Surface>
  )
}
