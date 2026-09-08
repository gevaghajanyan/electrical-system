'use client'

import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CalcCard, CalcHeader, Field, FieldRow, ResultBig, ResultRow, SelectField, fmt } from './shared'

type Material = 'copper' | 'aluminium'
type PhaseType = '1p' | '3p'
type InstallMethod = 'enclosed' | 'open'
type Mode = 'current' | 'voltage_drop'

// Standard IEC cross-sections (mm²)
const SIZES = [1, 1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300]

// Simplified ampacity (A/mm²) — a coarse guide; real value depends on
// installation method, ambient temperature, grouping etc.
const AMPACITY: Record<Material, number> = { copper: 5.5, aluminium: 4.3 }
// Resistivity at 70 °C (Ω·mm²/m)
const RHO_70: Record<Material, number> = { copper: 0.0224, aluminium: 0.036 }

function capacityFor(size: number, m: Material, method: InstallMethod): number {
  const methodFactor = method === 'open' ? 1.15 : 1.0
  return size * AMPACITY[m] * methodFactor
}

/**
 * Cable size selector — picks the smallest standard cross-section that
 * satisfies EITHER the ampacity or the voltage-drop constraint.
 */
export function CableSizeCalc() {
  const { t } = useTranslation()
  const [mode, setMode] = useState<Mode>('current')
  const [current, setCurrent] = useState('16')
  const [derating, setDerating] = useState('1.0')
  const [voltage, setVoltage] = useState('230')
  const [length, setLength] = useState('20')
  const [maxDropPct, setMaxDropPct] = useState('3')
  const [phase, setPhase] = useState<PhaseType>('1p')
  const [material, setMaterial] = useState<Material>('copper')
  const [method, setMethod] = useState<InstallMethod>('enclosed')

  const I = parseFloat(current) || 0
  const derate = Math.max(0.1, Math.min(1, parseFloat(derating) || 1))
  const V = parseFloat(voltage) || 230
  const L = parseFloat(length) || 0
  const maxDropV = V * (parseFloat(maxDropPct) || 3) / 100
  const factor = phase === '1p' ? 2 : Math.sqrt(3)

  const { recommended, byCapacity, byDrop, actualDrop, actualCapacity } = useMemo(() => {
    const effI = I / derate
    // ampacity pick
    const cap = SIZES.find((s) => capacityFor(s, material, method) >= effI) ?? SIZES.at(-1)!
    // voltage-drop pick — smallest size with drop ≤ target
    const drop = SIZES.find((s) => {
      if (L === 0 || I === 0) return true
      const R = RHO_70[material] * L / s
      return factor * I * R <= maxDropV
    }) ?? SIZES.at(-1)!
    const recommended = mode === 'current' ? cap : Math.max(cap, drop)
    const actualCapacity = capacityFor(recommended, material, method)
    const R = RHO_70[material] * L / recommended
    const actualDrop = factor * I * R
    return { recommended, byCapacity: cap, byDrop: drop, actualDrop, actualCapacity }
  }, [I, derate, V, L, maxDropV, factor, material, method, mode])

  return (
    <CalcCard>
      <CalcHeader title={t('calc.cable_size.title')} description={t('calc.cable_size.description')} />
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-1 rounded-lg border border-zinc-200 p-1 dark:border-zinc-700">
          {(['current', 'voltage_drop'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`min-h-[36px] rounded-md px-2 py-1.5 text-xs font-medium transition-colors touch-manipulation ${
                mode === m
                  ? 'bg-zinc-900 text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-900'
                  : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
              }`}
            >
              {t(`calc.cable_size.mode.${m}`)}
            </button>
          ))}
        </div>

        <FieldRow>
          <Field id="cs-i" label={t('calc.cable_size.designCurrent')} value={current} onChange={setCurrent} unit="A" min={0} step={0.1} />
          <Field id="cs-derate" label={t('calc.cable_size.derating')} value={derating} onChange={setDerating} step={0.05} min={0.1} max={1} hint={t('calc.cable_size.deratingHint')} />
          {mode === 'voltage_drop' && (
            <>
              <Field id="cs-v" label={t('calc.cable_size.voltage')} value={voltage} onChange={setVoltage} unit="V" min={0} />
              <Field id="cs-l" label={t('calc.cable_size.length')} value={length} onChange={setLength} unit="m" min={0} />
              <Field id="cs-drop" label={t('calc.cable_size.maxDrop')} value={maxDropPct} onChange={setMaxDropPct} unit="%" step={0.1} min={0.1} max={10} />
            </>
          )}
        </FieldRow>

        <FieldRow>
          <SelectField
            id="cs-phase"
            label={t('calc.cable_size.phase')}
            value={phase}
            onChange={(v) => setPhase(v as PhaseType)}
            options={[
              { value: '1p', label: t('calc.cable_size.singlePhase') },
              { value: '3p', label: t('calc.cable_size.threePhase') },
            ]}
          />
          <SelectField
            id="cs-mat"
            label={t('calc.cable_size.material')}
            value={material}
            onChange={(v) => setMaterial(v as Material)}
            options={[
              { value: 'copper', label: t('calc.cable_size.copper') },
              { value: 'aluminium', label: t('calc.cable_size.aluminium') },
            ]}
          />
          <SelectField
            id="cs-method"
            label={t('calc.cable_size.installMethod')}
            value={method}
            onChange={(v) => setMethod(v as InstallMethod)}
            options={[
              { value: 'enclosed', label: t('calc.cable_size.enclosed') },
              { value: 'open', label: t('calc.cable_size.open') },
            ]}
          />
        </FieldRow>

        <ResultBig
          label={t('calc.cable_size.recommended')}
          value={String(recommended)}
          unit="mm²"
          tone="success"
        />

        <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900">
          <ResultRow label={t('calc.cable_size.byCapacity')} value={`${byCapacity} mm²`} />
          {mode === 'voltage_drop' && (
            <ResultRow label={t('calc.cable_size.byDrop')} value={`${byDrop} mm²`} />
          )}
          <ResultRow label={t('calc.cable_size.chosenCapacity')} value={fmt(actualCapacity, 1)} unit="A" />
          {mode === 'voltage_drop' && (
            <ResultRow
              label={t('calc.cable_size.chosenDrop')}
              value={`${fmt(actualDrop, 2)} V (${fmt((actualDrop / V) * 100, 2)}%)`}
              tone={actualDrop <= maxDropV ? 'success' : 'danger'}
            />
          )}
        </div>
      </div>
    </CalcCard>
  )
}
