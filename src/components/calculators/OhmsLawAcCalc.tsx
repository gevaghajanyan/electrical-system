'use client'

import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CalcCard, CalcHeader, Field, FieldRow, Formula, ResultBig, ResultRow, SelectField, fmt } from './shared'

type Solve = 'V' | 'I' | 'Z'

/**
 * AC Ohm's law + full power triangle.
 * Z = √(R² + X²)   φ = atan2(X, R)   PF = cos φ
 * P = V I cos φ    Q = V I sin φ    S = V I
 */
export function OhmsLawAcCalc() {
  const { t } = useTranslation()
  const [solveFor, setSolveFor] = useState<Solve>('V')
  const [V, setV] = useState('230')
  const [I, setI] = useState('10')
  const [R, setR] = useState('20')
  const [X, setX] = useState('10')
  const [pfIn, setPfIn] = useState('')

  const result = useMemo(() => {
    const v = parseFloat(V) || 0
    const i = parseFloat(I) || 0
    const r = parseFloat(R) || 0
    const x = parseFloat(X) || 0
    const pfRaw = parseFloat(pfIn)

    let Zc = 0
    let angleDeg = 0
    let pf = 0

    // Prefer R + X inputs; fall back to explicit PF only for impedance/power solves.
    if (r > 0 || x !== 0) {
      Zc = Math.hypot(r, x)
      angleDeg = (Math.atan2(x, r) * 180) / Math.PI
      pf = Math.cos((angleDeg * Math.PI) / 180)
    } else if (!isNaN(pfRaw) && pfRaw > 0 && pfRaw <= 1) {
      pf = pfRaw
      angleDeg = (Math.acos(pf) * 180) / Math.PI
    }

    let vOut = v, iOut = i, zOut = Zc
    switch (solveFor) {
      case 'V':
        if (i > 0 && Zc > 0) vOut = i * Zc
        break
      case 'I':
        if (v > 0 && Zc > 0) iOut = v / Zc
        break
      case 'Z':
        if (v > 0 && i > 0) {
          zOut = v / i
          if (!isNaN(pfRaw) && pfRaw > 0) {
            const a = (Math.acos(pfRaw) * 180) / Math.PI
            angleDeg = a
            pf = pfRaw
          }
        }
        break
    }

    const P = vOut * iOut * pf
    const S = vOut * iOut
    const Q = vOut * iOut * Math.sin((angleDeg * Math.PI) / 180)

    return { V: vOut, I: iOut, Z: zOut, angleDeg, pf, P, Q, S }
  }, [solveFor, V, I, R, X, pfIn])

  return (
    <CalcCard>
      <CalcHeader title={t('calc.ohms_ac.title')} description={t('calc.ohms_ac.description')} />
      <div className="space-y-4">
        <SelectField
          id="ac-solve"
          label={t('calc.ohms_ac.solveFor')}
          value={solveFor}
          onChange={(v) => setSolveFor(v as Solve)}
          options={[
            { value: 'V', label: t('calc.ohms_ac.voltage') },
            { value: 'I', label: t('calc.ohms_ac.current') },
            { value: 'Z', label: t('calc.ohms_ac.impedance') },
          ]}
        />

        <FieldRow>
          {solveFor !== 'V' && <Field id="ac-v" label={t('calc.ohms_ac.voltage')} value={V} onChange={setV} unit="V" />}
          {solveFor !== 'I' && <Field id="ac-i" label={t('calc.ohms_ac.current')} value={I} onChange={setI} unit="A" step={0.01} />}
          {solveFor !== 'Z' ? (
            <>
              <Field id="ac-r" label={t('calc.ohms_ac.resistance')} value={R} onChange={setR} unit="Ω" step={0.1} />
              <Field id="ac-x" label={t('calc.ohms_ac.reactance')} value={X} onChange={setX} unit="Ω" step={0.1} />
            </>
          ) : (
            <Field id="ac-pf" label={t('calc.ohms_ac.pfOptional')} value={pfIn} onChange={setPfIn} step={0.01} min={0} max={1} />
          )}
        </FieldRow>

        <ResultBig
          label={t(`calc.ohms_ac.${solveFor === 'V' ? 'voltage' : solveFor === 'I' ? 'current' : 'impedance'}`)}
          value={fmt(result[solveFor], 3)}
          unit={solveFor === 'V' ? 'V' : solveFor === 'I' ? 'A' : 'Ω'}
        />

        <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900">
          <ResultRow label={t('calc.ohms_ac.impedance')} value={fmt(result.Z, 3)} unit="Ω" />
          <ResultRow label={t('calc.ohms_ac.phaseAngle')} value={fmt(result.angleDeg, 2)} unit="°" />
          <ResultRow label={t('calc.ohms_ac.pf')} value={fmt(result.pf, 3)} />
        </div>

        <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900">
          <ResultRow label={t('calc.ohms_ac.realPower')}     value={fmt(result.P, 2)} unit="W"   tone="success" />
          <ResultRow label={t('calc.ohms_ac.reactivePower')} value={fmt(result.Q, 2)} unit="VAR" tone="warning" />
          <ResultRow label={t('calc.ohms_ac.apparentPower')} value={fmt(result.S, 2)} unit="VA" />
        </div>

        <div className="flex flex-wrap gap-2">
          <Formula>Z = √(R² + X²)</Formula>
          <Formula>P = V·I·cos φ</Formula>
          <Formula>Q = V·I·sin φ</Formula>
          <Formula>S = V·I</Formula>
        </div>
      </div>
    </CalcCard>
  )
}
