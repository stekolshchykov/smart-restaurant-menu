import {
  useCallback,
  useMemo,
  useState,
} from 'react'
import {
  ADMIN_PIN,
  KioskContext,
  type KioskAdminActions,
  type KioskContextValue,
} from '../../lib/KioskContext.ts'
import { useFullscreen } from '../../lib/useFullscreen.ts'

export interface KioskProviderProps {
  children: React.ReactNode
  adminActions: KioskAdminActions
}

export function KioskProvider({ children, adminActions }: KioskProviderProps) {
  const {
    isFullscreen,
    isSupported,
    enter,
    exit,
  } = useFullscreen()

  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false)
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false)
  const [adminError, setAdminError] = useState<string | null>(null)
  const [wasFullscreen, setWasFullscreen] = useState(false)

  const enterFullscreen = useCallback(async () => {
    setAdminError(null)
    setWasFullscreen(true)
    await enter()
  }, [enter])

  const exitFullscreen = useCallback(async () => {
    setIsAdminUnlocked(false)
    setAdminError(null)
    setWasFullscreen(false)
    await exit()
  }, [exit])

  const openAdminModal = useCallback(() => {
    setAdminError(null)
    setIsAdminModalOpen(true)
  }, [])

  const closeAdminModal = useCallback(() => {
    setIsAdminModalOpen(false)
    setIsAdminUnlocked(false)
    setAdminError(null)
  }, [])

  const resetAdminUnlock = useCallback(() => {
    setIsAdminUnlocked(false)
    setAdminError(null)
  }, [])

  const submitAdminPin = useCallback((pin: string) => {
    if (pin === ADMIN_PIN) {
      setIsAdminUnlocked(true)
      setAdminError(null)
    } else {
      setIsAdminUnlocked(false)
      setAdminError('Incorrect PIN. Please try again.')
    }
  }, [])

  const performAdminAction = useCallback(
    (action: 'exitFullscreen' | 'resetOrder' | 'backToSetup') => {
      if (!isAdminUnlocked) return

      switch (action) {
        case 'exitFullscreen':
          void exitFullscreen()
          break
        case 'resetOrder':
          adminActions.onResetOrder()
          break
        case 'backToSetup':
          adminActions.onBackToSetup()
          break
      }

      closeAdminModal()
    },
    [isAdminUnlocked, exitFullscreen, adminActions, closeAdminModal],
  )

  const value = useMemo<KioskContextValue>(
    () => ({
      isFullscreen,
      isSupported,
      isLocked: isFullscreen && !isAdminUnlocked,
      isAdminModalOpen,
      isAdminUnlocked,
      adminError,
      wasFullscreen,
      enterFullscreen,
      exitFullscreen,
      openAdminModal,
      closeAdminModal,
      submitAdminPin,
      resetAdminUnlock,
      performAdminAction,
    }),
    [
      isFullscreen,
      isSupported,
      isAdminUnlocked,
      isAdminModalOpen,
      adminError,
      wasFullscreen,
      enterFullscreen,
      exitFullscreen,
      openAdminModal,
      closeAdminModal,
      submitAdminPin,
      resetAdminUnlock,
      performAdminAction,
    ],
  )

  return <KioskContext.Provider value={value}>{children}</KioskContext.Provider>
}
