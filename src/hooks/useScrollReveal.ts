import { useEffect, useRef } from 'react'

interface ScrollRevealOptions {
  threshold?: number
  rootMargin?: string
  delay?: number
}

/**
 * High-performance, GPU-accelerated scroll reveal hook using IntersectionObserver.
 * Unobserves immediately upon entering viewport to avoid ongoing layout thrashing.
 * Respects prefers-reduced-motion automatically.
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(options: ScrollRevealOptions = {}) {
  const ref = useRef<T | null>(null)
  const { threshold = 0.08, rootMargin = '0px 0px -40px 0px', delay = 0 } = options

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.classList.add('is-revealed')
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delay > 0) {
            setTimeout(() => {
              el.classList.add('is-revealed')
            }, delay)
          } else {
            el.classList.add('is-revealed')
          }
          observer.unobserve(el)
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, rootMargin, delay])

  return ref
}
