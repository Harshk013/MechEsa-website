import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { engineeringSystems } from '../../data/home'
import { aboutLoopStages, aboutManifesto, aboutPrinciples, type AboutPrinciple } from '../../data/about'
import { CursorTarget } from '../../components/interaction/CursorTarget'
import { EngineeringGrid } from '../../components/mechanical/EngineeringGrid'
import { MeasurementMark } from '../../components/mechanical/MeasurementMark'
import { MechanicalPanel } from '../../components/mechanical/MechanicalPanel'
import { TechnicalDivider } from '../../components/mechanical/TechnicalDivider'
import { TechnicalLabel } from '../../components/typography/TechnicalLabel'
import { SystemIndicator } from '../../components/telemetry/SystemIndicator'
import { useMotionSettings } from '../../app/providers/MotionProvider'
import './about.css'

const aboutSections = ['IDENTIFY', 'DISCOVER', 'CONNECT', 'TRANSFORM', 'OPERATE', 'CONTEXT', 'DECLARE', 'MANIFESTO', 'HANDOFF']
const systemPositions = [
  { x: 18, y: 18 }, { x: 50, y: 9 }, { x: 82, y: 18 }, { x: 15, y: 50 },
  { x: 50, y: 49 }, { x: 85, y: 50 }, { x: 28, y: 81 }, { x: 73, y: 81 },
]

export function AboutPage() {
  const pageRef = useRef<HTMLDivElement>(null)
  const [activeStage, setActiveStage] = useState(0)
  const [selectedPrinciple, setSelectedPrinciple] = useState(aboutPrinciples[0]?.id ?? '')
  const [selectedSystem, setSelectedSystem] = useState(engineeringSystems[0]?.id ?? '')
  const [selectedLoop, setSelectedLoop] = useState(aboutLoopStages[0]?.id ?? '')
  const { reducedMotion } = useMotionSettings()
  const selectedPrincipleData = aboutPrinciples.find((item) => item.id === selectedPrinciple) ?? aboutPrinciples[0]
  const selectedSystemData = engineeringSystems.find((item) => item.id === selectedSystem) ?? engineeringSystems[0]
  const selectedLoopData = aboutLoopStages.find((item) => item.id === selectedLoop) ?? aboutLoopStages[0]

  useEffect(() => {
    const page = pageRef.current
    if (!page) return
    let raf = 0
    const updateProgress = () => {
      raf = 0
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      const progress = Math.min(1, Math.max(0, window.scrollY / max))
      page.style.setProperty('--about-progress', progress.toFixed(3))
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(updateProgress) }
    updateProgress()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  useEffect(() => {
    const page = pageRef.current
    if (!page) return
    const sections = Array.from(page.querySelectorAll<HTMLElement>('[data-about-stage]'))
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
      if (!visible) return
      const index = sections.indexOf(visible.target as HTMLElement)
      if (index >= 0) setActiveStage(index)
    }, { rootMargin: '-30% 0px -45% 0px', threshold: [0.05, 0.25, 0.5, 0.75] })
    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  const activeSection = aboutSections[activeStage] ?? aboutSections[0]
  const activePrincipleIndex = Math.max(0, aboutPrinciples.findIndex((item) => item.id === selectedPrinciple))
  const activeSystemIndex = Math.max(0, engineeringSystems.findIndex((item) => item.id === selectedSystem))

  return (
    <div ref={pageRef} className="about-page" data-reduced-motion={reducedMotion} data-about-stage={activeSection} data-selected-system={selectedSystem}>
      <EngineeringGrid className="about-page__grid" size={40} opacity={0.028} />
      <div className="about-page__rail" aria-hidden="true"><span>06</span>{aboutSections.map((section, index) => <div key={section} className={activeStage === index ? 'is-active' : ''}><i /><b>{String(index + 1).padStart(2, '0')}</b></div>)}</div>

      <section className="about-hero page-container" data-about-stage="0" aria-labelledby="about-title">
        <AboutHero />
      </section>

      <main>
        <section className="about-identity page-container about-section" data-about-stage="1" aria-labelledby="identity-title">
          <TechnicalDivider label="02 / WHAT MECHESA IS" />
          <div className="identity-layout">
            <div className="identity-statement"><TechnicalLabel prefix="IDENTITY / CORE">MECHESA // ENGINEERED MOTION</TechnicalLabel><h2 id="identity-title">A SPACE FOR<br />ENGINEERING<br />IN MOTION.</h2></div>
            <MechanicalPanel variant="technical" className="identity-panel">
              <TechnicalLabel prefix="OFFICIAL CONTEXT">ASSOCIATION DESCRIPTION</TechnicalLabel>
              <p>MECHESA is the Mechanical Engineering Students Association at IIT Indore.</p>
              <p className="identity-panel__support">This page keeps the broader association description content-ready until official copy is supplied. No history, statistics, achievements or institutional claims are inferred here.</p>
              <SystemIndicator state="idle" label="OFFICIAL COPY / READY" />
            </MechanicalPanel>
          </div>
        </section>

        <section className="about-philosophy page-container about-section" data-about-stage="2" aria-labelledby="philosophy-title">
          <div className="about-section-head"><TechnicalLabel prefix="03">ENGINEERING PHILOSOPHY</TechnicalLabel><h2 id="philosophy-title">UNDERSTAND THE SYSTEM.<br />THEN MOVE IT.</h2><p>Select a principle to inspect the engineering logic behind the sequence.</p></div>
          <div className="philosophy-layout">
            <div className="philosophy-rail" role="tablist" aria-label="Engineering philosophy">
              <div className="philosophy-rail__line" aria-hidden="true"><span style={{ width: `${(activePrincipleIndex / Math.max(1, aboutPrinciples.length - 1)) * 100}%` }} /></div>
              {aboutPrinciples.map((principle) => <PrincipleNode key={principle.id} principle={principle} selected={selectedPrinciple === principle.id} reducedMotion={reducedMotion} onSelect={() => setSelectedPrinciple(principle.id)} />)}
            </div>
            <MechanicalPanel variant="highlighted" className="principle-inspector" aria-live="polite">
              <div className="principle-inspector__head"><TechnicalLabel prefix="PROCESS NODE">{selectedPrincipleData?.index ?? '00'}</TechnicalLabel><SystemIndicator state={selectedPrincipleData ? 'active' : 'idle'} label={selectedPrincipleData?.title ?? 'NO NODE'} /></div>
              <span className="technical-small">ENGINEERING PHILOSOPHY / {selectedPrincipleData?.index}</span>
              <h3>{selectedPrincipleData?.title}</h3>
              <p>{selectedPrincipleData?.description}</p>
              <TechnicalDivider label="NODE OUTPUT" />
              <div className="principle-inspector__output"><strong>{selectedPrincipleData?.title}</strong><span>→ NEXT SYSTEM</span></div>
            </MechanicalPanel>
          </div>
        </section>

        <section className="about-systems page-container about-section" data-about-stage="3" aria-labelledby="systems-title">
          <div className="about-section-head"><TechnicalLabel prefix="04">SYSTEMS WE CONNECT</TechnicalLabel><h2 id="systems-title">MECHANICAL ENGINEERING<br />IS A NETWORK.</h2><p>The map is driven directly by the existing MechESA engineering systems dataset.</p></div>
          <div className="systems-layout">
            <div className="systems-map" aria-label="Interconnected engineering systems">
              <div className="systems-map__frame" aria-hidden="true"><span className="corner tl" /><span className="corner tr" /><span className="corner bl" /><span className="corner br" /><i className="systems-map__axis systems-map__axis--x" /><i className="systems-map__axis systems-map__axis--y" /><b>ENGINEERING / NETWORK</b></div>
              <svg className="systems-map__connections" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                {systemPositions.map((position, index) => index > 0 && <line key={`${index}-a`} x1={systemPositions[index - 1].x} y1={systemPositions[index - 1].y} x2={position.x} y2={position.y} />)}
                <line x1="18" y1="18" x2="50" y2="49" /><line x1="82" y1="18" x2="50" y2="49" /><line x1="15" y1="50" x2="50" y2="49" /><line x1="85" y1="50" x2="50" y2="49" /><line x1="28" y1="81" x2="50" y2="49" /><line x1="73" y1="81" x2="50" y2="49" />
              </svg>
              {engineeringSystems.map((system, index) => <SystemNode key={system.id} system={system} index={index} position={systemPositions[index]} selected={selectedSystem === system.id} onSelect={() => setSelectedSystem(system.id)} />)}
            </div>
            <MechanicalPanel variant="technical" className="system-inspector" aria-live="polite">
              <div className="system-inspector__top"><TechnicalLabel prefix="SYSTEM NODE">{selectedSystemData?.shortLabel ?? 'N/A'}</TechnicalLabel><SystemIndicator state={selectedSystemData?.status === 'ACTIVE' ? 'active' : 'idle'} label={selectedSystemData?.status ?? 'STANDBY'} /></div>
              <span className="technical-small">ENGINEERING SYSTEM / {String(activeSystemIndex + 1).padStart(2, '0')}</span>
              <h3>{selectedSystemData?.title}</h3>
              <p>{selectedSystemData?.description}</p>
              <TechnicalDivider label="SYSTEM READOUT" />
              <div className="system-inspector__readout"><span>METRIC<strong>{selectedSystemData?.metric}</strong></span><span>STATUS<strong>{selectedSystemData?.status}</strong></span></div>
            </MechanicalPanel>
          </div>
        </section>

        <section className="about-transformation page-container about-section" data-about-stage="4" aria-labelledby="transformation-title">
          <div className="about-section-head"><TechnicalLabel prefix="05">THEORY → BUILD → MOTION</TechnicalLabel><h2 id="transformation-title">FROM MODEL<br />TO MOTION.</h2><p>A deliberately abstract transformation track: no fabricated project is attached to the sequence.</p></div>
          <TheoryToMotion reducedMotion={reducedMotion} />
        </section>

        <section className="about-loop page-container about-section" data-about-stage="5" aria-labelledby="loop-title">
          <div className="about-section-head"><TechnicalLabel prefix="06">HOW THE ASSOCIATION OPERATES</TechnicalLabel><h2 id="loop-title">THE ENGINEERING LOOP.</h2><p>A conceptual operating model for learning, making, documenting and returning to the problem.</p></div>
          <div className="loop-layout">
            <div className="loop-ring" aria-hidden="true"><div className="loop-ring__core"><span>MECHESA</span><strong>LOOP</strong></div>{aboutLoopStages.map((stage, index) => <button key={stage.id} type="button" className={`loop-ring__node loop-ring__node--${index + 1}${selectedLoop === stage.id ? ' is-active' : ''}`} style={{ '--loop-angle': `${index * 72 - 90}deg` } as CSSProperties} onClick={() => setSelectedLoop(stage.id)} aria-label={`Inspect ${stage.title}`} aria-pressed={selectedLoop === stage.id}><span>{stage.index}</span><b>{stage.title}</b></button>)}</div>
            <MechanicalPanel variant="blueprint" className="loop-inspector" aria-live="polite"><TechnicalLabel prefix="LOOP STAGE">{selectedLoopData?.index}</TechnicalLabel><h3>{selectedLoopData?.title}</h3><p>{selectedLoopData?.description}</p><TechnicalDivider label="OUTPUT" /><strong>{selectedLoopData?.output}</strong><span className="technical-small">CONCEPTUAL OPERATING MODEL / NOT AN ACTIVITY CLAIM</span></MechanicalPanel>
          </div>
        </section>

        <section className="about-institution page-container about-section" data-about-stage="6" aria-labelledby="institution-title">
          <TechnicalDivider label="07 / IIT INDORE CONNECTION" />
          <div className="institution-plate"><div className="institution-plate__id"><TechnicalLabel prefix="INSTITUTION">ENGINEERING / IIT INDORE</TechnicalLabel><strong>MECHESA</strong><span>MECHANICAL ENGINEERING</span><span>IIT INDORE</span></div><div className="institution-plate__copy"><SystemIndicator state="online" label="ACTIVE SYSTEM" /><h2 id="institution-title">BUILT IN AN<br />ENGINEERING ENVIRONMENT.</h2><p>MECHESA / Mechanical Engineering Students Association / IIT Indore. The surrounding institutional copy is intentionally concise and ready for official expansion.</p></div><div className="institution-plate__datum" aria-hidden="true"><span>01</span><i /><span>02</span><i /><span>03</span><i /><span>04</span></div></div>
        </section>

        <section className="about-manifesto page-container about-section" data-about-stage="7" aria-labelledby="manifesto-title">
          <div className="manifesto-head"><TechnicalLabel prefix="08">ENGINEERING MANIFESTO</TechnicalLabel><span className="technical-small">SPECIFICATION / ACTIVE</span></div>
          <h2 id="manifesto-title" className="sr-only">Engineering Manifesto</h2>
          <div className="manifesto-list">{aboutManifesto.map((line, index) => <div key={line.id} className="manifesto-line" style={{ '--manifesto-index': index } as CSSProperties}><span>{line.index}</span><strong>{line.text}</strong><em>{line.annotation}</em></div>)}</div>
        </section>

        <section className="about-handoff page-container about-section" data-about-stage="8" aria-labelledby="handoff-title">
          <TechnicalDivider label="SYSTEM HANDOFF / 07" />
          <div className="about-handoff__inner"><div><TechnicalLabel prefix="NEXT SYSTEM">COMMUNICATION</TechnicalLabel><h2 id="handoff-title">READY TO<br />CONNECT?</h2><p>The next system is the communication terminal.</p></div><CursorTarget intent="view" label="OPEN"><Link className="mechanical-button mechanical-button--primary label" to="/contact">OPEN CONTACT TERMINAL ↗</Link></CursorTarget></div>
        </section>
      </main>
    </div>
  )
}

function AboutHero() {
  return <div className="about-hero__inner"><div className="about-hero__top"><TechnicalLabel prefix="SYSTEM / 06">ENGINEERING IDENTITY</TechnicalLabel><SystemIndicator state="online" label="MODE / IDENTITY" /></div><div className="about-hero__layout"><div className="about-hero__copy"><span className="technical-small">MECHESA // ENGINEERED MOTION</span><h1 id="about-title">WHY<br />MECHESA?</h1><p>Understand the system. Design it. Build it. Test it. Keep moving from theory into physical systems.</p></div><IdentityInstrument /></div><div className="about-hero__foot"><MeasurementMark value="DATUM A / 000" /><span className="technical-small">ORIGIN / SYSTEM IDENTIFICATION</span><MeasurementMark value="SECTION / A—A" orientation="vertical" /></div></div>
}

function IdentityInstrument() {
  return <div className="identity-instrument" aria-hidden="true"><div className="identity-instrument__frame"><span className="reg tl" /><span className="reg tr" /><span className="reg bl" /><span className="reg br" /><span className="identity-instrument__label">SYSTEM / 06</span><div className="identity-instrument__geometry"><i className="circle c1" /><i className="circle c2" /><i className="shaft" /><i className="datum d1" /><i className="datum d2" /><b>MECHESA</b></div><span className="identity-instrument__stamp">ENGINEERING<br />IDENTITY</span><span className="identity-instrument__index">REGISTER / 001</span></div></div>
}

function PrincipleNode({ principle, selected, reducedMotion, onSelect }: { principle: AboutPrinciple; selected: boolean; reducedMotion: boolean; onSelect: () => void }) {
  return <CursorTarget intent="view" label="VIEW" className="principle-node-wrap"><button type="button" className={`principle-node${selected ? ' is-selected' : ''}${reducedMotion ? ' is-static' : ''}`} role="tab" aria-selected={selected} aria-pressed={selected} onClick={onSelect}><span>{principle.index}</span><i aria-hidden="true" /><strong>{principle.title}</strong></button></CursorTarget>
}

function SystemNode({ system, index, position, selected, onSelect }: { system: typeof engineeringSystems[number]; index: number; position: { x: number; y: number }; selected: boolean; onSelect: () => void }) {
  return <CursorTarget intent="view" label="VIEW" className="system-node-wrap" style={{ left: `${position.x}%`, top: `${position.y}%` } as CSSProperties}><button type="button" className={`system-node${selected ? ' is-selected' : ''}`} onClick={onSelect} aria-pressed={selected} aria-label={`Inspect ${system.title}`}><span>{String(index + 1).padStart(2, '0')}</span><i aria-hidden="true" /><strong>{system.shortLabel}</strong></button></CursorTarget>
}

function TheoryToMotion({ reducedMotion }: { reducedMotion: boolean }) {
  const stages = [
    { id: 'theory', title: 'THEORY', detail: 'EQUATION / ANALYSIS', symbol: '∫' },
    { id: 'design', title: 'DESIGN', detail: 'GEOMETRY / DEFINE', symbol: '◇' },
    { id: 'fabrication', title: 'FABRICATION', detail: 'PART / FORM', symbol: '▣' },
    { id: 'test', title: 'TEST', detail: 'MEASURE / VERIFY', symbol: '∿' },
    { id: 'motion', title: 'MOTION', detail: 'SYSTEM / OUTPUT', symbol: '↗' },
  ]
  return <div className={`transformation-track${reducedMotion ? ' is-static' : ''}`}><div className="transformation-track__datum" aria-hidden="true"><span /><b /></div>{stages.map((stage, index) => <div className="transformation-stage" key={stage.id}><div className="transformation-stage__plate"><span>{String(index + 1).padStart(2, '0')}</span><strong>{stage.symbol}</strong><i /><small>{stage.detail}</small></div><h3>{stage.title}</h3>{index < stages.length - 1 && <div className="transformation-stage__connector" aria-hidden="true" />}</div>)}<div className="transformation-track__foot"><span>MODEL</span><span>GEOMETRY</span><span>PHYSICAL FORM</span><span>MEASUREMENT</span><span>MOTION</span></div></div>
}
