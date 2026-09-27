import type { ReactNode } from 'react'
import { MechLabHeader } from './MechLabHeader'
import './mechLab.css'

interface MechLabShellProps {
  children: ReactNode
}

export function MechLabShell({ children }: MechLabShellProps) {
  return (
    <div className="mech-lab-shell">
      <div className="mech-lab-shell__bg" aria-hidden="true" />
      <div className="mech-lab-shell__vignette" aria-hidden="true" />
      <MechLabHeader />
      <main id="mech-lab-root" className="mech-lab-main">
        {children}
      </main>
    </div>
  )
}
