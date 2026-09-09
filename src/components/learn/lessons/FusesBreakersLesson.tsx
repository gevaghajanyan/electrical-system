'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LessonCard, SectionHeader, Prose, KeyPoints, Playground, LabelSlider } from '../shared'

/**
 * Interactive fuse / MCB protection lesson — the user chooses the device
 * rating, then slides the actual load current up and down. Below the trip
 * threshold everything is fine; above it, the fuse "blows" or the MCB "trips",
 * visualised on an animated SVG.
 */
export function FusesBreakersLesson() {
  const { t } = useTranslation()
  const [rating, setRating] = useState<10 | 16 | 20 | 25 | 32>(16)
  const [current, setCurrent] = useState(10)
  const [device, setDevice] = useState<'fuse' | 'mcb'>('mcb')

  // Fuses blow gradually above rating; MCBs trip instantly at ~1.13-1.45× In
  // for the thermal, or 5-10× In (Curve C) for the magnetic. We simplify to
  // a soft threshold at rating for teaching purposes.
  const tripAt = rating * 1.13
  const tripped = current > tripAt
  const dangerZone = current > rating

  return (
    <div className="space-y-6">
      <LessonCard>
        <SectionHeader title={t('learn.lessons.fuses.title')} />
        <Prose>
          <p>{t('learn.lessons.fuses.intro')}</p>
        </Prose>
      </LessonCard>

      <LessonCard>
        <SectionHeader title={t('learn.tryYourself')} />
        <Playground>
          <div className="grid grid-cols-2 gap-1 rounded-lg border border-zinc-200 p-1 dark:border-zinc-700">
            {(['mcb', 'fuse'] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDevice(d)}
                className={`min-h-[40px] rounded-md px-2 py-1.5 text-sm font-medium transition-colors touch-manipulation ${
                  device === d
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                }`}
              >
                {t(`learn.lessons.fuses.devices.${d}`)}
              </button>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {t('learn.lessons.fuses.rating')}
              </label>
              <div className="grid grid-cols-5 gap-1 sm:gap-1.5">
                {([10, 16, 20, 25, 32] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRating(r)}
                    className={`rounded-md px-1 py-1.5 text-xs font-semibold tabular-nums transition-colors touch-manipulation min-h-[40px] ${
                      rating === r
                        ? 'bg-zinc-900 text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-900'
                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {r}A
                  </button>
                ))}
              </div>
            </div>
            <LabelSlider
              label={t('learn.lessons.fuses.load')}
              unit="A"
              value={current}
              min={0}
              max={50}
              step={0.5}
              onChange={setCurrent}
            />
          </div>

          {/* Visual — either an intact fuse / breaker or a "blown" one */}
          <div className="mt-6 flex justify-center">
            <svg viewBox="0 0 400 180" className="h-auto w-full max-w-lg">
              {/* Wires */}
              <line x1="0" y1="90" x2="120" y2="90" stroke="#a1a1aa" strokeWidth="4" />
              <line x1="280" y1="90" x2="400" y2="90" stroke="#a1a1aa" strokeWidth="4" />

              {/* Device body */}
              {device === 'fuse' ? (
                <g>
                  <rect x="120" y="70" width="160" height="40" rx="6" fill="#f4f4f5" stroke="#71717a" strokeWidth="1" />
                  {/* Filament */}
                  {tripped ? (
                    <>
                      <line x1="128" y1="90" x2="180" y2="90" stroke="#78350f" strokeWidth="2" />
                      <line x1="220" y1="90" x2="272" y2="90" stroke="#78350f" strokeWidth="2" />
                      <text x="200" y="94" textAnchor="middle" fontSize="20" fill="#ef4444">✕</text>
                      <circle cx="200" cy="90" r="20" fill="#78350f" opacity="0.15" />
                    </>
                  ) : (
                    <line x1="128" y1="90" x2="272" y2="90" stroke={dangerZone ? '#ef4444' : '#78350f'} strokeWidth={dangerZone ? 3 : 2}>
                      {dangerZone && <animate attributeName="opacity" values="1;0.5;1" dur="0.3s" repeatCount="indefinite" />}
                    </line>
                  )}
                  <text x="200" y="60" textAnchor="middle" fontSize="12" fontWeight="700" fill="#374151">
                    {rating}A {t('learn.lessons.fuses.fuseLabel')}
                  </text>
                </g>
              ) : (
                <g>
                  <rect x="140" y="40" width="120" height="100" rx="8" fill="#1d4ed8" stroke="#0f172a" strokeWidth="1" />
                  <rect x="140" y="40" width="120" height="14" rx="6" fill="rgba(0,0,0,0.3)" />
                  <text x="200" y="52" textAnchor="middle" fontSize="10" fontWeight="800" fill="#ffffff">MCB C{rating}</text>
                  {/* Toggle handle */}
                  <rect
                    x="188" y={tripped ? 100 : 70}
                    width="24" height="30" rx="3"
                    fill={tripped ? '#ef4444' : '#f8fafc'}
                    stroke="#0f172a" strokeWidth="1"
                  />
                  <text x="200" y={tripped ? 120 : 90} textAnchor="middle" fontSize="12" fontWeight="800" fill={tripped ? '#ffffff' : '#1d4ed8'}>
                    {tripped ? '0' : 'I'}
                  </text>
                </g>
              )}

              {/* Current label */}
              <text x="60" y="82" fontSize="11" fontWeight="700" fill="#71717a">
                {t('learn.lessons.fuses.current')}: {current.toFixed(1)}A
              </text>
              <text x="340" y="82" textAnchor="end" fontSize="11" fontWeight="700" fill="#71717a">
                {tripped ? t('learn.lessons.fuses.noPower') : t('learn.lessons.fuses.power')}
              </text>
            </svg>
          </div>

          {/* Status pill */}
          <div className={`mt-4 rounded-xl border p-3 text-sm font-semibold ${
            tripped
              ? 'border-red-300 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200'
              : dangerZone
                ? 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200'
                : 'border-green-300 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950/40 dark:text-green-200'
          }`}>
            {tripped
              ? t(device === 'fuse' ? 'learn.lessons.fuses.blown' : 'learn.lessons.fuses.tripped', { rating })
              : dangerZone
                ? t('learn.lessons.fuses.overloading', { rating })
                : t('learn.lessons.fuses.safe', { rating })}
          </div>
        </Playground>
      </LessonCard>

      <LessonCard>
        <SectionHeader title={t('learn.keyPoints')} />
        <KeyPoints
          points={[
            t('learn.lessons.fuses.point1'),
            t('learn.lessons.fuses.point2'),
            t('learn.lessons.fuses.point3'),
          ]}
        />
      </LessonCard>
    </div>
  )
}
