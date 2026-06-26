import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Bell } from 'lucide-react'
import serviceRequests from '../../data/serviceRequests.json'
import { useToast } from '../../lib/useToast.ts'
import { Button } from '../ui/Button.tsx'
import { ServiceRequestPanel } from './ServiceRequestPanel.tsx'

export function ServiceRequestButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [requestedId, setRequestedId] = useState<string | null>(null)
  const { show } = useToast()
  const shouldReduceMotion = useReducedMotion()

  const handleSelect = (action: { id: string; label: string; message: string }) => {
    setRequestedId(action.id)

    setTimeout(() => {
      setIsOpen(false)
      show(`${action.label} — ${action.message}`)
      setRequestedId(null)
    }, 300)
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : { type: 'spring', stiffness: 400, damping: 26 }
        }
        className="fixed right-4 z-50 sm:right-6"
        style={{ bottom: 'calc(env(safe-area-inset-bottom) + 1.25rem)' }}
      >
        <Button
          onClick={() => {
            setRequestedId(null)
            setIsOpen(true)
          }}
          aria-label="Service"
          variant="secondary-inverse"
          size="lg"
          iconLeft={<Bell className="h-5 w-5" />}
          className="rounded-full shadow-[var(--shadow-lg)]"
        >
          <span className="hidden sm:inline">Service</span>
        </Button>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={handleClose}
              aria-hidden="true"
            />

            <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
              <motion.div
                initial={{ y: shouldReduceMotion ? 0 : '100%' }}
                animate={{ y: 0 }}
                exit={{ y: shouldReduceMotion ? 0 : '100%' }}
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : { type: 'spring', stiffness: 320, damping: 30 }
                }
                className="w-full"
              >
                <ServiceRequestPanel
                  actions={serviceRequests}
                  requestedId={requestedId}
                  onSelect={handleSelect}
                  onClose={handleClose}
                />
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
