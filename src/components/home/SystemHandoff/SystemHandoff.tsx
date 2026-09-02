import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TechnicalLabel } from '../../typography/TechnicalLabel'
import { TechnicalDivider } from '../../mechanical/TechnicalDivider'
import { handoffActions } from '../../../data/systemHandoff'
import { HandoffCore } from './HandoffCore'
import { HandoffStatus } from './HandoffStatus'
import { HandoffAction } from './HandoffAction'
import './SystemHandoff.css'

export function SystemHandoff() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('READY')

  const handleEngage = () => {
    setStatus('SYSTEM HANDOFF')
    navigate(handoffActions.engage.route)
  }

  return (
    <section className="home-section system-handoff-section" id="join" data-section="08" data-transition="mechanical-lock" data-motion="handoff">
      <div className="page-container">
        <TechnicalDivider label="SYSTEM HANDOFF / 08" />
        <div className="system-handoff__header">
          <TechnicalLabel prefix="08">SYSTEM HANDOFF</TechnicalLabel>
          <span className="technical-small">INPUT REQUIRED / OPERATOR READY</span>
        </div>

        <div className="system-handoff__layout">
          <div className="system-handoff__instrument">
            <HandoffCore status={status} onEngage={handleEngage} />
          </div>
          <div className="system-handoff__copy">
            <HandoffStatus status={status} />
            <div className="system-handoff__message">
              <span className="technical-small">FINAL INPUT / 08</span>
              <h2>ENGINEERING IS A PROCESS.<br /><em>BUILD IT WITH US.</em></h2>
              <p className="body-small">The machine is complete. The systems are connected. The next input is human.</p>
            </div>
            <div className="system-handoff__actions">
              <HandoffAction label={handoffActions.engage.label} route={handoffActions.engage.route} primary />
              <HandoffAction label={handoffActions.explore.label} route={handoffActions.explore.route} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
