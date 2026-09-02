import { useEffect } from 'react'
import Lenis from 'lenis'
import { useMotionSettings } from '../app/providers/MotionProvider'

export function useLenis() {
  const { reducedMotion } = useMotionSettings()
  useEffect(() => {
    if (reducedMotion) return
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true, syncTouch: false })
    let frame = 0
    const raf = (time: number) => { lenis.raf(time); frame = requestAnimationFrame(raf) }
    frame = requestAnimationFrame(raf)
    return () => { cancelAnimationFrame(frame); lenis.destroy() }
  }, [reducedMotion])
}
