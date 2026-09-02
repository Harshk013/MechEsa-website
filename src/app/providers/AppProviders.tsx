import type { ReactNode } from 'react'
import { MotionProvider, useMotionSettings } from './MotionProvider'
import { PointerProvider } from '../../components/interaction/PointerProvider'
import { ScrollProvider } from './ScrollProvider'
import { RepresentationProvider } from './RepresentationProvider'

export function AppProviders({ children }: { children: ReactNode }) {
  return <MotionProvider><RepresentationProvider><PointerBridge><ScrollProvider>{children}</ScrollProvider></PointerBridge></RepresentationProvider></MotionProvider>
}
function PointerBridge({ children }: { children: ReactNode }) {
  const { reducedMotion } = useMotionSettings()
  return <PointerProvider reducedMotion={reducedMotion}>{children}</PointerProvider>
}
