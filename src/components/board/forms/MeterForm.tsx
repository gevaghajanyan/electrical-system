'use client'

import { useTranslation } from 'react-i18next'
import type { CurrentRating, MeterProperties } from '@/lib/types/panel'
import { Label } from '@/components/ui/Label'
import { Select } from '@/components/ui/Select'
import { RATINGS } from './constants'

interface Props {
  props: MeterProperties
  onChange: (p: MeterProperties) => void
}

export function MeterForm({ props, onChange }: Props) {
  const { t } = useTranslation()
  return (
    <>
      <div>
        <Label htmlFor="meter-phase">{t('properties.supply')}</Label>
        <Select
          id="meter-phase"
          value={props.threePhase ? '3' : '1'}
          onChange={(e) => onChange({ ...props, threePhase: e.target.value === '3' })}
        >
          <option value="1">{t('properties.singlePhase')}</option>
          <option value="3">{t('properties.threePhase')}</option>
        </Select>
      </div>
      <div>
        <Label htmlFor="meter-rating">{t('properties.rating')}</Label>
        <Select
          id="meter-rating"
          value={props.rating}
          onChange={(e) => onChange({ ...props, rating: Number(e.target.value) as CurrentRating })}
        >
          {RATINGS.map((r) => <option key={r} value={r}>{r}A</option>)}
        </Select>
      </div>
      <div>
        <Label htmlFor="meter-mid">{t('properties.midClass')}</Label>
        <Select
          id="meter-mid"
          value={props.midClass ?? ''}
          onChange={(e) => {
            const v = e.target.value
            onChange({ ...props, midClass: (v === '' ? undefined : (v as 'B' | 'C' | 'D')) })
          }}
        >
          <option value="">—</option>
          <option value="B">B</option>
          <option value="C">C</option>
          <option value="D">D</option>
        </Select>
      </div>
    </>
  )
}
