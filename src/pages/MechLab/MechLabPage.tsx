import { Link } from 'react-router-dom'
import { MechLabShell } from './MechLabShell'
import { labSystemsData } from '../../data/mechLab'
import { usePointer } from '../../components/interaction/PointerProvider'

export function MechLabPage() {
  const { setIntent, clearIntent } = usePointer()

  return (
    <MechLabShell>
      <title>Mech Lab — Play with Engineering | MechESA IIT Indore</title>
      <meta
        name="description"
        content="Play with engineering. See what happens. Explore mechanical systems through interactive experiments, solve engineering challenges, and build physical intuition."
      />

      {/* ── Main Hero Section ───────────────────────────────────── */}
      <section className="mech-lab-hero" aria-labelledby="lab-hero-title">
        <div className="mech-lab-hero__badge">
          <span className="mech-lab-hero__badge-dot" aria-hidden="true" />
          <span>MECHESA // INTERACTIVE PLAYGROUND</span>
        </div>

        <h1 id="lab-hero-title" className="mech-lab-hero__title">
          MECH LAB
        </h1>

        <p className="mech-lab-hero__tagline">
          Play with engineering. See what happens.
        </p>

        <p className="mech-lab-hero__subtitle">
          Explore mechanical systems through interactive experiments. Change something, watch the system react, and discover why.
        </p>

        {/* ── Two Large Gateways: EXPLORE vs CHALLENGE ────────────── */}
        <div className="mech-lab-gateways" role="region" aria-label="Ways to play in Mech Lab">
          {/* Card 1: Free Exploration */}
          <Link
            to="/lab/thermodynamics?mode=explore"
            className="mech-lab-gateway mech-lab-gateway--explore"
            onPointerEnter={() => setIntent('link', 'EXPLORE SANDBOX')}
            onPointerLeave={clearIntent}
          >
            <div className="mech-lab-gateway__glow" aria-hidden="true" />
            <div className="mech-lab-gateway__top">
              <span className="mech-lab-gateway__pill">FREE PLAY</span>
              <span className="mech-lab-gateway__badge">8 SANDBOXES READY</span>
            </div>

            <h2 className="mech-lab-gateway__title">EXPLORE</h2>

            <div className="mech-lab-gateway__body">
              <p className="mech-lab-gateway__lead">Pick an engineering system and experiment freely.</p>
              <ul className="mech-lab-gateway__bullets">
                <li>Experiment freely with interactive mechanisms and models</li>
                <li>Change physical parameters and watch live motion and stress</li>
                <li>Discover what happens and understand the physical cause</li>
              </ul>
            </div>

            <div className="mech-lab-gateway__action">
              <span>ENTER SANDBOX</span>
              <span className="mech-lab-gateway__arrow" aria-hidden="true">→</span>
            </div>
          </Link>

          {/* Card 2: Engineering Challenge */}
          <Link
            to="/lab/thermodynamics?mode=challenge"
            className="mech-lab-gateway mech-lab-gateway--challenge"
            onPointerEnter={() => setIntent('link', 'START CHALLENGE')}
            onPointerLeave={clearIntent}
          >
            <div className="mech-lab-gateway__glow" aria-hidden="true" />
            <div className="mech-lab-gateway__top">
              <span className="mech-lab-gateway__pill mech-lab-gateway__pill--amber">ENGINEERING MISSIONS</span>
              <span className="mech-lab-gateway__badge mech-lab-gateway__badge--amber">LEVEL PROGRESSION</span>
            </div>

            <h2 className="mech-lab-gateway__title">CHALLENGE</h2>

            <div className="mech-lab-gateway__body">
              <p className="mech-lab-gateway__lead">Solve engineering problems and see if your design works.</p>
              <ul className="mech-lab-gateway__bullets">
                <li>Build, tune, test and balance system constraints</li>
                <li>Meet efficiency, deflection, and precision targets</li>
                <li>Master real engineering trade-offs by beating challenges</li>
              </ul>
            </div>

            <div className="mech-lab-gateway__action mech-lab-gateway__action--amber">
              <span>START CHALLENGE</span>
              <span className="mech-lab-gateway__arrow" aria-hidden="true">→</span>
            </div>
          </Link>
        </div>
      </section>

      {/* ── 8 Engineering Systems Experience Grid ───────────────── */}
      <section className="mech-lab-grid-section" aria-labelledby="systems-selection-title">
        <div className="mech-lab-grid-section__head">
          <div>
            <h2 id="systems-selection-title" className="mech-lab-grid-section__title">
              CHOOSE AN EXPERIMENT
            </h2>
            <p className="mech-lab-grid-section__subtitle">
              Every system gives you something to touch, change, and discover.
            </p>
          </div>
          <span className="mech-lab-grid-section__count">
            8 SYSTEMS READY TO TOUCH &amp; TUNE
          </span>
        </div>

        <div className="mech-lab-grid" role="list">
          {labSystemsData.map((sys, index) => {
            const moduleNum = String(index + 1).padStart(2, '0')
            const isFull =
              sys.id === 'thermodynamics' ||
              sys.id === 'robotics' ||
              sys.id === 'fluid' ||
              sys.id === 'automotive' ||
              sys.id === 'design'

            return (
              <article
                key={sys.id}
                className="mech-lab-card"
                role="listitem"
                style={{ '--card-color': sys.colorToken } as React.CSSProperties}
              >
                <div className="mech-lab-card__accent-bar" aria-hidden="true" />

                <div className="mech-lab-card__head">
                  <span className="mech-lab-card__module-id">
                    SYSTEM {moduleNum} // {sys.shortLabel}
                  </span>
                  <span
                    className="mech-lab-card__status"
                    style={
                      isFull
                        ? { color: 'var(--color-success)', borderColor: 'rgba(121, 184, 154, 0.4)' }
                        : { color: sys.colorToken, borderColor: 'rgba(205, 214, 219, 0.25)' }
                    }
                  >
                    {isFull ? '● FULL EXPERIMENT' : '● INTERACTIVE STUDY'}
                  </span>
                </div>

                <h3 className="mech-lab-card__title">{sys.title}</h3>
                
                <p className="mech-lab-card__action-lead">
                  {sys.exploreDescription}
                </p>

                <p className="mech-lab-card__focus-text">
                  {sys.focus}
                </p>

                <div className="mech-lab-card__actions-row">
                  <Link
                    to={`/lab/${sys.id}?mode=explore`}
                    className="mech-lab-card__action-btn"
                    onPointerEnter={() => setIntent('link', 'EXPLORE')}
                    onPointerLeave={clearIntent}
                    aria-label={`Explore sandbox for ${sys.title}`}
                  >
                    <span>🔬 EXPLORE</span>
                    <span aria-hidden="true">→</span>
                  </Link>

                  <Link
                    to={`/lab/${sys.id}?mode=challenge`}
                    className="mech-lab-card__action-btn mech-lab-card__action-btn--challenge"
                    onPointerEnter={() => setIntent('link', 'CHALLENGE')}
                    onPointerLeave={clearIntent}
                    aria-label={`Take on challenge for ${sys.title}`}
                  >
                    <span>🎯 MISSION</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </MechLabShell>
  )
}
