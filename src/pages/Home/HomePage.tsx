import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
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
import { EngineeringSystemNode } from '../../components/home/EngineeringSystemNode'
import { TeamAssemblyNode } from '../../components/home/TeamAssemblyNode'
import { TelemetryReadout } from '../../components/home/TelemetryReadout'
import { engineeringSystems, homepageBlogs, homepageEvents, homepageTeam } from '../../data/home'
import './home.css'

const reveal = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.2 }, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } }

export function HomePage() {
  const [selectedSystem, setSelectedSystem] = useState('design')
  const [selectedMember, setSelectedMember] = useState(homepageTeam[0].id)
  const selected = useMemo(() => engineeringSystems.find(item => item.id === selectedSystem) ?? engineeringSystems[0], [selectedSystem])
  const selectedMemberData = homepageTeam.find(member => member.id === selectedMember) ?? homepageTeam[0]

  return <div className="home-page">
    <section className="home-section home-hero" id="home-core" data-section="01">
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
          <CursorTarget label="ENGAGE" intent="button"><MechanicalButton variant="primary" onClick={() => document.getElementById('engineering')?.scrollIntoView({ behavior: 'smooth' })}>EXPLORE MECHESA</MechanicalButton></CursorTarget>
          <CursorTarget label="VIEW" intent="view"><Link className="mechanical-button mechanical-button--ghost label" to="/events">VIEW EVENTS</Link></CursorTarget>
        </div>
        <div className="home-hero__scroll"><span>SCROLL TO ENGAGE</span><i aria-hidden="true" /></div>
      </div>
    </section>

    <motion.section {...reveal} className="home-section identity-section page-container" id="engineering" data-section="02">
      <SectionHeader number="02" eyebrow="ENGINEERING IDENTITY" title="ENGINEERING IS MOTION." description="A visual foundation for MechESA that treats engineering as a system of decisions, forces, materials and movement." />
      <div className="identity-layout">
        <MechanicalPanel variant="technical" className="identity-statement">
          <span className="identity-statement__number">01</span>
          <h3>BUILD<br />WITH<br /><em>INTENT.</em></h3>
          <p className="body-small">Temporary copy — replace with approved MechESA institutional messaging when available.</p>
          <TechnicalDivider label="SYSTEM PRINCIPLE" />
          <span className="technical-small">PRECISION / FORCE / MOTION / INTELLIGENCE</span>
        </MechanicalPanel>
        <div className="identity-graphic" aria-hidden="true">
          <div className="identity-graphic__shaft" />
          <div className="identity-graphic__bearing identity-graphic__bearing--one" />
          <div className="identity-graphic__bearing identity-graphic__bearing--two" />
          <div className="identity-graphic__line identity-graphic__line--one" />
          <div className="identity-graphic__line identity-graphic__line--two" />
          <span className="technical-small">AXIS / 01</span>
        </div>
      </div>
    </motion.section>

    <motion.section {...reveal} className="home-section systems-section" id="systems" data-section="03">
      <div className="page-container">
        <SectionHeader number="03" eyebrow="ENGINEERING SYSTEMS" title="MANY SYSTEMS. ONE CORE." description="The visual system is deliberately broad: mechanical engineering is represented through connected domains rather than a single gear-shaped metaphor." />
        <div className="systems-layout">
          <div className="systems-network" aria-label="Engineering systems">
            <div className="systems-network__core"><span>MECHESA</span><small>CORE / 01</small></div>
            <div className="systems-network__lines" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /></div>
            {engineeringSystems.map((system, index) => <div key={system.id} className={`systems-network__node systems-network__node--${index + 1}`}><EngineeringSystemNode system={system} selected={selectedSystem === system.id} onSelect={() => setSelectedSystem(system.id)} /></div>)}
          </div>
          <MechanicalPanel variant="highlighted" className="systems-inspector">
            <div className="systems-inspector__head"><TechnicalLabel prefix="INSPECT">{selected.shortLabel}</TechnicalLabel><SystemIndicator state={selected.status === 'ACTIVE' ? 'active' : 'idle'} label={selected.status} /></div>
            <span className="systems-inspector__code technical-small">SYSTEM / {selected.id.toUpperCase()}</span>
            <h3>{selected.title}</h3>
            <p className="body-small">{selected.description}</p>
            <TechnicalDivider label="CURRENT SIGNAL" />
            <strong className="systems-inspector__metric">{selected.metric}</strong>
            <div className="systems-inspector__bars" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
          </MechanicalPanel>
        </div>
      </div>
    </motion.section>

    <motion.section {...reveal} className="home-section events-section page-container" id="events" data-section="04">
      <SectionHeader number="04" eyebrow="EVENTS / PRODUCTION LINE" title="LOAD THE NEXT MODULE." description="A homepage preview for future workshops, competitions and engineering activities. The complete event archive lives on its own route." />
      <div className="production-line" aria-label="Event preview">
        <div className="production-line__track" aria-hidden="true"><i /><i /><i /><i /><i /></div>
        <div className="production-line__modules">{homepageEvents.map((event, index) => <CursorTarget key={event.id} label="VIEW" intent="view" className="production-line__module">
          <MechanicalCard number={`0${index + 1}`} category={event.category} status={event.status.toUpperCase()} title={event.title} description={event.description} action={<span className="technical-small">{event.date}</span>} />
        </CursorTarget>)}</div>
      </div>
      <div className="section-cta"><Link to="/events" className="mechanical-button mechanical-button--secondary label" data-cursor="view" data-cursor-label="OPEN">VIEW ALL EVENTS ↗</Link></div>
    </motion.section>

    <motion.section {...reveal} className="home-section team-section" id="team" data-section="05">
      <div className="page-container">
        <SectionHeader number="05" eyebrow="THE PEOPLE BEHIND THE MACHINE" title="ASSEMBLE THE TEAM." description="A connected preview for the people who make the association move. Approved team data can replace these placeholders later." />
        <div className="team-assembly">
          <div className="team-assembly__diagram" aria-hidden="true"><span /><span /><span /><span /><span /><span /></div>
          <div className="team-assembly__nodes">{homepageTeam.map(member => <TeamAssemblyNode key={member.id} member={member} selected={selectedMember === member.id} onSelect={() => setSelectedMember(member.id)} />)}</div>
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
    </motion.section>

    <motion.section {...reveal} className="home-section logs-section page-container" id="logs" data-section="06">
      <SectionHeader number="06" eyebrow="ENGINEERING LOGS" title="DOCUMENT THE WORK." description="A technical editorial layer for future MechESA writing, project notes and engineering stories." />
      <div className="logs-layout">
        <CursorTarget label="OPEN" intent="link" className="logs-feature"><MechanicalPanel variant="elevated">
          <div className="logs-feature__top"><span className="technical-small">LOG / 001</span><span className="technical-small">FEATURED / PLACEHOLDER</span></div>
          <div className="logs-feature__document"><span className="logs-feature__stamp">ENGINEERING<br />LOGBOOK</span><div className="logs-feature__sketch" aria-hidden="true"><i /><i /><i /><i /></div></div>
          <h3>{homepageBlogs[0].title}</h3><p className="body-small">{homepageBlogs[0].excerpt}</p>
          <div className="logs-feature__meta"><span className="technical-small">{homepageBlogs[0].category}</span><span className="technical-small">{homepageBlogs[0].date}</span><span className="technical-small">{homepageBlogs[0].readTime}</span></div>
        </MechanicalPanel></CursorTarget>
        <div className="logs-list">{homepageBlogs.slice(1).map((blog, index) => <CursorTarget key={blog.id} label="OPEN" intent="link" className="logs-list__item"><Link to="/blogs"><span className="technical-small">LOG / 00{index + 2}</span><strong>{blog.title}</strong><span className="body-small">{blog.excerpt}</span><span className="technical-small">OPEN LOG ↗</span></Link></CursorTarget>)}</div>
      </div>
      <div className="section-cta"><Link to="/blogs" className="mechanical-button mechanical-button--secondary label" data-cursor="open" data-cursor-label="OPEN">READ ALL LOGS ↗</Link></div>
    </motion.section>

    <motion.section {...reveal} className="home-section motion-section" id="motion" data-section="07">
      <div className="motion-section__viewport page-container">
        <EngineeringGrid size={48} opacity={0.025} className="motion-section__grid" />
        <div className="motion-section__header"><SectionHeader number="07" eyebrow="ENGINEERING IN MOTION" title="FORCE BECOMES DATA." description="A stable viewport reserved for the future racing and engineering-motion simulation." /></div>
        <div className="motion-viewport" aria-label="Future engineering motion simulation placeholder">
          <div className="motion-viewport__vector motion-viewport__vector--one" /><div className="motion-viewport__vector motion-viewport__vector--two" /><div className="motion-viewport__vector motion-viewport__vector--three" />
          <div className="motion-viewport__machine"><div /><span>SIMULATION SLOT</span></div>
          <div className="telemetry-grid"><TelemetryReadout label="RPM" /><TelemetryReadout label="SPEED" unit="KM/H" /><TelemetryReadout label="TEMP" unit="°C" /><TelemetryReadout label="TORQUE" unit="N·M" /></div>
          <div className="motion-viewport__status"><SystemIndicator state="idle" label="SIMULATION STANDBY" /><span className="technical-small">PLACEHOLDER / NO LIVE MEASUREMENTS</span></div>
        </div>
      </div>
    </motion.section>

    <motion.section {...reveal} className="home-section join-section page-container" id="join" data-section="08">
      <div className="join-stage">
        <div className="join-stage__ring" aria-hidden="true"><i /><i /><i /><i /><span>MECHESA / 08</span></div>
        <div className="join-stage__content"><TechnicalLabel prefix="08">SYSTEM CONVERGENCE</TechnicalLabel><h2>BECOME PART<br /><em>OF THE MACHINE.</em></h2><p className="body-small">Temporary copy — connect this CTA to the approved MechESA joining or contact flow when available.</p><div className="join-stage__actions"><Link to="/contact" className="mechanical-button mechanical-button--primary label" data-cursor="engage" data-cursor-label="ENGAGE">JOIN MECHESA</Link><Link to="/about" className="mechanical-button mechanical-button--ghost label" data-cursor="view" data-cursor-label="VIEW">EXPLORE THE SYSTEM</Link></div></div>
      </div>
    </motion.section>

    <section className="home-handoff" data-section="09"><div className="page-container"><TechnicalDivider label="SYSTEM HANDOFF / 09" /><div className="home-handoff__row"><span className="technical-small">MECHESA / IIT INDORE</span><span className="technical-small">FOOTER MODULE PENDING / SYSTEM READY</span></div></div></section>
  </div>
}
