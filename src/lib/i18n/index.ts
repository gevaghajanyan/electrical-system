import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from './locales/en.json'
import ru from './locales/ru.json'

/**
 * IMPORTANT: no language detection at init time.
 *
 * The server always renders in `en` (there is no localStorage/navigator on the
 * server, so any detection would diverge from the client and trigger a
 * hydration mismatch). The client-side detector runs from `I18nProvider`
 * *after* mount and calls `i18n.changeLanguage(...)` — swapping languages then
 * happens as a normal re-render, not a hydration mismatch.
 */
i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ru: { translation: ru },
  },
  lng: 'en',
  fallbackLng: 'en',
  supportedLngs: ['en', 'ru'],
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
})

export default i18n

export const I18N_STORAGE_KEY = 'i18n-lang'

/** Read the persisted / detected language on the client. Never called on the server. */
export function detectClientLanguage(): 'en' | 'ru' {
  if (typeof window === 'undefined') return 'en'
  try {
    const stored = window.localStorage.getItem(I18N_STORAGE_KEY)
    if (stored === 'en' || stored === 'ru') return stored
  } catch {
    // localStorage unavailable — fall through
  }
  const nav = window.navigator?.language?.toLowerCase() ?? ''
  return nav.startsWith('ru') ? 'ru' : 'en'
}
