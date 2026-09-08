'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { CalcCard, CalcHeader, ResultBig, fmt } from './shared'

type Mode = 'series' | 'parallel'

/**
 * Capacitor network (µF).
 *  Parallel: C = ΣCᵢ   (add straight)
 *  Series:   1/C = Σ(1/Cᵢ)   (reciprocal sum — opposite of resistors)
 */
export function CapacitorNetworkCalc() {
  const { t } = useTranslation()
  const [mode, setMode] = useState<Mode>('parallel')
  const [values, setValues] = useState<string[]>(['10', '22', '47'])

  function update(i: number, v: string) {
    setValues((prev) => prev.map((x, j) => (j === i ? v : x)))
  }
  function addRow() { setValues((prev) => [...prev, '']) }
  function removeRow(i: number) {
    setValues((prev) => (prev.length > 2 ? prev.filter((_, j) => j !== i) : prev))
  }

  const nums = values.map((v) => parseFloat(v)).filter((n) => isFinite(n) && n > 0)
  const total = (() => {
    if (nums.length === 0) return 0
    if (mode === 'parallel') return nums.reduce((s, c) => s + c, 0)
    const invSum = nums.reduce((s, c) => s + 1 / c, 0)
    return invSum > 0 ? 1 / invSum : 0
  })()

  return (
    <CalcCard>
      <CalcHeader title={t('calc.cap_net.title')} description={t('calc.cap_net.description')} />
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-1 rounded-lg border border-zinc-200 p-1 dark:border-zinc-700">
          {(['series', 'parallel'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`min-h-[36px] rounded-md px-2 py-1.5 text-xs font-medium transition-colors touch-manipulation ${
                mode === m
                  ? 'bg-zinc-900 text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-900'
                  : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
              }`}
            >
              {t(`calc.cap_net.${m}`)}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {values.map((v, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="number"
                min={0}
                step="any"
                value={v}
                onChange={(e) => update(i, e.target.value)}
                placeholder={`C${i + 1}`}
                className="flex-1 h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <span className="inline-flex items-center rounded-md border border-l-0 border-zinc-300 bg-zinc-100 px-3 text-xs font-medium text-zinc-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-400">
                µF
              </span>
              <button
                type="button"
                onClick={() => removeRow(i)}
                disabled={values.length <= 2}
                className="h-10 w-10 shrink-0 rounded-md border border-zinc-200 text-zinc-400 hover:bg-zinc-50 hover:text-red-500 disabled:opacity-30 dark:border-zinc-700 dark:hover:bg-zinc-800"
                aria-label="remove"
              >
                ✕
              </button>
            </div>
          ))}
          <Button size="sm" variant="outline" onClick={addRow} className="w-full">
            + {t('calc.cap_net.addCap')}
          </Button>
        </div>

        <ResultBig
          label={t('calc.cap_net.total')}
          value={total < 1000 ? fmt(total, 3) : fmt(total / 1000, 3)}
          unit={total < 1000 ? 'µF' : 'mF'}
        />
      </div>
    </CalcCard>
  )
}
