'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LessonCard, SectionHeader, Prose, KeyPoints, Playground, LabelSlider } from '../shared'

export function AcDcLesson() {
  const { t } = useTranslation()
  const [frequency, setFrequency] = useState(50)   // Hz
  const [amplitude, setAmplitude] = useState(230)  // Vpeak
  const [phase, setPhase] = useState(0)
  const rafRef = useRef<number | null>(null)

  // Rolling phase — visual only; actual waveform "sweeps" with time.
  useEffect(() => {
    let last = performance.now()
    function tick(now: number) {
      const dt = (now - last) / 1000
      last = now
      setPhase((p) => (p + dt * frequency * 0.5) % (2 * Math.PI))
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [frequency])

  // Build the sine wave path.
  const W = 480
  const H = 180
  const centerY = H / 2
  const pxPerCycle = W / (frequency / 10)
  const points: string[] = []
  for (let x = 0; x <= W; x += 4) {
    const rad = (x / pxPerCycle) * 2 * Math.PI + phase
    const y = centerY - Math.sin(rad) * (amplitude / 400) * (H / 2 - 10)
    points.push(`${x === 0 ? 'M' : 'L'} ${x} ${y.toFixed(1)}`)
  }
  const acPath = points.join(' ')

  return (
    <div className="space-y-6">
      <LessonCard>
        <SectionHeader title={t('learn.lessons.ac_vs_dc.title')} />
        <Prose>
          <p>{t('learn.lessons.ac_vs_dc.intro')}</p>
        </Prose>
      </LessonCard>

      <LessonCard>
        <SectionHeader title={t('learn.tryYourself')} />
        <Playground>
          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <LabelSlider
              label={t('learn.lessons.ac_vs_dc.frequency')}
              unit="Hz"
              value={frequency}
              min={5}
              max={100}
              onChange={setFrequency}
            />
            <LabelSlider
              label={t('learn.lessons.ac_vs_dc.amplitude')}
              unit="V"
              value={amplitude}
              min={12}
              max={400}
              onChange={setAmplitude}
            />
          </div>

          {/* AC waveform */}
          <div className="mb-3">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">AC — Alternating</p>
            <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
              {/* Grid */}
              {[0.25, 0.5, 0.75].map((f) => (
                <line key={f} x1={0} x2={W} y1={H * f} y2={H * f} stroke="#e4e4e7" strokeWidth={0.5} strokeDasharray="2 4" />
              ))}
              <line x1={0} x2={W} y1={centerY} y2={centerY} stroke="#a1a1aa" strokeWidth={1} />
              {/* Wave */}
              <path d={acPath} stroke="#ef4444" strokeWidth={2.5} fill="none" strokeLinecap="round" />
              <text x={8} y={16} fontSize="10" fill="#71717a" fontFamily="monospace">+{amplitude}V</text>
              <text x={8} y={H - 8} fontSize="10" fill="#71717a" fontFamily="monospace">−{amplitude}V</text>
            </svg>
          </div>

          {/* DC — flat line */}
          <div>
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">DC — Direct</p>
            <svg viewBox={`0 0 ${W} 80`} className="h-auto w-full">
              <line x1={0} x2={W} y1={40} y2={40} stroke="#a1a1aa" strokeWidth={1} />
              <line
                x1={0}
                x2={W}
                y1={40 - (amplitude / 400) * 30}
                y2={40 - (amplitude / 400) * 30}
                stroke="#22c55e"
                strokeWidth={2.5}
                strokeLinecap="round"
              />
              <text x={8} y={16} fontSize="10" fill="#71717a" fontFamily="monospace">+{amplitude}V constant</text>
            </svg>
          </div>
        </Playground>
      </LessonCard>

      <LessonCard>
        <SectionHeader title={t('learn.keyPoints')} />
        <KeyPoints
          points={[
            t('learn.lessons.ac_vs_dc.point1'),
            t('learn.lessons.ac_vs_dc.point2'),
            t('learn.lessons.ac_vs_dc.point3'),
          ]}
        />
      </LessonCard>
    </div>
  )
}
