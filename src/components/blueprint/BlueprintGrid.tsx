import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../utils/cn'
interface BlueprintGridProps extends HTMLAttributes<HTMLDivElement> { children?: ReactNode; size?: number; opacity?: number }
export function BlueprintGrid({ children, size = 32, opacity = .06, className, style, ...props }: BlueprintGridProps) {
  return <div className={cn('blueprint-grid', className)} style={{ '--grid-size': `${size}px`, '--grid-opacity': opacity, ...style } as CSSProperties} {...props}>{children}</div>
}
