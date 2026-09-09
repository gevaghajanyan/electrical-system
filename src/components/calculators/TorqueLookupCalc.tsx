'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CalcCard, CalcHeader, SelectField, ResultBig, ResultRow } from './shared'

/**
 * Typical tightening torques for terminal screws — indicative values across
 * DIN 46200 / EN 60947 / manufacturer datasheets. Always confirm with the
 * device's own nameplate before final tightening.
 */
type Screw = 'M2.5' | 'M3' | 'M3.5' | 'M4' | 'M5' | 'M6' | 'M8' | 'M10'
type Kind = 'mcb' | 'busbar' | 'motor' | 'terminal'

const TORQUE: Record<Kind, Partial<Record<Screw, string>>> = {
  mcb:      { 'M2.5': '0.4–0.5', 'M3': '0.5–0.6',  'M3.5': '0.8–1.0', 'M4': '1.2–1.5', 'M5': '2.0–2.5', 'M6': '2.5–3.0' },
  busbar:   { 'M4': '2.0–2.5', 'M5': '3.5–4.5', 'M6': '5.5–7.0', 'M8': '15–20', 'M10': '30–40' },
  motor:    { 'M4': '1.5–2.0', 'M5': '2.5–3.0', 'M6': '4.0–5.0', 'M8': '10–12', 'M10': '20–24' },
  terminal: { 'M2.5': '0.4–0.5', 'M3': '0.5–0.6', 'M3.5': '0.8', 'M4': '1.2', 'M5': '2.0', 'M6': '3.0' },
}

const AWG_FOR_TERMINAL: Record<Screw, string> = {
  'M2.5': '0.5–1.5 mm²',
  'M3':   '0.75–2.5 mm²',
  'M3.5': '1.5–4 mm²',
  'M4':   '2.5–6 mm²',
  'M5':   '6–16 mm²',
  'M6':   '10–35 mm²',
  'M8':   '25–95 mm²',
  'M10':  '50–240 mm²',
}

export function TorqueLookupCalc() {
  const { t } = useTranslation()
  const [kind, setKind] = useState<Kind>('mcb')
  const [screw, setScrew] = useState<Screw>('M4')

  const nm = TORQUE[kind][screw] ?? '—'
  const cable = AWG_FOR_TERMINAL[screw]

  return (
    <CalcCard>
      <CalcHeader title={t('calc.torque_lookup.title')} description={t('calc.torque_lookup.description')} />
      <div className="space-y-4">
        <SelectField id="tq-kind" label={t('calc.torque_lookup.terminalType')} value={kind} onChange={(v) => setKind(v as Kind)}
          options={(['mcb', 'busbar', 'motor', 'terminal'] as const).map((k) => ({
            label: t(`calc.torque_lookup.kinds.${k}`),
            value: k,
          }))}
        />
        <SelectField id="tq-screw" label={t('calc.torque_lookup.screw')} value={screw} onChange={(v) => setScrew(v as Screw)}
          options={(['M2.5', 'M3', 'M3.5', 'M4', 'M5', 'M6', 'M8', 'M10'] as const)
            .filter((s) => TORQUE[kind][s])
            .map((s) => ({ label: s, value: s }))}
        />

        <div className="mt-4 space-y-2">
          <ResultBig label={t('calc.torque_lookup.torque')} value={nm !== '—' ? `${nm} N·m` : '—'} tone="brand" />
          <ResultRow label={t('calc.torque_lookup.cableRange')} value={cable} />
        </div>

        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
          {t('calc.torque_lookup.notes')}
        </p>
      </div>
    </CalcCard>
  )
}
