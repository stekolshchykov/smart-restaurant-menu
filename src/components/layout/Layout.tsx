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
}

export function Layout({
  children,
  showHeader = true,
  title,
  restaurantName,
  onBack,
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
        tabIndex={-1}
        className="flex-1 outline-none"
        style={{
          paddingTop: showHeader
            ? 'var(--header-total-height)'
            : 'var(--safe-area-top)',
          paddingBottom:
            'calc(var(--safe-area-bottom) + var(--floating-chrome-bottom))',
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
