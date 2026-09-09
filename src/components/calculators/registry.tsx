import type { ComponentType, ReactNode } from 'react'
import { OhmsLawDcCalc } from './OhmsLawDcCalc'
import { OhmsLawAcCalc } from './OhmsLawAcCalc'
import { LedResistorCalc } from './LedResistorCalc'
import { ResistorNetworkCalc } from './ResistorNetworkCalc'
import { CapacitorNetworkCalc } from './CapacitorNetworkCalc'
import { MotorFlcCalc } from './MotorFlcCalc'
import { MotorStartupCalc } from './MotorStartupCalc'
import { UnitConverterCalc } from './UnitConverterCalc'
import { PowerFactorCorrectionCalc } from './PowerFactorCorrectionCalc'
import { VoltageDividerCalc } from './VoltageDividerCalc'
import { BatteryLifeCalc } from './BatteryLifeCalc'
import { AwgWireCalc } from './AwgWireCalc'
import { CablePowerLossCalc } from './CablePowerLossCalc'
import { NeutralCurrentCalc } from './NeutralCurrentCalc'
import { ConductorResistanceCalc } from './ConductorResistanceCalc'
import { CableSizeCalc } from './CableSizeCalc'
import { VoltageDropCalc } from './VoltageDropCalc'
import { FaultCurrentCalc } from './FaultCurrentCalc'
import { PowerCurrentCalc } from './PowerCurrentCalc'
import { BusbarCurrentCalc } from './BusbarCurrentCalc'
import { SeriesDroppingResistorCalc } from './SeriesDroppingResistorCalc'
import { ResistorColorCalc } from './ResistorColorCalc'
import { SmdResistorCalc } from './SmdResistorCalc'
import { FormulasReference } from './FormulasReference'
import { ConduitFillCalc } from './ConduitFillCalc'
import { UpstreamFaultCalc } from './UpstreamFaultCalc'
import { EarthRodCalc } from './EarthRodCalc'
import { SolarSizerCalc } from './SolarSizerCalc'
import { EvCableCalc } from './EvCableCalc'
import { LoadScheduleCalc } from './LoadScheduleCalc'
import { PvStringCalc } from './PvStringCalc'
import { MotorSizerCalc } from './MotorSizerCalc'
import { LightingCalc } from './LightingCalc'
import { TorqueLookupCalc } from './TorqueLookupCalc'

export type CalcGroup = 'basic' | 'installation' | 'power' | 'electronics' | 'utility'

export interface CalcDef {
  id: string
  group: CalcGroup
  /** i18n key returning the display name */
  titleKey: string
  /** i18n key returning the short description */
  descKey: string
  /** SVG path (24×24, currentColor stroke) */
  iconPath: ReactNode
  Component: ComponentType
}

const icon = (d: string) => (
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={d} />
)

export const CALCULATORS: CalcDef[] = [
  // ─── Basic ──────────────────────────────────────────────
  {
    id: 'ohms_dc',
    group: 'basic',
    titleKey: 'calc.ohms_dc.title',
    descKey: 'calc.ohms_dc.description',
    iconPath: icon('M12 2a10 10 0 100 20 10 10 0 000-20zM12 2v20M2 12h20'),
    Component: OhmsLawDcCalc,
  },
  {
    id: 'ohms_ac',
    group: 'basic',
    titleKey: 'calc.ohms_ac.title',
    descKey: 'calc.ohms_ac.description',
    iconPath: icon('M3 12c2-4 4-4 6 0s4 4 6 0 4-4 6 0'),
    Component: OhmsLawAcCalc,
  },
  {
    id: 'power',
    group: 'basic',
    titleKey: 'calc.power.title',
    descKey: 'calc.power.description',
    iconPath: icon('M13 2L4 14h7l-2 8 10-13h-7z'),
    Component: PowerCurrentCalc,
  },

  // ─── Installation ──────────────────────────────────────
  {
    id: 'cable_size',
    group: 'installation',
    titleKey: 'calc.cable_size.title',
    descKey: 'calc.cable_size.description',
    iconPath: icon('M4 8h16M4 12h16M4 16h16'),
    Component: CableSizeCalc,
  },
  {
    id: 'voltage_drop',
    group: 'installation',
    titleKey: 'calc.voltage_drop.title',
    descKey: 'calc.voltage_drop.description',
    iconPath: icon('M4 6h16M4 6l4 12M20 6l-4 12M8 18h8'),
    Component: VoltageDropCalc,
  },
  {
    id: 'fault',
    group: 'installation',
    titleKey: 'calc.fault.title',
    descKey: 'calc.fault.description',
    iconPath: icon('M13 2L4 14h7l-2 8 10-13h-7z'),
    Component: FaultCurrentCalc,
  },
  {
    id: 'motor',
    group: 'installation',
    titleKey: 'calc.motor.title',
    descKey: 'calc.motor.description',
    iconPath: icon('M12 6v3m0 6v3M6 12h3m6 0h3M12 4a8 8 0 100 16 8 8 0 000-16z'),
    Component: MotorFlcCalc,
  },
  {
    id: 'motor_startup',
    group: 'installation',
    titleKey: 'calc.startup.title',
    descKey: 'calc.startup.description',
    iconPath: icon('M12 3v4m0 10v4M3 12h4m10 0h4M5.6 5.6l2.8 2.8m7.2 7.2l2.8 2.8M5.6 18.4l2.8-2.8m7.2-7.2l2.8-2.8'),
    Component: MotorStartupCalc,
  },
  {
    id: 'cable_loss',
    group: 'installation',
    titleKey: 'calc.cable_loss.title',
    descKey: 'calc.cable_loss.description',
    iconPath: icon('M4 12h6l2-4 2 8 2-6 4 2'),
    Component: CablePowerLossCalc,
  },
  {
    id: 'cond_r',
    group: 'installation',
    titleKey: 'calc.cond_r.title',
    descKey: 'calc.cond_r.description',
    iconPath: icon('M3 12c4-6 8 6 12 0s4-3 6 0'),
    Component: ConductorResistanceCalc,
  },
  {
    id: 'awg',
    group: 'installation',
    titleKey: 'calc.awg.title',
    descKey: 'calc.awg.description',
    iconPath: icon('M4 8h16M4 12h10M4 16h6'),
    Component: AwgWireCalc,
  },
  {
    id: 'busbar',
    group: 'installation',
    titleKey: 'calc.busbar.title',
    descKey: 'calc.busbar.description',
    iconPath: icon('M3 8h18v3H3zM3 13h18v3H3z'),
    Component: BusbarCurrentCalc,
  },
  {
    id: 'conduit_fill',
    group: 'installation',
    titleKey: 'calc.conduit_fill.title',
    descKey: 'calc.conduit_fill.description',
    iconPath: icon('M4 8a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V8zM8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01'),
    Component: ConduitFillCalc,
  },
  {
    id: 'upstream_fault',
    group: 'installation',
    titleKey: 'calc.upstream_fault.title',
    descKey: 'calc.upstream_fault.description',
    iconPath: icon('M4 4l8 8-4 4 4 4 8-8-4-4-4 4-8-8z'),
    Component: UpstreamFaultCalc,
  },
  {
    id: 'earth_rod',
    group: 'installation',
    titleKey: 'calc.earth_rod.title',
    descKey: 'calc.earth_rod.description',
    iconPath: icon('M12 3v13M6 20l12 0M8 16h8M9 12h6M10 8h4'),
    Component: EarthRodCalc,
  },
  {
    id: 'ev_cable',
    group: 'installation',
    titleKey: 'calc.ev_cable.title',
    descKey: 'calc.ev_cable.description',
    iconPath: icon('M6 4h4v6h-4zM14 10h4v10h-4zM6 20h12'),
    Component: EvCableCalc,
  },
  {
    id: 'motor_sizer',
    group: 'installation',
    titleKey: 'calc.motor_sizer.title',
    descKey: 'calc.motor_sizer.description',
    iconPath: icon('M12 3a9 9 0 100 18 9 9 0 000-18zM12 8v8M8 12h8'),
    Component: MotorSizerCalc,
  },
  {
    id: 'load_schedule',
    group: 'installation',
    titleKey: 'calc.load_schedule.title',
    descKey: 'calc.load_schedule.description',
    iconPath: icon('M4 6h16M4 12h16M4 18h10'),
    Component: LoadScheduleCalc,
  },
  {
    id: 'torque_lookup',
    group: 'installation',
    titleKey: 'calc.torque_lookup.title',
    descKey: 'calc.torque_lookup.description',
    iconPath: icon('M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1'),
    Component: TorqueLookupCalc,
  },

  // ─── Power ─────────────────────────────────────────────
  {
    id: 'pfc',
    group: 'power',
    titleKey: 'calc.pfc.title',
    descKey: 'calc.pfc.description',
    iconPath: icon('M4 20h16M6 16l4-8 4 4 4-6'),
    Component: PowerFactorCorrectionCalc,
  },
  {
    id: 'neutral',
    group: 'power',
    titleKey: 'calc.neutral.title',
    descKey: 'calc.neutral.description',
    iconPath: icon('M4 20L8 4M12 20L12 4M20 20L16 4'),
    Component: NeutralCurrentCalc,
  },
  {
    id: 'solar_sizer',
    group: 'power',
    titleKey: 'calc.solar_sizer.title',
    descKey: 'calc.solar_sizer.description',
    iconPath: icon('M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4M12 8a4 4 0 100 8 4 4 0 000-8z'),
    Component: SolarSizerCalc,
  },
  {
    id: 'pv_string',
    group: 'power',
    titleKey: 'calc.pv_string.title',
    descKey: 'calc.pv_string.description',
    iconPath: icon('M3 5h18v6H3zM3 13h18v6H3zM7 5v14M11 5v14M15 5v14M19 5v14'),
    Component: PvStringCalc,
  },
  {
    id: 'lighting',
    group: 'power',
    titleKey: 'calc.lighting.title',
    descKey: 'calc.lighting.description',
    iconPath: icon('M9 18h6M10 22h4M12 3a7 7 0 00-4 12.7V17h8v-1.3A7 7 0 0012 3z'),
    Component: LightingCalc,
  },

  // ─── Electronics ───────────────────────────────────────
  {
    id: 'led_resistor',
    group: 'electronics',
    titleKey: 'calc.led.title',
    descKey: 'calc.led.description',
    iconPath: icon('M12 3v10m0 0l-3-3m3 3l3-3M6 15l-2 4h16l-2-4'),
    Component: LedResistorCalc,
  },
  {
    id: 'resistor_net',
    group: 'electronics',
    titleKey: 'calc.resistor_net.title',
    descKey: 'calc.resistor_net.description',
    iconPath: icon('M3 12h4l2-3 4 6 2-3h6'),
    Component: ResistorNetworkCalc,
  },
  {
    id: 'cap_net',
    group: 'electronics',
    titleKey: 'calc.cap_net.title',
    descKey: 'calc.cap_net.description',
    iconPath: icon('M3 12h6M9 6v12M15 6v12M15 12h6'),
    Component: CapacitorNetworkCalc,
  },
  {
    id: 'divider',
    group: 'electronics',
    titleKey: 'calc.divider.title',
    descKey: 'calc.divider.description',
    iconPath: icon('M4 12h16M4 6l4 4-4 4M20 18l-4-4 4-4'),
    Component: VoltageDividerCalc,
  },
  {
    id: 'dropping',
    group: 'electronics',
    titleKey: 'calc.dropping.title',
    descKey: 'calc.dropping.description',
    iconPath: icon('M4 12h4l2-6 4 12 2-6h4'),
    Component: SeriesDroppingResistorCalc,
  },
  {
    id: 'color',
    group: 'electronics',
    titleKey: 'calc.color.title',
    descKey: 'calc.color.description',
    iconPath: icon('M4 12h16M4 16h16M4 8h16'),
    Component: ResistorColorCalc,
  },
  {
    id: 'smd',
    group: 'electronics',
    titleKey: 'calc.smd.title',
    descKey: 'calc.smd.description',
    iconPath: icon('M4 9h16v6H4z M9 9v6 M15 9v6'),
    Component: SmdResistorCalc,
  },

  // ─── Utility ───────────────────────────────────────────
  {
    id: 'battery',
    group: 'utility',
    titleKey: 'calc.battery.title',
    descKey: 'calc.battery.description',
    iconPath: icon('M5 8h10a2 2 0 012 2v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4a2 2 0 012-2zm12 2h2v4h-2'),
    Component: BatteryLifeCalc,
  },
  {
    id: 'units',
    group: 'utility',
    titleKey: 'calc.units.title',
    descKey: 'calc.units.description',
    iconPath: icon('M8 7h12M8 12h12M8 17h12M4 7h.01M4 12h.01M4 17h.01'),
    Component: UnitConverterCalc,
  },
  {
    id: 'formulas',
    group: 'utility',
    titleKey: 'calc.formulas.title',
    descKey: 'calc.formulas.description',
    iconPath: icon('M6 4h12v4H6zM6 12h12v4H6zM6 20h8'),
    Component: FormulasReference,
  },
]
