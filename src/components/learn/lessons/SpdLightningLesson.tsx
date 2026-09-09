'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LessonCard, SectionHeader, Prose, KeyPoints, Playground } from '../shared'

type Type = 't1' | 't2' | 't3'

const TYPE_META: Record<Type, { color: string; iimp: string; up: string; where: string }> = {
  t1: { color: '#dc2626', iimp: '25–100 kA (10/350 µs)', up: '≤ 4 kV',   where: 'origin' },
  t2: { color: '#f59e0b', iimp: '20–40 kA (8/20 µs)',    up: '≤ 2.5 kV', where: 'main_dist' },
  t3: { color: '#059669', iimp: '≤ 6 kA (8/20 µs)',      up: '≤ 1.5 kV', where: 'sub_dist' },
}

export function SpdLightningLesson() {
  const { t } = useTranslation()
  const [type, setType] = useState<Type>('t2')

  const meta = TYPE_META[type]

  return (
    <div className="space-y-6">
      <LessonCard>
        <SectionHeader title={t('learn.lessons.spd_lightning.title')} />
        <Prose>
          <p>{t('learn.lessons.spd_lightning.intro')}</p>
        </Prose>
      </LessonCard>

      <LessonCard>
        <SectionHeader title={t('learn.tryYourself')} />
        <Playground>
          <div className="grid grid-cols-3 gap-1 rounded-lg border border-zinc-200 p-1 dark:border-zinc-700">
            {(['t1', 't2', 't3'] as const).map((tp) => (
              <button
                key={tp}
                type="button"
                onClick={() => setType(tp)}
                className={`min-h-[40px] rounded-md px-1 py-1.5 text-[11px] font-semibold leading-tight transition-colors touch-manipulation sm:px-2 sm:text-sm ${
                  type === tp ? 'text-white shadow-sm' : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                }`}
                style={type === tp ? { background: meta.color } : undefined}
              >
                {t(`learn.lessons.spd_lightning.types.${tp}`)}
              </button>
            ))}
          </div>

          {/* Building schematic — service entry → main → sub */}
          <div className="mt-4 rounded-xl bg-white p-4 shadow-inner dark:bg-zinc-900">
            <svg viewBox="0 0 480 200" className="h-auto w-full">
              {/* Cloud + lightning */}
              <ellipse cx={70} cy={30} rx={40} ry={12} fill="#94a3b8" />
              <path d="M 70 42 L 55 70 L 68 68 L 60 90" stroke="#facc15" strokeWidth={3} fill="none" strokeLinecap="round" />

              {/* Service entry — Type 1 mounts here */}
              <rect x={130} y={70} width={50} height={70} rx={4} fill={type === 't1' ? '#dc2626' : '#e5e7eb'} stroke="#1b2740" strokeWidth={1.4} />
              <text x={155} y={100} textAnchor="middle" fontSize={10} fontWeight={700} fill={type === 't1' ? '#fff' : '#1b2740'}>Origin</text>
              <text x={155} y={115} textAnchor="middle" fontSize={9} fill={type === 't1' ? '#fff' : '#71717a'}>T1</text>

              {/* Main distribution — Type 2 mounts here */}
              <rect x={240} y={70} width={50} height={70} rx={4} fill={type === 't2' ? '#f59e0b' : '#e5e7eb'} stroke="#1b2740" strokeWidth={1.4} />
              <text x={265} y={100} textAnchor="middle" fontSize={10} fontWeight={700} fill={type === 't2' ? '#fff' : '#1b2740'}>Main</text>
              <text x={265} y={115} textAnchor="middle" fontSize={9} fill={type === 't2' ? '#fff' : '#71717a'}>T2</text>

              {/* Sub distribution / socket — Type 3 mounts here */}
              <rect x={350} y={70} width={50} height={70} rx={4} fill={type === 't3' ? '#059669' : '#e5e7eb'} stroke="#1b2740" strokeWidth={1.4} />
              <text x={375} y={100} textAnchor="middle" fontSize={10} fontWeight={700} fill={type === 't3' ? '#fff' : '#1b2740'}>Sub</text>
              <text x={375} y={115} textAnchor="middle" fontSize={9} fill={type === 't3' ? '#fff' : '#71717a'}>T3</text>

              {/* Line between */}
              <line x1={180} y1={105} x2={240} y2={105} stroke="#71717a" strokeWidth={2} />
              <line x1={290} y1={105} x2={350} y2={105} stroke="#71717a" strokeWidth={2} />

              {/* Earth */}
              <path d="M 155 140 L 155 170 M 140 170 L 170 170 M 145 176 L 165 176 M 150 182 L 160 182" stroke="#166534" strokeWidth={2} />
            </svg>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Info label={t('learn.lessons.spd_lightning.iimp')} value={meta.iimp} />
            <Info label={t('learn.lessons.spd_lightning.up')} value={meta.up} />
            <Info label={t('learn.lessons.spd_lightning.where')} value={t(`learn.lessons.spd_lightning.whereText.${meta.where}`)} />
          </div>

          <p className="mt-3 text-xs text-zinc-600 dark:text-zinc-300">
            {t(`learn.lessons.spd_lightning.explain.${type}`)}
          </p>
        </Playground>
      </LessonCard>

      <LessonCard>
        <SectionHeader title={t('learn.keyPoints')} />
        <KeyPoints
          points={[
            t('learn.lessons.spd_lightning.point1'),
            t('learn.lessons.spd_lightning.point2'),
            t('learn.lessons.spd_lightning.point3'),
          ]}
        />
      </LessonCard>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-800">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-zinc-800 dark:text-zinc-100">{value}</p>
    </div>
  )
}
