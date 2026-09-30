import type { ReactNode } from 'react'

interface SectionHeaderProps { number: string; eyebrow: string; title: string; description?: string; status?: ReactNode; align?: 'left' | 'center' }

export function SectionHeader({ number, eyebrow, title, description, status, align = 'left' }: SectionHeaderProps) {
  return <header className={`home-section-header home-section-header--${align}`} data-engineering-header>
    <div className="home-section-header__meta">
      <span className="page-eyebrow">{number} // {eyebrow}</span>
      {status}
    </div>
    <h2 className="home-section-header__title section-heading">{title}</h2>
    {description && <p className="home-section-header__description section-description">{description}</p>}
  </header>
}
