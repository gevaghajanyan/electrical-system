'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LessonCard, SectionHeader, Prose, KeyPoints, Playground, LabelSlider } from '../shared'

type Method = 'dol' | 'star_delta' | 'soft' | 'vfd'

const METHOD_MULT: Record<Method, number> = {
  dol: 1.0,
  star_delta: 0.33,
  soft: 0.4,
  vfd: 0.15,
}
const METHOD_COLOR: Record<Method, string> = {
  dol: '#ef4444',
  star_delta: '#f59e0b',
  soft: '#3b82f6',
  vfd: '#22c55e',
}

/**
 * Motor starting current visualisation — overlay the inrush waveforms for
 * DOL, Star-Delta, Soft-starter and VFD side-by-side. Motor FLC set by a
 * slider so the reader sees real amps, not just multipliers.
 */
export function MotorStartingLesson() {
  const { t } = useTranslation()
  const [flc, setFlc] = useState(20)         // A
  const [lrr, setLrr] = useState(6)          // locked-rotor ratio
  const [method, setMethod] = useState<Method>('dol')

  const W = 480
  const H = 220
  const padL = 40
  const padB = 30

  // Time axis 0..10s, current axis 0..LRA
  const lra = flc * lrr
  const maxY = lra * 1.1
  function xAt(t: number): number { return padL + (t / 10) * (W - padL - 10) }
  function yAt(a: number): number { return (H - padB) - (a / maxY) * (H - padB - 10) }

  // Build current-vs-time curves for the selected method + FLC baseline
  function curve(m: Method): { d: string; color: string } {
    const color = METHOD_COLOR[m]
    const factor = METHOD_MULT[m]
    const pts: string[] = []
    // Inrush waveform: peaks at t=0 with factor × LRA, decays to FLC by t=~3-5s
    for (let ts = 0; ts <= 10; ts += 0.1) {
      let a: number
      if (m === 'dol') {
        // Sharp peak, quick decay
        a = flc + (lra - flc) * Math.exp(-ts * 1.2)
      } else if (m === 'star_delta') {
        // Half-height plateau for the first 3s (star), then jumps + drops
        if (ts < 3)        a = flc + (lra * factor - flc) * Math.exp(-ts * 0.5)
        else if (ts < 3.5) a = flc + (lra * 0.85 - flc) * Math.exp(-(ts - 3) * 4)
        else               a = flc + (lra * 0.85 - flc) * Math.exp(-(ts - 3) * 1.2)
      } else if (m === 'soft') {
        // Smooth ramp
        const rampT = Math.min(1, ts / 4)
        a = flc + (lra * factor - flc) * (1 - Math.exp(-ts * 0.5)) * (1 - rampT * 0.5)
      } else { // vfd
        a = flc + (lra * factor - flc) * Math.exp(-ts * 0.8)
      }
      a = Math.max(flc * 0.9, a)
      pts.push(`${xAt(ts).toFixed(1)},${yAt(a).toFixed(1)}`)
    }
    return {
      d: pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.replace(',', ' ')}`).join(' '),
      color,
    }
  }

  const active = curve(method)

  return (
    <div className="space-y-6">
      <LessonCard>
        <SectionHeader title={t('learn.lessons.motor_start.title')} />
        <Prose>
          <p>{t('learn.lessons.motor_start.intro')}</p>
        </Prose>
      </LessonCard>

      <LessonCard>
        <SectionHeader title={t('learn.tryYourself')} />
        <Playground>
          <div className="grid grid-cols-2 gap-1 rounded-lg border border-zinc-200 p-1 dark:border-zinc-700 sm:grid-cols-4">
            {(['dol', 'star_delta', 'soft', 'vfd'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMethod(m)}
                className={`min-h-[40px] rounded-md px-1 py-1.5 text-[11px] font-semibold leading-tight transition-colors touch-manipulation sm:px-2 sm:text-xs ${
                  method === m
                    ? 'text-white shadow-sm'
                    : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                }`}
                style={method === m ? { background: METHOD_COLOR[m] } : undefined}
              >
                {t(`learn.lessons.motor_start.methods.${m}`)}
              </button>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <LabelSlider label={t('learn.lessons.motor_start.flc')} unit="A" value={flc} min={4}  max={100} step={1}  onChange={setFlc} />
            <LabelSlider label={t('learn.lessons.motor_start.lrr')}       value={lrr} min={3}  max={10}  step={0.5} onChange={setLrr} />
          </div>

          <div className="mt-4 rounded-xl bg-white p-3 dark:bg-zinc-900">
            <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
              {/* Axes */}
              <line x1={padL} x2={W - 10} y1={H - padB} y2={H - padB} stroke="#a1a1aa" strokeWidth="1" />
              <line x1={padL} x2={padL} y1={10} y2={H - padB} stroke="#a1a1aa" strokeWidth="1" />
              <text x={W / 2} y={H - 6} textAnchor="middle" fontSize="9" fill="#71717a">time [s]</text>

              {/* FLC baseline */}
              <line x1={padL} x2={W - 10} y1={yAt(flc)} y2={yAt(flc)} stroke="#a1a1aa" strokeWidth="1" strokeDasharray="4 3" />
              <text x={W - 15} y={yAt(flc) - 4} textAnchor="end" fontSize="8" fill="#71717a">FLC {flc}A</text>

              {/* LRA marker */}
              <line x1={padL} x2={W - 10} y1={yAt(lra)} y2={yAt(lra)} stroke="#dc2626" strokeWidth="0.5" strokeDasharray="2 4" opacity="0.6" />
              <text x={W - 15} y={yAt(lra) - 4} textAnchor="end" fontSize="8" fill="#dc2626">LRA {lra.toFixed(0)}A</text>

              {/* Ghost curves for all methods */}
              {(['dol', 'star_delta', 'soft', 'vfd'] as Method[]).map((m) => {
                if (m === method) return null
                const c = curve(m)
                return <path key={m} d={c.d} stroke={c.color} strokeWidth="1.4" fill="none" opacity="0.2" />
              })}

              {/* Active curve */}
              <path d={active.d} stroke={active.color} strokeWidth="2.8" fill="none" strokeLinecap="round" />

              {/* Time ticks */}
              {[0, 2, 4, 6, 8, 10].map((s) => (
                <g key={s}>
                  <line x1={xAt(s)} x2={xAt(s)} y1={H - padB} y2={H - padB + 4} stroke="#a1a1aa" strokeWidth="0.5" />
                  <text x={xAt(s)} y={H - padB + 14} textAnchor="middle" fontSize="8" fill="#a1a1aa">{s}</text>
                </g>
              ))}
            </svg>
          </div>

          {/* Peak current pill */}
          <div className="mt-3 rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-700 p-4 text-white shadow-md">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/70">
              {t('learn.lessons.motor_start.peakStart')}
            </p>
            <p className="mt-1 font-mono text-2xl font-bold tabular-nums">
              {(lra * METHOD_MULT[method]).toFixed(1)} <span className="text-sm">A</span>
              <span className="ml-3 text-xs font-medium opacity-70">
                = {METHOD_MULT[method]}× LRA
              </span>
            </p>
          </div>
        </Playground>
      </LessonCard>

      <LessonCard>
        <SectionHeader title={t('learn.keyPoints')} />
        <KeyPoints
          points={[
            t('learn.lessons.motor_start.point1'),
            t('learn.lessons.motor_start.point2'),
            t('learn.lessons.motor_start.point3'),
          ]}
        />
      </LessonCard>
    </div>
  )
}
