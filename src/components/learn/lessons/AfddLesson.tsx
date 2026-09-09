'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LessonCard, SectionHeader, Prose, KeyPoints, Playground } from '../shared'

type Scenario = 'clean' | 'series_arc' | 'parallel_arc' | 'harmonics'

export function AfddLesson() {
  const { t } = useTranslation()
  const [scenario, setScenario] = useState<Scenario>('clean')

  return (
    <div className="space-y-6">
      <LessonCard>
        <SectionHeader title={t('learn.lessons.afdd.title')} />
        <Prose>
          <p>{t('learn.lessons.afdd.intro')}</p>
        </Prose>
      </LessonCard>

      <LessonCard>
        <SectionHeader title={t('learn.tryYourself')} />
        <Playground>
          <div className="grid grid-cols-2 gap-1 rounded-lg border border-zinc-200 p-1 dark:border-zinc-700 sm:grid-cols-4">
            {(['clean', 'series_arc', 'parallel_arc', 'harmonics'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setScenario(s)}
                className={`min-h-[40px] rounded-md px-1 py-1.5 text-[11px] font-semibold leading-tight transition-colors touch-manipulation sm:px-2 sm:text-xs ${
                  scenario === s
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                }`}
              >
                {t(`learn.lessons.afdd.scenarios.${s}`)}
              </button>
            ))}
          </div>

          {/* Waveform */}
          <div className="mt-4 rounded-xl bg-white p-4 shadow-inner dark:bg-zinc-900">
            <svg viewBox="0 0 480 160" className="h-auto w-full">
              <line x1={0} x2={480} y1={80} y2={80} stroke="#e5e7eb" />
              <path d={waveFor(scenario)} stroke={colorFor(scenario)} strokeWidth={2} fill="none" strokeLinecap="round" />
              <text x={10} y={16} fontSize={10} fill="#71717a">Current waveform</text>
            </svg>
          </div>

          <div className={`mt-3 rounded-xl border p-3 text-sm font-semibold ${
            scenario === 'clean' || scenario === 'harmonics'
              ? 'border-green-300 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950/40 dark:text-green-200'
              : 'border-red-300 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200'
          }`}>
            {t(`learn.lessons.afdd.status.${scenario}`)}
          </div>

          <p className="mt-3 text-xs text-zinc-600 dark:text-zinc-300">
            {t(`learn.lessons.afdd.explain.${scenario}`)}
          </p>
        </Playground>
      </LessonCard>

      <LessonCard>
        <SectionHeader title={t('learn.keyPoints')} />
        <KeyPoints
          points={[
            t('learn.lessons.afdd.point1'),
            t('learn.lessons.afdd.point2'),
            t('learn.lessons.afdd.point3'),
          ]}
        />
      </LessonCard>
    </div>
  )
}

function waveFor(s: Scenario): string {
  const pts: string[] = []
  for (let x = 0; x <= 480; x += 4) {
    const rad = (x / 480) * 4 * Math.PI
    let y = Math.sin(rad) * 40
    if (s === 'series_arc') {
      // random pulses / dropouts near zero crossing
      const noise = Math.random() > 0.85 ? (Math.random() - 0.5) * 30 : 0
      if (Math.abs(y) < 5) y = 0
      y += noise
    } else if (s === 'parallel_arc') {
      // High-current spikes on top of waveform
      const spike = Math.random() > 0.92 ? (Math.random() * 30) * (y >= 0 ? 1 : -1) : 0
      y += spike
    } else if (s === 'harmonics') {
      y = Math.sin(rad) * 30 + Math.sin(3 * rad) * 8 + Math.sin(5 * rad) * 4
    }
    pts.push(`${x === 0 ? 'M' : 'L'} ${x} ${(80 - y).toFixed(1)}`)
  }
  return pts.join(' ')
}
function colorFor(s: Scenario): string {
  if (s === 'clean') return '#059669'
  if (s === 'harmonics') return '#f59e0b'
  return '#dc2626'
}
