import { useContext } from 'react'
import { KioskContext, type KioskContextValue } from './KioskContext.ts'

export function useKiosk(): KioskContextValue {
  const context = useContext(KioskContext)
  if (!context) {
    throw new Error('useKiosk must be used inside KioskProvider')
  }
  return context
}
