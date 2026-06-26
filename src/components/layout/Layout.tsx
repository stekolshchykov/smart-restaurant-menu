import type { ReactNode } from 'react'
import { Stack } from '../ui/Stack.tsx'
import { AdminUnlockModal } from './AdminUnlockModal.tsx'
import { FullscreenExitNotice } from './FullscreenExitNotice.tsx'
import { Header } from './Header.tsx'
import { KioskFooter } from './KioskFooter.tsx'
import { ServiceRequestButton } from './ServiceRequestButton.tsx'

export interface LayoutProps {
  children: ReactNode
  showHeader?: boolean
  title?: string
  restaurantName?: string
  onBack?: () => void
  /**
   * When true, the page is a content-flow menu screen: no fixed header
   * and no extra bottom safe-area padding reserved for fixed chrome.
   */
  isMenuScreen?: boolean
}

export function Layout({
  children,
  showHeader = true,
  title,
  restaurantName,
  onBack,
  isMenuScreen = false,
}: LayoutProps) {
  return (
    <Stack direction="column" gap={0} className="min-h-svh">
      {showHeader && (
        <Header
          title={title}
          restaurantName={restaurantName}
          onBack={onBack}
        />
      )}

      <main
        id="main-content"
        className="flex-1"
        style={{
          paddingTop: showHeader
            ? 'var(--header-total-height)'
            : 'var(--safe-area-top)',
          paddingBottom: isMenuScreen
            ? 'var(--safe-area-bottom)'
            : 'calc(var(--safe-area-bottom) + 1rem)',
        }}
      >
        {children}
      </main>

      <KioskFooter restaurantName={restaurantName} />
      <FullscreenExitNotice />
      <AdminUnlockModal />
      <ServiceRequestButton />
    </Stack>
  )
}
