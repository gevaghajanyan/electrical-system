'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LessonCard, SectionHeader, Prose, KeyPoints, Playground, LabelSlider } from '../shared'

export function RcTimeConstantLesson() {
  const { t } = useTranslation()
  const [Rk, setRk] = useState(10)   // kΩ
  const [Cuf, setCuf] = useState(100) // µF
  const [tSec, setTSec] = useState(0)
  const rafRef = useRef<number | null>(null)

  const R = Rk * 1e3       // Ω
  const C = Cuf * 1e-6     // F
  const tau = R * C        // seconds

  useEffect(() => {
    let start = performance.now()
    function tick(now: number) {
      const dt = (now - start) / 1000
      setTSec(dt % (tau * 6))
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [tau])

  const chargePct = 100 * (1 - Math.exp(-tSec / tau))

  return (
    <div className="space-y-6">
      <LessonCard>
        <SectionHeader title={t('learn.lessons.rc_time_constant.title')} />
        <Prose>
          <p>{t('learn.lessons.rc_time_constant.intro')}</p>
        </Prose>
      </LessonCard>

      <LessonCard>
        <SectionHeader title={t('learn.tryYourself')} />
        <Playground>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <LabelSlider label={t('learn.lessons.rc_time_constant.R')} unit="kΩ" value={Rk}  min={1} max={100} step={1} onChange={setRk} />
            <LabelSlider label={t('learn.lessons.rc_time_constant.C')} unit="µF" value={Cuf} min={1} max={2000} step={1} onChange={setCuf} />
          </div>

          {/* Charging curve */}
          <div className="mt-4 rounded-xl bg-white p-4 shadow-inner dark:bg-zinc-900">
            <svg viewBox="0 0 480 200" className="h-auto w-full">
              {/* Axes */}
              <line x1={30} y1={170} x2={470} y2={170} stroke="#a1a1aa" />
              <line x1={30} y1={20}  x2={30}  y2={170} stroke="#a1a1aa" />
              {/* 63% guide line */}
              <line x1={30} y1={170 - 0.63 * 140} x2={470} y2={170 - 0.63 * 140} stroke="#e5e7eb" strokeDasharray="3 3" />
              <text x={35} y={170 - 0.63 * 140 - 3} fontSize={9} fill="#a1a1aa">63% (1τ)</text>
              {/* Curve */}
              <path
                d={(() => {
                  const pts: string[] = []
                  const totalT = tau * 6
                  for (let x = 0; x <= 440; x += 4) {
                    const t = (x / 440) * totalT
                    const y = 1 - Math.exp(-t / tau)
                    pts.push(`${x === 0 ? 'M' : 'L'} ${30 + x} ${170 - y * 140}`)
                  }
                  return pts.join(' ')
                })()}
                stroke="#3b82f6" strokeWidth={2.5} fill="none"
              />
              {/* Current time dot */}
              <circle cx={30 + (tSec / (tau * 6)) * 440} cy={170 - (chargePct / 100) * 140} r={5} fill="#f59e0b" />
              {/* Labels */}
              <text x={475} y={170} textAnchor="end" fontSize={10} fill="#71717a">6τ</text>
              <text x={12}  y={30}  fontSize={10} fill="#71717a">V</text>
            </svg>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Tile label="τ = R × C"                         value={tau < 1 ? `${(tau * 1000).toFixed(1)} ms` : `${tau.toFixed(2)} s`} tone="blue" />
            <Tile label={t('learn.lessons.rc_time_constant.charged')} value={`${chargePct.toFixed(1)} %`}          tone="amber" />
            <Tile label={t('learn.lessons.rc_time_constant.t5')}      value={`${(tau * 5 < 1 ? tau * 5 * 1000 : tau * 5).toFixed(1)} ${tau * 5 < 1 ? 'ms' : 's'}`} tone="green" />
          </div>
        </Playground>
      </LessonCard>

      <LessonCard>
        <SectionHeader title={t('learn.keyPoints')} />
        <KeyPoints
          points={[
            t('learn.lessons.rc_time_constant.point1'),
            t('learn.lessons.rc_time_constant.point2'),
            t('learn.lessons.rc_time_constant.point3'),
          ]}
        />
      </LessonCard>
    </div>
  )
}

function Tile({ label, value, tone }: { label: string; value: string; tone: 'blue' | 'amber' | 'green' }) {
  const bg = tone === 'blue' ? 'from-blue-500 to-blue-700' : tone === 'amber' ? 'from-amber-500 to-amber-700' : 'from-green-500 to-green-700'
  return (
    <div className={`rounded-2xl bg-gradient-to-br ${bg} p-4 text-center text-white shadow-md`}>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-white/80">{label}</p>
      <p className="mt-1 font-mono text-xl font-bold tabular-nums">{value}</p>
    </div>
  )
}
