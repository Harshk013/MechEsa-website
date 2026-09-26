import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { homepageEvents } from '../../data/home'
import type { EventItem } from '../../data/types'
import { CursorTarget } from '../../components/interaction/CursorTarget'
import { MechanicalPanel } from '../../components/mechanical/MechanicalPanel'
import { MechanicalCard } from '../../components/mechanical/MechanicalCard'
import { MechanicalButton } from '../../components/mechanical/MechanicalButton'
import { EngineeringGrid } from '../../components/mechanical/EngineeringGrid'
import { TechnicalDivider } from '../../components/mechanical/TechnicalDivider'
import { SystemIndicator } from '../../components/telemetry/SystemIndicator'
import { useMotionSettings } from '../../app/providers/MotionProvider'
import './events.css'

const events = homepageEvents
const categories = ['ALL', ...Array.from(new Set(events.map((event) => event.category)))]

export function EventsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [filter, setFilter] = useState('ALL')
  const { reducedMotion } = useMotionSettings()
  const pageRef = useRef<HTMLDivElement>(null)
  const visibleEvents = useMemo(() => filter === 'ALL' ? events : events.filter((event) => event.category === filter), [filter])
  const selected = events.find((event) => event.id === selectedId) || null

  useEffect(() => {
    const page = pageRef.current
    if (!page) return
    let raf = 0
    const update = () => {
      raf = 0
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      const progress = Math.min(1, Math.max(0, window.scrollY / max))
      page.style.setProperty('--events-progress', progress.toFixed(3))
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); if (raf) cancelAnimationFrame(raf) }
  }, [])

  return <div ref={pageRef} className="events-page" data-reduced-motion={reducedMotion}>
    <EngineeringGrid className="events-page__grid" size={40} opacity={0.035} />
    <div className="events-page__axis" aria-hidden="true"><span>01</span><i /><span>02</span><i /><span>03</span><i /><span>04</span></div>

    <section className="events-hero page-container" aria-labelledby="events-title">
      <div className="events-hero__meta"><span className="page-eyebrow">UPCOMING EVENTS</span><SystemIndicator state="online" label="READY" /></div>
      <div className="events-hero__content">
        <div><span className="technical-small">MECHESA // ENGINEERED MOTION</span><h1 id="events-title" className="page-heading">EVENTS.</h1><p className="page-description">Workshops, competitions, and engineering activities. Explore the current schedule and our past events archive.</p></div>
        <div className="events-hero__instrument"><span className="technical-small">SCHEDULE ACTIVE</span><div className="events-track"><i /><i /><i /><b /></div></div>
      </div>
    </section>

    <main>
      <section className="events-production page-container" aria-labelledby="production-title">
        <div className="events-section-head"><span className="page-eyebrow">01 // EVENT SCHEDULE</span><h2 id="production-title" className="page-heading">CURRENT OPERATIONS.</h2><p className="page-description">Browse all active and upcoming MechESA events.</p></div>
        
        <div className="events-grid">
          {visibleEvents.map((event, index) => (
            <CursorTarget key={event.id} label="VIEW" intent="view" className="event-card-target">
              <div onClick={() => setSelectedId(event.id)}>
                <MechanicalCard 
                  className="event-card"
                  number={`0${index + 1}`} 
                  category={event.category} 
                  status={event.status.toUpperCase()} 
                  title={event.title} 
                  description={event.description} 
                  action={<span className="technical-small">{event.date}</span>} 
                />
              </div>
            </CursorTarget>
          ))}
          {!visibleEvents.length && <div className="events-empty">NO EVENTS IN CURRENT FILTER.</div>}
        </div>
        
        {selected && (
          <EventDetailModal event={selected} onClose={() => setSelectedId(null)} />
        )}
      </section>

      <section className="events-catalog page-container" aria-labelledby="catalog-title">
        <div className="events-section-head"><span className="page-eyebrow">02 // EVENT CATALOG</span><h2 id="catalog-title" className="page-heading">INDEX THE EVENTS.</h2><p className="page-description">Filter events by their specific engineering discipline.</p></div>
        <div className="events-filter" role="group" aria-label="Filter events">{categories.map((category) => <button key={category} type="button" className={filter === category ? 'is-active' : ''} aria-pressed={filter === category} onClick={() => setFilter(category)}>{category}<span>{category === 'ALL' ? events.length : events.filter((event) => event.category === category).length}</span></button>)}</div>
        <div className="events-table" role="list" aria-label="Event catalog">
          {visibleEvents.map((event, index) => <EventRow key={event.id} event={event} index={index} selected={selectedId === event.id} onSelect={() => setSelectedId(event.id)} />)}
        </div>
      </section>

      <section className="events-archive page-container" aria-labelledby="archive-title">
        <div className="events-section-head"><span className="page-eyebrow">03 // EVENT ARCHIVE</span><h2 id="archive-title" className="page-heading">PAST ACTIVITY.</h2><p className="page-description">A record of past workshops and engineering initiatives.</p></div>
        <div className="archive-frame"><div className="archive-frame__head"><span>ARCHIVE / INDEX</span><span>STATUS / COMPLETED</span></div>{events.filter((event) => event.status === 'completed').map((event, index) => <EventRow key={event.id} event={event} index={index} selected={selectedId === event.id} onSelect={() => setSelectedId(event.id)} archive />)}{events.every((event) => event.status !== 'completed') && <div className="events-empty">NO COMPLETED EVENTS.</div>}</div>
      </section>

      <section className="events-handoff page-container" aria-labelledby="handoff-title">
        <TechnicalDivider label="NEXT" />
        <div className="events-handoff__inner"><div><span className="page-eyebrow">EXPLORE MORE</span><h2 id="handoff-title" className="page-heading">TEAM / ASSEMBLY</h2><p className="page-description">Events are produced by people. Continue into the team directory.</p></div><CursorTarget intent="view" label="OPEN"><Link className="mechanical-button mechanical-button--primary label" to="/team">MEET THE TEAM ↗</Link></CursorTarget></div>
      </section>
    </main>
  </div>
}

function EventDetailModal({ event, onClose }: { event: EventItem; onClose: () => void }) {
  return (
    <div className="event-detail-modal-overlay" onClick={onClose}>
      <MechanicalPanel variant="highlighted" className="event-inspector" aria-live="polite" onClick={(e) => e.stopPropagation()}>
        <div className="event-inspector__top">
          <span className="page-eyebrow" style={{marginBottom: 0}}>EVENT DETAILS</span>
          <SystemIndicator state={event.status === 'completed' ? 'idle' : 'active'} label={event.status.toUpperCase()} />
        </div>
        <span className="technical-small">CATEGORY / {event.category}</span>
        <h3 className="heading-md">{event.title}</h3>
        <p className="body-small" style={{marginTop: '1rem', marginBottom: '1.5rem'}}>{event.description}</p>
        
        <div className="event-inspector__data" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem', marginBottom: '1.5rem'}}>
          <div style={{display: 'flex', flexDirection: 'column'}}>
            <span className="technical-small" style={{color: 'var(--color-text-dim)'}}>DATE</span>
            <strong style={{fontSize: '1rem'}}>{event.date}</strong>
          </div>
          <div style={{display: 'flex', flexDirection: 'column'}}>
            <span className="technical-small" style={{color: 'var(--color-text-dim)'}}>STATUS</span>
            <strong style={{fontSize: '1rem'}}>{event.status.toUpperCase()}</strong>
          </div>
        </div>
        
        <MechanicalButton variant="primary" style={{width: '100%'}} onClick={onClose}>CLOSE DETAILS</MechanicalButton>
      </MechanicalPanel>
    </div>
  )
}

function EventRow({ event, index, selected, onSelect, archive = false }: { event: EventItem; index: number; selected: boolean; onSelect: () => void; archive?: boolean }) {
  return <CursorTarget intent="view" label="VIEW" className="event-row-cursor"><button type="button" className={`event-row${selected ? ' is-selected' : ''}`} role="listitem" aria-pressed={selected} onClick={onSelect}><span className="event-row__id">{archive ? 'ARC' : String(index + 1).padStart(2, '0')}</span><strong>{event.title}</strong><span>{event.category}</span><span>{event.date}</span><span className="event-row__status"><i />{event.status.toUpperCase()}</span><b aria-hidden="true">↗</b></button></CursorTarget>
}
