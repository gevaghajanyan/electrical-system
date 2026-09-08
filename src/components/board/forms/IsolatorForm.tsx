'use client'

import { useTranslation } from 'react-i18next'
import type { CurrentRating, IsolatorProperties } from '@/lib/types/panel'
import { Label } from '@/components/ui/Label'
import { Select } from '@/components/ui/Select'
import { RATINGS } from './constants'

interface Props {
  props: IsolatorProperties
  onChange: (p: IsolatorProperties) => void
}

export function IsolatorForm({ props, onChange }: Props) {
  const { t } = useTranslation()
  return (
    <div>
      <Label htmlFor="iso-rating">{t('properties.rating')}</Label>
      <Select
        id="iso-rating"
        value={props.rating}
        onChange={(e) => onChange({ ...props, rating: Number(e.target.value) as CurrentRating })}
      >
        {RATINGS.map((r) => <option key={r} value={r}>{r}A</option>)}
      </Select>
    </div>
  )
}
