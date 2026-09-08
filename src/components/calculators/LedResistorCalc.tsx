'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CalcCard, CalcHeader, Field, FieldRow, ResultBig, ResultRow, SelectField, fmt } from './shared'

type LedColor = 'red' | 'yellow' | 'green' | 'blue' | 'white' | 'custom'
type Connection = 'single' | 'series' | 'parallel'

const LED_VF: Record<Exclude<LedColor, 'custom'>, number> = {
  red: 2.0, yellow: 2.1, green: 2.2, blue: 3.2, white: 3.3,
}

const E12 = [1.0, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 3.9, 4.7, 5.6, 6.8, 8.2]

function nearestE12(target: number): number[] {
  if (target <= 0) return []
  let mag = 1, n = target
  while (n >= 10) { n /= 10; mag *= 10 }
  while (n < 1)  { n *= 10; mag /= 10 }
  return E12
    .map((v) => v * mag)
    .filter((v) => v >= target * 0.9 && v <= target * 1.3)
    .slice(0, 3)
}

const NEAREST_W = [0.125, 0.25, 0.5, 1, 2, 5]

export function LedResistorCalc() {
  const { t } = useTranslation()
  const [connection, setConnection] = useState<Connection>('single')
  const [color, setColor] = useState<LedColor>('red')
  const [vs, setVs] = useState('12')
  const [vf, setVf] = useState('2.0')
  const [ma, setMa] = useState('20')
  const [count, setCount] = useState('1')

  const Vs = parseFloat(vs) || 0
  const Vf = parseFloat(vf) || 0
  const If = (parseFloat(ma) || 0) / 1000
  const n = Math.max(1, parseFloat(count) || 1)

  const R = (() => {
    if (Vs <= 0 || If <= 0) return 0
    if (connection === 'series') {
      const total = Vf * n
      return Vs > total ? (Vs - total) / If : 0
    }
    if (connection === 'parallel') {
      return Vs > Vf ? (Vs - Vf) / (If * n) : 0
    }
    return Vs > Vf ? (Vs - Vf) / If : 0
  })()

  const P = (() => {
    if (R <= 0) return 0
    if (connection === 'parallel') return (If * n) ** 2 * R
    return If * If * R
  })()

  const recW = NEAREST_W.find((w) => w >= P * 2) ?? NEAREST_W.at(-1)!
  const eSeries = nearestE12(R)

  function handleColor(c: LedColor) {
    setColor(c)
    if (c !== 'custom') setVf(LED_VF[c].toString())
  }

  const error = Vs > 0 && Vf > 0 && Vs <= Vf * (connection === 'series' ? n : 1)

  return (
    <CalcCard>
      <CalcHeader title={t('calc.led.title')} description={t('calc.led.description')} />
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {t('calc.led.connection')}
          </label>
          <div className="grid grid-cols-3 gap-1 rounded-lg border border-zinc-200 p-1 dark:border-zinc-700">
            {(['single', 'series', 'parallel'] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setConnection(c)}
                className={`min-h-[36px] rounded-md px-2 py-1.5 text-xs font-medium transition-colors touch-manipulation ${
                  connection === c
                    ? 'bg-zinc-900 text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-900'
                    : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                }`}
              >
                {t(`calc.led.${c}`)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {t('calc.led.color')}
          </label>
          <div className="flex flex-wrap gap-2">
            {(['red', 'yellow', 'green', 'blue', 'white', 'custom'] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => handleColor(c)}
                aria-label={c}
                title={c}
                className={`h-9 w-9 rounded-full border-[2.5px] transition-all ${
                  color === c ? 'border-zinc-900 dark:border-zinc-100 scale-110' : 'border-zinc-300 dark:border-zinc-600 hover:border-zinc-500'
                }`}
                style={{
                  background:
                    c === 'red' ? '#ef4444' :
                    c === 'yellow' ? '#facc15' :
                    c === 'green' ? '#22c55e' :
                    c === 'blue' ? '#3b82f6' :
                    c === 'white' ? '#f8fafc' :
                    'repeating-linear-gradient(45deg, #e4e4e7, #e4e4e7 3px, #d4d4d8 3px, #d4d4d8 6px)',
                }}
              />
            ))}
          </div>
        </div>

        <FieldRow>
          <Field id="led-vs" label={t('calc.led.sourceVoltage')} value={vs} onChange={setVs} unit="V" step={0.1} min={0} />
          <Field id="led-vf" label={t('calc.led.forwardVoltage')} value={vf} onChange={setVf} unit="V" step={0.1} min={0} />
          <Field id="led-if" label={t('calc.led.forwardCurrent')} value={ma} onChange={setMa} unit="mA" min={1} />
          {connection !== 'single' && (
            <Field id="led-n" label={t('calc.led.count')} value={count} onChange={setCount} min={1} step={1} />
          )}
        </FieldRow>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
            {t('calc.led.errorLowVoltage')}
          </div>
        ) : (
          <ResultBig
            label={t('calc.led.requiredResistor')}
            value={R < 1000 ? fmt(R, 1) : fmt(R / 1000, 2)}
            unit={R < 1000 ? 'Ω' : 'kΩ'}
          />
        )}

        <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900">
          <ResultRow
            label={t('calc.led.powerDissipated')}
            value={P < 1 ? fmt(P * 1000, 0) : fmt(P, 2)}
            unit={P < 1 ? 'mW' : 'W'}
            tone={P > 0.5 ? 'warning' : 'default'}
          />
          <ResultRow
            label={t('calc.led.recommendedWattage')}
            value={recW < 1 ? String(recW * 1000) : String(recW)}
            unit={recW < 1 ? 'mW' : 'W'}
            tone="success"
          />
        </div>

        {eSeries.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-500">
              {t('calc.led.e12nearest')}
            </p>
            <ul className="grid grid-cols-3 gap-2">
              {eSeries.map((v, i) => (
                <li
                  key={i}
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-center dark:border-zinc-700 dark:bg-zinc-800"
                >
                  <span className="block font-mono font-bold text-zinc-900 dark:text-zinc-100">
                    {v < 1000 ? `${fmt(v, 1)} Ω` : `${fmt(v / 1000, 2)} kΩ`}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </CalcCard>
  )
}
