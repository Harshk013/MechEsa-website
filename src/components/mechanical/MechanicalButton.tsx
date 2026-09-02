import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../utils/cn'

type ButtonVariant = 'primary' | 'secondary' | 'technical' | 'ghost' | 'danger'
interface MechanicalButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> { variant?: ButtonVariant; children: ReactNode }
export function MechanicalButton({ variant = 'secondary', className, children, type = 'button', ...props }: MechanicalButtonProps) {
  return <button type={type} className={cn('mechanical-button', `mechanical-button--${variant}`, 'label', className)} data-cursor={props.disabled ? 'disabled' : 'button'} data-cursor-label={props.disabled ? 'DISABLED' : 'ENGAGE'} data-cursor-magnet={variant === 'primary' ? '0.08' : '0'} {...props}>{children}</button>
}
