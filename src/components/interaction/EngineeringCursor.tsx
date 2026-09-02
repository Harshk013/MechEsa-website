import { useEffect, useRef } from 'react'
import { usePointer } from './PointerProvider'
import { useMotionSettings } from '../../app/providers/MotionProvider'

export function EngineeringCursor() {
  const { pointerRef, setIntent, clearIntent } = usePointer()
  const { reducedMotion } = useMotionSettings()
  const cursorRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const root = cursorRef.current
    if (!root) return
    let raf = 0
    const render = () => {
      const p = pointerRef.current
      let x = p.x
      let y = p.y
      if (!reducedMotion && p.magnetism > 0 && p.target?.isConnected) {
        const rect = p.target.getBoundingClientRect()
        const strength = Math.min(1, p.magnetism)
        x += (rect.left + rect.width / 2 - x) * strength
        y += (rect.top + rect.height / 2 - y) * strength
      }
      root.style.transform = `translate3d(${x}px, ${y}px, 0)`
      root.dataset.intent = p.intent
      root.dataset.visible = p.x > -50 && p.y > -50 ? 'true' : 'false'
      if (labelRef.current) {
        labelRef.current.textContent = p.label ?? ''
        labelRef.current.hidden = !p.label
      }
      raf = requestAnimationFrame(render)
    }
    raf = requestAnimationFrame(render)
    return () => cancelAnimationFrame(raf)
  }, [pointerRef])

  useEffect(() => {
    const onOver = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null
      const interactive = target?.closest<HTMLElement>('[data-cursor], a, button, [role="button"]')
      if (!interactive) return
      if (interactive.dataset.cursor === 'disabled' || (interactive instanceof HTMLButtonElement && interactive.disabled)) {
        setIntent('disabled', 'DISABLED')
        return
      }
      const intent = (interactive.dataset.cursor as Parameters<typeof setIntent>[0]) || (interactive instanceof HTMLButtonElement || interactive.getAttribute('role') === 'button' ? 'button' : 'link')
      const label = interactive.dataset.cursorLabel || (intent === 'button' ? 'ENGAGE' : 'ACCESS')
      const magnetism = Number(interactive.dataset.cursorMagnet || 0)
      setIntent(intent, label, Number.isFinite(magnetism) ? magnetism : 0, interactive)
    }
    const onOut = (event: PointerEvent) => {
      const related = event.relatedTarget as Node | null
      if (related && related instanceof Element && related.closest('[data-cursor], a, button, [role="button"]')) return
      clearIntent()
    }
    document.addEventListener('pointerover', onOver, { passive: true })
    document.addEventListener('pointerout', onOut, { passive: true })
    return () => { document.removeEventListener('pointerover', onOver); document.removeEventListener('pointerout', onOut) }
  }, [clearIntent, setIntent])

  return (
    <div ref={cursorRef} className="engineering-cursor" data-reduced-motion={reducedMotion} aria-hidden="true">
      <span className="engineering-cursor__crosshair" />
      <span className="engineering-cursor__ring" />
      <span ref={labelRef} className="engineering-cursor__label" hidden />
    </div>
  )
}
