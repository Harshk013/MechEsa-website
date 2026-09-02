import type { ReactNode } from 'react'
import type { CSSProperties } from 'react'
import { usePointer } from './PointerProvider'

type CursorTargetProps = { children: ReactNode; intent?: 'hover' | 'link' | 'button' | 'drag' | 'view' | 'disabled'; label?: string; magnetism?: number; className?: string; style?: CSSProperties }
export function CursorTarget({ children, intent = 'hover', label, magnetism = 0, className, style }: CursorTargetProps) {
  const { setIntent, clearIntent } = usePointer()
  return <span className={className} style={style} data-cursor={intent} data-cursor-label={label ?? ''} data-cursor-magnet={magnetism} onPointerEnter={(event) => setIntent(intent, label, magnetism, event.currentTarget)} onPointerLeave={clearIntent}>{children}</span>
}
