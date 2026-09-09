'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LessonCard, SectionHeader, Prose, KeyPoints, Playground } from '../shared'

type Mode = 'vac' | 'vdc' | 'a' | 'ohm' | 'diode' | 'continuity'

const MODES: Mode[] = ['vac', 'vdc', 'a', 'ohm', 'diode', 'continuity']

export function MultimeterLesson() {
  const { t } = useTranslation()
  const [mode, setMode] = useState<Mode>('vac')

  return (
    <div className="space-y-6">
      <LessonCard>
        <SectionHeader title={t('learn.lessons.multimeter.title')} />
        <Prose>
          <p>{t('learn.lessons.multimeter.intro')}</p>
        </Prose>
      </LessonCard>

      <LessonCard>
        <SectionHeader title={t('learn.tryYourself')} />
        <Playground>
          <div className="grid grid-cols-3 gap-1 rounded-lg border border-zinc-200 p-1 dark:border-zinc-700 sm:grid-cols-6">
            {MODES.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`min-h-[40px] rounded-md px-1 py-1.5 text-[11px] font-semibold leading-tight transition-colors touch-manipulation ${
                  mode === m ? 'bg-blue-600 text-white shadow-sm' : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                }`}
              >
                {t(`learn.lessons.multimeter.modes.${m}`)}
              </button>
            ))}
          </div>

          {/* Multimeter drawing */}
          <div className="mt-4 rounded-xl bg-white p-4 shadow-inner dark:bg-zinc-900">
            <svg viewBox="0 0 320 240" className="h-auto w-full max-w-md mx-auto block">
              {/* Body */}
              <rect x={40} y={20} width={240} height={180} rx={16} fill="#f97316" stroke="#7c2d12" strokeWidth={1.6} />
              {/* Display */}
              <rect x={70} y={40} width={180} height={54} rx={4} fill="#064e3b" />
              <text x={240} y={80} textAnchor="end" fontSize={26} fontWeight={800} fill="#a7f3d0" fontFamily="monospace">
                {mode === 'ohm' ? '1.0 MΩ' : mode === 'diode' ? '0.62 V' : mode === 'continuity' ? '2.4 Ω ♪' : mode === 'a' ? '3.20 A' : mode === 'vdc' ? '12.3 V' : '230 V'}
              </text>
              <text x={80} y={56} fontSize={10} fontWeight={700} fill="#a7f3d0" fontFamily="monospace">
                {t(`learn.lessons.multimeter.modes.${mode}`)}
              </text>
              {/* Rotary dial */}
              <circle cx={160} cy={140} r={40} fill="#78350f" stroke="#431407" strokeWidth={2} />
              <circle cx={160} cy={140} r={5} fill="#facc15" />
              {(() => {
                const idx = MODES.indexOf(mode)
                const angle = (idx / (MODES.length - 1)) * Math.PI - Math.PI / 2
                const px = 160 + Math.cos(angle) * 32
                const py = 140 + Math.sin(angle) * 32
                return <line x1={160} y1={140} x2={px} y2={py} stroke="#facc15" strokeWidth={3} strokeLinecap="round" />
              })()}
              {/* Probes */}
              <circle cx={100} cy={192} r={5} fill="#171717" />
              <circle cx={220} cy={192} r={5} fill="#dc2626" />
              <line x1={100} y1={197} x2={90}  y2={230} stroke="#111" strokeWidth={2} />
              <line x1={220} y1={197} x2={230} y2={230} stroke="#dc2626" strokeWidth={2} />
              <text x={94}  y={215} fontSize={8} fill="#111">COM</text>
              <text x={214} y={215} fontSize={8} fill="#dc2626">V·Ω</text>
            </svg>
          </div>

          <p className="mt-3 text-xs text-zinc-600 dark:text-zinc-300">
            {t(`learn.lessons.multimeter.explain.${mode}`)}
          </p>

          {/* CAT rating warning */}
          <div className="mt-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
            <span className="font-semibold">⚠ {t('learn.lessons.multimeter.catWarning')}</span> {t('learn.lessons.multimeter.catExplain')}
          </div>
        </Playground>
      </LessonCard>

      <LessonCard>
        <SectionHeader title={t('learn.keyPoints')} />
        <KeyPoints
          points={[
            t('learn.lessons.multimeter.point1'),
            t('learn.lessons.multimeter.point2'),
            t('learn.lessons.multimeter.point3'),
          ]}
        />
      </LessonCard>
    </div>
  )
}
