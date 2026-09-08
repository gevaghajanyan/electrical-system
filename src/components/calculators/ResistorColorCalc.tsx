'use client'

import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CalcCard, CalcHeader, ResultBig, ResultRow, fmt } from './shared'

interface ColorBand {
  key: string
  value: number | null       // significant digit (0-9)
  multiplier: number | null  // decade multiplier
  tolerance: number | null   // ±%
  tempCoeff: number | null   // ppm/°C
  hex: string
  labelKey: string           // i18n key relative to calc.color.colors.
}

const COLORS: ColorBand[] = [
  { key: 'black',  value: 0,    multiplier: 1,          tolerance: null, tempCoeff: 250, hex: '#000000', labelKey: 'black' },
  { key: 'brown',  value: 1,    multiplier: 10,         tolerance: 1,    tempCoeff: 100, hex: '#8B4513', labelKey: 'brown' },
  { key: 'red',    value: 2,    multiplier: 100,        tolerance: 2,    tempCoeff: 50,  hex: '#EF4444', labelKey: 'red' },
  { key: 'orange', value: 3,    multiplier: 1_000,      tolerance: null, tempCoeff: 15,  hex: '#F97316', labelKey: 'orange' },
  { key: 'yellow', value: 4,    multiplier: 10_000,     tolerance: null, tempCoeff: 25,  hex: '#FACC15', labelKey: 'yellow' },
  { key: 'green',  value: 5,    multiplier: 100_000,    tolerance: 0.5,  tempCoeff: null, hex: '#22C55E', labelKey: 'green' },
  { key: 'blue',   value: 6,    multiplier: 1_000_000,  tolerance: 0.25, tempCoeff: 10,  hex: '#3B82F6', labelKey: 'blue' },
  { key: 'violet', value: 7,    multiplier: 10_000_000, tolerance: 0.1,  tempCoeff: 5,   hex: '#8B5CF6', labelKey: 'violet' },
  { key: 'gray',   value: 8,    multiplier: 100_000_000,tolerance: 0.05, tempCoeff: null, hex: '#71717A', labelKey: 'gray' },
  { key: 'white',  value: 9,    multiplier: 1_000_000_000, tolerance: null, tempCoeff: null, hex: '#F4F4F5', labelKey: 'white' },
  { key: 'gold',   value: null, multiplier: 0.1,        tolerance: 5,    tempCoeff: null, hex: '#EAB308', labelKey: 'gold' },
  { key: 'silver', value: null, multiplier: 0.01,       tolerance: 10,   tempCoeff: null, hex: '#D4D4D8', labelKey: 'silver' },
]

const BY_KEY = Object.fromEntries(COLORS.map((c) => [c.key, c])) as Record<string, ColorBand>

type Bands = 3 | 4 | 5 | 6

function formatOhms(r: number): string {
  if (!isFinite(r) || r === 0) return '0 Ω'
  if (r >= 1_000_000) return `${fmt(r / 1_000_000, 3)} MΩ`
  if (r >= 1_000)     return `${fmt(r / 1_000, 3)} kΩ`
  return `${fmt(r, 3)} Ω`
}

/**
 * Resistor colour-code decoder — 3, 4, 5 or 6 band variants.
 * Layout of bands:
 *   3-band: digit, digit, multiplier                (tol ±20%)
 *   4-band: digit, digit, multiplier, tolerance
 *   5-band: digit, digit, digit, multiplier, tolerance
 *   6-band: digit, digit, digit, multiplier, tolerance, tempCoeff
 */
export function ResistorColorCalc() {
  const { t } = useTranslation()
  const [bands, setBands] = useState<Bands>(4)
  const [selected, setSelected] = useState<string[]>(['brown', 'black', 'red', 'gold'])

  const positions = useMemo<Array<'digit' | 'multiplier' | 'tolerance' | 'tempCoeff'>>(() => {
    if (bands === 3) return ['digit', 'digit', 'multiplier']
    if (bands === 4) return ['digit', 'digit', 'multiplier', 'tolerance']
    if (bands === 5) return ['digit', 'digit', 'digit', 'multiplier', 'tolerance']
    return ['digit', 'digit', 'digit', 'multiplier', 'tolerance', 'tempCoeff']
  }, [bands])

  function allowedFor(pos: 'digit' | 'multiplier' | 'tolerance' | 'tempCoeff'): ColorBand[] {
    switch (pos) {
      case 'digit':      return COLORS.filter((c) => c.value !== null)
      case 'multiplier': return COLORS.filter((c) => c.multiplier !== null)
      case 'tolerance':  return COLORS.filter((c) => c.tolerance !== null)
      case 'tempCoeff':  return COLORS.filter((c) => c.tempCoeff !== null)
    }
  }

  function changeBands(n: Bands) {
    setBands(n)
    setSelected((prev) => {
      const target = n === 3 ? 3 : n === 4 ? 4 : n === 5 ? 5 : 6
      const defaults = ['brown', 'black', 'black', 'red', 'gold', 'brown']
      const next = [...prev]
      while (next.length < target) next.push(defaults[next.length])
      while (next.length > target) next.pop()
      return next
    })
  }

  function setBand(idx: number, key: string) {
    setSelected((prev) => prev.map((k, i) => (i === idx ? key : k)))
  }

  const decoded = useMemo(() => {
    try {
      const digits = positions
        .map((p, i) => (p === 'digit' ? BY_KEY[selected[i]].value : null))
        .filter((v): v is number => v !== null)
      const mulIdx = positions.indexOf('multiplier')
      const tolIdx = positions.indexOf('tolerance')
      const tcIdx = positions.indexOf('tempCoeff')
      const multiplier = mulIdx >= 0 ? BY_KEY[selected[mulIdx]].multiplier ?? 1 : 1
      const tolerance = tolIdx >= 0 ? BY_KEY[selected[tolIdx]].tolerance : 20
      const tempCoeff = tcIdx >= 0 ? BY_KEY[selected[tcIdx]].tempCoeff : null
      const sigfig = digits.reduce((acc, d) => acc * 10 + d, 0)
      const value = sigfig * multiplier
      return { value, tolerance, tempCoeff }
    } catch {
      return { value: 0, tolerance: null, tempCoeff: null }
    }
  }, [positions, selected])

  const min = decoded.value * (1 - (decoded.tolerance ?? 20) / 100)
  const max = decoded.value * (1 + (decoded.tolerance ?? 20) / 100)

  return (
    <CalcCard>
      <CalcHeader title={t('calc.color.title')} description={t('calc.color.description')} />
      <div className="space-y-4">
        {/* Band count selector */}
        <div className="grid grid-cols-4 gap-1 rounded-lg border border-zinc-200 p-1 dark:border-zinc-700">
          {([3, 4, 5, 6] as const).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => changeBands(n)}
              className={`min-h-[36px] rounded-md px-2 py-1.5 text-xs font-semibold transition-colors touch-manipulation ${
                bands === n
                  ? 'bg-zinc-900 text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-900'
                  : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
              }`}
            >
              {t('calc.color.bands', { count: n })}
            </button>
          ))}
        </div>

        {/* Resistor illustration */}
        <div className="rounded-2xl bg-gradient-to-b from-zinc-100 to-zinc-200 p-6 dark:from-zinc-800 dark:to-zinc-900">
          <div className="mx-auto flex max-w-md items-center gap-1">
            <span className="h-1 flex-1 bg-zinc-500" aria-hidden />
            <div className="flex h-14 items-center rounded-lg bg-[#d4a574] px-3 shadow-inner">
              {positions.map((pos, i) => (
                <span
                  key={i}
                  className={`mx-0.5 h-full w-2.5 rounded-sm ${pos === 'tempCoeff' ? 'ml-2' : ''}`}
                  style={{
                    background: BY_KEY[selected[i]]?.hex ?? '#f4f4f5',
                    border: BY_KEY[selected[i]]?.key === 'white' ? '1px solid #a1a1aa' : 'none',
                  }}
                  title={t(`calc.color.colors.${BY_KEY[selected[i]]?.labelKey}`)}
                />
              ))}
            </div>
            <span className="h-1 flex-1 bg-zinc-500" aria-hidden />
          </div>
        </div>

        {/* Per-band picker */}
        <div className="space-y-2">
          {positions.map((pos, idx) => (
            <div key={idx}>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
                {t('calc.color.bandLabel', { i: idx + 1 })} · {t(`calc.color.pos.${pos}`)}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {allowedFor(pos).map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setBand(idx, c.key)}
                    className={`h-8 w-8 rounded-md border-2 transition-transform ${
                      selected[idx] === c.key ? 'scale-110 border-zinc-900 dark:border-zinc-50' : 'border-zinc-300 dark:border-zinc-600'
                    }`}
                    style={{ background: c.hex }}
                    aria-label={t(`calc.color.colors.${c.labelKey}`)}
                    title={t(`calc.color.colors.${c.labelKey}`)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <ResultBig
          label={t('calc.color.value')}
          value={formatOhms(decoded.value)}
          unit={decoded.tolerance !== null ? `±${decoded.tolerance}%` : ''}
        />

        <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900">
          <ResultRow label={t('calc.color.min')} value={formatOhms(min)} />
          <ResultRow label={t('calc.color.max')} value={formatOhms(max)} />
          {decoded.tempCoeff !== null && (
            <ResultRow label={t('calc.color.tempCoeff')} value={`${decoded.tempCoeff} ppm/°C`} />
          )}
        </div>
      </div>
    </CalcCard>
  )
}
