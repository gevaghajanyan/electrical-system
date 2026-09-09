'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LessonCard, SectionHeader, Prose, KeyPoints, Playground } from '../shared'

type Mode = 'earthing' | 'bonding' | 'both'

export function BondingEarthingLesson() {
  const { t } = useTranslation()
  const [mode, setMode] = useState<Mode>('both')

  return (
    <div className="space-y-6">
      <LessonCard>
        <SectionHeader title={t('learn.lessons.bonding_earthing.title')} />
        <Prose>
          <p>{t('learn.lessons.bonding_earthing.intro')}</p>
        </Prose>
      </LessonCard>

      <LessonCard>
        <SectionHeader title={t('learn.tryYourself')} />
        <Playground>
          <div className="grid grid-cols-3 gap-1 rounded-lg border border-zinc-200 p-1 dark:border-zinc-700">
            {(['earthing', 'bonding', 'both'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`min-h-[40px] rounded-md px-1 py-1.5 text-[11px] font-semibold leading-tight transition-colors touch-manipulation sm:px-2 sm:text-sm ${
                  mode === m
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                }`}
              >
                {t(`learn.lessons.bonding_earthing.modes.${m}`)}
              </button>
            ))}
          </div>

          {/* Diagram — appliance, water pipe, MET (main earth terminal), earth rod */}
          <div className="mt-4 rounded-xl bg-white p-4 shadow-inner dark:bg-zinc-900">
            <svg viewBox="0 0 480 240" className="h-auto w-full">
              {/* Appliance */}
              <rect x={40} y={40} width={80} height={70} rx={6} fill="#e0e7ff" stroke="#1b2740" strokeWidth={1.4} />
              <text x={80} y={80} textAnchor="middle" fontSize={11} fontWeight={700} fill="#1b2740">Appliance</text>
              {/* Water pipe */}
              <rect x={200} y={40} width={80} height={70} rx={6} fill="#dbeafe" stroke="#1b2740" strokeWidth={1.4} />
              <text x={240} y={80} textAnchor="middle" fontSize={11} fontWeight={700} fill="#1b2740">Water pipe</text>
              {/* Gas pipe */}
              <rect x={360} y={40} width={80} height={70} rx={6} fill="#fee2e2" stroke="#1b2740" strokeWidth={1.4} />
              <text x={400} y={80} textAnchor="middle" fontSize={11} fontWeight={700} fill="#1b2740">Gas pipe</text>

              {/* Main earth terminal */}
              <rect x={200} y={160} width={80} height={30} rx={4} fill="#fef3c7" stroke="#78350f" strokeWidth={1.4} />
              <text x={240} y={180} textAnchor="middle" fontSize={11} fontWeight={700} fill="#78350f">MET</text>

              {/* Earthing wire (appliance → MET → earth rod) — shown when earthing/both */}
              {(mode === 'earthing' || mode === 'both') && (
                <g stroke="#166534" strokeWidth={3} strokeLinecap="round" fill="none">
                  <path d="M 80 110 L 80 145 L 200 175" />
                  <path d="M 240 190 L 240 220" />
                  <path d="M 220 220 L 260 220 M 224 226 L 256 226 M 228 232 L 252 232" />
                  <text x={100} y={135} fontSize={9} fill="#166534" fontWeight={700}>PE (earthing)</text>
                  <text x={244} y={218} fontSize={9} fill="#166534" fontWeight={700} textAnchor="start">Earth rod</text>
                </g>
              )}

              {/* Bonding wires (water/gas → MET) — shown when bonding/both */}
              {(mode === 'bonding' || mode === 'both') && (
                <g stroke="#eab308" strokeWidth={3} strokeLinecap="round" fill="none" strokeDasharray="6 3">
                  <path d="M 240 110 L 240 160" />
                  <path d="M 400 110 L 400 145 L 280 175" />
                  <text x={244} y={140} fontSize={9} fill="#a16207" fontWeight={700}>Bonding</text>
                </g>
              )}
            </svg>
          </div>

          <p className="mt-3 text-xs text-zinc-600 dark:text-zinc-300">
            {t(`learn.lessons.bonding_earthing.modeExplain.${mode}`)}
          </p>
        </Playground>
      </LessonCard>

      <LessonCard>
        <SectionHeader title={t('learn.keyPoints')} />
        <KeyPoints
          points={[
            t('learn.lessons.bonding_earthing.point1'),
            t('learn.lessons.bonding_earthing.point2'),
            t('learn.lessons.bonding_earthing.point3'),
          ]}
        />
      </LessonCard>
    </div>
  )
}
