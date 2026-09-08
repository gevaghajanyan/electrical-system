'use client'

import { useTranslation } from 'react-i18next'
import type { VoltageRelayProperties } from '@/lib/types/panel'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'

interface Props {
  props: VoltageRelayProperties
  onChange: (p: VoltageRelayProperties) => void
}

export function VoltageRelayForm({ props, onChange }: Props) {
  const { t } = useTranslation()
  return (
    <>
      <div>
        <Label htmlFor="vr-min">{t('properties.minVoltage')}</Label>
        <Input
          id="vr-min"
          type="number"
          value={props.minVoltage}
          min={100}
          max={400}
          onChange={(e) => onChange({ ...props, minVoltage: Number(e.target.value) })}
        />
      </div>
      <div>
        <Label htmlFor="vr-max">{t('properties.maxVoltage')}</Label>
        <Input
          id="vr-max"
          type="number"
          value={props.maxVoltage}
          min={100}
          max={400}
          onChange={(e) => onChange({ ...props, maxVoltage: Number(e.target.value) })}
        />
      </div>
      <div>
        <Label htmlFor="vr-delay">{t('properties.tripDelay')}</Label>
        <Input
          id="vr-delay"
          type="number"
          value={props.delaySeconds}
          min={0}
          max={600}
          onChange={(e) => onChange({ ...props, delaySeconds: Number(e.target.value) })}
        />
      </div>
    </>
  )
}
