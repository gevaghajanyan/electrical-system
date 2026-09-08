'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CalcCard, CalcHeader, Field, FieldRow, Formula, ResultBig, ResultRow, SelectField, fmt } from './shared'

// Ω·mm²/m at 20 °C
const RHO: Record<'copper' | 'aluminium', number> = { copper: 0.01724, aluminium: 0.02826 }

/**
 * Cable power loss (I²R heat in the conductor).
 *  R = ρ × (2L) / A         (2L accounts for return path)
 *  P = I² × R
 *  ΔV = I × R
 */
export function CablePowerLossCalc() {
  const { t } = useTranslation()
  const [current, setCurrent] = useState('16')
  const [length, setLength] = useState('20')
  const [csa, setCsa] = useState('2.5')
  const [material, setMaterial] = useState<'copper' | 'aluminium'>('copper')

  const I = parseFloat(current) || 0
  const L = parseFloat(length) || 0
  const A = parseFloat(csa) || 0

  const R = A > 0 ? RHO[material] * (2 * L) / A : 0
  const P = I * I * R
  const dV = I * R

  return (
    <CalcCard>
      <CalcHeader title={t('calc.cable_loss.title')} description={t('calc.cable_loss.description')} />
      <div className="space-y-4">
        <FieldRow>
          <Field id="cl-i" label={t('calc.cable_loss.current')} value={current} onChange={setCurrent} unit="A" min={0} step={0.1} />
          <Field id="cl-l" label={t('calc.cable_loss.length')} value={length} onChange={setLength} unit="m" min={0} step={0.5} />
          <Field id="cl-a" label={t('calc.cable_loss.csa')} value={csa} onChange={setCsa} unit="mm²" min={0.1} step={0.5} />
        </FieldRow>
        <SelectField
          id="cl-mat"
          label={t('calc.cable_loss.material')}
          value={material}
          onChange={(v) => setMaterial(v as 'copper' | 'aluminium')}
          options={[
            { value: 'copper', label: t('calc.cable_loss.copper') },
            { value: 'aluminium', label: t('calc.cable_loss.aluminium') },
          ]}
        />

        <ResultBig
          label={t('calc.cable_loss.powerLoss')}
          value={P >= 1 ? fmt(P, 2) : fmt(P * 1000, 1)}
          unit={P >= 1 ? 'W' : 'mW'}
          tone={P > 20 ? 'warning' : 'brand'}
        />

        <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900">
          <ResultRow label={t('calc.cable_loss.loopResistance')} value={fmt(R, 4)} unit="Ω" />
          <ResultRow label={t('calc.cable_loss.voltageDrop')} value={fmt(dV, 2)} unit="V" />
        </div>

        <Formula>R = ρ × 2L / A · P = I²·R</Formula>
      </div>
    </CalcCard>
  )
}
