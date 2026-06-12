'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { PanelElement, CurrentRating, TripCurve, RcdSensitivity, RcdType } from '@/lib/types/panel'
import type { McbProperties, RcdProperties, RcboProperties, IsolatorProperties, VoltageRelayProperties } from '@/lib/types/panel'
import { ELEMENT_DEFS_MAP } from '@/lib/constants/elementDefs'
import { panelStore } from '@/lib/store/panelStore'
import { useActivePanel, useSelectedElement } from '@/lib/hooks/usePanelStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { validateElement } from '@/lib/utils/validation'

const RATINGS: CurrentRating[] = [6, 10, 13, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125]
const CURVES: TripCurve[] = ['B', 'C', 'D']
const SENSITIVITIES: RcdSensitivity[] = [10, 30, 100, 300]
const RCD_TYPES: RcdType[] = ['AC', 'A', 'F', 'B']

function McbForm({ props, onChange }: { props: McbProperties; onChange: (p: McbProperties) => void }) {
  const { t } = useTranslation()
  return (
    <>
      <div>
        <Label htmlFor="mcb-rating">{t('properties.rating')}</Label>
        <Select id="mcb-rating" value={props.rating} onChange={(e) => onChange({ ...props, rating: Number(e.target.value) as CurrentRating })}>
          {RATINGS.map((r) => <option key={r} value={r}>{r}A</option>)}
        </Select>
      </div>
      <div>
        <Label htmlFor="mcb-curve">{t('properties.tripCurve')}</Label>
        <Select id="mcb-curve" value={props.curve} onChange={(e) => onChange({ ...props, curve: e.target.value as TripCurve })}>
          {CURVES.map((c) => <option key={c} value={c}>{t('properties.curve', { c })}</option>)}
        </Select>
      </div>
      <div>
        <Label htmlFor="mcb-ka">{t('properties.breakingCapacity')}</Label>
        <Select id="mcb-ka" value={props.breakingCapacity} onChange={(e) => onChange({ ...props, breakingCapacity: Number(e.target.value) })}>
          {[3, 6, 10, 15].map((v) => <option key={v} value={v}>{v} kA</option>)}
        </Select>
      </div>
    </>
  )
}

function RcdForm({ props, onChange }: { props: RcdProperties; onChange: (p: RcdProperties) => void }) {
  const { t } = useTranslation()
  return (
    <>
      <div>
        <Label htmlFor="rcd-rating">{t('properties.rating')}</Label>
        <Select id="rcd-rating" value={props.rating} onChange={(e) => onChange({ ...props, rating: Number(e.target.value) as CurrentRating })}>
          {RATINGS.map((r) => <option key={r} value={r}>{r}A</option>)}
        </Select>
      </div>
      <div>
        <Label htmlFor="rcd-sens">{t('properties.sensitivity')}</Label>
        <Select id="rcd-sens" value={props.sensitivity} onChange={(e) => onChange({ ...props, sensitivity: Number(e.target.value) as RcdSensitivity })}>
          {SENSITIVITIES.map((s) => <option key={s} value={s}>{s}mA</option>)}
        </Select>
      </div>
      <div>
        <Label htmlFor="rcd-type">{t('properties.type')}</Label>
        <Select id="rcd-type" value={props.type} onChange={(e) => onChange({ ...props, type: e.target.value as RcdType })}>
          {RCD_TYPES.map((t2) => <option key={t2} value={t2}>{t('properties.typeValue', { t: t2 })}</option>)}
        </Select>
      </div>
    </>
  )
}

function RcboForm({ props, onChange }: { props: RcboProperties; onChange: (p: RcboProperties) => void }) {
  const { t } = useTranslation()
  return (
    <>
      <div>
        <Label htmlFor="rcbo-rating">{t('properties.rating')}</Label>
        <Select id="rcbo-rating" value={props.rating} onChange={(e) => onChange({ ...props, rating: Number(e.target.value) as CurrentRating })}>
          {RATINGS.map((r) => <option key={r} value={r}>{r}A</option>)}
        </Select>
      </div>
      <div>
        <Label htmlFor="rcbo-curve">{t('properties.tripCurve')}</Label>
        <Select id="rcbo-curve" value={props.curve} onChange={(e) => onChange({ ...props, curve: e.target.value as TripCurve })}>
          {CURVES.map((c) => <option key={c} value={c}>{t('properties.curve', { c })}</option>)}
        </Select>
      </div>
      <div>
        <Label htmlFor="rcbo-sens">{t('properties.sensitivity')}</Label>
        <Select id="rcbo-sens" value={props.sensitivity} onChange={(e) => onChange({ ...props, sensitivity: Number(e.target.value) as RcdSensitivity })}>
          {SENSITIVITIES.map((s) => <option key={s} value={s}>{s}mA</option>)}
        </Select>
      </div>
      <div>
        <Label htmlFor="rcbo-type">{t('properties.rcdType')}</Label>
        <Select id="rcbo-type" value={props.type} onChange={(e) => onChange({ ...props, type: e.target.value as RcdType })}>
          {RCD_TYPES.map((t2) => <option key={t2} value={t2}>{t('properties.typeValue', { t: t2 })}</option>)}
        </Select>
      </div>
    </>
  )
}

function IsolatorForm({ props, onChange }: { props: IsolatorProperties; onChange: (p: IsolatorProperties) => void }) {
  const { t } = useTranslation()
  return (
    <div>
      <Label htmlFor="iso-rating">{t('properties.rating')}</Label>
      <Select id="iso-rating" value={props.rating} onChange={(e) => onChange({ ...props, rating: Number(e.target.value) as CurrentRating })}>
        {RATINGS.map((r) => <option key={r} value={r}>{r}A</option>)}
      </Select>
    </div>
  )
}

function VoltageRelayForm({ props, onChange }: { props: VoltageRelayProperties; onChange: (p: VoltageRelayProperties) => void }) {
  const { t } = useTranslation()
  return (
    <>
      <div>
        <Label htmlFor="vr-min">{t('properties.minVoltage')}</Label>
        <Input
          id="vr-min"
          type="number"
          value={props.minVoltage}
          min={100} max={400}
          onChange={(e) => onChange({ ...props, minVoltage: Number(e.target.value) })}
        />
      </div>
      <div>
        <Label htmlFor="vr-max">{t('properties.maxVoltage')}</Label>
        <Input
          id="vr-max"
          type="number"
          value={props.maxVoltage}
          min={100} max={400}
          onChange={(e) => onChange({ ...props, maxVoltage: Number(e.target.value) })}
        />
      </div>
      <div>
        <Label htmlFor="vr-delay">{t('properties.tripDelay')}</Label>
        <Input
          id="vr-delay"
          type="number"
          value={props.delaySeconds}
          min={0} max={600}
          onChange={(e) => onChange({ ...props, delaySeconds: Number(e.target.value) })}
        />
      </div>
    </>
  )
}

function PropertiesForm({ element }: { element: PanelElement }) {
  const { t } = useTranslation()
  const def = ELEMENT_DEFS_MAP.get(element.typeId)
  const [label, setLabel] = useState(element.label)
  const [notes, setNotes] = useState(element.notes)
  const [elementProps, setElementProps] = useState(element.properties)

  useEffect(() => {
    setLabel(element.label)
    setNotes(element.notes)
    setElementProps(element.properties)
  }, [element.id, element.label, element.notes, element.properties])

  const activePanel = useActivePanel()
  const errors = activePanel ? validateElement(element, activePanel) : []

  function save() {
    panelStore.updateElement(element.id, { label, notes, properties: elementProps })
  }

  function handleDelete() {
    if (confirm(t('properties.confirmDelete'))) {
      panelStore.deleteElement(element.id)
    }
  }

  const isMcb = elementProps.kind === 'mcb'
  const isRcd = elementProps.kind === 'rcd'
  const isRcbo = elementProps.kind === 'rcbo'
  const isIso = elementProps.kind === 'isolator'
  const isVr = elementProps.kind === 'voltage_relay'

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
        <div className="flex items-center gap-2">
          <div
            className="h-7 w-7 rounded-md flex items-center justify-center text-xs font-bold shrink-0"
            style={{ backgroundColor: def?.color, color: def?.textColor }}
          >
            {def?.shortLabel}
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate">
              {label || def?.label || element.typeId}
            </h2>
            <p className="text-xs text-zinc-500">{def?.label}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-4">
        {errors.length > 0 && (
          <div className="space-y-1">
            {errors.map((err, i) => (
              <div key={i} className={`flex items-start gap-1.5 rounded-md px-2.5 py-1.5 text-xs ${err.severity === 'error' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
                <span className="mt-0.5 shrink-0">⚠</span>
                <span>{err.message}</span>
              </div>
            ))}
          </div>
        )}

        <div>
          <Label htmlFor="el-label">{t('properties.label')}</Label>
          <Input id="el-label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder={t('properties.labelPlaceholder')} />
        </div>

        <div>
          <Label htmlFor="el-notes">{t('properties.notes')}</Label>
          <Textarea id="el-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder={t('properties.notesPlaceholder')} />
        </div>

        {isMcb && (
          <McbForm props={elementProps} onChange={(p) => setElementProps(p)} />
        )}
        {isRcd && (
          <RcdForm props={elementProps} onChange={(p) => setElementProps(p)} />
        )}
        {isRcbo && (
          <RcboForm props={elementProps} onChange={(p) => setElementProps(p)} />
        )}
        {isIso && (
          <IsolatorForm props={elementProps} onChange={(p) => setElementProps(p)} />
        )}
        {isVr && (
          <VoltageRelayForm props={elementProps} onChange={(p) => setElementProps(p)} />
        )}

        <div className="pt-1">
          <p className="text-xs text-zinc-400">
            {t('properties.slotInfo', {
              start: element.slotStart + 1,
              end: element.slotStart + element.slotWidth,
              width: element.slotWidth,
            })}
          </p>
        </div>
      </div>

      <div className="border-t border-zinc-200 px-4 py-3 dark:border-zinc-700 flex gap-2">
        <Button variant="danger" size="sm" onClick={handleDelete} className="shrink-0">
          {t('properties.delete')}
        </Button>
        <Button variant="primary" size="sm" onClick={save} className="flex-1">
          {t('properties.apply')}
        </Button>
      </div>
    </div>
  )
}

function EmptyState({ className = '' }: { className?: string }) {
  const { t } = useTranslation()
  return (
    <div className={['flex h-full items-center justify-center p-6', className].join(' ')}>
      <div className="text-center">
        <svg className="mx-auto h-8 w-8 text-zinc-300 dark:text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
          {t('properties.empty')}
        </p>
      </div>
    </div>
  )
}

interface PropertiesPanelProps {
  className?: string
}

export function PropertiesPanel({ className = '' }: PropertiesPanelProps) {
  const element = useSelectedElement()

  if (!element) {
    return (
      <EmptyState className={className} />
    )
  }

  return (
    <div className={['flex flex-col h-full overflow-hidden', className].join(' ')}>
      <PropertiesForm element={element} />
    </div>
  )
}

