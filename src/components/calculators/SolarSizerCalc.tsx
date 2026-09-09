'use client'

import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CalcCard, CalcHeader, Field, FieldRow, ResultBig, ResultRow, fmt } from './shared'

export function SolarSizerCalc() {
  const { t } = useTranslation()
  const [dailyKwh, setDailyKwh] = useState('15')
  const [sunHours, setSunHours] = useState('4.5')
  const [autonomyDays, setAutonomyDays] = useState('1')
  const [batteryDoD, setBatteryDoD] = useState('80')
  const [batteryV, setBatteryV] = useState('48')
  const [systemEff, setSystemEff] = useState('0.75')

  const { arrayKw, batteryKwh, batteryAh, inverterKw } = useMemo(() => {
    const D = parseFloat(dailyKwh) || 0
    const H = parseFloat(sunHours) || 4.5
    const A = parseFloat(autonomyDays) || 1
    const DoD = Math.max(0.2, Math.min(1, (parseFloat(batteryDoD) || 80) / 100))
    const V = Math.max(12, parseFloat(batteryV) || 48)
    const eta = Math.max(0.3, Math.min(1, parseFloat(systemEff) || 0.75))
    const arrayKw = D / (H * eta)
    const batteryKwh = (D * A) / DoD
    const batteryAh = (batteryKwh * 1000) / V
    // Inverter sized ~1.25× peak instantaneous load ≈ 30% of daily energy / avg hours (rough heuristic)
    const inverterKw = Math.max(1, D / 4)
    return { arrayKw, batteryKwh, batteryAh, inverterKw }
  }, [dailyKwh, sunHours, autonomyDays, batteryDoD, batteryV, systemEff])

  return (
    <CalcCard>
      <CalcHeader title={t('calc.solar_sizer.title')} description={t('calc.solar_sizer.description')} />
      <div className="space-y-4">
        <FieldRow>
          <Field id="ss-kwh"   label={t('calc.solar_sizer.dailyKwh')}     value={dailyKwh}     onChange={setDailyKwh}     unit="kWh" min={1} step={0.5} />
          <Field id="ss-sun"   label={t('calc.solar_sizer.sunHours')}     value={sunHours}     onChange={setSunHours}     unit="h"   min={1} step={0.1} hint={t('calc.solar_sizer.sunHint')} />
        </FieldRow>
        <FieldRow>
          <Field id="ss-days"  label={t('calc.solar_sizer.autonomyDays')} value={autonomyDays} onChange={setAutonomyDays} unit="d"   min={0.5} step={0.5} />
          <Field id="ss-dod"   label={t('calc.solar_sizer.batteryDoD')}   value={batteryDoD}   onChange={setBatteryDoD}   unit="%"   min={20} max={100} step={5} />
        </FieldRow>
        <FieldRow>
          <Field id="ss-bv"    label={t('calc.solar_sizer.batteryV')}     value={batteryV}     onChange={setBatteryV}     unit="V"   min={12} step={12} />
          <Field id="ss-eff"   label={t('calc.solar_sizer.systemEff')}    value={systemEff}    onChange={setSystemEff}    step={0.05} min={0.3} max={1} />
        </FieldRow>

        <div className="mt-4 space-y-2">
          <ResultBig label={t('calc.solar_sizer.arrayKw')} value={`${fmt(arrayKw, 2)} kW`} tone="brand" />
          <ResultRow label={t('calc.solar_sizer.batteryKwh')} value={`${fmt(batteryKwh, 1)} kWh`} />
          <ResultRow label={t('calc.solar_sizer.batteryAh')}  value={`${fmt(batteryAh, 0)} Ah @ ${batteryV} V`} />
          <ResultRow label={t('calc.solar_sizer.inverterKw')} value={`${fmt(inverterKw, 1)} kW`} />
        </div>

        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
          {t('calc.solar_sizer.notes')}
        </p>
      </div>
    </CalcCard>
  )
}
