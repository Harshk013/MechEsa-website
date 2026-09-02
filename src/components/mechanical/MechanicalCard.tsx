import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../utils/cn'

interface MechanicalCardProps extends HTMLAttributes<HTMLElement> {
  number?: string
  category?: string
  status?: string
  title: string
  description?: string
  action?: ReactNode
}

export function MechanicalCard({ number, category, status, title, description, action, className, ...props }: MechanicalCardProps) {
  return <article className={cn('mechanical-card', className)} {...props}>
    <div className="mechanical-card__top">
      <span className="technical-small">{number ? `MODULE / ${number}` : 'MODULE'}</span>
      {status && <span className="technical-small mechanical-card__status">{status}</span>}
    </div>
    <div className="mechanical-card__body">
      {category && <span className="technical-small mechanical-card__category">{category}</span>}
      <h3 className="heading-md">{title}</h3>
      {description && <p className="body-small">{description}</p>}
    </div>
    {action && <div className="mechanical-card__action">{action}</div>}
  </article>
}
