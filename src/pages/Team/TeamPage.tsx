import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import type { TeamMember } from '../../data/types'
import { homepageTeam } from '../../data/home'
import { CursorTarget } from '../../components/interaction/CursorTarget'
import { MechanicalButton } from '../../components/mechanical/MechanicalButton'
import { MechanicalPanel } from '../../components/mechanical/MechanicalPanel'
import { TechnicalDivider } from '../../components/mechanical/TechnicalDivider'
import { TechnicalLabel } from '../../components/typography/TechnicalLabel'
import { SystemIndicator } from '../../components/telemetry/SystemIndicator'
import { EngineeringGrid } from '../../components/mechanical/EngineeringGrid'
import { useMotionSettings } from '../../app/providers/MotionProvider'
import './team.css'

export function TeamPage() {
  const [selectedId, setSelectedId] = useState<string | null>(homepageTeam[0]?.id ?? null)
  const pageRef = useRef<HTMLDivElement>(null)
  const { reducedMotion } = useMotionSettings()
  const selectedMember = useMemo(
    () => homepageTeam.find((member) => member.id === selectedId),
    [selectedId],
  )

  useEffect(() => {
    const page = pageRef.current
    if (!page) return
    let raf = 0
    const update = () => {
      raf = 0
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      const progress = Math.min(1, Math.max(0, window.scrollY / max))
      page.style.setProperty('--team-progress', progress.toFixed(3))
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedId(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <div ref={pageRef} className="team-page" data-reduced-motion={reducedMotion}>
      <TeamHero />
      <AssemblyFloor members={homepageTeam} selectedId={selectedId} onSelect={setSelectedId} reducedMotion={reducedMotion} />
      <TeamDirectory members={homepageTeam} selectedId={selectedId} onSelect={setSelectedId} />
      <TeamHandoff />
    </div>
  )
}

function TeamHero() {
  return (
    <section className="team-hero" aria-labelledby="team-page-title">
      <EngineeringGrid className="team-hero__grid" size={30} opacity={0.035} />
      <div className="page-container team-hero__inner">
        <div className="team-hero__topline">
          <TechnicalLabel prefix="TEAM / 01">THE ASSEMBLY</TechnicalLabel>
          <SystemIndicator state="online" label="MODE / PEOPLE" />
        </div>
        <div className="team-hero__copy">
          <span className="technical-small">MECHESA / HUMAN SUBSYSTEM</span>
          <h1 id="team-page-title"><span>TEAM</span><em>ASSEMBLY</em></h1>
          <p>PEOPLE OPERATE THE MACHINE.</p>
        </div>
        <AssemblySchematic className="team-hero__schematic" />
        <div className="team-hero__datum" aria-hidden="true"><i /><span>DATUM / A—01</span><i /><span>AXIS / PEOPLE → SYSTEM</span></div>
      </div>
    </section>
  )
}

function AssemblyFloor({ members, selectedId, onSelect, reducedMotion }: { members: TeamMember[]; selectedId: string | null; onSelect: (id: string) => void; reducedMotion: boolean }) {
  return (
    <section className="team-assembly-floor" aria-labelledby="assembly-title">
      <div className="page-container">
        <div className="team-section-head">
          <TechnicalLabel prefix="02">ASSEMBLY FLOOR</TechnicalLabel>
          <h2 id="assembly-title">BUILD THE SYSTEM.</h2>
          <p>The current team dataset is intentionally content-ready. The assembly is ready for approved member data without changing the interaction model.</p>
        </div>

        <div className="assembly-layout">
          <div className="assembly-board" style={{ '--team-count': members.length } as CSSProperties}>
            <AssemblyFrame />
            <div className="assembly-board__core" aria-hidden="true">
              <span>MECHESA</span>
              <strong>CORE / PEOPLE</strong>
              <i />
            </div>
            <div className="assembly-board__connections" aria-hidden="true">
              {members.map((member, index) => <span key={member.id} style={{ '--member-index': index } as CSSProperties} />)}
            </div>
            <div className="assembly-board__nodes">
              {members.map((member, index) => (
                <TeamAssemblyNode
                  key={member.id}
                  member={member}
                  index={index}
                  selected={selectedId === member.id}
                  reducedMotion={reducedMotion}
                  onSelect={() => onSelect(member.id)}
                />
              ))}
            </div>
            <div className="assembly-board__markers" aria-hidden="true">
              <span>01</span><span>02</span><span>03</span><span>04</span>
            </div>
          </div>

          <TeamInspector member={members.find((member) => member.id === selectedId)} onClose={() => onSelect('')} />
        </div>
      </div>
    </section>
  )
}

function TeamAssemblyNode({ member, index, selected, reducedMotion, onSelect }: { member: TeamMember; index: number; selected: boolean; reducedMotion: boolean; onSelect: () => void }) {
  return (
    <CursorTarget intent="view" label="VIEW" className={`team-assembly-node-wrap team-assembly-node-wrap--${index + 1}`}>
      <button
        type="button"
        className={`team-assembly-node${selected ? ' is-selected' : ''}${reducedMotion ? ' is-static' : ''}`}
        aria-pressed={selected}
        aria-label={`View ${member.name}, ${member.role}`}
        onClick={onSelect}
      >
        <span className="team-assembly-node__index">0{index + 1}</span>
        <span className="team-assembly-node__bolt" aria-hidden="true" />
        <span className="team-assembly-node__body">
          <span className="technical-small">{member.year ?? 'YEAR / TBD'}</span>
          <strong>{member.name}</strong>
          <span>{member.role}</span>
        </span>
        <span className="team-assembly-node__anchor" aria-hidden="true">＋</span>
      </button>
    </CursorTarget>
  )
}

function TeamInspector({ member, onClose }: { member?: TeamMember; onClose: () => void }) {
  return (
    <MechanicalPanel variant="highlighted" className="team-page-inspector" aria-live="polite">
      <div className="team-page-inspector__head">
        <TechnicalLabel prefix="INSPECTOR">MEMBER</TechnicalLabel>
        {member && <button type="button" className="team-page-inspector__close" onClick={onClose} aria-label="Close member inspector">ESC</button>}
      </div>
      {member ? (
        <>
          <span className="technical-small">TEAM / {member.id.replace('member-', '').padStart(3, '0')}</span>
          <h3>{member.name}</h3>
          <p className="team-page-inspector__role">{member.role}</p>
          <TechnicalDivider label="ASSEMBLY DATA" />
          <div className="team-page-inspector__data">
            <span>YEAR<strong>{member.year ?? 'YEAR / TBD'}</strong></span>
            <span>STATUS<strong>CONTENT READY</strong></span>
          </div>
          {member.specialization && <><TechnicalDivider label="SPECIALIZATION" /><p className="body-small">{member.specialization}</p></>}
          <div className="team-page-inspector__note"><SystemIndicator state="idle" label="PROFILE DATA PENDING" /><span className="technical-small">Only supplied project fields are shown.</span></div>
        </>
      ) : (
        <div className="team-page-inspector__empty">
          <span className="technical-small">NO MEMBER SELECTED</span>
          <p className="body-small">Select an assembly node or directory row to inspect available member data.</p>
        </div>
      )}
    </MechanicalPanel>
  )
}

function TeamDirectory({ members, selectedId, onSelect }: { members: TeamMember[]; selectedId: string | null; onSelect: (id: string) => void }) {
  return (
    <section className="team-directory" aria-labelledby="directory-title">
      <div className="page-container">
        <div className="team-section-head team-section-head--directory">
          <TechnicalLabel prefix="03">TEAM DIRECTORY</TechnicalLabel>
          <h2 id="directory-title">INDEX THE ASSEMBLY.</h2>
          <p>Structured member records remain connected to the interactive assembly above.</p>
        </div>
        <div className="team-directory__table" role="list" aria-label="Team directory">
          <div className="team-directory__header" aria-hidden="true"><span>INDEX</span><span>MEMBER</span><span>ROLE</span><span>YEAR</span><span>STATE</span></div>
          {members.map((member, index) => (
            <CursorTarget key={member.id} intent="view" label="VIEW" className="team-directory__cursor">
              <button type="button" className={`team-directory__row${selectedId === member.id ? ' is-selected' : ''}`} role="listitem" aria-pressed={selectedId === member.id} onClick={() => onSelect(member.id)}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{member.name}</strong>
                <span>{member.role}</span>
                <span>{member.year ?? 'YEAR / TBD'}</span>
                <span className="team-directory__state"><i />{selectedId === member.id ? 'SELECTED' : 'READY'}</span>
              </button>
            </CursorTarget>
          ))}
        </div>
      </div>
    </section>
  )
}

function TeamHandoff() {
  return (
    <section className="team-handoff" aria-labelledby="team-handoff-title">
      <div className="page-container">
        <TechnicalDivider label="SYSTEM HANDOFF / 04" />
        <div className="team-handoff__inner">
          <div>
            <TechnicalLabel prefix="NEXT SYSTEM">ENGINEERING LOGS</TechnicalLabel>
            <h2 id="team-handoff-title">WHAT THE TEAM BUILDS<br /><em>BECOMES KNOWLEDGE.</em></h2>
            <p className="body-small">Continue from people and roles into the documentation of engineering work.</p>
          </div>
          <CursorTarget intent="link" label="OPEN">
            <Link to="/blogs" className="mechanical-button mechanical-button--primary label">OPEN LOGS ↗</Link>
          </CursorTarget>
        </div>
      </div>
    </section>
  )
}

function AssemblyFrame({ className = '' }: { className?: string }) {
  return <div className={`assembly-frame ${className}`} aria-hidden="true"><i /><i /><i /><i /><span /><span /><span /><span /></div>
}

function AssemblySchematic({ className = '' }: { className?: string }) {
  return (
    <div className={`assembly-schematic ${className}`} aria-hidden="true">
      <div className="assembly-schematic__frame"><span /><span /><span /><span /></div>
      <div className="assembly-schematic__core"><i /><b /><span>CORE</span></div>
      <div className="assembly-schematic__line assembly-schematic__line--a" />
      <div className="assembly-schematic__line assembly-schematic__line--b" />
      <div className="assembly-schematic__line assembly-schematic__line--c" />
      <div className="assembly-schematic__node assembly-schematic__node--a">01</div>
      <div className="assembly-schematic__node assembly-schematic__node--b">02</div>
      <div className="assembly-schematic__node assembly-schematic__node--c">03</div>
      <span className="assembly-schematic__label assembly-schematic__label--a">ROLE / INPUT</span>
      <span className="assembly-schematic__label assembly-schematic__label--b">ROLE / BUILD</span>
      <span className="assembly-schematic__label assembly-schematic__label--c">ROLE / OUTPUT</span>
    </div>
  )
}
