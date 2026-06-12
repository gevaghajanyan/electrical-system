'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

// ── Cable Size Calculator ────────────────────────────────────────────────────

const CABLE_SIZES = [1, 1.5, 2.5, 4, 6, 10, 16, 25, 35, 50]
const CABLE_CAPACITY: Record<number, number> = {
  1: 10, 1.5: 13, 2.5: 18, 4: 24, 6: 31, 10: 42, 16: 57, 25: 75, 35: 92, 50: 112,
}

function CableSizeCalc() {
  const { t } = useTranslation()
  const [current, setCurrent] = useState(16)
  const [derating, setDerating] = useState(1.0)

  const required = round2(current / derating)
  const recommended = CABLE_SIZES.find((s) => CABLE_CAPACITY[s] >= required) ?? 50

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-800">
      <h2 className="mb-4 text-sm font-semibold text-zinc-800 dark:text-zinc-200">{t('calculators.cableSize.title')}</h2>
      <div className="space-y-3">
        <div>
          <Label htmlFor="cs-current">{t('calculators.cableSize.designCurrent')}</Label>
          <Input
            id="cs-current"
            type="number"
            min={0.1}
            step={0.1}
            value={current}
            onChange={(e) => setCurrent(Number(e.target.value))}
          />
        </div>
        <div>
          <Label htmlFor="cs-derating">{t('calculators.cableSize.deratingFactor')}</Label>
          <Input
            id="cs-derating"
            type="number"
            min={0.1}
            max={1}
            step={0.01}
            value={derating}
            onChange={(e) => setDerating(Number(e.target.value))}
          />
          <p className="mt-0.5 text-xs text-zinc-400">{t('calculators.cableSize.deratingHint')}</p>
        </div>
        <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950">
          <p className="text-xs text-zinc-600 dark:text-zinc-400">{t('calculators.cableSize.effectiveCurrent')}</p>
          <p className="text-lg font-bold text-blue-700 dark:text-blue-400">{required} A</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-zinc-500">{t('calculators.cableSize.recommended')}</span>
            <Badge variant="info">{recommended} mm²</Badge>
            <span className="text-xs text-zinc-400">{t('calculators.cableSize.capacity', { cap: CABLE_CAPACITY[recommended] })}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Voltage Drop Calculator ──────────────────────────────────────────────────

const RESISTIVITY: Record<'copper' | 'aluminium', number> = {
  copper: 0.0175,
  aluminium: 0.028,
}

function VoltageDropCalc() {
  const { t } = useTranslation()
  const [current, setCurrent] = useState(16)
  const [length, setLength] = useState(20)
  const [csa, setCsa] = useState(2.5)
  const [voltage, setVoltage] = useState(230)
  const [material, setMaterial] = useState<'copper' | 'aluminium'>('copper')

  const rho = RESISTIVITY[material]
  const resistance = round2((2 * rho * length) / csa)
  const drop = round2(current * resistance)
  const percent = round2((drop / voltage) * 100)
  const isOk = percent <= 3

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-800">
      <h2 className="mb-4 text-sm font-semibold text-zinc-800 dark:text-zinc-200">{t('calculators.voltageDrop.title')}</h2>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="vd-current">{t('calculators.voltageDrop.current')}</Label>
            <Input id="vd-current" type="number" min={0} value={current} onChange={(e) => setCurrent(Number(e.target.value))} />
          </div>
          <div>
            <Label htmlFor="vd-length">{t('calculators.voltageDrop.length')}</Label>
            <Input id="vd-length" type="number" min={0} value={length} onChange={(e) => setLength(Number(e.target.value))} />
          </div>
          <div>
            <Label htmlFor="vd-csa">{t('calculators.voltageDrop.csa')}</Label>
            <Input id="vd-csa" type="number" min={0.1} step={0.5} value={csa} onChange={(e) => setCsa(Number(e.target.value))} />
          </div>
          <div>
            <Label htmlFor="vd-voltage">{t('calculators.voltageDrop.supplyVoltage')}</Label>
            <Select id="vd-voltage" value={voltage} onChange={(e) => setVoltage(Number(e.target.value))}>
              <option value={230}>230V</option>
              <option value={400}>400V</option>
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="vd-material">{t('calculators.voltageDrop.material')}</Label>
          <Select id="vd-material" value={material} onChange={(e) => setMaterial(e.target.value as 'copper' | 'aluminium')}>
            <option value="copper">{t('calculators.voltageDrop.copper')}</option>
            <option value="aluminium">{t('calculators.voltageDrop.aluminium')}</option>
          </Select>
        </div>
        <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-xs text-zinc-400">{t('calculators.voltageDrop.resistance')}</p>
              <p className="font-semibold text-zinc-800 dark:text-zinc-200">{resistance} Ω</p>
            </div>
            <div>
              <p className="text-xs text-zinc-400">{t('calculators.voltageDrop.drop')}</p>
              <p className="font-semibold text-zinc-800 dark:text-zinc-200">{drop} V</p>
            </div>
            <div>
              <p className="text-xs text-zinc-400">{t('calculators.voltageDrop.percentDrop')}</p>
              <p className={`font-semibold ${isOk ? 'text-green-600' : 'text-red-600'}`}>{percent}%</p>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            <Badge variant={isOk ? 'success' : 'error'}>
              {isOk ? t('calculators.voltageDrop.acceptable') : t('calculators.voltageDrop.exceeds')}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Earthing / Fault Current Calculator ─────────────────────────────────────

function FaultCurrentCalc() {
  const { t } = useTranslation()
  const [voltage, setVoltage] = useState(230)
  const [impedance, setImpedance] = useState(0.35)

  const faultCurrent = impedance > 0 ? round2(voltage / impedance) : 0

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-800">
      <h2 className="mb-4 text-sm font-semibold text-zinc-800 dark:text-zinc-200">{t('calculators.faultCurrent.title')}</h2>
      <div className="space-y-3">
        <div>
          <Label htmlFor="fc-voltage">{t('calculators.faultCurrent.nominalVoltage')}</Label>
          <Select id="fc-voltage" value={voltage} onChange={(e) => setVoltage(Number(e.target.value))}>
            <option value={230}>{t('calculators.faultCurrent.voltage230')}</option>
            <option value={400}>{t('calculators.faultCurrent.voltage400')}</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="fc-zs">{t('calculators.faultCurrent.impedance')}</Label>
          <Input
            id="fc-zs"
            type="number"
            min={0.001}
            step={0.01}
            value={impedance}
            onChange={(e) => setImpedance(Number(e.target.value))}
          />
        </div>
        <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-950">
          <p className="text-xs text-zinc-600 dark:text-zinc-400">{t('calculators.faultCurrent.formula')}</p>
          <p className="mt-1 text-lg font-bold text-amber-700 dark:text-amber-400">
            {faultCurrent} A
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            {faultCurrent > 0 ? `≈ ${round2(faultCurrent / 1000)} kA` : ''}
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Power / Load Calculator ──────────────────────────────────────────────────

function PowerCalc() {
  const { t } = useTranslation()
  const [power, setPower] = useState(3000)
  const [pf, setPf] = useState(0.95)
  const [phases, setPhases] = useState<1 | 3>(1)
  const [voltage, setVoltage] = useState(230)

  const apparent = round2(power / pf)
  const current = phases === 1
    ? round2(apparent / voltage)
    : round2(apparent / (Math.sqrt(3) * voltage))

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-800">
      <h2 className="mb-4 text-sm font-semibold text-zinc-800 dark:text-zinc-200">{t('calculators.power.title')}</h2>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="pw-power">{t('calculators.power.activePower')}</Label>
            <Input id="pw-power" type="number" min={0} value={power} onChange={(e) => setPower(Number(e.target.value))} />
          </div>
          <div>
            <Label htmlFor="pw-pf">{t('calculators.power.powerFactor')}</Label>
            <Input id="pw-pf" type="number" min={0.01} max={1} step={0.01} value={pf} onChange={(e) => setPf(Number(e.target.value))} />
          </div>
          <div>
            <Label htmlFor="pw-phases">{t('calculators.power.supply')}</Label>
            <Select id="pw-phases" value={phases} onChange={(e) => setPhases(Number(e.target.value) as 1 | 3)}>
              <option value={1}>{t('calculators.power.singlePhase')}</option>
              <option value={3}>{t('calculators.power.threePhase')}</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="pw-voltage">{t('calculators.power.voltage')}</Label>
            <Select id="pw-voltage" value={voltage} onChange={(e) => setVoltage(Number(e.target.value))}>
              <option value={230}>230V</option>
              <option value={400}>400V</option>
            </Select>
          </div>
        </div>
        <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900">
          <div className="grid grid-cols-2 gap-3 text-center">
            <div>
              <p className="text-xs text-zinc-400">{t('calculators.power.apparentPower')}</p>
              <p className="font-semibold text-zinc-800 dark:text-zinc-200">{apparent} VA</p>
            </div>
            <div>
              <p className="text-xs text-zinc-400">{t('calculators.power.lineCurrent')}</p>
              <p className="font-semibold text-zinc-800 dark:text-zinc-200">{current} A</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function CalculatorsPage() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{t('calculators.title')}</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {t('calculators.subtitle')}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <CableSizeCalc />
          <VoltageDropCalc />
          <FaultCurrentCalc />
          <PowerCalc />
        </div>
      </div>
    </div>
  )
}
