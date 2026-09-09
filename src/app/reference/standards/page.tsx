'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Search } from 'lucide-react'

interface Standard {
  id: string
  code: string
  family: 'iec' | 'en' | 'bs' | 'nec' | 'gost' | 'iso'
  scope: string       // i18n key suffix under reference.standards.entries.{id}.scope
  region: 'global' | 'eu' | 'uk' | 'us' | 'ru'
}

const STANDARDS: Standard[] = [
  { id: 'iec60364',     code: 'IEC 60364',     family: 'iec', scope: 'installation', region: 'global' },
  { id: 'iec60529',     code: 'IEC 60529',     family: 'iec', scope: 'ip_ratings',   region: 'global' },
  { id: 'iec60617',     code: 'IEC 60617',     family: 'iec', scope: 'symbols',      region: 'global' },
  { id: 'iec60898',     code: 'IEC 60898',     family: 'iec', scope: 'mcb',          region: 'global' },
  { id: 'iec60947',     code: 'IEC 60947',     family: 'iec', scope: 'switchgear',   region: 'global' },
  { id: 'iec61008',     code: 'IEC 61008',     family: 'iec', scope: 'rcd',          region: 'global' },
  { id: 'iec61643',     code: 'IEC 61643',     family: 'iec', scope: 'spd',          region: 'global' },
  { id: 'iec61439',     code: 'IEC 61439',     family: 'iec', scope: 'assemblies',   region: 'global' },
  { id: 'iec60034',     code: 'IEC 60034',     family: 'iec', scope: 'motors',       region: 'global' },
  { id: 'ieee519',      code: 'IEEE 519',      family: 'iec', scope: 'harmonics',    region: 'global' },
  { id: 'iec61000_4_2', code: 'IEC 61000-4-2', family: 'iec', scope: 'esd',          region: 'global' },
  { id: 'en50110',      code: 'EN 50110',      family: 'en',  scope: 'safe_work',    region: 'eu' },
  { id: 'en50173',      code: 'EN 50173',      family: 'en',  scope: 'structured_cabling', region: 'eu' },
  { id: 'bs7671',       code: 'BS 7671',       family: 'bs',  scope: 'uk_wiring',    region: 'uk' },
  { id: 'nec_nfpa70',   code: 'NEC / NFPA 70', family: 'nec', scope: 'us_wiring',    region: 'us' },
  { id: 'nfpa70e',      code: 'NFPA 70E',      family: 'nec', scope: 'arc_flash',    region: 'us' },
  { id: 'gost31565',    code: 'ГОСТ 31565',    family: 'gost', scope: 'ru_cable',    region: 'ru' },
  { id: 'pue7',         code: 'ПУЭ 7',         family: 'gost', scope: 'ru_pue',      region: 'ru' },
  { id: 'iso7010',      code: 'ISO 7010',      family: 'iso', scope: 'safety_signs', region: 'global' },
]

const FAMILY_COLOR: Record<Standard['family'], string> = {
  iec: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
  en:  'bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300',
  bs:  'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
  nec: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  gost:'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300',
  iso: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
}

export default function StandardsPage() {
  const { t } = useTranslation()
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    if (!q.trim()) return STANDARDS
    const s = q.toLowerCase()
    return STANDARDS.filter((x) =>
      x.code.toLowerCase().includes(s) ||
      t(`reference.standards.entries.${x.id}.title`).toLowerCase().includes(s) ||
      t(`reference.standards.entries.${x.id}.summary`).toLowerCase().includes(s),
    )
  }, [q, t])

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
      <Link href="/reference" className="mb-4 inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100">
        <ArrowLeft size={14} /> {t('reference.back')}
      </Link>
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">{t('reference.sections.standards.title')}</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t('reference.sections.standards.desc')}</p>

      <div className="relative mt-6 max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t('reference.standards.searchPlaceholder')}
          className="h-10 w-full rounded-lg border border-zinc-300 bg-white pl-9 pr-3 text-sm placeholder-zinc-400 focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {filtered.map((s) => (
          <div key={s.id} className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
            <div className="mb-1 flex items-center gap-2">
              <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${FAMILY_COLOR[s.family]}`}>
                {s.code}
              </span>
              <span className="text-[10px] uppercase tracking-widest text-zinc-400">{t(`reference.standards.region.${s.region}`)}</span>
            </div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t(`reference.standards.entries.${s.id}.title`)}</p>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">{t(`reference.standards.entries.${s.id}.summary`)}</p>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-2 py-8 text-center text-sm text-zinc-400">{t('reference.standards.noResults')}</p>
        )}
      </div>
    </div>
  )
}
