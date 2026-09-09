'use client'

import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LessonCard, SectionHeader, Prose, KeyPoints, Playground, LabelSlider } from '../shared'

type UpsType = 'offline' | 'line_interactive' | 'online'

const TRANSFER_MS: Record<UpsType, number> = { offline: 8, line_interactive: 4, online: 0 }

export function UpsBasicsLesson() {
  const { t } = useTranslation()
  const [type, setType] = useState<UpsType>('line_interactive')
  const [kva, setKva] = useState(1.5)
  const [pf, setPf] = useState(0.8)
  const [loadW, setLoadW] = useState(400)
  const [batteryAh, setBatteryAh] = useState(9)
  const [batteryV, setBatteryV] = useState(12)
  const [invEff, setInvEff] = useState(0.9)

  const { maxW, runtimeMin, transferMs } = useMemo(() => {
    const maxW = kva * pf * 1000
    const energyWh = batteryAh * batteryV * invEff
    const runtimeH = loadW > 0 ? energyWh / loadW : 0
    return {
      maxW,
      runtimeMin: runtimeH * 60,
      transferMs: TRANSFER_MS[type],
    }
  }, [kva, pf, loadW, batteryAh, batteryV, invEff, type])

  const overloaded = loadW > maxW

  return (
    <div className="space-y-6">
      <LessonCard>
        <SectionHeader title={t('learn.lessons.ups_basics.title')} />
        <Prose>
          <p>{t('learn.lessons.ups_basics.intro')}</p>
        </Prose>
      </LessonCard>

      <LessonCard>
        <SectionHeader title={t('learn.tryYourself')} />
        <Playground>
          <div className="grid grid-cols-3 gap-1 rounded-lg border border-zinc-200 p-1 dark:border-zinc-700">
            {(['offline', 'line_interactive', 'online'] as const).map((tp) => (
              <button
                key={tp}
                type="button"
                onClick={() => setType(tp)}
                className={`min-h-[40px] rounded-md px-1 py-1.5 text-[11px] font-semibold leading-tight transition-colors touch-manipulation sm:px-2 sm:text-sm ${
                  type === tp
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                }`}
              >
                {t(`learn.lessons.ups_basics.types.${tp}`)}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-zinc-600 dark:text-zinc-300">
            {t(`learn.lessons.ups_basics.typeExplain.${type}`)}
          </p>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <LabelSlider label={t('learn.lessons.ups_basics.kva')}       unit="kVA" value={kva}       min={0.5} max={10} step={0.1} onChange={setKva} />
            <LabelSlider label={t('learn.lessons.ups_basics.pf')}                   value={pf}        min={0.5} max={1}  step={0.05} onChange={setPf} />
            <LabelSlider label={t('learn.lessons.ups_basics.loadW')}     unit="W"   value={loadW}     min={50}  max={5000} step={10} onChange={setLoadW} />
            <LabelSlider label={t('learn.lessons.ups_basics.batteryAh')} unit="Ah"  value={batteryAh} min={4}   max={200} step={1} onChange={setBatteryAh} />
            <LabelSlider label={t('learn.lessons.ups_basics.batteryV')}  unit="V"   value={batteryV}  min={12}  max={48}  step={12} onChange={setBatteryV} />
            <LabelSlider label={t('learn.lessons.ups_basics.invEff')}               value={invEff}    min={0.7} max={0.98} step={0.02} onChange={setInvEff} />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Tile label={t('learn.lessons.ups_basics.maxW')}       value={`${Math.round(maxW)} W`}                              tone={overloaded ? 'red' : 'blue'} />
            <Tile label={t('learn.lessons.ups_basics.runtime')}    value={`${runtimeMin < 60 ? runtimeMin.toFixed(0) + ' min' : (runtimeMin / 60).toFixed(1) + ' h'}`} tone="amber" />
            <Tile label={t('learn.lessons.ups_basics.transferMs')} value={type === 'online' ? '0 ms' : `~${transferMs} ms`}     tone="green" />
          </div>

          {overloaded && (
            <div className="mt-3 rounded-xl border border-red-300 bg-red-50 p-3 text-sm font-semibold text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200">
              {t('learn.lessons.ups_basics.overload')}
            </div>
          )}
        </Playground>
      </LessonCard>

      <LessonCard>
        <SectionHeader title={t('learn.keyPoints')} />
        <KeyPoints
          points={[
            t('learn.lessons.ups_basics.point1'),
            t('learn.lessons.ups_basics.point2'),
            t('learn.lessons.ups_basics.point3'),
          ]}
        />
      </LessonCard>
    </div>
  )
}

function Tile({ label, value, tone }: { label: string; value: string; tone: 'blue' | 'amber' | 'green' | 'red' }) {
  const bg = tone === 'blue' ? 'from-blue-500 to-blue-700'
           : tone === 'amber' ? 'from-amber-500 to-amber-700'
           : tone === 'green' ? 'from-green-500 to-green-700'
           : 'from-red-500 to-red-700'
  return (
    <div className={`rounded-2xl bg-gradient-to-br ${bg} p-4 text-center text-white shadow-md`}>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-white/80">{label}</p>
      <p className="mt-1 font-mono text-xl font-bold tabular-nums">{value}</p>
    </div>
  )
}
