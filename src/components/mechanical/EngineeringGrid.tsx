import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../utils/cn'
interface EngineeringGridProps extends HTMLAttributes<HTMLDivElement> { children?: ReactNode; size?: number; opacity?: number }
export function EngineeringGrid({ children, size = 32, opacity = .035, className, style, ...props }: EngineeringGridProps) {
  return <div className={cn('engineering-grid', className)} style={{ '--grid-size': `${size}px`, '--grid-opacity': opacity, ...style } as CSSProperties} {...props}>{children}</div>
}
