import type { ComponentType } from 'react'
import {
  Zap, Sigma, GitBranch, Waves, Cpu, LayoutGrid,
  ShieldAlert, ShieldCheck, Battery, Radio,
  Anchor, Layers, Rocket, Activity, GaugeCircle,
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

export const LESSONS: LessonDef[] = [
  {
    id: 'electricity_intro',
    group: 'basics',
    level: 'beginner',
    minutes: 3,
    titleKey: 'learn.lessons.electricity_intro.title',
    descKey: 'learn.lessons.electricity_intro.description',
    Icon: Zap,
    color: '#f59e0b',
    Component: ElectricityIntroLesson,
    relatedCalcs: ['ohms_dc', 'units'],
  },
  {
    id: 'ohms_law',
    group: 'basics',
    level: 'beginner',
    minutes: 4,
    titleKey: 'learn.lessons.ohms_law.title',
    descKey: 'learn.lessons.ohms_law.description',
    Icon: Sigma,
    color: '#3b82f6',
    Component: OhmsLawLesson,
    relatedCalcs: ['ohms_dc', 'ohms_ac', 'power'],
  },
  {
    id: 'series_parallel',
    group: 'circuits',
    level: 'beginner',
    minutes: 4,
    titleKey: 'learn.lessons.series_parallel.title',
    descKey: 'learn.lessons.series_parallel.description',
    Icon: GitBranch,
    color: '#22c55e',
    Component: SeriesParallelLesson,
    relatedCalcs: ['resistor_net', 'cap_net'],
  },
  {
    id: 'ac_vs_dc',
    group: 'basics',
    level: 'beginner',
    minutes: 3,
    titleKey: 'learn.lessons.ac_vs_dc.title',
    descKey: 'learn.lessons.ac_vs_dc.description',
    Icon: Waves,
    color: '#8b5cf6',
    Component: AcDcLesson,
    relatedCalcs: ['ohms_ac', 'pfc'],
  },
  {
    id: 'components',
    group: 'circuits',
    level: 'beginner',
    minutes: 6,
    titleKey: 'learn.lessons.components.title',
    descKey: 'learn.lessons.components.description',
    Icon: Cpu,
    color: '#0f766e',
    Component: ComponentsLesson,
    relatedCalcs: ['color', 'smd', 'led_resistor', 'cap_net'],
  },
  {
    id: 'breadboard',
    group: 'practical',
    level: 'beginner',
    minutes: 5,
    titleKey: 'learn.lessons.breadboard.title',
    descKey: 'learn.lessons.breadboard.description',
    Icon: LayoutGrid,
    color: '#ef4444',
    Component: BreadboardPlaygroundLesson,
    relatedCalcs: ['led_resistor', 'divider'],
  },
  {
    id: 'batteries',
    group: 'circuits',
    level: 'beginner',
    minutes: 3,
    titleKey: 'learn.lessons.batteries.title',
    descKey: 'learn.lessons.batteries.description',
    Icon: Battery,
    color: '#1b2740',
    Component: BatteriesLesson,
    relatedCalcs: ['battery', 'ohms_dc'],
  },
  {
    id: 'three_phase',
    group: 'circuits',
    level: 'intermediate',
    minutes: 5,
    titleKey: 'learn.lessons.three_phase.title',
    descKey: 'learn.lessons.three_phase.description',
    Icon: Radio,
    color: '#8b5cf6',
    Component: ThreePhaseLesson,
    relatedCalcs: ['neutral', 'motor', 'power'],
  },
  {
    id: 'fuses',
    group: 'safety',
    level: 'beginner',
    minutes: 4,
    titleKey: 'learn.lessons.fuses.title',
    descKey: 'learn.lessons.fuses.description',
    Icon: ShieldAlert,
    color: '#dc2626',
    Component: FusesBreakersLesson,
    relatedCalcs: ['cable_size', 'motor', 'fault'],
  },
  {
    id: 'rcd_earth',
    group: 'safety',
    level: 'intermediate',
    minutes: 5,
    titleKey: 'learn.lessons.rcd_earth.title',
    descKey: 'learn.lessons.rcd_earth.description',
    Icon: ShieldCheck,
    color: '#059669',
    Component: RcdEarthLesson,
    relatedCalcs: ['fault'],
  },

  // ─── Advanced ──────────────────────────────────────────
  {
    id: 'grounding',
    group: 'advanced',
    level: 'advanced',
    minutes: 7,
    titleKey: 'learn.lessons.grounding.title',
    descKey: 'learn.lessons.grounding.description',
    Icon: Anchor,
    color: '#0f766e',
    Component: GroundingSystemsLesson,
    relatedCalcs: ['fault'],
  },
  {
    id: 'selectivity',
    group: 'advanced',
    level: 'advanced',
    minutes: 8,
    titleKey: 'learn.lessons.selectivity.title',
    descKey: 'learn.lessons.selectivity.description',
    Icon: Layers,
    color: '#7c3aed',
    Component: SelectivityLesson,
    relatedCalcs: ['fault', 'motor'],
  },
  {
    id: 'motor_start',
    group: 'advanced',
    level: 'advanced',
    minutes: 6,
    titleKey: 'learn.lessons.motor_start.title',
    descKey: 'learn.lessons.motor_start.description',
    Icon: Rocket,
    color: '#dc2626',
    Component: MotorStartingLesson,
    relatedCalcs: ['motor', 'motor_startup'],
  },
  {
    id: 'harmonics',
    group: 'advanced',
    level: 'advanced',
    minutes: 6,
    titleKey: 'learn.lessons.harmonics.title',
    descKey: 'learn.lessons.harmonics.description',
    Icon: Activity,
    color: '#f97316',
    Component: HarmonicsLesson,
    relatedCalcs: ['pfc', 'neutral'],
  },
  {
    id: 'vdrop_cascade',
    group: 'advanced',
    level: 'advanced',
    minutes: 7,
    titleKey: 'learn.lessons.vdrop_cascade.title',
    descKey: 'learn.lessons.vdrop_cascade.description',
    Icon: GaugeCircle,
    color: '#0ea5e9',
    Component: VoltageDropCascadeLesson,
    relatedCalcs: ['voltage_drop', 'cable_size', 'cable_loss'],
  },
]

export const LESSON_GROUPS: LessonGroup[] = ['basics', 'circuits', 'safety', 'practical', 'advanced']
