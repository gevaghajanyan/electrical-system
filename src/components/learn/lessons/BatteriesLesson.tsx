'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LessonCard, SectionHeader, Prose, KeyPoints, Playground } from '../shared'

type Config = 'single' | 'series' | 'parallel'

export function BatteriesLesson() {
  const { t } = useTranslation()
  const [config, setConfig] = useState<Config>('series')
  const cellV = 1.5
  const cellMah = 2000

  const totals = (() => {
    switch (config) {
      case 'single':   return { V: cellV,      mAh: cellMah,     runtime: 20 }
      case 'series':   return { V: cellV * 3,  mAh: cellMah,     runtime: 20 }
      case 'parallel': return { V: cellV,      mAh: cellMah * 3, runtime: 60 }
    }
  })()

  return (
    <div className="space-y-6">
      <LessonCard>
        <SectionHeader title={t('learn.lessons.batteries.title')} />
        <Prose>
          <p>{t('learn.lessons.batteries.intro')}</p>
        </Prose>
      </LessonCard>

      <LessonCard>
        <SectionHeader title={t('learn.tryYourself')} />
        <Playground>
          <div className="grid grid-cols-3 gap-1 rounded-lg border border-zinc-200 p-1 dark:border-zinc-700">
            {(['single', 'series', 'parallel'] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setConfig(c)}
                className={`min-h-[40px] rounded-md px-2 py-1.5 text-sm font-medium transition-colors touch-manipulation ${
                  config === c
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                }`}
              >
                {t(`learn.lessons.batteries.configs.${c}`)}
              </button>
            ))}
          </div>

          {/* Diagram */}
          <div className="mt-4 flex justify-center">
            <svg viewBox="0 0 400 200" className="h-auto w-full max-w-md">
              {config === 'single' && <Cell x={175} y={70} label="1.5V" />}
              {config === 'series' && (
                <g>
                  <Cell x={70} y={70} label="1.5V" />
                  <Cell x={170} y={70} label="1.5V" />
                  <Cell x={270} y={70} label="1.5V" />
                  <line x1="120" y1="100" x2="170" y2="100" stroke="#71717a" strokeWidth="3" />
                  <line x1="220" y1="100" x2="270" y2="100" stroke="#71717a" strokeWidth="3" />
                </g>
              )}
              {config === 'parallel' && (
                <g>
                  <Cell x={170} y={20} label="1.5V" />
                  <Cell x={170} y={80} label="1.5V" />
                  <Cell x={170} y={140} label="1.5V" />
                  <line x1="150" y1="50" x2="150" y2="170" stroke="#71717a" strokeWidth="3" />
                  <line x1="290" y1="50" x2="290" y2="170" stroke="#71717a" strokeWidth="3" />
                </g>
              )}
            </svg>
          </div>

          {/* Result */}
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <ResultTile label={t('learn.lessons.batteries.voltage')}  value={`${totals.V.toFixed(1)}V`}   tone="red" />
            <ResultTile label={t('learn.lessons.batteries.capacity')} value={`${totals.mAh}mAh`}         tone="blue" />
            <ResultTile label={t('learn.lessons.batteries.runtime')}  value={`~${totals.runtime}h`}     tone="green" />
          </div>
        </Playground>
      </LessonCard>

      <LessonCard>
        <SectionHeader title={t('learn.keyPoints')} />
        <KeyPoints
          points={[
            t('learn.lessons.batteries.point1'),
            t('learn.lessons.batteries.point2'),
            t('learn.lessons.batteries.point3'),
          ]}
        />
      </LessonCard>
    </div>
  )
}

function Cell({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect width="50" height="60" rx="4" fill="#1b2740" />
      <rect x="-4" y="6" width="4" height="18" fill="#a1a1aa" />
      <rect x="15" y="-6" width="20" height="8" rx="1" fill="#f2bc2e" />
      <text x="25" y="35" textAnchor="middle" fontSize="10" fontWeight="800" fill="#f2bc2e">{label}</text>
    </g>
  )
}

function ResultTile({ label, value, tone }: { label: string; value: string; tone: 'red' | 'blue' | 'green' }) {
  const bg = tone === 'red' ? 'from-red-500 to-red-700' : tone === 'blue' ? 'from-blue-500 to-blue-700' : 'from-green-500 to-green-700'
  return (
    <div className={`rounded-2xl bg-gradient-to-br ${bg} p-4 text-center text-white shadow-md`}>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-white/80">{label}</p>
      <p className="mt-1 font-mono text-xl font-bold tabular-nums">{value}</p>
    </div>
  )
}
