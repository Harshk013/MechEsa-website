import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { homepageEvents } from '../../data/home'
import type { EventItem } from '../../data/types'
import { CursorTarget } from '../../components/interaction/CursorTarget'
import { MechanicalPanel } from '../../components/mechanical/MechanicalPanel'
import { EngineeringGrid } from '../../components/mechanical/EngineeringGrid'
import { TechnicalLabel } from '../../components/typography/TechnicalLabel'
import { TechnicalDivider } from '../../components/mechanical/TechnicalDivider'
import { SystemIndicator } from '../../components/telemetry/SystemIndicator'
import { useMotionSettings } from '../../app/providers/MotionProvider'
import { usePointer } from '../../components/interaction/PointerProvider'
import './events.css'

const events = homepageEvents
const categories = ['ALL', ...Array.from(new Set(events.map((event) => event.category)))]

export function EventsPage() {
  const [selectedId, setSelectedId] = useState(events[0]?.id ?? '')
  const [filter, setFilter] = useState('ALL')
  const { reducedMotion } = useMotionSettings()
  const pageRef = useRef<HTMLDivElement>(null)
  const selected = events.find((event) => event.id === selectedId) ?? events[0]
  const visibleEvents = useMemo(() => filter === 'ALL' ? events : events.filter((event) => event.category === filter), [filter])

  useEffect(() => {
    if (!visibleEvents.some((event) => event.id === selectedId)) setSelectedId(visibleEvents[0]?.id ?? '')
  }, [filter, selectedId, visibleEvents])

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
      <div className="events-hero__meta"><TechnicalLabel prefix="EVENTS / 01">PRODUCTION FLOOR</TechnicalLabel><SystemIndicator state="online" label="MODE / EVENT EXPLORATION" /></div>
      <div className="events-hero__content">
        <div><span className="technical-small">MECHESA / PRODUCTION FLOOR</span><h1 id="events-title">EVENTS</h1><p>Engineering activity, represented as a production system. Explore the current event data and move through the archive.</p></div>
        <div className="events-hero__instrument"><span className="technical-small">PRODUCTION TRACK / 01</span><div className="events-track"><i /><i /><i /><b /></div><div className="events-hero__ticks"><span>IN</span><span>PROCESS</span><span>OUT</span></div></div>
      </div>
    </section>

    <main>
      <section className="events-production page-container" aria-labelledby="production-title">
        <div className="events-section-head"><TechnicalLabel prefix="01">ACTIVE PRODUCTION</TechnicalLabel><h2 id="production-title">CURRENT OPERATIONS.</h2><p>Event modules are presented as stations on one production floor. Select a station to inspect its available data.</p></div>
        <div className="events-production__layout">
          <div className="production-floor" aria-label="Event production line">
            <div className="production-floor__track" aria-hidden="true"><span /><i /><i /><i /><i /></div>
            <div className="production-floor__stations">
              {visibleEvents.map((event, index) => <EventProductionModule key={event.id} event={event} index={index} selected={selectedId === event.id} reducedMotion={reducedMotion} onSelect={() => setSelectedId(event.id)} />)}
            </div>
            {!visibleEvents.length && <div className="events-empty">NO MODULES IN CURRENT FILTER.</div>}
          </div>
          <EventInspector event={selected} />
        </div>
      </section>

      <section className="events-catalog page-container" aria-labelledby="catalog-title">
        <div className="events-section-head"><TechnicalLabel prefix="02">EVENT CATALOG</TechnicalLabel><h2 id="catalog-title">INDEX THE FLOOR.</h2><p>Use the available event categories to isolate production modules. Content-ready records remain explicitly marked.</p></div>
        <div className="events-filter" role="group" aria-label="Filter events">{categories.map((category) => <button key={category} type="button" className={filter === category ? 'is-active' : ''} aria-pressed={filter === category} onClick={() => setFilter(category)}>{category}<span>{category === 'ALL' ? events.length : events.filter((event) => event.category === category).length}</span></button>)}</div>
        <div className="events-table" role="list" aria-label="Event catalog">
          {visibleEvents.map((event, index) => <EventRow key={event.id} event={event} index={index} selected={selectedId === event.id} onSelect={() => setSelectedId(event.id)} />)}
        </div>
      </section>

      <section className="events-archive page-container" aria-labelledby="archive-title">
        <div className="events-section-head"><TechnicalLabel prefix="03">EVENT ARCHIVE</TechnicalLabel><h2 id="archive-title">PAST ACTIVITY.</h2><p>The current project dataset contains content-ready activity rather than an official historical archive, so no unsupported dates or years are inferred.</p></div>
        <div className="archive-frame"><div className="archive-frame__head"><span>ARCHIVE / INDEX</span><span>DATA STATUS / CONTENT READY</span></div>{events.filter((event) => event.status === 'completed').map((event, index) => <EventRow key={event.id} event={event} index={index} selected={selectedId === event.id} onSelect={() => setSelectedId(event.id)} archive />)}{events.every((event) => event.status !== 'completed') && <div className="events-empty">NO COMPLETED RECORDS IN CURRENT DATA.</div>}</div>
      </section>

      <section className="events-handoff page-container" aria-labelledby="handoff-title">
        <TechnicalDivider label="SYSTEM HANDOFF / 04" />
        <div className="events-handoff__inner"><div><TechnicalLabel prefix="PRODUCTION COMPLETE">NEXT SYSTEM</TechnicalLabel><h2 id="handoff-title">TEAM / ASSEMBLY</h2><p>Events are produced by people. Continue into the next subsystem.</p></div><CursorTarget intent="view" label="OPEN"><Link className="mechanical-button mechanical-button--primary label" to="/team">ENTER TEAM ↗</Link></CursorTarget></div>
      </section>
    </main>
  </div>
}

function EventProductionModule({ event, index, selected, reducedMotion, onSelect }: { event: EventItem; index: number; selected: boolean; reducedMotion: boolean; onSelect: () => void }) {
  const { setIntent, clearIntent } = usePointer()
  return <button type="button" className={`event-module${selected ? ' is-selected' : ''}`} style={{ '--station-index': index } as CSSProperties} aria-pressed={selected} onClick={onSelect} onPointerEnter={() => { setIntent('view', 'VIEW') }} onPointerLeave={clearIntent}>
    <span className="event-module__index">0{index + 1}</span><span className="event-module__bracket" aria-hidden="true" /><span className="event-module__status"><i />{event.status.toUpperCase()}</span><strong>{event.title}</strong><small>{event.category} / {event.date}</small><span className={`event-module__signal${reducedMotion ? ' is-static' : ''}`} aria-hidden="true" />
  </button>
}

function EventInspector({ event }: { event?: EventItem }) {
  if (!event) return <MechanicalPanel variant="technical" className="event-inspector"><TechnicalLabel prefix="INSPECTOR">EMPTY</TechnicalLabel><p className="body-small">No event module is currently available.</p></MechanicalPanel>
  return <MechanicalPanel variant="highlighted" className="event-inspector" aria-live="polite"><div className="event-inspector__top"><TechnicalLabel prefix="INSPECT">EVENT / {event.id.replace('event-preview-', '').padStart(3, '0')}</TechnicalLabel><SystemIndicator state={event.status === 'completed' ? 'idle' : 'active'} label={event.status.toUpperCase()} /></div><span className="technical-small">CATEGORY / {event.category}</span><h3>{event.title}</h3><p className="body-small">{event.description}</p><div className="event-inspector__data"><span>DATE<strong>{event.date}</strong></span><span>STATUS<strong>{event.status.toUpperCase()}</strong></span></div><TechnicalDivider label="SYSTEM NOTE" /><span className="technical-small">CONTENT / {event.id.includes('preview') ? 'CONTENT-READY DATA' : 'RECORDED MODULE'}</span></MechanicalPanel>
}

function EventRow({ event, index, selected, onSelect, archive = false }: { event: EventItem; index: number; selected: boolean; onSelect: () => void; archive?: boolean }) {
  return <CursorTarget intent="view" label="VIEW" className="event-row-cursor"><button type="button" className={`event-row${selected ? ' is-selected' : ''}`} role="listitem" aria-pressed={selected} onClick={onSelect}><span className="event-row__id">{archive ? 'ARC' : String(index + 1).padStart(2, '0')}</span><strong>{event.title}</strong><span>{event.category}</span><span>{event.date}</span><span className="event-row__status"><i />{event.status.toUpperCase()}</span><b aria-hidden="true">↗</b></button></CursorTarget>
}
