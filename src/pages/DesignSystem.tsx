import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { EngineeringGrid } from '../components/mechanical/EngineeringGrid'
import { BlueprintGrid } from '../components/blueprint/BlueprintGrid'
import { MechanicalButton } from '../components/mechanical/MechanicalButton'
import { MechanicalPanel } from '../components/mechanical/MechanicalPanel'
import { TechnicalDivider } from '../components/mechanical/TechnicalDivider'
import { TechnicalLabel } from '../components/typography/TechnicalLabel'
import { SystemIndicator } from '../components/telemetry/SystemIndicator'
import { MechanicalCard } from '../components/mechanical/MechanicalCard'
import { MechanicalDial, MechanicalGauge, MechanicalSwitch } from '../components/mechanical/ControlPrimitives'
import { SectionMarker } from '../components/mechanical/SectionMarker'

const colors = [
  ['Background', '--color-bg'], ['Deep surface', '--color-bg-deep'], ['Panel', '--color-panel'], ['Elevated', '--color-surface-elevated'],
  ['Text', '--color-text'], ['Muted', '--color-text-muted'], ['Accent', '--color-accent'], ['Warning', '--color-warning'], ['Success', '--color-success'], ['Info', '--color-info'],
]

export function DesignSystem() {
  useEffect(() => { document.title = 'MechESA // Design System' }, [])
  return <div className="design-lab">
    <header className="design-lab__header">
      <div><TechnicalLabel indicator prefix="MECHESA" suffix="BUILD / 02">DESIGN SYSTEM</TechnicalLabel><h1 className="heading-xl">Engineering Interface Lab</h1><p className="body-small design-lab__intro">A controlled visual reference for MECHESA // ENGINEERED MOTION. Components here are the source language for future pages and interactive systems.</p></div>
      <Link className="mechanical-button mechanical-button--ghost label" to="/">RETURN / HOME</Link>
    </header>

    <nav className="design-lab__nav" aria-label="Design system sections">
      {['colors','type','surfaces','components','controls','grid','status','motion','interaction'].map((id, i) => <a key={id} href={`#${id}`}><span>{String(i + 1).padStart(2,'0')}</span>{id}</a>)}
    </nav>

    <main className="design-lab__content">
      <section id="colors" className="lab-section"><SectionMarker number="01" label="COLOR SYSTEM" /><TechnicalDivider label="TOKENS / GRAPHITE" />
        <div className="swatch-grid">{colors.map(([name, token]) => <div className="swatch" key={token}><div className="swatch__sample" style={{ background: `var(${token})` }} /><div><span className="technical-small">{name}</span><code>{token}</code></div></div>)}</div>
        <div className="accent-note"><span className="technical-small">ACCENT SOURCE</span><strong>REPLACE IN ONE LOCATION</strong><p className="body-small">No MechESA logo asset is present in the current foundation, so the accent remains intentionally neutral and replaceable.</p></div>
      </section>

      <section id="type" className="lab-section"><SectionMarker number="02" label="TYPOGRAPHY" /><TechnicalDivider label="TYPE / HIERARCHY" />
        <div className="type-stack"><div><span className="technical-small">DISPLAY</span><div className="display">ENGINEERED</div></div><div><span className="technical-small">HEADING</span><div className="heading-lg">Precision in motion.</div></div><div><span className="technical-small">BODY</span><p className="body">Mechanical identity comes from proportion, structure, information density and controlled movement—not decorative noise.</p></div><div className="type-telemetry"><span className="technical-small">TELEMETRY</span><strong className="telemetry">08,420 RPM</strong><span className="technical-small">SYSTEM / NOMINAL</span></div></div>
      </section>

      <section id="surfaces" className="lab-section"><SectionMarker number="03" label="SURFACES" /><TechnicalDivider label="PANEL / DEPTH" />
        <div className="panel-grid">{(['default','elevated','technical','highlighted','blueprint'] as const).map(v => <MechanicalPanel variant={v} key={v}><TechnicalLabel>{v} PANEL</TechnicalLabel><h3 className="heading-md">Machined surface</h3><p className="body-small">Subtle edge treatment, controlled contrast and restrained depth.</p></MechanicalPanel>)}</div>
      </section>

      <section id="components" className="lab-section"><SectionMarker number="04" label="COMPONENTS" /><TechnicalDivider label="INTERFACE / HARDWARE" />
        <div className="component-showcase"><div className="button-stack"><span className="technical-small">BUTTONS</span><div className="button-row"><MechanicalButton variant="primary">Engage</MechanicalButton><MechanicalButton variant="secondary">Secondary</MechanicalButton><MechanicalButton variant="technical">Technical</MechanicalButton><MechanicalButton variant="ghost">Ghost</MechanicalButton><MechanicalButton variant="danger">Abort</MechanicalButton></div></div>
        <MechanicalCard number="04" category="ROBOTICS / SYSTEMS" status="ACTIVE" title="Engineering module" description="A universal card grammar for future events, logs and content modules." action={<MechanicalButton variant="technical">ACCESS MODULE →</MechanicalButton>} /></div>
      </section>

      <section id="controls" className="lab-section"><SectionMarker number="05" label="CONTROLS" /><TechnicalDivider label="CONTROL / INSTRUMENT" />
        <div className="controls-grid"><MechanicalSwitch on label="SYSTEM ONLINE" /><MechanicalSwitch on={false} label="STANDBY" /><MechanicalDial value={72} label="TORQUE" /><MechanicalGauge value={84} label="PRESSURE" /></div>
      </section>

      <section id="grid" className="lab-section"><SectionMarker number="06" label="ENGINEERING GRID" /><TechnicalDivider label="GRID / BLUEPRINT" />
        <div className="grid-showcase"><EngineeringGrid className="grid-demo"><div className="grid-demo__content"><span className="technical-small">ENGINEERING SPACE</span><strong className="heading-md">CAD / 01</strong></div></EngineeringGrid><BlueprintGrid className="grid-demo"><div className="grid-demo__content"><span className="technical-small">BLUEPRINT SPACE</span><strong className="heading-md">AXIS / 02</strong></div></BlueprintGrid></div>
      </section>

      <section id="status" className="lab-section"><SectionMarker number="07" label="STATUS" /><TechnicalDivider label="SYSTEM / STATES" />
        <div className="status-grid">{(['online','active','warning','offline','processing','idle'] as const).map(state => <MechanicalPanel key={state} variant="technical"><SystemIndicator state={state} label={state} /><span className="body-small">Accessible state language with light + text, not color alone.</span></MechanicalPanel>)}</div>
      </section>

      <section id="motion" className="lab-section"><SectionMarker number="08" label="MOTION" /><TechnicalDivider label="MOTION / RESTRAINT" />
        <MechanicalPanel variant="highlighted"><div className="motion-demo"><div><TechnicalLabel indicator>PRECISION EASE</TechnicalLabel><h2 className="heading-lg">Motion with mass.</h2><p className="body-small">Micro-interactions are deliberately short and tactile. Cinematic motion remains reserved for future mechanical scenes.</p></div><div className="motion-line" aria-hidden="true"><span /></div></div></MechanicalPanel>
      </section>

      <section id="interaction" className="lab-section"><SectionMarker number="09" label="GLOBAL INTERACTION LAB" /><TechnicalDivider label="SYSTEM / CONTROL LAYER" />
        <div className="interaction-lab-grid">
          <MechanicalPanel variant="technical"><TechnicalLabel indicator prefix="CURSOR">PRECISION TARGET</TechnicalLabel><h3 className="heading-md">Move across controls.</h3><p className="body-small">On fine-pointer desktop devices, the engineering cursor tracks pointer intent and supports optional magnetism. It is never required to understand the interface.</p><div className="button-row"><MechanicalButton variant="primary">Engage control</MechanicalButton><Link className="mechanical-button mechanical-button--secondary label" to="/events">Access module</Link></div></MechanicalPanel>
          <MechanicalPanel variant="technical"><TechnicalLabel prefix="TRANSITION">ROUTE CHOREOGRAPHY</TechnicalLabel><h3 className="heading-md">Navigate the system.</h3><p className="body-small">Use the links below to exercise the restrained page-transition layer while preserving browser back/forward behavior.</p><div className="button-row"><Link className="mechanical-button mechanical-button--ghost label" to="/team">TEAM / 03</Link><Link className="mechanical-button mechanical-button--ghost label" to="/blogs">LOGS / 04</Link></div></MechanicalPanel>
          <MechanicalPanel variant="highlighted"><TechnicalLabel indicator prefix="INITIALIZATION">SYSTEM CHECK</TechnicalLabel><h3 className="heading-md">Reset first-visit state.</h3><p className="body-small">The initialization overlay is intentionally brief. Reset the session flag and refresh this route to preview it again.</p><MechanicalButton variant="technical" onClick={() => { sessionStorage.removeItem('mechesa-init-v03'); window.location.reload() }}>RE-RUN CHECK</MechanicalButton></MechanicalPanel>
          <MechanicalPanel variant="blueprint"><TechnicalLabel prefix="AMBIENT">ENVIRONMENT</TechnicalLabel><h3 className="heading-md">Pointer-reactive light.</h3><p className="body-small">The background layer combines graphite, soft illumination and a restrained engineering grid. Decorative layers remain pointer-events-none.</p><SystemIndicator state="online" label="AMBIENT READY" /></MechanicalPanel>
        </div>
      </section>
    </main>

    <footer className="design-lab__footer"><span className="technical-small">MECHESA // ENGINEERED MOTION</span><span className="technical-small">GLOBAL INTERACTION BUILD / 03</span></footer>
  </div>
}
