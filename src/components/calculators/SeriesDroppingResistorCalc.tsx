'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CalcCard, CalcHeader, Field, FieldRow, Formula, ResultBig, ResultRow, SelectField, fmt } from './shared'

type Mode = 'current' | 'load_r'

/**
 * Series dropping resistor for a lower-voltage load.
 *  Vd = Vin − Vout
 *  Rs = Vd / I         (current-known mode)
 *  Rs = Rload × (Vin/Vout − 1)   (load-R mode)
 *  P  = Vd × I
 */
export function SeriesDroppingResistorCalc() {
  const { t } = useTranslation()
  const [mode, setMode] = useState<Mode>('current')
  const [vin, setVin] = useState('12')
  const [vout, setVout] = useState('5')
  const [current, setCurrent] = useState('20')     // mA
  const [rLoad, setRLoad] = useState('250')        // Ω

  const Vin = parseFloat(vin) || 0
  const Vout = parseFloat(vout) || 0
  const Imilli = parseFloat(current) || 0
  const I = Imilli / 1000
  const Rload = parseFloat(rLoad) || 0

  const err = Vin > 0 && Vout > 0 && Vin <= Vout
  const Rs = (() => {
    if (err) return 0
    if (mode === 'current') return I > 0 ? (Vin - Vout) / I : 0
    return Rload > 0 && Vout > 0 ? Rload * (Vin / Vout - 1) : 0
  })()
  const Icalc = mode === 'load_r' && Rload > 0 ? Vout / Rload : I
  const Pres = (Vin - Vout) * Icalc

  return (
    <CalcCard>
      <CalcHeader title={t('calc.dropping.title')} description={t('calc.dropping.description')} />
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-1 rounded-lg border border-zinc-200 p-1 dark:border-zinc-700">
          {(['current', 'load_r'] as const).map((m) => (
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
              {t(`calc.dropping.mode.${m}`)}
            </button>
          ))}
        </div>

        <FieldRow>
          <Field id="dr-vin" label={t('calc.dropping.vin')} value={vin} onChange={setVin} unit="V" step={0.1} />
          <Field id="dr-vout" label={t('calc.dropping.vout')} value={vout} onChange={setVout} unit="V" step={0.1} />
          {mode === 'current' ? (
            <Field id="dr-i" label={t('calc.dropping.loadCurrent')} value={current} onChange={setCurrent} unit="mA" min={0.01} step={0.1} />
          ) : (
            <Field id="dr-r" label={t('calc.dropping.loadR')} value={rLoad} onChange={setRLoad} unit="Ω" min={0.01} step={1} />
          )}
        </FieldRow>

        {err ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
            {t('calc.dropping.errorVin')}
          </div>
        ) : (
          <ResultBig
            label={t('calc.dropping.seriesResistance')}
            value={Rs < 1000 ? fmt(Rs, 2) : fmt(Rs / 1000, 3)}
            unit={Rs < 1000 ? 'Ω' : 'kΩ'}
          />
        )}

        <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900">
          <ResultRow label={t('calc.dropping.dropVoltage')} value={fmt(Vin - Vout, 2)} unit="V" />
          <ResultRow label={t('calc.dropping.current')} value={fmt(Icalc * 1000, 2)} unit="mA" />
          <ResultRow label={t('calc.dropping.powerDissipated')} value={Pres < 1 ? fmt(Pres * 1000, 1) : fmt(Pres, 2)} unit={Pres < 1 ? 'mW' : 'W'} tone={Pres > 0.5 ? 'warning' : 'default'} />
        </div>

        <Formula>Rs = (Vin − Vout) / I   ·   P = (Vin − Vout) × I</Formula>
      </div>
    </CalcCard>
  )
}
