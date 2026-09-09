'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LessonCard, SectionHeader, Prose, KeyPoints, Playground } from '../shared'

type Kind = 'motor' | 'mcb' | 'transformer'

interface Marker { x: number; y: number; key: string }

const PLATES: Record<Kind, { markers: Marker[] }> = {
  motor: {
    markers: [
      { x: 20, y: 22, key: 'motor.power' },
      { x: 55, y: 22, key: 'motor.rpm' },
      { x: 20, y: 40, key: 'motor.voltage' },
      { x: 55, y: 40, key: 'motor.current' },
      { x: 20, y: 58, key: 'motor.pf' },
      { x: 55, y: 58, key: 'motor.freq' },
      { x: 20, y: 76, key: 'motor.class' },
      { x: 55, y: 76, key: 'motor.ip' },
    ],
  },
  mcb: {
    markers: [
      { x: 20, y: 22, key: 'mcb.rating' },
      { x: 55, y: 22, key: 'mcb.curve' },
      { x: 20, y: 40, key: 'mcb.icu' },
      { x: 55, y: 40, key: 'mcb.voltage' },
      { x: 20, y: 58, key: 'mcb.poles' },
      { x: 55, y: 58, key: 'mcb.standard' },
    ],
  },
  transformer: {
    markers: [
      { x: 20, y: 22, key: 'transformer.kva' },
      { x: 55, y: 22, key: 'transformer.voltage' },
      { x: 20, y: 40, key: 'transformer.current' },
      { x: 55, y: 40, key: 'transformer.uk' },
      { x: 20, y: 58, key: 'transformer.vector' },
      { x: 55, y: 58, key: 'transformer.cooling' },
    ],
  },
}

export function NameplateLesson() {
  const { t } = useTranslation()
  const [kind, setKind] = useState<Kind>('motor')
  const [active, setActive] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <LessonCard>
        <SectionHeader title={t('learn.lessons.nameplate.title')} />
        <Prose>
          <p>{t('learn.lessons.nameplate.intro')}</p>
        </Prose>
      </LessonCard>

      <LessonCard>
        <SectionHeader title={t('learn.tryYourself')} />
        <Playground>
          <div className="grid grid-cols-3 gap-1 rounded-lg border border-zinc-200 p-1 dark:border-zinc-700">
            {(['motor', 'mcb', 'transformer'] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => { setKind(k); setActive(null) }}
                className={`min-h-[40px] rounded-md px-1 py-1.5 text-[11px] font-semibold leading-tight transition-colors touch-manipulation sm:px-2 sm:text-sm ${
                  kind === k ? 'bg-blue-600 text-white shadow-sm' : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                }`}
              >
                {t(`learn.lessons.nameplate.kinds.${k}`)}
              </button>
            ))}
          </div>

          {/* Nameplate SVG */}
          <div className="mt-4 rounded-xl bg-zinc-100 p-4 shadow-inner dark:bg-zinc-800">
            <svg viewBox="0 0 100 100" className="h-auto w-full max-w-md mx-auto block" preserveAspectRatio="xMidYMid meet">
              {/* Plate body */}
              <rect x={4} y={4} width={92} height={92} rx={3} fill="#d4d4d8" stroke="#52525b" strokeWidth={0.4} />
              {/* Rivets */}
              <circle cx={8}  cy={8}  r={1.4} fill="#71717a" />
              <circle cx={92} cy={8}  r={1.4} fill="#71717a" />
              <circle cx={8}  cy={92} r={1.4} fill="#71717a" />
              <circle cx={92} cy={92} r={1.4} fill="#71717a" />

              {/* Field markers */}
              {PLATES[kind].markers.map((m) => (
                <g
                  key={m.key}
                  onClick={() => setActive(m.key)}
                  style={{ cursor: 'pointer' }}
                >
                  <text x={m.x} y={m.y} fontSize={4.5} fontWeight={700} fill="#1b2740" fontFamily="sans-serif">
                    {t(`learn.lessons.nameplate.example.${m.key}`)}
                  </text>
                  <circle
                    cx={m.x - 2.5} cy={m.y - 1.5} r={1.5}
                    fill={active === m.key ? '#f59e0b' : '#3b82f6'}
                    stroke="#fff" strokeWidth={0.4}
                  />
                </g>
              ))}
            </svg>
          </div>

          {active && (
            <div className="mt-3 rounded-xl border border-blue-300 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950/40">
              <p className="text-xs font-semibold text-blue-800 dark:text-blue-200">
                {t(`learn.lessons.nameplate.field.${active}.label`)}
              </p>
              <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-200">
                {t(`learn.lessons.nameplate.field.${active}.desc`)}
              </p>
            </div>
          )}
          {!active && (
            <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
              {t('learn.lessons.nameplate.tapHint')}
            </p>
          )}
        </Playground>
      </LessonCard>

      <LessonCard>
        <SectionHeader title={t('learn.keyPoints')} />
        <KeyPoints
          points={[
            t('learn.lessons.nameplate.point1'),
            t('learn.lessons.nameplate.point2'),
            t('learn.lessons.nameplate.point3'),
          ]}
        />
      </LessonCard>
    </div>
  )
}
