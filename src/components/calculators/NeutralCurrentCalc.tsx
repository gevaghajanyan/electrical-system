'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CalcCard, CalcHeader, Field, Formula, ResultBig, ResultRow, fmt } from './shared'

/**
 * Neutral current in a balanced 3-phase system (120° phasing, linear loads).
 *  |In| = √(I1² + I2² + I3² − I1·I2 − I2·I3 − I3·I1)
 *
 * If the loads are non-linear (harmonic-rich) the neutral can actually exceed
 * any single phase — we display a plain unbalance ratio so the user sees
 * where they stand.
 */
export function NeutralCurrentCalc() {
  const { t } = useTranslation()
  const [i1, setI1] = useState('16')
  const [i2, setI2] = useState('14')
  const [i3, setI3] = useState('20')

  const I1 = parseFloat(i1) || 0
  const I2 = parseFloat(i2) || 0
  const I3 = parseFloat(i3) || 0

  const In = Math.sqrt(
    Math.max(0, I1 * I1 + I2 * I2 + I3 * I3 - I1 * I2 - I2 * I3 - I3 * I1),
  )

  const avg = (I1 + I2 + I3) / 3
  const maxDev = Math.max(Math.abs(I1 - avg), Math.abs(I2 - avg), Math.abs(I3 - avg))
  const unbalance = avg > 0 ? (maxDev / avg) * 100 : 0

  return (
    <CalcCard>
      <CalcHeader title={t('calc.neutral.title')} description={t('calc.neutral.description')} />
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <Field id="n-i1" label="I₁ (L1)" value={i1} onChange={setI1} unit="A" min={0} step={0.1} />
          <Field id="n-i2" label="I₂ (L2)" value={i2} onChange={setI2} unit="A" min={0} step={0.1} />
          <Field id="n-i3" label="I₃ (L3)" value={i3} onChange={setI3} unit="A" min={0} step={0.1} />
        </div>

        <ResultBig
          label={t('calc.neutral.neutralCurrent')}
          value={fmt(In, 2)}
          unit="A"
          tone={In > Math.max(I1, I2, I3) ? 'warning' : 'brand'}
        />

        <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900">
          <ResultRow label={t('calc.neutral.avgCurrent')} value={fmt(avg, 2)} unit="A" />
          <ResultRow
            label={t('calc.neutral.unbalance')}
            value={fmt(unbalance, 1)}
            unit="%"
            tone={unbalance > 15 ? 'warning' : unbalance > 25 ? 'danger' : 'success'}
          />
        </div>

        <Formula>|In| = √(I₁²+I₂²+I₃² − I₁I₂ − I₂I₃ − I₃I₁)</Formula>
      </div>
    </CalcCard>
  )
}
