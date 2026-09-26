import type { ReactNode } from 'react'

interface SectionHeaderProps { number: string; eyebrow: string; title: string; description?: string; status?: ReactNode; align?: 'left' | 'center' }

export function SectionHeader({ number, eyebrow, title, description, status, align = 'left' }: SectionHeaderProps) {
  return <header className={`home-section-header home-section-header--${align}`} data-engineering-header>
    <div className="home-section-header__meta">
      <span className="page-eyebrow">{number} // {eyebrow}</span>
      {status}
    </div>
    <h2 className="page-heading">{title}</h2>
    {description && <p className="page-description">{description}</p>}
  </header>
}
