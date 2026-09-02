import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../utils/cn'
interface TechnicalLabelProps extends HTMLAttributes<HTMLSpanElement> { children: ReactNode; prefix?: ReactNode; suffix?: ReactNode; indicator?: boolean }
export function TechnicalLabel({ children, prefix, suffix, indicator = false, className, ...props }: TechnicalLabelProps) {
  return <span className={cn('technical-label', 'technical-small', className)} {...props}>{prefix && <span className="technical-label__prefix">{prefix}</span>}{indicator && <span className="technical-label__indicator" aria-hidden="true" />}<span>{children}</span>{suffix && <span className="technical-label__suffix">{suffix}</span>}</span>
}
