import { useCallback, useEffect, useState } from 'react'

export interface UseFullscreenReturn {
  isFullscreen: boolean
  isSupported: boolean
  enter: () => Promise<void>
  exit: () => Promise<void>
  toggle: () => Promise<void>
}

export function useFullscreen(): UseFullscreenReturn {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    setIsSupported(
      typeof document !== 'undefined' && Boolean(document.fullscreenEnabled),
    )

    const handleChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }

    document.addEventListener('fullscreenchange', handleChange)
    return () => document.removeEventListener('fullscreenchange', handleChange)
  }, [])

  const enter = useCallback(async () => {
    try {
      const element = document.documentElement
      if (document.fullscreenEnabled && element.requestFullscreen) {
        await element.requestFullscreen()
      }
    } catch {
      // Ignore browsers that block the request.
    }
  }, [])

  const exit = useCallback(async () => {
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen()
      }
    } catch {
      // Ignore browsers that block the request.
    }
  }, [])

  const toggle = useCallback(async () => {
    if (document.fullscreenElement) {
      await exit()
    } else {
      await enter()
    }
  }, [enter, exit])

  return { isFullscreen, isSupported, enter, exit, toggle }
}
