import { createContext, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useMotionSettings } from '../../../app/providers/MotionProvider'
import { HOME_SECTIONS } from './homeScroll.constants'
import type { HomeScrollSnapshot } from './homeScroll.types'
import { SectionProgressRail } from './SectionProgressRail'
import { MachineStateIndicator } from './MachineStateIndicator'

const initialSnapshot: HomeScrollSnapshot = { globalProgress: 0, sectionProgress: 0, velocity: 0, direction: 'idle', activeSection: 'home-core', machineState: 'ACTIVE' }
export const HomeScrollContext = createContext<{ snapshot: HomeScrollSnapshot; scrollToSection: (id: string) => void } | null>(null)

export function HomeScrollController({ children }: { children: ReactNode }) {
  const { reducedMotion } = useMotionSettings()
  const [snapshot, setSnapshot] = useState(initialSnapshot)
  const snapshotRef = useRef(initialSnapshot)
  const lastY = useRef(0)
  const lastTime = useRef(performance.now())
  const activeRef = useRef('home-core')
  const lastUiUpdate = useRef(0)

  const scrollToSection = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' })
  }, [reducedMotion])

  useEffect(() => {
    const root = document.querySelector<HTMLElement>('.home-page')
    if (!root) return
    const sections = HOME_SECTIONS.map(item => ({ config: item, element: document.getElementById(item.id) })).filter((item): item is { config: typeof item.config; element: HTMLElement } => Boolean(item.element))
    const observers = sections.map(({ config, element }) => {
      const observer = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return
        const next = snapshotRef.current
        if (activeRef.current === config.id) return
        activeRef.current = config.id
        const updated = { ...next, activeSection: config.id, machineState: config.machineState }
        snapshotRef.current = updated
        setSnapshot(updated)
        root.dataset.activeSection = config.id
        root.dataset.machineState = config.machineState
      }, { rootMargin: '-38% 0px -38% 0px', threshold: 0 })
      observer.observe(element)
      return observer
    })

    let raf = 0
    const tick = (time: number) => {
      const y = window.scrollY
      const dt = Math.max((time - lastTime.current) / 1000, 1 / 120)
      const velocity = Math.max(-2200, Math.min(2200, (y - lastY.current) / dt))
      const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1)
      const globalProgress = Math.max(0, Math.min(1, y / max))
      const active = sections.find(({ element }) => element.id === activeRef.current) ?? sections[0]
      const rect = active?.element.getBoundingClientRect()
      const travel = Math.max(window.innerHeight + (rect?.height ?? window.innerHeight), 1)
      const sectionProgress = rect ? Math.max(0, Math.min(1, (window.innerHeight - rect.top) / travel)) : 0
      const next: HomeScrollSnapshot = { ...snapshotRef.current, globalProgress, sectionProgress, velocity, direction: Math.abs(velocity) < 5 ? 'idle' : velocity > 0 ? 'forward' : 'backward' }
      snapshotRef.current = next
      if (time - lastUiUpdate.current > 120) { lastUiUpdate.current = time; setSnapshot(next) }
      root.style.setProperty('--home-scroll-progress', globalProgress.toFixed(4))
      root.style.setProperty('--home-scroll-velocity', Math.min(1, Math.abs(velocity) / 1200).toFixed(4))
      root.style.setProperty('--home-section-progress', sectionProgress.toFixed(4))
      root.style.setProperty('--home-motion-energy', (reducedMotion ? 0 : Math.min(1, Math.abs(velocity) / 900)).toFixed(4))
      root.dataset.scrollDirection = next.direction
      root.dataset.activeSection = next.activeSection
      sections.forEach(({ element }) => element.classList.toggle('is-motion-active', element.id === next.activeSection))
      if (!reducedMotion) {
        root.style.setProperty('--home-environment-shift', `${Math.min(12, Math.abs(velocity) * 0.006).toFixed(2)}px`)
      } else root.style.setProperty('--home-environment-shift', '0px')
      lastY.current = y
      lastTime.current = time
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => { observers.forEach(observer => observer.disconnect()); cancelAnimationFrame(raf) }
  }, [reducedMotion])

  const value = useMemo(() => ({ snapshot, scrollToSection }), [snapshot, scrollToSection])
  return <HomeScrollContext.Provider value={value}><div className="home-scroll-system"><MachineStateIndicator />{children}<SectionProgressRail /></div></HomeScrollContext.Provider>
}
