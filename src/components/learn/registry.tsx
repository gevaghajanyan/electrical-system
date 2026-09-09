import type { ComponentType } from 'react'
import {
  Zap, Sigma, GitBranch, Waves, Cpu, LayoutGrid,
  ShieldAlert, ShieldCheck, Battery, Radio,
  Anchor, Layers, Rocket, Activity, GaugeCircle,
  BookOpen, Palette, ToggleRight, ArrowUpDown,
  Sun, Plug, PlugZap, BatteryCharging, Link2,
  CloudLightning, Flame, Triangle, Cable, Shield,
  Star, Timer, Bug, Tag, Gauge,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { ElectricityIntroLesson } from './lessons/ElectricityIntroLesson'
import { OhmsLawLesson } from './lessons/OhmsLawLesson'
import { SeriesParallelLesson } from './lessons/SeriesParallelLesson'
import { AcDcLesson } from './lessons/AcDcLesson'
import { ComponentsLesson } from './lessons/ComponentsLesson'
import { BreadboardPlaygroundLesson } from './lessons/BreadboardPlaygroundLesson'
import { FusesBreakersLesson } from './lessons/FusesBreakersLesson'
import { RcdEarthLesson } from './lessons/RcdEarthLesson'
import { BatteriesLesson } from './lessons/BatteriesLesson'
import { ThreePhaseLesson } from './lessons/ThreePhaseLesson'
import { GroundingSystemsLesson } from './lessons/GroundingSystemsLesson'
import { SelectivityLesson } from './lessons/SelectivityLesson'
import { MotorStartingLesson } from './lessons/MotorStartingLesson'
import { HarmonicsLesson } from './lessons/HarmonicsLesson'
import { VoltageDropCascadeLesson } from './lessons/VoltageDropCascadeLesson'
import { ReadingDiagramsLesson } from './lessons/ReadingDiagramsLesson'
import { WireColorsLesson } from './lessons/WireColorsLesson'
import { ContactorLesson } from './lessons/ContactorLesson'
import { TransformerBasicsLesson } from './lessons/TransformerBasicsLesson'
import { SolarPvLesson } from './lessons/SolarPvLesson'
import { EvChargingLesson } from './lessons/EvChargingLesson'
import { UpsBasicsLesson } from './lessons/UpsBasicsLesson'
import { BatteryChemistryLesson } from './lessons/BatteryChemistryLesson'
import { BondingEarthingLesson } from './lessons/BondingEarthingLesson'
import { SpdLightningLesson } from './lessons/SpdLightningLesson'
import { AfddLesson } from './lessons/AfddLesson'
import { ReactivePowerLesson } from './lessons/ReactivePowerLesson'
import { InsulationTypesLesson } from './lessons/InsulationTypesLesson'
import { IpRatingsLesson } from './lessons/IpRatingsLesson'
import { StarDeltaLesson } from './lessons/StarDeltaLesson'
import { RcTimeConstantLesson } from './lessons/RcTimeConstantLesson'
import { FaultTreeLesson } from './lessons/FaultTreeLesson'
import { NameplateLesson } from './lessons/NameplateLesson'
import { MultimeterLesson } from './lessons/MultimeterLesson'

export type LessonGroup = 'basics' | 'circuits' | 'safety' | 'practical' | 'advanced'
export type LessonLevel = 'beginner' | 'intermediate' | 'advanced'

export interface LessonDef {
  id: string
  group: LessonGroup
  level: LessonLevel
  /** Estimated read time in minutes */
  minutes: number
  /** i18n key returning lesson title */
  titleKey: string
  /** i18n key returning lesson description (one line summary) */
  descKey: string
  /** Lucide icon component for the tile / header */
  Icon: LucideIcon
  /** Colour used for the tile accent (Tailwind classes) */
  color: string
  /** The lesson content */
  Component: ComponentType
  /** Related calculator IDs — shown as suggestions at the bottom of the lesson */
  relatedCalcs?: string[]
}

/**
 * Order = study path. Within each group the lessons are ordered so each
 * builds naturally on the one before it. Prev/next navigation in
 * LessonDetail walks this order, so the array IS the curriculum.
 */
export const LESSONS: LessonDef[] = [
  // ═══ 1. BASICS — no prerequisites, foundation for everything ═══
  { id: 'electricity_intro', group: 'basics',   level: 'beginner',     minutes: 3, titleKey: 'learn.lessons.electricity_intro.title', descKey: 'learn.lessons.electricity_intro.description', Icon: Zap,      color: '#f59e0b', Component: ElectricityIntroLesson, relatedCalcs: ['ohms_dc', 'units'] },
  { id: 'wire_colors',       group: 'basics',   level: 'beginner',     minutes: 3, titleKey: 'learn.lessons.wire_colors.title',       descKey: 'learn.lessons.wire_colors.description',       Icon: Palette,  color: '#a16207', Component: WireColorsLesson,       relatedCalcs: [] },
  { id: 'reading_diagrams',  group: 'basics',   level: 'beginner',     minutes: 4, titleKey: 'learn.lessons.reading_diagrams.title',  descKey: 'learn.lessons.reading_diagrams.description',  Icon: BookOpen, color: '#0891b2', Component: ReadingDiagramsLesson,  relatedCalcs: [] },
  { id: 'ohms_law',          group: 'basics',   level: 'beginner',     minutes: 4, titleKey: 'learn.lessons.ohms_law.title',          descKey: 'learn.lessons.ohms_law.description',          Icon: Sigma,    color: '#3b82f6', Component: OhmsLawLesson,          relatedCalcs: ['ohms_dc', 'ohms_ac', 'power'] },
  { id: 'ac_vs_dc',          group: 'basics',   level: 'beginner',     minutes: 3, titleKey: 'learn.lessons.ac_vs_dc.title',          descKey: 'learn.lessons.ac_vs_dc.description',          Icon: Waves,    color: '#8b5cf6', Component: AcDcLesson,             relatedCalcs: ['ohms_ac', 'pfc'] },

  // ═══ 2. CIRCUITS & COMPONENTS — builds on basics ═══
  { id: 'series_parallel',    group: 'circuits', level: 'beginner',     minutes: 4, titleKey: 'learn.lessons.series_parallel.title',    descKey: 'learn.lessons.series_parallel.description',    Icon: GitBranch,  color: '#22c55e', Component: SeriesParallelLesson,    relatedCalcs: ['resistor_net', 'cap_net'] },
  { id: 'components',         group: 'circuits', level: 'beginner',     minutes: 6, titleKey: 'learn.lessons.components.title',         descKey: 'learn.lessons.components.description',         Icon: Cpu,        color: '#0f766e', Component: ComponentsLesson,         relatedCalcs: ['color', 'smd', 'led_resistor', 'cap_net'] },
  { id: 'batteries',          group: 'circuits', level: 'beginner',     minutes: 3, titleKey: 'learn.lessons.batteries.title',          descKey: 'learn.lessons.batteries.description',          Icon: Battery,    color: '#1b2740', Component: BatteriesLesson,          relatedCalcs: ['battery', 'ohms_dc'] },
  { id: 'battery_chemistry',  group: 'circuits', level: 'intermediate', minutes: 5, titleKey: 'learn.lessons.battery_chemistry.title',  descKey: 'learn.lessons.battery_chemistry.description',  Icon: Battery,    color: '#059669', Component: BatteryChemistryLesson,  relatedCalcs: ['battery'] },
  { id: 'rc_time_constant',   group: 'circuits', level: 'intermediate', minutes: 4, titleKey: 'learn.lessons.rc_time_constant.title',   descKey: 'learn.lessons.rc_time_constant.description',   Icon: Timer,      color: '#3b82f6', Component: RcTimeConstantLesson,   relatedCalcs: ['cap_net', 'resistor_net'] },
  { id: 'transformer_basics', group: 'circuits', level: 'intermediate', minutes: 5, titleKey: 'learn.lessons.transformer_basics.title', descKey: 'learn.lessons.transformer_basics.description', Icon: ArrowUpDown, color: '#7c3aed', Component: TransformerBasicsLesson, relatedCalcs: ['ohms_ac', 'power'] },
  { id: 'three_phase',        group: 'circuits', level: 'intermediate', minutes: 5, titleKey: 'learn.lessons.three_phase.title',        descKey: 'learn.lessons.three_phase.description',        Icon: Radio,      color: '#8b5cf6', Component: ThreePhaseLesson,        relatedCalcs: ['neutral', 'motor', 'power'] },
  { id: 'star_delta',         group: 'circuits', level: 'intermediate', minutes: 4, titleKey: 'learn.lessons.star_delta.title',         descKey: 'learn.lessons.star_delta.description',         Icon: Star,       color: '#7c3aed', Component: StarDeltaLesson,         relatedCalcs: ['motor', 'power'] },
  { id: 'contactor',          group: 'circuits', level: 'intermediate', minutes: 4, titleKey: 'learn.lessons.contactor.title',          descKey: 'learn.lessons.contactor.description',          Icon: ToggleRight, color: '#0d9488', Component: ContactorLesson,          relatedCalcs: ['motor', 'startup'] },

  // ═══ 3. SAFETY — protective devices, ordered by concept complexity ═══
  { id: 'fuses',            group: 'safety', level: 'beginner',     minutes: 4, titleKey: 'learn.lessons.fuses.title',            descKey: 'learn.lessons.fuses.description',            Icon: ShieldAlert,    color: '#dc2626', Component: FusesBreakersLesson,  relatedCalcs: ['cable_size', 'motor', 'fault'] },
  { id: 'rcd_earth',        group: 'safety', level: 'intermediate', minutes: 5, titleKey: 'learn.lessons.rcd_earth.title',        descKey: 'learn.lessons.rcd_earth.description',        Icon: ShieldCheck,    color: '#059669', Component: RcdEarthLesson,       relatedCalcs: ['fault'] },
  { id: 'bonding_earthing', group: 'safety', level: 'intermediate', minutes: 4, titleKey: 'learn.lessons.bonding_earthing.title', descKey: 'learn.lessons.bonding_earthing.description', Icon: Link2,          color: '#166534', Component: BondingEarthingLesson, relatedCalcs: ['fault', 'earth_rod'] },
  { id: 'spd_lightning',    group: 'safety', level: 'advanced',     minutes: 6, titleKey: 'learn.lessons.spd_lightning.title',    descKey: 'learn.lessons.spd_lightning.description',    Icon: CloudLightning, color: '#f59e0b', Component: SpdLightningLesson,   relatedCalcs: ['fault'] },
  { id: 'afdd',             group: 'safety', level: 'advanced',     minutes: 5, titleKey: 'learn.lessons.afdd.title',             descKey: 'learn.lessons.afdd.description',             Icon: Flame,          color: '#dc2626', Component: AfddLesson,           relatedCalcs: [] },

  // ═══ 4. HANDS-ON / PRACTICAL — tools, materials, real-world knowledge ═══
  { id: 'multimeter',       group: 'practical', level: 'beginner',     minutes: 5, titleKey: 'learn.lessons.multimeter.title',       descKey: 'learn.lessons.multimeter.description',       Icon: Gauge,     color: '#f97316', Component: MultimeterLesson,          relatedCalcs: ['ohms_dc'] },
  { id: 'nameplate',        group: 'practical', level: 'beginner',     minutes: 4, titleKey: 'learn.lessons.nameplate.title',        descKey: 'learn.lessons.nameplate.description',        Icon: Tag,       color: '#64748b', Component: NameplateLesson,           relatedCalcs: ['motor', 'power'] },
  { id: 'ip_ratings',       group: 'practical', level: 'beginner',     minutes: 4, titleKey: 'learn.lessons.ip_ratings.title',       descKey: 'learn.lessons.ip_ratings.description',       Icon: Shield,    color: '#0891b2', Component: IpRatingsLesson,           relatedCalcs: [] },
  { id: 'insulation_types', group: 'practical', level: 'intermediate', minutes: 4, titleKey: 'learn.lessons.insulation_types.title', descKey: 'learn.lessons.insulation_types.description', Icon: Cable,     color: '#65a30d', Component: InsulationTypesLesson,     relatedCalcs: ['cable_size', 'cable_loss'] },
  { id: 'breadboard',       group: 'practical', level: 'beginner',     minutes: 5, titleKey: 'learn.lessons.breadboard.title',       descKey: 'learn.lessons.breadboard.description',       Icon: LayoutGrid, color: '#ef4444', Component: BreadboardPlaygroundLesson, relatedCalcs: ['led_resistor', 'divider'] },
  { id: 'ev_charging',      group: 'practical', level: 'beginner',     minutes: 5, titleKey: 'learn.lessons.ev_charging.title',      descKey: 'learn.lessons.ev_charging.description',      Icon: PlugZap,   color: '#0ea5e9', Component: EvChargingLesson,          relatedCalcs: ['power', 'cable_size'] },
  { id: 'ups_basics',       group: 'practical', level: 'intermediate', minutes: 5, titleKey: 'learn.lessons.ups_basics.title',       descKey: 'learn.lessons.ups_basics.description',       Icon: BatteryCharging, color: '#16a34a', Component: UpsBasicsLesson,    relatedCalcs: ['battery'] },
  { id: 'solar_pv',         group: 'practical', level: 'intermediate', minutes: 6, titleKey: 'learn.lessons.solar_pv.title',         descKey: 'learn.lessons.solar_pv.description',         Icon: Sun,       color: '#eab308', Component: SolarPvLesson,             relatedCalcs: ['battery', 'power'] },
  { id: 'fault_tree',       group: 'practical', level: 'intermediate', minutes: 5, titleKey: 'learn.lessons.fault_tree.title',       descKey: 'learn.lessons.fault_tree.description',       Icon: Bug,       color: '#dc2626', Component: FaultTreeLesson,           relatedCalcs: ['fault'] },

  // ═══ 5. ADVANCED ENGINEERING — depends on everything before ═══
  { id: 'reactive_power', group: 'advanced', level: 'intermediate', minutes: 6, titleKey: 'learn.lessons.reactive_power.title', descKey: 'learn.lessons.reactive_power.description', Icon: Triangle,    color: '#7c3aed', Component: ReactivePowerLesson,      relatedCalcs: ['pfc', 'ohms_ac'] },
  { id: 'grounding',      group: 'advanced', level: 'advanced',     minutes: 7, titleKey: 'learn.lessons.grounding.title',      descKey: 'learn.lessons.grounding.description',      Icon: Anchor,      color: '#0f766e', Component: GroundingSystemsLesson,   relatedCalcs: ['fault'] },
  { id: 'selectivity',    group: 'advanced', level: 'advanced',     minutes: 8, titleKey: 'learn.lessons.selectivity.title',    descKey: 'learn.lessons.selectivity.description',    Icon: Layers,      color: '#7c3aed', Component: SelectivityLesson,        relatedCalcs: ['fault', 'motor'] },
  { id: 'motor_start',    group: 'advanced', level: 'advanced',     minutes: 6, titleKey: 'learn.lessons.motor_start.title',    descKey: 'learn.lessons.motor_start.description',    Icon: Rocket,      color: '#dc2626', Component: MotorStartingLesson,      relatedCalcs: ['motor', 'motor_startup'] },
  { id: 'harmonics',      group: 'advanced', level: 'advanced',     minutes: 6, titleKey: 'learn.lessons.harmonics.title',      descKey: 'learn.lessons.harmonics.description',      Icon: Activity,    color: '#f97316', Component: HarmonicsLesson,          relatedCalcs: ['pfc', 'neutral'] },
  { id: 'vdrop_cascade',  group: 'advanced', level: 'advanced',     minutes: 7, titleKey: 'learn.lessons.vdrop_cascade.title',  descKey: 'learn.lessons.vdrop_cascade.description',  Icon: GaugeCircle, color: '#0ea5e9', Component: VoltageDropCascadeLesson, relatedCalcs: ['voltage_drop', 'cable_size', 'cable_loss'] },
]

export const LESSON_GROUPS: LessonGroup[] = ['basics', 'circuits', 'safety', 'practical', 'advanced']
