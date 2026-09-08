'use client'

import { useEffect, useState } from 'react'
import { I18nextProvider } from 'react-i18next'
import i18n, { I18N_STORAGE_KEY, detectClientLanguage } from '@/lib/i18n'

export function I18nProvider({ children }: { children: React.ReactNode }) {
  // Track a "hydrated" flag so the very first client render matches the SSR
  // output (i18n language is still `en`). After mount we switch to the
  // detected/persisted language, and React re-renders in the new locale.
  const [, setHydrated] = useState(false)

  useEffect(() => {
    const lang = detectClientLanguage()
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang).catch(() => undefined)
    }
    const onChange = (lng: string) => {
      try { window.localStorage.setItem(I18N_STORAGE_KEY, lng) } catch { /* ignore */ }
    }
    i18n.on('languageChanged', onChange)
    setHydrated(true)
    return () => { i18n.off('languageChanged', onChange) }
  }, [])

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
}
