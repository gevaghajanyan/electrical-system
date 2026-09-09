'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'

type Material = 'cu' | 'al'
type Ins = 'pvc70' | 'xlpe90'
type Method = 'enclosed' | 'wall' | 'open' | 'buried'

const CSA = [1, 1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240]

// Simplified typical ampacities (A) — indicative only. Copper conductors.
// PVC 70 °C insulation baseline; XLPE 90 °C multiplied by ~1.30.
const CU_PVC_ENCLOSED: Record<number, number> = { 1: 11, 1.5: 15, 2.5: 20, 4: 27, 6: 36, 10: 50, 16: 68, 25: 89, 35: 111, 50: 134, 70: 171, 95: 207, 120: 239, 150: 275, 185: 313, 240: 367 }

function ampacity(csa: number, m: Material, ins: Ins, method: Method): number {
  const base = CU_PVC_ENCLOSED[csa]
  const insF = ins === 'xlpe90' ? 1.30 : 1.0
  const methodF: Record<Method, number> = { enclosed: 1.0, wall: 1.10, open: 1.20, buried: 1.15 }
  const matF: Record<Material, number> = { cu: 1.0, al: 0.78 }
  return Math.round(base * insF * methodF[method] * matF[m])
}

export default function AmpacityPage() {
  const { t } = useTranslation()
  const [mat, setMat] = useState<Material>('cu')
  const [ins, setIns] = useState<Ins>('pvc70')
  const [method, setMethod] = useState<Method>('enclosed')
  const [temp, setTemp] = useState(30)  // °C ambient

  const tempFactor = useMemo(() => {
    // Rough IEC ambient-derating for 70/90 °C insulation
    const t70: Record<number, number> = { 10: 1.22, 15: 1.17, 20: 1.12, 25: 1.06, 30: 1.0, 35: 0.94, 40: 0.87, 45: 0.79, 50: 0.71, 55: 0.61, 60: 0.5 }
    const t90: Record<number, number> = { 10: 1.15, 15: 1.12, 20: 1.08, 25: 1.04, 30: 1.0, 35: 0.96, 40: 0.91, 45: 0.87, 50: 0.82, 55: 0.76, 60: 0.71 }
    const key = Math.max(10, Math.min(60, Math.round(temp / 5) * 5))
    return (ins === 'xlpe90' ? t90 : t70)[key] ?? 1
  }, [temp, ins])

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
      <Link href="/reference" className="mb-4 inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100">
        <ArrowLeft size={14} /> {t('reference.back')}
      </Link>
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">{t('reference.sections.ampacity.title')}</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t('reference.sections.ampacity.desc')}</p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">{t('reference.ampacity.material')}</p>
          <div className="grid grid-cols-2 gap-1 rounded-lg border border-zinc-200 p-1 dark:border-zinc-700">
            {(['cu', 'al'] as const).map((m) => (
              <button key={m} onClick={() => setMat(m)} className={`min-h-[36px] rounded-md px-2 text-xs font-semibold ${mat === m ? 'bg-blue-600 text-white' : 'text-zinc-600 dark:text-zinc-300'}`}>
                {t(`reference.ampacity.mat.${m}`)}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">{t('reference.ampacity.insulation')}</p>
          <div className="grid grid-cols-2 gap-1 rounded-lg border border-zinc-200 p-1 dark:border-zinc-700">
            {(['pvc70', 'xlpe90'] as const).map((i) => (
              <button key={i} onClick={() => setIns(i)} className={`min-h-[36px] rounded-md px-2 text-xs font-semibold ${ins === i ? 'bg-blue-600 text-white' : 'text-zinc-600 dark:text-zinc-300'}`}>
                {t(`reference.ampacity.ins.${i}`)}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">{t('reference.ampacity.method')}</p>
          <select value={method} onChange={(e) => setMethod(e.target.value as Method)}
            className="h-10 w-full rounded-md border border-zinc-300 bg-white px-2 text-xs dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100">
            {(['enclosed', 'wall', 'open', 'buried'] as const).map((m) => (
              <option key={m} value={m}>{t(`reference.ampacity.methods.${m}`)}</option>
            ))}
          </select>
        </div>
        <div>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">{t('reference.ampacity.ambient')}</p>
          <input type="number" value={temp} onChange={(e) => setTemp(Number(e.target.value) || 30)} min={10} max={60} step={5}
            className="h-10 w-full rounded-md border border-zinc-300 bg-white px-2 text-xs tabular-nums dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100" />
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-700">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 dark:bg-zinc-800/70 dark:text-zinc-400">
            <tr>
              <th className="px-3 py-2 text-left">CSA (mm²)</th>
              <th className="px-3 py-2 text-right">{t('reference.ampacity.base')} (A)</th>
              <th className="px-3 py-2 text-right">{t('reference.ampacity.derated')} (A)</th>
              <th className="px-3 py-2 text-right">{t('reference.ampacity.suggestedMcb')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {CSA.map((c) => {
              const base = ampacity(c, mat, ins, method)
              const derated = Math.round(base * tempFactor)
              const mcbLadder = [6, 10, 13, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400]
              const mcb = [...mcbLadder].reverse().find((r) => r <= derated) ?? 6
              return (
                <tr key={c}>
                  <td className="px-3 py-2 font-mono font-semibold text-zinc-800 dark:text-zinc-100">{c}</td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums text-zinc-500">{base}</td>
                  <td className="px-3 py-2 text-right font-mono font-semibold tabular-nums text-blue-700 dark:text-blue-300">{derated}</td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums text-zinc-700 dark:text-zinc-200">{mcb} A</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-[11px] text-zinc-500 dark:text-zinc-400">
        {t('reference.ampacity.notes')}
      </p>
    </div>
  )
}
