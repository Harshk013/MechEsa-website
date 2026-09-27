import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { teamMembersData, teamDomains } from '../../data/team'
import type { TeamMember } from '../../data/types'
import { EngineeringGrid } from '../../components/mechanical/EngineeringGrid'
import { TechnicalDivider } from '../../components/mechanical/TechnicalDivider'
import { SystemIndicator } from '../../components/telemetry/SystemIndicator'
import { MechanicalButton } from '../../components/mechanical/MechanicalButton'
import { CursorTarget } from '../../components/interaction/CursorTarget'
import './team.css'

export function TeamPage() {
  const [selectedDomain, setSelectedDomain] = useState<string>('ALL')
  const [inspectedMember, setInspectedMember] = useState<TeamMember | null>(null)

  // Keyboard accessibility: Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setInspectedMember(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const filteredMembers = useMemo(() => {
    if (selectedDomain === 'ALL') return teamMembersData
    return teamMembersData.filter((m) => m.domain === selectedDomain)
  }, [selectedDomain])

  // Group members by domain for structured display
  const domainGroups = useMemo(() => {
    const groups: { domain: string; title: string; subtitle: string; members: TeamMember[] }[] = []

    if (selectedDomain === 'ALL') {
      const coreMembers = teamMembersData.filter((m) => m.isCore || m.domain === 'CORE TEAM')
      if (coreMembers.length > 0) {
        groups.push({
          domain: 'CORE TEAM',
          title: 'OVERALL LEADERSHIP & CORE COUNCIL',
          subtitle: 'Leading association initiatives, academic coordination, and executive decisions.',
          members: coreMembers,
        })
      }

      const operationsMembers = teamMembersData.filter((m) => m.domain === 'OPERATIONS' && !m.isCore)
      if (operationsMembers.length > 0) {
        groups.push({
          domain: 'OPERATIONS',
          title: 'OPERATIONS & TECHNICAL DIVISION',
          subtitle: 'Technical workshops, labs logistics, event operations, and project mentoring.',
          members: operationsMembers,
        })
      }

      const creativeMembers = teamMembersData.filter((m) => m.domain === 'CREATIVES' && !m.isCore)
      if (creativeMembers.length > 0) {
        groups.push({
          domain: 'CREATIVES',
          title: 'CREATIVES & MEDIA DIVISION',
          subtitle: 'Visual identity, publications, design systems, and association outreach.',
          members: creativeMembers,
        })
      }

      // Any remaining members
      const others = teamMembersData.filter(
        (m) => m.domain !== 'CORE TEAM' && m.domain !== 'OPERATIONS' && m.domain !== 'CREATIVES' && !m.isCore
      )
      if (others.length > 0) {
        groups.push({
          domain: 'MEMBERS',
          title: 'ASSOCIATION CONTRIBUTORS',
          subtitle: 'Student contributors and coordinators.',
          members: others,
        })
      }
    } else {
      groups.push({
        domain: selectedDomain,
        title: `${selectedDomain} MEMBERS`,
        subtitle: `Contributors active in ${selectedDomain}.`,
        members: filteredMembers,
      })
    }

    return groups
  }, [selectedDomain, filteredMembers])

  return (
    <div className="team-page">
      <EngineeringGrid className="team-page__grid" size={40} opacity={0.03} />

      {/* ─── Hero Section ─── */}
      <section className="team-hero page-container" aria-labelledby="team-hero-title">
        <div className="team-hero__meta">
          <span className="page-eyebrow">MECHESA // DIRECTORY & LEADERSHIP</span>
          <SystemIndicator state="online" label="COUNCIL ACTIVE" />
        </div>
        <div className="team-hero__content">
          <div>
            <span className="technical-small">DEPARTMENT OF MECHANICAL ENGINEERING // IIT INDORE</span>
            <h1 id="team-hero-title" className="page-heading">THE TEAM.</h1>
            <p className="team-hero__desc">
              The students, faculty, and engineers who keep MechESA moving. Meet the council heads, coordinators, and contributors across our operational divisions.
            </p>
          </div>
          <div className="team-hero__roster-badge">
            <span>COUNCIL ROSTER</span>
            <strong>{teamMembersData.length} ACTIVE MEMBERS</strong>
            <span style={{ color: 'var(--color-text-dim)', fontSize: '9px' }}>
              DIVISIONS // CORE • OPERATIONS • CREATIVES
            </span>
          </div>
        </div>
      </section>

      <main className="page-container">
        {/* ─── Domain Navigation Bar ─── */}
        <nav className="team-nav-bar" aria-label="Team divisions filter">
          {teamDomains.map((domain) => {
            const count = domain === 'ALL'
              ? teamMembersData.length
              : teamMembersData.filter((m) => m.domain === domain).length
            return (
              <button
                key={domain}
                type="button"
                className={`team-nav-btn${selectedDomain === domain ? ' is-active' : ''}`}
                aria-pressed={selectedDomain === domain}
                onClick={() => setSelectedDomain(domain)}
              >
                {domain}
                <span>{count}</span>
              </button>
            )
          })}
        </nav>

        {/* ─── Domain Groups ─── */}
        {domainGroups.map((group) => (
          <section key={group.domain} className="team-domain-section" aria-labelledby={`domain-${group.domain}`}>
            <div className="team-domain-header">
              <div>
                <span className="page-eyebrow" style={{ marginBottom: '0.25rem' }}>
                  DIVISION // {group.domain}
                </span>
                <h2 id={`domain-${group.domain}`}>{group.title}</h2>
                <p>{group.subtitle}</p>
              </div>
              <span className="technical-small" style={{ color: 'var(--color-text-dim)' }}>
                {group.members.length} {group.members.length === 1 ? 'MEMBER' : 'MEMBERS'}
              </span>
            </div>

            <div className="team-grid">
              {group.members.map((member) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  onInspect={() => setInspectedMember(member)}
                />
              ))}
            </div>
          </section>
        ))}

        {/* ─── Handoff to Blogs ─── */}
        <section className="events-section" aria-labelledby="blogs-handoff-title">
          <TechnicalDivider label="NEXT" />
          <div className="events-handoff__inner">
            <div>
              <span className="page-eyebrow">ENGINEERING STORIES</span>
              <h2 id="blogs-handoff-title" className="page-heading">
                WHAT THE TEAM BUILDS BECOMES KNOWLEDGE.
              </h2>
              <p>Explore articles, project logs, and career experiences written by students.</p>
            </div>
            <CursorTarget intent="link" label="OPEN">
              <Link className="mechanical-button mechanical-button--primary label" to="/blogs">
                READ STORIES ↗
              </Link>
            </CursorTarget>
          </div>
        </section>
      </main>

      {/* ─── Member Detail Modal ─── */}
      {inspectedMember && (
        <MemberDetailModal
          member={inspectedMember}
          onClose={() => setInspectedMember(null)}
        />
      )}
    </div>
  )
}

function MemberCard({
  member,
  onInspect,
}: {
  member: TeamMember
  onInspect: () => void
}) {
  return (
    <article className="member-card">
      <div className="member-card__photo-frame">
        {member.image ? (
          <img src={member.image} alt={member.name} className="member-card__photo" />
        ) : (
          <div className="member-card__avatar-placeholder" aria-hidden="true">
            <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.2">
              <circle cx="20" cy="14" r="7" />
              <path d="M6 34 C6 26, 12 23, 20 23 C28 23, 34 26, 34 34" />
            </svg>
            <span>MECHESA // MEMBER</span>
          </div>
        )}
        <span className="member-card__corner-bracket" aria-hidden="true">＋</span>
      </div>

      <div className="member-card__info">
        <span className="member-card__domain-tag">
          {member.domain || 'MECHESA'}
        </span>
        <h3 className="member-card__name">{member.name}</h3>
        <p className="member-card__role">{member.role}</p>

        <div className="member-card__meta-details">
          <span>{member.year || 'IIT INDORE'}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {member.socials && Object.keys(member.socials).length > 0 && (
              <div className="member-card__socials">
                {member.socials.linkedin && (
                  <a
                    href={member.socials.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="member-card__social-link"
                    aria-label={`${member.name} LinkedIn Profile`}
                  >
                    in
                  </a>
                )}
                {member.socials.instagram && (
                  <a
                    href={member.socials.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="member-card__social-link"
                    aria-label={`${member.name} Instagram`}
                  >
                    ig
                  </a>
                )}
                {member.socials.github && (
                  <a
                    href={member.socials.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="member-card__social-link"
                    aria-label={`${member.name} GitHub`}
                  >
                    gh
                  </a>
                )}
              </div>
            )}
            <button
              type="button"
              className="technical-small"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--color-accent)',
                cursor: 'pointer',
                padding: '2px 4px',
              }}
              onClick={onInspect}
              aria-label={`View details for ${member.name}`}
            >
              DETAILS →
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}

function MemberDetailModal({
  member,
  onClose,
}: {
  member: TeamMember
  onClose: () => void
}) {
  return (
    <div
      className="member-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="member-modal-name"
      onClick={onClose}
    >
      <div className="member-modal-container" onClick={(e) => e.stopPropagation()}>
        <header className="member-modal-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="page-eyebrow" style={{ marginBottom: 0 }}>MEMBER PROFILE</span>
            <SystemIndicator state="online" label="ACTIVE" />
          </div>
          <button
            type="button"
            className="event-modal-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            ESC / CLOSE ✕
          </button>
        </header>

        <div className="member-modal-body">
          <div>
            <span className="technical-small" style={{ color: 'var(--color-accent)' }}>
              {member.domain || 'MECHESA'} // {member.id.toUpperCase()}
            </span>
            <h2 id="member-modal-name" className="member-modal-name">{member.name}</h2>
            <p style={{ margin: '0.35rem 0 0', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
              {member.role}
            </p>
          </div>

          <div className="member-modal-grid">
            <div className="member-modal-grid-item">
              <span>DIVISION / DOMAIN</span>
              <strong>{member.domain || 'CORE TEAM'}</strong>
            </div>
            <div className="member-modal-grid-item">
              <span>BATCH / YEAR</span>
              <strong>{member.year || 'YEAR / TBD'}</strong>
            </div>
            {member.specialization && (
              <div className="member-modal-grid-item" style={{ gridColumn: '1 / -1' }}>
                <span>FOCUS & SPECIALIZATION</span>
                <strong>{member.specialization}</strong>
              </div>
            )}
          </div>

          <div style={{ padding: '1rem', border: '1px solid var(--color-border)', background: 'var(--color-bg-deep)' }}>
            <span className="technical-small" style={{ color: 'var(--color-text-dim)' }}>
              ASSOCIATION AFFILIATION
            </span>
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>
              Mechanical Engineering Students' Association (MechESA), Indian Institute of Technology Indore.
            </p>
          </div>
        </div>

        <footer className="member-modal-foot">
          <MechanicalButton variant="secondary" onClick={onClose}>
            CLOSE
          </MechanicalButton>
        </footer>
      </div>
    </div>
  )
}