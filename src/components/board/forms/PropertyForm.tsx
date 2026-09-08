'use client'

import type { ElementProperties } from '@/lib/types/panel'
import { McbForm } from './McbForm'
import { RcdForm } from './RcdForm'
import { RcboForm } from './RcboForm'
import { IsolatorForm } from './IsolatorForm'
import { VoltageRelayForm } from './VoltageRelayForm'
import { ContactorForm } from './ContactorForm'
import { SurgeProtectorForm } from './SurgeProtectorForm'
import { TimerForm } from './TimerForm'
import { MeterForm } from './MeterForm'
import { SignalLampForm } from './SignalLampForm'
import { SocketForm } from './SocketForm'
import { ButtonForm } from './ButtonForm'
import { MotorStarterForm } from './MotorStarterForm'
import { BuzzerForm } from './BuzzerForm'
import { DimmerForm } from './DimmerForm'

interface Props {
  props: ElementProperties
  onChange: (p: ElementProperties) => void
}

/**
 * Delegating renderer — dispatches to the right form based on the discriminated
 * union tag. Keeps callers free of per-kind conditionals (OCP: adding a new
 * `kind` only requires adding a form file and a case here).
 */
export function PropertyForm({ props, onChange }: Props) {
  switch (props.kind) {
    case 'mcb':             return <McbForm props={props} onChange={onChange} />
    case 'rcd':             return <RcdForm props={props} onChange={onChange} />
    case 'rcbo':            return <RcboForm props={props} onChange={onChange} />
    case 'isolator':        return <IsolatorForm props={props} onChange={onChange} />
    case 'voltage_relay':   return <VoltageRelayForm props={props} onChange={onChange} />
    case 'contactor':       return <ContactorForm props={props} onChange={onChange} />
    case 'surge_protector': return <SurgeProtectorForm props={props} onChange={onChange} />
    case 'timer':           return <TimerForm props={props} onChange={onChange} />
    case 'meter':           return <MeterForm props={props} onChange={onChange} />
    case 'signal_lamp':     return <SignalLampForm props={props} onChange={onChange} />
    case 'socket':          return <SocketForm props={props} onChange={onChange} />
    case 'button':          return <ButtonForm props={props} onChange={onChange} />
    case 'motor_starter':   return <MotorStarterForm props={props} onChange={onChange} />
    case 'buzzer':          return <BuzzerForm props={props} onChange={onChange} />
    case 'dimmer':          return <DimmerForm props={props} onChange={onChange} />
    case 'generic':         return null
  }
}
