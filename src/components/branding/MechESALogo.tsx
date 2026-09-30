import { MechESAWordmark } from './MechESAWordmark'
import { MechESAEmblem } from './MechESAEmblem'
import './branding.css'

interface MechESALogoProps {
  showEmblem?: boolean
  showSubline?: boolean
  emblemHeight?: number | string
  wordmarkHeight?: number | string
  className?: string
}

/**
 * MechESALogo combines the authentic MechESA mechanical emblem and
 * the official MECH-E STUDENT ASSOCIATION wordmark in a crisp, scalable lockup.
 * Optimized for the navbar and global branding.
 */
export function MechESALogo({
  showEmblem = true,
  showSubline = true,
  emblemHeight = 38,
  wordmarkHeight = 28,
  className = '',
}: MechESALogoProps) {
  return (
    <div className={`mechesa-brand-lockup ${className}`} aria-label="MechESA — Mechanical Engineering Students Association, IIT Indore">
      {showEmblem && (
        <div className="mechesa-brand-lockup__emblem-wrap">
          <MechESAEmblem height={emblemHeight} className="mechesa-brand-lockup__emblem" />
        </div>
      )}
      <div className="mechesa-brand-lockup__text">
        <MechESAWordmark height={wordmarkHeight} className="mechesa-brand-lockup__wordmark" />
        {showSubline && (
          <span className="mechesa-brand-lockup__sub">
            <span className="mechesa-brand-lockup__sub-sep" aria-hidden="true" />
            <span className="mechesa-brand-lockup__sub-text">IIT INDORE</span>
          </span>
        )}
      </div>
    </div>
  )
}

export { MechESAWordmark } from './MechESAWordmark'
export { MechESAEmblem } from './MechESAEmblem'
