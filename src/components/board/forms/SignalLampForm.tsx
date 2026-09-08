'use client'

import { useTranslation } from 'react-i18next'
import type { LampColor, SignalLampProperties } from '@/lib/types/panel'
import { Label } from '@/components/ui/Label'
import { Select } from '@/components/ui/Select'
import { LAMP_COLORS } from './constants'

interface Props {
  props: SignalLampProperties
  onChange: (p: SignalLampProperties) => void
}

export function SignalLampForm({ props, onChange }: Props) {
  const { t } = useTranslation()
  return (
    <>
      <div>
        <Label htmlFor="lamp-color">{t('properties.color')}</Label>
        <Select
          id="lamp-color"
          value={props.color}
          onChange={(e) => onChange({ ...props, color: e.target.value as LampColor })}
        >
          {LAMP_COLORS.map((c) => (
            <option key={c} value={c}>{t(`properties.lampColors.${c}`)}</option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="lamp-voltage">{t('properties.voltage')}</Label>
        <Select
          id="lamp-voltage"
          value={props.voltage}
          onChange={(e) => onChange({ ...props, voltage: Number(e.target.value) as 24 | 230 | 400 })}
        >
          <option value="24">24V</option>
          <option value="230">230V</option>
          <option value="400">400V</option>
        </Select>
      </div>
    </>
  )
}
