import type { HTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

interface SectionMarkerProps extends HTMLAttributes<HTMLSpanElement> { number: string; label?: string }
export function SectionMarker({ number, label, className, ...props }: SectionMarkerProps) {
  return <span className={cn('section-marker', className)} {...props}><span className="section-marker__number">{number}</span>{label && <span className="technical-small">{label}</span>}</span>
}
