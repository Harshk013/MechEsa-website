import { useEffect, useRef, useState } from 'react'

export function useSectionProgress<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const element = ref.current
    if (!element) return
    let raf = 0
    const update = () => {
      const rect = element.getBoundingClientRect()
      const travel = Math.max(window.innerHeight + rect.height, 1)
      setProgress(Math.min(1, Math.max(0, (window.innerHeight - rect.top) / travel)))
      raf = 0
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
    update(); window.addEventListener('scroll', onScroll, { passive: true }); window.addEventListener('resize', onScroll)
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); if (raf) cancelAnimationFrame(raf) }
  }, [])
  return { ref, progress }
}
