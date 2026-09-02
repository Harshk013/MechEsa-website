import { TechnicalLabel } from '../typography/TechnicalLabel'
import { cn } from '../../utils/cn'
interface TechnicalDividerProps { label?: string; className?: string }
export function TechnicalDivider({ label = 'SECTION', className }: TechnicalDividerProps) {
  return <div className={cn('technical-divider', className)}><TechnicalLabel>{label}</TechnicalLabel><span className="technical-divider__line" aria-hidden="true" /><span className="technical-divider__marker" aria-hidden="true" /></div>
}
