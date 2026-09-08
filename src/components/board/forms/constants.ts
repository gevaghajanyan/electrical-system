import type {
  CurrentRating, TripCurve, RcdSensitivity, RcdType,
  CoilVoltage, ContactorPoles, SpdType, TimerMode, LampColor,
} from '@/lib/types/panel'

export const RATINGS: CurrentRating[] = [6, 10, 13, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125]
export const CURVES: TripCurve[] = ['B', 'C', 'D']
export const SENSITIVITIES: RcdSensitivity[] = [10, 30, 100, 300]
export const RCD_TYPES: RcdType[] = ['AC', 'A', 'F', 'B']
export const COIL_VOLTAGES: CoilVoltage[] = [12, 24, 110, 230, 400]
export const CONTACTOR_POLES: ContactorPoles[] = [2, 3, 4]
export const SPD_TYPES: SpdType[] = ['T1', 'T2', 'T3', 'T1+T2', 'T2+T3']
export const TIMER_MODES: TimerMode[] = ['astronomical', 'weekly', 'countdown', 'staircase']
export const LAMP_COLORS: LampColor[] = ['red', 'green', 'amber', 'blue', 'white']
export const BREAKING_CAPACITIES = [3, 6, 10, 15] as const
