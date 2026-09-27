import { useEffect, useRef } from 'react'
import { usePointer } from './PointerProvider'
import { useMotionSettings } from '../../app/providers/MotionProvider'

export function EngineeringCursor() {
  const { pointerRef, setIntent, clearIntent, isPointerDevice } = usePointer()
  const { reducedMotion } = useMotionSettings()
  const cursorRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!isPointerDevice || reducedMotion) return
    const root = cursorRef.current
    if (!root) return

    let raf = 0
    let lastRenderedX = -999
    let lastRenderedY = -999

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

      // Only update DOM when coordinates actually differ
      if (Math.abs(x - lastRenderedX) > 0.1 || Math.abs(y - lastRenderedY) > 0.1) {
        root.style.transform = `translate3d(${x}px, ${y}px, 0)`
        lastRenderedX = x
        lastRenderedY = y
      }

      root.dataset.intent = p.intent
      root.dataset.visible = p.x > -50 && p.y > -50 ? 'true' : 'false'

      if (labelRef.current) {
        labelRef.current.textContent = p.label ?? ''
        labelRef.current.hidden = !p.label
      }

      // Continue loop only when cursor is inside screen or moving
      raf = requestAnimationFrame(render)
    }

    raf = requestAnimationFrame(render)
    return () => {
      if (raf) cancelAnimationFrame(raf)
    }
  }, [pointerRef, isPointerDevice, reducedMotion])

  useEffect(() => {
    if (!isPointerDevice || reducedMotion) return

    const onOver = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null
      const interactive = target?.closest<HTMLElement>('[data-cursor], a, button, [role="button"]')
      if (!interactive) return
      if (interactive.dataset.cursor === 'disabled' || (interactive instanceof HTMLButtonElement && interactive.disabled)) {
        setIntent('disabled', 'DISABLED')
        return
      }
      const intent =
        (interactive.dataset.cursor as Parameters<typeof setIntent>[0]) ||
        (interactive instanceof HTMLButtonElement || interactive.getAttribute('role') === 'button' ? 'button' : 'link')
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
    return () => {
      document.removeEventListener('pointerover', onOver)
      document.removeEventListener('pointerout', onOut)
    }
  }, [clearIntent, setIntent, isPointerDevice, reducedMotion])

  // Don't mount cursor on touchscreens or reduced motion
  if (!isPointerDevice || reducedMotion) {
    return null
  }

  return (
    <div ref={cursorRef} className="engineering-cursor" aria-hidden="true">
      <span className="engineering-cursor__crosshair" />
      <span className="engineering-cursor__ring" />
      <span ref={labelRef} className="engineering-cursor__label" hidden />
    </div>
  )
}
