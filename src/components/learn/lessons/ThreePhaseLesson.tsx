'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LessonCard, SectionHeader, Prose, KeyPoints, Playground, LabelSlider } from '../shared'

/**
 * Three-phase 120°-apart sine waves — animated. Users watch how the L1/L2/L3
 * peaks cascade and see the resulting neutral current sum (always zero if
 * phases balanced).
 */
export function ThreePhaseLesson() {
  const { t } = useTranslation()
  const [amplitude, setAmplitude] = useState(230)
  const [imbalance, setImbalance] = useState(1)  // 0..1  1 = perfectly balanced
  const [phase, setPhase] = useState(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    let last = performance.now()
    function tick(now: number) {
      const dt = (now - last) / 1000
      last = now
      setPhase((p) => (p + dt * 1.5) % (2 * Math.PI))
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [])

  const W = 480
  const H = 180
  const centerY = H / 2

  function wave(offsetDeg: number, ampScale: number, color: string) {
    const offset = (offsetDeg * Math.PI) / 180
    const pxPerCycle = W / 2
    const pts: string[] = []
    for (let x = 0; x <= W; x += 4) {
      const rad = (x / pxPerCycle) * 2 * Math.PI + phase + offset
      const y = centerY - Math.sin(rad) * (amplitude * ampScale / 400) * (H / 2 - 10)
      pts.push(`${x === 0 ? 'M' : 'L'} ${x} ${y.toFixed(1)}`)
    }
    return { d: pts.join(' '), color }
  }

  // Imbalance affects L2 and L3 amplitudes
  const L1 = wave(0,    1,               '#ef4444')  // red — L1
  const L2 = wave(-120, imbalance,       '#f59e0b')  // amber — L2
  const L3 = wave(-240, imbalance * 0.9, '#3b82f6')  // blue — L3

  // Neutral = sum of the three at the current instant (single point trace)
  const now = phase
  const l1 = Math.sin(now)
  const l2 = Math.sin(now - 2 * Math.PI / 3) * imbalance
  const l3 = Math.sin(now - 4 * Math.PI / 3) * imbalance * 0.9
  const neutralAmp = Math.abs(l1 + l2 + l3) * amplitude
  const balanced = neutralAmp < 5

  return (
    <div className="space-y-6">
      <LessonCard>
        <SectionHeader title={t('learn.lessons.three_phase.title')} />
        <Prose>
          <p>{t('learn.lessons.three_phase.intro')}</p>
        </Prose>
      </LessonCard>

      <LessonCard>
        <SectionHeader title={t('learn.tryYourself')} />
        <Playground>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <LabelSlider
              label={t('learn.lessons.three_phase.amplitude')}
              unit="V"
              value={amplitude}
              min={100}
              max={400}
              onChange={setAmplitude}
            />
            <LabelSlider
              label={t('learn.lessons.three_phase.balance')}
              value={Math.round(imbalance * 100)}
              unit="%"
              min={30}
              max={100}
              onChange={(v) => setImbalance(v / 100)}
            />
          </div>

          <svg viewBox={`0 0 ${W} ${H}`} className="mt-4 h-auto w-full">
            {/* Axes */}
            <line x1={0} x2={W} y1={centerY} y2={centerY} stroke="#a1a1aa" strokeWidth={1} />
            {/* L1 L2 L3 */}
            <path d={L1.d} stroke={L1.color} strokeWidth={2.4} fill="none" strokeLinecap="round" />
            <path d={L2.d} stroke={L2.color} strokeWidth={2.4} fill="none" strokeLinecap="round" />
            <path d={L3.d} stroke={L3.color} strokeWidth={2.4} fill="none" strokeLinecap="round" />
          </svg>

          {/* Legend */}
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-red-500" /> L1</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> L2</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> L3</span>
          </div>

          <div className={`mt-4 rounded-xl border p-3 text-sm font-semibold ${
            balanced
              ? 'border-green-300 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950/40 dark:text-green-200'
              : 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200'
          }`}>
            {balanced
              ? t('learn.lessons.three_phase.balanced')
              : t('learn.lessons.three_phase.unbalanced', { current: neutralAmp.toFixed(0) })}
          </div>
        </Playground>
      </LessonCard>

      <LessonCard>
        <SectionHeader title={t('learn.keyPoints')} />
        <KeyPoints
          points={[
            t('learn.lessons.three_phase.point1'),
            t('learn.lessons.three_phase.point2'),
            t('learn.lessons.three_phase.point3'),
          ]}
        />
      </LessonCard>
    </div>
  )
}
