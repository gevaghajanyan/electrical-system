'use client'

import { useTranslation } from 'react-i18next'

export function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const current = i18n.language?.startsWith('ru') ? 'ru' : 'en'

  function toggle() {
    i18n.changeLanguage(current === 'en' ? 'ru' : 'en')
  }

  return (
    <button
      onClick={toggle}
      className="px-2 py-1 text-xs font-semibold rounded border border-zinc-200 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
    >
      {current === 'en' ? 'RU' : 'EN'}
    </button>
  )
}
