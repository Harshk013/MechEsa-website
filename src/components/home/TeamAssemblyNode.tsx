import { CursorTarget } from '../interaction/CursorTarget'
import type { TeamMember } from '../../data/types'

export function TeamAssemblyNode({ member, selected, onSelect }: { member: TeamMember; selected: boolean; onSelect: () => void }) {
  return <CursorTarget label="VIEW" intent="view" className={`team-node ${selected ? 'is-selected' : ''}`}>
    <button type="button" className="team-node__button" onClick={onSelect} aria-pressed={selected}>
      <span className="team-node__bolt" aria-hidden="true" />
      <span className="team-node__identity">
        <span className="technical-small">{member.year ?? 'YEAR / TBD'}</span>
        <strong>{member.name}</strong>
        <span>{member.role}</span>
      </span>
      <span className="team-node__axis" aria-hidden="true">＋</span>
    </button>
  </CursorTarget>
}
