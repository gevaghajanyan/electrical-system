'use client'

import { useTranslation } from 'react-i18next'
import type { CurrentRating, RcboProperties, RcdSensitivity, RcdType, TripCurve } from '@/lib/types/panel'
import { Label } from '@/components/ui/Label'
import { Select } from '@/components/ui/Select'
import { CURVES, RATINGS, RCD_TYPES, SENSITIVITIES } from './constants'

interface Props {
  props: RcboProperties
  onChange: (p: RcboProperties) => void
}

export function RcboForm({ props, onChange }: Props) {
  const { t } = useTranslation()
  return (
    <>
      <div>
        <Label htmlFor="rcbo-rating">{t('properties.rating')}</Label>
        <Select
          id="rcbo-rating"
          value={props.rating}
          onChange={(e) => onChange({ ...props, rating: Number(e.target.value) as CurrentRating })}
        >
          {RATINGS.map((r) => <option key={r} value={r}>{r}A</option>)}
        </Select>
      </div>
      <div>
        <Label htmlFor="rcbo-curve">{t('properties.tripCurve')}</Label>
        <Select
          id="rcbo-curve"
          value={props.curve}
          onChange={(e) => onChange({ ...props, curve: e.target.value as TripCurve })}
        >
          {CURVES.map((c) => <option key={c} value={c}>{t('properties.curve', { c })}</option>)}
        </Select>
      </div>
      <div>
        <Label htmlFor="rcbo-sens">{t('properties.sensitivity')}</Label>
        <Select
          id="rcbo-sens"
          value={props.sensitivity}
          onChange={(e) => onChange({ ...props, sensitivity: Number(e.target.value) as RcdSensitivity })}
        >
          {SENSITIVITIES.map((s) => <option key={s} value={s}>{s}mA</option>)}
        </Select>
      </div>
      <div>
        <Label htmlFor="rcbo-type">{t('properties.rcdType')}</Label>
        <Select
          id="rcbo-type"
          value={props.type}
          onChange={(e) => onChange({ ...props, type: e.target.value as RcdType })}
        >
          {RCD_TYPES.map((t2) => <option key={t2} value={t2}>{t('properties.typeValue', { t: t2 })}</option>)}
        </Select>
      </div>
    </>
  )
}
