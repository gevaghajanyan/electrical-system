'use client'

import { useTranslation } from 'react-i18next'
import type { SpdType, SurgeProtectorProperties } from '@/lib/types/panel'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select } from '@/components/ui/Select'
import { SPD_TYPES } from './constants'

interface Props {
  props: SurgeProtectorProperties
  onChange: (p: SurgeProtectorProperties) => void
}

export function SurgeProtectorForm({ props, onChange }: Props) {
  const { t } = useTranslation()
  return (
    <>
      <div>
        <Label htmlFor="spd-type">{t('properties.spdType')}</Label>
        <Select
          id="spd-type"
          value={props.type}
          onChange={(e) => onChange({ ...props, type: e.target.value as SpdType })}
        >
          {SPD_TYPES.map((t2) => <option key={t2} value={t2}>{t2}</option>)}
        </Select>
      </div>
      <div>
        <Label htmlFor="spd-in">{t('properties.nominalDischarge')}</Label>
        <Input
          id="spd-in"
          type="number"
          min={1}
          max={100}
          value={props.nominalCurrent}
          onChange={(e) => onChange({ ...props, nominalCurrent: Number(e.target.value) })}
        />
      </div>
      <div>
        <Label htmlFor="spd-up">{t('properties.protectionLevel')}</Label>
        <Input
          id="spd-up"
          type="number"
          step={0.1}
          min={0.5}
          max={10}
          value={props.protectionLevel}
          onChange={(e) => onChange({ ...props, protectionLevel: Number(e.target.value) })}
        />
      </div>
      <div>
        <Label htmlFor="spd-uc">{t('properties.maxOperatingVoltage')}</Label>
        <Input
          id="spd-uc"
          type="number"
          min={100}
          max={1000}
          value={props.maxOperatingVoltage}
          onChange={(e) => onChange({ ...props, maxOperatingVoltage: Number(e.target.value) })}
        />
      </div>
    </>
  )
}
