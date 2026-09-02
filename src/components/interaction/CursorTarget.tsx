import type { ReactNode } from 'react'
import { usePointer } from './PointerProvider'

type CursorTargetProps = { children: ReactNode; intent?: 'hover' | 'link' | 'button' | 'drag' | 'view' | 'disabled'; label?: string; magnetism?: number; className?: string }
export function CursorTarget({ children, intent = 'hover', label, magnetism = 0, className }: CursorTargetProps) {
  const { setIntent, clearIntent } = usePointer()
  return <span className={className} data-cursor={intent} data-cursor-label={label ?? ''} data-cursor-magnet={magnetism} onPointerEnter={(event) => setIntent(intent, label, magnetism, event.currentTarget)} onPointerLeave={clearIntent}>{children}</span>
}
