'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LessonCard, SectionHeader, Prose, KeyPoints, Playground } from '../shared'

type Type = 'pvc' | 'xlpe' | 'lszh' | 'rubber'

const TYPE_META: Record<Type, { color: string; maxT: string; example: string }> = {
  pvc:    { color: '#78716c', maxT: '70 °C',  example: 'H07V-U · NYM · SIA' },
  xlpe:   { color: '#65a30d', maxT: '90 °C',  example: 'N2XY · XLPE/SWA/PVC' },
  lszh:   { color: '#0891b2', maxT: '90 °C',  example: 'FRHF · H07Z-U' },
  rubber: { color: '#a16207', maxT: '85 °C',  example: 'H07RN-F' },
}

export function InsulationTypesLesson() {
  const { t } = useTranslation()
  const [type, setType] = useState<Type>('pvc')
  const meta = TYPE_META[type]

  return (
    <div className="space-y-6">
      <LessonCard>
        <SectionHeader title={t('learn.lessons.insulation_types.title')} />
        <Prose>
          <p>{t('learn.lessons.insulation_types.intro')}</p>
        </Prose>
      </LessonCard>

      <LessonCard>
        <SectionHeader title={t('learn.tryYourself')} />
        <Playground>
          <div className="grid grid-cols-2 gap-1 rounded-lg border border-zinc-200 p-1 dark:border-zinc-700 sm:grid-cols-4">
            {(['pvc', 'xlpe', 'lszh', 'rubber'] as const).map((tp) => (
              <button
                key={tp}
                type="button"
                onClick={() => setType(tp)}
                className={`min-h-[40px] rounded-md px-1 py-1.5 text-[11px] font-semibold leading-tight transition-colors touch-manipulation sm:px-2 sm:text-sm ${
                  type === tp ? 'text-white shadow-sm' : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                }`}
                style={type === tp ? { background: TYPE_META[tp].color } : undefined}
              >
                {t(`learn.lessons.insulation_types.types.${tp}`)}
              </button>
            ))}
          </div>

          {/* Cable cross-section */}
          <div className="mt-4 flex justify-center rounded-xl bg-white p-4 shadow-inner dark:bg-zinc-900">
            <svg viewBox="0 0 220 220" className="h-auto w-full max-w-xs">
              {/* Outer sheath */}
              <circle cx={110} cy={110} r={90} fill={meta.color} />
              <text x={110} y={205} textAnchor="middle" fontSize={11} fontWeight={700} fill="#374151">
                {t(`learn.lessons.insulation_types.types.${type}`)}
              </text>
              {/* Three cores */}
              {[[110, 66], [83, 138], [137, 138]].map(([x, y], i) => (
                <g key={i}>
                  <circle cx={x} cy={y} r={30} fill="#eab308" />
                  <circle cx={x} cy={y} r={20} fill="#b45309" />
                </g>
              ))}
              {/* Filler */}
              <circle cx={110} cy={110} r={10} fill="rgba(255,255,255,0.2)" />
            </svg>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Row label={t('learn.lessons.insulation_types.maxTemp')} value={meta.maxT} />
            <Row label={t('learn.lessons.insulation_types.fire')} value={t(`learn.lessons.insulation_types.fire.${type}`)} />
            <Row label={t('learn.lessons.insulation_types.example')} value={meta.example} />
          </div>

          <p className="mt-3 text-xs text-zinc-600 dark:text-zinc-300">
            {t(`learn.lessons.insulation_types.explain.${type}`)}
          </p>
        </Playground>
      </LessonCard>

      <LessonCard>
        <SectionHeader title={t('learn.keyPoints')} />
        <KeyPoints
          points={[
            t('learn.lessons.insulation_types.point1'),
            t('learn.lessons.insulation_types.point2'),
            t('learn.lessons.insulation_types.point3'),
          ]}
        />
      </LessonCard>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-800">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-zinc-800 dark:text-zinc-100">{value}</p>
    </div>
  )
}
