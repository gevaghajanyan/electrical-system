'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LessonCard, SectionHeader, Prose, KeyPoints, Playground, LabelSlider } from '../shared'

/**
 * Harmonic distortion — user adds a 3rd + 5th harmonic to a fundamental and
 * watches the wave shape flatten / peak. THD % updates live. Explains why
 * non-linear loads (LED drivers, VFDs, computers) pollute the neutral.
 */
export function HarmonicsLesson() {
  const { t } = useTranslation()
  const [h3, setH3] = useState(0.3)   // 3rd harmonic amplitude relative
  const [h5, setH5] = useState(0.15)
  const [h7, setH7] = useState(0.08)
  const [phase, setPhase] = useState(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    let last = performance.now()
    function tick(now: number) {
      const dt = (now - last) / 1000
      last = now
      setPhase((p) => (p + dt * 0.8) % (2 * Math.PI))
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [])

  const W = 480
  const H = 220
  const cy = H / 2

  function build(): { d: string; peak: number } {
    let peak = 0
    const pts: string[] = []
    const pxPerCycle = W
    for (let x = 0; x <= W; x += 3) {
      const rad = (x / pxPerCycle) * 2 * Math.PI + phase
      const y =
        Math.sin(rad) +
        h3 * Math.sin(3 * rad) +
        h5 * Math.sin(5 * rad) +
        h7 * Math.sin(7 * rad)
      const scaled = y * (H / 2 - 10)
      peak = Math.max(peak, Math.abs(y))
      pts.push(`${x === 0 ? 'M' : 'L'} ${x} ${(cy - scaled).toFixed(1)}`)
    }
    return { d: pts.join(' '), peak }
  }

  const wave = build()
  // THD % = √(h3² + h5² + h7²) / 1  × 100  (fundamental = 1)
  const thd = Math.sqrt(h3 * h3 + h5 * h5 + h7 * h7) * 100
  const crestFactor = wave.peak / Math.SQRT2   // ideal sine = 1
  const bad = thd > 30

  return (
    <div className="space-y-6">
      <LessonCard>
        <SectionHeader title={t('learn.lessons.harmonics.title')} />
        <Prose>
          <p>{t('learn.lessons.harmonics.intro')}</p>
        </Prose>
      </LessonCard>

      <LessonCard>
        <SectionHeader title={t('learn.tryYourself')} />
        <Playground>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <LabelSlider label={t('learn.lessons.harmonics.h3')} unit="%" value={Math.round(h3 * 100)} min={0} max={80} step={1} onChange={(v) => setH3(v / 100)} />
            <LabelSlider label={t('learn.lessons.harmonics.h5')} unit="%" value={Math.round(h5 * 100)} min={0} max={60} step={1} onChange={(v) => setH5(v / 100)} />
            <LabelSlider label={t('learn.lessons.harmonics.h7')} unit="%" value={Math.round(h7 * 100)} min={0} max={40} step={1} onChange={(v) => setH7(v / 100)} />
          </div>

          <svg viewBox={`0 0 ${W} ${H}`} className="mt-4 h-auto w-full rounded-xl bg-white p-1 dark:bg-zinc-900">
            <line x1={0} x2={W} y1={cy} y2={cy} stroke="#a1a1aa" strokeWidth={1} />
            {/* Ideal sine ghost */}
            <path
              d={(() => {
                const pts: string[] = []
                for (let x = 0; x <= W; x += 3) {
                  const rad = (x / W) * 2 * Math.PI + phase
                  pts.push(`${x === 0 ? 'M' : 'L'} ${x} ${(cy - Math.sin(rad) * (H / 2 - 10)).toFixed(1)}`)
                }
                return pts.join(' ')
              })()}
              stroke="#a1a1aa" strokeWidth={1.2} fill="none" strokeDasharray="4 4" opacity="0.5"
            />
            {/* Distorted */}
            <path d={wave.d} stroke={bad ? '#ef4444' : '#3b82f6'} strokeWidth={2.4} fill="none" strokeLinecap="round" />
          </svg>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 p-4 text-center text-white shadow-md">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/80">THD</p>
              <p className="mt-1 font-mono text-2xl font-bold tabular-nums">{thd.toFixed(1)}%</p>
            </div>
            <div className={`rounded-xl bg-gradient-to-br p-4 text-center text-white shadow-md ${bad ? 'from-red-500 to-red-700' : 'from-green-500 to-green-700'}`}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/80">
                {t('learn.lessons.harmonics.crest')}
              </p>
              <p className="mt-1 font-mono text-2xl font-bold tabular-nums">{crestFactor.toFixed(2)}</p>
            </div>
          </div>

          <div className={`mt-4 rounded-xl border p-3 text-sm ${
            bad
              ? 'border-red-300 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200'
              : 'border-green-300 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950/40 dark:text-green-200'
          }`}>
            <p className="font-semibold">
              {bad ? t('learn.lessons.harmonics.bad') : t('learn.lessons.harmonics.good')}
            </p>
            <p className="mt-1 text-xs opacity-90">
              {t('learn.lessons.harmonics.explain')}
            </p>
          </div>
        </Playground>
      </LessonCard>

      <LessonCard>
        <SectionHeader title={t('learn.keyPoints')} />
        <KeyPoints
          points={[
            t('learn.lessons.harmonics.point1'),
            t('learn.lessons.harmonics.point2'),
            t('learn.lessons.harmonics.point3'),
          ]}
        />
      </LessonCard>
    </div>
  )
}
