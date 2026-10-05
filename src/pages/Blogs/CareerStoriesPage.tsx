import { Link } from 'react-router-dom'
import { CursorTarget } from '../../components/interaction/CursorTarget'
import { EngineeringGrid } from '../../components/mechanical/EngineeringGrid'
import { TechnicalDivider } from '../../components/mechanical/TechnicalDivider'
import './blogs.css'
import { careerStories } from '../../data/careerStories'
import { CareerStoryCard } from '../../components/blogs/CareerStoryCard'

type StoryTrack = 'internships' | 'placements'

const content: Record<
  StoryTrack,
  {
    number: string
    label: string
    accentLabel: string
    title: string
    subtitle: string
    description: string
    focus: string
    what: string
    stages: { number: string; label: string; detail: string; icon: string }[]
    stat1: { value: string; label: string }
    stat2: { value: string; label: string }
    stat3: { value: string; label: string }
    cta: string
  }
> = {
  placements: {
    number: '01',
    label: 'PLACEMENT STORIES',
    accentLabel: 'CAREER TRANSITIONS',
    title: 'FROM CAMPUS\nTO ROLE.',
    subtitle: 'First-hand accounts of the placement journey — preparation, process, and what came after.',
    description:
      'A place for students to document the transition into their first role, with useful context for those preparing for the same path. These are real accounts, not curated success narratives.',
    focus: 'FIRST-HAND NOTES / PERSONAL CHOICES / NO EDITORIAL CLAIMS',
    what: 'What did the process actually look like? What helped — and what did not? These stories focus on honest, useful detail: the preparation strategies that worked, the interview experiences that surprised, and the first weeks that shaped the role.',
    stages: [
      { number: '01', label: 'PREPARE', detail: 'What helped you prepare with intent — and what was noise?', icon: '◈' },
      { number: '02', label: 'NAVIGATE', detail: 'What was the actual recruitment process like, step by step?', icon: '◉' },
      { number: '03', label: 'BEGIN', detail: 'What did starting the role teach you about the preparation?', icon: '◇' },
    ],
    stat1: { value: 'OPEN', label: 'Story Queue' },
    stat2: { value: 'ALL SECTORS', label: 'Coverage' },
    stat3: { value: 'IIT INDORE', label: 'Community' },
    cta: 'SHARE YOUR PLACEMENT EXPERIENCE',
  },
  internships: {
    number: '02',
    label: 'INTERNSHIP STORIES',
    accentLabel: 'STUDENT FIELD NOTES',
    title: 'LEARNING IN\nTHE FIELD.',
    subtitle: 'Real notes from students who found an opportunity, did the work, and came back with something to say.',
    description:
      'A space for students to share an internship experience in their own words — from the first search to the work that stayed with them. No polished PR, just honest field notes.',
    focus: 'FIRST-HAND NOTES / PRACTICAL CONTEXT / NO EDITORIAL CLAIMS',
    what: 'What was the internship actually like once you were there? These stories cover the search, the adjustment, the work itself, and the lessons that transferred back to campus — or did not.',
    stages: [
      { number: '01', label: 'FIND', detail: 'How did the opportunity take shape — applications, referrals, cold outreach?', icon: '◈' },
      { number: '02', label: 'BUILD', detail: 'What did the work, team, and environment teach you about engineering?', icon: '◉' },
      { number: '03', label: 'PASS ON', detail: 'What should the next student looking for a similar role know?', icon: '◇' },
    ],
    stat1: { value: 'OPEN', label: 'Story Queue' },
    stat2: { value: 'INDUSTRY + RESEARCH', label: 'Coverage' },
    stat3: { value: 'IIT INDORE', label: 'Community' },
    cta: 'SHARE YOUR INTERNSHIP EXPERIENCE',
  },
}

export function CareerStoriesPage({ track }: { track: StoryTrack }) {
  const page = content[track]

  return (
    <div className="career-stories">
      <EngineeringGrid className="career-stories__grid" size={40} opacity={0.032} />

      {/* ── Hero ── */}
      <section className="cs-hero page-container" aria-labelledby="story-title">
        <div className="cs-hero__topbar">
          <div className="cs-hero__breadcrumb">
            <CursorTarget intent="link" label="BACK">
              <Link className="cs-back-link" to="/blogs">
                ← MECHESA STORIES
              </Link>
            </CursorTarget>
            <span className="cs-hero__breadcrumb-sep">/</span>
            <span className="cs-hero__breadcrumb-current">{page.label}</span>
          </div>
          <span className="cs-hero__track-badge">{page.accentLabel}</span>
        </div>

        <div className="cs-hero__body">
          <div className="cs-hero__left">
            <span className="cs-hero__number">{page.number}</span>
            <div>
              <span className="cs-hero__eyebrow">MECHESA / CAREER FIELD NOTES</span>
              <h1 id="story-title" className="cs-hero__title">
                {page.title.split('\n').map((line, i) => (
                  <span key={i}>
                    {i === 1 ? <em>{line}</em> : line}
                    {i === 0 && <br />}
                  </span>
                ))}
              </h1>
              <p className="cs-hero__subtitle">{page.subtitle}</p>
            </div>
          </div>

          <div className="cs-hero__right">
            <div className="cs-stat-strip">
              {[page.stat1, page.stat2, page.stat3].map((s) => (
                <div key={s.label} className="cs-stat-strip__item">
                  <strong>{s.value}</strong>
                  <span>{s.label}</span>
                </div>
              ))}
            </div>
            <p className="cs-hero__desc">{page.description}</p>
            <div className="cs-hero__focus-tag">{page.focus}</div>
          </div>
        </div>
      </section>

      <main className="career-stories__main page-container">

        {/* ── What These Stories Cover ── */}
        <div className="cs-what-section">
          <TechnicalDivider label="WHAT THESE STORIES COVER" />
          <div className="cs-what-inner">
            <p className="cs-what-text">{page.what}</p>
          </div>
        </div>

        {/* ── Journey Stages ── */}
        <div className="cs-stages-section">
          <TechnicalDivider label="THE THREE STAGES" />
          <div className="cs-stages-grid">
            {page.stages.map((stage, i) => (
              <article key={stage.label} className="cs-stage-card">
                <div className="cs-stage-card__connector" aria-hidden="true">
                  {i < page.stages.length - 1 && <span className="cs-stage-card__line" />}
                </div>
                <div className="cs-stage-card__top">
                  <span className="cs-stage-card__icon" aria-hidden="true">{stage.icon}</span>
                  <span className="cs-stage-card__num">{stage.number}</span>
                </div>
                <h3 className="cs-stage-card__label">{stage.label}</h3>
                <p className="cs-stage-card__detail">{stage.detail}</p>
              </article>
            ))}
          </div>
        </div>

        {/* ── Empty State / Story Board ── */}
        <section className="cs-empty-section" aria-labelledby="cs-empty-title">

        {/* ── Story Grid ── */}
        <div className="cs-grid-section">
          <TechnicalDivider label="PUBLISHED FIELD NOTES" />
          
          <div className="cs-card-grid">
            {careerStories.filter(s => s.track === track).map(story => (
              <CareerStoryCard key={story.id} story={story} />
            ))}
          </div>
          
          {careerStories.filter(s => s.track === track).length === 0 && (
            <div className="cs-empty-inner">
              <div className="cs-empty-aside">
                <span className="cs-empty-index" aria-hidden="true">{page.number}</span>
                <div className="cs-empty-status">
                  <span className="cs-empty-status__dot" aria-hidden="true" />
                  <span>STORY QUEUE — OPEN</span>
                </div>
              </div>
              <div className="cs-empty-content">
                <span className="cs-eyebrow">NEXT CONTRIBUTOR</span>
                <h2 id="cs-empty-title" className="cs-empty-title">
                  MAKE THE PATH<br /><em>MORE VISIBLE.</em>
                </h2>
                <p className="cs-empty-desc">
                  Published stories will appear here after they are shared by their contributors.
                  Until then, this is an intentionally honest, ready-to-fill space — not a made-up success story.
                </p>
                <div className="cs-empty-actions">
                  <CursorTarget intent="link" label="CONNECT">
                    <Link className="mechanical-button mechanical-button--primary label" to="/contact">
                      <span>{page.cta}</span> <span className="btn-arrow" aria-hidden="true">↗</span>
                    </Link>
                  </CursorTarget>
                  <span className="cs-empty-note">Open to all IIT Indore mechanical students.</span>
                </div>
              </div>
            </div>
          )}
        </div>

        </section>

        {/* ── Cross-link to other track ── */}
        <div className="cs-crosslink">
          <TechnicalDivider label="OTHER CAREER TRACK" />
          <div className="cs-crosslink__inner">
            <div>
              <span className="cs-eyebrow">
                {track === 'placements' ? 'TRACK 02 // INTERNSHIPS' : 'TRACK 01 // PLACEMENTS'}
              </span>
              <h3 className="cs-crosslink__title">
                {track === 'placements' ? 'INTERNSHIP STORIES' : 'PLACEMENT STORIES'}
              </h3>
              <p className="cs-crosslink__desc">
                {track === 'placements'
                  ? 'Notes on finding opportunities, joining engineering teams, and learning from real projects.'
                  : 'Experiences from preparing for recruitment, navigating interviews, and stepping into a first role.'}
              </p>
            </div>
            <Link
              to={track === 'placements' ? '/blogs/internships' : '/blogs/placements'}
              className="mechanical-button mechanical-button--primary label"
            >
              <span>{track === 'placements' ? 'EXPLORE INTERNSHIPS' : 'EXPLORE PLACEMENTS'}</span>
              <span className="btn-arrow" aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>

      </main>
    </div>
  )
}
