'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { CALCULATORS, type CalcDef, type CalcGroup } from '@/components/calculators/registry'

const GROUPS: CalcGroup[] = ['basic', 'installation', 'power', 'electronics', 'utility']

const GROUP_TONE: Record<CalcGroup, string> = {
  basic:        'from-blue-500/10 to-blue-500/0 text-blue-700 dark:text-blue-300',
  installation: 'from-green-500/10 to-green-500/0 text-green-700 dark:text-green-300',
  power:        'from-amber-500/10 to-amber-500/0 text-amber-700 dark:text-amber-300',
  electronics:  'from-violet-500/10 to-violet-500/0 text-violet-700 dark:text-violet-300',
  utility:      'from-zinc-500/10 to-zinc-500/0 text-zinc-700 dark:text-zinc-300',
}

function CalcTile({ calc, label, desc }: { calc: CalcDef; label: string; desc: string }) {
  const tone = GROUP_TONE[calc.group]
  const iconTone = tone.split(' ').slice(-2).join(' ')
  return (
    <Link
      href={`/calculators/${calc.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800/70 dark:hover:border-blue-500 touch-manipulation min-h-[128px]"
    >
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${tone} opacity-70`} />
      <div className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-black/5 dark:bg-zinc-900 dark:ring-white/10 ${iconTone}`}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          {calc.iconPath}
        </svg>
      </div>
      <span className="relative z-10 mt-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1">{label}</span>
      <span className="relative z-10 mt-1 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">{desc}</span>
      <svg
        className="relative z-10 mt-auto self-end text-zinc-300 transition-transform group-hover:translate-x-1 group-hover:text-blue-500 dark:text-zinc-600"
        width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  )
}

export default function CalculatorsIndexPage() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return CALCULATORS
    return CALCULATORS.filter((c) => {
      const label = t(c.titleKey).toLowerCase()
      const desc = t(c.descKey).toLowerCase()
      return label.includes(q) || desc.includes(q) || c.id.includes(q)
    })
  }, [search, t])

  return (
    <div className="flex flex-1 flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="dot-grid absolute inset-0 opacity-40" aria-hidden />
        <div className="relative mx-auto w-full max-w-7xl px-4 pt-10 pb-4 sm:px-6 sm:pt-12">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
            <span className="text-gradient">{t('calc.pageTitle')}</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400 sm:text-base">
            {t('calc.pageSubtitle')}
          </p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-7xl flex-1 px-4 pb-16 sm:px-6">
        {/* Sticky search bar */}
        <div className="sticky top-14 z-10 -mx-4 mb-6 border-b border-zinc-200/60 bg-zinc-50/85 px-4 py-3 backdrop-blur dark:border-zinc-800/60 dark:bg-zinc-950/80 sm:-mx-6 sm:px-6">
          <div className="relative mx-auto max-w-2xl">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('calc.searchPlaceholder')}
              className="h-11 w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-3 text-sm text-zinc-800 shadow-sm placeholder:text-zinc-400 focus:border-blue-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800/70 dark:text-zinc-100"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 p-12 text-center text-sm text-zinc-500 dark:border-zinc-700">
            {t('calc.formulas.noResults')}
          </div>
        ) : (
          <div className="space-y-8">
            {GROUPS.map((group) => {
              const items = filtered.filter((c) => c.group === group)
              if (items.length === 0) return null
              return (
                <section key={group}>
                  <div className="mb-3 flex items-center gap-2">
                    <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                      {t(`calc.groups.${group}`)}
                    </h2>
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                      {items.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                    {items.map((calc) => (
                      <CalcTile
                        key={calc.id}
                        calc={calc}
                        label={t(calc.titleKey)}
                        desc={t(calc.descKey)}
                      />
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
