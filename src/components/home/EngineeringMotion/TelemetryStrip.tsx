import type { MotionState } from './engineeringMotion.types'
export function TelemetryStrip({state}:{state:MotionState}){return <div className="motion-telemetry" aria-live="polite"><Metric label="SPEED INDEX" value={state.speed}/><Metric label="LOAD INDEX" value={state.load}/><Metric label="THERMAL LOAD" value={state.thermal}/><Metric label="EFFICIENCY" value={state.efficiency}/></div>}
function Metric({label,value}:{label:string;value:number}){return <div className="motion-telemetry__metric"><span>{label}</span><strong>{Math.round(value).toString().padStart(2,'0')}</strong></div>}
