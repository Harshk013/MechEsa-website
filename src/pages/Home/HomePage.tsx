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
import { HeroMechanicalEnvironment } from '../../components/home/HeroMechanicalEnvironment'
import { HomeScrollController } from '../../components/home/scroll/HomeScrollController'
import { useHomeScrollProgress } from '../../components/home/scroll/useHomeScrollProgress'
import { homepageEvents, homepageBlogs } from '../../data/home'
import './home.css'

export function HomePage() {
  return (
    <HomeScrollController>
      <HomeContent />
    </HomeScrollController>
  )
}

function HomeContent() {
  const { snapshot, scrollToSection } = useHomeScrollProgress()

  return (
    <div className="home-page" data-active-section={snapshot.activeSection} data-machine-state={snapshot.machineState}>
      {/* ── 01 — LANDING HERO ── */}
      <section className="home-section home-hero" id="home-core" data-section="01" data-transition="mechanical-lock" data-motion="hero">
        <EngineeringGrid className="home-hero__grid" size={28} opacity={0.035} />
        <div className="home-hero__atmosphere" aria-hidden="true" />

        {/* Subtle Animated Mechanical Environment Behind Hero */}
        <HeroMechanicalEnvironment />

        {/* Ambient Engineering Side Watermarks (Desktop Only, Low-Contrast Environmental Atmosphere) */}
        <div className="home-hero__watermark home-hero__watermark--left" aria-hidden="true">
          <span className="watermark-num">01</span>
          <span className="watermark-title">MECHANICAL SYSTEM</span>
          <span className="watermark-divider" />
          <span className="watermark-sub">KINEMATICS</span>
          <span className="watermark-spec">REF: α-PLANE · ISO-286</span>
        </div>

        <div className="home-hero__watermark home-hero__watermark--right" aria-hidden="true">
          <span className="watermark-num">SYS / 01</span>
          <span className="watermark-title">MECHESA CORE</span>
          <span className="watermark-divider" />
          <span className="watermark-sub">1200 RPM NOMINAL</span>
          <span className="watermark-spec">FREQ 50 Hz · RATIO 1:2.4</span>
        </div>

        <div className="home-hero__content page-container">
          <div className="home-hero__topline">
            <TechnicalLabel prefix="00">IIT INDORE</TechnicalLabel>
            <SystemIndicator state="online" label="STUDENT ASSOCIATION" />
          </div>

          <div className="home-hero__centerpiece">
            <div className="home-hero__machine hero-machine-frame">
              {/* Precision Machine Corner Brackets */}
              <div className="frame-bracket frame-bracket--tl" aria-hidden="true" />
              <div className="frame-bracket frame-bracket--tr" aria-hidden="true" />
              <div className="frame-bracket frame-bracket--bl" aria-hidden="true" />
              <div className="frame-bracket frame-bracket--br" aria-hidden="true" />

              {/* Machine Bezel Top Indicator Bar */}
              <div className="hero-frame-bezel hero-frame-bezel--top" aria-hidden="true">
                <span className="hero-frame-bezel__id">MOD // 01 · CORE MECHANICAL PLATFORM</span>
                <span className="hero-frame-bezel__status">
                  <i className="hero-frame-bezel__led" />
                  ACTIVE // 1200 RPM
                </span>
              </div>

              <MechanicalCoreStage />

              <div className="home-hero__title">
                <span className="page-eyebrow">MECHANICAL ENGINEERING STUDENTS ASSOCIATION</span>
                <h1><span>MECH</span><span>ESA</span></h1>
                <p className="page-description">
                  The official student association for Mechanical Engineering at IIT Indore.
                </p>
              </div>

              {/* Machine Bezel Bottom Precision Datum */}
              <div className="hero-frame-bezel hero-frame-bezel--bottom" aria-hidden="true">
                <span className="hero-frame-bezel__datum">DATUM REF: α-PLANE</span>
                <span className="hero-frame-bezel__datum">TOLERANCE ±0.005</span>
              </div>
            </div>

            <div className="home-hero__actions">
              <CursorTarget label="ENGAGE" intent="button">
                <MechanicalButton variant="primary" onClick={() => scrollToSection('about')}>
                  <span>EXPLORE MECHESA</span>
                  <span className="btn-arrow" aria-hidden="true">→</span>
                </MechanicalButton>
              </CursorTarget>
              <CursorTarget label="VIEW" intent="view">
                <Link className="mechanical-button mechanical-button--ghost label" to="/events">
                  <span>VIEW EVENTS</span>
                  <span className="btn-arrow" aria-hidden="true">→</span>
                </Link>
              </CursorTarget>
            </div>
          </div>

          <div className="home-hero__scroll">
            <span>SCROLL TO ENGAGE</span>
            <i aria-hidden="true" />
          </div>
        </div>
      </section>

      {/* ── Deliberate Section Transition Datum ── */}
      <div className="home-section-transition-bar" aria-hidden="true">
        <span className="transition-bar__line" />
        <span className="transition-bar__marker">DATUM 01 // 02 · CORE TO MISSION</span>
        <span className="transition-bar__line" />
      </div>

      {/* ── 02 — ABOUT MECHESA ── */}
      <section className="home-section identity-section page-container" id="about" data-section="02" data-transition="mechanical-lock" data-motion="identity">
        <SectionHeader 
          number="02" 
          eyebrow="ABOUT US" 
          title="WHAT IS MECHESA?" 
          description="MechESA is the Mechanical Engineering Students Association at IIT Indore. We provide a platform for students to explore, build, and connect across core and multidisciplinary engineering." 
        />
        <div className="mechesa-about-grid">
          <MechanicalCard 
            category="CORE / 01" 
            title="EVENTS & CONCLAVES" 
            description="Technical symposiums, annual mechanical conclaves, industrial visits, and guest lectures from leading researchers." 
            status="ACTIVE" 
            action={<span className="technical-small">EXPLORE →</span>} 
          />
          <MechanicalCard 
            category="CORE / 02" 
            title="WORKSHOPS & LABS" 
            description="Hands-on sessions in CAD/CAM, CFD, robotics kinematic control, automotive dynamics, and FEA structural simulation." 
            status="ACTIVE" 
            action={<span className="technical-small">EXPLORE →</span>} 
          />
          <MechanicalCard 
            category="CORE / 03" 
            title="STUDENT PROJECTS" 
            description="Multidisciplinary student teams designing, manufacturing, and testing functional mechanical systems from concept to reality." 
            status="ACTIVE" 
            action={<span className="technical-small">EXPLORE →</span>} 
          />
          <MechanicalCard 
            category="CORE / 04" 
            title="COMMUNITY & MENTORSHIP" 
            description="Peer-to-peer technical mentorship, alumni networks, and industry career guidance for aspiring engineers." 
            status="ACTIVE" 
            action={<span className="technical-small">EXPLORE →</span>} 
          />
        </div>
      </section>

      {/* ── 03 — UPCOMING EVENTS ── */}
      <section className="home-section events-section page-container" id="events" data-section="03" data-transition="production-line" data-motion="production">
        <SectionHeader 
          number="03" 
          eyebrow="UPCOMING EVENTS" 
          title="WHAT'S NEXT." 
          description="Workshops, competitions, and engineering activities hosted by MechESA." 
        />
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
        <div className="section-cta">
          <Link to="/events" className="mechanical-button mechanical-button--secondary label" data-cursor="view" data-cursor-label="OPEN">
            VIEW ALL EVENTS ↗
          </Link>
        </div>
      </section>

      {/* ── 04 — FEATURED BLOG / ENGINEERING LOG ── */}
      <section className="home-section logs-section page-container" id="blogs" data-section="04" data-transition="document-reveal" data-motion="document">
        <SectionHeader 
          number="04" 
          eyebrow="ENGINEERING LOG" 
          title="FROM THE ENGINEERING LOG." 
          description="Technical documentation, prototyping notes, and engineering insights from MechESA members." 
        />
        <div className="home-logs-grid">
          {homepageBlogs[0] && (
            <CursorTarget label="READ" intent="view" className="home-log-card home-log-card--featured">
              <MechanicalPanel variant="elevated" className="home-log-panel home-log-panel--featured">
                <div className="home-log-header">
                  <span className="home-log-stamp">DOC // 01</span>
                  <span className="home-log-badge">{homepageBlogs[0].category}</span>
                  <span className="home-log-time">{homepageBlogs[0].readTime}</span>
                </div>
                <h3 className="home-log-title">{homepageBlogs[0].title}</h3>
                <p className="home-log-excerpt">{homepageBlogs[0].excerpt}</p>
                <div className="home-log-tags">
                  {homepageBlogs[0].tags?.map(tag => (
                    <span key={tag} className="home-log-tag">#{tag}</span>
                  ))}
                </div>
                <div className="home-log-footer">
                  <Link to="/blogs" className="mechanical-button mechanical-button--primary label">
                    OPEN LOG ENTRY →
                  </Link>
                </div>
              </MechanicalPanel>
            </CursorTarget>
          )}

          <div className="home-logs-secondary">
            {homepageBlogs.slice(1, 3).map((blog, idx) => (
              <CursorTarget key={blog.id} label="READ" intent="view" className="home-log-card home-log-card--secondary">
                <MechanicalPanel variant="elevated" className="home-log-panel">
                  <div className="home-log-header">
                    <span className="home-log-stamp">DOC // 0{idx + 2}</span>
                    <span className="home-log-badge">{blog.category}</span>
                    <span className="home-log-time">{blog.readTime}</span>
                  </div>
                  <h4 className="home-log-sub-title">{blog.title}</h4>
                  <p className="home-log-sub-excerpt">{blog.excerpt}</p>
                  <div className="home-log-sub-link">
                    <Link to="/blogs" className="technical-small">
                      READ DOCUMENT →
                    </Link>
                  </div>
                </MechanicalPanel>
              </CursorTarget>
            ))}
          </div>
        </div>
        <div className="section-cta">
          <Link to="/blogs" className="mechanical-button mechanical-button--secondary label" data-cursor="view" data-cursor-label="OPEN">
            READ ENGINEERING LOGS ↗
          </Link>
        </div>
      </section>

      {/* ── 05 — CONTACT / GET INVOLVED TERMINAL ── */}
      <section className="home-section contact-terminal-section page-container" id="contact" data-section="05" data-transition="mechanical-lock" data-motion="handoff">
        <div className="mechesa-contact-terminal">
          <div className="terminal-header">
            <div className="terminal-header__status">
              <span className="terminal-led" aria-hidden="true" />
              <span>TERMINAL // COMM-GATEWAY</span>
            </div>
            <div className="terminal-header__tag">
              <span>IIT INDORE // MECHESA</span>
            </div>
          </div>

          <div className="terminal-body">
            <TechnicalLabel prefix="05">GET INVOLVED</TechnicalLabel>
            <h2 className="terminal-title">CONNECT WITH MECHESA.</h2>
            <p className="terminal-desc">
              Have a project, research collaboration, workshop proposal, or question? Connect with the Mechanical Engineering Students Association at IIT Indore.
            </p>

            <div className="terminal-specs-bar" aria-hidden="true">
              <div className="terminal-spec">
                <span className="terminal-spec__label">LOCATION:</span>
                <span className="terminal-spec__val">SIMROL CAMPUS, IIT INDORE</span>
              </div>
              <div className="terminal-spec">
                <span className="terminal-spec__label">DISCIPLINE:</span>
                <span className="terminal-spec__val">MECHANICAL ENGINEERING</span>
              </div>
              <div className="terminal-spec">
                <span className="terminal-spec__label">COLLABORATION:</span>
                <span className="terminal-spec__val">OPEN // ACTIVE GATEWAY</span>
              </div>
            </div>

            <div className="terminal-actions">
              <CursorTarget label="CONTACT" intent="button">
                <Link className="mechanical-button mechanical-button--primary label" to="/contact">
                  GET IN TOUCH ↗
                </Link>
              </CursorTarget>
              <CursorTarget label="VIEW" intent="view">
                <Link className="mechanical-button mechanical-button--ghost label" to="/events">
                  EXPLORE EVENTS ↗
                </Link>
              </CursorTarget>
            </div>
          </div>

          <div className="terminal-bracket terminal-bracket--tl" aria-hidden="true" />
          <div className="terminal-bracket terminal-bracket--tr" aria-hidden="true" />
          <div className="terminal-bracket terminal-bracket--bl" aria-hidden="true" />
          <div className="terminal-bracket terminal-bracket--br" aria-hidden="true" />
        </div>
      </section>
    </div>
  )
}
