import { Link, useNavigate } from 'react-router-dom'
import { usePointer } from '../../components/interaction/PointerProvider'

export function MechLabHeader() {
  const navigate = useNavigate()
  const { setIntent, clearIntent } = usePointer()

  const handleExitLab = () => {
    // If browser history has an entry, check or return to '/' cleanly
    if (window.history.length > 2) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }

  return (
    <header className="mech-lab-header" aria-label="Mech Lab Navigation">
      <div className="mech-lab-header__inner">
        <Link
          to="/lab"
          className="mech-lab-header__brand"
          onPointerEnter={() => setIntent('link', 'LAB HOME')}
          onPointerLeave={clearIntent}
          aria-label="Mech Lab Home"
        >
          <span className="mech-lab-header__logo-tag">LAB</span>
          <div className="mech-lab-header__title-group">
            <span className="mech-lab-header__title">MECHESA // MECH LAB</span>
            <span className="mech-lab-header__sub">ENGINEERING EXPLORATION ENVIRONMENT</span>
          </div>
        </Link>

        <div className="mech-lab-header__actions">
          <Link
            to="/lab"
            className="mech-lab-header__btn"
            onPointerEnter={() => setIntent('button', 'LAB HOME')}
            onPointerLeave={clearIntent}
            aria-label="Return to Lab Dashboard"
          >
            LAB HOME
          </Link>

          <button
            type="button"
            className="mech-lab-header__btn mech-lab-header__btn--exit"
            onClick={handleExitLab}
            onPointerEnter={() => setIntent('button', 'EXIT')}
            onPointerLeave={clearIntent}
            aria-label="Exit Mech Lab and return to website"
          >
            <span>EXIT LAB</span> <span className="btn-arrow" aria-hidden="true">↗</span>
          </button>
        </div>
      </div>
    </header>
  )
}
