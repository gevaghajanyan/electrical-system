'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CalcCard, CalcHeader, Field, FieldRow, Formula, ResultBig, ResultRow, SelectField, fmt } from './shared'

type Material = 'copper' | 'aluminium'
type PhaseType = '1p' | '3p'

const RHO: Record<Material, number> = { copper: 0.0175, aluminium: 0.028 }

/**
 * Percentage voltage drop across a supply cable.
 * 1-φ :  ΔV = 2 · I · ρ · L / A
 * 3-φ :  ΔV = √3 · I · ρ · L / A
 */
export function VoltageDropCalc() {
  const { t } = useTranslation()
  const [current, setCurrent] = useState('16')
  const [length, setLength] = useState('20')
  const [csa, setCsa] = useState('2.5')
  const [voltage, setVoltage] = useState('230')
  const [material, setMaterial] = useState<Material>('copper')
  const [phase, setPhase] = useState<PhaseType>('1p')

  const I = parseFloat(current) || 0
  const L = parseFloat(length) || 0
  const A = parseFloat(csa) || 0
  const V = parseFloat(voltage) || 0
  const factor = phase === '1p' ? 2 : Math.sqrt(3)
  const R = A > 0 ? RHO[material] * L / A : 0
  const drop = factor * I * R
  const pct = V > 0 ? (drop / V) * 100 : 0
  const acceptable = pct <= 3

  return (
    <CalcCard>
      <CalcHeader title={t('calc.voltage_drop.title')} description={t('calc.voltage_drop.description')} />
      <div className="space-y-4">
        <FieldRow>
          <Field id="vd-i" label={t('calc.voltage_drop.current')} value={current} onChange={setCurrent} unit="A" min={0} step={0.1} />
          <Field id="vd-l" label={t('calc.voltage_drop.length')} value={length} onChange={setLength} unit="m" min={0} />
          <Field id="vd-a" label={t('calc.voltage_drop.csa')} value={csa} onChange={setCsa} unit="mm²" min={0.1} step={0.5} />
          <Field id="vd-v" label={t('calc.voltage_drop.voltage')} value={voltage} onChange={setVoltage} unit="V" min={0} />
        </FieldRow>
        <FieldRow>
          <SelectField
            id="vd-phase"
            label={t('calc.voltage_drop.phase')}
            value={phase}
            onChange={(v) => setPhase(v as PhaseType)}
            options={[
              { value: '1p', label: t('calc.voltage_drop.singlePhase') },
              { value: '3p', label: t('calc.voltage_drop.threePhase') },
            ]}
          />
          <SelectField
            id="vd-mat"
            label={t('calc.voltage_drop.material')}
            value={material}
            onChange={(v) => setMaterial(v as Material)}
            options={[
              { value: 'copper', label: t('calc.voltage_drop.copper') },
              { value: 'aluminium', label: t('calc.voltage_drop.aluminium') },
            ]}
          />
        </FieldRow>

        <ResultBig
          label={t('calc.voltage_drop.percentDrop')}
          value={fmt(pct, 2)}
          unit="%"
          tone={acceptable ? 'success' : 'danger'}
        />

        <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900">
          <ResultRow label={t('calc.voltage_drop.dropVolts')} value={fmt(drop, 2)} unit="V" />
          <ResultRow label={t('calc.voltage_drop.resistance')} value={fmt(R, 4)} unit="Ω" />
          <ResultRow
            label={acceptable ? t('calc.voltage_drop.acceptable') : t('calc.voltage_drop.exceeds')}
            value={acceptable ? '≤ 3 %' : '> 3 %'}
            tone={acceptable ? 'success' : 'danger'}
          />
        </div>

        <Formula>ΔV = (2 or √3) · I · ρ · L / A</Formula>
      </div>
    </CalcCard>
  )
}
