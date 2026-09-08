'use client'

import { useTranslation } from 'react-i18next'
import type { CurrentRating, TimerMode, TimerProperties } from '@/lib/types/panel'
import { Label } from '@/components/ui/Label'
import { Select } from '@/components/ui/Select'
import { RATINGS, TIMER_MODES } from './constants'

interface Props {
  props: TimerProperties
  onChange: (p: TimerProperties) => void
}

export function TimerForm({ props, onChange }: Props) {
  const { t } = useTranslation()
  return (
    <>
      <div>
        <Label htmlFor="timer-mode">{t('properties.timerMode')}</Label>
        <Select
          id="timer-mode"
          value={props.mode}
          onChange={(e) => onChange({ ...props, mode: e.target.value as TimerMode })}
        >
          {TIMER_MODES.map((m) => (
            <option key={m} value={m}>{t(`properties.timerModes.${m}`)}</option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="timer-rating">{t('properties.rating')}</Label>
        <Select
          id="timer-rating"
          value={props.rating}
          onChange={(e) => onChange({ ...props, rating: Number(e.target.value) as CurrentRating })}
        >
          {RATINGS.map((r) => <option key={r} value={r}>{r}A</option>)}
        </Select>
      </div>
    </>
  )
}
