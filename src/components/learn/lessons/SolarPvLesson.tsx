'use client'

import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LessonCard, SectionHeader, Prose, KeyPoints, Playground, LabelSlider } from '../shared'

type Topology = 'string' | 'micro' | 'off_grid'

export function SolarPvLesson() {
  const { t } = useTranslation()
  const [topology, setTopology] = useState<Topology>('string')
  const [panels, setPanels] = useState(10)
  const [panelW, setPanelW] = useState(400)   // W per panel
  const [sunHours, setSunHours] = useState(4.5)
  const [efficiency, setEfficiency] = useState(0.8)

  const { arrayKw, dailyKwh, annualKwh } = useMemo(() => {
    const arrayW = panels * panelW * efficiency
    const dailyKwh = (arrayW * sunHours) / 1000
    return {
      arrayKw: arrayW / 1000,
      dailyKwh,
      annualKwh: dailyKwh * 365,
    }
  }, [panels, panelW, sunHours, efficiency])

  return (
    <div className="space-y-6">
      <LessonCard>
        <SectionHeader title={t('learn.lessons.solar_pv.title')} />
        <Prose>
          <p>{t('learn.lessons.solar_pv.intro')}</p>
        </Prose>
      </LessonCard>

      <LessonCard>
        <SectionHeader title={t('learn.tryYourself')} />
        <Playground>
          <div className="grid grid-cols-3 gap-1 rounded-lg border border-zinc-200 p-1 dark:border-zinc-700">
            {(['string', 'micro', 'off_grid'] as const).map((tp) => (
              <button
                key={tp}
                type="button"
                onClick={() => setTopology(tp)}
                className={`min-h-[40px] rounded-md px-1 py-1.5 text-[11px] font-semibold leading-tight transition-colors touch-manipulation sm:px-2 sm:text-sm ${
                  topology === tp
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                }`}
              >
                {t(`learn.lessons.solar_pv.topology.${tp}`)}
              </button>
            ))}
          </div>

          <p className="mt-3 text-xs text-zinc-600 dark:text-zinc-300">
            {t(`learn.lessons.solar_pv.topologyExplain.${topology}`)}
          </p>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <LabelSlider label={t('learn.lessons.solar_pv.panels')}     value={panels}     min={1} max={40} step={1} onChange={setPanels} />
            <LabelSlider label={t('learn.lessons.solar_pv.panelW')} unit="W" value={panelW} min={200} max={600} step={10} onChange={setPanelW} />
            <LabelSlider label={t('learn.lessons.solar_pv.sunHours')} unit="h" value={sunHours} min={2} max={7} step={0.1} onChange={setSunHours} />
            <LabelSlider label={t('learn.lessons.solar_pv.eff')} value={efficiency} min={0.5} max={1} step={0.05} onChange={setEfficiency} />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Tile label={t('learn.lessons.solar_pv.arrayKw')} value={`${arrayKw.toFixed(1)} kW`} tone="blue" />
            <Tile label={t('learn.lessons.solar_pv.dailyKwh')} value={`${dailyKwh.toFixed(1)} kWh`} tone="amber" />
            <Tile label={t('learn.lessons.solar_pv.annualKwh')} value={`${Math.round(annualKwh).toLocaleString()} kWh`} tone="green" />
          </div>
        </Playground>
      </LessonCard>

      <LessonCard>
        <SectionHeader title={t('learn.keyPoints')} />
        <KeyPoints
          points={[
            t('learn.lessons.solar_pv.point1'),
            t('learn.lessons.solar_pv.point2'),
            t('learn.lessons.solar_pv.point3'),
          ]}
        />
      </LessonCard>
    </div>
  )
}

function Tile({ label, value, tone }: { label: string; value: string; tone: 'blue' | 'amber' | 'green' }) {
  const bg = tone === 'blue' ? 'from-blue-500 to-blue-700' : tone === 'amber' ? 'from-amber-500 to-amber-700' : 'from-green-500 to-green-700'
  return (
    <div className={`rounded-2xl bg-gradient-to-br ${bg} p-4 text-center text-white shadow-md`}>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-white/80">{label}</p>
      <p className="mt-1 font-mono text-xl font-bold tabular-nums">{value}</p>
    </div>
  )
}
