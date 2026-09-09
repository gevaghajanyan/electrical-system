'use client'

import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CalcCard, CalcHeader, Field, FieldRow, ResultBig, ResultRow, SelectField, fmt } from './shared'

/**
 * Earth-rod (ground rod) resistance — Dwight formula for a single vertical rod:
 *
 *   R = (ρ / (2πL)) · [ ln(4L/d) - 1 ]
 *
 * where ρ is soil resistivity (Ω·m), L is rod length (m), d is rod diameter (m).
 * For N parallel rods spaced ≥ 2L apart, R_total ≈ R / N (with mutual coupling
 * making it slightly higher in reality — we apply a 1.05× penalty per extra rod).
 */
const SOIL_PRESETS: Record<string, number> = {
  wet_organic:   30,
  moist_loam:    60,
  wet_sandy:     100,
  dry_loam:      150,
  clay:          200,
  dry_sandy:     500,
  stony:         800,
  gravel:        1500,
  bedrock:       3000,
}

export function EarthRodCalc() {
  const { t } = useTranslation()
  const [soilKey, setSoilKey] = useState<string>('moist_loam')
  const [rho, setRho] = useState('60')
  const [length, setLength] = useState('2.4')
  const [diameter, setDiameter] = useState('16')
  const [rods, setRods] = useState('1')

  const { R, Rtotal, targetOk, target } = useMemo(() => {
    const rhoV = parseFloat(rho) || 100
    const L = parseFloat(length) || 1
    const dMm = parseFloat(diameter) || 16
    const d = dMm / 1000 // → metres
    const N = Math.max(1, Math.min(20, parseInt(rods) || 1))
    // Dwight formula
    const R = (rhoV / (2 * Math.PI * L)) * (Math.log(4 * L / d) - 1)
    // Rough N-rod coupling penalty
    const couplingFactor = 1 + (N - 1) * 0.05
    const Rtotal = (R / N) * couplingFactor
    // IEC 60364 typical target for TT installations: 100 Ω / Ia,
    // simplified here to a conservative < 10 Ω for domestic RCD.
    const target = 10
    const targetOk = Rtotal <= target
    return { R, Rtotal, targetOk, target }
  }, [rho, length, diameter, rods])

  function applyPreset(k: string) {
    setSoilKey(k)
    if (SOIL_PRESETS[k] !== undefined) setRho(String(SOIL_PRESETS[k]))
  }

  return (
    <CalcCard>
      <CalcHeader title={t('calc.earth_rod.title')} description={t('calc.earth_rod.description')} />
      <div className="space-y-4">
        <SelectField
          id="soil"
          label={t('calc.earth_rod.soil')}
          value={soilKey}
          onChange={applyPreset}
          options={Object.keys(SOIL_PRESETS).map((k) => ({
            label: t(`calc.earth_rod.soils.${k}`),
            value: k,
          }))}
        />
        <FieldRow>
          <Field id="rho" label={t('calc.earth_rod.rho')} value={rho} onChange={setRho} unit="Ω·m" min={5} step={5} />
          <Field id="rods" label={t('calc.earth_rod.rods')} value={rods} onChange={setRods} min={1} max={20} step={1} />
        </FieldRow>
        <FieldRow>
          <Field id="length" label={t('calc.earth_rod.length')} value={length} onChange={setLength} unit="m" min={0.5} step={0.1} />
          <Field id="diameter" label={t('calc.earth_rod.diameter')} value={diameter} onChange={setDiameter} unit="mm" min={8} step={1} />
        </FieldRow>

        <div className="mt-4 space-y-2">
          <ResultBig
            label={t('calc.earth_rod.rTotal')}
            value={`${fmt(Rtotal, 1)} Ω`}
            tone={targetOk ? 'success' : 'danger'}
          />
          <ResultRow label={t('calc.earth_rod.rSingle')} value={`${fmt(R, 1)} Ω`} />
          <ResultRow label={t('calc.earth_rod.target')} value={`≤ ${target} Ω`} />
        </div>

        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {t('calc.earth_rod.notes')}
        </p>
      </div>
    </CalcCard>
  )
}
