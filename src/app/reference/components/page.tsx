'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Search } from 'lucide-react'
import { ELEMENT_DEFS } from '@/lib/constants/elementDefs'

/**
 * Component encyclopedia — one card per element type from the panel palette.
 * Uses ELEMENT_DEFS as the source of truth (same list as the palette).
 */
export default function ComponentsReferencePage() {
  const { t } = useTranslation()
  const [q, setQ] = useState('')
  const [category, setCategory] = useState<'all' | string>('all')

  const categories = useMemo(() => {
    const set = new Set(ELEMENT_DEFS.map((d) => d.category))
    return ['all', ...Array.from(set)]
  }, [])

  const filtered = useMemo(() => {
    return ELEMENT_DEFS.filter((d) => {
      if (category !== 'all' && d.category !== category) return false
      if (q.trim()) {
        const lc = q.toLowerCase()
        const label = t(`elements.${d.id}.label`, { defaultValue: d.label }).toLowerCase()
        const desc  = t(`elements.${d.id}.description`, { defaultValue: d.description }).toLowerCase()
        if (!label.includes(lc) && !desc.includes(lc) && !d.id.includes(lc)) return false
      }
      return true
    })
  }, [q, category, t])

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
      <Link href="/reference" className="mb-4 inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100">
        <ArrowLeft size={14} /> {t('reference.back')}
      </Link>
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">{t('reference.sections.components.title')}</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t('reference.sections.components.desc')}</p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('reference.components.search')}
            className="h-9 w-full rounded-lg border border-zinc-300 bg-white pl-8 pr-3 text-xs dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100" />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {categories.map((c) => (
          <button key={c} type="button" onClick={() => setCategory(c)}
            className={`rounded-full px-3 py-1 text-[11px] font-semibold ${category === c ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300'}`}
          >
            {c === 'all' ? t('reference.components.allCategories') : t(`palette.categories.${c}`)}
          </button>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((def) => (
          <div key={def.id} className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white shadow-sm" style={{ background: def.color, color: def.textColor }}>
                {def.shortLabel}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {t(`elements.${def.id}.label`, { defaultValue: def.label })}
                </p>
                <p className="mt-0.5 text-[10px] uppercase tracking-widest text-zinc-400">
                  {t(`palette.categories.${def.category}`)}
                </p>
              </div>
            </div>
            <p className="mt-3 text-xs text-zinc-600 dark:text-zinc-300">
              {t(`elements.${def.id}.description`, { defaultValue: def.description })}
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2 text-[10px] text-zinc-500">
              <Stat label={t('reference.components.poles')}      value={def.poles > 0 ? String(def.poles) : '—'} />
              <Stat label={t('reference.components.slotWidth')}  value={`${def.defaultSlotWidth}×18 mm`} />
              <Stat label={t('reference.components.symbol')}     value={def.symbolId} />
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full py-8 text-center text-sm text-zinc-400">{t('reference.components.noResults')}</p>
        )}
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-zinc-50 px-2 py-1.5 dark:bg-zinc-900/60">
      <p className="text-[9px] font-semibold uppercase tracking-widest text-zinc-400">{label}</p>
      <p className="mt-0.5 truncate font-mono text-[11px] font-semibold text-zinc-700 dark:text-zinc-200">{value}</p>
    </div>
  )
}
