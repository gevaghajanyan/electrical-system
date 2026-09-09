'use client'

import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CalcCard, CalcHeader, Field, FieldRow, ResultBig, ResultRow, SelectField, fmt } from './shared'

/**
 * Prospective short-circuit current at a panel busbar, from the upstream
 * distribution transformer.
 *
 *   Isc = Sn / (√3 × U × uk%)    for 3-phase
 *   Isc = Sn / (U × uk%)         for 1-phase (approximation)
 *
 * Sn = transformer nominal kVA, U = secondary line voltage, uk% = short-circuit
 * impedance (typically 4–6% for distribution transformers).
 */
type PhaseType = '1p' | '3p'

export function UpstreamFaultCalc() {
  const { t } = useTranslation()
  const [kva, setKva] = useState('630')
  const [voltage, setVoltage] = useState('400')
  const [uk, setUk] = useState('4')
  const [phase, setPhase] = useState<PhaseType>('3p')

  const { isc, iscKa, breakingRequired, description } = useMemo(() => {
    const Sn = parseFloat(kva) * 1000 || 0        // VA
    const U = parseFloat(voltage) || 400
    const ukFrac = Math.max(0.001, (parseFloat(uk) || 4) / 100)
    const factor = phase === '3p' ? Math.sqrt(3) : 1
    const isc = Sn > 0 && U > 0 ? Sn / (factor * U * ukFrac) : 0
    const iscKa = isc / 1000
    // Standard MCB / MCCB breaking capacity ladder (kA):
    const CAPS = [6, 10, 15, 25, 36, 50, 65]
    const breakingRequired = CAPS.find((c) => c >= iscKa) ?? CAPS.at(-1)!
    const description =
      iscKa <= 6 ? t('calc.upstream_fault.desc6')
      : iscKa <= 10 ? t('calc.upstream_fault.desc10')
      : iscKa <= 25 ? t('calc.upstream_fault.desc25')
      : t('calc.upstream_fault.descHigh')
    return { isc, iscKa, breakingRequired, description }
  }, [kva, voltage, uk, phase, t])

  return (
    <CalcCard>
      <CalcHeader title={t('calc.upstream_fault.title')} description={t('calc.upstream_fault.description')} />
      <div className="space-y-4">
        <FieldRow>
          <Field id="kva" label={t('calc.upstream_fault.kva')} value={kva} onChange={setKva} unit="kVA" min={5} step={10} />
          <Field id="uk"  label={t('calc.upstream_fault.uk')}  value={uk}  onChange={setUk}  unit="%" min={1} step={0.5} hint={t('calc.upstream_fault.ukHint')} />
        </FieldRow>
        <FieldRow>
          <Field id="voltage" label={t('calc.upstream_fault.voltage')} value={voltage} onChange={setVoltage} unit="V" min={100} step={10} />
          <SelectField
            id="phase"
            label={t('calc.upstream_fault.phase')}
            value={phase}
            onChange={(v) => setPhase(v as PhaseType)}
            options={[
              { label: t('calc.upstream_fault.singlePhase'), value: '1p' },
              { label: t('calc.upstream_fault.threePhase'),  value: '3p' },
            ]}
          />
        </FieldRow>

        <div className="mt-4 space-y-2">
          <ResultBig
            label={t('calc.upstream_fault.isc')}
            value={`${fmt(iscKa, 2)} kA`}
            tone={iscKa >= 10 ? 'danger' : 'warning'}
          />
          <ResultRow label={t('calc.upstream_fault.iscA')} value={`${fmt(isc, 0)} A`} />
          <ResultRow label={t('calc.upstream_fault.breakingRequired')} value={`≥ ${breakingRequired} kA`} />
        </div>

        <p className="text-xs text-zinc-500 dark:text-zinc-400">{description}</p>
      </div>
    </CalcCard>
  )
}
