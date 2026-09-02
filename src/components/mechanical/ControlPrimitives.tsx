import type { HTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

export function ControlSample({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('control-sample', className)} {...props} />
}

export function MechanicalSwitch({ on = true, label = 'ACTIVE' }: { on?: boolean; label?: string }) {
  return <div className="mechanical-switch" aria-label={label}><span className={cn('mechanical-switch__track', on && 'is-on')}><span className="mechanical-switch__thumb" /></span><span className="technical-small">{label}</span></div>
}

export function MechanicalDial({ value = 72, label = 'LOAD' }: { value?: number; label?: string }) {
  const rotation = -135 + Math.max(0, Math.min(100, value)) * 2.7
  return <div className="mechanical-dial"><div className="mechanical-dial__face"><span className="mechanical-dial__needle" style={{ transform: `rotate(${rotation}deg)` }} /><span className="mechanical-dial__center" /></div><span className="technical-small">{label}</span><strong className="telemetry mechanical-dial__value">{value}%</strong></div>
}

export function MechanicalGauge({ value = 84, unit = '%', label = 'PRESSURE' }: { value?: number; unit?: string; label?: string }) {
  return <div className="mechanical-gauge"><div className="mechanical-gauge__header"><span className="technical-small">{label}</span><strong className="telemetry">{value}{unit}</strong></div><div className="mechanical-gauge__track"><span style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div></div>
}
