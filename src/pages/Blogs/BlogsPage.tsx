import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { homepageBlogs } from '../../data/home'
import type { BlogPost } from '../../data/types'
import { CursorTarget } from '../../components/interaction/CursorTarget'
import { EngineeringGrid } from '../../components/mechanical/EngineeringGrid'
import { MechanicalPanel } from '../../components/mechanical/MechanicalPanel'
import { TechnicalDivider } from '../../components/mechanical/TechnicalDivider'
import { TechnicalLabel } from '../../components/typography/TechnicalLabel'
import { SystemIndicator } from '../../components/telemetry/SystemIndicator'
import { useMotionSettings } from '../../app/providers/MotionProvider'
import { usePointer } from '../../components/interaction/PointerProvider'
import './blogs.css'

const logs = homepageBlogs
const categories = ['ALL', ...Array.from(new Set(logs.map((log) => log.category).filter(Boolean) as string[]))]

export function BlogsPage() {
  const [selectedId, setSelectedId] = useState(logs[0]?.id ?? '')
  const [filter, setFilter] = useState('ALL')
  const { reducedMotion } = useMotionSettings()
  const pageRef = useRef<HTMLDivElement>(null)
  const selected = logs.find((log) => log.id === selectedId) ?? logs[0]
  const visibleLogs = useMemo(() => filter === 'ALL' ? logs : logs.filter((log) => log.category === filter), [filter])

  useEffect(() => {
    if (!visibleLogs.some((log) => log.id === selectedId)) setSelectedId(visibleLogs[0]?.id ?? '')
  }, [filter, selectedId, visibleLogs])

  useEffect(() => {
    const page = pageRef.current
    if (!page) return
    let raf = 0
    const update = () => {
      raf = 0
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      const progress = Math.min(1, Math.max(0, window.scrollY / max))
      page.style.setProperty('--blogs-progress', progress.toFixed(3))
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return <div ref={pageRef} className="blogs-page" data-reduced-motion={reducedMotion} data-log-count={logs.length} data-selected-log={selected?.id ?? 'none'} data-active-category={filter}>
    <EngineeringGrid className="blogs-page__grid" size={40} opacity={0.035} />
    <div className="blogs-page__axis" aria-hidden="true"><span>01</span><i /><span>02</span><i /><span>03</span><i /><span>04</span><i /><span>05</span></div>

    <section className="blogs-hero page-container" aria-labelledby="blogs-title" data-transition="document-reveal">
      <div className="blogs-hero__meta">
        <TechnicalLabel prefix="BLOGS / 01">ENGINEERING LOGS</TechnicalLabel>
        <SystemIndicator state="online" label="MODE / DOCUMENTATION" />
      </div>
      <div className="blogs-hero__layout">
        <div className="blogs-hero__copy">
          <span className="technical-small">MECHESA / DOCUMENTATION SYSTEM</span>
          <h1 id="blogs-title"><span>ENGINEERING</span><span>LOGS</span></h1>
          <p>DOCUMENT THE WORK.</p>
        </div>
        <DocumentationInstrument />
      </div>
    </section>

    <main>
      <section className="blogs-featured page-container" aria-labelledby="featured-title">
        <div className="blogs-section-head">
          <TechnicalLabel prefix="02">FEATURED LOG</TechnicalLabel>
          <h2 id="featured-title">DOCUMENT UNDER INSPECTION.</h2>
          <p>The featured record is sourced directly from the existing MechESA engineering log dataset.</p>
        </div>
        {selected && <FeaturedLog log={selected} index={logs.findIndex((log) => log.id === selected.id)} selected onSelect={() => setSelectedId(selected.id)} />}
      </section>

      <section className="blogs-index page-container" aria-labelledby="index-title">
        <div className="blogs-section-head blogs-section-head--index">
          <div><TechnicalLabel prefix="03">LOG INDEX</TechnicalLabel><h2 id="index-title">ENGINEERING RECORDS.</h2><p>Browse the available records as a technical document index. Categories are derived from the current dataset.</p></div>
          {categories.length > 1 && <div className="blogs-filter" role="group" aria-label="Filter engineering logs">{categories.map((category) => <button key={category} type="button" className={filter === category ? 'is-active' : ''} aria-pressed={filter === category} onClick={() => setFilter(category)}>{category}<span>{category === 'ALL' ? logs.length : logs.filter((log) => log.category === category).length}</span></button>)}</div>}
        </div>
        <div className="blogs-index__table" role="list" aria-label="Engineering log index">
          <div className="blogs-index__header" aria-hidden="true"><span>INDEX</span><span>TITLE</span><span>CATEGORY</span><span>DATE</span><span>TYPE</span></div>
          {visibleLogs.map((log, index) => <LogRow key={log.id} log={log} index={logs.findIndex((item) => item.id === log.id)} visibleIndex={index} selected={selectedId === log.id} onSelect={() => setSelectedId(log.id)} />)}
          {!visibleLogs.length && <div className="blogs-empty">NO DOCUMENTS IN CURRENT CLASSIFICATION.</div>}
        </div>
      </section>

      <section className="blogs-archive page-container" aria-labelledby="archive-title">
        <div className="blogs-section-head">
          <TechnicalLabel prefix="04">ENGINEERING ARCHIVE</TechnicalLabel>
          <h2 id="archive-title">DOCUMENT DATUM.</h2>
          <p>No publication years are inferred because the current log records use content-ready dates. The archive therefore preserves sequential document order.</p>
        </div>
        <Archive logs={logs} selectedId={selectedId} onSelect={setSelectedId} />
      </section>

      <section className="blogs-inspector page-container" aria-labelledby="inspector-title">
        <div className="blogs-inspector__layout">
          <LogInspector log={selected} index={selected ? logs.findIndex((item) => item.id === selected.id) : -1} />
          <div className="blogs-inspector__readout" aria-hidden="true"><span>INDEX PROGRESS / LIVE</span><i><b /></i><strong>DOC / TRACK</strong></div>
        </div>
      </section>

      <section className="blogs-handoff page-container" aria-labelledby="handoff-title">
        <TechnicalDivider label="SYSTEM HANDOFF / 05" />
        <div className="blogs-handoff__inner">
          <div><TechnicalLabel prefix="DOCUMENTATION COMPLETE">NEXT SYSTEM</TechnicalLabel><h2 id="handoff-title">MECHESA / ABOUT</h2><p>Continue from the record system into the association overview when that route is populated.</p></div>
          <CursorTarget intent="view" label="OPEN"><Link className="mechanical-button mechanical-button--primary label" to="/about">ENTER ABOUT ↗</Link></CursorTarget>
        </div>
      </section>
    </main>
  </div>
}

function DocumentationInstrument() {
  return <div className="document-instrument" aria-hidden="true">
    <div className="document-instrument__frame"><span className="reg reg--tl" /><span className="reg reg--tr" /><span className="reg reg--bl" /><span className="reg reg--br" /><span className="document-instrument__index">DOC / 000</span><span className="document-instrument__stamp">ENGINEERING<br />DOCUMENTATION</span><div className="document-instrument__sheet"><i /><i /><i /><i /><b /></div><span className="document-instrument__datum">A—A / REGISTERED</span></div>
  </div>
}

function FeaturedLog({ log, index, selected, onSelect }: { log: BlogPost; index: number; selected: boolean; onSelect: () => void }) {
  const { setIntent, clearIntent } = usePointer()
  const logNumber = String(index + 1).padStart(3, '0')
  return <article className={`featured-log${selected ? ' is-selected' : ''}`} onPointerEnter={() => setIntent('view', 'VIEW')} onPointerLeave={clearIntent}>
    <button type="button" className="featured-log__hit" aria-label={`Select ${log.title}`} aria-pressed={selected} onClick={onSelect}>
      <div className="featured-log__index"><span>LOG /</span><strong>{logNumber}</strong><small>DOCUMENT / {log.id}</small></div>
      <div className="featured-log__body"><span className="technical-small">FEATURED RECORD / INDEXED</span><h3>{log.title}</h3><p>{log.excerpt}</p><div className="featured-log__meta">{log.category && <span><b>CATEGORY</b>{log.category}</span>}<span><b>DATE</b>{log.date}</span>{log.author && <span><b>AUTHOR</b>{log.author}</span>}{log.readTime && <span><b>READ</b>{log.readTime}</span>}</div></div>
      <div className="featured-log__plate"><span>DOCUMENT PLATE</span><div><i /><i /><i /><i /><b /></div><small>{selected ? 'SELECTED / INSPECTOR SYNC' : 'INDEXED / READY'}</small></div>
    </button>
    <div className="featured-log__action"><span className="technical-small">DETAIL ROUTE / CONTENT READY</span><span className="technical-small">SELECTED / INSPECTOR SYNC</span></div>
  </article>
}

function LogRow({ log, index, visibleIndex, selected, onSelect }: { log: BlogPost; index: number; visibleIndex: number; selected: boolean; onSelect: () => void }) {
  return <CursorTarget intent="view" label="VIEW" className="log-row-cursor"><button type="button" className={`log-row${selected ? ' is-selected' : ''}`} role="listitem" aria-pressed={selected} aria-label={`Select log ${index + 1}: ${log.title}`} style={{ '--row-index': visibleIndex } as CSSProperties} onClick={onSelect}>
    <span className="log-row__id">LOG / {String(index + 1).padStart(3, '0')}</span><strong>{log.title}</strong><span>{log.category ?? 'TYPE / TBD'}</span><span>{log.date}</span><span className="log-row__type">{selected ? 'SELECTED' : 'INDEXED'}</span><i aria-hidden="true" />
  </button></CursorTarget>
}

function Archive({ logs, selectedId, onSelect }: { logs: BlogPost[]; selectedId: string; onSelect: (id: string) => void }) {
  return <div className="archive-system" aria-label="Sequential engineering log archive">
    <div className="archive-system__scale" aria-hidden="true"><span>BEGIN</span><i /><span>INDEX</span><i /><span>END</span></div>
    <div className="archive-system__timeline">
      {logs.map((log, index) => <button type="button" key={log.id} className={`archive-marker${selectedId === log.id ? ' is-selected' : ''}`} aria-pressed={selectedId === log.id} onClick={() => onSelect(log.id)}>
        <span className="archive-marker__dot" /><span className="archive-marker__id">LOG / {String(index + 1).padStart(3, '0')}</span><strong>{log.title}</strong><small>{log.category ?? 'TYPE / TBD'} · {log.date}</small>
      </button>)}
    </div>
  </div>
}

function LogInspector({ log, index }: { log?: BlogPost; index: number }) {
  if (!log) return <MechanicalPanel variant="technical" className="log-inspector"><TechnicalLabel prefix="INSPECTOR">EMPTY</TechnicalLabel><p className="body-small">No engineering log is currently selected.</p></MechanicalPanel>
  return <MechanicalPanel variant="highlighted" className="log-inspector" aria-labelledby="inspector-title" aria-live="polite">
    <div className="log-inspector__top"><TechnicalLabel prefix="INSPECT">LOG / {String(index + 1).padStart(3, '0')}</TechnicalLabel><SystemIndicator state="active" label="SELECTED" /></div>
    <span className="technical-small">DOCUMENTATION / INDEXED</span><h2 id="inspector-title">{log.title}</h2><p className="body-small">{log.excerpt}</p>
    <div className="log-inspector__data">{log.category && <span>CATEGORY<strong>{log.category}</strong></span>}<span>DATE<strong>{log.date}</strong></span>{log.author && <span>AUTHOR<strong>{log.author}</strong></span>}{log.readTime && <span>READ<strong>{log.readTime}</strong></span>}</div>
    <TechnicalDivider label="DOCUMENT STATE" />
    <div className="log-inspector__state"><span>INDEXED</span><span>SELECTED</span><span>ROUTE / CONTENT READY</span></div>
    <span className="technical-small log-inspector__selection-state">SELECTED LOG / INSPECTOR SYNC</span>
  </MechanicalPanel>
}
