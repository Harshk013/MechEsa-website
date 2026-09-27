import { useState, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { usePointer } from '../interaction/PointerProvider'
import { useMotionSettings } from '../../app/providers/MotionProvider'
import './floatingMechLab.css'

export function FloatingMechLabTrigger() {
  const location = useLocation()
  const navigate = useNavigate()
  const { setIntent, clearIntent } = usePointer()
  const { reducedMotion } = useMotionSettings()
  const [activating, setActivating] = useState(false)
  const [ringPos, setRingPos] = useState<{ x: number; y: number } | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Do not render the floating entry trigger when already inside the Mech Lab
  if (location.pathname.startsWith('/lab') || location.pathname === '/mech-lab') {
    return null
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (activating) return

    if (reducedMotion) {
      navigate('/lab')
      return
    }

    // Capture button center for expansion effect
    const rect = e.currentTarget.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    setRingPos({ x: cx, y: cy })
    setActivating(true)

    // Short mechanical transition (400ms) before navigating
    setTimeout(() => {
      navigate('/lab')
      setActivating(false)
      setRingPos(null)
    }, 420)
  }

  return (
    <>
      <aside className="floating-lab-trigger" aria-label="Mech Lab quick launch">
        <button
          ref={buttonRef}
          type="button"
          className={`floating-lab-trigger__button${activating ? ' is-activating' : ''}`}
          aria-label="Open MechESA Mech Lab"
          aria-describedby="lab-tooltip"
          onClick={handleClick}
          onPointerEnter={() => setIntent('button', 'MECH LAB')}
          onPointerLeave={clearIntent}
        >
          <span className="floating-lab-trigger__led" aria-hidden="true" />
          <div className="floating-lab-trigger__content" aria-hidden="true">
            <span className="floating-lab-trigger__txt">MECH</span>
            <span className="floating-lab-trigger__sub">
              LAB <i aria-hidden="true">↗</i>
            </span>
          </div>
        </button>
        <span id="lab-tooltip" className="floating-lab-trigger__tooltip" role="tooltip">
          EXPLORE MECH LAB
        </span>
      </aside>

      {ringPos && !reducedMotion && (
        <div
          className="floating-lab-trigger__expand-ring"
          style={{ left: ringPos.x, top: ringPos.y }}
          aria-hidden="true"
        />
      )}
    </>
  )
}
