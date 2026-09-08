'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CalcCard, CalcHeader, Field, FieldRow, Formula, ResultBig, ResultRow, SelectField, fmt } from './shared'

type MotorType = 'induction' | 'synchronous' | 'dc'
type StartMethod = 'dol' | 'star_delta' | 'soft' | 'vfd'

// Multiplier applied to Direct-On-Line locked-rotor current for each method.
const METHOD_MULT: Record<StartMethod, number> = {
  dol: 1.0,
  star_delta: 1 / 3,
  soft: 0.4,   // typical soft-starter ramp
  vfd: 0.15,   // VFD current is ≈ full load
}

/**
 * Motor startup / locked-rotor current for each start method.
 * FLC (three-phase) = P / (√3 · V · cos φ · η)
 * LRA               = FLC × LRR (locked-rotor ratio, ~6 for typical induction)
 * I_start           = LRA × method multiplier
 */
export function MotorStartupCalc() {
  const { t } = useTranslation()
  const [motorType, setMotorType] = useState<MotorType>('induction')
  const [method, setMethod] = useState<StartMethod>('dol')
  const [powerKw, setPowerKw] = useState('7.5')
  const [voltage, setVoltage] = useState('400')
  const [pf, setPf] = useState('0.85')
  const [eff, setEff] = useState('0.9')
  const [lrr, setLrr] = useState('6')

  const P = (parseFloat(powerKw) || 0) * 1000
  const V = parseFloat(voltage) || 0
  const PF = parseFloat(pf) || 0
  const EFF = parseFloat(eff) || 0
  const LRR = Math.max(1, parseFloat(lrr) || 6)

  const flc = (() => {
    if (!P || !V || !EFF) return 0
    if (motorType === 'dc') return P / (V * EFF)
    return P / (Math.sqrt(3) * V * PF * EFF)
  })()

  const lra = flc * LRR
  const iStart = lra * METHOD_MULT[method]

  return (
    <CalcCard>
      <CalcHeader title={t('calc.startup.title')} description={t('calc.startup.description')} />
      <div className="space-y-4">
        <FieldRow>
          <SelectField
            id="ms-type"
            label={t('calc.startup.motorType')}
            value={motorType}
            onChange={(v) => setMotorType(v as MotorType)}
            options={[
              { value: 'induction', label: t('calc.startup.types.induction') },
              { value: 'synchronous', label: t('calc.startup.types.synchronous') },
              { value: 'dc', label: t('calc.startup.types.dc') },
            ]}
          />
          <SelectField
            id="ms-method"
            label={t('calc.startup.startMethod')}
            value={method}
            onChange={(v) => setMethod(v as StartMethod)}
            options={[
              { value: 'dol', label: t('calc.startup.methods.dol') },
              { value: 'star_delta', label: t('calc.startup.methods.star_delta') },
              { value: 'soft', label: t('calc.startup.methods.soft') },
              { value: 'vfd', label: t('calc.startup.methods.vfd') },
            ]}
          />
        </FieldRow>
        <FieldRow>
          <Field id="ms-p" label={t('calc.startup.power')} value={powerKw} onChange={setPowerKw} unit="kW" step={0.1} min={0} />
          <Field id="ms-v" label={t('calc.startup.voltage')} value={voltage} onChange={setVoltage} unit="V" min={0} />
          <Field id="ms-pf" label={t('calc.startup.pf')} value={pf} onChange={setPf} step={0.01} min={0.1} max={1} />
          <Field id="ms-eff" label={t('calc.startup.efficiency')} value={eff} onChange={setEff} step={0.01} min={0.1} max={1} />
          <Field id="ms-lrr" label={t('calc.startup.lrr')} value={lrr} onChange={setLrr} step={0.1} min={1} max={12} hint={t('calc.startup.lrrHint')} />
        </FieldRow>

        <ResultBig
          label={t('calc.startup.startCurrent')}
          value={fmt(iStart, 1)}
          unit="A"
          tone={method === 'dol' ? 'warning' : 'brand'}
        />

        <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900">
          <ResultRow label={t('calc.startup.flc')} value={fmt(flc, 2)} unit="A" />
          <ResultRow label={t('calc.startup.lra')} value={fmt(lra, 1)} unit="A" tone="warning" />
          <ResultRow label={t('calc.startup.multiplier')} value={fmt(METHOD_MULT[method], 3)} unit="×" />
        </div>

        <Formula>I_start = FLC × LRR × K_method</Formula>
      </div>
    </CalcCard>
  )
}
