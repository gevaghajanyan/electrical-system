'use client'

import { useTranslation } from 'react-i18next'
import type { BuzzerProperties } from '@/lib/types/panel'
import { Label } from '@/components/ui/Label'
import { Select } from '@/components/ui/Select'

interface Props {
  props: BuzzerProperties
  onChange: (p: BuzzerProperties) => void
}

export function BuzzerForm({ props, onChange }: Props) {
  const { t } = useTranslation()
  return (
    <div>
      <Label htmlFor="buz-voltage">{t('properties.voltage')}</Label>
      <Select
        id="buz-voltage"
        value={props.voltage}
        onChange={(e) => onChange({ ...props, voltage: Number(e.target.value) as 12 | 24 | 230 })}
      >
        <option value="12">12V</option>
        <option value="24">24V</option>
        <option value="230">230V</option>
      </Select>
    </div>
  )
}
