import { useCallback, useMemo, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Toast } from '../ui/Toast.tsx'
import { ToastContext } from './ToastContext.tsx'

interface ToastItem {
  id: string
  message: string
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const show = useCallback((message: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const item: ToastItem = { id, message }
    setToasts((prev) => [...prev, item])

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 2500)
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const value = useMemo(() => ({ show }), [show])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed right-4 left-4 z-[60] flex flex-col items-center gap-2 sm:bottom-6 sm:left-auto sm:items-end"
        style={{ bottom: 'calc(var(--safe-area-bottom) + 6rem)' }}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              message={toast.message}
              onDismiss={() => dismiss(toast.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
