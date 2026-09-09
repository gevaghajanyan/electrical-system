'use client'

import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CalcCard, CalcHeader, Field, FieldRow, ResultBig, ResultRow, SelectField, fmt } from './shared'

type Phase = '1p' | '3p'
const CSA = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70]
const AMPACITY: Record<number, number> = { 1.5: 15, 2.5: 20, 4: 27, 6: 36, 10: 50, 16: 68, 25: 89, 35: 110, 50: 134, 70: 171 }
const CONTACTOR_SIZES = [9, 12, 18, 25, 32, 40, 50, 65, 80, 95, 115, 150]
const MCB_SIZES = [6, 10, 13, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125]

export function MotorSizerCalc() {
  const { t } = useTranslation()
  const [kw, setKw] = useState('7.5')
  const [voltage, setVoltage] = useState('400')
  const [phase, setPhase] = useState<Phase>('3p')
  const [pf, setPf] = useState('0.85')
  const [eff, setEff] = useState('0.9')
  const [dol, setDol] = useState('6')

  const { flc, lra, cable, mcb, contactor, overload } = useMemo(() => {
    const P = (parseFloat(kw) || 0) * 1000
    const V = parseFloat(voltage) || 400
    const PF = Math.max(0.1, parseFloat(pf) || 0.85)
    const eta = Math.max(0.5, parseFloat(eff) || 0.9)
    const factor = phase === '3p' ? Math.sqrt(3) : 1
    const flc = P / (factor * V * PF * eta)
    const lra = flc * (parseFloat(dol) || 6)
    // Cable — 1.25×FLC per IEC/NEC for continuous
    const need = flc * 1.25
    const cable = CSA.find((c) => AMPACITY[c] >= need) ?? CSA.at(-1)!
    // MCB — motor-protection breaker sized ≥ FLC × 1.25
    const mcb = MCB_SIZES.find((r) => r >= flc * 1.25) ?? MCB_SIZES.at(-1)!
    // Contactor — utilization category AC-3, size ≥ FLC (with headroom)
    const contactor = CONTACTOR_SIZES.find((r) => r >= flc * 1.15) ?? CONTACTOR_SIZES.at(-1)!
    // Overload — set to 1.0-1.15 × FLC
    const overload = `${fmt(flc, 1)}–${fmt(flc * 1.15, 1)} A`
    return { flc, lra, cable, mcb, contactor, overload }
  }, [kw, voltage, phase, pf, eff, dol])

  return (
    <CalcCard>
      <CalcHeader title={t('calc.motor_sizer.title')} description={t('calc.motor_sizer.description')} />
      <div className="space-y-4">
        <FieldRow>
          <Field id="mz-kw" label={t('calc.motor_sizer.power')} value={kw} onChange={setKw} unit="kW" step={0.1} min={0.1} />
          <SelectField id="mz-phase" label={t('calc.motor_sizer.phase')} value={phase} onChange={(v) => setPhase(v as Phase)}
            options={[
              { label: t('calc.motor_sizer.singlePhase'), value: '1p' },
              { label: t('calc.motor_sizer.threePhase'),  value: '3p' },
            ]}
          />
        </FieldRow>
        <FieldRow>
          <Field id="mz-v"  label={t('calc.motor_sizer.voltage')} value={voltage} onChange={setVoltage} unit="V" step={10} />
          <Field id="mz-pf" label={t('calc.motor_sizer.pf')}      value={pf}      onChange={setPf}      step={0.01} min={0.1} max={1} />
        </FieldRow>
        <FieldRow>
          <Field id="mz-eff" label={t('calc.motor_sizer.eff')} value={eff} onChange={setEff} step={0.01} min={0.5} max={1} />
          <Field id="mz-dol" label={t('calc.motor_sizer.dol')} value={dol} onChange={setDol} step={0.5} min={3} max={10} hint={t('calc.motor_sizer.dolHint')} />
        </FieldRow>

        <div className="mt-4 space-y-2">
          <ResultBig label={t('calc.motor_sizer.flc')} value={`${fmt(flc, 2)} A`} tone="brand" />
          <ResultRow label={t('calc.motor_sizer.lra')} value={`${fmt(lra, 0)} A`} />
          <ResultRow label={t('calc.motor_sizer.cable')}     value={`${cable} mm²`} />
          <ResultRow label={t('calc.motor_sizer.mcb')}       value={`${mcb} A (curve D or motor-protection)`} />
          <ResultRow label={t('calc.motor_sizer.contactor')} value={`${contactor} A (AC-3)`} />
          <ResultRow label={t('calc.motor_sizer.overload')}  value={overload} />
        </div>

        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
          {t('calc.motor_sizer.notes')}
        </p>
      </div>
    </CalcCard>
  )
}
