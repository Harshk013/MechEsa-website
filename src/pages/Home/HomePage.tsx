import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MechanicalButton } from '../../components/mechanical/MechanicalButton'
import { MechanicalCard } from '../../components/mechanical/MechanicalCard'
import { MechanicalPanel } from '../../components/mechanical/MechanicalPanel'
import { TechnicalLabel } from '../../components/typography/TechnicalLabel'
import { TechnicalDivider } from '../../components/mechanical/TechnicalDivider'
import { SystemIndicator } from '../../components/telemetry/SystemIndicator'
import { EngineeringGrid } from '../../components/mechanical/EngineeringGrid'
import { CursorTarget } from '../../components/interaction/CursorTarget'
import { SectionHeader } from '../../components/home/SectionHeader'
import { MechanicalCoreStage } from '../../components/home/MechanicalCoreStage'
import { HomeScrollController } from '../../components/home/scroll/HomeScrollController'
import { useHomeScrollProgress } from '../../components/home/scroll/useHomeScrollProgress'
import { TeamAssemblyNode } from '../../components/home/TeamAssemblyNode'
import { EngineeringLab } from '../../components/home/EngineeringLab/EngineeringLab'
import { EngineeringMotion } from '../../components/home/EngineeringMotion'
import { SystemHandoff } from '../../components/home/SystemHandoff'
import { engineeringSystems, homepageBlogs, homepageEvents, homepageTeam } from '../../data/home'
import './home.css'


export function HomePage() {
  const [selectedSystem, setSelectedSystem] = useState('design')
  const [selectedMember, setSelectedMember] = useState(homepageTeam[0].id)
  const selectedMemberData = homepageTeam.find(member => member.id === selectedMember) ?? homepageTeam[0]

  return <HomeScrollController><HomeContent selectedSystem={selectedSystem} setSelectedSystem={setSelectedSystem} selectedMember={selectedMember} setSelectedMember={setSelectedMember} selectedMemberData={selectedMemberData} /></HomeScrollController>
}

function HomeContent({ selectedSystem, setSelectedSystem, selectedMember, setSelectedMember, selectedMemberData }: { selectedSystem: string; setSelectedSystem: (value: string) => void; selectedMember: string; setSelectedMember: (value: string) => void; selectedMemberData: typeof homepageTeam[number] }) {
  const { snapshot, scrollToSection } = useHomeScrollProgress()
  return <div className="home-page" data-active-section={snapshot.activeSection} data-machine-state={snapshot.machineState}>
    <section className="home-section home-hero" id="home-core" data-section="01" data-transition="mechanical-lock" data-motion="hero">
      <EngineeringGrid className="home-hero__grid" size={28} opacity={0.05} />
      <div className="home-hero__atmosphere" aria-hidden="true" />
      <div className="home-hero__content page-container">
        <div className="home-hero__topline">
          <TechnicalLabel prefix="00">INITIALIZATION HANDOFF</TechnicalLabel>
          <SystemIndicator state="online" label="MECHESA CORE" />
        </div>
        <div className="home-hero__machine">
          <MechanicalCoreStage />
          <div className="home-hero__title">
            <span className="technical-small">IIT INDORE / MECHANICAL ENGINEERING</span>
            <h1><span>MECH</span><span>ESA</span></h1>
            <p>MECHANICAL ENGINEERING<br />STUDENTS ASSOCIATION</p>
          </div>
          <div className="home-hero__annotation home-hero__annotation--a">CORE / 01<br /><span>MECHANICAL SYSTEM</span></div>
          <div className="home-hero__annotation home-hero__annotation--b">IIT INDORE<br /><span>SYSTEM / ORIGIN</span></div>
        </div>
        <div className="home-hero__actions">
          <CursorTarget label="ENGAGE" intent="button"><MechanicalButton variant="primary" onClick={() => scrollToSection('engineering')}>EXPLORE MECHESA</MechanicalButton></CursorTarget>
          <CursorTarget label="VIEW" intent="view"><Link className="mechanical-button mechanical-button--ghost label" to="/events">VIEW EVENTS</Link></CursorTarget>
        </div>
        <div className="home-hero__scroll"><span>SCROLL TO ENGAGE</span><i aria-hidden="true" /></div>
      </div>
    </section>

    <section className="home-section identity-section page-container" id="engineering" data-section="02" data-transition="mechanical-lock" data-motion="identity">
      <SectionHeader number="02" eyebrow="ENGINEERING IDENTITY" title="ENGINEERING IS MOTION." description="A visual foundation for MechESA that treats engineering as a system of decisions, forces, materials and movement." />
      <div className="identity-layout">
        <MechanicalPanel variant="technical" className="identity-statement">
          <span className="identity-statement__number">01</span>
          <h3>BUILD<br />WITH<br /><em>INTENT.</em></h3>
          <p className="body-small">CONTENT-READY COPY / APPROVED INSTITUTIONAL MESSAGING PENDING</p>
          <TechnicalDivider label="SYSTEM PRINCIPLE" />
          <span className="technical-small">PRECISION / FORCE / MOTION / INTELLIGENCE</span>
        </MechanicalPanel>
        <div className="identity-graphic identity-graphic--mechanical-lock" aria-hidden="true">
          <div className="identity-graphic__shaft" />
          <div className="identity-graphic__bearing identity-graphic__bearing--one" />
          <div className="identity-graphic__bearing identity-graphic__bearing--two" />
          <div className="identity-graphic__line identity-graphic__line--one" />
          <div className="identity-graphic__line identity-graphic__line--two" />
          <span className="technical-small">AXIS / 01</span>
        </div>
      </div>
    </section>

    <section className="home-section systems-section" id="systems" data-section="03" data-transition="signal-propagation" data-motion="systems">
      <div className="page-container">
        <SectionHeader number="03" eyebrow="ENGINEERING SYSTEMS / LAB" title="INTERACT WITH THE SYSTEM." description="Select an engineering domain. Thermodynamics is the first interactive instrument; the remaining systems retain their existing informational states." />
        <EngineeringLab systems={engineeringSystems} selectedSystem={selectedSystem} onSelectSystem={setSelectedSystem} />
      </div>
    </section>

    <section className="home-section events-section page-container" id="events" data-section="04" data-transition="production-line" data-motion="production">
      <SectionHeader number="04" eyebrow="EVENTS / PRODUCTION LINE" title="LOAD THE NEXT MODULE." description="A homepage preview for future workshops, competitions and engineering activities. The complete event archive lives on its own route." />
      <div className="production-line" aria-label="Event preview">
        <div className="production-line__track" aria-hidden="true" data-production-track><i /><i /><i /><i /><i /></div>
        <div className="production-line__modules">{homepageEvents.map((event, index) => <CursorTarget key={event.id} label="VIEW" intent="view" className="production-line__module">
          <MechanicalCard number={`0${index + 1}`} category={event.category} status={event.status.toUpperCase()} title={event.title} description={event.description} action={<span className="technical-small">{event.date}</span>} />
        </CursorTarget>)}</div>
      </div>
      <div className="section-cta"><Link to="/events" className="mechanical-button mechanical-button--secondary label" data-cursor="view" data-cursor-label="OPEN">VIEW ALL EVENTS ↗</Link></div>
    </section>

    <section className="home-section team-section" id="team" data-section="05" data-transition="assembly" data-motion="assembly">
      <div className="page-container">
        <SectionHeader number="05" eyebrow="THE PEOPLE BEHIND THE MACHINE" title="ASSEMBLE THE TEAM." description="A connected preview for the people who make the association move. Approved team data can populate this assembly when supplied." />
        <div className="team-assembly">
          <div className="team-assembly__diagram" aria-hidden="true"><span /><span /><span /><span /><span /><span /></div>
          <div className="team-assembly__nodes" data-assembly-nodes>{homepageTeam.map(member => <TeamAssemblyNode key={member.id} member={member} selected={selectedMember === member.id} onSelect={() => setSelectedMember(member.id)} />)}</div>
          <MechanicalPanel variant="technical" className="team-inspector">
            <TechnicalLabel prefix="SELECTED COMPONENT">TEAM</TechnicalLabel>
            <div className="team-inspector__name">{selectedMemberData.name}</div>
            <div className="team-inspector__role technical-small">{selectedMemberData.role}</div>
            <TechnicalDivider label="ASSEMBLY POSITION" />
            <span className="technical-small">{selectedMemberData.year ?? 'YEAR / TBD'} / PROFILE DATA PENDING</span>
          </MechanicalPanel>
        </div>
        <div className="section-cta"><Link to="/team" className="mechanical-button mechanical-button--secondary label" data-cursor="view" data-cursor-label="OPEN">MEET THE TEAM ↗</Link></div>
      </div>
    </section>

    <section className="home-section logs-section page-container" id="logs" data-section="06" data-transition="document-reveal" data-motion="document">
      <SectionHeader number="06" eyebrow="ENGINEERING LOGS" title="DOCUMENT THE WORK." description="A technical editorial layer for future MechESA writing, project notes and engineering stories." />
      <div className="logs-layout">
        <CursorTarget label="OPEN" intent="link" className="logs-feature"><MechanicalPanel variant="elevated">
          <div className="logs-feature__top"><span className="technical-small">LOG / 001</span><span className="technical-small">FEATURED / CONTENT READY</span></div>
          <div className="logs-feature__document" data-document-reveal><span className="logs-feature__stamp">ENGINEERING<br />LOGBOOK</span><div className="logs-feature__sketch" aria-hidden="true"><i /><i /><i /><i /></div></div>
          <h3>{homepageBlogs[0].title}</h3><p className="body-small">{homepageBlogs[0].excerpt}</p>
          <div className="logs-feature__meta"><span className="technical-small">{homepageBlogs[0].category}</span><span className="technical-small">{homepageBlogs[0].date}</span><span className="technical-small">{homepageBlogs[0].readTime}</span></div>
        </MechanicalPanel></CursorTarget>
        <div className="logs-list">{homepageBlogs.slice(1).map((blog, index) => <CursorTarget key={blog.id} label="OPEN" intent="link" className="logs-list__item"><Link to="/blogs"><span className="technical-small">LOG / 00{index + 2}</span><strong>{blog.title}</strong><span className="body-small">{blog.excerpt}</span><span className="technical-small">OPEN LOG ↗</span></Link></CursorTarget>)}</div>
      </div>
      <div className="section-cta"><Link to="/blogs" className="mechanical-button mechanical-button--secondary label" data-cursor="open" data-cursor-label="OPEN">READ ALL LOGS ↗</Link></div>
    </section>

    <EngineeringMotion />

    <SystemHandoff />

  </div>
}
