'use client'

import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CalcCard, CalcHeader, Field, FieldRow, Formula, ResultBig, ResultRow, SelectField, fmt } from './shared'

// AWG → mm² lookup (rounded to standard IEC values).
// Only the common range 40-4/0 shown. Precise formula also provided below.
const AWG_TO_MM2: Record<number, number> = {
  0: 53.5, 1: 42.4, 2: 33.6, 3: 26.7, 4: 21.2, 5: 16.8, 6: 13.3,
  7: 10.5, 8: 8.37, 9: 6.63, 10: 5.26, 11: 4.17, 12: 3.31, 13: 2.62,
  14: 2.08, 15: 1.65, 16: 1.31, 17: 1.04, 18: 0.823, 19: 0.653,
  20: 0.519, 21: 0.412, 22: 0.326, 23: 0.259, 24: 0.205, 25: 0.162,
  26: 0.129, 27: 0.102, 28: 0.0810, 29: 0.0642, 30: 0.0509,
}

/** Diameter (mm) for a given AWG number: d = 0.127 × 92^((36-n)/39). */
function awgDiameterMm(n: number): number {
  return 0.127 * Math.pow(92, (36 - n) / 39)
}

function awgAreaMm2(n: number): number {
  const d = awgDiameterMm(n)
  return (Math.PI / 4) * d * d
}

function nearestAwgForMm2(area: number): number {
  let best = 0
  let bestDiff = Infinity
  for (let n = -3; n <= 40; n++) {
    const a = awgAreaMm2(n)
    const diff = Math.abs(a - area)
    if (diff < bestDiff) { bestDiff = diff; best = n }
  }
  return best
}

type Direction = 'awg_to_mm2' | 'mm2_to_awg'

export function AwgWireCalc() {
  const { t } = useTranslation()
  const [direction, setDirection] = useState<Direction>('awg_to_mm2')
  const [awg, setAwg] = useState('12')
  const [mm2, setMm2] = useState('2.5')

  const { area, diameter, awgOut } = useMemo(() => {
    if (direction === 'awg_to_mm2') {
      const n = parseFloat(awg)
      if (!isFinite(n)) return { area: 0, diameter: 0, awgOut: 0 }
      return { area: AWG_TO_MM2[n] ?? awgAreaMm2(n), diameter: awgDiameterMm(n), awgOut: n }
    }
    const a = parseFloat(mm2)
    if (!isFinite(a) || a <= 0) return { area: 0, diameter: 0, awgOut: 0 }
    const n = nearestAwgForMm2(a)
    return { area: a, diameter: 2 * Math.sqrt(a / Math.PI), awgOut: n }
  }, [direction, awg, mm2])

  return (
    <CalcCard>
      <CalcHeader title={t('calc.awg.title')} description={t('calc.awg.description')} />
      <div className="space-y-4">
        <SelectField
          id="awg-dir"
          label={t('calc.awg.direction')}
          value={direction}
          onChange={(v) => setDirection(v as Direction)}
          options={[
            { value: 'awg_to_mm2', label: 'AWG → mm²' },
            { value: 'mm2_to_awg', label: 'mm² → AWG' },
          ]}
        />
        <FieldRow>
          {direction === 'awg_to_mm2' ? (
            <Field id="awg-in" label="AWG" value={awg} onChange={setAwg} min={-3} max={40} step={1} />
          ) : (
            <Field id="mm2-in" label="mm²" value={mm2} onChange={setMm2} step={0.1} min={0.01} />
          )}
        </FieldRow>

        {direction === 'awg_to_mm2' ? (
          <ResultBig label={t('calc.awg.crossSection')} value={fmt(area, 3)} unit="mm²" />
        ) : (
          <ResultBig label={t('calc.awg.nearestAwg')} value={String(awgOut)} unit="AWG" />
        )}

        <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900">
          <ResultRow label={t('calc.awg.diameter')} value={fmt(diameter, 3)} unit="mm" />
          <ResultRow label={t('calc.awg.crossSection')} value={fmt(area, 3)} unit="mm²" />
          <ResultRow label="AWG" value={String(awgOut)} />
        </div>

        <Formula>d = 0.127 × 92^((36-n)/39) mm</Formula>
      </div>
    </CalcCard>
  )
}
