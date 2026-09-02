import type { HTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

export function TechnicalCorner({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span aria-hidden="true" className={cn('technical-corner', className)} {...props} />
}
