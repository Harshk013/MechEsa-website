import type { MechanicalCoreTelemetry } from './mechanicalCore.types'

export function MechanicalCoreOverlay({ telemetry, hoveredObject }: { telemetry: MechanicalCoreTelemetry; hoveredObject: string }) {
  const focus = hoveredObject === 'CORE' ? 'SYSTEM' : hoveredObject
  return <>
    <div className="core-stage__telemetry" aria-hidden="true">
      <div><span>CORE RPM</span><strong>{telemetry.rpm}</strong></div>
      <div><span>RATIO</span><strong>{telemetry.ratio.toFixed(2)} : 1</strong></div>
      <div><span>CYCLE</span><strong>{String(telemetry.cycle).padStart(2, '0')}</strong></div>
      <div><span>FOCUS</span><strong>{focus}</strong></div>
    </div>
    <div className="core-stage__annotations" aria-hidden="true">
      <span className="core-stage__annotation core-stage__annotation--input">POWER INPUT <i /></span>
      <span className="core-stage__annotation core-stage__annotation--train">GEAR TRAIN <i /></span>
      <span className="core-stage__annotation core-stage__annotation--actuator">ACTUATOR <i /></span>
    </div>
  </>
}
