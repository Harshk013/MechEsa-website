// src/components/mechLab/shared/MechLabHint.tsx
// Reusable collapsible hint component across all Mech Lab systems

import { useState } from 'react'

export interface MechLabHintProps {
  hint?: string
  title?: string
  className?: string
  defaultOpen?: boolean
}

export function MechLabHint({
  hint,
  title = 'ENGINEERING HINT',
  className = '',
  defaultOpen = false,
}: MechLabHintProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  if (!hint) return null

  return (
    <div className={`mech-lab-hint ${isOpen ? 'is-open' : ''} ${className}`}>
      <button
        type="button"
        className="mech-lab-hint__toggle"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
      >
        <span className="mech-lab-hint__label">
          <span className="mech-lab-hint__bulb" aria-hidden="true">💡</span>
          <span className="mech-lab-hint__title">{title}</span>
        </span>
        <span className="mech-lab-hint__arrow" aria-hidden="true">
          {isOpen ? '▲ HIDE' : '▼ VIEW'}
        </span>
      </button>

      {isOpen && (
        <div className="mech-lab-hint__body" role="region">
          <p className="mech-lab-hint__text">{hint}</p>
        </div>
      )}
    </div>
  )
}
