'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from './LanguageSwitcher'
import { useInstallPrompt } from './pwa/InstallPromptProvider'
import { Logo } from './brand/Logo'

interface NavItem {
  href: string
  labelKey: string
}

const NAV_ITEMS: NavItem[] = [
  { href: '/panels', labelKey: 'nav.panels' },
  { href: '/schemes', labelKey: 'nav.schemes' },
  { href: '/calculators', labelKey: 'nav.calculators' },
  { href: '/learn', labelKey: 'nav.learn' },
  { href: '/tools', labelKey: 'nav.tools' },
  { href: '/settings', labelKey: 'nav.settings' },
  { href: '/about', labelKey: 'nav.about' },
]

function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || (href !== '/' && pathname.startsWith(href))
}

function NavLink({ href, label, onClick }: { href: string; label: string; onClick?: () => void }) {
  const pathname = usePathname()
  const active = isActivePath(pathname, href)
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`min-h-[36px] inline-flex items-center px-3 py-1 text-xs font-medium rounded-full transition-colors touch-manipulation ${
        active
          ? 'bg-zinc-900 text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-900'
          : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
      }`}
    >
      {label}
    </Link>
  )
}

function InstallButton() {
  const { t } = useTranslation()
  const { canInstall, promptInstall } = useInstallPrompt()
  if (!canInstall) return null
  return (
    <button
      onClick={() => promptInstall()}
      className="hidden md:inline-flex items-center gap-1.5 rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900"
    >
      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
      </svg>
      {t('nav.install')}
    </button>
  )
}

export function NavBar() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Close mobile menu on route change
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Lock body scroll when mobile menu open
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  return (
    <nav
      className="glass sticky top-0 z-40 flex h-14 items-center border-x-0 border-t-0 rounded-none px-3 sm:px-4"
      style={{ paddingTop: 'env(safe-area-inset-top, 0)' }}
    >
      <Link
        href="/"
        className="mr-3 flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-zinc-50 sm:mr-6 hover:opacity-90 transition-opacity"
      >
        <Logo size={28} />
        <span className="hidden sm:inline truncate tracking-tight">{t('nav.brand')}</span>
      </Link>

      {/* Desktop nav — pill container */}
      <div className="hidden md:flex items-center gap-0.5 rounded-full border border-zinc-200 bg-white/70 p-1 backdrop-blur dark:border-zinc-700 dark:bg-zinc-800/60">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.href} href={item.href} label={t(item.labelKey)} />
        ))}
      </div>

      <div className="ml-auto flex items-center gap-2">
        <InstallButton />
        <LanguageSwitcher />

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label={open ? t('nav.closeMenu') : t('nav.menu')}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-md text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div
          className="fixed inset-x-0 top-14 bottom-0 z-50 md:hidden bg-black/40"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-label={t('nav.menu')}
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-x-0 top-0 bg-white shadow-lg dark:bg-zinc-900"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}
          >
            <div className="p-3 space-y-1">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.href}
                  href={item.href}
                  label={t(item.labelKey)}
                  onClick={() => setOpen(false)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
