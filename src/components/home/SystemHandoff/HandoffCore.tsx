import { useState, type KeyboardEvent } from 'react'
import { CursorTarget } from '../../interaction/CursorTarget'
import { useRepresentation } from '../../../app/providers/RepresentationProvider'
import { handoffNodes, type HandoffNode } from '../../../data/systemHandoff'

type HandoffCoreProps = {
  status: string
  onEngage: () => void
}

function nodePosition(angle: number) {
  const radians = (angle * Math.PI) / 180
  return {
    left: `${50 + Math.cos(radians) * 43}%`,
    top: `${50 + Math.sin(radians) * 43}%`,
  }
}

export function HandoffCore({ status, onEngage }: HandoffCoreProps) {
  const { isBlueprint } = useRepresentation()
  const [activeNode, setActiveNode] = useState<HandoffNode | null>(null)
  const [engaging, setEngaging] = useState(false)
  const [controlHovered, setControlHovered] = useState(false)

  const activate = () => {
    setEngaging(true)
    onEngage()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') setEngaging(true)
  }

  return (
    <div className={`handoff-core ${isBlueprint ? 'is-blueprint' : 'is-reality'} ${engaging ? 'is-engaging' : ''}`}>
      <svg className="handoff-core__diagram" viewBox="0 0 720 720" aria-hidden="true">
        <circle className="handoff-core__construction" cx="360" cy="360" r="286" />
        <circle className="handoff-core__construction handoff-core__construction--inner" cx="360" cy="360" r="224" />
        <circle className="handoff-core__ring handoff-core__ring--outer" cx="360" cy="360" r="264" />
        <circle className="handoff-core__ring handoff-core__ring--inner" cx="360" cy="360" r="184" />
        <circle className="handoff-core__hub-outline" cx="360" cy="360" r="112" />
        <path className="handoff-core__axis" d="M360 58V662M58 360H662" />
        <path className="handoff-core__axis handoff-core__axis--diagonal" d="M146 146L574 574M574 146L146 574" />
        {Array.from({ length: 24 }, (_, index) => {
          const angle = (index / 24) * Math.PI * 2
          const x1 = 360 + Math.cos(angle) * 270
          const y1 = 360 + Math.sin(angle) * 270
          const x2 = 360 + Math.cos(angle) * (index % 2 ? 282 : 292)
          const y2 = 360 + Math.sin(angle) * (index % 2 ? 282 : 292)
          return <line key={index} className="handoff-core__tick" x1={x1} y1={y1} x2={x2} y2={y2} />
        })}
        {handoffNodes.map((node) => {
          const radians = (node.angle * Math.PI) / 180
          const x = 360 + Math.cos(radians) * 226
          const y = 360 + Math.sin(radians) * 226
          const coreX = 360 + Math.cos(radians) * 112
          const coreY = 360 + Math.sin(radians) * 112
          return <line key={node.id} className={`handoff-core__connection ${activeNode?.id === node.id ? 'is-active' : ''}`} x1={coreX} y1={coreY} x2={x} y2={y} />
        })}
      </svg>

      <div className="handoff-core__nodes" aria-label="MechESA system experiences">
        {handoffNodes.map((node) => (
          <CursorTarget key={node.id} label="SYSTEM NODE" intent="view" className="handoff-core__node-wrap">
            <button
              type="button"
              className={`handoff-core__node ${activeNode?.id === node.id ? 'is-active' : ''}`}
              style={nodePosition(node.angle)}
              aria-label={`${node.label} — ${node.context}`}
              aria-pressed={activeNode?.id === node.id}
              onMouseEnter={() => setActiveNode(node)}
              onFocus={() => setActiveNode(node)}
              onMouseLeave={() => setActiveNode(null)}
              onBlur={() => setActiveNode(null)}
              onClick={() => setActiveNode((current) => current?.id === node.id ? null : node)}
            >
              <span className="handoff-core__node-index">{node.id.toUpperCase()}</span>
              <strong>{node.label}</strong>
              <small>{activeNode?.id === node.id ? node.context : 'SYSTEM'}</small>
            </button>
          </CursorTarget>
        ))}
      </div>

      <div className="handoff-core__center">
        <div className="handoff-core__status">
          <span className="handoff-core__status-dot" />
          <span>{status}</span>
        </div>
        <CursorTarget label="ENGAGE SYSTEM" intent="button" magnetism={0.08}>
          <button
            type="button"
            className="handoff-core__control"
            aria-label="Engage MechESA system and continue to contact"
            onPointerDown={() => setEngaging(true)}
            onKeyDown={handleKeyDown}
            onMouseEnter={() => setControlHovered(true)}
            onMouseLeave={() => setControlHovered(false)}
            onFocus={() => setControlHovered(true)}
            onBlur={() => setControlHovered(false)}
            onClick={activate}
          >
            <span className="handoff-core__control-ring" aria-hidden="true" />
            <span className="handoff-core__control-face">
              <small>MECHESA</small>
              <strong>{engaging ? 'ENGAGING' : controlHovered ? 'READY' : 'ENGAGE'}</strong>
              <small>{engaging ? 'SYSTEM' : controlHovered ? 'TO ENGAGE' : 'SYSTEM'}</small>
            </span>
          </button>
        </CursorTarget>
        <span className="handoff-core__center-code">HANDOFF / 08</span>
      </div>
    </div>
  )
}
