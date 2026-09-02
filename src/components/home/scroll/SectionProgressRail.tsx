import { useHomeScrollProgress } from './useHomeScrollProgress'
import { HOME_SECTIONS } from './homeScroll.constants'

export function SectionProgressRail() {
  const { snapshot, scrollToSection } = useHomeScrollProgress()
  return <aside className="home-progress-rail" aria-label="Homepage machine progression">
    <span className="home-progress-rail__state">{snapshot.machineState}</span>
    <div className="home-progress-rail__track" aria-hidden="true"><i style={{ transform: `scaleY(${Math.max(snapshot.globalProgress, 0.02)})` }} /></div>
    <ol>{HOME_SECTIONS.slice(0, 8).map(section => <li key={section.id} className={snapshot.activeSection === section.id ? 'is-active' : ''}>
      <button type="button" onClick={() => scrollToSection(section.id)} aria-label={`Go to ${section.number} ${section.name}`}><span>{section.number}</span><b>{section.name}</b></button>
    </li>)}</ol>
  </aside>
}
