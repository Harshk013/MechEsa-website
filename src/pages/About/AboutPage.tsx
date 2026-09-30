import { Link } from 'react-router-dom'
import { aboutActivities, aboutDisciplines } from '../../data/about'
import { EngineeringGrid } from '../../components/mechanical/EngineeringGrid'
import { SystemIndicator } from '../../components/telemetry/SystemIndicator'
import { CursorTarget } from '../../components/interaction/CursorTarget'
import './about.css'

export function AboutPage() {
  return (
    <div className="about-page">
      <EngineeringGrid className="about-page__grid" size={40} opacity={0.03} />

      {/* ─── Hero Section ─── */}
      <section className="about-hero page-container" aria-labelledby="about-hero-title">
        <div className="about-hero__meta">
          <span className="page-eyebrow">MECHESA // STUDENT ASSOCIATION</span>
          <SystemIndicator state="online" label="ASSOCIATION ACTIVE" />
        </div>

        <div className="about-hero__content">
          <div>
            <span className="technical-small">DEPARTMENT OF MECHANICAL ENGINEERING // IIT INDORE</span>
            <h1 id="about-hero-title" className="page-heading">ABOUT MECHESA.</h1>
            <p className="about-hero__desc">
              MechESA is the student association for Mechanical Engineering at IIT Indore.
              We bring students together through technical events, workshops, industry visits,
              and activities that help us explore mechanical engineering beyond the classroom.
            </p>
          </div>

          <div className="about-hero__badge">
            <span className="badge-tag">IIT INDORE // MECHESA</span>
            <strong className="badge-title">STUDENT ASSOCIATION</strong>
            <span className="badge-sub">EVENTS • WORKSHOPS • INDUSTRY EXPOSURE</span>
          </div>
        </div>
      </section>

      <main className="page-container">
        {/* ─── 01 Our Purpose & What We Do ─── */}
        <section className="about-section" aria-labelledby="purpose-section-title">
          <div className="about-section-head">
            <div className="about-section-head__title-group">
              <span className="page-eyebrow">01 // OUR PURPOSE</span>
              <h2 id="purpose-section-title">WHAT WE DO.</h2>
              <p>
                MechESA creates opportunities for Mechanical Engineering students to learn, participate,
                connect with industry, and explore different areas of mechanical engineering outside the classroom.
              </p>
            </div>
          </div>

          <div className="about-activities-grid">
            {aboutActivities.map((activity) => (
              <div key={activity.id} className="about-activity-card">
                <div className="activity-card__header">
                  <span className="activity-card__idx">{activity.index}</span>
                  <span className="activity-card__tag">{activity.tag}</span>
                </div>
                <h3 className="activity-card__title">{activity.title}</h3>
                <span className="activity-card__sub">{activity.subtitle}</span>
                <p className="activity-card__desc">{activity.description}</p>
                <span className="corner-bracket corner-bracket--bl" aria-hidden="true" />
              </div>
            ))}
          </div>
        </section>

        {/* ─── 02 Areas of Mechanical Engineering ─── */}
        <section className="about-section" aria-labelledby="disciplines-section-title">
          <div className="about-section-head">
            <div className="about-section-head__title-group">
              <span className="page-eyebrow">02 // DISCIPLINES</span>
              <h2 id="disciplines-section-title">AREAS OF MECHANICAL ENGINEERING.</h2>
              <p>
                Mechanical Engineering covers a wide range of fields. MechESA provides a space for students
                to explore these areas through events, sessions, workshops, and industry exposure.
              </p>
            </div>
          </div>

          <div className="about-disciplines-grid">
            {aboutDisciplines.map((item) => (
              <div key={item.id} className="about-discipline-card">
                <div className="discipline-card__header">
                  <span className="discipline-card__idx">FIELD // {item.index}</span>
                  <span className="discipline-card__tag">{item.tag}</span>
                </div>
                <h3 className="discipline-card__title">{item.title}</h3>
                <p className="discipline-card__desc">{item.description}</p>
                <div className="discipline-card__footer">
                  <Link
                    to={`/lab/${item.id}`}
                    className="discipline-card__link"
                    aria-label={`Explore ${item.title} simulation in Mech Lab`}
                  >
                    <span>EXPLORE IN LAB</span>
                    <i aria-hidden="true" className="btn-arrow">→</i>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── 03 Community & Getting Involved ─── */}
        <section className="about-section" aria-labelledby="community-section-title">
          <div className="about-section-head">
            <div className="about-section-head__title-group">
              <span className="page-eyebrow">03 // GET INVOLVED</span>
              <h2 id="community-section-title">JOIN THE COMMUNITY.</h2>
              <p>
                Whether you want to attend a workshop, join an event, or connect with peers across batches,
                MechESA is open to all mechanical engineering students at IIT Indore.
              </p>
            </div>
          </div>

          <div className="about-connect-grid">
            <CursorTarget label="VIEW" intent="view" className="about-connect-card-wrap">
              <Link to="/events" className="about-connect-card">
                <div className="connect-card__header">
                  <span className="connect-card__num">01 //</span>
                  <span className="connect-card__tag">ACTIVITIES</span>
                </div>
                <strong className="connect-card__title">EVENTS & WORKSHOPS</strong>
                <p className="connect-card__desc">
                  See upcoming technical conclaves, guest lectures, hands-on workshops, and calendar events.
                </p>
                <span className="connect-card__action">
                  <span>VIEW EVENTS</span> <span className="btn-arrow" aria-hidden="true">→</span>
                </span>
              </Link>
            </CursorTarget>

            <CursorTarget label="MEET" intent="view" className="about-connect-card-wrap">
              <Link to="/team" className="about-connect-card">
                <div className="connect-card__header">
                  <span className="connect-card__num">02 //</span>
                  <span className="connect-card__tag">DIRECTORY</span>
                </div>
                <strong className="connect-card__title">THE TEAM & COUNCIL</strong>
                <p className="connect-card__desc">
                  Meet the student coordinators, division leads, and faculty advisors behind MechESA.
                </p>
                <span className="connect-card__action">
                  <span>MEET THE TEAM</span> <span className="btn-arrow" aria-hidden="true">→</span>
                </span>
              </Link>
            </CursorTarget>

            <CursorTarget label="CONNECT" intent="button" className="about-connect-card-wrap">
              <Link to="/contact" className="about-connect-card about-connect-card--highlight">
                <div className="connect-card__header">
                  <span className="connect-card__num">03 //</span>
                  <span className="connect-card__tag">COMMUNICATION</span>
                </div>
                <strong className="connect-card__title">CONNECT WITH US</strong>
                <p className="connect-card__desc">
                  Have a question, an idea for an activity, or want to collaborate with the association? Get in touch.
                </p>
                <span className="connect-card__action">
                  <span>GET IN TOUCH</span> <span className="btn-arrow" aria-hidden="true">↗</span>
                </span>
              </Link>
            </CursorTarget>
          </div>
        </section>
      </main>
    </div>
  )
}
