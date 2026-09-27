import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type MutableRefObject, type ReactNode } from 'react'

type CursorIntent = 'default' | 'hover' | 'link' | 'button' | 'drag' | 'view' | 'disabled'
export type PointerSnapshot = { x: number; y: number; nx: number; ny: number; vx: number; vy: number; intent: CursorIntent; label: string | null; magnetism: number; target: HTMLElement | null }

type PointerContextValue = {
  pointerRef: MutableRefObject<PointerSnapshot>
  setIntent: (intent: CursorIntent, label?: string | null, magnetism?: number, target?: HTMLElement | null) => void
  clearIntent: () => void
  reducedMotion: boolean
  isPointerDevice: boolean
}

const initial: PointerSnapshot = { x: -100, y: -100, nx: 0, ny: 0, vx: 0, vy: 0, intent: 'default', label: null, magnetism: 0, target: null }
const PointerContext = createContext<PointerContextValue | null>(null)

export function PointerProvider({ children, reducedMotion }: { children: ReactNode; reducedMotion: boolean }) {
  const pointerRef = useRef<PointerSnapshot>(initial)
  const [isPointerDevice, setIsPointerDevice] = useState(false)

  useEffect(() => {
    const query = window.matchMedia('(pointer: fine)')
    const update = () => setIsPointerDevice(query.matches)
    update()
    query.addEventListener?.('change', update)
    return () => query.removeEventListener?.('change', update)
  }, [])

  useEffect(() => {
    if (!isPointerDevice) return
    let raf = 0
    let lastX = window.innerWidth / 2
    let lastY = window.innerHeight / 2
    const onMove = (event: PointerEvent) => {
      const nextX = event.clientX
      const nextY = event.clientY
      const update = () => {
        const current = pointerRef.current
        const alpha = reducedMotion ? 1 : 0.22
        current.vx = nextX - lastX
        current.vy = nextY - lastY
        current.x += (nextX - current.x) * alpha
        current.y += (nextY - current.y) * alpha
        current.nx = current.x / Math.max(window.innerWidth, 1) * 2 - 1
        current.ny = current.y / Math.max(window.innerHeight, 1) * 2 - 1
        lastX = nextX
        lastY = nextY
        raf = 0
      }
      if (!raf) raf = requestAnimationFrame(update)
    }
    const onLeave = () => { pointerRef.current.x = -100; pointerRef.current.y = -100 }
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('blur', onLeave)
    document.documentElement.addEventListener('mouseleave', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('blur', onLeave)
      document.documentElement.removeEventListener('mouseleave', onLeave)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [isPointerDevice, reducedMotion, pointerRef])

  const setIntent = useCallback((intent: CursorIntent, label: string | null = null, magnetism = 0, target: HTMLElement | null = null) => {
    pointerRef.current.intent = intent
    pointerRef.current.label = label
    pointerRef.current.magnetism = magnetism
    pointerRef.current.target = target
  }, [])
  const clearIntent = useCallback(() => {
    pointerRef.current.intent = 'default'
    pointerRef.current.label = null
    pointerRef.current.magnetism = 0
    pointerRef.current.target = null
  }, [])

  const value = useMemo(
    () => ({ pointerRef, setIntent, clearIntent, reducedMotion, isPointerDevice }),
    [clearIntent, reducedMotion, setIntent, isPointerDevice]
  )
  return <PointerContext.Provider value={value}>{children}</PointerContext.Provider>
}

export function usePointer() {
  const context = useContext(PointerContext)
  if (!context) throw new Error('usePointer must be used inside PointerProvider')
  return context
}
