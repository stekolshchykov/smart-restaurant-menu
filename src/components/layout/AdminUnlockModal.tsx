import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Lock, LogOut, RotateCcw, Settings, ShieldCheck, X } from 'lucide-react'
import { Button } from '../ui/Button.tsx'
import { Flex } from '../ui/Flex.tsx'
import { Heading } from '../ui/Heading.tsx'
import { IconButton } from '../ui/IconButton.tsx'
import { Stack } from '../ui/Stack.tsx'
import { Surface } from '../ui/Surface.tsx'
import { Text } from '../ui/Text.tsx'
import { TextInput } from '../ui/TextInput.tsx'
import { useKiosk } from '../../lib/useKiosk.ts'

export function AdminUnlockModal() {
  const {
    isAdminModalOpen,
    isAdminUnlocked,
    adminError,
    closeAdminModal,
    submitAdminPin,
    performAdminAction,
  } = useKiosk()

  const [pin, setPin] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    if (isAdminModalOpen) {
      setPin('')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isAdminModalOpen])

  const handleUnlock = () => {
    submitAdminPin(pin)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleUnlock()
    }
  }

  return (
    <AnimatePresence>
      {isAdminModalOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
            className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm"
            onClick={closeAdminModal}
            aria-hidden="true"
          />

          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div
              initial={{
                opacity: shouldReduceMotion ? 1 : 0,
                scale: shouldReduceMotion ? 1 : 0.94,
                y: shouldReduceMotion ? 0 : 16,
              }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{
                opacity: shouldReduceMotion ? 1 : 0,
                scale: shouldReduceMotion ? 1 : 0.96,
              }}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { type: 'spring', stiffness: 320, damping: 28 }
              }
              className="w-full max-w-sm"
            >
              <Surface elevated className="p-5 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="admin-modal-title">
                <Flex align="center" justify="between" className="mb-5">
                  <Flex align="center" gap={2}>
                    <Lock className="h-5 w-5 text-[var(--color-accent)]" />
                    <Heading level={3} variant="section" onSurface id="admin-modal-title">
                      Admin unlock
                    </Heading>
                  </Flex>
                  <IconButton
                    onClick={closeAdminModal}
                    aria-label="Close admin unlock"
                    variant="ghost"
                    size="md"
                  >
                    <X className="h-5 w-5" />
                  </IconButton>
                </Flex>

                <AnimatePresence mode="wait">
                  {isAdminUnlocked ? (
                    <motion.div
                      key="unlocked"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Stack gap={5}>
                        <Flex align="center" gap={2} className="text-[var(--color-success)]">
                          <ShieldCheck className="h-5 w-5" />
                          <Text variant="body" className="text-[var(--color-success)]">
                            Unlocked. Choose an action.
                          </Text>
                        </Flex>

                        <Stack gap={3}>
                          <Button
                            variant="outline"
                            size="lg"
                            fullWidth
                            iconLeft={<LogOut className="h-4 w-4" />}
                            onClick={() => performAdminAction('exitFullscreen')}
                          >
                            Exit fullscreen
                          </Button>
                          <Button
                            variant="outline"
                            size="lg"
                            fullWidth
                            iconLeft={<RotateCcw className="h-4 w-4" />}
                            onClick={() => performAdminAction('resetOrder')}
                          >
                            Reset order
                          </Button>
                          <Button
                            variant="outline"
                            size="lg"
                            fullWidth
                            iconLeft={<Settings className="h-4 w-4" />}
                            onClick={() => performAdminAction('backToSetup')}
                          >
                            Back to setup
                          </Button>
                        </Stack>
                      </Stack>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="locked"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Stack gap={4}>
                        <Text variant="body" onSurface>
                          Enter PIN to leave kiosk mode or access setup options.
                        </Text>

                        <TextInput
                          ref={inputRef}
                          label="PIN"
                          type="password"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          value={pin}
                          onChange={setPin}
                          onKeyDown={handleKeyDown}
                          placeholder="••••••"
                        />

                        <AnimatePresence>
                          {adminError && (
                            <motion.div
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Text
                                variant="body-sm"
                                className="text-[var(--color-error)]"
                              >
                                {adminError}
                              </Text>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <Flex gap={3} justify="end" className="pt-1">
                          <Button
                            variant="ghost"
                            size="md"
                            onClick={closeAdminModal}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="primary"
                            size="md"
                            onClick={handleUnlock}
                            disabled={pin.length === 0}
                          >
                            Unlock
                          </Button>
                        </Flex>
                      </Stack>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Surface>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
