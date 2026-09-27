import { Link } from 'react-router-dom'
import type { LabSystemConfig } from '../../../data/mechLab'
import { labSystemsData } from '../../../data/mechLab'
import { usePointer } from '../../interaction/PointerProvider'

interface MechLabSystemHeaderProps {
  system: LabSystemConfig
  mode: 'explore' | 'challenge'
  onModeChange: (mode: 'explore' | 'challenge') => void
}

export function MechLabSystemHeader({
  system,
  mode,
  onModeChange,
}: MechLabSystemHeaderProps) {
  const { setIntent, clearIntent } = usePointer()
  const systemIndex = labSystemsData.findIndex((s) => s.id === system.id) + 1

  return (
    <div
      className="lab-system-header"
      style={{ '--system-accent-color': system.colorToken } as React.CSSProperties}
    >
      <div className="lab-system-header__accent" aria-hidden="true" />
      <div className="lab-system-header__top">
        <nav className="lab-system-header__breadcrumbs" aria-label="Breadcrumb">
          <Link
            to="/lab"
            onPointerEnter={() => setIntent('link', 'MECH LAB')}
            onPointerLeave={clearIntent}
          >
            MECH LAB
          </Link>
          <span aria-hidden="true">/</span>
          <span>{system.title.toUpperCase()}</span>
        </nav>

        <div className="lab-system-header__badge-group">
          <span className="lab-system-header__level">
            ENGINEERING SYSTEM 0{systemIndex || 1} / 08
          </span>
          <span
            className="lab-system-header__status"
            style={{ color: 'var(--color-success)', borderColor: 'rgba(121, 184, 154, 0.4)' }}
          >
            ● FULL EXPERIMENT
          </span>
        </div>
      </div>

      <div className="lab-system-header__title-row">
        <div>
          <h1 className="lab-system-header__title">{system.title}</h1>
          <p className="lab-system-header__tagline">{system.exploreDescription}</p>
        </div>

        {/* ── Mode Switcher: EXPLORE vs CHALLENGE ──────────────────── */}
        <div className="lab-mode-switcher" role="radiogroup" aria-label="Experiment mode">
          <button
            type="button"
            className={`lab-mode-switcher__btn${mode === 'explore' ? ' is-active' : ''}`}
            onClick={() => onModeChange('explore')}
            onPointerEnter={() => setIntent('button', 'EXPLORE')}
            onPointerLeave={clearIntent}
            role="radio"
            aria-checked={mode === 'explore'}
          >
            <span className="lab-mode-switcher__icon" aria-hidden="true">🔬</span>
            <span>EXPLORE</span>
          </button>

          <button
            type="button"
            className={`lab-mode-switcher__btn lab-mode-switcher__btn--challenge${
              mode === 'challenge' ? ' is-active' : ''
            }`}
            onClick={() => onModeChange('challenge')}
            onPointerEnter={() => setIntent('button', 'CHALLENGE')}
            onPointerLeave={clearIntent}
            role="radio"
            aria-checked={mode === 'challenge'}
          >
            <span className="lab-mode-switcher__icon" aria-hidden="true">🎯</span>
            <span>CHALLENGE</span>
          </button>
        </div>
      </div>

      {/* Quick switcher between all 8 systems */}
      <nav className="lab-system-switcher" aria-label="Switch Engineering System">
        <span className="lab-system-switcher__label">SYSTEMS:</span>
        {labSystemsData.map((s) => {
          const isCurrent = s.id === system.id
          return (
            <Link
              key={s.id}
              to={`/lab/${s.id}?mode=${mode}`}
              className={`lab-system-switcher__pill${isCurrent ? ' is-active' : ''}`}
              style={{ '--pill-color': s.colorToken } as React.CSSProperties}
              onPointerEnter={() => setIntent('link', s.shortLabel)}
              onPointerLeave={clearIntent}
              aria-current={isCurrent ? 'page' : undefined}
            >
              {s.shortLabel}
              {' ●'}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
