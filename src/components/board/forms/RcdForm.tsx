'use client'

import { useTranslation } from 'react-i18next'
import type { CurrentRating, RcdProperties, RcdSensitivity, RcdType } from '@/lib/types/panel'
import { Label } from '@/components/ui/Label'
import { Select } from '@/components/ui/Select'
import { RATINGS, RCD_TYPES, SENSITIVITIES } from './constants'

interface Props {
  props: RcdProperties
  onChange: (p: RcdProperties) => void
}

export function RcdForm({ props, onChange }: Props) {
  const { t } = useTranslation()
  return (
    <>
      <div>
        <Label htmlFor="rcd-rating">{t('properties.rating')}</Label>
        <Select
          id="rcd-rating"
          value={props.rating}
          onChange={(e) => onChange({ ...props, rating: Number(e.target.value) as CurrentRating })}
        >
          {RATINGS.map((r) => <option key={r} value={r}>{r}A</option>)}
        </Select>
      </div>
      <div>
        <Label htmlFor="rcd-sens">{t('properties.sensitivity')}</Label>
        <Select
          id="rcd-sens"
          value={props.sensitivity}
          onChange={(e) => onChange({ ...props, sensitivity: Number(e.target.value) as RcdSensitivity })}
        >
          {SENSITIVITIES.map((s) => <option key={s} value={s}>{s}mA</option>)}
        </Select>
      </div>
      <div>
        <Label htmlFor="rcd-type">{t('properties.type')}</Label>
        <Select
          id="rcd-type"
          value={props.type}
          onChange={(e) => onChange({ ...props, type: e.target.value as RcdType })}
        >
          {RCD_TYPES.map((t2) => <option key={t2} value={t2}>{t('properties.typeValue', { t: t2 })}</option>)}
        </Select>
      </div>
    </>
  )
}
