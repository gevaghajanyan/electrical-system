'use client'

import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CalcCard, CalcHeader, Formula, ResultBig, ResultRow, SelectField, fmt } from './shared'

type Mode = 'd3' | 'd4' | 'eia96'

function formatOhms(v: number): string {
  if (!isFinite(v) || v <= 0) return '—'
  if (v >= 1_000_000) return `${fmt(v / 1_000_000, 3)} MΩ`
  if (v >= 1_000)     return `${fmt(v / 1_000, 3)} kΩ`
  if (v >= 1)         return `${fmt(v, 3)} Ω`
  return `${fmt(v * 1000, 2)} mΩ`
}

// EIA-96 multiplier suffix table (letter → multiplier)
const EIA96_MULT: Record<string, number> = {
  Z: 0.001, Y: 0.01, R: 0.01, X: 0.1, S: 0.1, A: 1,
  B: 10, H: 10, C: 100, D: 1_000, E: 10_000, F: 100_000,
}

// EIA-96 significant-figure table: two-digit code (01-96) → three-sig-fig value
const EIA96_VALUES: number[] = [
  100,102,105,107,110,113,115,118,121,124,127,130,133,137,140,143,
  147,150,154,158,162,165,169,174,178,182,187,191,196,200,205,210,
  215,221,226,232,237,243,249,255,261,267,274,280,287,294,301,309,
  316,324,332,340,348,357,365,374,383,392,402,412,422,432,442,453,
  464,475,487,499,511,523,536,549,562,576,590,604,619,634,649,665,
  681,698,715,732,750,768,787,806,825,845,866,887,909,931,953,976,
]

function decode3(code: string): number | null {
  if (!/^\d{3}$/.test(code) && !/^\d{2}[R]\d?$/i.test(code) && !/^\dR\d$/i.test(code) && !/^R\d{2}$/i.test(code)) {
    // Handle R-notation: "4R7" = 4.7 Ω, "R47" = 0.47 Ω
    return null
  }
  const s = code.toUpperCase()
  if (s.includes('R')) {
    const [a, b] = s.split('R')
    return parseFloat(`${a || 0}.${b || 0}`)
  }
  const first = Number(s[0])
  const second = Number(s[1])
  const mult = Number(s[2])
  return (first * 10 + second) * Math.pow(10, mult)
}

function decode4(code: string): number | null {
  if (!/^\d{4}$/.test(code) && !/^\d{2}R\d$/i.test(code) && !/^\dR\d{2}$/i.test(code) && !/^R\d{3}$/i.test(code)) {
    return null
  }
  const s = code.toUpperCase()
  if (s.includes('R')) {
    const [a, b] = s.split('R')
    return parseFloat(`${a || 0}.${b || 0}`)
  }
  const digits = s.slice(0, 3)
  const mult = Number(s[3])
  return parseInt(digits, 10) * Math.pow(10, mult)
}

function decodeEia96(code: string): number | null {
  const s = code.toUpperCase()
  if (!/^\d{2}[ZYRXSABHCDEF]$/.test(s)) return null
  const idx = parseInt(s.slice(0, 2), 10)
  const letter = s[2]
  const sig = EIA96_VALUES[idx - 1]
  const mult = EIA96_MULT[letter]
  if (!sig || mult === undefined) return null
  return sig * mult / 100  // sig is stored ×100
}

/**
 * Visual SVG SMD resistor "chip" — dark ceramic body with silver end-caps and
 * the printed white code centered on top. Colored dots by the pad indicate
 * polarity-free component.
 */
function SmdChip({ code }: { code: string }) {
  const displayCode = code || '   '
  return (
    <svg viewBox="0 0 260 120" className="mx-auto h-auto w-full max-w-md drop-shadow-md" role="img" aria-label="SMD resistor">
      {/* Ceramic body */}
      <rect x="40" y="30" width="180" height="60" rx="6" fill="#111827" stroke="#000" strokeWidth="1" />
      {/* Subtle highlight */}
      <rect x="42" y="32" width="176" height="16" rx="4" fill="url(#smd-shine)" opacity="0.35" />
      {/* Silver end caps */}
      <rect x="20" y="30" width="24" height="60" rx="3" fill="url(#smd-cap-l)" stroke="#4b5563" strokeWidth="1" />
      <rect x="216" y="30" width="24" height="60" rx="3" fill="url(#smd-cap-r)" stroke="#4b5563" strokeWidth="1" />
      {/* PCB pad hints */}
      <rect x="16" y="94" width="32" height="10" rx="2" fill="#fbbf24" opacity="0.35" />
      <rect x="212" y="94" width="32" height="10" rx="2" fill="#fbbf24" opacity="0.35" />
      {/* Printed code */}
      <text
        x="130"
        y="70"
        textAnchor="middle"
        fontSize="30"
        fontWeight="800"
        fontFamily="var(--font-mono, monospace)"
        fill="#f8fafc"
        letterSpacing="2"
      >
        {displayCode}
      </text>
      <defs>
        <linearGradient id="smd-shine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="smd-cap-l" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#9ca3af" />
          <stop offset="1" stopColor="#e5e7eb" />
        </linearGradient>
        <linearGradient id="smd-cap-r" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#e5e7eb" />
          <stop offset="1" stopColor="#9ca3af" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function SmdResistorCalc() {
  const { t } = useTranslation()
  const [mode, setMode] = useState<Mode>('d3')
  const [code, setCode] = useState('103')

  const decoded = useMemo(() => {
    const raw = code.trim()
    if (!raw) return null
    switch (mode) {
      case 'd3':    return decode3(raw)
      case 'd4':    return decode4(raw)
      case 'eia96': return decodeEia96(raw)
    }
  }, [mode, code])

  const examples = mode === 'd3'
    ? ['103', '4R7', '220', 'R47']
    : mode === 'd4' ? ['1002', '10R0', 'R100', '4750']
    : ['01A', '68C', '96F', '23B']

  return (
    <CalcCard>
      <CalcHeader title={t('calc.smd.title')} description={t('calc.smd.description')} />
      <div className="space-y-4">
        {/* Visual chip */}
        <div className="rounded-2xl bg-gradient-to-b from-zinc-100 to-zinc-200 p-6 dark:from-zinc-800 dark:to-zinc-900">
          <SmdChip code={code} />
        </div>

        <SelectField
          id="smd-mode"
          label={t('calc.smd.codeType')}
          value={mode}
          onChange={(v) => setMode(v as Mode)}
          options={[
            { value: 'd3', label: t('calc.smd.modes.d3') },
            { value: 'd4', label: t('calc.smd.modes.d4') },
            { value: 'eia96', label: t('calc.smd.modes.eia96') },
          ]}
        />

        <div>
          <label htmlFor="smd-code" className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {t('calc.smd.enterCode')}
          </label>
          <input
            id="smd-code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 4))}
            placeholder={mode === 'd3' ? '103' : mode === 'd4' ? '1002' : '01A'}
            className="h-12 w-full rounded-md border border-zinc-300 bg-white px-4 text-center text-xl font-mono font-bold uppercase tracking-widest text-zinc-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          />
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400">{t('calc.smd.examples')}:</span>
            {examples.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => setCode(ex)}
                className="rounded-md bg-zinc-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-zinc-600 hover:bg-blue-100 hover:text-blue-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-blue-950/50"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>

        <ResultBig
          label={t('calc.smd.value')}
          value={decoded === null ? '—' : formatOhms(decoded)}
          tone={decoded === null ? 'danger' : 'success'}
        />

        <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900">
          <ResultRow label={t('calc.smd.rawOhms')} value={decoded === null ? '—' : fmt(decoded, 4)} unit="Ω" />
          <ResultRow
            label={t('calc.smd.typicalTolerance')}
            value={mode === 'eia96' ? '±1%' : mode === 'd4' ? '±1%' : '±5%'}
          />
        </div>

        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            {t('calc.smd.howItWorks')}
          </p>
          <div className="flex flex-wrap gap-2">
            {mode === 'd3' && (
              <>
                <Formula>ABC → AB × 10^C</Formula>
                <Formula>{`"4R7" → 4.7 Ω`}</Formula>
              </>
            )}
            {mode === 'd4' && (
              <>
                <Formula>ABCD → ABC × 10^D</Formula>
                <Formula>{`"10R0" → 10.0 Ω`}</Formula>
              </>
            )}
            {mode === 'eia96' && (
              <>
                <Formula>NN L → EIA-96 table × letter</Formula>
                <Formula>{`"68C" → 499 × 100 = 49.9 kΩ`}</Formula>
              </>
            )}
          </div>
        </div>
      </div>
    </CalcCard>
  )
}
