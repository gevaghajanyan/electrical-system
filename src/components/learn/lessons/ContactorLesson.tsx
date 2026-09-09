'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LessonCard, SectionHeader, Prose, KeyPoints, Playground } from '../shared'

/**
 * Contactor animation — the user toggles the coil and sees the main contacts
 * close, the auxiliary NC contact open, and the load light up.
 */
export function ContactorLesson() {
  const { t } = useTranslation()
  const [energised, setEnergised] = useState(false)

  return (
    <div className="space-y-6">
      <LessonCard>
        <SectionHeader title={t('learn.lessons.contactor.title')} />
        <Prose>
          <p>{t('learn.lessons.contactor.intro')}</p>
        </Prose>
      </LessonCard>

      <LessonCard>
        <SectionHeader title={t('learn.tryYourself')} />
        <Playground>
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setEnergised((v) => !v)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors touch-manipulation min-h-[44px] ${
                energised
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-100'
              }`}
            >
              <span className={`inline-block h-2.5 w-2.5 rounded-full ${energised ? 'bg-white animate-pulse' : 'bg-zinc-400'}`} />
              {energised ? t('learn.lessons.contactor.energised') : t('learn.lessons.contactor.deenergised')}
            </button>
          </div>

          <div className="mt-4 rounded-xl bg-white p-4 shadow-inner dark:bg-zinc-900">
            <svg viewBox="0 0 400 260" className="h-auto w-full">
              {/* Supply L / N */}
              <line x1={40} y1={20} x2={40} y2={230} stroke="#dc2626" strokeWidth={2.4} />
              <text x={30} y={16} fontSize={11} fontWeight={700} fill="#dc2626">L</text>
              <line x1={360} y1={20} x2={360} y2={230} stroke="#2563eb" strokeWidth={2.4} />
              <text x={352} y={16} fontSize={11} fontWeight={700} fill="#2563eb">N</text>

              {/* Coil circuit — Start button (drawn always pressed for simplicity) then coil */}
              <line x1={40}  y1={60}  x2={140} y2={60} stroke="#71717a" strokeWidth={2} />
              <line x1={140} y1={60}  x2={140} y2={80} stroke="#71717a" strokeWidth={2} />
              <text x={148} y={64} fontSize={10} fill="#71717a">Start (energised: {energised ? 'on' : 'off'})</text>
              {/* Coil rectangle */}
              <rect x={126} y={80} width={28} height={40} rx={3} fill={energised ? '#f2bc2e' : '#f4f4f5'} stroke="#1b2740" strokeWidth={1.4} />
              <text x={140} y={106} textAnchor="middle" fontSize={13} fontWeight={800} fill={energised ? '#78350f' : '#71717a'}>A1</text>
              <line x1={140} y1={120} x2={140} y2={230} stroke="#71717a" strokeWidth={2} />
              <line x1={140} y1={230} x2={360} y2={230} stroke="#71717a" strokeWidth={2} />

              {/* Main contact — closed when energised */}
              <line x1={40}  y1={140} x2={220} y2={140} stroke="#71717a" strokeWidth={2} />
              <circle cx={222} cy={140} r={3} fill="#1b2740" />
              <circle cx={258} cy={140} r={3} fill="#1b2740" />
              <line
                x1={222} y1={140}
                x2={energised ? 258 : 252}
                y2={energised ? 140 : 120}
                stroke="#1b2740" strokeWidth={2.4}
                style={{ transition: 'x2 200ms, y2 200ms' }}
              />
              <line x1={260} y1={140} x2={310} y2={140} stroke="#71717a" strokeWidth={2} />

              {/* Load — a motor circle */}
              <circle cx={330} cy={140} r={18} fill={energised ? '#f2bc2e' : '#f4f4f5'} stroke="#1b2740" strokeWidth={1.5} />
              <text x={330} y={146} textAnchor="middle" fontSize={13} fontWeight={800} fill="#1b2740">M</text>

              {/* Aux NC 95-96 — opens when energised */}
              <line x1={40} y1={200} x2={200} y2={200} stroke="#71717a" strokeWidth={1.6} strokeDasharray="4 3" />
              <text x={70} y={196} fontSize={10} fill="#71717a">Aux NC (95-96)</text>
              <circle cx={200} cy={200} r={2.5} fill="#1b2740" />
              <circle cx={230} cy={200} r={2.5} fill="#1b2740" />
              <line
                x1={200} y1={200}
                x2={energised ? 218 : 230}
                y2={energised ? 180 : 200}
                stroke="#1b2740" strokeWidth={2}
                style={{ transition: 'x2 200ms, y2 200ms' }}
              />
              <line x1={232} y1={200} x2={360} y2={200} stroke="#71717a" strokeWidth={1.6} strokeDasharray="4 3" />
            </svg>
          </div>

          <div className={`mt-4 rounded-xl border p-3 text-sm font-semibold ${
            energised
              ? 'border-green-300 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950/40 dark:text-green-200'
              : 'border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-300'
          }`}>
            {energised ? t('learn.lessons.contactor.on') : t('learn.lessons.contactor.off')}
          </div>
        </Playground>
      </LessonCard>

      <LessonCard>
        <SectionHeader title={t('learn.keyPoints')} />
        <KeyPoints
          points={[
            t('learn.lessons.contactor.point1'),
            t('learn.lessons.contactor.point2'),
            t('learn.lessons.contactor.point3'),
          ]}
        />
      </LessonCard>
    </div>
  )
}
