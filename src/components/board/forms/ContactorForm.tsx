'use client'

import { useTranslation } from 'react-i18next'
import type { CoilVoltage, ContactorPoles, ContactorProperties, CurrentRating } from '@/lib/types/panel'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select } from '@/components/ui/Select'
import { COIL_VOLTAGES, CONTACTOR_POLES, RATINGS } from './constants'

interface Props {
  props: ContactorProperties
  onChange: (p: ContactorProperties) => void
}

export function ContactorForm({ props, onChange }: Props) {
  const { t } = useTranslation()
  return (
    <>
      <div>
        <Label htmlFor="ctr-rating">{t('properties.rating')}</Label>
        <Select
          id="ctr-rating"
          value={props.rating}
          onChange={(e) => onChange({ ...props, rating: Number(e.target.value) as CurrentRating })}
        >
          {RATINGS.map((r) => <option key={r} value={r}>{r}A</option>)}
        </Select>
      </div>
      <div>
        <Label htmlFor="ctr-poles">{t('properties.poles')}</Label>
        <Select
          id="ctr-poles"
          value={props.poles}
          onChange={(e) => onChange({ ...props, poles: Number(e.target.value) as ContactorPoles })}
        >
          {CONTACTOR_POLES.map((p) => <option key={p} value={p}>{p}P</option>)}
        </Select>
      </div>
      <div>
        <Label htmlFor="ctr-coil">{t('properties.coilVoltage')}</Label>
        <Select
          id="ctr-coil"
          value={props.coilVoltage}
          onChange={(e) => onChange({ ...props, coilVoltage: Number(e.target.value) as CoilVoltage })}
        >
          {COIL_VOLTAGES.map((v) => <option key={v} value={v}>{v}V</option>)}
        </Select>
      </div>
      <div>
        <Label htmlFor="ctr-aux">{t('properties.auxContacts')}</Label>
        <Input
          id="ctr-aux"
          type="number"
          min={0}
          max={8}
          value={props.auxContacts ?? 0}
          onChange={(e) => onChange({ ...props, auxContacts: Number(e.target.value) })}
        />
      </div>
    </>
  )
}
