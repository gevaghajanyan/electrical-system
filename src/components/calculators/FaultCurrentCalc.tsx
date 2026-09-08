'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CalcCard, CalcHeader, Field, FieldRow, Formula, ResultBig, ResultRow, SelectField, fmt } from './shared'

/**
 * Prospective earth-fault current.
 *  If = Uo / Zs
 *
 * Also compares against typical disconnection times for common MCB ratings.
 */
export function FaultCurrentCalc() {
  const { t } = useTranslation()
  const [voltage, setVoltage] = useState<'230' | '400'>('230')
  const [impedance, setImpedance] = useState('0.35')
  const [mcbRating, setMcbRating] = useState('16')

  const V = Number(voltage)
  const Zs = parseFloat(impedance) || 0
  const rating = parseFloat(mcbRating) || 0
  const If = Zs > 0 ? V / Zs : 0

  // For a type C MCB, magnetic trip requires ≥ 10× In (worst case).
  // Instantaneous disconnect if If ≥ 10 × In.
  const requiredForDisconnect = rating * 10
  const disconnectOk = If >= requiredForDisconnect && requiredForDisconnect > 0

  return (
    <CalcCard>
      <CalcHeader title={t('calc.fault.title')} description={t('calc.fault.description')} />
      <div className="space-y-4">
        <FieldRow>
          <SelectField
            id="fc-v"
            label={t('calc.fault.nominalVoltage')}
            value={voltage}
            onChange={(v) => setVoltage(v as '230' | '400')}
            options={[
              { value: '230', label: t('calc.fault.v230') },
              { value: '400', label: t('calc.fault.v400') },
            ]}
          />
          <Field id="fc-zs" label={t('calc.fault.impedance')} value={impedance} onChange={setImpedance} unit="Ω" step={0.01} min={0.001} />
          <Field id="fc-mcb" label={t('calc.fault.mcbRating')} value={mcbRating} onChange={setMcbRating} unit="A" min={0} />
        </FieldRow>

        <ResultBig
          label={t('calc.fault.faultCurrent')}
          value={fmt(If, 1)}
          unit="A"
          tone={disconnectOk ? 'success' : 'danger'}
        />

        <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900">
          <ResultRow label={t('calc.fault.faultKa')} value={fmt(If / 1000, 3)} unit="kA" />
          <ResultRow label={t('calc.fault.required10in')} value={fmt(requiredForDisconnect, 0)} unit="A" />
          <ResultRow
            label={t('calc.fault.mcbDisconnect')}
            value={disconnectOk ? t('calc.fault.willDisconnect') : t('calc.fault.wontDisconnect')}
            tone={disconnectOk ? 'success' : 'danger'}
          />
        </div>

        <Formula>If = Uo / Zs · Trip ≥ 10 × In (Type C)</Formula>
      </div>
    </CalcCard>
  )
}
