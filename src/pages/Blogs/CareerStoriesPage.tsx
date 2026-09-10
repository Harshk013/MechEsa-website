import { Link } from 'react-router-dom'
import { CursorTarget } from '../../components/interaction/CursorTarget'
import { EngineeringGrid } from '../../components/mechanical/EngineeringGrid'
import { TechnicalDivider } from '../../components/mechanical/TechnicalDivider'
import { TechnicalLabel } from '../../components/typography/TechnicalLabel'
import { SystemIndicator } from '../../components/telemetry/SystemIndicator'
import './blogs.css'

type StoryTrack = 'internships' | 'placements'

const content: Record<StoryTrack, { number: string; label: string; title: string; description: string; focus: string; stages: readonly { label: string; detail: string }[] }> = {
  internships: {
    number: '01', label: 'INTERNSHIP STORIES', title: 'LEARNING IN THE FIELD.', description: 'A space for students to share an internship experience in their own words — from the first search to the work that stayed with them.', focus: 'FIRST-HAND NOTES / PRACTICAL CONTEXT / NO EDITORIAL CLAIMS',
    stages: [{ label: '01 / FIND', detail: 'How did the opportunity take shape?' }, { label: '02 / BUILD', detail: 'What did the work and team teach you?' }, { label: '03 / PASS ON', detail: 'What should the next student know?' }],
  },
  placements: {
    number: '02', label: 'PLACEMENT STORIES', title: 'FROM CAMPUS TO ROLE.', description: 'A place for students to document the transition into their first role, with useful context for those preparing for the same path.', focus: 'FIRST-HAND NOTES / PERSONAL CHOICES / NO EDITORIAL CLAIMS',
    stages: [{ label: '01 / PREPARE', detail: 'What helped you prepare with intent?' }, { label: '02 / NAVIGATE', detail: 'What was useful during the process?' }, { label: '03 / BEGIN', detail: 'What did you learn starting the role?' }],
  },
}

export function CareerStoriesPage({ track }: { track: StoryTrack }) {
  const page = content[track]
  return <div className="career-stories">
    <EngineeringGrid className="career-stories__grid" size={40} opacity={0.032} />
    <section className="career-stories__hero page-container" aria-labelledby="story-title">
      <div className="career-stories__topline"><TechnicalLabel prefix={`BLOGS / ${page.number}`}>{page.label}</TechnicalLabel><SystemIndicator state="online" label="CONTRIBUTIONS / OPEN" /></div>
      <CursorTarget intent="link" label="BACK"><Link className="career-stories__back technical-small" to="/blogs">← ALL CAREER STORIES</Link></CursorTarget>
      <div className="career-stories__intro"><div><span className="technical-small">MECHESA / CAREER FIELD NOTES</span><h1 id="story-title">{page.title}</h1></div><p>{page.description}</p></div>
    </section>
    <main className="career-stories__main page-container">
      <TechnicalDivider label="CONTRIBUTOR GUIDE" />
      <div className="career-stories__board">
        <div className="career-stories__status"><span>STORY QUEUE</span><strong>OPEN</strong><i /><small>{page.focus}</small></div>
        <div className="career-stories__steps">{page.stages.map((stage) => <article key={stage.label}><span>{stage.label}</span><p>{stage.detail}</p><i aria-hidden="true" /></article>)}</div>
      </div>
      <section className="career-stories__empty" aria-labelledby="empty-title"><div className="career-stories__empty-index">{page.number}</div><div><TechnicalLabel prefix="NEXT CONTRIBUTOR">YOUR STORY GOES HERE</TechnicalLabel><h2 id="empty-title">MAKE THE PATH<br /><em>MORE VISIBLE.</em></h2><p>Published stories will appear here after they are shared by their contributors. Until then, this is an intentionally honest, ready-to-fill space — not a made-up success story.</p><CursorTarget intent="link" label="CONNECT"><Link className="mechanical-button mechanical-button--primary label" to="/contact">SHARE YOUR EXPERIENCE ↗</Link></CursorTarget></div></section>
    </main>
  </div>
}
