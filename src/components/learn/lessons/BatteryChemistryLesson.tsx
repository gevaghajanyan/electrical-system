'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LessonCard, SectionHeader, Prose, KeyPoints, Playground } from '../shared'

type Chem = 'lifepo4' | 'liion' | 'lead_acid' | 'nimh'

interface Row {
  key: 'nominalV' | 'cycles' | 'energyDensity' | 'safety' | 'cost' | 'selfDischarge'
}

const ROWS: Row[] = [
  { key: 'nominalV' },
  { key: 'energyDensity' },
  { key: 'cycles' },
  { key: 'safety' },
  { key: 'cost' },
  { key: 'selfDischarge' },
]

const CHEM_COLOR: Record<Chem, string> = {
  lifepo4: '#059669', liion: '#3b82f6', lead_acid: '#64748b', nimh: '#f59e0b',
}

export function BatteryChemistryLesson() {
  const { t } = useTranslation()
  const [chem, setChem] = useState<Chem>('lifepo4')

  return (
    <div className="space-y-6">
      <LessonCard>
        <SectionHeader title={t('learn.lessons.battery_chemistry.title')} />
        <Prose>
          <p>{t('learn.lessons.battery_chemistry.intro')}</p>
        </Prose>
      </LessonCard>

      <LessonCard>
        <SectionHeader title={t('learn.tryYourself')} />
        <Playground>
          <div className="grid grid-cols-2 gap-1 rounded-lg border border-zinc-200 p-1 dark:border-zinc-700 sm:grid-cols-4">
            {(['lifepo4', 'liion', 'lead_acid', 'nimh'] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setChem(c)}
                className={`min-h-[40px] rounded-md px-1 py-1.5 text-[11px] font-semibold leading-tight transition-colors touch-manipulation sm:px-2 sm:text-sm ${
                  chem === c ? 'text-white shadow-sm' : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                }`}
                style={chem === c ? { background: CHEM_COLOR[c] } : undefined}
              >
                {t(`learn.lessons.battery_chemistry.chem.${c}`)}
              </button>
            ))}
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 text-[11px] font-semibold uppercase tracking-widest text-zinc-500 dark:bg-zinc-800/70 dark:text-zinc-400">
                <tr>
                  <th className="px-3 py-2">{t('learn.lessons.battery_chemistry.property')}</th>
                  <th className="px-3 py-2">{t(`learn.lessons.battery_chemistry.chem.${chem}`)}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {ROWS.map((row) => (
                  <tr key={row.key}>
                    <td className="px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-200">
                      {t(`learn.lessons.battery_chemistry.props.${row.key}`)}
                    </td>
                    <td className="px-3 py-2 text-xs text-zinc-600 dark:text-zinc-300">
                      {t(`learn.lessons.battery_chemistry.values.${chem}.${row.key}`)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-3 text-xs text-zinc-600 dark:text-zinc-300">
            <span className="font-semibold">{t('learn.lessons.battery_chemistry.bestFor')}: </span>
            {t(`learn.lessons.battery_chemistry.bestForText.${chem}`)}
          </p>
        </Playground>
      </LessonCard>

      <LessonCard>
        <SectionHeader title={t('learn.keyPoints')} />
        <KeyPoints
          points={[
            t('learn.lessons.battery_chemistry.point1'),
            t('learn.lessons.battery_chemistry.point2'),
            t('learn.lessons.battery_chemistry.point3'),
          ]}
        />
      </LessonCard>
    </div>
  )
}
