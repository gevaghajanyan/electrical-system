'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LessonCard, SectionHeader, Prose, KeyPoints, Playground, LabelSlider } from '../shared'

const SOLID_DESC: Record<number, string> = {
  0: 'no', 1: '50mm', 2: '12mm', 3: '2.5mm', 4: '1mm', 5: 'dust_protected', 6: 'dust_tight',
}
const LIQUID_DESC: Record<number, string> = {
  0: 'no', 1: 'drip', 2: 'drip15', 3: 'spray', 4: 'splash', 5: 'jet',
  6: 'jet_powerful', 7: 'immersion', 8: 'submersion', 9: 'high_pressure',
}

export function IpRatingsLesson() {
  const { t } = useTranslation()
  const [solid, setSolid] = useState(6)
  const [liquid, setLiquid] = useState(4)

  const rating = `IP${solid}${liquid}`

  return (
    <div className="space-y-6">
      <LessonCard>
        <SectionHeader title={t('learn.lessons.ip_ratings.title')} />
        <Prose>
          <p>{t('learn.lessons.ip_ratings.intro')}</p>
        </Prose>
      </LessonCard>

      <LessonCard>
        <SectionHeader title={t('learn.tryYourself')} />
        <Playground>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <LabelSlider label={t('learn.lessons.ip_ratings.solid')}  value={solid}  min={0} max={6} step={1} onChange={setSolid} />
            <LabelSlider label={t('learn.lessons.ip_ratings.liquid')} value={liquid} min={0} max={9} step={1} onChange={setLiquid} />
          </div>

          <div className="mt-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 p-6 text-center text-white shadow-md">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/80">{t('learn.lessons.ip_ratings.rating')}</p>
            <p className="mt-1 font-mono text-4xl font-bold tabular-nums">{rating}</p>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">{t('learn.lessons.ip_ratings.solidHeader')}</p>
              <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-200">
                {t(`learn.lessons.ip_ratings.solidValues.${SOLID_DESC[solid]}`)}
              </p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">{t('learn.lessons.ip_ratings.liquidHeader')}</p>
              <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-200">
                {t(`learn.lessons.ip_ratings.liquidValues.${LIQUID_DESC[liquid]}`)}
              </p>
            </div>
          </div>

          <p className="mt-3 text-xs text-zinc-600 dark:text-zinc-300">
            <span className="font-semibold">{t('learn.lessons.ip_ratings.suitableFor')}: </span>
            {t(`learn.lessons.ip_ratings.suitability.${suitability(solid, liquid)}`)}
          </p>
        </Playground>
      </LessonCard>

      <LessonCard>
        <SectionHeader title={t('learn.keyPoints')} />
        <KeyPoints
          points={[
            t('learn.lessons.ip_ratings.point1'),
            t('learn.lessons.ip_ratings.point2'),
            t('learn.lessons.ip_ratings.point3'),
          ]}
        />
      </LessonCard>
    </div>
  )
}

function suitability(solid: number, liquid: number): string {
  if (solid >= 6 && liquid >= 8) return 'submerged'
  if (solid >= 6 && liquid >= 5) return 'outdoor_wet'
  if (solid >= 5 && liquid >= 4) return 'outdoor_dry'
  if (solid >= 4 && liquid >= 4) return 'bathroom'
  if (solid >= 2 && liquid >= 1) return 'indoor_dry'
  return 'controlled'
}
