import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { eventsData } from '../../data/events'
import type { EventItem } from '../../data/types'
import { EngineeringGrid } from '../../components/mechanical/EngineeringGrid'
import { TechnicalDivider } from '../../components/mechanical/TechnicalDivider'
import { MechanicalButton } from '../../components/mechanical/MechanicalButton'
import { CursorTarget } from '../../components/interaction/CursorTarget'
import './events.css'

export function EventsPage() {
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>('ALL')

  // Keyboard accessibility: Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedEvent(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const categories = useMemo(() => {
    const cats = Array.from(new Set(eventsData.map((e) => e.category)))
    return ['ALL', ...cats]
  }, [])


  const upcomingEvents = useMemo(() => {
    const upcoming = eventsData.filter((e) => e.status === 'upcoming' || e.status === 'ongoing')
    if (activeCategory === 'ALL') return upcoming
    return upcoming.filter((e) => e.category === activeCategory)
  }, [activeCategory])

  const pastEvents = useMemo(() => {
    const past = eventsData.filter((e) => e.status === 'completed')
    if (activeCategory === 'ALL') return past
    return past.filter((e) => e.category === activeCategory)
  }, [activeCategory])

  return (
    <div className="events-page">
      <EngineeringGrid className="events-page__grid" size={40} opacity={0.03} />

      {/* ─── Hero Section ─── */}
      <section className="events-hero page-container" aria-labelledby="events-hero-title">
        <div className="events-hero__content">
          <div>
            <span className="technical-small">STUDENT ASSOCIATION OF MECHANICAL ENGINEERING</span>
            <h1 id="events-hero-title" className="page-heading">EVENTS.</h1>
            <p className="events-hero__desc">
              See what MechESA is organising, hosting and taking part in. Explore upcoming workshops, technical competitions, and past project sessions.
            </p>
          </div>
          <div className="events-hero__stats">
            <div className="events-hero__stat-card">
              <span>SCHEDULED SESSIONS</span>
              <strong>{eventsData.filter((e) => e.status === 'upcoming').length}</strong>
            </div>
            <div className="events-hero__stat-card">
              <span>RECORDED ARCHIVES</span>
              <strong>{eventsData.filter((e) => e.status === 'completed').length}</strong>
            </div>
          </div>
        </div>
      </section>

      <main className="page-container">
        {/* ─── 01 Upcoming Events ─── */}
        <section className="events-section" aria-labelledby="upcoming-section-title">
          <div className="events-section-head">
            <div className="events-section-head__title-group">
              <span className="page-eyebrow">01 // SCHEDULE</span>
              <h2 id="upcoming-section-title">UPCOMING EVENTS.</h2>
              <p>Browse open workshops, interactive sessions, and technical activities.</p>
            </div>

            {/* Filter controls */}
            <div className="events-filter-bar" role="group" aria-label="Filter events by category">
              {categories.map((category) => {
                const count = category === 'ALL'
                  ? eventsData.filter((e) => e.status === 'upcoming').length
                  : eventsData.filter((e) => e.status === 'upcoming' && e.category === category).length
                return (
                  <button
                    key={category}
                    type="button"
                    className={`events-filter-btn${activeCategory === category ? ' is-active' : ''}`}
                    aria-pressed={activeCategory === category}
                    onClick={() => setActiveCategory(category)}
                  >
                    {category}
                    <span>{count}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {upcomingEvents.length > 0 ? (
            <div className="events-grid">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} onSelect={setSelectedEvent} />
              ))}
            </div>
          ) : (
            <div className="events-empty">
              <p>NO UPCOMING EVENTS IN THIS CATEGORY AT PRESENT.</p>
            </div>
          )}
        </section>

        {/* ─── 03 Past Events ─── */}
        <section className="events-section" aria-labelledby="past-section-title">
          <TechnicalDivider label="HISTORICAL ARCHIVE" />
          <div className="events-section-head" style={{ marginTop: '2rem' }}>
            <div className="events-section-head__title-group">
              <span className="page-eyebrow">02 // ARCHIVE</span>
              <h2 id="past-section-title">PAST EVENTS.</h2>
              <p>Record of completed technical workshops, lectures, and activities.</p>
            </div>
          </div>

          {pastEvents.length > 0 ? (
            <div className="events-grid">
              {pastEvents.map((event) => (
                <EventCard key={event.id} event={event} isPast onSelect={setSelectedEvent} />
              ))}
            </div>
          ) : (
            <div className="events-empty">
              <p>NO COMPLETED EVENTS ARCHIVED CURRENTLY.</p>
            </div>
          )}
        </section>

        {/* ─── Handoff to Team ─── */}
        <section className="events-section" aria-labelledby="team-handoff-title">
          <TechnicalDivider label="NEXT" />
          <div className="events-handoff__inner">
            <div>
              <span className="page-eyebrow">ASSOCIATION TEAM</span>
              <h2 id="team-handoff-title" className="page-heading">MEET THE PEOPLE BEHIND THE EVENTS.</h2>
              <p>Explore the team, student coordinators, and domains leading MechESA.</p>
            </div>
            <CursorTarget intent="link" label="OPEN">
              <Link className="mechanical-button mechanical-button--primary label" to="/team">
                <span>MEET THE TEAM</span> <span className="btn-arrow" aria-hidden="true">↗</span>
              </Link>
            </CursorTarget>
          </div>
        </section>
      </main>

      {/* ─── Event Detail Modal ─── */}
      {selectedEvent && (
        <EventDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </div>
  )
}


function EventCard({
  event,
  isPast = false,
  onSelect,
}: {
  event: EventItem
  isPast?: boolean
  onSelect: (e: EventItem) => void
}) {
  return (
    <article className={`event-card${isPast ? ' event-card--past' : ''}`}>
      <div className="event-card__media">
        <div className="event-card__media-pattern" />
        <span className={`event-card__badge${isPast ? ' event-card__badge--past' : ''}`}>
          {isPast ? 'PAST EVENT' : event.category}
        </span>
        <div className="event-card__icon-wrap" aria-hidden="true">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.2">
            <rect x="6" y="8" width="28" height="24" rx="1" />
            <line x1="6" y1="16" x2="34" y2="16" />
            <line x1="12" y1="4" x2="12" y2="8" />
            <line x1="28" y1="4" x2="28" y2="8" />
            <circle cx="14" cy="23" r="1.5" fill="currentColor" />
            <circle cx="20" cy="23" r="1.5" fill="currentColor" />
            <circle cx="26" cy="23" r="1.5" fill="currentColor" />
          </svg>
        </div>
        <span className="technical-small" style={{ color: 'var(--color-text-dim)', zIndex: 1 }}>
          {event.date}
        </span>
      </div>

      <div className="event-card__body">
        <span className="event-card__date">
          {event.category} // {event.status.toUpperCase()}
        </span>
        <h3 className="event-card__title">{event.title}</h3>
        {event.location && <div className="event-card__venue">📍 {event.location}</div>}
        <p className="event-card__desc">{event.description}</p>

        <div className="event-card__action">
          <MechanicalButton variant="secondary" onClick={() => onSelect(event)}>
            VIEW DETAILS →
          </MechanicalButton>
        </div>
      </div>
    </article>
  )
}

function EventDetailModal({
  event,
  onClose,
}: {
  event: EventItem
  onClose: () => void
}) {
  return (
    <div
      className="event-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-event-title"
      onClick={onClose}
    >
      <div className="event-modal-container" onClick={(e) => e.stopPropagation()}>
        <header className="event-modal-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="page-eyebrow" style={{ marginBottom: 0 }}>EVENT INSPECTION</span>
            <SystemIndicator state={event.status === 'completed' ? 'idle' : 'online'} label={event.status.toUpperCase()} />
          </div>
          <button type="button" className="event-modal-close-btn" onClick={onClose} aria-label="Close dialog">
            ESC / CLOSE ✕
          </button>
        </header>

        <div className="event-modal-body">
          <span className="event-modal-tag">CATEGORY // {event.category}</span>
          <h2 id="modal-event-title" className="event-modal-title">{event.title}</h2>

          <div className="event-modal-meta-grid">
            <div className="event-modal-meta-item">
              <span>DATE</span>
              <strong>{event.date}</strong>
            </div>
            <div className="event-modal-meta-item">
              <span>STATUS</span>
              <strong>{event.status.toUpperCase()}</strong>
            </div>
            {event.location && (
              <div className="event-modal-meta-item">
                <span>VENUE</span>
                <strong>{event.location}</strong>
              </div>
            )}
            {event.organizer && (
              <div className="event-modal-meta-item">
                <span>ORGANIZER</span>
                <strong>{event.organizer}</strong>
              </div>
            )}
          </div>

          <div className="event-modal-desc-block">
            <h4 className="technical-small" style={{ color: 'var(--color-text)', marginBottom: '0.5rem' }}>
              ABOUT THIS EVENT
            </h4>
            <p>{event.description}</p>
          </div>

          {event.photos && event.photos.length > 0 && (
            <div className="event-modal-gallery">
              <h4 className="technical-small" style={{ color: 'var(--color-text)', marginBottom: '0.5rem' }}>
                SESSION PHOTOS
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.5rem' }}>
                {event.photos.map((photo, i) => (
                  <img
                    key={i}
                    src={photo}
                    alt={`${event.title} photo ${i + 1}`}
                    style={{ width: '100%', height: '80px', objectFit: 'cover', border: '1px solid var(--color-border)' }}
                  />
                ))}
              </div>
            </div>
          )}

          <div style={{ padding: '1rem', border: '1px solid var(--color-border)', background: 'var(--color-bg-deep)' }}>
            <span className="technical-small" style={{ color: 'var(--color-text-dim)' }}>
              REGISTRATION & ACCESS
            </span>
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>
              {event.status === 'completed'
                ? 'This event has concluded. Stay tuned for future editions through MechESA.'
                : 'Registration status: Opening soon via official institute channels.'}
            </p>
          </div>
        </div>

        <footer className="event-modal-foot">
          <MechanicalButton variant="secondary" onClick={onClose}>
            CLOSE
          </MechanicalButton>
        </footer>
      </div>
    </div>
  )
}
