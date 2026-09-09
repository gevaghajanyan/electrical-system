'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LessonCard, SectionHeader, Prose, KeyPoints, Playground, LabelSlider } from '../shared'

export function OhmsLawLesson() {
  const { t } = useTranslation()
  const [V, setV] = useState(12)
  const [R, setR] = useState(6)
  const I = V / R
  const P = V * I

  // Bar sizes for a comparison chart (each shown relative to a fixed max).
  const vBar = Math.min(1, V / 24)
  const rBar = Math.min(1, R / 24)
  const iBar = Math.min(1, I / 4)
  const pBar = Math.min(1, P / 48)

  return (
    <div className="space-y-6">
      <LessonCard>
        <SectionHeader title={t('learn.lessons.ohms_law.title')} />
        <Prose>
          <p>{t('learn.lessons.ohms_law.intro')}</p>
        </Prose>
      </LessonCard>

      <LessonCard>
        <SectionHeader title={t('learn.tryYourself')} />
        <Playground>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <LabelSlider
                label={t('learn.lessons.ohms_law.voltage')}
                unit="V"
                value={V}
                min={0}
                max={24}
                onChange={setV}
              />
              <LabelSlider
                label={t('learn.lessons.ohms_law.resistance')}
                unit="Ω"
                value={R}
                min={1}
                max={24}
                onChange={setR}
              />
            </div>

            {/* Live equation */}
            <div className="flex flex-col justify-center gap-3 rounded-xl bg-zinc-900 p-6 text-center text-white shadow-inner">
              <div className="font-mono text-2xl font-bold">
                <span className="text-red-400">V</span> = <span className="text-amber-400">I</span> × <span className="text-blue-400">R</span>
              </div>
              <div className="font-mono text-lg tabular-nums">
                <span className="text-red-400">{V.toFixed(1)}</span> = <span className="text-amber-400">{I.toFixed(2)}</span> × <span className="text-blue-400">{R}</span>
              </div>
              <div className="mt-2 rounded-lg bg-white/10 p-2 font-mono text-sm">
                P = {P.toFixed(1)} W
              </div>
            </div>
          </div>

          {/* Bar chart of relative magnitudes */}
          <div className="mt-6 space-y-2">
            {[
              { label: 'V', color: 'bg-red-500',   value: V, unit: 'V', frac: vBar },
              { label: 'I', color: 'bg-amber-500', value: I.toFixed(2), unit: 'A', frac: iBar },
              { label: 'R', color: 'bg-blue-500',  value: R, unit: 'Ω', frac: rBar },
              { label: 'P', color: 'bg-green-500', value: P.toFixed(1), unit: 'W', frac: pBar },
            ].map((row) => (
              <div key={row.label} className="flex items-center gap-3">
                <span className="w-6 font-mono text-sm font-bold text-zinc-600 dark:text-zinc-300">{row.label}</span>
                <div className="relative h-4 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className={`h-full ${row.color} transition-all duration-200`}
                    style={{ width: `${row.frac * 100}%` }}
                  />
                </div>
                <span className="w-20 text-right font-mono text-sm tabular-nums text-zinc-700 dark:text-zinc-300">
                  {row.value} {row.unit}
                </span>
              </div>
            ))}
          </div>
        </Playground>
      </LessonCard>

      <LessonCard>
        <SectionHeader title={t('learn.keyPoints')} />
        <KeyPoints
          points={[
            t('learn.lessons.ohms_law.point1'),
            t('learn.lessons.ohms_law.point2'),
            t('learn.lessons.ohms_law.point3'),
          ]}
        />
      </LessonCard>
    </div>
  )
}
