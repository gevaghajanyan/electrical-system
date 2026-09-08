'use client'

import { useTranslation } from 'react-i18next'
import type { CurrentRating, MotorStarterProperties } from '@/lib/types/panel'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select } from '@/components/ui/Select'
import { RATINGS } from './constants'

interface Props {
  props: MotorStarterProperties
  onChange: (p: MotorStarterProperties) => void
}

export function MotorStarterForm({ props, onChange }: Props) {
  const { t } = useTranslation()
  return (
    <>
      <div>
        <Label htmlFor="ms-rating">{t('properties.rating')}</Label>
        <Select
          id="ms-rating"
          value={props.rating}
          onChange={(e) => onChange({ ...props, rating: Number(e.target.value) as CurrentRating })}
        >
          {RATINGS.map((r) => <option key={r} value={r}>{r}A</option>)}
        </Select>
      </div>
      <div>
        <Label htmlFor="ms-power">{t('properties.motorPower')}</Label>
        <Input
          id="ms-power"
          type="number"
          step={0.1}
          min={0.1}
          max={200}
          value={props.powerKw}
          onChange={(e) => onChange({ ...props, powerKw: Number(e.target.value) })}
        />
      </div>
      <div>
        <Label htmlFor="ms-class">{t('properties.overloadClass')}</Label>
        <Select
          id="ms-class"
          value={props.overloadClass}
          onChange={(e) => onChange({ ...props, overloadClass: e.target.value as MotorStarterProperties['overloadClass'] })}
        >
          <option value="10A">Class 10A</option>
          <option value="10">Class 10</option>
          <option value="20">Class 20</option>
          <option value="30">Class 30</option>
        </Select>
      </div>
    </>
  )
}
