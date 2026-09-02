import type { CSSProperties } from 'react'
import type { MotionState } from './engineeringMotion.types'
import { calculateSystemStatus } from './engineeringMotion.model'
export function SystemSignals({state}:{state:MotionState}){const channels=[['VELOCITY',state.speed],['THERMAL',state.thermal],['LOAD',state.load]] as const;return <div className="motion-signals">{channels.map(([label,value])=>{const status=calculateSystemStatus(value);return <div className="motion-signal-card" key={label}><div><span>{label}</span><strong>{Math.round(value).toString().padStart(2,'0')}</strong></div><i className={`is-${status.toLowerCase()}`} style={{'--signal-level':`${value}%`} as CSSProperties}/><small>CONCEPTUAL STATE / {status}</small></div>})}</div>}
