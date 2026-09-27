import { useEffect, useRef } from 'react'
import { EngineeringGrid } from '../mechanical/EngineeringGrid'
import { usePointer } from '../interaction/PointerProvider'

export function AmbientEnvironment() {
  const lightRef = useRef<HTMLDivElement>(null)
  const { pointerRef, reducedMotion } = usePointer()

  useEffect(() => {
    if (reducedMotion) return

    let rafId = 0
    let isMoving = false
    let idleTimer = 0

    const updateTransform = () => {
      const p = pointerRef.current
      if (lightRef.current && p.x > 0) {
        // Subtle restrained pointer shift: max ~4%
        lightRef.current.style.transform = `translate3d(${p.nx * 4}%, ${p.ny * 4}%, 0)`
      }
      if (isMoving) {
        rafId = requestAnimationFrame(updateTransform)
      }
    }

    const onPointerMove = () => {
      if (!isMoving) {
        isMoving = true
        rafId = requestAnimationFrame(updateTransform)
      }
      window.clearTimeout(idleTimer)
      // Pause RAF updates after pointer stops moving for 150ms to save CPU/GPU cycles
      idleTimer = window.setTimeout(() => {
        isMoving = false
        if (rafId) cancelAnimationFrame(rafId)
      }, 150)
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })

    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.clearTimeout(idleTimer)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [pointerRef, reducedMotion])

  return (
    <div className="ambient-environment" aria-hidden="true">
      {/* Living ambient light with slow CSS breathing cycle */}
      <div className="ambient-environment__light" ref={lightRef} />

      {/* Two-layer grid system creating spatial depth */}
      {/* Layer 1: Faint stationary base grid */}
      <EngineeringGrid className="ambient-environment__grid ambient-environment__grid--base" size={32} opacity={0.024} />

      {/* Layer 2: Deeper scale grid with very slow atmospheric drift */}
      <EngineeringGrid className="ambient-environment__grid ambient-environment__grid--depth" size={96} opacity={0.016} />

      {/* Subtle datum indicators */}
      <div className="ambient-environment__mark ambient-environment__mark--tl">SYSTEM // MECHESA</div>
      <div className="ambient-environment__mark ambient-environment__mark--br">IIT INDORE // CORE</div>
    </div>
  )
}
