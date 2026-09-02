import { useCallback, useEffect, useRef, useState } from 'react'
import { CursorTarget } from '../interaction/CursorTarget'
import { SystemIndicator } from '../telemetry/SystemIndicator'
import { MechanicalCoreScene } from './MechanicalCoreStage/MechanicalCoreScene'
import type { MechanicalCoreState, MechanicalCoreTelemetry } from './MechanicalCoreStage/mechanicalCore.types'
import { MechanicalCoreOverlay } from './MechanicalCoreStage/MechanicalCoreOverlay'
import './MechanicalCoreStage/mechanicalCore.css'

export type { MechanicalCoreState }

export function MechanicalCoreStage({ state = 'idle' }: { state?: MechanicalCoreState }) {
  const [machineState, setMachineState] = useState<MechanicalCoreState>(state)
  const [telemetry, setTelemetry] = useState<MechanicalCoreTelemetry>({ rpm: 0, ratio: 2, cycle: 0, activeObject: 'CORE' })
  const [hoveredObject, setHoveredObject] = useState('CORE')

  const handleTelemetry = useCallback((next: MechanicalCoreTelemetry) => setTelemetry(next), [])
  const handleHover = useCallback((objectName: string | null) => {
    setHoveredObject(objectName ?? 'CORE')
  }, [])

  const engageTimer = useRef<number | null>(null)
  const engage = useCallback(() => {
    if (engageTimer.current) window.clearTimeout(engageTimer.current)
    setMachineState('engaged')
    engageTimer.current = window.setTimeout(() => { setMachineState('active'); engageTimer.current = null }, 1050)
  }, [])

  useEffect(() => () => { if (engageTimer.current) window.clearTimeout(engageTimer.current) }, [])

  const effectiveState = machineState === 'interacting' ? 'active' : machineState

  return (
    <CursorTarget label="ENGAGE" intent="view" className="core-stage" magnetism={0.05}>
      <div className="core-stage__canvas-wrap" onPointerEnter={() => setMachineState((current) => current === 'idle' ? 'active' : current)} data-core-state={machineState} data-core-rpm={telemetry.rpm} data-core-ratio={telemetry.ratio} data-core-focus={hoveredObject} data-cursor="engage" data-cursor-label="ENGAGE" role="img" aria-label="Interactive MechESA mechanical core showing a connected gear train, shaft, bearings, crank and piston">
        <MechanicalCoreScene
          state={effectiveState}
          onTelemetry={handleTelemetry}
          onHover={handleHover}
          onEngage={engage}
        />
        <div className="core-stage__scanline" aria-hidden="true" />
        <div className="core-stage__reticle" aria-hidden="true"><span /><i /></div>
      </div>
      <MechanicalCoreOverlay telemetry={telemetry} hoveredObject={hoveredObject} />
      <div className="core-stage__readout">
        <SystemIndicator state={machineState === 'engaged' ? 'active' : machineState === 'idle' || machineState === 'off' ? 'offline' : 'online'} label={`CORE ${machineState.toUpperCase()}`} />
        <span className="technical-small">STAGE / 01</span>
      </div>
      <button type="button" className="core-stage__engage" onClick={engage} aria-label="Engage the MechESA mechanical core">
        <span className="technical-small">CORE CONTROL</span>
        <strong>{machineState === 'engaged' ? 'ENGAGED' : 'ENGAGE CORE'}</strong>
      </button>
    </CursorTarget>
  )
}
