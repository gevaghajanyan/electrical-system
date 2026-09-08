'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CalcCard, CalcHeader, Field, FieldRow, Formula, ResultBig, ResultRow, fmt } from './shared'

export function VoltageDividerCalc() {
  const { t } = useTranslation()
  const [vin, setVin] = useState('12')
  const [r1, setR1] = useState('10000')
  const [r2, setR2] = useState('4700')

  const Vin = parseFloat(vin) || 0
  const R1 = parseFloat(r1) || 0
  const R2 = parseFloat(r2) || 0

  const Vout = R1 + R2 > 0 ? (Vin * R2) / (R1 + R2) : 0
  const current = R1 + R2 > 0 ? Vin / (R1 + R2) : 0
  const powerR1 = current * current * R1
  const powerR2 = current * current * R2

  return (
    <CalcCard>
      <CalcHeader title={t('calc.divider.title')} description={t('calc.divider.description')} />
      <div className="space-y-4">
        <FieldRow>
          <Field id="vd-in" label={t('calc.divider.vin')} value={vin} onChange={setVin} unit="V" step={0.1} />
          <Field id="vd-r1" label="R1" value={r1} onChange={setR1} unit="Ω" min={0} />
          <Field id="vd-r2" label="R2" value={r2} onChange={setR2} unit="Ω" min={0} />
        </FieldRow>

        <ResultBig label={t('calc.divider.vout')} value={fmt(Vout, 3)} unit="V" />

        <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900">
          <ResultRow label={t('calc.divider.current')} value={fmt(current * 1000, 3)} unit="mA" />
          <ResultRow label="P (R1)" value={fmt(powerR1 * 1000, 2)} unit="mW" />
          <ResultRow label="P (R2)" value={fmt(powerR2 * 1000, 2)} unit="mW" />
        </div>

        <Formula>Vout = Vin × R2 / (R1 + R2)</Formula>
      </div>
    </CalcCard>
  )
}
