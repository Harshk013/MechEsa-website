import type { ReactNode } from 'react'
import { TechnicalLabel } from '../typography/TechnicalLabel'

interface SectionHeaderProps { number: string; eyebrow: string; title: string; description?: string; status?: ReactNode; align?: 'left' | 'center' }

export function SectionHeader({ number, eyebrow, title, description, status, align = 'left' }: SectionHeaderProps) {
  return <header className={`home-section-header home-section-header--${align}`} data-engineering-header>
    <div className="home-section-header__meta">
      <TechnicalLabel prefix={number}>{eyebrow}</TechnicalLabel>
      {status}
    </div>
    <h2 className="home-section-header__title">{title}</h2>
    {description && <p className="home-section-header__description">{description}</p>}
  </header>
}
