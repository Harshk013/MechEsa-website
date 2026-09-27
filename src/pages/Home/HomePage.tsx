
import { Link } from 'react-router-dom'
import { MechanicalButton } from '../../components/mechanical/MechanicalButton'
import { MechanicalCard } from '../../components/mechanical/MechanicalCard'
import { MechanicalPanel } from '../../components/mechanical/MechanicalPanel'
import { TechnicalLabel } from '../../components/typography/TechnicalLabel'
import { SystemIndicator } from '../../components/telemetry/SystemIndicator'
import { EngineeringGrid } from '../../components/mechanical/EngineeringGrid'
import { CursorTarget } from '../../components/interaction/CursorTarget'
import { SectionHeader } from '../../components/home/SectionHeader'
import { MechanicalCoreStage } from '../../components/home/MechanicalCoreStage'
import { HomeScrollController } from '../../components/home/scroll/HomeScrollController'
import { useHomeScrollProgress } from '../../components/home/scroll/useHomeScrollProgress'
import { engineeringSystems, homepageEvents, homepageTeam } from '../../data/home'
import './home.css'

export function HomePage() {
  return <HomeScrollController><HomeContent /></HomeScrollController>
}

function HomeContent() {
  const { snapshot, scrollToSection } = useHomeScrollProgress()
  return <div className="home-page" data-active-section={snapshot.activeSection} data-machine-state={snapshot.machineState}>
    <section className="home-section home-hero" id="home-core" data-section="01" data-transition="mechanical-lock" data-motion="hero">
      <EngineeringGrid className="home-hero__grid" size={28} opacity={0.05} />
      <div className="home-hero__atmosphere" aria-hidden="true" />
      <div className="home-hero__content page-container">
        <div className="home-hero__topline">
          <TechnicalLabel prefix="00">IIT INDORE</TechnicalLabel>
          <SystemIndicator state="online" label="STUDENT ASSOCIATION" />
        </div>
        <div className="home-hero__machine">
          <MechanicalCoreStage />
          <div className="home-hero__title">
            <span className="page-eyebrow">MECHANICAL ENGINEERING STUDENTS ASSOCIATION</span>
            <h1><span>MECH</span><span>ESA</span></h1>
            <p className="page-description" style={{ marginTop: '1rem', color: 'var(--color-text)', maxWidth: '520px', marginInline: 'auto' }}>
              The official student association for Mechanical Engineering at IIT Indore.
            </p>
          </div>
        </div>
        <div className="home-hero__actions">
          <CursorTarget label="ENGAGE" intent="button"><MechanicalButton variant="primary" onClick={() => scrollToSection('about')}>EXPLORE MECHESA</MechanicalButton></CursorTarget>
          <CursorTarget label="VIEW" intent="view"><Link className="mechanical-button mechanical-button--ghost label" to="/events">VIEW EVENTS</Link></CursorTarget>
        </div>
        <div className="home-hero__scroll"><span>SCROLL TO ENGAGE</span><i aria-hidden="true" /></div>
      </div>
    </section>

    <section className="home-section identity-section page-container" id="about" data-section="02" data-transition="mechanical-lock" data-motion="identity">
      <SectionHeader number="02" eyebrow="ABOUT US" title="WHAT IS MECHESA?" description="MechESA is the Mechanical Engineering Students Association at IIT Indore. We provide a platform for students to explore, build, and connect." />
      <div className="mechesa-about-grid">
        <MechanicalCard category="CORE" title="EVENTS" description="Activities and events organized by MechESA." status="ACTIVE" action={<span className="technical-small">EXPLORE</span>} />
        <MechanicalCard category="CORE" title="LEARNING" description="Workshops, sessions or technical activities." status="ACTIVE" action={<span className="technical-small">EXPLORE</span>} />
        <MechanicalCard category="CORE" title="PROJECTS" description="Hands-on mechanical engineering work." status="ACTIVE" action={<span className="technical-small">EXPLORE</span>} />
        <MechanicalCard category="CORE" title="COMMUNITY" description="Students working and participating together." status="ACTIVE" action={<span className="technical-small">EXPLORE</span>} />
      </div>
    </section>

    <section className="home-section systems-section" id="systems" data-section="03" data-transition="signal-propagation" data-motion="systems">
      <div className="page-container">
        <SectionHeader number="03" eyebrow="ENGINEERING SYSTEMS" title="ENGINEERING SYSTEMS." description="Mechanical engineering spans multiple areas. Here is a preview of the domains we explore." />
        <div className="systems-preview-grid">
          {engineeringSystems.map((s, i) => (
            <CursorTarget key={s.id} label="VIEW" intent="view" className="system-preview-card">
              <MechanicalCard category={`SYSTEM / 0${i + 1}`} title={s.title} description={s.description} status={s.status} action={<span className="technical-small" style={{color: `var(--sys-${s.id})`}}>EXPLORE ↗</span>} />
            </CursorTarget>
          ))}
        </div>
        <div className="section-cta"><Link to="/systems" className="mechanical-button mechanical-button--primary label">OPEN SYSTEMS LAB ↗</Link></div>
      </div>
    </section>

    <section className="home-section events-section page-container" id="events" data-section="04" data-transition="production-line" data-motion="production">
      <SectionHeader number="04" eyebrow="UPCOMING EVENTS" title="WHAT'S NEXT." description="Workshops, competitions, and engineering activities hosted by MechESA." />
      <div className="mechesa-events-preview">
        {homepageEvents.map((event, index) => (
          <CursorTarget key={event.id} label="VIEW" intent="view" className={`event-preview-card ${index === 0 ? 'event-preview-card--featured' : ''}`}>
            <MechanicalCard 
              category={`${event.category} / ${event.date}`} 
              status={event.status.toUpperCase()} 
              title={event.title} 
              description={event.description} 
              action={<span className="technical-small">VIEW EVENT →</span>} 
            />
          </CursorTarget>
        ))}
      </div>
      <div className="section-cta"><Link to="/events" className="mechanical-button mechanical-button--secondary label" data-cursor="view" data-cursor-label="OPEN">VIEW ALL EVENTS ↗</Link></div>
    </section>

    <section className="home-section team-section" id="team" data-section="05" data-transition="assembly" data-motion="assembly">
      <div className="page-container">
        <SectionHeader number="05" eyebrow="MEET THE TEAM" title="THE ASSOCIATION." description="The students and faculty who make MechESA operate." />
        <div className="mechesa-team-grid">
          {homepageTeam.slice(0, 4).map(member => (
            <MechanicalPanel key={member.id} variant="technical" className="team-preview-panel">
              <div className="team-preview-panel__name">{member.name}</div>
              <div className="team-preview-panel__role technical-small">{member.role}</div>
            </MechanicalPanel>
          ))}
        </div>
        <div className="section-cta"><Link to="/team" className="mechanical-button mechanical-button--secondary label" data-cursor="view" data-cursor-label="OPEN">MEET THE FULL TEAM ↗</Link></div>
      </div>
    </section>

    <section className="home-section how-we-work-section page-container" id="how-we-work" data-section="06" data-transition="document-reveal" data-motion="document">
      <SectionHeader number="06" eyebrow="OUR APPROACH" title="HOW WE WORK." description="MechESA operates through a cycle of continuous learning and building." />
      <div className="how-we-work-grid">
        <MechanicalPanel variant="elevated">
          <TechnicalLabel prefix="01">LEARN</TechnicalLabel>
          <p className="body-small" style={{marginTop: '12px'}}>Take part in sessions, workshops and activities.</p>
        </MechanicalPanel>
        <MechanicalPanel variant="elevated">
          <TechnicalLabel prefix="02">BUILD</TechnicalLabel>
          <p className="body-small" style={{marginTop: '12px'}}>Work on projects, challenges and hands-on activities.</p>
        </MechanicalPanel>
        <MechanicalPanel variant="elevated">
          <TechnicalLabel prefix="03">SHARE</TechnicalLabel>
          <p className="body-small" style={{marginTop: '12px'}}>Learn with peers and share what you build.</p>
        </MechanicalPanel>
      </div>
    </section>

    <section className="home-section final-cta-section page-container" id="join" data-section="07" data-transition="mechanical-lock" data-motion="handoff">
      <div className="final-cta-content" style={{textAlign: 'center', padding: '120px 0'}}>
        <TechnicalLabel prefix="07">GET INVOLVED</TechnicalLabel>
        <h2 style={{margin: '24px 0', fontSize: 'var(--text-h2)'}}>BE PART OF MECHESA.</h2>
        <p className="body-small" style={{maxWidth: '600px', margin: '0 auto 40px', color: 'var(--color-text-muted)'}}>
          Join our events, participate in workshops, and build the future of mechanical engineering with us.
        </p>
        <div className="final-cta-actions" style={{display: 'flex', gap: '20px', justifyContent: 'center'}}>
          <CursorTarget label="VIEW" intent="view"><Link className="mechanical-button mechanical-button--primary label" to="/events">VIEW EVENTS</Link></CursorTarget>
          <CursorTarget label="CONTACT" intent="button"><Link className="mechanical-button mechanical-button--ghost label" to="/contact">GET IN TOUCH</Link></CursorTarget>
        </div>
      </div>
    </section>

  </div>
}
