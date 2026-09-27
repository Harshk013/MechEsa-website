import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { EngineeringGrid } from '../../components/mechanical/EngineeringGrid'
import { TechnicalDivider } from '../../components/mechanical/TechnicalDivider'
import { SystemIndicator } from '../../components/telemetry/SystemIndicator'
import { MechanicalButton } from '../../components/mechanical/MechanicalButton'
import { CursorTarget } from '../../components/interaction/CursorTarget'
import './contact.css'

interface FormValues {
  name: string
  email: string
  subject: string
  message: string
}

type FormErrors = Partial<Record<keyof FormValues, string>>

const initialValues: FormValues = {
  name: '',
  email: '',
  subject: '',
  message: '',
}

export function ContactPage() {
  const [values, setValues] = useState<FormValues>(initialValues)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isValidated, setIsValidated] = useState<boolean>(false)

  const validate = (): boolean => {
    const nextErrors: FormErrors = {}
    if (!values.name.trim()) {
      nextErrors.name = 'Full name is required.'
    }
    if (!values.email.trim()) {
      nextErrors.email = 'Email address is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      nextErrors.email = 'Please provide a valid email format (e.g. name@domain.com).'
    }
    if (!values.message.trim()) {
      nextErrors.message = 'Please include a message.'
    } else if (values.message.trim().length < 10) {
      nextErrors.message = 'Message must be at least 10 characters.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (validate()) {
      setIsValidated(true)
    }
  }

  const handleChange = (field: keyof FormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
    if (isValidated) {
      setIsValidated(false)
    }
  }

  const handleReset = () => {
    setValues(initialValues)
    setErrors({})
    setIsValidated(false)
  }

  const mailtoUrl = `mailto:?subject=${encodeURIComponent(
    values.subject ? `[MechESA Inquiry] ${values.subject}` : '[MechESA Inquiry] Contact Form Message'
  )}&body=${encodeURIComponent(
    `From: ${values.name} (${values.email})\n\nMessage:\n${values.message}`
  )}`

  return (
    <div className="contact-page">
      <EngineeringGrid className="contact-page__grid" size={40} opacity={0.03} />

      {/* ─── Hero Section ─── */}
      <section className="contact-hero page-container" aria-labelledby="contact-hero-title">
        <div className="contact-hero__meta">
          <span className="page-eyebrow">MECHESA // COMMUNICATION & INQUIRIES</span>
          <SystemIndicator state="online" label="COMMUNICATION READY" />
        </div>
        <div className="contact-hero__content">
          <div>
            <span className="technical-small">STUDENT ASSOCIATION // IIT INDORE</span>
            <h1 id="contact-hero-title" className="page-heading">
              GET IN TOUCH.
            </h1>
            <p className="contact-hero__desc">
              Have questions about upcoming workshops, student technical projects, department collaborations, or wanting to connect with the MechESA team? Reach out below.
            </p>
          </div>
          <div className="contact-hero__status-card">
            <span>OFFICIAL DESK</span>
            <strong>MECHESA COUNCIL</strong>
            <span style={{ color: 'var(--color-text-dim)', fontSize: '9px' }}>
              DEPT. OF MECHANICAL ENGINEERING // IIT INDORE
            </span>
          </div>
        </div>
      </section>

      <main className="page-container">
        <div className="contact-main-layout">
          {/* ─── Contact Directory ─── */}
          <aside className="contact-info-panel" aria-labelledby="contact-directory-title">
            <div className="contact-info-panel__intro">
              <span className="page-eyebrow">01 // DIRECTORY</span>
              <h2 id="contact-directory-title">CHANNELS & DESK.</h2>
              <p>Direct routes to the MechESA team and department coordinators.</p>
            </div>

            <div className="contact-channel-list">
              <div className="contact-channel-card">
                <div className="contact-channel-card__head">
                  <span>CHANNEL // 01</span>
                  <SystemIndicator state="online" label="OFFICIAL" />
                </div>
                <h3>Official Email</h3>
                <p>
                  Official MechESA inquiries, student submissions, and formal correspondence.
                </p>
                <div className="contact-channel-card__meta">
                  <span>ENDPOINT // mechesa@iiti.ac.in (Council Desk)</span>
                </div>
              </div>

              <div className="contact-channel-card">
                <div className="contact-channel-card__head">
                  <span>CHANNEL // 02</span>
                  <SystemIndicator state="idle" label="LOCATION" />
                </div>
                <h3>Physical Department</h3>
                <p>
                  Department of Mechanical Engineering, Chromium Building / Workshops, IIT Indore, Simrol, Khandwa Road, Indore 453552.
                </p>
                <div className="contact-channel-card__meta">
                  <span>CAMPUS // IIT INDORE (SIMROL)</span>
                </div>
              </div>

              <div className="contact-channel-card">
                <div className="contact-channel-card__head">
                  <span>CHANNEL // 03</span>
                  <SystemIndicator state="idle" label="PUBLICATIONS" />
                </div>
                <h3>Articles & Projects</h3>
                <p>
                  Want to submit an engineering log or career reflection? Submit through our form or reach out to division heads directly.
                </p>
                <div className="contact-channel-card__meta">
                  <span>REVIEW // MECHESA EDITORIAL</span>
                </div>
              </div>
            </div>
          </aside>

          {/* ─── Contact Form ─── */}
          <section className="contact-form-panel" aria-labelledby="contact-form-title">
            <div className="contact-form-panel__head">
              <div>
                <span className="page-eyebrow" style={{ marginBottom: 0 }}>
                  02 // DIRECT MESSAGE
                </span>
                <h2 id="contact-form-title" style={{ margin: '0.4rem 0 0', fontSize: '1.75rem' }}>
                  SEND A MESSAGE.
                </h2>
              </div>
              <SystemIndicator
                state={isValidated ? 'processing' : 'online'}
                label={isValidated ? 'VALIDATED' : 'READY'}
              />
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="contact-form-grid">
                <div className={`contact-field${errors.name ? ' has-error' : ''}`}>
                  <label htmlFor="contact-name">
                    FULL NAME <span>REQUIRED</span>
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    placeholder="e.g. Aditi Sharma"
                    value={values.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? 'contact-name-error' : undefined}
                    autoComplete="name"
                  />
                  {errors.name && (
                    <span id="contact-name-error" className="contact-field__error" role="alert">
                      {errors.name}
                    </span>
                  )}
                </div>

                <div className={`contact-field${errors.email ? ' has-error' : ''}`}>
                  <label htmlFor="contact-email">
                    EMAIL ADDRESS <span>REQUIRED</span>
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    placeholder="e.g. aditi@iiti.ac.in"
                    value={values.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? 'contact-email-error' : undefined}
                    autoComplete="email"
                  />
                  {errors.email && (
                    <span id="contact-email-error" className="contact-field__error" role="alert">
                      {errors.email}
                    </span>
                  )}
                </div>

                <div className="contact-field contact-field--full">
                  <label htmlFor="contact-subject">
                    SUBJECT <span>OPTIONAL</span>
                  </label>
                  <input
                    id="contact-subject"
                    name="subject"
                    type="text"
                    placeholder="e.g. Workshop inquiry / Project collaboration"
                    value={values.subject}
                    onChange={(e) => handleChange('subject', e.target.value)}
                    autoComplete="off"
                  />
                </div>

                <div className={`contact-field contact-field--full${errors.message ? ' has-error' : ''}`}>
                  <label htmlFor="contact-message">
                    MESSAGE <span>REQUIRED</span>
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={5}
                    placeholder="Write your message, feedback, or inquiry here..."
                    value={values.message}
                    onChange={(e) => handleChange('message', e.target.value)}
                    aria-invalid={Boolean(errors.message)}
                    aria-describedby={errors.message ? 'contact-message-error' : undefined}
                  />
                  {errors.message && (
                    <span id="contact-message-error" className="contact-field__error" role="alert">
                      {errors.message}
                    </span>
                  )}
                </div>
              </div>

              {!isValidated && (
                <div className="contact-form__submit-bar">
                  <p className="contact-form__submit-note">
                    Required fields: Full Name, Valid Email, and Message.
                  </p>
                  <MechanicalButton variant="primary" type="submit">
                    VERIFY & PREPARE MESSAGE →
                  </MechanicalButton>
                </div>
              )}
            </form>

            {/* ─── Honest Validation / Prepared State Notice ─── */}
            {isValidated && (
              <div className="contact-submission-notice" role="status" aria-live="polite">
                <div className="contact-submission-notice__top">
                  <span className="technical-small" style={{ color: 'var(--color-blueprint)' }}>
                    PAYLOAD VALIDATED // READY TO TRANSMIT
                  </span>
                  <SystemIndicator state="processing" label="ACTION REQUIRED" />
                </div>
                <h3>MESSAGE READY FOR MECHESA DESK</h3>
                <p>
                  Your message has been verified and structured locally. Since this website runs without a live backend email relay server, your message was not transmitted via an API. To ensure your message reaches MechESA, click below to open your email client pre-filled with this message.
                </p>
                <div className="contact-submission-notice__actions">
                  <a
                    href={mailtoUrl}
                    className="mechanical-button mechanical-button--primary label"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    SEND VIA EMAIL CLIENT (MAILTO) ↗
                  </a>
                  <MechanicalButton variant="secondary" onClick={handleReset}>
                    RESET / EDIT MESSAGE
                  </MechanicalButton>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* ─── Quick Route Links ─── */}
        <section className="contact-handoff" aria-labelledby="contact-handoff-title">
          <TechnicalDivider label="SYSTEM ROUTES" />
          <div style={{ marginTop: '2rem' }}>
            <span className="page-eyebrow">EXPLORE MORE OF MECHESA</span>
            <h2 id="contact-handoff-title" className="page-heading">
              KEEP EXPLORING.
            </h2>
          </div>
          <div className="contact-handoff__grid">
            <CursorTarget intent="link" label="OPEN">
              <Link to="/" className="contact-handoff-link">
                <span>RETURN TO HOME</span>
                <b>↗</b>
              </Link>
            </CursorTarget>
            <CursorTarget intent="link" label="OPEN">
              <Link to="/events" className="contact-handoff-link">
                <span>EXPLORE EVENTS</span>
                <b>↗</b>
              </Link>
            </CursorTarget>
            <CursorTarget intent="link" label="OPEN">
              <Link to="/team" className="contact-handoff-link">
                <span>MEET THE TEAM</span>
                <b>↗</b>
              </Link>
            </CursorTarget>
            <CursorTarget intent="link" label="OPEN">
              <Link to="/blogs" className="contact-handoff-link">
                <span>READ STORIES</span>
                <b>↗</b>
              </Link>
            </CursorTarget>
          </div>
        </section>
      </main>
    </div>
  )
}
