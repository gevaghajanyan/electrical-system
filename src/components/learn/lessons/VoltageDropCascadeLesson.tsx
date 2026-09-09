'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LessonCard, SectionHeader, Prose, KeyPoints, Playground, LabelSlider } from '../shared'

interface Segment {
  id: string
  name: string
  length: number
  csa: number
  color: string
}

/**
 * Voltage drop cascade — chain of cable segments (feeder → sub-panel → final
 * circuit). Cumulative drop shown as bars that stack up. IEC 60364 limits are
 * highlighted on the chart.
 */
export function VoltageDropCascadeLesson() {
  const { t } = useTranslation()
  const [current, setCurrent] = useState(25)
  const [voltage, setVoltage] = useState<'230' | '400'>('230')

  const [segments, setSegments] = useState<Segment[]>([
    { id: '1', name: 'feeder',    length: 40, csa: 16,   color: '#3b82f6' },
    { id: '2', name: 'subpanel',  length: 15, csa: 10,   color: '#22c55e' },
    { id: '3', name: 'final',     length: 12, csa: 2.5,  color: '#f59e0b' },
  ])

  function updateSeg(id: string, patch: Partial<Segment>) {
    setSegments((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)))
  }

  const V = Number(voltage)
  const factor = voltage === '230' ? 2 : Math.sqrt(3)
  const rho = 0.0175 // copper Ω·mm²/m @ 20 °C

  let cumulative = 0
  const rows = segments.map((s) => {
    const R = s.csa > 0 ? rho * s.length / s.csa : 0
    const dropV = factor * current * R
    const dropPct = V > 0 ? (dropV / V) * 100 : 0
    cumulative += dropPct
    return { seg: s, dropV, dropPct, cumulative }
  })

  const totalPct = cumulative
  const overLimit = totalPct > 5   // IEC/BS 7671 typical 3% lighting, 5% other
  const overWarning = totalPct > 3

  return (
    <div className="space-y-6">
      <LessonCard>
        <SectionHeader title={t('learn.lessons.vdrop_cascade.title')} />
        <Prose>
          <p>{t('learn.lessons.vdrop_cascade.intro')}</p>
        </Prose>
      </LessonCard>

      <LessonCard>
        <SectionHeader title={t('learn.tryYourself')} />
        <Playground>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <LabelSlider label={t('learn.lessons.vdrop_cascade.loadCurrent')} unit="A" value={current} min={1} max={80} onChange={setCurrent} />
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {t('learn.lessons.vdrop_cascade.supply')}
              </label>
              <div className="grid grid-cols-2 gap-1 rounded-lg border border-zinc-200 p-1 dark:border-zinc-700">
                {(['230', '400'] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setVoltage(v)}
                    className={`min-h-[40px] rounded-md px-2 py-1.5 text-sm font-semibold transition-colors touch-manipulation ${
                      voltage === v
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                    }`}
                  >
                    {v} V
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Per-segment editor */}
          <div className="mt-4 space-y-2">
            {rows.map(({ seg, dropV, dropPct, cumulative }) => (
              <div key={seg.id} className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900">
                <div className="mb-2 flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ background: seg.color }} />
                  <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                    {t(`learn.lessons.vdrop_cascade.segments.${seg.name}`)}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <LabelSlider label={t('learn.lessons.vdrop_cascade.length')}   unit="m"   value={seg.length} min={1} max={200} step={1}   onChange={(v) => updateSeg(seg.id, { length: v })} />
                  <LabelSlider label={t('learn.lessons.vdrop_cascade.csa')}      unit="mm²" value={seg.csa}    min={1} max={95}  step={0.5} onChange={(v) => updateSeg(seg.id, { csa: v })} />
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px]">
                  <span className="text-zinc-500">
                    ΔV = <span className="font-mono font-semibold text-zinc-700 dark:text-zinc-200">{dropV.toFixed(2)} V</span> · {dropPct.toFixed(2)}%
                  </span>
                  <span className="ml-auto text-zinc-400">
                    {t('learn.lessons.vdrop_cascade.cumulative')}: <span className="font-mono font-semibold text-zinc-700 dark:text-zinc-200">{cumulative.toFixed(2)}%</span>
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Stacked cascade bar */}
          <div className="mt-4 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div className="flex h-6">
              {rows.map(({ seg, dropPct }) => (
                <div
                  key={seg.id}
                  className="h-full transition-all"
                  style={{ width: `${Math.min(30, dropPct) * 3}%`, background: seg.color }}
                  title={`${t(`learn.lessons.vdrop_cascade.segments.${seg.name}`)}: ${dropPct.toFixed(2)}%`}
                />
              ))}
            </div>
          </div>

          {/* Total status */}
          <div className={`mt-4 rounded-xl border p-3 text-center ${
            overLimit
              ? 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/40'
              : overWarning
                ? 'border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40'
                : 'border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950/40'
          }`}>
            <p className="text-[10px] font-semibold uppercase tracking-widest opacity-70">
              {t('learn.lessons.vdrop_cascade.totalDrop')}
            </p>
            <p className={`mt-1 font-mono text-3xl font-bold tabular-nums ${
              overLimit ? 'text-red-700 dark:text-red-300' :
              overWarning ? 'text-amber-700 dark:text-amber-300' :
              'text-green-700 dark:text-green-300'
            }`}>
              {totalPct.toFixed(2)}%
            </p>
            <p className="mt-1 text-xs opacity-80">
              {overLimit ? t('learn.lessons.vdrop_cascade.exceeds5')
                : overWarning ? t('learn.lessons.vdrop_cascade.exceeds3')
                : t('learn.lessons.vdrop_cascade.ok')}
            </p>
          </div>
        </Playground>
      </LessonCard>

      <LessonCard>
        <SectionHeader title={t('learn.keyPoints')} />
        <KeyPoints
          points={[
            t('learn.lessons.vdrop_cascade.point1'),
            t('learn.lessons.vdrop_cascade.point2'),
            t('learn.lessons.vdrop_cascade.point3'),
          ]}
        />
      </LessonCard>
    </div>
  )
}
