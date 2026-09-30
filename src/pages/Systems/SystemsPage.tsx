import { useState } from 'react'
import { EngineeringGrid } from '../../components/mechanical/EngineeringGrid'
import { TechnicalLabel } from '../../components/typography/TechnicalLabel'
import { SystemIndicator } from '../../components/telemetry/SystemIndicator'
import { TechnicalDivider } from '../../components/mechanical/TechnicalDivider'
import { EngineeringLab } from '../../components/home/EngineeringLab/EngineeringLab'
import { RepresentationToggle } from '../../components/system/RepresentationToggle/RepresentationToggle'
import { engineeringSystems } from '../../data/home'
import './systems.css'

export function SystemsPage() {
  const [selectedSystem, setSelectedSystem] = useState(engineeringSystems[0].id)
  const selected = engineeringSystems.find(s => s.id === selectedSystem) ?? engineeringSystems[0]
  const activeCount = engineeringSystems.filter(s => s.status === 'ACTIVE').length

  return (
    <>
      <title>Engineering Systems Lab — MechESA | IIT Indore</title>
      <meta name="description" content="Interact with live engineering instruments across thermodynamics, fluid mechanics, manufacturing, robotics and more. MechESA's interactive systems lab at IIT Indore." />

      <div className="systems-page">
        {/* Ambient background */}
        <div className="systems-page__bg" aria-hidden="true" />
        <EngineeringGrid className="systems-page__grid" size={48} opacity={0.04} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />

        {/* ── Hero Header ─────────────────────────────────── */}
        <section className="systems-hero" aria-labelledby="systems-hero-title">
          <div className="page-container">
            <div className="systems-hero__inner">
              <div>
                <div className="systems-hero__eyebrow">
                  <span className="systems-hero__number">03</span>
                  <TechnicalLabel>ENGINEERING SYSTEMS / LAB</TechnicalLabel>
                  <SystemIndicator state="online" label="LIVE" />
                </div>
                <h1 id="systems-hero-title" className="systems-hero__title">
                  INTERACT<br /><em>WITH THE</em><br />SYSTEM.
                </h1>
                <p className="systems-hero__desc body-small">
                  Select an engineering domain and operate the interactive studies. Adjust a parameter and see the mechanical relationship update immediately.
                </p>
              </div>
              <div className="systems-hero__meta">
                <div className="systems-hero__count">{String(engineeringSystems.length).padStart(2, '0')}</div>
                <TechnicalLabel prefix="SYSTEMS">LOADED</TechnicalLabel>
                <SystemIndicator state="active" label={`${activeCount} ACTIVE`} />
              </div>
            </div>
          </div>
        </section>

        {/* ── System Selector Strip ────────────────────────── */}
        <nav className="systems-selector" aria-label="Engineering system selector">
          <div className="systems-selector__inner page-container" role="tablist" aria-label="Engineering system selector" style={{ padding: '0 clamp(1rem, 3vw, 2.5rem)' }}>
            {engineeringSystems.map((system, i) => (
              <button
                key={system.id}
                type="button"
                className={`systems-selector__tab${selectedSystem === system.id ? ' is-active' : ''}`}
                data-status={system.status}
                onClick={() => setSelectedSystem(system.id)}
                role="tab"
                aria-selected={selectedSystem === system.id}
                aria-controls="systems-instrument"
                id={`systems-tab-${system.id}`}
              >
                <span className="systems-selector__index">{String(i + 1).padStart(2, '0')}</span>
                <span className="systems-selector__label">{system.shortLabel}</span>
                <span className="systems-selector__dot" aria-hidden="true" />
              </button>
            ))}
          </div>
        </nav>

        {/* ── Lab / Instrument Area ────────────────────────── */}
        <section className="systems-lab page-container" id="systems-instrument" role="tabpanel" aria-labelledby={`systems-panel-${selected.id}`}>
          <div className="systems-lab__header">
            <div className="systems-lab__title-block">
              <TechnicalLabel prefix={`SYSTEM / ${String(engineeringSystems.findIndex(s => s.id === selectedSystem) + 1).padStart(2, '0')}`}>
                {selected.shortLabel}
              </TechnicalLabel>
              <h2 id={`systems-panel-${selected.id}`} className="systems-lab__system-name">{selected.title.toUpperCase()}</h2>
              <p className="systems-lab__system-desc body-small">{selected.description}</p>
            </div>
            <div className="systems-lab__badges">
              <SystemIndicator
                state={selected.status === 'ACTIVE' ? 'active' : 'idle'}
                label={selected.status}
              />
              <span className="technical-small">{selected.metric}</span>
              <RepresentationToggle />
            </div>
          </div>

          <TechnicalDivider label="INTERACTIVE STUDY / ACTIVE" />

          <div className="systems-lab__instrument-wrap" style={{ position: 'relative' }}>
            <div className="systems-lab__instrument-inner">
              <EngineeringLab selectedSystem={selected} />
            </div>
          </div>

          {/* Info rail */}
          <div className="systems-inforail">
            <div className="systems-inforail__stat">
              <span className="systems-inforail__stat-value">{engineeringSystems.length}</span>
              <span className="systems-inforail__stat-label">TOTAL SYSTEMS</span>
            </div>
            <div className="systems-inforail__stat">
              <span className="systems-inforail__stat-value">{activeCount}</span>
              <span className="systems-inforail__stat-label">ACTIVE MODULES</span>
            </div>
            <div className="systems-inforail__stat">
              <span className="systems-inforail__stat-value">{engineeringSystems.length - activeCount}</span>
              <span className="systems-inforail__stat-label">STANDBY</span>
            </div>
            <SystemIndicator state="online" label="MECHESA ENGINEERING LAB / ONLINE" />
          </div>
        </section>
      </div>
    </>
  )
}
