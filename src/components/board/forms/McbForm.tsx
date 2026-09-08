'use client'

import { useTranslation } from 'react-i18next'
import type { CurrentRating, McbProperties, TripCurve } from '@/lib/types/panel'
import { Label } from '@/components/ui/Label'
import { Select } from '@/components/ui/Select'
import { BREAKING_CAPACITIES, CURVES, RATINGS } from './constants'

interface Props {
  props: McbProperties
  onChange: (p: McbProperties) => void
}

export function McbForm({ props, onChange }: Props) {
  const { t } = useTranslation()
  return (
    <>
      <div>
        <Label htmlFor="mcb-rating">{t('properties.rating')}</Label>
        <Select
          id="mcb-rating"
          value={props.rating}
          onChange={(e) => onChange({ ...props, rating: Number(e.target.value) as CurrentRating })}
        >
          {RATINGS.map((r) => <option key={r} value={r}>{r}A</option>)}
        </Select>
      </div>
      <div>
        <Label htmlFor="mcb-curve">{t('properties.tripCurve')}</Label>
        <Select
          id="mcb-curve"
          value={props.curve}
          onChange={(e) => onChange({ ...props, curve: e.target.value as TripCurve })}
        >
          {CURVES.map((c) => <option key={c} value={c}>{t('properties.curve', { c })}</option>)}
        </Select>
      </div>
      <div>
        <Label htmlFor="mcb-ka">{t('properties.breakingCapacity')}</Label>
        <Select
          id="mcb-ka"
          value={props.breakingCapacity}
          onChange={(e) => onChange({ ...props, breakingCapacity: Number(e.target.value) })}
        >
          {BREAKING_CAPACITIES.map((v) => <option key={v} value={v}>{v} kA</option>)}
        </Select>
      </div>
    </>
  )
}
