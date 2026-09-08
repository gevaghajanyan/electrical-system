'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CalcCard, CalcHeader, Field, FieldRow, ResultBig, ResultRow, fmt } from './shared'

export function BatteryLifeCalc() {
  const { t } = useTranslation()
  const [capacity, setCapacity] = useState('2000')
  const [current, setCurrent] = useState('150')
  const [derate, setDerate] = useState('0.7')

  const cap = parseFloat(capacity) || 0  // mAh
  const load = parseFloat(current) || 0  // mA
  const eff = Math.min(1, Math.max(0.1, parseFloat(derate) || 0.7))

  const hours = load > 0 ? (cap / load) * eff : 0
  const days = hours / 24

  const formatted = hours >= 24
    ? `${fmt(days, 1)} ${t('calc.battery.daysUnit')}`
    : `${fmt(hours, 2)} ${t('calc.battery.hoursUnit')}`

  return (
    <CalcCard>
      <CalcHeader title={t('calc.battery.title')} description={t('calc.battery.description')} />
      <div className="space-y-4">
        <FieldRow>
          <Field id="bat-cap" label={t('calc.battery.capacity')} value={capacity} onChange={setCapacity} unit="mAh" min={0} />
          <Field id="bat-load" label={t('calc.battery.load')} value={current} onChange={setCurrent} unit="mA" min={0} />
          <Field id="bat-eff" label={t('calc.battery.derating')} value={derate} onChange={setDerate} step={0.05} min={0.1} max={1} hint={t('calc.battery.deratingHint')} />
        </FieldRow>

        <ResultBig label={t('calc.battery.estimatedLife')} value={formatted} />

        <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900">
          <ResultRow label={t('calc.battery.exactHours')} value={fmt(hours, 2)} unit="h" />
          <ResultRow label={t('calc.battery.exactDays')} value={fmt(days, 2)} unit="d" />
        </div>
      </div>
    </CalcCard>
  )
}
