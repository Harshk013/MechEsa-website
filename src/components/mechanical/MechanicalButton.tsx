import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../utils/cn'

type ButtonVariant = 'primary' | 'secondary' | 'technical' | 'ghost' | 'danger'
interface MechanicalButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> { variant?: ButtonVariant; children: ReactNode }

function formatButtonContent(content: ReactNode): ReactNode {
  if (typeof content === 'string') {
    if (content.includes('→')) {
      const parts = content.split('→')
      return (
        <>
          <span>{parts[0].trim()}</span>
          <span className="btn-arrow" aria-hidden="true">→</span>
        </>
      )
    }
    if (content.includes('↗')) {
      const parts = content.split('↗')
      return (
        <>
          <span>{parts[0].trim()}</span>
          <span className="btn-arrow" aria-hidden="true">↗</span>
        </>
      )
    }
  }
  return content
}

export function MechanicalButton({ variant = 'secondary', className, children, type = 'button', ...props }: MechanicalButtonProps) {
  return (
    <button
      type={type}
      className={cn('mechanical-button', `mechanical-button--${variant}`, 'label', className)}
      data-cursor={props.disabled ? 'disabled' : 'button'}
      data-cursor-label={props.disabled ? 'DISABLED' : 'ENGAGE'}
      data-cursor-magnet={variant === 'primary' ? '0.08' : '0'}
      {...props}
    >
      {formatButtonContent(children)}
    </button>
  )
}
