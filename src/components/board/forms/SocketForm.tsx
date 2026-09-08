'use client'

import { useTranslation } from 'react-i18next'
import type { SocketProperties } from '@/lib/types/panel'
import { Label } from '@/components/ui/Label'
import { Select } from '@/components/ui/Select'

interface Props {
  props: SocketProperties
  onChange: (p: SocketProperties) => void
}

export function SocketForm({ props, onChange }: Props) {
  const { t } = useTranslation()
  return (
    <>
      <div>
        <Label htmlFor="soc-rating">{t('properties.rating')}</Label>
        <Select
          id="soc-rating"
          value={props.rating}
          onChange={(e) => onChange({ ...props, rating: Number(e.target.value) as 10 | 16 })}
        >
          <option value="10">10A</option>
          <option value="16">16A</option>
        </Select>
      </div>
      <div>
        <Label htmlFor="soc-std">{t('properties.socketStandard')}</Label>
        <Select
          id="soc-std"
          value={props.standard}
          onChange={(e) => onChange({ ...props, standard: e.target.value as SocketProperties['standard'] })}
        >
          <option value="schuko">Schuko (CEE 7/4)</option>
          <option value="fr">French (CEE 7/5)</option>
          <option value="iec_blue">IEC 60309 blue</option>
        </Select>
      </div>
    </>
  )
}
