'use client'

import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'

type RoleColor = { color: string; label: string; gradient?: boolean }
type Region = { id: 'eu' | 'us' | 'oldUk' | 'iec_dc'; L1: RoleColor; L2?: RoleColor; L3?: RoleColor; N: RoleColor; PE: RoleColor }

const REGIONS: Region[] = [
  {
    id: 'eu',
    L1: { color: '#8b4513', label: 'brown' },
    L2: { color: '#111111', label: 'black' },
    L3: { color: '#71717a', label: 'grey' },
    N:  { color: '#2563eb', label: 'blue' },
    PE: { color: '', label: 'greenYellow', gradient: true },
  },
  {
    id: 'us',
    L1: { color: '#111111', label: 'black' },
    L2: { color: '#dc2626', label: 'red' },
    L3: { color: '#2563eb', label: 'blue' },
    N:  { color: '#e5e7eb', label: 'white' },
    PE: { color: '#16a34a', label: 'green' },
  },
  {
    id: 'oldUk',
    L1: { color: '#dc2626', label: 'red' },
    L2: { color: '#facc15', label: 'yellow' },
    L3: { color: '#2563eb', label: 'blue' },
    N:  { color: '#111111', label: 'black' },
    PE: { color: '', label: 'greenYellow', gradient: true },
  },
  {
    id: 'iec_dc',
    L1: { color: '#dc2626', label: 'red_pos' },
    N:  { color: '#111111', label: 'black_neg' },
    PE: { color: '', label: 'greenYellow', gradient: true },
  },
]

function Wire({ c }: { c: RoleColor }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="inline-block h-3 w-8 rounded-sm border border-zinc-300 dark:border-zinc-600"
        style={c.gradient
          ? { background: 'linear-gradient(90deg, #16a34a 50%, #facc15 50%)' }
          : { background: c.color || '#e5e7eb' }}
      />
      <span className="text-xs text-zinc-700 dark:text-zinc-200 truncate">{c.label}</span>
    </div>
  )
}

export default function WireColorsPage() {
  const { t } = useTranslation()

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
      <Link href="/reference" className="mb-4 inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100">
        <ArrowLeft size={14} /> {t('reference.back')}
      </Link>
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">{t('reference.sections.wireColors.title')}</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t('reference.sections.wireColors.desc')}</p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-700">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="bg-zinc-50 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 dark:bg-zinc-800/70 dark:text-zinc-400">
            <tr>
              <th className="px-3 py-2 text-left">{t('reference.wireColors.region')}</th>
              <th className="px-3 py-2 text-left">L1</th>
              <th className="px-3 py-2 text-left">L2</th>
              <th className="px-3 py-2 text-left">L3</th>
              <th className="px-3 py-2 text-left">N</th>
              <th className="px-3 py-2 text-left">PE</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {REGIONS.map((r) => (
              <tr key={r.id}>
                <td className="px-3 py-3 text-xs font-semibold text-zinc-800 dark:text-zinc-100">
                  {t(`reference.wireColors.regions.${r.id}`)}
                </td>
                <td className="px-3 py-3"><Wire c={{ ...r.L1, label: t(`reference.wireColors.colors.${r.L1.label}`) }} /></td>
                <td className="px-3 py-3">{r.L2 ? <Wire c={{ ...r.L2, label: t(`reference.wireColors.colors.${r.L2.label}`) }} /> : <span className="text-xs text-zinc-400">—</span>}</td>
                <td className="px-3 py-3">{r.L3 ? <Wire c={{ ...r.L3, label: t(`reference.wireColors.colors.${r.L3.label}`) }} /> : <span className="text-xs text-zinc-400">—</span>}</td>
                <td className="px-3 py-3"><Wire c={{ ...r.N,  label: t(`reference.wireColors.colors.${r.N.label}`)  }} /></td>
                <td className="px-3 py-3"><Wire c={{ ...r.PE, label: t(`reference.wireColors.colors.${r.PE.label}`) }} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
        ⚠ {t('reference.wireColors.warning')}
      </div>
    </div>
  )
}
