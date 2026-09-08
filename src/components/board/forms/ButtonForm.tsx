'use client'

import { useTranslation } from 'react-i18next'
import type { ButtonProperties, LampColor } from '@/lib/types/panel'
import { Label } from '@/components/ui/Label'
import { Select } from '@/components/ui/Select'
import { LAMP_COLORS } from './constants'

interface Props {
  props: ButtonProperties
  onChange: (p: ButtonProperties) => void
}

export function ButtonForm({ props, onChange }: Props) {
  const { t } = useTranslation()
  return (
    <>
      <div>
        <Label htmlFor="btn-variant">{t('properties.buttonType')}</Label>
        <Select
          id="btn-variant"
          value={props.variant}
          onChange={(e) => onChange({ ...props, variant: e.target.value as ButtonProperties['variant'] })}
        >
          <option value="push">{t('properties.buttonVariants.push')}</option>
          <option value="toggle">{t('properties.buttonVariants.toggle')}</option>
          <option value="emergency_stop">{t('properties.buttonVariants.emergency_stop')}</option>
        </Select>
      </div>
      <div>
        <Label htmlFor="btn-color">{t('properties.color')}</Label>
        <Select
          id="btn-color"
          value={props.color}
          onChange={(e) => onChange({ ...props, color: e.target.value as LampColor })}
        >
          {LAMP_COLORS.map((c) => (
            <option key={c} value={c}>{t(`properties.lampColors.${c}`)}</option>
          ))}
        </Select>
      </div>
    </>
  )
}
