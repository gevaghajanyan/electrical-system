'use client'

import { useTranslation } from 'react-i18next'
import type { CurrentRating, DimmerLoad, DimmerProperties } from '@/lib/types/panel'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select } from '@/components/ui/Select'
import { RATINGS } from './constants'

interface Props {
  props: DimmerProperties
  onChange: (p: DimmerProperties) => void
}

const LOAD_TYPES: DimmerLoad[] = ['incandescent', 'halogen', 'led', 'universal']

export function DimmerForm({ props, onChange }: Props) {
  const { t } = useTranslation()
  return (
    <>
      <div>
        <Label htmlFor="dim-rating">{t('properties.rating')}</Label>
        <Select
          id="dim-rating"
          value={props.rating}
          onChange={(e) => onChange({ ...props, rating: Number(e.target.value) as CurrentRating })}
        >
          {RATINGS.map((r) => <option key={r} value={r}>{r}A</option>)}
        </Select>
      </div>
      <div>
        <Label htmlFor="dim-w">{t('properties.maxWatts')}</Label>
        <Input
          id="dim-w"
          type="number"
          min={10}
          max={2000}
          step={10}
          value={props.maxWatts}
          onChange={(e) => onChange({ ...props, maxWatts: Number(e.target.value) })}
        />
      </div>
      <div>
        <Label htmlFor="dim-load">{t('properties.loadType')}</Label>
        <Select
          id="dim-load"
          value={props.loadType}
          onChange={(e) => onChange({ ...props, loadType: e.target.value as DimmerLoad })}
        >
          {LOAD_TYPES.map((l) => (
            <option key={l} value={l}>{t(`properties.dimmerLoads.${l}`)}</option>
          ))}
        </Select>
      </div>
    </>
  )
}
