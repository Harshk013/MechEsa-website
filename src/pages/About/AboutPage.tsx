import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { engineeringSystems } from '../../data/home'
import { aboutLoopStages, aboutManifesto, aboutPrinciples, type AboutPrinciple } from '../../data/about'
import { CursorTarget } from '../../components/interaction/CursorTarget'
import { EngineeringGrid } from '../../components/mechanical/EngineeringGrid'
import { MeasurementMark } from '../../components/mechanical/MeasurementMark'
import { MechanicalPanel } from '../../components/mechanical/MechanicalPanel'
import { TechnicalDivider } from '../../components/mechanical/TechnicalDivider'
import { useMotionSettings } from '../../app/providers/MotionProvider'
import './about.css'

const aboutSections = ['IDENTIFY', 'DISCOVER', 'CONNECT', 'TRANSFORM', 'OPERATE', 'CONTEXT', 'DECLARE', 'MANIFESTO', 'HANDOFF']
// MECHESA PATCH UI-03 - canonical system color map
const systemColorTokenById: Record<string, string> = {
  design: 'var(--sys-design)',
  materials: 'var(--sys-materials)',
  manufacturing: 'var(--sys-manufacturing)',
  mechatronics: 'var(--sys-mechatronics)',
  robotics: 'var(--sys-robotics)',
  automotive: 'var(--sys-automotive)',
  thermodynamics: 'var(--sys-thermodynamics)',
  fluid: 'var(--sys-fluid)',
}

const getSystemColorToken = (id: string) =>
  systemColorTokenById[id] ?? 'var(--color-border)'
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
            <div className="identity-statement"><span className="page-eyebrow">MECHESA // ENGINEERED MOTION</span><h2 id="identity-title" className="page-heading">A SPACE FOR<br />ENGINEERING<br />IN MOTION.</h2></div>
            <MechanicalPanel variant="technical" className="identity-panel">
              <span className="page-eyebrow" style={{marginBottom: 0}}>ASSOCIATION DESCRIPTION</span>
              <p>MECHESA is the Mechanical Engineering Students Association at IIT Indore.</p>
              <p className="identity-panel__support">A student community dedicated to design, manufacturing, and exploring applied mechanical systems.</p>
            </MechanicalPanel>
          </div>
        </section>

        <section className="about-philosophy page-container about-section" data-about-stage="2" aria-labelledby="philosophy-title">
          <div className="about-section-head"><span className="page-eyebrow">03 // ENGINEERING PHILOSOPHY</span><h2 id="philosophy-title" className="page-heading">UNDERSTAND THE SYSTEM.<br />THEN MOVE IT.</h2><p className="page-description">Select a principle to inspect our engineering process.</p></div>
          <div className="philosophy-layout">
            <div className="philosophy-rail" role="tablist" aria-label="Engineering philosophy">
              <div className="philosophy-rail__line" aria-hidden="true"><span style={{ width: `${(activePrincipleIndex / Math.max(1, aboutPrinciples.length - 1)) * 100}%` }} /></div>
              {aboutPrinciples.map((principle) => <PrincipleNode key={principle.id} principle={principle} selected={selectedPrinciple === principle.id} reducedMotion={reducedMotion} onSelect={() => setSelectedPrinciple(principle.id)} />)}
            </div>
            <MechanicalPanel variant="highlighted" className="principle-inspector" aria-live="polite">
              <span className="page-eyebrow">STEP / {selectedPrincipleData?.index ?? '00'}</span>
              <h3>{selectedPrincipleData?.title}</h3>
              <p>{selectedPrincipleData?.description}</p>
            </MechanicalPanel>
          </div>
        </section>

        <section className="about-systems page-container about-section" data-about-stage="3" aria-labelledby="systems-title">
          <div className="about-section-head"><span className="page-eyebrow">04 // SYSTEMS WE EXPLORE</span><h2 id="systems-title" className="page-heading">MECHANICAL ENGINEERING<br />IS A NETWORK.</h2><p className="page-description">These are the core engineering areas MechESA focuses on.</p></div>
          <div className="systems-layout">
            <div className="systems-map" aria-label="Interconnected engineering systems">
              <div className="systems-map__frame" aria-hidden="true"><span className="corner tl" /><span className="corner tr" /><span className="corner bl" /><span className="corner br" /><i className="systems-map__axis systems-map__axis--x" /><i className="systems-map__axis systems-map__axis--y" /><b>ENGINEERING / NETWORK</b></div>
              <svg className="systems-map__connections" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                {systemPositions.map((position, index) => index > 0 && <line key={`${index}-a`} x1={systemPositions[index - 1].x} y1={systemPositions[index - 1].y} x2={position.x} y2={position.y} />)}
                <line x1="18" y1="18" x2="50" y2="49" /><line x1="82" y1="18" x2="50" y2="49" /><line x1="15" y1="50" x2="50" y2="49" /><line x1="85" y1="50" x2="50" y2="49" /><line x1="28" y1="81" x2="50" y2="49" /><line x1="73" y1="81" x2="50" y2="49" />
                {selectedSystemData && <line key={selectedSystemData.id} className="systems-map__selected-connection" data-system-id={selectedSystemData.id} x1="50" y1="49" x2={systemPositions[activeSystemIndex].x} y2={systemPositions[activeSystemIndex].y} style={{ '--system-color': getSystemColorToken(selectedSystemData.id) } as CSSProperties} />}
              </svg>
              {engineeringSystems.map((system, index) => <SystemNode key={system.id} system={system} index={index} position={systemPositions[index]} selected={selectedSystem === system.id} onSelect={() => setSelectedSystem(system.id)} />)}
            </div>
            <MechanicalPanel variant="technical" className="system-inspector" aria-live="polite" style={{ '--system-color': getSystemColorToken(selectedSystemData?.id ?? '') } as CSSProperties}>
              <span className="page-eyebrow">ENGINEERING SYSTEM / {String(activeSystemIndex + 1).padStart(2, '0')}</span>
              <h3>{selectedSystemData?.title}</h3>
              <p>{selectedSystemData?.description}</p>
            </MechanicalPanel>
          </div>
        </section>

        <section className="about-transformation page-container about-section" data-about-stage="4" aria-labelledby="transformation-title">
          <div className="about-section-head"><span className="page-eyebrow">05 // THEORY → BUILD → MOTION</span><h2 id="transformation-title" className="page-heading">FROM MODEL<br />TO MOTION.</h2><p className="page-description">Our approach to taking engineering from paper to the physical world.</p></div>
          <TheoryToMotion reducedMotion={reducedMotion} />
        </section>

        <section className="about-loop page-container about-section" data-about-stage="5" aria-labelledby="loop-title">
          <div className="about-section-head"><span className="page-eyebrow">06 // HOW WE OPERATE</span><h2 id="loop-title" className="page-heading">THE ENGINEERING LOOP.</h2><p className="page-description">A cycle for learning, making, documenting, and returning to the problem.</p></div>
          <div className="loop-layout">
            <div className="loop-ring" aria-hidden="true"><div className="loop-ring__core"><span>MECHESA</span><strong>LOOP</strong></div>{aboutLoopStages.map((stage, index) => <button key={stage.id} type="button" className={`loop-ring__node loop-ring__node--${index + 1}${selectedLoop === stage.id ? ' is-active' : ''}`} style={{ '--loop-angle': `${index * 72 - 90}deg` } as CSSProperties} onClick={() => setSelectedLoop(stage.id)} aria-label={`Inspect ${stage.title}`} aria-pressed={selectedLoop === stage.id}><span>{stage.index}</span><b>{stage.title}</b></button>)}</div>
            <MechanicalPanel variant="blueprint" className="loop-inspector" aria-live="polite"><span className="page-eyebrow">STAGE {selectedLoopData?.index}</span><h3>{selectedLoopData?.title}</h3><p>{selectedLoopData?.description}</p></MechanicalPanel>
          </div>
        </section>

        <section className="about-institution page-container about-section" data-about-stage="6" aria-labelledby="institution-title">
          <TechnicalDivider label="07 / IIT INDORE" />
          <div className="institution-plate"><div className="institution-plate__id"><span className="page-eyebrow">INSTITUTION</span><strong>MECHESA</strong><span>MECHANICAL ENGINEERING</span><span>IIT INDORE</span></div><div className="institution-plate__copy"><h2 id="institution-title" className="page-heading">BUILT IN AN<br />ENGINEERING ENVIRONMENT.</h2><p className="page-description">MECHESA / Mechanical Engineering Students Association / IIT Indore.</p></div><div className="institution-plate__datum" aria-hidden="true"><span>01</span><i /><span>02</span><i /><span>03</span><i /><span>04</span></div></div>
        </section>

        <section className="about-manifesto page-container about-section" data-about-stage="7" aria-labelledby="manifesto-title">
          <div className="manifesto-head"><span className="page-eyebrow">08 // ENGINEERING MANIFESTO</span></div>
          <h2 id="manifesto-title" className="sr-only">Engineering Manifesto</h2>
          <div className="manifesto-list">{aboutManifesto.map((line, index) => <div key={line.id} className="manifesto-line" style={{ '--manifesto-index': index } as CSSProperties}><span>{line.index}</span><strong>{line.text}</strong><em>{line.annotation}</em></div>)}</div>
        </section>

        <section className="about-handoff page-container about-section" data-about-stage="8" aria-labelledby="handoff-title">
          <TechnicalDivider label="NEXT" />
          <div className="about-handoff__inner"><div><span className="page-eyebrow">COMMUNICATION</span><h2 id="handoff-title" className="page-heading">READY TO<br />CONNECT?</h2><p className="page-description">Get in touch with the association.</p></div><CursorTarget intent="view" label="OPEN"><Link className="mechanical-button mechanical-button--primary label" to="/contact">OPEN CONTACT FORM ↗</Link></CursorTarget></div>
        </section>
      </main>
    </div>
  )
}

function AboutHero() {
  return <div className="about-hero__inner"><div className="about-hero__top"><span className="page-eyebrow">ENGINEERING IDENTITY</span></div><div className="about-hero__layout"><div className="about-hero__copy"><span className="technical-small">MECHESA // ENGINEERED MOTION</span><h1 id="about-title" className="page-heading">WHY<br />MECHESA?</h1><p className="page-description">Understand the system. Design it. Build it. Test it. Keep moving from theory into physical systems.</p></div><IdentityInstrument /></div><div className="about-hero__foot"><MeasurementMark value="DATUM A / 000" /><span className="technical-small">ORIGIN / SYSTEM IDENTIFICATION</span><MeasurementMark value="SECTION / A—A" orientation="vertical" /></div></div>
}

function IdentityInstrument() {
  return <div className="identity-instrument" aria-hidden="true"><div className="identity-instrument__frame"><span className="reg tl" /><span className="reg tr" /><span className="reg bl" /><span className="reg br" /><span className="identity-instrument__label">SYSTEM / 06</span><div className="identity-instrument__geometry"><i className="circle c1" /><i className="circle c2" /><i className="shaft" /><i className="datum d1" /><i className="datum d2" /><b>MECHESA</b></div><span className="identity-instrument__stamp">ENGINEERING<br />IDENTITY</span><span className="identity-instrument__index">REGISTER / 001</span></div></div>
}

function PrincipleNode({ principle, selected, reducedMotion, onSelect }: { principle: AboutPrinciple; selected: boolean; reducedMotion: boolean; onSelect: () => void }) {
  return <CursorTarget intent="view" label="VIEW" className="principle-node-wrap"><button type="button" className={`principle-node${selected ? ' is-selected' : ''}${reducedMotion ? ' is-static' : ''}`} role="tab" aria-selected={selected} aria-pressed={selected} onClick={onSelect}><span>{principle.index}</span><i aria-hidden="true" /><strong>{principle.title}</strong></button></CursorTarget>
}

function SystemNode({ system, index, position, selected, onSelect }: { system: typeof engineeringSystems[number]; index: number; position: { x: number; y: number }; selected: boolean; onSelect: () => void }) {
  return <CursorTarget intent="view" label="VIEW" className="system-node-wrap" style={{ left: `${position.x}%`, top: `${position.y}%` } as CSSProperties}><button type="button" className={`system-node${selected ? ' is-selected' : ''}`} data-system-id={system.id} style={{ '--system-color': getSystemColorToken(system.id) } as CSSProperties} onClick={onSelect} aria-pressed={selected} aria-label={`Inspect ${system.title}`}><span>{String(index + 1).padStart(2, '0')}</span><i aria-hidden="true" /><strong>{system.shortLabel}</strong></button></CursorTarget>
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
