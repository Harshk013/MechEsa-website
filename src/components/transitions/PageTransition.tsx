import { AnimatePresence, motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { useMotionSettings } from '../../app/providers/MotionProvider'

export function PageTransition({ children }: { children: ReactNode }) {
  const location = useLocation()
  const { reducedMotion } = useMotionSettings()
  const transition = reducedMotion ? { duration: 0.08 } : { duration: 0.28, ease: [0.2, 0.8, 0.2, 1] as const }
  return <AnimatePresence mode="wait" initial={false}>
    <motion.div key={location.pathname} className="page-transition" initial={{ opacity: 0, y: reducedMotion ? 0 : 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reducedMotion ? 0 : -6 }} transition={transition}>{children}</motion.div>
  </AnimatePresence>
}
