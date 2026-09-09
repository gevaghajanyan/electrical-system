'use client'

import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CalcCard, CalcHeader, Field, FieldRow, ResultBig, ResultRow, SelectField, fmt } from './shared'

/**
 * Conduit fill calculator (IEC / NEC common limits).
 * IEC: 40% for 3+ conductors, 31% for 2, 53% for 1.
 * NEC 40% for 3+; 31% for 2; 53% for 1 — same numbers, different code.
 */
type CableEntry = { csa: number; count: number }

const CSA_TO_OD: Record<number, number> = {
  1: 2.9, 1.5: 3.2, 2.5: 3.8, 4: 4.4, 6: 5.1, 10: 6.5, 16: 7.8,
  25: 10.5, 35: 11.9, 50: 13.7, 70: 15.8, 95: 18.0, 120: 20.0,
}

const CONDUIT_OD: number[] = [16, 20, 25, 32, 40, 50, 63, 75, 90, 110]

function fillLimit(count: number): number {
  if (count <= 1) return 0.53
  if (count === 2) return 0.31
  return 0.40
}

export function ConduitFillCalc() {
  const { t } = useTranslation()
  const [cables, setCables] = useState<CableEntry[]>([
    { csa: 2.5, count: 3 },
    { csa: 2.5, count: 1 },
  ])
  const [conduitOd, setConduitOd] = useState<number>(25)

  const { totalArea, conduitArea, fillPct, totalCount, ok, limit, recommendedOd } = useMemo(() => {
    const totalCount = cables.reduce((s, c) => s + c.count, 0)
    // Sum of individual cable cross-section areas (πd²/4)
    const totalArea = cables.reduce((s, c) => {
      const od = CSA_TO_OD[c.csa] ?? 5
      return s + c.count * Math.PI * (od / 2) ** 2
    }, 0)
    // Inside-diameter is roughly 92% of nominal OD for common conduit walls.
    const innerOd = conduitOd * 0.92
    const conduitArea = Math.PI * (innerOd / 2) ** 2
    const fillPct = conduitArea > 0 ? (totalArea / conduitArea) * 100 : 0
    const limit = fillLimit(totalCount) * 100
    const ok = fillPct <= limit
    // Recommend smallest standard OD that keeps fill ≤ limit
    const recommendedOd = CONDUIT_OD.find((od) => {
      const inner = od * 0.92
      return (totalArea / (Math.PI * (inner / 2) ** 2)) * 100 <= limit
    }) ?? CONDUIT_OD.at(-1)!
    return { totalArea, conduitArea, fillPct, totalCount, ok, limit, recommendedOd }
  }, [cables, conduitOd])

  function updateCable(i: number, patch: Partial<CableEntry>) {
    setCables((prev) => prev.map((c, idx) => (idx === i ? { ...c, ...patch } : c)))
  }
  function addCable() { setCables((prev) => [...prev, { csa: 2.5, count: 1 }]) }
  function removeCable(i: number) { setCables((prev) => prev.filter((_, idx) => idx !== i)) }

  return (
    <CalcCard>
      <CalcHeader title={t('calc.conduit_fill.title')} description={t('calc.conduit_fill.description')} />
      <div className="space-y-4">
        {/* Cable list */}
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            {t('calc.conduit_fill.cables')}
          </p>
          <div className="space-y-2">
            {cables.map((c, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                <SelectField
                  id={`csa-${i}`}
                  label={i === 0 ? t('calc.conduit_fill.csa') : ''}
                  value={String(c.csa)}
                  onChange={(v) => updateCable(i, { csa: parseFloat(v) })}
                  options={Object.keys(CSA_TO_OD).map((k) => ({ label: `${k} mm²`, value: k }))}
                />
                <Field
                  id={`count-${i}`}
                  label={i === 0 ? t('calc.conduit_fill.count') : ''}
                  value={c.count}
                  onChange={(v) => updateCable(i, { count: Math.max(1, parseInt(v) || 1) })}
                  min={1}
                  step={1}
                />
                <button
                  type="button"
                  onClick={() => removeCable(i)}
                  disabled={cables.length === 1}
                  aria-label="Remove"
                  className="mt-auto inline-flex h-10 w-10 items-center justify-center rounded-md text-zinc-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-30 dark:hover:bg-red-950/40"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addCable}
            className="mt-2 inline-flex items-center gap-1 rounded-md border border-dashed border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:border-blue-400 hover:text-blue-600 dark:border-zinc-600 dark:text-zinc-300"
          >
            + {t('calc.conduit_fill.addCable')}
          </button>
        </div>

        <FieldRow>
          <SelectField
            id="conduit-od"
            label={t('calc.conduit_fill.conduit')}
            value={String(conduitOd)}
            onChange={(v) => setConduitOd(parseInt(v))}
            options={CONDUIT_OD.map((od) => ({ label: `${od} mm`, value: String(od) }))}
          />
        </FieldRow>

        <div className="mt-4 space-y-2">
          <ResultBig
            label={t('calc.conduit_fill.fill')}
            value={`${fmt(fillPct, 1)} %`}
            tone={ok ? 'success' : 'danger'}
          />
          <ResultRow label={t('calc.conduit_fill.limit')} value={`≤ ${fmt(limit, 0)} %`} />
          <ResultRow label={t('calc.conduit_fill.totalArea')} value={`${fmt(totalArea, 1)} mm²`} />
          <ResultRow label={t('calc.conduit_fill.conduitArea')} value={`${fmt(conduitArea, 1)} mm²`} />
          <ResultRow label={t('calc.conduit_fill.count')} value={String(totalCount)} />
          <ResultRow label={t('calc.conduit_fill.recommended')} value={`${recommendedOd} mm`} />
        </div>

        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
          {t('calc.conduit_fill.notes')}
        </p>
      </div>
    </CalcCard>
  )
}
