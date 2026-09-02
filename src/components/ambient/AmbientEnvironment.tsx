import { useEffect, useRef } from 'react'
import { EngineeringGrid } from '../mechanical/EngineeringGrid'
import { usePointer } from '../interaction/PointerProvider'

export function AmbientEnvironment() {
  const lightRef = useRef<HTMLDivElement>(null)
  const { pointerRef, reducedMotion } = usePointer()
  useEffect(() => {
    if (reducedMotion) return
    let raf = 0
    const tick = () => {
      const p = pointerRef.current
      if (lightRef.current && p.x > 0) lightRef.current.style.transform = `translate3d(${p.nx * 6}%, ${p.ny * 6}%, 0)`
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [pointerRef, reducedMotion])

  return <div className="ambient-environment" aria-hidden="true">
    <div className="ambient-environment__light" ref={lightRef} />
    <EngineeringGrid className="ambient-environment__grid" size={24} opacity={0.028} />
    <div className="ambient-environment__mark ambient-environment__mark--tl">X 000.00 / Y 000.00</div>
    <div className="ambient-environment__mark ambient-environment__mark--br">MECHESA / ENV-03</div>
  </div>
}
