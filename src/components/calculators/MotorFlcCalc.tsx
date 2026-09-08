'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CalcCard, CalcHeader, Field, FieldRow, ResultBig, ResultRow, SelectField, fmt } from './shared'

type Phases = 1 | 3

/**
 * Motor Full Load Current — from mechanical output power and efficiency.
 * I = P / (η × PF × V)   (1-phase)
 * I = P / (√3 × η × PF × V)   (3-phase)
 */
export function MotorFlcCalc() {
  const { t } = useTranslation()
  const [kw, setKw] = useState('4')
  const [voltage, setVoltage] = useState('400')
  const [pf, setPf] = useState('0.85')
  const [eff, setEff] = useState('0.9')
  const [phases, setPhases] = useState<Phases>(3)

  const P = (parseFloat(kw) || 0) * 1000
  const V = parseFloat(voltage) || 0
  const PF = parseFloat(pf) || 0
  const EFF = parseFloat(eff) || 0

  const flc = (() => {
    if (!P || !V || !PF || !EFF) return 0
    if (phases === 1) return P / (V * PF * EFF)
    return P / (Math.sqrt(3) * V * PF * EFF)
  })()

  const startup = flc * 6   // typical DOL start ~6× FLC
  const mcb = Math.ceil(flc * 1.25 / 5) * 5 || 0

  return (
    <CalcCard>
      <CalcHeader title={t('calc.motor.title')} description={t('calc.motor.description')} />
      <div className="space-y-4">
        <FieldRow>
          <Field id="mot-kw" label={t('calc.motor.power')} value={kw} onChange={setKw} unit="kW" step={0.1} min={0} />
          <Field id="mot-v" label={t('calc.motor.voltage')} value={voltage} onChange={setVoltage} unit="V" min={0} />
          <Field id="mot-pf" label={t('calc.motor.pf')} value={pf} onChange={setPf} step={0.01} min={0.1} max={1} />
          <Field id="mot-eff" label={t('calc.motor.efficiency')} value={eff} onChange={setEff} step={0.01} min={0.1} max={1} />
        </FieldRow>
        <SelectField
          id="mot-phases"
          label={t('calc.motor.supply')}
          value={phases}
          onChange={(v) => setPhases(Number(v) as Phases)}
          options={[
            { value: 1, label: t('calc.motor.singlePhase') },
            { value: 3, label: t('calc.motor.threePhase') },
          ]}
        />

        <ResultBig label={t('calc.motor.flc')} value={fmt(flc, 2)} unit="A" />

        <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900">
          <ResultRow label={t('calc.motor.startupCurrent')} value={fmt(startup, 1)} unit="A" tone="warning" />
          <ResultRow label={t('calc.motor.suggestedMcb')} value={String(mcb)} unit="A" tone="success" />
        </div>
      </div>
    </CalcCard>
  )
}
