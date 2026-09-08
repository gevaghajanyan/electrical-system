'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CalcCard, CalcHeader, Field, FieldRow, ResultBig, ResultRow, SelectField, fmt } from './shared'

type Material = 'copper' | 'aluminium'
type Mounting = 'vertical' | 'horizontal' | 'enclosed'

// Base current density (A/mm²) for 30 °C rise, single bar.
const BASE_DENSITY: Record<Material, number> = { copper: 1.2, aluminium: 0.9 }
const MOUNT_FACTOR: Record<Mounting, number> = { vertical: 1.0, horizontal: 0.85, enclosed: 0.7 }
// Ω·mm²/m at 20 °C
const RHO: Record<Material, number> = { copper: 0.01724, aluminium: 0.02826 }

/**
 * Rectangular busbar current-carrying capacity.
 *  Ib = A × J × Kmount × √(ΔT/30) × Nbars
 */
export function BusbarCurrentCalc() {
  const { t } = useTranslation()
  const [material, setMaterial] = useState<Material>('copper')
  const [mounting, setMounting] = useState<Mounting>('vertical')
  const [width, setWidth] = useState('30')
  const [thickness, setThickness] = useState('5')
  const [tempRise, setTempRise] = useState('30')
  const [bars, setBars] = useState('1')

  const w = parseFloat(width) || 0
  const th = parseFloat(thickness) || 0
  const dT = Math.max(1, parseFloat(tempRise) || 30)
  const n = Math.max(1, parseFloat(bars) || 1)
  const A = w * th
  const J = BASE_DENSITY[material] * MOUNT_FACTOR[mounting] * Math.sqrt(dT / 30)
  const capacity = A * J * n
  const rPerM = A > 0 ? (RHO[material] * 1000) / A : 0  // Ω/km per bar
  const rTotal = n > 0 ? rPerM / n : 0

  return (
    <CalcCard>
      <CalcHeader title={t('calc.busbar.title')} description={t('calc.busbar.description')} />
      <div className="space-y-4">
        <FieldRow>
          <Field id="bb-w" label={t('calc.busbar.width')} value={width} onChange={setWidth} unit="mm" min={0} step={1} />
          <Field id="bb-t" label={t('calc.busbar.thickness')} value={thickness} onChange={setThickness} unit="mm" min={0} step={0.5} />
          <Field id="bb-dt" label={t('calc.busbar.tempRise')} value={tempRise} onChange={setTempRise} unit="°C" min={5} max={100} step={1} />
          <Field id="bb-n" label={t('calc.busbar.numberBars')} value={bars} onChange={setBars} min={1} max={6} step={1} />
        </FieldRow>
        <FieldRow>
          <SelectField
            id="bb-mat"
            label={t('calc.busbar.material')}
            value={material}
            onChange={(v) => setMaterial(v as Material)}
            options={[
              { value: 'copper', label: t('calc.busbar.copper') },
              { value: 'aluminium', label: t('calc.busbar.aluminium') },
            ]}
          />
          <SelectField
            id="bb-mnt"
            label={t('calc.busbar.mounting')}
            value={mounting}
            onChange={(v) => setMounting(v as Mounting)}
            options={[
              { value: 'vertical', label: t('calc.busbar.mountings.vertical') },
              { value: 'horizontal', label: t('calc.busbar.mountings.horizontal') },
              { value: 'enclosed', label: t('calc.busbar.mountings.enclosed') },
            ]}
          />
        </FieldRow>

        <ResultBig label={t('calc.busbar.capacity')} value={fmt(capacity, 0)} unit="A" tone="success" />

        <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900">
          <ResultRow label={t('calc.busbar.crossSection')} value={fmt(A, 1)} unit="mm²" />
          <ResultRow label={t('calc.busbar.currentDensity')} value={fmt(J, 2)} unit="A/mm²" />
          <ResultRow label={t('calc.busbar.resistancePerKm')} value={fmt(rTotal, 4)} unit="Ω/km" />
        </div>
      </div>
    </CalcCard>
  )
}
