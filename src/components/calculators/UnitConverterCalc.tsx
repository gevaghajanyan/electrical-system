'use client'

import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CalcCard, CalcHeader, SelectField, fmt } from './shared'

interface Unit { label: string; toBase: (n: number) => number; fromBase: (n: number) => number }
type Category = 'current' | 'voltage' | 'resistance' | 'power' | 'energy' | 'length' | 'temperature'

const CATEGORIES: Record<Category, Record<string, Unit>> = {
  current: {
    A:  { label: 'A',  toBase: (v) => v,           fromBase: (v) => v },
    mA: { label: 'mA', toBase: (v) => v / 1000,    fromBase: (v) => v * 1000 },
    µA: { label: 'µA', toBase: (v) => v / 1e6,     fromBase: (v) => v * 1e6 },
    kA: { label: 'kA', toBase: (v) => v * 1000,    fromBase: (v) => v / 1000 },
  },
  voltage: {
    V:  { label: 'V',  toBase: (v) => v,           fromBase: (v) => v },
    mV: { label: 'mV', toBase: (v) => v / 1000,    fromBase: (v) => v * 1000 },
    µV: { label: 'µV', toBase: (v) => v / 1e6,     fromBase: (v) => v * 1e6 },
    kV: { label: 'kV', toBase: (v) => v * 1000,    fromBase: (v) => v / 1000 },
    MV: { label: 'MV', toBase: (v) => v * 1e6,     fromBase: (v) => v / 1e6 },
  },
  resistance: {
    Ω:  { label: 'Ω',  toBase: (v) => v,           fromBase: (v) => v },
    mΩ: { label: 'mΩ', toBase: (v) => v / 1000,    fromBase: (v) => v * 1000 },
    kΩ: { label: 'kΩ', toBase: (v) => v * 1000,    fromBase: (v) => v / 1000 },
    MΩ: { label: 'MΩ', toBase: (v) => v * 1e6,     fromBase: (v) => v / 1e6 },
  },
  power: {
    W:   { label: 'W',   toBase: (v) => v,         fromBase: (v) => v },
    kW:  { label: 'kW',  toBase: (v) => v * 1000,  fromBase: (v) => v / 1000 },
    MW:  { label: 'MW',  toBase: (v) => v * 1e6,   fromBase: (v) => v / 1e6 },
    mW:  { label: 'mW',  toBase: (v) => v / 1000,  fromBase: (v) => v * 1000 },
    hp:  { label: 'hp',  toBase: (v) => v * 745.699872, fromBase: (v) => v / 745.699872 },
  },
  energy: {
    J:    { label: 'J',    toBase: (v) => v,             fromBase: (v) => v },
    kJ:   { label: 'kJ',   toBase: (v) => v * 1000,      fromBase: (v) => v / 1000 },
    Wh:   { label: 'Wh',   toBase: (v) => v * 3600,      fromBase: (v) => v / 3600 },
    kWh:  { label: 'kWh',  toBase: (v) => v * 3_600_000, fromBase: (v) => v / 3_600_000 },
    cal:  { label: 'cal',  toBase: (v) => v * 4.184,     fromBase: (v) => v / 4.184 },
    kcal: { label: 'kcal', toBase: (v) => v * 4184,      fromBase: (v) => v / 4184 },
  },
  length: {
    m:  { label: 'm',  toBase: (v) => v,         fromBase: (v) => v },
    mm: { label: 'mm', toBase: (v) => v / 1000,  fromBase: (v) => v * 1000 },
    cm: { label: 'cm', toBase: (v) => v / 100,   fromBase: (v) => v * 100 },
    km: { label: 'km', toBase: (v) => v * 1000,  fromBase: (v) => v / 1000 },
    in: { label: 'in', toBase: (v) => v * 0.0254, fromBase: (v) => v / 0.0254 },
    ft: { label: 'ft', toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
  },
  temperature: {
    C: { label: '°C', toBase: (v) => v + 273.15,               fromBase: (v) => v - 273.15 },
    F: { label: '°F', toBase: (v) => ((v - 32) * 5) / 9 + 273.15, fromBase: (v) => ((v - 273.15) * 9) / 5 + 32 },
    K: { label: 'K',  toBase: (v) => v,                        fromBase: (v) => v },
  },
}

export function UnitConverterCalc() {
  const { t } = useTranslation()
  const [category, setCategory] = useState<Category>('current')
  const [fromUnit, setFromUnit] = useState('A')
  const [toUnit, setToUnit] = useState('mA')
  const [value, setValue] = useState('1')

  const units = CATEGORIES[category]
  const unitKeys = Object.keys(units)

  // Reset units when category changes
  useMemo(() => {
    if (!unitKeys.includes(fromUnit)) setFromUnit(unitKeys[0])
    if (!unitKeys.includes(toUnit)) setToUnit(unitKeys[1] ?? unitKeys[0])
  }, [category, unitKeys, fromUnit, toUnit])

  const result = (() => {
    const n = parseFloat(value)
    if (!isFinite(n)) return null
    const from = units[fromUnit]
    const to = units[toUnit]
    if (!from || !to) return null
    return to.fromBase(from.toBase(n))
  })()

  return (
    <CalcCard>
      <CalcHeader title={t('calc.units.title')} description={t('calc.units.description')} />
      <div className="space-y-4">
        <SelectField
          id="uc-cat"
          label={t('calc.units.category')}
          value={category}
          onChange={(v) => setCategory(v as Category)}
          options={(['current', 'voltage', 'resistance', 'power', 'energy', 'length', 'temperature'] as Category[]).map((c) => ({
            value: c,
            label: t(`calc.units.categories.${c}`),
          }))}
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {t('calc.units.from')}
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                step="any"
                className="flex-1 h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm font-mono tabular-nums dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <select
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value)}
                className="h-10 min-w-[70px] rounded-md border border-zinc-300 bg-white px-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              >
                {unitKeys.map((u) => <option key={u} value={u}>{units[u].label}</option>)}
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={() => { const t = fromUnit; setFromUnit(toUnit); setToUnit(t) }}
            className="mx-auto self-center rounded-full border border-zinc-200 bg-white p-2 text-zinc-500 hover:bg-blue-50 hover:text-blue-600 dark:border-zinc-700 dark:bg-zinc-800"
            aria-label="swap units"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4M16 17H4m0 0l4-4m-4 4l4 4" />
            </svg>
          </button>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {t('calc.units.to')}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={result === null ? '—' : fmt(result, 6)}
                className="flex-1 h-10 rounded-md border border-zinc-200 bg-zinc-50 px-3 text-sm font-mono tabular-nums text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
              <select
                value={toUnit}
                onChange={(e) => setToUnit(e.target.value)}
                className="h-10 min-w-[70px] rounded-md border border-zinc-300 bg-white px-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              >
                {unitKeys.map((u) => <option key={u} value={u}>{units[u].label}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>
    </CalcCard>
  )
}
