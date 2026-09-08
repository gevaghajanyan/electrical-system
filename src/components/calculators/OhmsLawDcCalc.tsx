'use client'

import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CalcCard, CalcHeader, Field, FieldRow, ResultBig, ResultRow, fmt } from './shared'

type Quantity = 'V' | 'I' | 'R' | 'P'

interface QuadrantDef {
  id: Quantity
  label: string      // headline symbol (V, I, R, P)
  unit: string
  color: string      // fill for the quadrant
  formulas: string[] // three formulas that solve for this quantity
}

const QUADRANTS: QuadrantDef[] = [
  { id: 'V', label: 'V', unit: 'V',  color: '#ef4444', formulas: ['I × R', '√(P × R)', 'P ÷ I'] },
  { id: 'I', label: 'I', unit: 'A',  color: '#f59e0b', formulas: ['V ÷ R', '√(P ÷ R)', 'P ÷ V'] },
  { id: 'R', label: 'R', unit: 'Ω',  color: '#3b82f6', formulas: ['V ÷ I', 'V² ÷ P', 'P ÷ I²'] },
  { id: 'P', label: 'P', unit: 'W',  color: '#22c55e', formulas: ['V × I', 'I² × R', 'V² ÷ R'] },
]

// ─────────────────────────────────────────────────────────────────────────────
// Interactive SVG "Ohm's law wheel" — click a quadrant to select solve-for.
// ─────────────────────────────────────────────────────────────────────────────

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

/** Wedge path: donut sector from `outerR` to `innerR` between `a1..a2`. */
function wedgePath(cx: number, cy: number, innerR: number, outerR: number, a1: number, a2: number) {
  const p1 = polar(cx, cy, outerR, a1)
  const p2 = polar(cx, cy, outerR, a2)
  const p3 = polar(cx, cy, innerR, a2)
  const p4 = polar(cx, cy, innerR, a1)
  const large = a2 - a1 > 180 ? 1 : 0
  return [
    `M ${p1.x} ${p1.y}`,
    `A ${outerR} ${outerR} 0 ${large} 1 ${p2.x} ${p2.y}`,
    `L ${p3.x} ${p3.y}`,
    `A ${innerR} ${innerR} 0 ${large} 0 ${p4.x} ${p4.y}`,
    'Z',
  ].join(' ')
}

function OhmsWheel({ active, onSelect }: { active: Quantity; onSelect: (q: Quantity) => void }) {
  const size = 320
  const cx = size / 2
  const cy = size / 2
  const outerR = 148
  const innerR = 62
  const midR = (outerR + innerR) / 2

  return (
    <div className="relative mx-auto w-full max-w-[340px]">
      <svg viewBox={`0 0 ${size} ${size}`} className="h-auto w-full drop-shadow-md" role="img" aria-label="Ohm's law wheel">
        <defs>
          <radialGradient id="ohm-inner" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#1b2740" />
            <stop offset="1" stopColor="#0f1013" />
          </radialGradient>
        </defs>

        {/* Four quadrants */}
        {QUADRANTS.map((q, i) => {
          const a1 = i * 90
          const a2 = a1 + 90
          const isActive = q.id === active
          const mid = polar(cx, cy, midR, (a1 + a2) / 2)
          const outerLabel = polar(cx, cy, outerR - 14, (a1 + a2) / 2)
          return (
            <g key={q.id} onClick={() => onSelect(q.id)} className="cursor-pointer" role="button" aria-label={q.id}>
              <path
                d={wedgePath(cx, cy, innerR, outerR, a1, a2)}
                fill={q.color}
                opacity={isActive ? 1 : 0.28}
                stroke="#ffffff"
                strokeWidth="2"
                className="transition-opacity hover:opacity-80"
              />
              {/* Quantity letter close to outer edge */}
              <text
                x={outerLabel.x}
                y={outerLabel.y + 8}
                textAnchor="middle"
                fontSize={24}
                fontWeight={800}
                fill="#ffffff"
                fontFamily="var(--font-sans, sans-serif)"
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {q.label}
              </text>
              {/* Three formulas radially */}
              {q.formulas.map((f, k) => {
                const p = polar(cx, cy, midR + (k - 1) * 16, (a1 + a2) / 2)
                return (
                  <text
                    key={k}
                    x={p.x}
                    y={p.y + 4}
                    textAnchor="middle"
                    fontSize={11}
                    fontWeight={600}
                    fill="#ffffff"
                    opacity={isActive ? 0.95 : 0.7}
                    fontFamily="var(--font-mono, monospace)"
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    {f}
                  </text>
                )
              })}
            </g>
          )
        })}

        {/* Inner disc — shows the current "solve for" */}
        <circle cx={cx} cy={cy} r={innerR - 3} fill="url(#ohm-inner)" />
        <text x={cx} y={cy - 6} textAnchor="middle"
              fontSize={48} fontWeight={900} fill="#f2bc2e" fontFamily="var(--font-sans, sans-serif)">
          {QUADRANTS.find((q) => q.id === active)?.label}
        </text>
        <text x={cx} y={cy + 18} textAnchor="middle"
              fontSize={10} fontWeight={700} fill="#ffffff" opacity={0.7}
              letterSpacing="2">
          SOLVE
        </text>
      </svg>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// The calculator itself.
// ─────────────────────────────────────────────────────────────────────────────

export function OhmsLawDcCalc() {
  const { t } = useTranslation()
  const [solveFor, setSolveFor] = useState<Quantity>('V')
  const [V, setV] = useState('12')
  const [I, setI] = useState('2')
  const [R, setR] = useState('6')
  const [P, setP] = useState('24')

  const result = useMemo(() => {
    const v = parseFloat(V) || 0
    const i = parseFloat(I) || 0
    const r = parseFloat(R) || 0
    const p = parseFloat(P) || 0
    switch (solveFor) {
      case 'V':
        if (i && r) return { V: i * r, I: i, R: r, P: i * i * r }
        if (p && i) return { V: p / i, I: i, R: p / (i * i), P: p }
        if (p && r) { const vv = Math.sqrt(p * r); return { V: vv, I: vv / r, R: r, P: p } }
        return null
      case 'I':
        if (v && r) return { V: v, I: v / r, R: r, P: (v * v) / r }
        if (p && v) return { V: v, I: p / v, R: (v * v) / p, P: p }
        if (p && r) { const ii = Math.sqrt(p / r); return { V: ii * r, I: ii, R: r, P: p } }
        return null
      case 'R':
        if (v && i) return { V: v, I: i, R: v / i, P: v * i }
        if (v && p) return { V: v, I: p / v, R: (v * v) / p, P: p }
        if (p && i) return { V: p / i, I: i, R: p / (i * i), P: p }
        return null
      case 'P':
        if (v && i) return { V: v, I: i, R: v / i, P: v * i }
        if (v && r) return { V: v, I: v / r, R: r, P: (v * v) / r }
        if (i && r) return { V: i * r, I: i, R: r, P: i * i * r }
        return null
    }
  }, [solveFor, V, I, R, P])

  const activeDef = QUADRANTS.find((q) => q.id === solveFor)!

  return (
    <CalcCard>
      <CalcHeader
        title={t('calc.ohms_dc.title')}
        description={t('calc.ohms_dc.description')}
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1fr] lg:items-start">
        {/* Wheel */}
        <div>
          <OhmsWheel active={solveFor} onSelect={setSolveFor} />
          <div className="mt-3 grid grid-cols-4 gap-2">
            {QUADRANTS.map((q) => (
              <button
                key={q.id}
                type="button"
                onClick={() => setSolveFor(q.id)}
                className={`inline-flex flex-col items-center gap-0.5 rounded-lg border p-2 text-xs font-semibold transition-all touch-manipulation ${
                  q.id === solveFor
                    ? 'border-transparent text-white shadow-sm'
                    : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-300'
                }`}
                style={q.id === solveFor ? { background: q.color } : undefined}
              >
                <span className="text-base font-bold">{q.label}</span>
                <span className="text-[10px] font-medium opacity-80">{q.unit}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Inputs + result */}
        <div className="space-y-4">
          <FieldRow>
            {solveFor !== 'V' && <Field id="ohm-v" label={t('calc.ohms_dc.voltage')} value={V} onChange={setV} unit="V" />}
            {solveFor !== 'I' && <Field id="ohm-i" label={t('calc.ohms_dc.current')} value={I} onChange={setI} unit="A" step={0.01} />}
            {solveFor !== 'R' && <Field id="ohm-r" label={t('calc.ohms_dc.resistance')} value={R} onChange={setR} unit="Ω" />}
            {solveFor !== 'P' && <Field id="ohm-p" label={t('calc.ohms_dc.power')} value={P} onChange={setP} unit="W" />}
          </FieldRow>

          {result && (
            <>
              <ResultBig
                label={t(`calc.ohms_dc.${solveFor === 'V' ? 'voltage' : solveFor === 'I' ? 'current' : solveFor === 'R' ? 'resistance' : 'power'}`)}
                value={fmt(result[solveFor], 3)}
                unit={activeDef.unit}
              />
              <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900">
                <ResultRow label="V" value={fmt(result.V, 3)} unit="V" />
                <ResultRow label="I" value={fmt(result.I, 4)} unit="A" />
                <ResultRow label="R" value={fmt(result.R, 3)} unit="Ω" />
                <ResultRow label="P" value={fmt(result.P, 3)} unit="W" />
              </div>
            </>
          )}
        </div>
      </div>
    </CalcCard>
  )
}
