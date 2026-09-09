'use client'

import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CalcCard, CalcHeader, Field, ResultBig, ResultRow, fmt } from './shared'

interface Row { id: string; label: string; watts: number; qty: number; df: number }

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6)

export function LoadScheduleCalc() {
  const { t } = useTranslation()
  const [rows, setRows] = useState<Row[]>([
    { id: uid(), label: 'Lighting',        watts: 800,  qty: 1, df: 0.9 },
    { id: uid(), label: 'Sockets',         watts: 3000, qty: 1, df: 0.5 },
    { id: uid(), label: 'Kitchen',         watts: 5000, qty: 1, df: 0.6 },
    { id: uid(), label: 'A/C',             watts: 2500, qty: 1, df: 0.8 },
  ])
  const [voltage, setVoltage] = useState('230')

  const { connected, demand, current } = useMemo(() => {
    const connected = rows.reduce((s, r) => s + r.watts * r.qty, 0)
    const demand = rows.reduce((s, r) => s + r.watts * r.qty * r.df, 0)
    const V = parseFloat(voltage) || 230
    const current = demand / V
    return { connected, demand, current }
  }, [rows, voltage])

  function update(id: string, patch: Partial<Row>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }
  function add() { setRows((prev) => [...prev, { id: uid(), label: 'Circuit', watts: 1000, qty: 1, df: 0.7 }]) }
  function remove(id: string) { setRows((prev) => prev.filter((r) => r.id !== id)) }

  return (
    <CalcCard>
      <CalcHeader title={t('calc.load_schedule.title')} description={t('calc.load_schedule.description')} />
      <div className="space-y-3">
        <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-700">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 dark:bg-zinc-800/70 dark:text-zinc-400">
              <tr>
                <th className="px-2 py-1.5 text-left">{t('calc.load_schedule.label')}</th>
                <th className="px-2 py-1.5 text-right">W</th>
                <th className="px-2 py-1.5 text-right">×</th>
                <th className="px-2 py-1.5 text-right">DF</th>
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="px-1 py-1">
                    <input value={r.label} onChange={(e) => update(r.id, { label: e.target.value })}
                      className="h-8 w-full rounded border border-transparent bg-transparent px-2 text-xs text-zinc-800 focus:border-blue-400 focus:outline-none dark:text-zinc-100" />
                  </td>
                  <td className="px-1 py-1">
                    <input type="number" value={r.watts} onChange={(e) => update(r.id, { watts: Math.max(0, Number(e.target.value)) })}
                      className="h-8 w-20 rounded border border-zinc-200 bg-white px-2 text-right text-xs tabular-nums dark:border-zinc-700 dark:bg-zinc-800" />
                  </td>
                  <td className="px-1 py-1">
                    <input type="number" value={r.qty} onChange={(e) => update(r.id, { qty: Math.max(1, Number(e.target.value)) })}
                      className="h-8 w-14 rounded border border-zinc-200 bg-white px-2 text-right text-xs tabular-nums dark:border-zinc-700 dark:bg-zinc-800" />
                  </td>
                  <td className="px-1 py-1">
                    <input type="number" step={0.05} min={0.1} max={1} value={r.df} onChange={(e) => update(r.id, { df: Math.max(0.1, Math.min(1, Number(e.target.value))) })}
                      className="h-8 w-16 rounded border border-zinc-200 bg-white px-2 text-right text-xs tabular-nums dark:border-zinc-700 dark:bg-zinc-800" />
                  </td>
                  <td className="px-1 py-1">
                    <button type="button" onClick={() => remove(r.id)} className="inline-flex h-6 w-6 items-center justify-center rounded text-zinc-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/40">×</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={add} className="inline-flex items-center gap-1 rounded-md border border-dashed border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:border-blue-400 hover:text-blue-600 dark:border-zinc-600 dark:text-zinc-300">
            + {t('calc.load_schedule.add')}
          </button>
          <div className="ml-auto flex items-center gap-2">
            <label className="text-xs text-zinc-500">V</label>
            <input type="number" value={voltage} onChange={(e) => setVoltage(e.target.value)} className="h-8 w-20 rounded border border-zinc-200 bg-white px-2 text-right text-xs tabular-nums dark:border-zinc-700 dark:bg-zinc-800" />
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <ResultBig label={t('calc.load_schedule.demand')} value={`${fmt(demand / 1000, 2)} kW`} tone="brand" />
          <ResultRow label={t('calc.load_schedule.connected')} value={`${fmt(connected / 1000, 2)} kW`} />
          <ResultRow label={t('calc.load_schedule.diversity')} value={`${fmt(demand / Math.max(1, connected) * 100, 0)} %`} />
          <ResultRow label={t('calc.load_schedule.current')} value={`${fmt(current, 1)} A`} />
        </div>

        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
          {t('calc.load_schedule.notes')}
        </p>
      </div>
    </CalcCard>
  )
}
