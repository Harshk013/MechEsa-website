import { Link } from 'react-router-dom'
import { CursorTarget } from '../../components/interaction/CursorTarget'
import { EngineeringGrid } from '../../components/mechanical/EngineeringGrid'
import { TechnicalDivider } from '../../components/mechanical/TechnicalDivider'
import { SystemIndicator } from '../../components/telemetry/SystemIndicator'
import './blogs.css'

const storyTracks = [
  {
    id: 'internships', number: '01', eyebrow: 'FIELD NOTES / INTERNSHIPS', title: <>INTERNSHIP<br /><em>STORIES.</em></>,
    description: 'Notes from students on finding opportunities, joining teams, building useful work and reflecting on what the experience changed.',
    action: 'OPEN INTERNSHIP STORIES', to: '/blogs/internships', details: ['SEARCH / PREPARE', 'WORK / LEARN', 'REFLECT / SHARE'],
  },
  {
    id: 'placements', number: '02', eyebrow: 'FIELD NOTES / PLACEMENTS', title: <>PLACEMENT<br /><em>STORIES.</em></>,
    description: 'Experiences from the transition into a first role: preparation, interview process, decisions and lessons worth passing forward.',
    action: 'OPEN PLACEMENT STORIES', to: '/blogs/placements', details: ['PREPARE / APPLY', 'INTERVIEW / DECIDE', 'BEGIN / GROW'],
  },
] as const

export function BlogsPage() {
  return <div className="career-hub">
    <EngineeringGrid className="career-hub__grid" size={40} opacity={0.032} />
    <section className="career-hub__hero page-container" aria-labelledby="blogs-title">
      <div className="career-hub__topline"><span className="page-eyebrow">ENGINEERING LOGS</span><SystemIndicator state="online" label="READY" /></div>
      <div className="career-hub__intro"><div><span className="technical-small">MECHESA // ENGINEERED MOTION</span><h1 id="blogs-title" className="page-heading">ENGINEERING<br /><em>LOGS.</em></h1></div><p className="page-description">Writing, project notes, and engineering stories.</p></div>
    </section>

    <main className="career-hub__main page-container">
      <TechnicalDivider label="SELECT A LOG CATEGORY" />
      <div className="career-hub__tracks">
        {storyTracks.map((track) => <article className="career-track" key={track.id}>
          <div className="career-track__head"><span>{track.number}</span><span className="page-eyebrow" style={{marginBottom: 0}}>{track.eyebrow}</span></div>
          <div className="career-track__content"><div><h2 className="page-heading">{track.title}</h2><p>{track.description}</p></div><div className="career-track__diagram" aria-hidden="true"><i /><i /><i /><b>{track.number}</b></div></div>
          <div className="career-track__footer"><div>{track.details.map((detail) => <span key={detail}>{detail}</span>)}</div><CursorTarget intent="link" label="OPEN"><Link className="mechanical-button mechanical-button--primary label" to={track.to}>{track.action} ↗</Link></CursorTarget></div>
        </article>)}
      </div>
      <section className="career-hub__contribute" aria-labelledby="contribute-title"><div><span className="page-eyebrow">CONTRIBUTE</span><h2 id="contribute-title" className="page-heading">YOUR EXPERIENCE<br />CAN HELP THE NEXT<br /><em>PERSON MOVE.</em></h2></div><div><p className="page-description">These pages are for first-hand student experiences. Share the practical details, the unexpected parts, and the advice you wish you had before starting.</p><CursorTarget intent="link" label="CONNECT"><Link className="mechanical-button mechanical-button--technical label" to="/contact">SHARE YOUR STORY ↗</Link></CursorTarget></div></section>
    </main>
  </div>
}
