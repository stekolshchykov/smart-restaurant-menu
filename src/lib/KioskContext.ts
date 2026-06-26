import { createContext } from 'react'

export const ADMIN_PIN = '123123'

export interface KioskAdminActions {
  onResetOrder: () => void
  onBackToSetup: () => void
}

export interface KioskContextValue {
  isFullscreen: boolean
  isSupported: boolean
  isLocked: boolean
  isAdminModalOpen: boolean
  isAdminUnlocked: boolean
  adminError: string | null
  wasFullscreen: boolean
  enterFullscreen: () => Promise<void>
  exitFullscreen: () => Promise<void>
  openAdminModal: () => void
  closeAdminModal: () => void
  submitAdminPin: (pin: string) => void
  resetAdminUnlock: () => void
  performAdminAction: (action: 'exitFullscreen' | 'resetOrder' | 'backToSetup') => void
}

export const KioskContext = createContext<KioskContextValue | null>(null)
