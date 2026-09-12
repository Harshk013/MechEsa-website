import { Link } from 'react-router-dom'
import { navigation, site } from '../../data/site'
import { CursorTarget } from '../interaction/CursorTarget'
import { TechnicalDivider } from '../mechanical/TechnicalDivider'
import { TechnicalLabel } from '../typography/TechnicalLabel'
import './siteFooter.css'

export function SiteFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer" aria-labelledby="site-footer-title">
      <div className="page-container">
        <TechnicalDivider label="SYSTEM SHUTDOWN / 10" />
        <div className="site-footer__grid">
          <div className="site-footer__identity">
            <TechnicalLabel prefix="MECHESA">ENGINEERED MOTION</TechnicalLabel>
            <h2 id="site-footer-title">THE SYSTEM<br /><em>SETTLES.</em></h2>
            <p className="body-small">A mechanical engineering interface for exploring the MechESA experience.</p>
          </div>

          <nav className="site-footer__nav" aria-label="Footer navigation">
            <span className="technical-small">SYSTEM ROUTES</span>
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
            <div className="site-footer__meta">
              <span>MECHESA / {site.institute.toUpperCase()}</span>
              <span>© {year} / ENGINEERED MOTION</span>
            </div>
          </div>
        </div>
        <div className="site-footer__base">
          <span className="technical-small">FEATURE DEVELOPMENT COMPLETE</span>
          <span className="technical-small">SYSTEM / OFFLINE</span>
        </div>
      </div>
    </footer>
  )
}
