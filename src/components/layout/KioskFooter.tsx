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
}

export function KioskFooter({
  restaurantName = 'The Golden Nugget',
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
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-bg-elevated)]/80 backdrop-blur-sm">
      <Container size="full">
        <div className="flex min-h-[var(--kiosk-footer-height)] items-center justify-between gap-3 py-3">
          <Flex gap={3} align="center" className="min-w-0">
            <Text variant="caption" className="truncate">
              {restaurantName}
            </Text>
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
                    Open fullscreen
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
