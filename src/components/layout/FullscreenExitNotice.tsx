import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Maximize } from 'lucide-react'
import { Button } from '../ui/Button.tsx'
import { Text } from '../ui/Text.tsx'
import { useKiosk } from '../../lib/useKiosk.ts'

export function FullscreenExitNotice() {
  const { isFullscreen, isSupported, wasFullscreen, enterFullscreen } = useKiosk()
  const shouldReduceMotion = useReducedMotion()

  const visible = isSupported && wasFullscreen && !isFullscreen

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
          }
          className="fixed right-4 bottom-[calc(var(--safe-area-bottom)+1.25rem)] left-4 z-[60] sm:left-auto sm:max-w-sm"
        >
          <div className="flex items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 py-3 shadow-[var(--shadow-lg)]">
            <Text variant="body-sm">
              Fullscreen mode is off
            </Text>
            <Button
              variant="primary"
              size="sm"
              onClick={() => void enterFullscreen()}
              iconLeft={<Maximize className="h-4 w-4" />}
            >
              Return
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
