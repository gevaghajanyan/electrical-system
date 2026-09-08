'use client'

import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CALCULATORS, type CalcDef, type CalcGroup } from '@/components/calculators/registry'

const GROUPS: CalcGroup[] = ['basic', 'installation', 'power', 'electronics', 'utility']

function CalcTile({
  calc,
  active,
  onClick,
  label,
  desc,
}: {
  calc: CalcDef
  active: boolean
  onClick: () => void
  label: string
  desc: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={desc}
      className={`group flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all touch-manipulation min-h-[62px] ${
        active
          ? 'border-blue-400 bg-blue-50 shadow-sm dark:border-blue-500 dark:bg-blue-950/40'
          : 'border-zinc-200 bg-white hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800/70 dark:hover:border-blue-500'
      }`}
    >
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
        active
          ? 'bg-blue-500 text-white'
          : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400 group-hover:bg-blue-100 group-hover:text-blue-600'
      }`}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          {calc.iconPath}
        </svg>
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-zinc-800 dark:text-zinc-100">{label}</p>
        <p className="mt-0.5 line-clamp-2 text-[11px] text-zinc-500 dark:text-zinc-400">{desc}</p>
      </div>
    </button>
  )
}

export default function CalculatorsPage() {
  const { t } = useTranslation()
  const [activeId, setActiveId] = useState(CALCULATORS[0].id)
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

  const active = CALCULATORS.find((c) => c.id === activeId) ?? CALCULATORS[0]
  const ActiveComp = active.Component

  return (
    <div className="flex flex-1 flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="dot-grid absolute inset-0 opacity-40" aria-hidden />
        <div className="relative mx-auto w-full max-w-7xl px-4 pt-10 pb-6 sm:px-6">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
            <span className="text-gradient">{t('calc.pageTitle')}</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400 sm:text-base">
            {t('calc.pageSubtitle')}
          </p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-7xl flex-1 px-4 pb-16 sm:px-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
          {/* Sidebar registry — sticky on desktop, scrollable within its own height */}
          <aside className="space-y-3 lg:sticky lg:top-16 lg:self-start lg:max-h-[calc(100dvh-5rem)] lg:overflow-y-auto lg:pr-1 lg:-mr-1">
            <div className="relative">
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
                className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-9 pr-3 text-sm text-zinc-800 shadow-sm placeholder:text-zinc-400 focus:border-blue-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800/70 dark:text-zinc-100"
              />
            </div>

            {GROUPS.map((group) => {
              const items = filtered.filter((c) => c.group === group)
              if (items.length === 0) return null
              return (
                <div key={group}>
                  <h3 className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                    {t(`calc.groups.${group}`)}
                  </h3>
                  <div className="space-y-2">
                    {items.map((calc) => (
                      <CalcTile
                        key={calc.id}
                        calc={calc}
                        active={calc.id === activeId}
                        onClick={() => setActiveId(calc.id)}
                        label={t(calc.titleKey)}
                        desc={t(calc.descKey)}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </aside>

          {/* Active calculator */}
          <div className="min-w-0">
            <ActiveComp />
          </div>
        </div>
      </div>
    </div>
  )
}
