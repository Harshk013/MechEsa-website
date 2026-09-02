import { useEffect, useRef } from 'react'
export interface PointerState { x: number; y: number; interaction: 'default' | 'interactive' }
export function usePointerState() {
  const state = useRef<PointerState>({ x: 0, y: 0, interaction: 'default' })
  useEffect(() => {
    const move = (event: PointerEvent) => { state.current.x = event.clientX; state.current.y = event.clientY }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [])
  return state
}
