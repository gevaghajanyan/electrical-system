'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
  prompt: () => Promise<void>
}

interface InstallPromptContextValue {
  canInstall: boolean
  isInstalled: boolean
  promptInstall: () => Promise<'accepted' | 'dismissed' | 'unavailable'>
}

const Ctx = createContext<InstallPromptContextValue>({
  canInstall: false,
  isInstalled: false,
  promptInstall: async () => 'unavailable',
})

export function useInstallPrompt() {
  return useContext(Ctx)
}

export function InstallPromptProvider({ children }: { children: ReactNode }) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const standalone =
      window.matchMedia?.('(display-mode: standalone)').matches ||
      // iOS
      (window.navigator as unknown as { standalone?: boolean }).standalone === true
    setIsInstalled(standalone)

    const onBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }
    const onInstalled = () => {
      setDeferred(null)
      setIsInstalled(true)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const promptInstall = useCallback(async () => {
    if (!deferred) return 'unavailable' as const
    await deferred.prompt()
    const choice = await deferred.userChoice
    setDeferred(null)
    return choice.outcome
  }, [deferred])

  return (
    <Ctx.Provider value={{ canInstall: !!deferred && !isInstalled, isInstalled, promptInstall }}>
      {children}
    </Ctx.Provider>
  )
}
