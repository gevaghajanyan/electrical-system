'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LessonCard, SectionHeader, Prose, KeyPoints, Playground, LabelSlider } from '../shared'

/**
 * MCB selectivity ("coordination") — plot the two log-log tripping curves
 * side by side and highlight whether the downstream device would trip alone
 * or take out the upstream one with it.
 */
export function SelectivityLesson() {
  const { t } = useTranslation()
  const [upstream, setUpstream] = useState(40)   // A
  const [downstream, setDownstream] = useState(16) // A
  const [faultA, setFaultA] = useState(200)      // simulated fault current

  const ratio = faultA / downstream
  const upstreamRatio = faultA / upstream

  // Curve C: instantaneous trip at 5–10× In. Thermal region below.
  const downstreamTrips = ratio >= 10 || (ratio >= 5 && ratio < 10)
  const upstreamAlsoTrips = upstreamRatio >= 5
  const selective = downstreamTrips && !upstreamAlsoTrips
  const bothTrip = downstreamTrips && upstreamAlsoTrips
  const neitherTrips = !downstreamTrips

  // Log-log plot params
  const W = 480
  const H = 220
  const padL = 40
  const padB = 30
  // X = multiples of In (0.5..100 log scale)
  // Y = time (s) — log 0.01..1000
  function xAt(mult: number): number {
    const min = 0.5, max = 100
    return padL + ((Math.log10(mult) - Math.log10(min)) / (Math.log10(max) - Math.log10(min))) * (W - padL - 10)
  }
  function yAt(time: number): number {
    const min = 0.01, max = 1000
    return (H - padB) - ((Math.log10(time) - Math.log10(min)) / (Math.log10(max) - Math.log10(min))) * (H - padB - 10)
  }

  // Simple Curve-C model: thermal segment (long times below 5× In), magnetic (0.02 s at ≥10× In)
  function curvePath(rating: number, color: string): string {
    void rating  // rating shifts the ×-axis anchor — but we plot in multiples so the curve stays the same shape.
    const pts: string[] = []
    // Thermal band: t ≈ (5 / ratio)² × 10 for ratio 1.13..5
    for (let m = 1.13; m < 5; m += 0.2) {
      const time = Math.max(1, 400 / (m * m))
      pts.push(`${m},${time}`)
    }
    // Magnetic instant: at 5..10× In drop to 0.02 s
    pts.push(`5,0.02`)
    pts.push(`100,0.02`)
    void color
    return pts.map((p, i) => {
      const [m, ts] = p.split(',').map(Number)
      return `${i === 0 ? 'M' : 'L'} ${xAt(m)} ${yAt(ts)}`
    }).join(' ')
  }

  const conclusion =
    selective        ? { key: 'selective',    tone: 'green' } :
    bothTrip         ? { key: 'not_selective', tone: 'red' } :
    neitherTrips     ? { key: 'neither',      tone: 'amber' } :
                       { key: 'partial',      tone: 'amber' }

  return (
    <div className="space-y-6">
      <LessonCard>
        <SectionHeader title={t('learn.lessons.selectivity.title')} />
        <Prose>
          <p>{t('learn.lessons.selectivity.intro')}</p>
        </Prose>
      </LessonCard>

      <LessonCard>
        <SectionHeader title={t('learn.tryYourself')} />
        <Playground>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <LabelSlider label={t('learn.lessons.selectivity.upstream')}   unit="A" value={upstream}   min={16} max={125} step={1} onChange={setUpstream} />
            <LabelSlider label={t('learn.lessons.selectivity.downstream')} unit="A" value={downstream} min={6}  max={63}  step={1} onChange={setDownstream} />
            <LabelSlider label={t('learn.lessons.selectivity.fault')}      unit="A" value={faultA}     min={10} max={2000} step={10} onChange={setFaultA} />
          </div>

          <div className="mt-4 rounded-xl bg-white p-3 dark:bg-zinc-900">
            <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
              {/* Axes */}
              <line x1={padL} x2={W - 10} y1={H - padB} y2={H - padB} stroke="#a1a1aa" strokeWidth="1" />
              <line x1={padL} x2={padL} y1={10} y2={H - padB} stroke="#a1a1aa" strokeWidth="1" />
              <text x={W / 2} y={H - 6} textAnchor="middle" fontSize="9" fill="#71717a">multiples of In (log)</text>
              <text x={10} y={H / 2} fontSize="9" fill="#71717a" transform={`rotate(-90 10 ${H / 2})`}>time [s] (log)</text>

              {/* Decade grid */}
              {[1, 2, 5, 10, 20, 50, 100].map((m) => (
                <g key={m}>
                  <line x1={xAt(m)} x2={xAt(m)} y1={10} y2={H - padB} stroke="#e5e7eb" strokeWidth="0.5" />
                  <text x={xAt(m)} y={H - padB + 10} textAnchor="middle" fontSize="8" fill="#a1a1aa">{m}×</text>
                </g>
              ))}
              {[0.01, 0.1, 1, 10, 100].map((s) => (
                <g key={s}>
                  <line x1={padL} x2={W - 10} y1={yAt(s)} y2={yAt(s)} stroke="#e5e7eb" strokeWidth="0.5" />
                  <text x={padL - 3} y={yAt(s) + 3} textAnchor="end" fontSize="8" fill="#a1a1aa">{s}</text>
                </g>
              ))}

              {/* Curves */}
              <path d={curvePath(upstream,   '#3b82f6')} stroke="#3b82f6" strokeWidth="2" fill="none" opacity="0.85" />
              <path d={curvePath(downstream, '#22c55e')} stroke="#22c55e" strokeWidth="2" fill="none" opacity="0.85" />

              {/* Fault current markers (relative to each rating) */}
              <line x1={xAt(faultA / upstream)}   x2={xAt(faultA / upstream)}   y1={10} y2={H - padB} stroke="#3b82f6" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
              <line x1={xAt(faultA / downstream)} x2={xAt(faultA / downstream)} y1={10} y2={H - padB} stroke="#22c55e" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
            </svg>
            <div className="mt-2 flex justify-center gap-4 text-[11px]">
              <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> upstream {upstream} A</span>
              <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-green-500" /> downstream {downstream} A</span>
            </div>
          </div>

          {/* Verdict */}
          <div className={`mt-4 rounded-xl border p-3 text-sm font-semibold ${
            conclusion.tone === 'green' ? 'border-green-300 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950/40 dark:text-green-200' :
            conclusion.tone === 'red'   ? 'border-red-300 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200' :
                                          'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200'
          }`}>
            {t(`learn.lessons.selectivity.${conclusion.key}`, { upstream, downstream, fault: faultA })}
          </div>
        </Playground>
      </LessonCard>

      <LessonCard>
        <SectionHeader title={t('learn.keyPoints')} />
        <KeyPoints
          points={[
            t('learn.lessons.selectivity.point1'),
            t('learn.lessons.selectivity.point2'),
            t('learn.lessons.selectivity.point3'),
          ]}
        />
      </LessonCard>
    </div>
  )
}
