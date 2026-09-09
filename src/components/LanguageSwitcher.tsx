'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SUPPORTED_LANGS, type SupportedLang } from '@/lib/i18n'

const LABELS: Record<SupportedLang, string> = {
  en: 'EN',
  ru: 'RU',
  hy: 'ՀԱ',
}

const NAMES: Record<SupportedLang, string> = {
  en: 'English',
  ru: 'Русский',
  hy: 'Հայերեն',
}

function currentLang(raw: string | undefined): SupportedLang {
  const s = (raw ?? 'en').toLowerCase()
  if (s.startsWith('ru')) return 'ru'
  if (s.startsWith('hy')) return 'hy'
  return 'en'
}

export function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const current = currentLang(i18n.language)

  useEffect(() => {
    if (!open) return
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  function pick(lng: SupportedLang) {
    setOpen(false)
    if (lng !== current) i18n.changeLanguage(lng)
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Language"
        className="inline-flex h-9 min-w-[42px] items-center justify-center gap-1 rounded-md border border-zinc-200 px-2 text-xs font-semibold text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
      >
        {LABELS[current]}
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 z-50 mt-1 min-w-[140px] overflow-hidden rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
        >
          {SUPPORTED_LANGS.map((lng) => {
            const active = lng === current
            return (
              <li key={lng}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => pick(lng)}
                  className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm transition-colors ${
                    active
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                      : 'text-zinc-700 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-800'
                  }`}
                >
                  <span>{NAMES[lng]}</span>
                  <span className="text-[10px] font-semibold tracking-widest text-zinc-400 dark:text-zinc-500">
                    {LABELS[lng]}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
