import type { PanelElement } from '../types/panel'

/**
 * Compact single-line spec label shown inside the element body on the canvas
 * (e.g. `C16A`, `63A/30mA`, `20kA T2`). Pure — no rendering concerns.
 */
export function getElementDisplayLabel(element: PanelElement): string {
  const p = element.properties
  switch (p.kind) {
    case 'mcb':
    case 'rcbo':
      return `${p.curve}${p.rating}A`
    case 'rcd':
      return `${p.rating}A/${p.sensitivity}mA`
    case 'isolator':
      return `${p.rating}A`
    case 'voltage_relay':
      return `${p.minVoltage}–${p.maxVoltage}V`
    case 'contactor':
      return `${p.rating}A · ${p.coilVoltage}V`
    case 'surge_protector':
      return `${p.type} ${p.nominalCurrent}kA`
    case 'timer':
      return `${p.rating}A`
    case 'meter':
      return p.threePhase ? '3P kWh' : '1P kWh'
    case 'signal_lamp':
      return `${p.voltage}V`
    case 'socket':
      return `${p.rating}A`
    case 'button':
      return p.variant === 'emergency_stop' ? 'E-STOP' : ''
    case 'motor_starter':
      return `${p.rating}A · ${p.powerKw}kW`
    case 'buzzer':
      return `${p.voltage}V`
    case 'dimmer':
      return `${p.maxWatts}W`
    default:
      return ''
  }
}

/**
 * Full spec used in the BOM & tooltip. Includes more detail than the compact
 * canvas label.
 */
export function getElementFullSpec(element: PanelElement): string {
  const p = element.properties
  switch (p.kind) {
    case 'mcb':
      return `${p.curve}${p.rating}A / ${p.breakingCapacity}kA`
    case 'rcbo':
      return `${p.curve}${p.rating}A / ${p.sensitivity}mA · Type ${p.type}`
    case 'rcd':
      return `${p.rating}A / ${p.sensitivity}mA · Type ${p.type}`
    case 'isolator':
      return `${p.rating}A`
    case 'voltage_relay':
      return `${p.minVoltage}–${p.maxVoltage}V · ${p.delaySeconds}s`
    case 'contactor':
      return `${p.poles}P · ${p.rating}A · ${p.coilVoltage}V coil`
    case 'surge_protector':
      return `${p.type} · ${p.nominalCurrent}kA · Up ${p.protectionLevel}kV · Uc ${p.maxOperatingVoltage}V`
    case 'timer':
      return `${p.mode} · ${p.rating}A`
    case 'meter':
      return `${p.threePhase ? '3-phase' : '1-phase'} · ${p.rating}A${p.midClass ? ` · MID ${p.midClass}` : ''}`
    case 'signal_lamp':
      return `${p.color} · ${p.voltage}V`
    case 'socket':
      return `${p.rating}A · ${p.standard.toUpperCase()}`
    case 'button':
      return `${p.variant.replace('_', ' ')} · ${p.color}`
    case 'motor_starter':
      return `${p.rating}A · ${p.powerKw}kW · class ${p.overloadClass}`
    case 'buzzer':
      return `${p.voltage}V`
    case 'dimmer':
      return `${p.rating}A · ${p.maxWatts}W · ${p.loadType}`
    default:
      return '—'
  }
}
