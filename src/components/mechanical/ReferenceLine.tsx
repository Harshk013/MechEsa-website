import type { HTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

export function ReferenceLine({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span aria-hidden="true" className={cn('reference-line', className)} {...props} />
}
