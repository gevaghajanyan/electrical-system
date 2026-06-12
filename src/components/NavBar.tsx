'use client'

import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from './LanguageSwitcher'

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-3 py-1.5 text-sm text-zinc-600 rounded-md hover:bg-zinc-100 hover:text-zinc-900 transition-colors dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
    >
      {children}
    </Link>
  )
}

export function NavBar() {
  const { t } = useTranslation()

  return (
    <nav className="sticky top-0 z-40 flex h-14 items-center border-b border-zinc-200 bg-white/95 px-4 backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/95">
      <Link
        href="/"
        className="mr-6 flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-zinc-100"
      >
        <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        {t('nav.brand')}
      </Link>
      <div className="flex items-center gap-1">
        <NavLink href="/panels">{t('nav.panels')}</NavLink>
        <NavLink href="/calculators">{t('nav.calculators')}</NavLink>
        <NavLink href="/settings">{t('nav.settings')}</NavLink>
        <NavLink href="/about">{t('nav.about')}</NavLink>
      </div>
      <div className="ml-auto">
        <LanguageSwitcher />
      </div>
    </nav>
  )
}
