import { MechanicalPanel } from '../components/mechanical/MechanicalPanel'
import { TechnicalLabel } from '../components/typography/TechnicalLabel'

export function PlaceholderPage({ name }: { name: string }) {
  return (
    <section style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 'var(--space-8)' }}>
      <MechanicalPanel variant="technical" style={{ width: 'min(720px, 100%)' }}>
        <TechnicalLabel prefix="ROUTE" suffix="READY">{name}</TechnicalLabel>
        <h1 className="heading-lg" style={{ margin: 'var(--space-5) 0 var(--space-3)' }}>MECHESA SYSTEM FOUNDATION</h1>
        <p className="body-small" style={{ color: 'var(--color-text-muted)', margin: 0 }}>
          This route is intentionally a foundation placeholder. Future prompts will replace it without changing the design system primitives.
        </p>
      </MechanicalPanel>
    </section>
  )
}
