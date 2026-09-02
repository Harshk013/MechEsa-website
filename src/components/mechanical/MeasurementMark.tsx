import type { HTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

interface MeasurementMarkProps extends HTMLAttributes<HTMLSpanElement> { value?: string; orientation?: 'horizontal' | 'vertical' }
export function MeasurementMark({ value, orientation = 'horizontal', className, ...props }: MeasurementMarkProps) {
  return <span className={cn('measurement-mark', `measurement-mark--${orientation}`, className)} {...props}><span aria-hidden="true" className="measurement-mark__tick" />{value && <span className="technical-small">{value}</span>}</span>
}
