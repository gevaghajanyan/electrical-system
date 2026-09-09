'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LessonCard, SectionHeader, Prose, KeyPoints, Playground } from '../shared'

type Config = 'star' | 'delta'

export function StarDeltaLesson() {
  const { t } = useTranslation()
  const [config, setConfig] = useState<Config>('star')

  // Same phase voltage assumed (400/230 V system)
  const Vphase = 230
  const Vline  = 400
  const Iphase = 5  // A (fixed for demo)
  const Iline  = config === 'star' ? Iphase : Iphase * Math.sqrt(3)
  const V      = config === 'star' ? Vphase : Vline
  const P = Math.sqrt(3) * Vline * Iline * 0.85  // 3-phase power @ pf=0.85

  return (
    <div className="space-y-6">
      <LessonCard>
        <SectionHeader title={t('learn.lessons.star_delta.title')} />
        <Prose>
          <p>{t('learn.lessons.star_delta.intro')}</p>
        </Prose>
      </LessonCard>

      <LessonCard>
        <SectionHeader title={t('learn.tryYourself')} />
        <Playground>
          <div className="grid grid-cols-2 gap-1 rounded-lg border border-zinc-200 p-1 dark:border-zinc-700">
            {(['star', 'delta'] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setConfig(c)}
                className={`min-h-[40px] rounded-md px-2 py-1.5 text-sm font-medium transition-colors touch-manipulation ${
                  config === c ? 'bg-blue-600 text-white shadow-sm' : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                }`}
              >
                {t(`learn.lessons.star_delta.${c}`)}
              </button>
            ))}
          </div>

          {/* Diagram */}
          <div className="mt-4 flex justify-center rounded-xl bg-white p-4 shadow-inner dark:bg-zinc-900">
            <svg viewBox="0 0 300 240" className="h-auto w-full max-w-md">
              {config === 'star' ? (
                <g stroke="#1b2740" strokeWidth={2} fill="none" strokeLinecap="round">
                  <circle cx={150} cy={130} r={4} fill="#1b2740" />
                  <line x1={150} y1={130} x2={70}  y2={70} />
                  <line x1={150} y1={130} x2={230} y2={70} />
                  <line x1={150} y1={130} x2={150} y2={220} />
                  <text x={60}  y={60}  fontSize={13} fontWeight={700} fill="#dc2626">L1</text>
                  <text x={230} y={60}  fontSize={13} fontWeight={700} fill="#111">L2</text>
                  <text x={140} y={236} fontSize={13} fontWeight={700} fill="#3b82f6">L3</text>
                  <text x={155} y={125} fontSize={11} fill="#166534">N</text>
                </g>
              ) : (
                <g stroke="#1b2740" strokeWidth={2} fill="none" strokeLinecap="round">
                  {/* Delta triangle */}
                  <path d="M 60 200 L 240 200 L 150 60 Z" />
                  <text x={40}  y={210} fontSize={13} fontWeight={700} fill="#dc2626">L1</text>
                  <text x={244} y={210} fontSize={13} fontWeight={700} fill="#111">L2</text>
                  <text x={140} y={54}  fontSize={13} fontWeight={700} fill="#3b82f6">L3</text>
                </g>
              )}
            </svg>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Row label={t('learn.lessons.star_delta.vWinding')} value={`${V} V`}      tone="blue" />
            <Row label={t('learn.lessons.star_delta.iLine')}    value={`${Iline.toFixed(2)} A`} tone="amber" />
            <Row label={t('learn.lessons.star_delta.power')}    value={`${(P / 1000).toFixed(2)} kW`} tone="green" />
          </div>

          <p className="mt-3 text-xs text-zinc-600 dark:text-zinc-300">
            {t(`learn.lessons.star_delta.explain.${config}`)}
          </p>
        </Playground>
      </LessonCard>

      <LessonCard>
        <SectionHeader title={t('learn.keyPoints')} />
        <KeyPoints
          points={[
            t('learn.lessons.star_delta.point1'),
            t('learn.lessons.star_delta.point2'),
            t('learn.lessons.star_delta.point3'),
          ]}
        />
      </LessonCard>
    </div>
  )
}

function Row({ label, value, tone }: { label: string; value: string; tone: 'blue' | 'amber' | 'green' }) {
  const bg = tone === 'blue' ? 'from-blue-500 to-blue-700' : tone === 'amber' ? 'from-amber-500 to-amber-700' : 'from-green-500 to-green-700'
  return (
    <div className={`rounded-2xl bg-gradient-to-br ${bg} p-4 text-center text-white shadow-md`}>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-white/80">{label}</p>
      <p className="mt-1 font-mono text-xl font-bold tabular-nums">{value}</p>
    </div>
  )
}
