import { CursorTarget } from '../interaction/CursorTarget'
import type { EngineeringSystem } from '../../data/home'
import { SystemIndicator } from '../telemetry/SystemIndicator'

export function EngineeringSystemNode({ system, selected, onSelect }: { system: EngineeringSystem; selected: boolean; onSelect: () => void }) {
  return <CursorTarget label="VIEW" intent="view" className={`system-node ${selected ? 'is-selected' : ''}`}>
    <button type="button" className="system-node__button" onClick={onSelect} aria-pressed={selected}>
      <span className="system-node__index">{system.shortLabel}</span>
      <span className="system-node__title">{system.title}</span>
      <span className="system-node__metric technical-small">{system.metric}</span>
      <SystemIndicator state={system.status === 'ACTIVE' ? 'active' : 'idle'} label={system.status} />
      <span className="system-node__target" aria-hidden="true">↗</span>
    </button>
  </CursorTarget>
}
