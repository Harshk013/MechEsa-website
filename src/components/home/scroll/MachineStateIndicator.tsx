import { SystemIndicator } from '../../telemetry/SystemIndicator'
import { useHomeScrollProgress } from './useHomeScrollProgress'

export function MachineStateIndicator() {
  const { snapshot } = useHomeScrollProgress()
  const active = snapshot.machineState !== 'READY'
  return <div className="home-machine-state" aria-live="polite"><SystemIndicator state={active ? 'active' : 'online'} label={`MACHINE / ${snapshot.machineState}`} /><span className="technical-small">SEC {snapshot.activeSection.replace(/\D/g, '') || '01'} / {Math.round(snapshot.sectionProgress * 100)}%</span></div>
}
