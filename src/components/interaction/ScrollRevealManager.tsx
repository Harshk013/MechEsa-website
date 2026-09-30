import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useMotionSettings } from '../../app/providers/MotionProvider'

/**
 * Universal manager that detects `.reveal-on-scroll` elements on every route change.
 * Uses a single IntersectionObserver, unobserves after entry, and honors reduced motion.
 */
export function ScrollRevealManager() {
  const location = useLocation()
  const { reducedMotion } = useMotionSettings()

  useEffect(() => {
    if (typeof window === 'undefined') return

    if (reducedMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll('.reveal-on-scroll').forEach((el) => {
        el.classList.add('is-revealed')
      })
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed')
            observer.unobserve(entry.target)
          }
        })
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -30px 0px',
      }
    )

    const timer = setTimeout(() => {
      const elements = document.querySelectorAll('.reveal-on-scroll:not(.is-revealed)')
      elements.forEach((el) => observer.observe(el))
    }, 60)

    return () => {
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [location.pathname, reducedMotion])

  return null
}
