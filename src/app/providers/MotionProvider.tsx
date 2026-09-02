import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'

type MotionContextValue = { reducedMotion: boolean }
const MotionContext = createContext<MotionContextValue | null>(null)

export function MotionProvider({ children }: { children: ReactNode }) {
  const prefersReducedMotion = useReducedMotion()
  const [reducedMotion, setReducedMotion] = useState(prefersReducedMotion)

  useEffect(() => setReducedMotion(prefersReducedMotion), [prefersReducedMotion])

  const value = useMemo(() => ({ reducedMotion }), [reducedMotion])
  return <MotionContext.Provider value={value}>{children}</MotionContext.Provider>
}

export function useMotionSettings() {
  const context = useContext(MotionContext)
  if (!context) throw new Error('useMotionSettings must be used inside MotionProvider')
  return context
}
