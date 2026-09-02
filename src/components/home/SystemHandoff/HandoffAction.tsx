import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CursorTarget } from '../../interaction/CursorTarget'

type HandoffActionProps = {
  label: string
  route: string
  primary?: boolean
}

export function HandoffAction({ label, route, primary = false }: HandoffActionProps) {
  const [pressed, setPressed] = useState(false)
  return (
    <CursorTarget label={primary ? 'ENGAGE' : 'VIEW'} intent={primary ? 'button' : 'link'}>
      <Link
        to={route}
        className={`mechanical-button ${primary ? 'mechanical-button--primary' : 'mechanical-button--ghost'} label handoff-action ${pressed ? 'is-pressed' : ''}`}
        onPointerDown={() => setPressed(true)}
        onBlur={() => setPressed(false)}
      >
        {label} ↗
      </Link>
    </CursorTarget>
  )
}
