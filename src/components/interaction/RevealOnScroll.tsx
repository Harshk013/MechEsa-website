import type { HTMLAttributes, ReactNode } from 'react'
import { useScrollReveal } from '../../hooks/useScrollReveal'
import { cn } from '../../utils/cn'

interface RevealOnScrollProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  stagger?: 1 | 2 | 3 | 4
  delay?: number
  className?: string
}

/**
 * Reusable RevealOnScroll wrapper providing subtle opacity + translateY entrance.
 * Staggers cards and content sections with restrained 2026 engineering aesthetics.
 */
export function RevealOnScroll({
  children,
  stagger,
  delay,
  className = '',
  ...props
}: RevealOnScrollProps) {
  const ref = useScrollReveal<HTMLDivElement>({ delay })
  const staggerClass = stagger ? `reveal-stagger-${stagger}` : ''

  return (
    <div
      ref={ref}
      className={cn('reveal-on-scroll', staggerClass, className)}
      {...props}
    >
      {children}
    </div>
  )
}
