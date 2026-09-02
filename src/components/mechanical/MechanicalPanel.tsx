import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../utils/cn'

type PanelVariant = 'default' | 'elevated' | 'technical' | 'highlighted' | 'blueprint'

interface MechanicalPanelProps extends HTMLAttributes<HTMLDivElement> {
  variant?: PanelVariant
  children: ReactNode
}

export function MechanicalPanel({ variant = 'default', className, children, ...props }: MechanicalPanelProps) {
  const style = { '--panel-variant': variant, ...props.style } as CSSProperties
  return <div className={cn('mechanical-panel', `mechanical-panel--${variant}`, className)} style={style} {...props}>{children}</div>
}
