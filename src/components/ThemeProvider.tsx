'use client'

import { useEffect } from 'react'
import { usePanelStore } from '@/lib/hooks/usePanelStore'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { settings } = usePanelStore()

  useEffect(() => {
    const root = document.documentElement

    function applyTheme(theme: 'light' | 'dark' | 'system') {
      if (theme === 'dark') {
        root.classList.add('dark')
      } else if (theme === 'light') {
        root.classList.remove('dark')
      } else {
        // system
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          root.classList.add('dark')
        } else {
          root.classList.remove('dark')
        }
      }
    }

    applyTheme(settings.theme)

    if (settings.theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = () => applyTheme('system')
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    }
  }, [settings.theme])

  return <>{children}</>
}