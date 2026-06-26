import { X } from 'lucide-react'
import { motion } from 'framer-motion'
import { IconButton } from './IconButton.tsx'
import { Text } from './Text.tsx'

export interface ToastProps {
  message: string
  onDismiss?: () => void
}

export function Toast({ message, onDismiss }: ToastProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.96 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="pointer-events-auto flex min-w-[16rem] max-w-xs items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 py-3 shadow-[var(--shadow-lg)]"
    >
      <Text variant="body-sm" className="flex-1">
        {message}
      </Text>
      {onDismiss && (
        <IconButton
          size="sm"
          variant="ghost-inverse"
          aria-label="Dismiss"
          onClick={onDismiss}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </IconButton>
      )}
    </motion.div>
  )
}
