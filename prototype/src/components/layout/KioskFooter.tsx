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
    <footer className="text-[var(--color-text-muted)]">
      <Container size="full">
        <div
          className="flex min-h-[var(--kiosk-footer-height)] items-center justify-between gap-3 pt-3"
          style={{
            paddingBottom: 'calc(var(--safe-area-bottom) + 0.75rem)',
          }}
        >
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
                  >
                    <span className="hidden sm:inline">Fullscreen active</span>
                  </Button>
                ) : (
                  <Button
                    variant="ghost-inverse"
                    size="sm"
                    onClick={() => void enterFullscreen()}
                    iconLeft={<Maximize className="h-4 w-4" />}
                  >
                    <span className="hidden sm:inline">Open fullscreen</span>
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
