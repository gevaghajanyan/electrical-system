'use client'

import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { CALCULATORS } from './registry'

interface Props {
  currentId: string
  prevId: string | null
  nextId: string | null
}

/**
 * Focused single-calculator view — used by `/calculators/[id]`.
 * Header has a sticky back button, current calculator name, and prev/next
 * arrows so users can walk through them without returning to the index.
 */
export function CalculatorDetail({ currentId, prevId, nextId }: Props) {
  const { t } = useTranslation()
  const current = CALCULATORS.find((c) => c.id === currentId)
  if (!current) return null
  const Comp = current.Component

  const prev = prevId ? CALCULATORS.find((c) => c.id === prevId) : null
  const next = nextId ? CALCULATORS.find((c) => c.id === nextId) : null

  return (
    <div className="flex flex-1 flex-col">
      {/* Sticky header — back button + title + prev/next */}
      <div
        className="glass sticky top-14 z-20 flex items-center gap-2 rounded-none border-x-0 border-t-0 px-3 py-2 sm:px-4"
        style={{ paddingTop: '0.5rem' }}
      >
        <Link
          href="/calculators"
          aria-label={t('calc.backToList')}
          className="inline-flex h-10 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 touch-manipulation"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">{t('calc.pageTitle')}</span>
        </Link>

        <div className="mx-2 h-5 w-px bg-zinc-200 dark:bg-zinc-700" />

        {/* Active calculator label */}
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              {current.iconPath}
            </svg>
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
              {t(`calc.groups.${current.group}`)}
            </p>
            <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {t(current.titleKey)}
            </p>
          </div>
        </div>

        {/* Prev / next */}
        <div className="flex items-center gap-1">
          {prev ? (
            <Link
              href={`/calculators/${prev.id}`}
              aria-label={t(prev.titleKey)}
              title={t(prev.titleKey)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 touch-manipulation"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
          ) : (
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-md text-zinc-300 dark:text-zinc-700" aria-hidden>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </span>
          )}
          {next ? (
            <Link
              href={`/calculators/${next.id}`}
              aria-label={t(next.titleKey)}
              title={t(next.titleKey)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 touch-manipulation"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ) : (
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-md text-zinc-300 dark:text-zinc-700" aria-hidden>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          )}
        </div>
      </div>

      {/* Calculator body */}
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:px-6">
        <Comp />
      </div>

      {/* Bottom prev/next — bigger, comfortable thumb targets */}
      <nav className="mx-auto grid w-full max-w-3xl grid-cols-2 gap-3 px-4 pb-10 sm:px-6">
        {prev ? (
          <Link
            href={`/calculators/${prev.id}`}
            className="group flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800/70 dark:hover:border-blue-500 min-h-[80px] touch-manipulation"
          >
            <svg className="h-5 w-5 shrink-0 text-zinc-400 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">{t('calc.previous')}</p>
              <p className="mt-0.5 truncate text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                {t(prev.titleKey)}
              </p>
            </div>
          </Link>
        ) : <span aria-hidden />}
        {next ? (
          <Link
            href={`/calculators/${next.id}`}
            className="group flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4 text-right transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800/70 dark:hover:border-blue-500 min-h-[80px] touch-manipulation"
          >
            <div className="ml-auto min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">{t('calc.next')}</p>
              <p className="mt-0.5 truncate text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                {t(next.titleKey)}
              </p>
            </div>
            <svg className="h-5 w-5 shrink-0 text-zinc-400 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ) : <span aria-hidden />}
      </nav>
    </div>
  )
}
