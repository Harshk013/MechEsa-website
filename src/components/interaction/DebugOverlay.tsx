import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useMotionSettings } from '../../app/providers/MotionProvider'
import { usePointer } from './PointerProvider'

export function DebugOverlay() {
  if (!import.meta.env.DEV) return null
  return <DebugOverlayInner />
}
function DebugOverlayInner() {
  const location = useLocation()
  const { reducedMotion } = useMotionSettings()
  const { pointerRef } = usePointer()
  const [frame, setFrame] = useState(0)
  useEffect(() => { let raf = 0; const tick = () => { setFrame((value) => value + 1); raf = window.setTimeout(() => requestAnimationFrame(tick), 250) as unknown as number }; raf = requestAnimationFrame(tick); return () => { window.clearTimeout(raf) } }, [])
  const p = pointerRef.current
  const core = document.querySelector<HTMLElement>('[data-core-state]')
  return <aside className="debug-overlay" aria-hidden="true"><b>MECHESA DEBUG</b><span>ROUTE / {location.pathname}</span><span>POINTER / {Math.round(p.x)}:{Math.round(p.y)}</span><span>MOTION / {reducedMotion ? 'REDUCED' : 'FULL'}</span><span>CORE / {core?.dataset.coreState ?? 'N/A'}</span><span>RPM / {core?.dataset.coreRpm ?? 'N/A'}</span><span>RATIO / {core?.dataset.coreRatio ?? 'N/A'}</span><span>FOCUS / {core?.dataset.coreFocus ?? 'N/A'}</span><span>WEBGL / R3F</span><span>FRAME / {frame % 60}</span></aside>
}
