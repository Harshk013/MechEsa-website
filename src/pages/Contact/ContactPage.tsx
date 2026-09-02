import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { contactChannels, contactFlowNodes, type ContactChannel } from '../../data/contact'
import { CursorTarget } from '../../components/interaction/CursorTarget'
import { EngineeringGrid } from '../../components/mechanical/EngineeringGrid'
import { MechanicalButton } from '../../components/mechanical/MechanicalButton'
import { MechanicalPanel } from '../../components/mechanical/MechanicalPanel'
import { MeasurementMark } from '../../components/mechanical/MeasurementMark'
import { TechnicalCorner } from '../../components/mechanical/TechnicalCorner'
import { TechnicalDivider } from '../../components/mechanical/TechnicalDivider'
import { TechnicalLabel } from '../../components/typography/TechnicalLabel'
import { SystemIndicator } from '../../components/telemetry/SystemIndicator'
import { useMotionSettings } from '../../app/providers/MotionProvider'
import './contact.css'

type FormValues = { name: string; email: string; subject: string; message: string }
type FormErrors = Partial<Record<keyof FormValues, string>>
type SubmitState = 'IDLE' | 'VALIDATING' | 'TRANSMITTING' | 'PREPARED' | 'ERROR'

const initialValues: FormValues = { name: '', email: '', subject: '', message: '' }

export function ContactPage() {
  const pageRef = useRef<HTMLDivElement>(null)
  const [selectedChannel, setSelectedChannel] = useState(contactChannels[0]?.id ?? '')
  const [values, setValues] = useState<FormValues>(initialValues)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitState, setSubmitState] = useState<SubmitState>('IDLE')
  const { reducedMotion } = useMotionSettings()

  useEffect(() => {
    const page = pageRef.current
    if (!page) return
    let raf = 0
    const update = () => {
      raf = 0
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      const progress = Math.min(1, Math.max(0, window.scrollY / max))
      page.style.setProperty('--contact-progress', progress.toFixed(3))
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

  useEffect(() => {
    if (submitState !== 'TRANSMITTING') return
    const timer = window.setTimeout(() => setSubmitState('PREPARED'), reducedMotion ? 80 : 850)
    return () => window.clearTimeout(timer)
  }, [submitState, reducedMotion])

  const validate = () => {
    const next: FormErrors = {}
    if (!values.name.trim()) next.name = 'Name is required.'
    if (!values.email.trim()) next.email = 'Email is required.'
    else if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) next.email = 'Enter a valid email address.'
    if (!values.message.trim()) next.message = 'Message is required.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  useEffect(() => {
    if (submitState !== 'VALIDATING') return
    const timer = window.setTimeout(() => {
      if (!validate()) {
        setSubmitState('ERROR')
        return
      }
      setSubmitState('TRANSMITTING')
    }, reducedMotion ? 0 : 120)
    return () => window.clearTimeout(timer)
  }, [submitState, reducedMotion])

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitState('VALIDATING')
  }

  const updateField = (field: keyof FormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }))
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }))
    if (submitState === 'ERROR' || submitState === 'PREPARED') setSubmitState('IDLE')
  }

  const resetPrepared = () => {
    setValues(initialValues)
    setErrors({})
    setSubmitState('IDLE')
  }

  return (
    <div ref={pageRef} className="contact-page" data-reduced-motion={reducedMotion} data-contact-state={submitState} data-selected-channel={selectedChannel}>
      <EngineeringGrid className="contact-page__grid" size={40} opacity={0.032} />
      <div className="contact-page__axis" aria-hidden="true"><span>07</span><i /><b /></div>

      <section className="contact-hero page-container" aria-labelledby="contact-title">
        <div className="contact-hero__meta"><TechnicalLabel prefix="SYSTEM / 07">CONTROL TERMINAL</TechnicalLabel><SystemIndicator state={submitState === 'ERROR' ? 'warning' : submitState === 'TRANSMITTING' ? 'processing' : 'online'} label={submitState === 'TRANSMITTING' ? 'SIGNAL / ROUTING' : 'CHANNEL / READY'} /></div>
        <div className="contact-hero__layout">
          <div className="contact-hero__copy"><span className="technical-small">MECHESA // ENGINEERED MOTION</span><h1 id="contact-title">OPEN THE<br />CHANNEL.</h1><p>Route a question, collaboration request, project inquiry, or association message through the MechESA communication terminal.</p></div>
          <TerminalInstrument state={submitState} />
        </div>
        <div className="contact-hero__foot"><MeasurementMark value="TERMINAL / CT—01" /><span className="technical-small">COMMUNICATION / CONTROL</span><MeasurementMark value="REF / 07" orientation="vertical" /></div>
      </section>

      <main>
        <section className="contact-channels page-container contact-section" aria-labelledby="channels-title">
          <div className="contact-section-head"><TechnicalLabel prefix="02">AVAILABLE CHANNELS</TechnicalLabel><h2 id="channels-title">SIGNAL REGISTRY.</h2><p>Official communication destinations are not present in the current project data, so the channel registry is intentionally content-ready rather than fabricated.</p></div>
          <div className="channel-matrix" role="list" aria-label="Available communication channels">
            {contactChannels.map((channel) => <ContactChannelNode key={channel.id} channel={channel} selected={selectedChannel === channel.id} onSelect={() => setSelectedChannel(channel.id)} />)}
          </div>
          <MechanicalPanel variant="technical" className="channel-inspector" aria-live="polite"><div><TechnicalLabel prefix="CHANNEL INSPECTOR">{selectedChannel || 'NONE'}</TechnicalLabel><h3>{contactChannels.find((channel) => channel.id === selectedChannel)?.title ?? 'NO CHANNEL'}</h3></div><div className="channel-inspector__detail"><SystemIndicator state="idle" label={contactChannels.find((channel) => channel.id === selectedChannel)?.status ?? 'CONTENT / READY'} /><p>{contactChannels.find((channel) => channel.id === selectedChannel)?.description}</p></div></MechanicalPanel>
        </section>

        <section className="contact-terminal page-container contact-section" aria-labelledby="terminal-title">
          <TechnicalDivider label="03 / MESSAGE TERMINAL" />
          <div className="terminal-layout">
            <div className="terminal-intro"><TechnicalLabel prefix="PAYLOAD">MESSAGE TERMINAL</TechnicalLabel><h2 id="terminal-title">PREPARE THE<br />MESSAGE.</h2><p>Complete the required fields below. Submission is local until an official MechESA endpoint is connected.</p><div className="terminal-diagnostics"><span>INPUT <b>READY</b></span><span>VALIDATION <b>LOCAL</b></span><span>ENDPOINT <b>CONTENT / READY</b></span></div></div>
            <MessageTerminal values={values} errors={errors} state={submitState} onSubmit={submit} onChange={updateField} onReset={resetPrepared} />
          </div>
        </section>

        <section className="contact-routing page-container contact-section" aria-labelledby="routing-title">
          <div className="contact-section-head"><TechnicalLabel prefix="04">SIGNAL ROUTING</TechnicalLabel><h2 id="routing-title">FROM PAYLOAD<br />TO RESPONSE.</h2><p>CONCEPTUAL MESSAGE FLOW — this diagram describes the interface metaphor, not a claimed MechESA organizational workflow.</p></div>
          <SignalRouting active={submitState === 'TRANSMITTING' || submitState === 'PREPARED'} reducedMotion={reducedMotion} />
        </section>

        <section className="contact-ack page-container contact-section" aria-labelledby="ack-title">
          <MechanicalPanel variant="blueprint" className={`ack-panel${submitState === 'PREPARED' ? ' is-prepared' : ''}`}>
            <TechnicalCorner />
            <div className="ack-panel__mark" aria-hidden="true">ACK</div>
            <div className="ack-panel__copy"><TechnicalLabel prefix="05 / TRANSMISSION STATUS">{submitState === 'PREPARED' ? 'PAYLOAD / READY' : 'READY FOR HUMAN CONNECTION'}</TechnicalLabel><h2 id="ack-title">{submitState === 'PREPARED' ? 'PAYLOAD PREPARED.' : 'READY FOR HUMAN CONNECTION.'}</h2><p>{submitState === 'PREPARED' ? 'Your message has been prepared locally. Connect this terminal to the official MechESA submission endpoint when available.' : 'Official communication details are ready to be inserted into the channel registry.'}</p></div>
            <SystemIndicator state={submitState === 'PREPARED' ? 'active' : 'idle'} label={submitState === 'PREPARED' ? 'PREPARED' : 'CONTENT / READY'} />
          </MechanicalPanel>
        </section>

        <section className="contact-handoff page-container contact-section" aria-labelledby="handoff-title">
          <TechnicalDivider label="06 / SYSTEM HANDOFF" />
          <div className="contact-handoff__inner"><div><TechnicalLabel prefix="RETURN TO MACHINE">SYSTEM ROUTES</TechnicalLabel><h2 id="handoff-title">KEEP<br />MOVING.</h2><p>Continue through the MechESA machine.</p></div><nav className="contact-handoff__routes" aria-label="MechESA system routes"><HandoffLink to="/" label="RETURN TO SYSTEM CORE" /><HandoffLink to="/events" label="EXPLORE EVENTS" /><HandoffLink to="/team" label="MEET THE ASSEMBLY" /><HandoffLink to="/blogs" label="READ ENGINEERING LOGS" /></nav></div>
        </section>
      </main>
    </div>
  )
}

function TerminalInstrument({ state }: { state: SubmitState }) {
  return <div className={`terminal-instrument terminal-instrument--${state.toLowerCase()}`} aria-hidden="true"><div className="terminal-instrument__frame"><span className="terminal-reg tl" /><span className="terminal-reg tr" /><span className="terminal-reg bl" /><span className="terminal-reg br" /><div className="terminal-instrument__top"><span>TERMINAL ID / CT—01</span><span>ROUTE / MECHESA</span></div><div className="terminal-instrument__core"><div className="terminal-dial"><i /><b /><span>07</span></div><div className="terminal-signal"><span /><span /><span /><span /></div></div><div className="terminal-instrument__bottom"><span>CHANNEL / 01</span><span>{state === 'TRANSMITTING' ? 'SIGNAL / ROUTING' : state === 'PREPARED' ? 'PAYLOAD / READY' : 'STATUS / STANDBY'}</span></div></div></div>
}

function ContactChannelNode({ channel, selected, onSelect }: { channel: ContactChannel; selected: boolean; onSelect: () => void }) {
  return <CursorTarget intent="view" label="VIEW" className="channel-node-wrap"><button type="button" className={`channel-node${selected ? ' is-selected' : ''}`} onClick={onSelect} aria-pressed={selected} aria-label={`Inspect ${channel.title} channel`}><span className="channel-node__index">CHANNEL / {channel.index}</span><span className="channel-node__signal" aria-hidden="true"><i /></span><strong>{channel.title}</strong><small>{channel.label}</small><b>{channel.destination}</b><em>{channel.status}</em><span className="channel-node__line" aria-hidden="true" /></button></CursorTarget>
}

function MessageTerminal({ values, errors, state, onSubmit, onChange, onReset }: { values: FormValues; errors: FormErrors; state: SubmitState; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onChange: (field: keyof FormValues, value: string) => void; onReset: () => void }) {
  const disabled = state === 'TRANSMITTING' || state === 'VALIDATING'
  return <MechanicalPanel variant="technical" className="message-terminal"><TechnicalCorner /><div className="message-terminal__head"><TechnicalLabel prefix="PAYLOAD">MESSAGE PAYLOAD</TechnicalLabel><SystemIndicator state={state === 'ERROR' ? 'warning' : state === 'TRANSMITTING' ? 'processing' : state === 'PREPARED' ? 'active' : 'idle'} label={state === 'ERROR' ? 'SIGNAL / INVALID' : state === 'TRANSMITTING' ? 'SIGNAL / ROUTING' : state === 'PREPARED' ? 'PAYLOAD / READY' : 'SYSTEM / READY'} /></div><form onSubmit={onSubmit} noValidate aria-describedby="terminal-status"><div className="form-grid"><Field id="name" label="NAME" value={values.name} error={errors.name} disabled={disabled} onChange={(value) => onChange('name', value)} autoComplete="name" /><Field id="email" label="EMAIL" value={values.email} error={errors.email} disabled={disabled} onChange={(value) => onChange('email', value)} autoComplete="email" inputMode="email" /><Field id="subject" label="SUBJECT" value={values.subject} error={errors.subject} disabled={disabled} onChange={(value) => onChange('subject', value)} autoComplete="off" /><Field id="message" label="MESSAGE" value={values.message} error={errors.message} disabled={disabled} onChange={(value) => onChange('message', value)} multiline autoComplete="off" /></div><div className="message-terminal__submit"><p id="terminal-status" aria-live="polite">{state === 'ERROR' ? 'Correct the highlighted fields and retry.' : state === 'TRANSMITTING' ? 'Preparing local transmission sequence.' : state === 'PREPARED' ? 'Payload prepared locally — no network request was made.' : 'Required fields: NAME / EMAIL / MESSAGE'}</p>{state === 'PREPARED' ? <MechanicalButton variant="secondary" type="button" onClick={onReset}>RESET TERMINAL</MechanicalButton> : <MechanicalButton variant="primary" type="submit" disabled={disabled}>{state === 'TRANSMITTING' ? 'TRANSMITTING…' : 'TRANSMIT MESSAGE →'}</MechanicalButton>}</div></form></MechanicalPanel>
}

function Field({ id, label, value, error, disabled, onChange, multiline = false, autoComplete, inputMode }: { id: keyof FormValues; label: string; value: string; error?: string; disabled: boolean; onChange: (value: string) => void; multiline?: boolean; autoComplete?: string; inputMode?: 'email' | 'text' }) {
  const errorId = `${id}-error`
  return <div className={`terminal-field${error ? ' has-error' : ''}`}><label htmlFor={id}>{label}<span>{id === 'subject' ? 'OPTIONAL' : 'REQUIRED'}</span></label>{multiline ? <textarea id={id} name={id} value={value} disabled={disabled} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} onChange={(event) => onChange(event.target.value)} rows={6} autoComplete={autoComplete} /> : <input id={id} name={id} type={id === 'email' ? 'email' : 'text'} value={value} disabled={disabled} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} onChange={(event) => onChange(event.target.value)} autoComplete={autoComplete} inputMode={inputMode} />}{error && <span className="terminal-field__error" id={errorId} role="alert">{error}</span>}</div>
}

function SignalRouting({ active, reducedMotion }: { active: boolean; reducedMotion: boolean }) {
  return <div className={`signal-routing${active ? ' is-active' : ''}${reducedMotion ? ' is-static' : ''}`} aria-label="Conceptual message flow"><div className="signal-routing__line" aria-hidden="true"><span /></div>{contactFlowNodes.map((node, index) => <div className="flow-node" key={node.id}><div className="flow-node__plate"><span>{node.index}</span><i aria-hidden="true" /><strong>{node.title}</strong></div><p>{node.description}</p>{index < contactFlowNodes.length - 1 && <b aria-hidden="true">→</b>}</div>)}</div>
}

function HandoffLink({ to, label }: { to: string; label: string }) {
  return <CursorTarget intent="link" label="OPEN"><Link to={to} className="handoff-link"><span>{label}</span><b>↗</b></Link></CursorTarget>
}
