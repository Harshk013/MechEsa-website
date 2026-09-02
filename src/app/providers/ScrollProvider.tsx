import type { ReactNode } from 'react'
import { useLenis } from '../../hooks/useLenis'
export function ScrollProvider({ children }: { children: ReactNode }) { useLenis(); return <>{children}</> }
