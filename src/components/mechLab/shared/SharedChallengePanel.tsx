import { usePointer } from '../../interaction/PointerProvider'
import type { LabChallenge } from '../../../data/mechLabTypes'
import { MechLabHint } from './MechLabHint'

interface SharedChallengePanelProps {
  challenge: LabChallenge<any, any>
  activeLevel: number
  onSelectLevel: (lvl: number) => void
  currentParams: Record<string, any>
  currentResult: Record<string, any>
  onResetChallenge: () => void
}

export function SharedChallengePanel({
  challenge,
  activeLevel,
  onSelectLevel,
  currentParams,
  currentResult,
  onResetChallenge,
}: SharedChallengePanelProps) {
  const { setIntent, clearIntent } = usePointer()
  const evaluation = challenge.evaluate(currentParams, currentResult, activeLevel)
  const levels = challenge.levels || []
  const activeLevelObj = levels.find((l) => l.levelNumber === activeLevel) || levels[0]

  return (
    <section
      className={`thermo-challenge-section${evaluation.isPassed ? ' is-passed' : ''}`}
      aria-labelledby="shared-challenge-title"
    >
      <div className="thermo-challenge-section__header">
        <div className="thermo-challenge-section__title-group">
          <div className="thermo-challenge-section__badge">
            <span>ENGINEERING CHALLENGE</span>
            <span>// LEVEL {String(activeLevel).padStart(2, '0')}</span>
          </div>
          <h2 id="shared-challenge-title" className="thermo-challenge-section__title">
            {challenge.title}
          </h2>
          <p className="thermo-challenge-section__desc">
            {challenge.description}
          </p>
        </div>

        {/* Status Badge */}
        <div
          className={`thermo-challenge-section__status-badge ${
            evaluation.isPassed ? 'is-passed' : 'is-unmet'
          }`}
        >
          {evaluation.status}
        </div>
      </div>

      {/* Level Switcher (Level 1, 2, 3) */}
      {levels.length > 0 && (
        <div className="thermo-challenge-levels" role="tablist" aria-label="Mission levels">
          {levels.map((lvl) => (
            <button
              key={lvl.levelNumber}
              type="button"
              className={`thermo-challenge-level-btn${activeLevel === lvl.levelNumber ? ' is-active' : ''}`}
              onClick={() => onSelectLevel(lvl.levelNumber)}
              role="tab"
              aria-selected={activeLevel === lvl.levelNumber}
            >
              <span className="thermo-challenge-level-btn__num">LVL {lvl.levelNumber}</span>
              <span className="thermo-challenge-level-btn__name">{lvl.levelTitle}</span>
            </button>
          ))}
        </div>
      )}

      {/* Current Level Objective Note */}
      {activeLevelObj && (
        <div className="thermo-challenge-level-brief">
          <strong>Mission:</strong> {activeLevelObj.objective}
          <MechLabHint hint={activeLevelObj.hint || challenge.hint} />
        </div>
      )}

      {/* Target Criteria Live Metrics */}
      <div className="thermo-challenge-criteria-grid">
        {(activeLevelObj?.targets || challenge.targets).map((target) => {
          const isMet = target.isMet(currentParams, currentResult)
          return (
            <div
              key={target.id}
              className={`thermo-challenge-target-card${isMet ? ' is-met' : ' is-unmet'}`}
            >
              <div className="thermo-challenge-target-card__top">
                <span className="thermo-challenge-target-card__name">{target.label}</span>
                <span className="thermo-challenge-target-card__indicator">
                  {isMet ? 'MET ✓' : 'NOT MET ✕'}
                </span>
              </div>
              <div className="thermo-challenge-target-card__val">
                {target.currentDisplay(currentParams, currentResult)}
              </div>
              <div className="thermo-challenge-target-card__requirement">
                Target: <strong>{target.targetDisplay}</strong>
              </div>
            </div>
          )
        })}
      </div>

      {/* Dynamic Contextual Guidance & Feedback */}
      <div className={`thermo-challenge-feedback-box${evaluation.isPassed ? ' is-passed' : ''}`}>
        <p className="thermo-challenge-feedback-box__message">
          {evaluation.feedbackMessage}
        </p>
        {evaluation.engineeringInsight && (
          <p className="thermo-challenge-feedback-box__insight">
            {evaluation.engineeringInsight}
          </p>
        )}
      </div>

      {/* Reset Challenge Action */}
      <div className="thermo-challenge-section__actions">
        <button
          type="button"
          className="thermo-challenge-reset-button"
          onClick={onResetChallenge}
          onPointerEnter={() => setIntent('button', 'RESET CHALLENGE')}
          onPointerLeave={clearIntent}
        >
          RESET CHALLENGE PARAMETERS
        </button>
      </div>
    </section>
  )
}
