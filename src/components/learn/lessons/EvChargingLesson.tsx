'use client'

import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LessonCard, SectionHeader, Prose, KeyPoints, Playground, LabelSlider } from '../shared'

type Mode = 'mode2' | 'mode3' | 'dc_fast'

const MODE_MAX_A: Record<Mode, number> = { mode2: 10, mode3: 32, dc_fast: 250 }
const MODE_PHASE: Record<Mode, 1 | 3> = { mode2: 1, mode3: 3, dc_fast: 1 } // DC skips AC math

export function EvChargingLesson() {
  const { t } = useTranslation()
  const [mode, setMode] = useState<Mode>('mode3')
  const [current, setCurrent] = useState(16)
  const [voltage, setVoltage] = useState(230)
  const [batteryKwh, setBatteryKwh] = useState(60)
  const [socDelta, setSocDelta] = useState(60)

  const clampedI = Math.min(current, MODE_MAX_A[mode])
  const phase = MODE_PHASE[mode]

  const { kw, hours, minutes } = useMemo(() => {
    let kw = 0
    if (mode === 'dc_fast') {
      kw = clampedI * 400 / 1000 // DC fast ≈ battery-pack voltage
    } else if (phase === 3) {
      kw = (Math.sqrt(3) * 400 * clampedI) / 1000
    } else {
      kw = (voltage * clampedI) / 1000
    }
    const kwhNeeded = batteryKwh * (socDelta / 100)
    const hrs = kw > 0 ? kwhNeeded / kw : 0
    return { kw, hours: Math.floor(hrs), minutes: Math.round((hrs - Math.floor(hrs)) * 60) }
  }, [mode, clampedI, voltage, batteryKwh, socDelta, phase])

  return (
    <div className="space-y-6">
      <LessonCard>
        <SectionHeader title={t('learn.lessons.ev_charging.title')} />
        <Prose>
          <p>{t('learn.lessons.ev_charging.intro')}</p>
        </Prose>
      </LessonCard>

      <LessonCard>
        <SectionHeader title={t('learn.tryYourself')} />
        <Playground>
          <div className="grid grid-cols-3 gap-1 rounded-lg border border-zinc-200 p-1 dark:border-zinc-700">
            {(['mode2', 'mode3', 'dc_fast'] as const).map((m) => (
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
                {t(`learn.lessons.ev_charging.modes.${m}`)}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-zinc-600 dark:text-zinc-300">
            {t(`learn.lessons.ev_charging.modeExplain.${mode}`)}
          </p>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <LabelSlider label={t('learn.lessons.ev_charging.current')} unit="A" value={clampedI} min={6} max={MODE_MAX_A[mode]} step={1} onChange={setCurrent} />
            <LabelSlider label={t('learn.lessons.ev_charging.batteryKwh')} unit="kWh" value={batteryKwh} min={10} max={120} step={5} onChange={setBatteryKwh} />
            {mode !== 'dc_fast' && phase === 1 && (
              <LabelSlider label={t('learn.lessons.ev_charging.voltage')} unit="V" value={voltage} min={110} max={240} step={5} onChange={setVoltage} />
            )}
            <LabelSlider label={t('learn.lessons.ev_charging.socDelta')} unit="%" value={socDelta} min={10} max={100} step={5} onChange={setSocDelta} />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Tile label={t('learn.lessons.ev_charging.power')}    value={`${kw.toFixed(1)} kW`}                  tone="blue" />
            <Tile label={t('learn.lessons.ev_charging.duration')} value={`${hours} h ${minutes.toString().padStart(2, '0')} min`} tone="amber" />
          </div>
        </Playground>
      </LessonCard>

      <LessonCard>
        <SectionHeader title={t('learn.keyPoints')} />
        <KeyPoints
          points={[
            t('learn.lessons.ev_charging.point1'),
            t('learn.lessons.ev_charging.point2'),
            t('learn.lessons.ev_charging.point3'),
          ]}
        />
      </LessonCard>
    </div>
  )
}

function Tile({ label, value, tone }: { label: string; value: string; tone: 'blue' | 'amber' }) {
  const bg = tone === 'blue' ? 'from-blue-500 to-blue-700' : 'from-amber-500 to-amber-700'
  return (
    <div className={`rounded-2xl bg-gradient-to-br ${bg} p-4 text-center text-white shadow-md`}>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-white/80">{label}</p>
      <p className="mt-1 font-mono text-xl font-bold tabular-nums">{value}</p>
    </div>
  )
}
