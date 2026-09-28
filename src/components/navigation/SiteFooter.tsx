import { Link } from 'react-router-dom'
import { navigation, site } from '../../data/site'
import { CursorTarget } from '../interaction/CursorTarget'
import { TechnicalDivider } from '../mechanical/TechnicalDivider'
import { TechnicalLabel } from '../typography/TechnicalLabel'
import { RepresentationToggle } from '../system/RepresentationToggle/RepresentationToggle'
import './siteFooter.css'

export function SiteFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer" aria-labelledby="site-footer-title">
      <div className="page-container">
        <TechnicalDivider label="MECHESA // IIT INDORE" />
        <div className="site-footer__grid">
          <div className="site-footer__identity">
            <TechnicalLabel prefix="MECHESA">STUDENT ASSOCIATION</TechnicalLabel>
            <h2 id="site-footer-title">MECH-E<br /><em>COMMUNITY.</em></h2>
            <p className="body-small">The official student association for Mechanical Engineering at IIT Indore.</p>
          </div>

          <nav className="site-footer__nav" aria-label="Footer navigation">
            <span className="technical-small">NAVIGATION</span>
            {navigation.map((item, index) => (
              <CursorTarget key={item.path} label="OPEN" intent="link">
                <Link to={item.path}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <strong>{item.label}</strong>
                  <i aria-hidden="true">↗</i>
                </Link>
              </CursorTarget>
            ))}
          </nav>

          <div className="site-footer__controls">
            <span className="technical-small">THEME VOCABULARY</span><RepresentationToggle />
            <div className="site-footer__meta">
              <span>MECHESA / {site.institute.toUpperCase()}</span>
              <span>© {year} / STUDENT ASSOCIATION</span>
            </div>
          </div>
        </div>
        <div className="site-footer__base">
          <span className="technical-small">DEPARTMENT OF MECHANICAL ENGINEERING</span>
          <span className="technical-small">IIT INDORE // SIMROL</span>
        </div>
      </div>
    </footer>
  )
}
