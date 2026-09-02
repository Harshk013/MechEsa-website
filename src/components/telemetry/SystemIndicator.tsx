import { cn } from '../../utils/cn'

type SystemState = 'online' | 'offline' | 'active' | 'warning' | 'processing' | 'idle'
interface SystemIndicatorProps { state: SystemState; label: string; className?: string }
export function SystemIndicator({ state, label, className }: SystemIndicatorProps) {
  return <span role="status" aria-label={`${label}: ${state}`} className={cn('system-indicator', `system-indicator--${state}`, 'technical-small', className)}><span className="system-indicator__light" aria-hidden="true" />{label}</span>
}
