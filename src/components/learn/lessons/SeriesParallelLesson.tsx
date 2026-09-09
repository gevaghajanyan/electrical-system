'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LessonCard, SectionHeader, Prose, KeyPoints, Playground, LabelSlider } from '../shared'

type Mode = 'series' | 'parallel'

export function SeriesParallelLesson() {
  const { t } = useTranslation()
  const [mode, setMode] = useState<Mode>('series')
  const [r1, setR1] = useState(100)
  const [r2, setR2] = useState(220)
  const [r3, setR3] = useState(330)

  const rs = [r1, r2, r3]
  const total = mode === 'series'
    ? rs.reduce((a, b) => a + b, 0)
    : 1 / rs.reduce((a, b) => a + 1 / b, 0)

  return (
    <div className="space-y-6">
      <LessonCard>
        <SectionHeader title={t('learn.lessons.series_parallel.title')} />
        <Prose>
          <p>{t('learn.lessons.series_parallel.intro')}</p>
        </Prose>
      </LessonCard>

      <LessonCard>
        <SectionHeader title={t('learn.tryYourself')} />
        <Playground>
          <div className="grid grid-cols-2 gap-1 rounded-lg border border-zinc-200 p-1 dark:border-zinc-700">
            {(['series', 'parallel'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`min-h-[40px] rounded-md px-2 py-1.5 text-sm font-medium transition-colors touch-manipulation ${
                  mode === m
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                }`}
              >
                {t(`learn.lessons.series_parallel.${m}`)}
              </button>
            ))}
          </div>

          {/* Interactive SVG */}
          <div className="mt-4 flex justify-center">
            {mode === 'series' ? (
              <svg viewBox="0 0 480 140" className="h-auto w-full max-w-lg">
                {/* Battery */}
                <rect x="10" y="55" width="34" height="30" rx="3" fill="#1b2740" />
                <text x="27" y="75" textAnchor="middle" fontSize="10" fontWeight="700" fill="#f2bc2e">9V</text>
                {/* Wires */}
                <path d="M 44 70 L 90 70" stroke="#71717a" strokeWidth="3" fill="none" />
                {/* R1 */}
                <Resistor x={90} y={70} value={r1} label="R1" />
                <path d="M 170 70 L 210 70" stroke="#71717a" strokeWidth="3" fill="none" />
                {/* R2 */}
                <Resistor x={210} y={70} value={r2} label="R2" />
                <path d="M 290 70 L 330 70" stroke="#71717a" strokeWidth="3" fill="none" />
                {/* R3 */}
                <Resistor x={330} y={70} value={r3} label="R3" />
                <path d="M 410 70 L 440 70 L 440 105 L 27 105 L 27 85" stroke="#71717a" strokeWidth="3" fill="none" />
              </svg>
            ) : (
              <svg viewBox="0 0 380 220" className="h-auto w-full max-w-md">
                {/* Battery */}
                <rect x="10" y="100" width="34" height="30" rx="3" fill="#1b2740" />
                <text x="27" y="120" textAnchor="middle" fontSize="10" fontWeight="700" fill="#f2bc2e">9V</text>
                {/* Left vertical bus */}
                <path d="M 44 115 L 100 115" stroke="#71717a" strokeWidth="3" fill="none" />
                <path d="M 100 40 L 100 190" stroke="#71717a" strokeWidth="3" fill="none" />
                {/* Right vertical bus */}
                <path d="M 260 40 L 260 190" stroke="#71717a" strokeWidth="3" fill="none" />
                <path d="M 260 115 L 340 115 L 340 145 L 27 145 L 27 130" stroke="#71717a" strokeWidth="3" fill="none" />
                {/* R1 (top) */}
                <path d="M 100 50 L 140 50" stroke="#71717a" strokeWidth="3" fill="none" />
                <Resistor x={140} y={50} value={r1} label="R1" />
                <path d="M 220 50 L 260 50" stroke="#71717a" strokeWidth="3" fill="none" />
                {/* R2 (middle) */}
                <path d="M 100 115 L 140 115" stroke="#71717a" strokeWidth="3" fill="none" />
                <Resistor x={140} y={115} value={r2} label="R2" />
                <path d="M 220 115 L 260 115" stroke="#71717a" strokeWidth="3" fill="none" />
                {/* R3 (bottom) */}
                <path d="M 100 180 L 140 180" stroke="#71717a" strokeWidth="3" fill="none" />
                <Resistor x={140} y={180} value={r3} label="R3" />
                <path d="M 220 180 L 260 180" stroke="#71717a" strokeWidth="3" fill="none" />
              </svg>
            )}
          </div>

          {/* Sliders */}
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <LabelSlider label="R1" unit="Ω" value={r1} min={10} max={1000} step={10} onChange={setR1} />
            <LabelSlider label="R2" unit="Ω" value={r2} min={10} max={1000} step={10} onChange={setR2} />
            <LabelSlider label="R3" unit="Ω" value={r3} min={10} max={1000} step={10} onChange={setR3} />
          </div>

          <div className="mt-4 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 p-5 text-center text-white shadow-md">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-white/80">
              {t('learn.lessons.series_parallel.totalR')}
            </p>
            <p className="mt-1 font-mono text-3xl font-bold tabular-nums">
              {total < 1000 ? total.toFixed(1) : (total / 1000).toFixed(2) + 'k'} Ω
            </p>
          </div>
        </Playground>
      </LessonCard>

      <LessonCard>
        <SectionHeader title={t('learn.keyPoints')} />
        <KeyPoints
          points={[
            t('learn.lessons.series_parallel.point1'),
            t('learn.lessons.series_parallel.point2'),
            t('learn.lessons.series_parallel.point3'),
          ]}
        />
      </LessonCard>
    </div>
  )
}

/** Zig-zag resistor drawn at (x,y) — 80×20 bounds. */
function Resistor({ x, y, value, label }: { x: number; y: number; value: number; label: string }) {
  return (
    <g>
      <rect x={x} y={y - 8} width={80} height={16} rx={2} fill="#fef9c3" stroke="#78350f" strokeWidth={1} />
      <path
        d={`M ${x} ${y} L ${x + 8} ${y} L ${x + 14} ${y - 6} L ${x + 26} ${y + 6} L ${x + 38} ${y - 6} L ${x + 50} ${y + 6} L ${x + 62} ${y - 6} L ${x + 72} ${y} L ${x + 80} ${y}`}
        stroke="#78350f"
        strokeWidth={1.6}
        fill="none"
      />
      <text x={x + 40} y={y - 12} textAnchor="middle" fontSize="9" fontWeight="700" fill="#78350f">{label}</text>
      <text x={x + 40} y={y + 22} textAnchor="middle" fontSize="10" fontWeight="600" fill="#374151">{value}Ω</text>
    </g>
  )
}
