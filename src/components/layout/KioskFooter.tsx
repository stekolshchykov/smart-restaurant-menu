import { Lock, Maximize, Minimize } from 'lucide-react'
import { Badge } from '../ui/Badge.tsx'
import { Button } from '../ui/Button.tsx'
import { Container } from '../ui/Container.tsx'
import { Flex } from '../ui/Flex.tsx'
import { IconButton } from '../ui/IconButton.tsx'
import { Text } from '../ui/Text.tsx'
import { useKiosk } from '../../lib/useKiosk.ts'

export interface KioskFooterProps {
  restaurantName?: string
  tableNumber?: string
}

export function KioskFooter({
  restaurantName = 'The Golden Nugget',
  tableNumber = '07',
}: KioskFooterProps) {
  const {
    isFullscreen,
    isSupported,
    isLocked,
    enterFullscreen,
    exitFullscreen,
    openAdminModal,
  } = useKiosk()

  return (
    <footer
      className="fixed right-0 bottom-0 left-0 z-40 border-t border-[var(--color-border)] bg-[var(--color-bg-elevated)]/90 backdrop-blur-md"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <Container size="full">
        <div
          className="flex h-[var(--kiosk-footer-height)] items-center justify-between gap-3"
        >
          <Flex gap={3} align="center" className="min-w-0">
            <Text variant="body-sm" className="hidden truncate sm:inline">
              {restaurantName}
            </Text>
            <Badge variant="outline">Table {tableNumber}</Badge>
            {isFullscreen && (
              <Badge variant="success" className="hidden sm:inline-flex">
                Digital menu active
              </Badge>
            )}
          </Flex>

          <Flex gap={2} align="center">
            {isSupported && (
              <>
                {isFullscreen ? (
                  <Button
                    variant="ghost-inverse"
                    size="sm"
                    onClick={() => void exitFullscreen()}
                    iconLeft={<Minimize className="h-4 w-4" />}
                    className="hidden sm:inline-flex"
                  >
                    Fullscreen active
                  </Button>
                ) : (
                  <Button
                    variant="ghost-inverse"
                    size="sm"
                    onClick={() => void enterFullscreen()}
                    iconLeft={<Maximize className="h-4 w-4" />}
                  >
                    Fullscreen
                  </Button>
                )}

                <IconButton
                  onClick={openAdminModal}
                  aria-label="Admin unlock"
                  variant="ghost-inverse"
                  size="sm"
                >
                  <Lock className="h-4 w-4" />
                </IconButton>
              </>
            )}

            {isLocked && (
              <Badge variant="primary" className="hidden sm:inline-flex">
                Locked
              </Badge>
            )}
          </Flex>
        </div>
      </Container>
    </footer>
  )
}
