'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CalcCard, CalcHeader, Field, FieldRow, ResultBig, ResultRow, fmt } from './shared'

/**
 * Power-factor correction sizing.
 * Qc = P × (tan φ1 − tan φ2)     [kVAR]
 * C  = Qc × 1000 / (2π × f × V²)   [µF, single-phase]
 */
export function PowerFactorCorrectionCalc() {
  const { t } = useTranslation()
  const [kw, setKw] = useState('50')
  const [pf1, setPf1] = useState('0.72')
  const [pf2, setPf2] = useState('0.95')
  const [voltage, setVoltage] = useState('400')
  const [frequency, setFrequency] = useState('50')

  const P = parseFloat(kw) || 0
  const cur = Math.min(1, Math.max(0.01, parseFloat(pf1) || 0))
  const tgt = Math.min(1, Math.max(0.01, parseFloat(pf2) || 0))
  const V = parseFloat(voltage) || 0
  const f = parseFloat(frequency) || 50

  const tan1 = Math.tan(Math.acos(cur))
  const tan2 = Math.tan(Math.acos(tgt))
  const kvar = P * (tan1 - tan2)
  const cap = V > 0 && f > 0 ? (kvar * 1000) / (2 * Math.PI * f * V * V) * 1_000_000 : 0

  return (
    <CalcCard>
      <CalcHeader title={t('calc.pfc.title')} description={t('calc.pfc.description')} />
      <div className="space-y-4">
        <FieldRow>
          <Field id="pfc-p" label={t('calc.pfc.load')} value={kw} onChange={setKw} unit="kW" min={0} />
          <Field id="pfc-v" label={t('calc.pfc.voltage')} value={voltage} onChange={setVoltage} unit="V" min={0} />
          <Field id="pfc-pf1" label={t('calc.pfc.currentPf')} value={pf1} onChange={setPf1} step={0.01} min={0.1} max={1} />
          <Field id="pfc-pf2" label={t('calc.pfc.targetPf')} value={pf2} onChange={setPf2} step={0.01} min={0.1} max={1} />
          <Field id="pfc-f" label={t('calc.pfc.frequency')} value={frequency} onChange={setFrequency} unit="Hz" min={50} max={60} />
        </FieldRow>

        <ResultBig
          label={t('calc.pfc.requiredKvar')}
          value={fmt(kvar, 2)}
          unit="kVAR"
          tone={kvar > 0 ? 'brand' : 'success'}
        />

        <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900">
          <ResultRow label={t('calc.pfc.capacitorSize')} value={fmt(cap, 1)} unit="µF" />
          <ResultRow label={t('calc.pfc.tanPhi1')} value={fmt(tan1, 3)} />
          <ResultRow label={t('calc.pfc.tanPhi2')} value={fmt(tan2, 3)} />
        </div>
      </div>
    </CalcCard>
  )
}
