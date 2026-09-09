'use client'

import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CalcCard, CalcHeader, Field, FieldRow, ResultBig, ResultRow, SelectField, fmt } from './shared'

type Phase = '1p' | '3p'
type Mount = 'enclosed' | 'open'

const CSA = [1.5, 2.5, 4, 6, 10, 16, 25]
const AMPACITY: Record<Mount, Record<number, number>> = {
  enclosed: { 1.5: 15, 2.5: 20, 4: 27, 6: 36, 10: 50, 16: 68, 25: 89 },
  open:     { 1.5: 20, 2.5: 27, 4: 37, 6: 47, 10: 65, 16: 87, 25: 115 },
}

export function EvCableCalc() {
  const { t } = useTranslation()
  const [amps, setAmps] = useState('32')
  const [phase, setPhase] = useState<Phase>('3p')
  const [mount, setMount] = useState<Mount>('enclosed')
  const [length, setLength] = useState('30')

  const { csa, mcb, powerKw, drop, rcdType } = useMemo(() => {
    const A = parseFloat(amps) || 0
    const L = parseFloat(length) || 0
    // Cable — smallest CSA whose ampacity >= 1.25×A (EV continuous load rule)
    const need = A * 1.25
    const csa = CSA.find((c) => AMPACITY[mount][c] >= need) ?? CSA.at(-1)!
    // MCB — next standard size ≥ A
    const std = [10, 13, 16, 20, 25, 32, 40, 50, 63]
    const mcb = std.find((r) => r >= A) ?? std.at(-1)!
    // Power
    const V = phase === '3p' ? 400 : 230
    const factor = phase === '3p' ? Math.sqrt(3) : 1
    const powerKw = (factor * V * A) / 1000
    // Voltage drop % at that CSA (Cu resistivity 0.0224 Ω·mm²/m)
    const R = 0.0224 * L / csa
    const dropV = factor * A * R * (phase === '1p' ? 2 : 1)
    const drop = (dropV / V) * 100
    return { csa, mcb, powerKw, drop, rcdType: 'Type B (mandatory for EV, DC-fault-capable)' }
  }, [amps, phase, mount, length])

  return (
    <CalcCard>
      <CalcHeader title={t('calc.ev_cable.title')} description={t('calc.ev_cable.description')} />
      <div className="space-y-4">
        <FieldRow>
          <Field id="ev-a" label={t('calc.ev_cable.amps')} value={amps} onChange={setAmps} unit="A" min={6} max={63} step={1} />
          <SelectField id="ev-phase" label={t('calc.ev_cable.phase')} value={phase} onChange={(v) => setPhase(v as Phase)}
            options={[
              { label: t('calc.ev_cable.singlePhase'), value: '1p' },
              { label: t('calc.ev_cable.threePhase'),  value: '3p' },
            ]}
          />
        </FieldRow>
        <FieldRow>
          <Field id="ev-l" label={t('calc.ev_cable.length')} value={length} onChange={setLength} unit="m" min={1} step={1} />
          <SelectField id="ev-mount" label={t('calc.ev_cable.mount')} value={mount} onChange={(v) => setMount(v as Mount)}
            options={[
              { label: t('calc.ev_cable.enclosed'), value: 'enclosed' },
              { label: t('calc.ev_cable.open'),     value: 'open' },
            ]}
          />
        </FieldRow>

        <div className="mt-4 space-y-2">
          <ResultBig label={t('calc.ev_cable.csa')} value={`${csa} mm²`} tone="brand" />
          <ResultRow label={t('calc.ev_cable.mcb')} value={`${mcb} A`} />
          <ResultRow label={t('calc.ev_cable.power')} value={`${fmt(powerKw, 2)} kW`} />
          <ResultRow label={t('calc.ev_cable.drop')} value={`${fmt(drop, 1)} %`} tone={drop > 3 ? 'warning' : 'default'} />
          <ResultRow label={t('calc.ev_cable.rcd')} value={rcdType} />
        </div>

        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
          {t('calc.ev_cable.notes')}
        </p>
      </div>
    </CalcCard>
  )
}
