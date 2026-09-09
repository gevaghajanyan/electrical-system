'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LessonCard, SectionHeader, Prose, KeyPoints, Playground } from '../shared'

type Region = 'eu' | 'us' | 'oldUk'

interface Row { id: string; color: string }

const REGIONS: Record<Region, { L1: Row; L2: Row; L3: Row; N: Row; PE: Row }> = {
  eu: {
    L1: { id: 'brown',      color: '#8b4513' },
    L2: { id: 'black',      color: '#111111' },
    L3: { id: 'grey',       color: '#71717a' },
    N:  { id: 'blue',       color: '#2563eb' },
    PE: { id: 'greenYellow',color: 'url(#gy)' },
  },
  us: {
    L1: { id: 'black',      color: '#111111' },
    L2: { id: 'red',        color: '#dc2626' },
    L3: { id: 'blue',       color: '#2563eb' },
    N:  { id: 'white',      color: '#e5e7eb' },
    PE: { id: 'green',      color: '#16a34a' },
  },
  oldUk: {
    L1: { id: 'red',        color: '#dc2626' },
    L2: { id: 'yellow',     color: '#facc15' },
    L3: { id: 'blue',       color: '#2563eb' },
    N:  { id: 'black',      color: '#111111' },
    PE: { id: 'greenYellow',color: 'url(#gy)' },
  },
}

export function WireColorsLesson() {
  const { t } = useTranslation()
  const [region, setRegion] = useState<Region>('eu')
  const scheme = REGIONS[region]

  return (
    <div className="space-y-6">
      <LessonCard>
        <SectionHeader title={t('learn.lessons.wire_colors.title')} />
        <Prose>
          <p>{t('learn.lessons.wire_colors.intro')}</p>
        </Prose>
      </LessonCard>

      <LessonCard>
        <SectionHeader title={t('learn.tryYourself')} />
        <Playground>
          <div className="grid grid-cols-3 gap-1 rounded-lg border border-zinc-200 p-1 dark:border-zinc-700">
            {(['eu', 'us', 'oldUk'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRegion(r)}
                className={`min-h-[40px] rounded-md px-1 py-1.5 text-[11px] font-medium leading-tight transition-colors touch-manipulation sm:px-2 sm:text-sm ${
                  region === r
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                }`}
              >
                {t(`learn.lessons.wire_colors.regions.${r}`)}
              </button>
            ))}
          </div>

          {/* SVG wire cross-section */}
          <div className="mt-4 rounded-xl bg-white p-4 shadow-inner dark:bg-zinc-900">
            <svg viewBox="0 0 320 200" className="h-auto w-full">
              <defs>
                <linearGradient id="gy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#16a34a" />
                  <stop offset="50%" stopColor="#16a34a" />
                  <stop offset="50%" stopColor="#facc15" />
                  <stop offset="100%" stopColor="#facc15" />
                </linearGradient>
              </defs>
              {(['L1', 'L2', 'L3', 'N', 'PE'] as const).map((k, i) => {
                const row = scheme[k]
                const y = 22 + i * 34
                return (
                  <g key={k}>
                    <circle cx={40} cy={y} r={12} fill={row.color} stroke="#1b2740" strokeWidth={1.2} />
                    <text x={64} y={y - 3} fontSize={12} fontWeight={700} fill="#1b2740" fontFamily="sans-serif">{k}</text>
                    <text x={64} y={y + 11} fontSize={10} fill="#71717a" fontFamily="sans-serif">
                      {t(`learn.lessons.wire_colors.colors.${row.id}`)}
                    </text>
                    <text x={200} y={y + 3} fontSize={10} fill="#374151" fontFamily="sans-serif">
                      {t(`learn.lessons.wire_colors.role.${k}`)}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>

          <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
            {t(`learn.lessons.wire_colors.notes.${region}`)}
          </p>
        </Playground>
      </LessonCard>

      <LessonCard>
        <SectionHeader title={t('learn.keyPoints')} />
        <KeyPoints
          points={[
            t('learn.lessons.wire_colors.point1'),
            t('learn.lessons.wire_colors.point2'),
            t('learn.lessons.wire_colors.point3'),
          ]}
        />
      </LessonCard>
    </div>
  )
}
