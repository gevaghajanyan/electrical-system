'use client'

import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { Clock, ChevronRight } from 'lucide-react'
import { LESSONS, LESSON_GROUPS } from '@/components/learn/registry'

const LEVEL_COLORS = {
  beginner: 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300',
  intermediate: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  advanced: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300',
} as const

export default function LearnIndexPage() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-1 flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="dot-grid absolute inset-0 opacity-40" aria-hidden />
        <div className="relative mx-auto w-full max-w-6xl px-4 pt-10 pb-6 sm:px-6 sm:pt-12">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
            <span className="text-gradient">{t('learn.pageTitle')}</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400 sm:text-base">
            {t('learn.pageSubtitle')}
          </p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl flex-1 px-4 pb-16 sm:px-6">
        <div className="space-y-8">
          {LESSON_GROUPS.map((group) => {
            const items = LESSONS.filter((l) => l.group === group)
            if (items.length === 0) return null
            return (
              <section key={group}>
                <div className="mb-3 flex items-center gap-2">
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                    {t(`learn.groups.${group}`)}
                  </h2>
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                    {items.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((lesson) => {
                    const Icon = lesson.Icon
                    return (
                      <Link
                        key={lesson.id}
                        href={`/learn/${lesson.id}`}
                        className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800/70 dark:hover:border-blue-500 touch-manipulation min-h-[168px]"
                      >
                        {/* Icon with tinted background */}
                        <div
                          className="flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-sm"
                          style={{ background: lesson.color }}
                        >
                          <Icon size={22} strokeWidth={2} />
                        </div>

                        <h3 className="mt-4 text-base font-semibold text-zinc-900 dark:text-zinc-100">
                          {t(lesson.titleKey)}
                        </h3>
                        <p className="mt-1 line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">
                          {t(lesson.descKey)}
                        </p>

                        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                          <div className="flex items-center gap-1.5">
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${LEVEL_COLORS[lesson.level]}`}>
                              {t(`learn.levels.${lesson.level}`)}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400">
                              <Clock size={11} />
                              {t('learn.minutes', { count: lesson.minutes })}
                            </span>
                          </div>
                          <ChevronRight size={18} className="text-zinc-300 transition-transform group-hover:translate-x-1 group-hover:text-blue-500 dark:text-zinc-600" />
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>
      </div>
    </div>
  )
}
