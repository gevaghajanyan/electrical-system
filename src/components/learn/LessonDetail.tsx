'use client'

import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ArrowRight, Clock, Calculator } from 'lucide-react'
import { LESSONS } from './registry'
import { CALCULATORS } from '@/components/calculators/registry'

interface Props {
  currentId: string
  prevId: string | null
  nextId: string | null
}

export function LessonDetail({ currentId, prevId, nextId }: Props) {
  const { t } = useTranslation()
  const current = LESSONS.find((l) => l.id === currentId)
  if (!current) return null
  const Body = current.Component
  const Icon = current.Icon
  const prev = prevId ? LESSONS.find((l) => l.id === prevId) : null
  const next = nextId ? LESSONS.find((l) => l.id === nextId) : null

  const related = (current.relatedCalcs ?? [])
    .map((cid) => CALCULATORS.find((c) => c.id === cid))
    .filter((c): c is NonNullable<typeof c> => !!c)

  return (
    <div className="flex flex-1 flex-col">
      {/* Sticky header */}
      <div
        className="glass sticky top-14 z-20 flex items-center gap-2 rounded-none border-x-0 border-t-0 px-3 py-2 sm:px-4"
        style={{ paddingTop: '0.5rem' }}
      >
        <Link
          href="/learn"
          aria-label={t('learn.backToList')}
          className="inline-flex h-10 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 touch-manipulation"
        >
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">{t('learn.pageTitle')}</span>
        </Link>

        <div className="mx-2 h-5 w-px bg-zinc-200 dark:bg-zinc-700" />

        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-white"
            style={{ background: current.color }}
          >
            <Icon size={16} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[11px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
              {t(`learn.groups.${current.group}`)}
              <span className="mx-1.5 text-zinc-300">·</span>
              <span className="inline-flex items-center gap-1">
                <Clock size={10} />
                {t('learn.minutes', { count: current.minutes })}
              </span>
            </p>
            <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {t(current.titleKey)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {prev ? (
            <Link
              href={`/learn/${prev.id}`}
              aria-label={t(prev.titleKey)}
              title={t(prev.titleKey)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 touch-manipulation"
            >
              <ArrowLeft size={16} />
            </Link>
          ) : (
            <span className="inline-flex h-10 w-10 items-center justify-center text-zinc-300 dark:text-zinc-700" aria-hidden>
              <ArrowLeft size={16} />
            </span>
          )}
          {next ? (
            <Link
              href={`/learn/${next.id}`}
              aria-label={t(next.titleKey)}
              title={t(next.titleKey)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 touch-manipulation"
            >
              <ArrowRight size={16} />
            </Link>
          ) : (
            <span className="inline-flex h-10 w-10 items-center justify-center text-zinc-300 dark:text-zinc-700" aria-hidden>
              <ArrowRight size={16} />
            </span>
          )}
        </div>
      </div>

      {/* Lesson body */}
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:px-6">
        <Body />

        {/* Related calculators */}
        {related.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
              {t('learn.relatedCalc')}
            </h2>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {related.map((calc) => (
                <Link
                  key={calc.id}
                  href={`/calculators/${calc.id}`}
                  className="group inline-flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3 text-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-sm dark:border-zinc-700 dark:bg-zinc-800/70 dark:hover:border-blue-500 min-h-[56px] touch-manipulation"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                    <Calculator size={16} />
                  </span>
                  <span className="min-w-0 flex-1 truncate font-medium text-zinc-800 dark:text-zinc-200">
                    {t(calc.titleKey)}
                  </span>
                  <ArrowRight size={16} className="text-zinc-300 group-hover:translate-x-1 group-hover:text-blue-500 dark:text-zinc-600" />
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Bottom prev/next */}
      <nav className="mx-auto grid w-full max-w-3xl grid-cols-2 gap-3 px-4 pb-10 sm:px-6">
        {prev ? (
          <Link
            href={`/learn/${prev.id}`}
            className="group flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800/70 dark:hover:border-blue-500 min-h-[80px] touch-manipulation"
          >
            <ArrowLeft size={18} className="shrink-0 text-zinc-400 group-hover:text-blue-500" />
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">{t('learn.previous')}</p>
              <p className="mt-0.5 truncate text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                {t(prev.titleKey)}
              </p>
            </div>
          </Link>
        ) : <span aria-hidden />}
        {next ? (
          <Link
            href={`/learn/${next.id}`}
            className="group flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4 text-right transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800/70 dark:hover:border-blue-500 min-h-[80px] touch-manipulation"
          >
            <div className="ml-auto min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">{t('learn.next')}</p>
              <p className="mt-0.5 truncate text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                {t(next.titleKey)}
              </p>
            </div>
            <ArrowRight size={18} className="shrink-0 text-zinc-400 group-hover:text-blue-500" />
          </Link>
        ) : <span aria-hidden />}
      </nav>
    </div>
  )
}
