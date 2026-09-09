'use client'

import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CalcCard, CalcHeader, Field, FieldRow, ResultBig, ResultRow, SelectField, fmt } from './shared'

type Room = 'living' | 'kitchen' | 'bath' | 'office' | 'workshop' | 'corridor'
const LUX: Record<Room, number> = { living: 150, kitchen: 300, bath: 200, office: 500, workshop: 750, corridor: 100 }

export function LightingCalc() {
  const { t } = useTranslation()
  const [room, setRoom] = useState<Room>('living')
  const [length, setLength] = useState('5')
  const [width, setWidth] = useState('4')
  const [targetLux, setTargetLux] = useState(String(LUX.living))
  const [lumenPerLuminaire, setLumenPerLuminaire] = useState('1200')
  const [utilFactor, setUtilFactor] = useState('0.65')  // U (room + reflectance)
  const [maintFactor, setMaintFactor] = useState('0.8') // M (dust, aging)

  const { area, luminaires, totalLumens, wattsAtEff } = useMemo(() => {
    const A = (parseFloat(length) || 0) * (parseFloat(width) || 0)
    const E = parseFloat(targetLux) || 100
    const phi = Math.max(50, parseFloat(lumenPerLuminaire) || 1200)
    const U = Math.max(0.2, Math.min(1, parseFloat(utilFactor) || 0.65))
    const M = Math.max(0.4, Math.min(1, parseFloat(maintFactor) || 0.8))
    const totalLumens = (E * A) / (U * M)
    const luminaires = Math.ceil(totalLumens / phi)
    // Assume ~110 lm/W for modern LED
    const wattsAtEff = totalLumens / 110
    return { area: A, luminaires, totalLumens, wattsAtEff }
  }, [length, width, targetLux, lumenPerLuminaire, utilFactor, maintFactor])

  function applyRoom(r: Room) {
    setRoom(r)
    setTargetLux(String(LUX[r]))
  }

  return (
    <CalcCard>
      <CalcHeader title={t('calc.lighting.title')} description={t('calc.lighting.description')} />
      <div className="space-y-4">
        <SelectField id="lg-room" label={t('calc.lighting.roomType')} value={room} onChange={(v) => applyRoom(v as Room)}
          options={(['living', 'kitchen', 'bath', 'office', 'workshop', 'corridor'] as const).map((r) => ({
            label: `${t(`calc.lighting.rooms.${r}`)} (${LUX[r]} lx)`,
            value: r,
          }))}
        />
        <FieldRow>
          <Field id="lg-l" label={t('calc.lighting.length')} value={length} onChange={setLength} unit="m" step={0.1} />
          <Field id="lg-w" label={t('calc.lighting.width')}  value={width}  onChange={setWidth}  unit="m" step={0.1} />
        </FieldRow>
        <FieldRow>
          <Field id="lg-e"   label={t('calc.lighting.targetLux')}   value={targetLux}          onChange={setTargetLux}          unit="lx"  step={10} />
          <Field id="lg-phi" label={t('calc.lighting.lumenEach')}   value={lumenPerLuminaire}  onChange={setLumenPerLuminaire}  unit="lm" step={100} />
        </FieldRow>
        <FieldRow>
          <Field id="lg-u"   label={t('calc.lighting.util')} value={utilFactor}  onChange={setUtilFactor}  step={0.05} min={0.2} max={1} />
          <Field id="lg-m"   label={t('calc.lighting.maint')} value={maintFactor} onChange={setMaintFactor} step={0.05} min={0.4} max={1} />
        </FieldRow>

        <div className="mt-4 space-y-2">
          <ResultBig label={t('calc.lighting.luminaires')} value={String(luminaires)} tone="brand" />
          <ResultRow label={t('calc.lighting.area')}         value={`${fmt(area, 1)} m²`} />
          <ResultRow label={t('calc.lighting.totalLumens')}  value={`${fmt(totalLumens, 0)} lm`} />
          <ResultRow label={t('calc.lighting.estWatts')}     value={`${fmt(wattsAtEff, 1)} W (@ 110 lm/W LED)`} />
        </div>

        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
          {t('calc.lighting.notes')}
        </p>
      </div>
    </CalcCard>
  )
}
