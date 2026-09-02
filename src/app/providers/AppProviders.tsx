import type { ReactNode } from 'react'
import { MotionProvider, useMotionSettings } from './MotionProvider'
import { PointerProvider } from '../../components/interaction/PointerProvider'
import { ScrollProvider } from './ScrollProvider'

export function AppProviders({ children }: { children: ReactNode }) {
  return <MotionProvider><PointerBridge><ScrollProvider>{children}</ScrollProvider></PointerBridge></MotionProvider>
}
function PointerBridge({ children }: { children: ReactNode }) {
  const { reducedMotion } = useMotionSettings()
  return <PointerProvider reducedMotion={reducedMotion}>{children}</PointerProvider>
}
