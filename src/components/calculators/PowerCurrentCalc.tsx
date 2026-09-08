'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CalcCard, CalcHeader, Field, FieldRow, ResultBig, ResultRow, SelectField, fmt } from './shared'

type Phase = '1p' | '3p'

/**
 * Active-power → line current, plus apparent + reactive power.
 * 1-φ:  I = S / V = P / (V · cos φ)
 * 3-φ:  I = S / (√3 · V) = P / (√3 · V · cos φ)
 */
export function PowerCurrentCalc() {
  const { t } = useTranslation()
  const [power, setPower] = useState('3000')
  const [pf, setPf] = useState('0.95')
  const [phase, setPhase] = useState<Phase>('1p')
  const [voltage, setVoltage] = useState<'230' | '400'>('230')

  const P = parseFloat(power) || 0
  const cosPhi = Math.max(0.01, Math.min(1, parseFloat(pf) || 0))
  const V = Number(voltage)

  const S = P / cosPhi
  const Q = S * Math.sin(Math.acos(cosPhi))
  const I = phase === '1p' ? S / V : S / (Math.sqrt(3) * V)

  return (
    <CalcCard>
      <CalcHeader title={t('calc.power.title')} description={t('calc.power.description')} />
      <div className="space-y-4">
        <FieldRow>
          <Field id="pc-p" label={t('calc.power.activePower')} value={power} onChange={setPower} unit="W" min={0} />
          <Field id="pc-pf" label={t('calc.power.pf')} value={pf} onChange={setPf} step={0.01} min={0.1} max={1} />
        </FieldRow>
        <FieldRow>
          <SelectField
            id="pc-phase"
            label={t('calc.power.supply')}
            value={phase}
            onChange={(v) => setPhase(v as Phase)}
            options={[
              { value: '1p', label: t('calc.power.singlePhase') },
              { value: '3p', label: t('calc.power.threePhase') },
            ]}
          />
          <SelectField
            id="pc-v"
            label={t('calc.power.voltage')}
            value={voltage}
            onChange={(v) => setVoltage(v as '230' | '400')}
            options={[
              { value: '230', label: '230V' },
              { value: '400', label: '400V' },
            ]}
          />
        </FieldRow>

        <ResultBig label={t('calc.power.lineCurrent')} value={fmt(I, 2)} unit="A" />

        <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900">
          <ResultRow label={t('calc.power.apparentPower')} value={fmt(S, 1)} unit="VA" />
          <ResultRow label={t('calc.power.reactivePower')} value={fmt(Q, 1)} unit="VAR" tone="warning" />
        </div>
      </div>
    </CalcCard>
  )
}
