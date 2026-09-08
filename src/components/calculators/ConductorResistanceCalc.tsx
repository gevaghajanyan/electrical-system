'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CalcCard, CalcHeader, Field, FieldRow, Formula, ResultBig, ResultRow, SelectField, fmt } from './shared'

// Ω·mm²/m at 20 °C
const RHO_20: Record<'copper' | 'aluminium', number> = { copper: 0.01724, aluminium: 0.02826 }
// Temp coefficient (per °C)
const ALPHA: Record<'copper' | 'aluminium', number> = { copper: 0.00393, aluminium: 0.00403 }

/**
 * DC / low-frequency resistance of a straight conductor.
 *  R = ρ₂₀ × L / A × [1 + α(T − 20)]
 */
export function ConductorResistanceCalc() {
  const { t } = useTranslation()
  const [length, setLength] = useState('100')
  const [csa, setCsa] = useState('2.5')
  const [temp, setTemp] = useState('20')
  const [material, setMaterial] = useState<'copper' | 'aluminium'>('copper')

  const L = parseFloat(length) || 0
  const A = parseFloat(csa) || 0
  const T = parseFloat(temp) || 20
  const rho20 = RHO_20[material]
  const R20 = A > 0 ? rho20 * L / A : 0
  const R = R20 * (1 + ALPHA[material] * (T - 20))
  const perKm = A > 0 ? (rho20 * 1000) / A : 0

  return (
    <CalcCard>
      <CalcHeader title={t('calc.cond_r.title')} description={t('calc.cond_r.description')} />
      <div className="space-y-4">
        <FieldRow>
          <Field id="cr-l" label={t('calc.cond_r.length')} value={length} onChange={setLength} unit="m" min={0} step={0.1} />
          <Field id="cr-a" label={t('calc.cond_r.csa')} value={csa} onChange={setCsa} unit="mm²" min={0.1} step={0.5} />
          <Field id="cr-t" label={t('calc.cond_r.temperature')} value={temp} onChange={setTemp} unit="°C" step={1} />
        </FieldRow>
        <SelectField
          id="cr-mat"
          label={t('calc.cond_r.material')}
          value={material}
          onChange={(v) => setMaterial(v as 'copper' | 'aluminium')}
          options={[
            { value: 'copper', label: t('calc.cond_r.copper') },
            { value: 'aluminium', label: t('calc.cond_r.aluminium') },
          ]}
        />

        <ResultBig label={`R @ ${T}°C`} value={fmt(R, 4)} unit="Ω" />

        <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900">
          <ResultRow label="R @ 20°C" value={fmt(R20, 4)} unit="Ω" />
          <ResultRow label={t('calc.cond_r.perKm')} value={fmt(perKm, 3)} unit="Ω/km" />
        </div>

        <Formula>R = ρ · L / A · [1 + α(T − 20)]</Formula>
      </div>
    </CalcCard>
  )
}
