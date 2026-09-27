import { useState, useMemo } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { MechLabShell } from './MechLabShell'
import { labSystemsData, type LabSystemConfig } from '../../data/mechLab'
import { usePointer } from '../../components/interaction/PointerProvider'
import { MechLabSystemHeader } from '../../components/mechLab/shared/MechLabSystemHeader'
import { GenericSystemInstrument } from '../../components/mechLab/shared/GenericSystemInstrument'
import {
  DEFAULT_THERMO_PARAMS,
  THERMODYNAMICS_PARAMETERS,
  THERMODYNAMICS_ASSUMPTIONS,
  THERMODYNAMICS_EQUATIONS,
  calculateThermodynamicsCycle,
  getThermodynamicsExplanation,
  type ThermoParams,
} from '../../components/mechLab/experiments/thermodynamicsModel'
import {
  THERMODYNAMICS_CHALLENGE,
  THERMODYNAMICS_LEVELS,
} from '../../components/mechLab/experiments/thermodynamicsChallenge'
import { ThermodynamicsExperimentView } from '../../components/mechLab/experiments/ThermodynamicsExperimentView'
import { RoboticsExperimentView } from '../../components/mechLab/experiments/RoboticsExperimentView'
import {
  ROBOT_ARM_CONFIG,
  ROBOTICS_LEVEL_TARGETS,
  calculateRoboticsKinematics,
  getRoboticsDynamicExplanation,
} from '../../components/mechLab/experiments/roboticsModel'
import {
  ROBOTICS_FLAGSHIP_CHALLENGE,
  ROBOTICS_LEVELS,
} from '../../components/mechLab/experiments/roboticsChallenge'
import { FluidExperimentView } from '../../components/mechLab/experiments/FluidExperimentView'
import {
  calculateFluidState,
  getFluidDynamicExplanation,
  FLUID_EQUATIONS,
  FLUID_PARAM_LIMITS,
} from '../../components/mechLab/experiments/fluidModel'
import { AutomotiveExperimentView } from '../../components/mechLab/experiments/AutomotiveExperimentView'
import {
  calculateAutomotivePerformance,
  getAutomotiveDynamicExplanation,
  AUTOMOTIVE_EQUATIONS,
  AUTOMOTIVE_LIMITS,
} from '../../components/mechLab/experiments/automotiveModel'
import { DesignExperimentView } from '../../components/mechLab/experiments/DesignExperimentView'
import {
  calculateBeamAnalysis,
  getBeamDynamicExplanation,
  DESIGN_EQUATIONS,
  BEAM_LIMITS,
  type MaterialId,
} from '../../components/mechLab/experiments/designModel'

// ── Active Thermodynamics Reference Experiment Experience ─────────────
interface ActiveThermoProps {
  system: LabSystemConfig
  mode: 'explore' | 'challenge'
  onSwitchMode: (mode: 'explore' | 'challenge') => void
}

function ActiveThermodynamicsLab({ system, mode, onSwitchMode }: ActiveThermoProps) {
  const { setIntent, clearIntent } = usePointer()

  const [params, setParams] = useState<ThermoParams>(DEFAULT_THERMO_PARAMS)
  const [prevParams, setPrevParams] = useState<ThermoParams>(DEFAULT_THERMO_PARAMS)
  const [activeChallengeLevel, setActiveChallengeLevel] = useState<number>(3)
  const [showMoreData, setShowMoreData] = useState<boolean>(false)

  const cycleData = useMemo(() => calculateThermodynamicsCycle(params), [params])

  const explanation = useMemo(
    () => getThermodynamicsExplanation(params, prevParams),
    [params, prevParams]
  )

  const challengeEval = useMemo(
    () => THERMODYNAMICS_CHALLENGE.evaluate(params, cycleData),
    [params, cycleData]
  )

  const handleParamChange = (field: keyof ThermoParams, value: number) => {
    setPrevParams(params)
    setParams((prev) => ({ ...prev, [field]: value }))
  }

  const handleResetSliders = () => {
    setPrevParams(params)
    setParams(DEFAULT_THERMO_PARAMS)
  }

  const handleResetChallenge = () => {
    setPrevParams(params)
    setParams(THERMODYNAMICS_CHALLENGE.defaultParams || DEFAULT_THERMO_PARAMS)
  }

  return (
    <div className="mech-lab-system-page">
      <MechLabSystemHeader
        system={system}
        mode={mode}
        onModeChange={onSwitchMode}
      />

      {/* ── Section 1: Main Engine Experiment & Primary Controls ─── */}
      <section className="thermo-hero-grid" aria-label="Engine experiment and primary controls">
        <div className="thermo-hero-grid__stage">
          <ThermodynamicsExperimentView
            cycleData={cycleData}
            heatInput={params.heatInput}
            compressionRatio={params.compressionRatio}
          />
        </div>

        <div className="thermo-hero-grid__sidebar">
          <div className="lab-controls-panel">
            <div className="lab-controls-panel__head">
              <h2 className="lab-controls-panel__title">ENGINE CONTROLS</h2>
              <button
                type="button"
                className="lab-controls-panel__reset-btn"
                onClick={handleResetSliders}
                onPointerEnter={() => setIntent('button', 'RESET')}
                onPointerLeave={clearIntent}
                aria-label="Reset sliders to defaults"
              >
                RESET SLIDERS
              </button>
            </div>

            <div className="lab-controls-list">
              {THERMODYNAMICS_PARAMETERS.map((p) => {
                const val = params[p.id as keyof ThermoParams]
                return (
                  <div key={p.id} className="lab-control-item">
                    <div className="lab-control-item__label-row">
                      <label htmlFor={`control-${p.id}`} className="lab-control-item__name">
                        {p.label}
                      </label>
                      <output htmlFor={`control-${p.id}`} className="lab-control-item__value">
                        {val} {p.unit}
                      </output>
                    </div>

                    <input
                      id={`control-${p.id}`}
                      type="range"
                      className="lab-control-slider"
                      min={p.min}
                      max={p.max}
                      step={p.step}
                      value={val}
                      onChange={(e) =>
                        handleParamChange(p.id as keyof ThermoParams, Number(e.target.value))
                      }
                      aria-label={`${p.label}, from ${p.min} to ${p.max} ${p.unit}`}
                    />

                    <div className="lab-control-item__range-scale" aria-hidden="true">
                      <span>
                        {p.min} {p.unit}
                      </span>
                      <span>
                        {p.max} {p.unit}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="thermo-core-results">
            <div className="thermo-core-result-item thermo-core-result-item--primary">
              <span className="thermo-core-result-label">THERMAL EFFICIENCY</span>
              <div className="thermo-core-result-val">
                {cycleData.efficiency}
                <span className="thermo-core-result-unit">%</span>
              </div>
            </div>

            <div className="thermo-core-result-subgrid">
              <div className="thermo-core-result-item">
                <span className="thermo-core-result-label">PEAK PRESSURE (P₃)</span>
                <div className="thermo-core-result-val-small">
                  {(cycleData.peakPressure / 1000).toFixed(1)}{' '}
                  <span className="thermo-core-result-unit">MPa</span>
                  <span className="thermo-core-result-paren">
                    ({cycleData.peakPressure.toLocaleString()} kPa)
                  </span>
                </div>
              </div>

              <div className="thermo-core-result-item">
                <span className="thermo-core-result-label">NET WORK OUTPUT</span>
                <div className="thermo-core-result-val-small">
                  {cycleData.netWork}{' '}
                  <span className="thermo-core-result-unit">kJ</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Mode 1: EXPLORE FLOW ── */}
      {mode === 'explore' && (
        <>
          <section className="thermo-dynamic-reaction" aria-labelledby="dynamic-reaction-title">
            <div className="thermo-dynamic-reaction__header">
              <span className="thermo-dynamic-reaction__badge" aria-hidden="true">●</span>
              <h2 id="dynamic-reaction-title" className="thermo-dynamic-reaction__title">
                WHAT&apos;S HAPPENING?
              </h2>
              <span className="thermo-dynamic-reaction__subtitle">
                Real-time physical reaction to your parameter changes
              </span>
            </div>

            <div className="thermo-dynamic-reaction__cards">
              <div className="thermo-dynamic-card">
                <span className="thermo-dynamic-card__step">01</span>
                <span className="thermo-dynamic-card__label">YOU CHANGED:</span>
                <p className="thermo-dynamic-card__content thermo-dynamic-card__content--changed">
                  {explanation.whatChanged}
                </p>
              </div>

              <div className="thermo-dynamic-card thermo-dynamic-card--highlight">
                <span className="thermo-dynamic-card__step">02</span>
                <span className="thermo-dynamic-card__label">WHAT HAPPENED:</span>
                <p className="thermo-dynamic-card__content">
                  {explanation.whatHappened}
                </p>
              </div>

              <div className="thermo-dynamic-card">
                <span className="thermo-dynamic-card__step">03</span>
                <span className="thermo-dynamic-card__label">WHY? (PHYSICAL CAUSE):</span>
                <p className="thermo-dynamic-card__content">
                  {explanation.why}
                </p>
              </div>
            </div>
          </section>

          <div className="lab-mode-prompt-card">
            <div className="lab-mode-prompt-card__content">
              <span className="lab-mode-prompt-card__badge">TEST YOUR INTUITION</span>
              <h3 className="lab-mode-prompt-card__title">
                Ready to test your engine tuning skills?
              </h3>
              <p className="lab-mode-prompt-card__desc">
                Take on the &ldquo;ENGINEER THE ENGINE&rdquo; challenge. Can you achieve 60% efficiency while keeping peak pressure under 9,000 kPa?
              </p>
            </div>
            <button
              type="button"
              className="mechanical-button mechanical-button--primary"
              onClick={() => onSwitchMode('challenge')}
              onPointerEnter={() => setIntent('button', 'CHALLENGE')}
              onPointerLeave={clearIntent}
            >
              START ENGINE CHALLENGE →
            </button>
          </div>
        </>
      )}

      {/* ── Mode 2: CHALLENGE FLOW ── */}
      {mode === 'challenge' && (
        <>
          <section
            id="challenge"
            className={`thermo-challenge-section${challengeEval.isPassed ? ' is-passed' : ''}`}
            aria-labelledby="challenge-heading"
          >
            <div className="thermo-challenge-section__header">
              <div className="thermo-challenge-section__title-group">
                <div className="thermo-challenge-section__badge">
                  <span>ENGINEERING CHALLENGE</span>
                  <span>// LEVEL {String(activeChallengeLevel).padStart(2, '0')}</span>
                </div>
                <h2 id="challenge-heading" className="thermo-challenge-section__title">
                  {THERMODYNAMICS_CHALLENGE.title}
                </h2>
                <p className="thermo-challenge-section__desc">
                  {THERMODYNAMICS_CHALLENGE.description}
                </p>
              </div>

              <div
                className={`thermo-challenge-section__status-badge ${
                  challengeEval.isPassed ? 'is-passed' : 'is-unmet'
                }`}
              >
                {challengeEval.status}
              </div>
            </div>

            <div className="thermo-challenge-levels" role="tablist" aria-label="Challenge progression levels">
              {THERMODYNAMICS_LEVELS.map((lvl) => (
                <button
                  key={lvl.levelNumber}
                  type="button"
                  className={`thermo-challenge-level-btn${activeChallengeLevel === lvl.levelNumber ? ' is-active' : ''}`}
                  onClick={() => setActiveChallengeLevel(lvl.levelNumber)}
                  role="tab"
                  aria-selected={activeChallengeLevel === lvl.levelNumber}
                >
                  <span className="thermo-challenge-level-btn__num">LVL {lvl.levelNumber}</span>
                  <span className="thermo-challenge-level-btn__name">{lvl.levelTitle}</span>
                </button>
              ))}
            </div>

            <div className="thermo-challenge-level-brief">
              <strong>Mission:</strong> {THERMODYNAMICS_LEVELS[activeChallengeLevel - 1].objective}{' '}
              <span className="thermo-challenge-level-brief__hint">
                (Hint: {THERMODYNAMICS_LEVELS[activeChallengeLevel - 1].hint})
              </span>
            </div>

            <div className="thermo-challenge-criteria-grid">
              {THERMODYNAMICS_CHALLENGE.targets.map((target) => {
                const isMet = target.isMet(params, cycleData)
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
                      {target.currentDisplay(params, cycleData)}
                    </div>
                    <div className="thermo-challenge-target-card__requirement">
                      Target: <strong>{target.targetDisplay}</strong>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className={`thermo-challenge-feedback-box${challengeEval.isPassed ? ' is-passed' : ''}`}>
              <p className="thermo-challenge-feedback-box__message">
                {challengeEval.feedbackMessage}
              </p>
              {challengeEval.engineeringInsight && (
                <p className="thermo-challenge-feedback-box__insight">
                  {challengeEval.engineeringInsight}
                </p>
              )}
            </div>

            <div className="thermo-challenge-section__actions">
              <button
                type="button"
                className="thermo-challenge-reset-button"
                onClick={handleResetChallenge}
                onPointerEnter={() => setIntent('button', 'RESET CHALLENGE')}
                onPointerLeave={clearIntent}
              >
                RESET CHALLENGE PARAMETERS
              </button>
            </div>
          </section>

          <div className="lab-mode-prompt-card lab-mode-prompt-card--muted">
            <div className="lab-mode-prompt-card__content">
              <span className="lab-mode-prompt-card__badge">SANDBOX PLAY</span>
              <h3 className="lab-mode-prompt-card__title">
                Want to experiment without constraints?
              </h3>
              <p className="lab-mode-prompt-card__desc">
                Switch to Explore Mode to tweak compression, heat, and displacement freely without targets.
              </p>
            </div>
            <button
              type="button"
              className="mechanical-button"
              onClick={() => onSwitchMode('explore')}
              onPointerEnter={() => setIntent('button', 'EXPLORE')}
              onPointerLeave={clearIntent}
            >
              SWITCH TO EXPLORE SANDBOX →
            </button>
          </div>
        </>
      )}

      {/* ── Section 4: Progressive Disclosure — "SEE THE ENGINEERING" ── */}
      <section className="thermo-deep-dive-grid" aria-label="Engineering equations and technical data">
        <div className="thermo-equations-card">
          <div className="thermo-equations-card__head">
            <h2 className="thermo-equations-card__title">SEE THE ENGINEERING</h2>
            <span className="thermo-equations-card__badge">GOVERNING EQUATIONS</span>
          </div>

          <p className="thermo-equations-card__intro">
            These physical laws govern the compression, heat addition, and expansion strokes:
          </p>

          <div className="thermo-equations-list">
            {THERMODYNAMICS_EQUATIONS.map((eq, i) => (
              <div key={i} className="thermo-equation-item">
                <span className="thermo-equation-item__title">{eq.title}</span>
                <code className="thermo-equation-item__formula">{eq.formula}</code>
                <p className="thermo-equation-item__desc">{eq.explanation}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="thermo-technical-data-card">
          <div className="thermo-technical-data-card__head">
            <h2 className="thermo-technical-data-card__title">ENGINEERING DATA</h2>
            <button
              type="button"
              className="thermo-technical-data-card__toggle-btn"
              onClick={() => setShowMoreData((prev) => !prev)}
              aria-expanded={showMoreData}
            >
              {showMoreData ? 'HIDE DETAILS ▲' : 'EXPAND ALL ▼'}
            </button>
          </div>

          <div className="thermo-tech-table">
            <div className="thermo-tech-row">
              <span>Clearance Volume (Vc)</span>
              <strong>{cycleData.clearanceVolume} cm³</strong>
            </div>
            <div className="thermo-tech-row">
              <span>Total Volume (V₁)</span>
              <strong>{cycleData.totalVolume} cm³</strong>
            </div>
            <div className="thermo-tech-row">
              <span>Trapped Charge Mass (m)</span>
              <strong>{cycleData.trappedMass} g</strong>
            </div>
            <div className="thermo-tech-row">
              <span>Mean Effective Pressure (IMEP)</span>
              <strong>{cycleData.imep.toLocaleString()} kPa</strong>
            </div>
          </div>

          {showMoreData && (
            <div className="thermo-technical-expanded">
              <h3 className="thermo-technical-expanded__subtitle">CYCLE TEMPERATURES &amp; PRESSURES</h3>
              <div className="thermo-tech-table">
                <div className="thermo-tech-row">
                  <span>State 1 (Intake)</span>
                  <span>T₁ = {cycleData.t1} K, P₁ = {cycleData.p1} kPa</span>
                </div>
                <div className="thermo-tech-row">
                  <span>State 2 (Compression TDC)</span>
                  <span>T₂ = {cycleData.t2} K, P₂ = {cycleData.p2.toLocaleString()} kPa</span>
                </div>
                <div className="thermo-tech-row">
                  <span>State 3 (Ignition Peak)</span>
                  <span>T₃ = {cycleData.peakTemperature} K, P₃ = {cycleData.peakPressure.toLocaleString()} kPa</span>
                </div>
                <div className="thermo-tech-row">
                  <span>State 4 (Exhaust Blowdown)</span>
                  <span>T₄ = {cycleData.t4} K, P₄ = {cycleData.p4.toLocaleString()} kPa</span>
                </div>
              </div>

              <h3 className="thermo-technical-expanded__subtitle" style={{ marginTop: '1rem' }}>
                PHYSICAL MODEL ASSUMPTIONS
              </h3>
              <div className="thermo-assumptions-list">
                {THERMODYNAMICS_ASSUMPTIONS.map((a) => (
                  <div key={a.id} className="thermo-assumption-item">
                    <strong className="thermo-assumption-item__title">{a.title}</strong>
                    <p className="thermo-assumption-item__statement">{a.statement}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

// ── Active Robotics Flagship Experience ────────────────────────────────
interface ActiveRoboticsProps {
  system: LabSystemConfig
  mode: 'explore' | 'challenge'
  onSwitchMode: (mode: 'explore' | 'challenge') => void
}

function ActiveRoboticsLab({ system, mode, onSwitchMode }: ActiveRoboticsProps) {
  const { setIntent, clearIntent } = usePointer()

  const [shoulderAngle, setShoulderAngle] = useState<number>(35)
  const [elbowAngle, setElbowAngle] = useState<number>(45)
  const [prevShoulder, setPrevShoulder] = useState<number>(35)
  const [prevElbow, setPrevElbow] = useState<number>(45)
  const [activeChallengeLevel, setActiveChallengeLevel] = useState<number>(1)
  const [showMoreData, setShowMoreData] = useState<boolean>(false)

  const handleAngleChange = (newShoulder: number, newElbow: number) => {
    setPrevShoulder(shoulderAngle)
    setPrevElbow(elbowAngle)
    setShoulderAngle(newShoulder)
    setElbowAngle(newElbow)
  }

  const handleResetChallenge = () => {
    setPrevShoulder(shoulderAngle)
    setPrevElbow(elbowAngle)
    setShoulderAngle(ROBOTICS_FLAGSHIP_CHALLENGE.defaultParams?.shoulderAngle ?? 35)
    setElbowAngle(ROBOTICS_FLAGSHIP_CHALLENGE.defaultParams?.elbowAngle ?? 45)
  }

  const explanation = useMemo(
    () => getRoboticsDynamicExplanation(shoulderAngle, prevShoulder, elbowAngle, prevElbow),
    [shoulderAngle, prevShoulder, elbowAngle, prevElbow]
  )

  const challengeEval = useMemo(
    () =>
      ROBOTICS_FLAGSHIP_CHALLENGE.evaluate(
        { shoulderAngle, elbowAngle },
        { activeLevel: activeChallengeLevel },
        activeChallengeLevel
      ),
    [shoulderAngle, elbowAngle, activeChallengeLevel]
  )

  const activeLevelConfig =
    ROBOTICS_LEVEL_TARGETS[activeChallengeLevel] || ROBOTICS_LEVEL_TARGETS[1]

  const kinematics = useMemo(
    () =>
      calculateRoboticsKinematics(
        shoulderAngle,
        elbowAngle,
        activeLevelConfig.target,
        activeLevelConfig.radius,
        activeLevelConfig.obstacle
      ),
    [shoulderAngle, elbowAngle, activeLevelConfig]
  )

  return (
    <div className="mech-lab-system-page">
      <MechLabSystemHeader
        system={system}
        mode={mode}
        onModeChange={onSwitchMode}
      />

      {/* ── Section 1: Main Robotic Arm Hero Playground ─────────── */}
      <RoboticsExperimentView
        shoulderAngle={shoulderAngle}
        elbowAngle={elbowAngle}
        onAngleChange={handleAngleChange}
        activeLevel={activeChallengeLevel}
        isChallengeMode={mode === 'challenge'}
      />

      {/* ── Mode 1: EXPLORE FLOW (Sandbox, "What's Happening?", Deep Dive) ── */}
      {mode === 'explore' && (
        <>
          {/* Section 2: "WHAT'S HAPPENING?" Real-Time Dynamic Reaction */}
          <section className="thermo-dynamic-reaction" aria-labelledby="robotics-reaction-title">
            <div className="thermo-dynamic-reaction__header">
              <span className="thermo-dynamic-reaction__badge" aria-hidden="true">●</span>
              <h2 id="robotics-reaction-title" className="thermo-dynamic-reaction__title">
                WHAT&apos;S HAPPENING?
              </h2>
              <span className="thermo-dynamic-reaction__subtitle">
                Physical consequence of moving the robot joints
              </span>
            </div>

            <div className="thermo-dynamic-reaction__cards">
              <div className="thermo-dynamic-card">
                <span className="thermo-dynamic-card__step">01</span>
                <span className="thermo-dynamic-card__label">YOU MOVED:</span>
                <p className="thermo-dynamic-card__content thermo-dynamic-card__content--changed">
                  {explanation.whatChanged}
                </p>
              </div>

              <div className="thermo-dynamic-card thermo-dynamic-card--highlight">
                <span className="thermo-dynamic-card__step">02</span>
                <span className="thermo-dynamic-card__label">THE ROBOT MOVED:</span>
                <p className="thermo-dynamic-card__content">
                  {explanation.whatHappened}
                </p>
              </div>

              <div className="thermo-dynamic-card">
                <span className="thermo-dynamic-card__step">03</span>
                <span className="thermo-dynamic-card__label">WHY? (PHYSICAL CAUSE):</span>
                <p className="thermo-dynamic-card__content">
                  {explanation.why}
                </p>
              </div>
            </div>
          </section>

          {/* Mode Prompt Card to Take On Challenge */}
          <div className="lab-mode-prompt-card">
            <div className="lab-mode-prompt-card__content">
              <span className="lab-mode-prompt-card__badge">TEST YOUR ROBOT CONTROL</span>
              <h3 className="lab-mode-prompt-card__title">
                Ready to test your robot positioning skills?
              </h3>
              <p className="lab-mode-prompt-card__desc">
                Take on the &ldquo;PICK UP THE PART&rdquo; engineering mission. Can you guide the robot hand accurately into the pickup zone?
              </p>
            </div>
            <button
              type="button"
              className="mechanical-button mechanical-button--primary"
              onClick={() => onSwitchMode('challenge')}
              onPointerEnter={() => setIntent('button', 'CHALLENGE')}
              onPointerLeave={clearIntent}
            >
              START ROBOT MISSION →
            </button>
          </div>
        </>
      )}

      {/* ── Mode 2: CHALLENGE FLOW ("PICK UP THE PART", Objectives, Obstacles) ── */}
      {mode === 'challenge' && (
        <>
          <section
            id="challenge"
            className={`thermo-challenge-section${challengeEval.isPassed ? ' is-passed' : ''}`}
            aria-labelledby="robotics-challenge-heading"
          >
            <div className="thermo-challenge-section__header">
              <div className="thermo-challenge-section__title-group">
                <div className="thermo-challenge-section__badge">
                  <span>ENGINEERING MISSION</span>
                  <span>// LEVEL {String(activeChallengeLevel).padStart(2, '0')}</span>
                </div>
                <h2 id="robotics-challenge-heading" className="thermo-challenge-section__title">
                  {ROBOTICS_FLAGSHIP_CHALLENGE.title}
                </h2>
                <p className="thermo-challenge-section__desc">
                  {ROBOTICS_FLAGSHIP_CHALLENGE.description}
                </p>
              </div>

              {/* Status Badge: NOT QUITE / TARGET REACHED / OBSTACLE HIT */}
              <div
                className={`thermo-challenge-section__status-badge ${
                  challengeEval.isPassed ? 'is-passed' : 'is-unmet'
                }`}
              >
                {challengeEval.status}
              </div>
            </div>

            {/* Level Switcher (1, 2, 3) */}
            <div className="thermo-challenge-levels" role="tablist" aria-label="Challenge progression levels">
              {ROBOTICS_LEVELS.map((lvl) => (
                <button
                  key={lvl.levelNumber}
                  type="button"
                  className={`thermo-challenge-level-btn${activeChallengeLevel === lvl.levelNumber ? ' is-active' : ''}`}
                  onClick={() => setActiveChallengeLevel(lvl.levelNumber)}
                  role="tab"
                  aria-selected={activeChallengeLevel === lvl.levelNumber}
                >
                  <span className="thermo-challenge-level-btn__num">LVL {lvl.levelNumber}</span>
                  <span className="thermo-challenge-level-btn__name">{lvl.levelTitle}</span>
                </button>
              ))}
            </div>

            {/* Current Level Objective Note */}
            <div className="thermo-challenge-level-brief">
              <strong>Mission:</strong> {ROBOTICS_LEVELS[activeChallengeLevel - 1].objective}{' '}
              <span className="thermo-challenge-level-brief__hint">
                (Hint: {ROBOTICS_LEVELS[activeChallengeLevel - 1].hint})
              </span>
            </div>

            {/* Target Criteria Live Metrics */}
            <div className="thermo-challenge-criteria-grid">
              <div
                className={`thermo-challenge-target-card${
                  kinematics.isTargetReached ? ' is-met' : ' is-unmet'
                }`}
              >
                <div className="thermo-challenge-target-card__top">
                  <span className="thermo-challenge-target-card__name">DISTANCE TO TARGET</span>
                  <span className="thermo-challenge-target-card__indicator">
                    {kinematics.isTargetReached ? 'IN ZONE ✓' : 'OUTSIDE ✕'}
                  </span>
                </div>
                <div className="thermo-challenge-target-card__val">
                  {kinematics.distanceToTarget.toFixed(1)} <small style={{ fontSize: '0.8rem' }}>mm</small>
                </div>
                <div className="thermo-challenge-target-card__requirement">
                  Tolerance: <strong>≤ {activeLevelConfig.radius} mm</strong>
                </div>
              </div>

              {activeLevelConfig.obstacle && (
                <div
                  className={`thermo-challenge-target-card${
                    !kinematics.hasObstacleCollision ? ' is-met' : ' is-unmet'
                  }`}
                >
                  <div className="thermo-challenge-target-card__top">
                    <span className="thermo-challenge-target-card__name">OBSTACLE CLEARANCE</span>
                    <span className="thermo-challenge-target-card__indicator">
                      {!kinematics.hasObstacleCollision ? 'CLEAR ✓' : 'COLLISION ✕'}
                    </span>
                  </div>
                  <div className="thermo-challenge-target-card__val">
                    {!kinematics.hasObstacleCollision ? 'SAFE' : 'HIT ⚠'}
                  </div>
                  <div className="thermo-challenge-target-card__requirement">
                    Constraint: <strong>Avoid {activeLevelConfig.obstacle.label}</strong>
                  </div>
                </div>
              )}
            </div>

            {/* Dynamic Contextual Guidance & Feedback */}
            <div className={`thermo-challenge-feedback-box${challengeEval.isPassed ? ' is-passed' : ''}`}>
              <p className="thermo-challenge-feedback-box__message">
                {challengeEval.feedbackMessage}
              </p>
              {challengeEval.engineeringInsight && (
                <p className="thermo-challenge-feedback-box__insight">
                  {challengeEval.engineeringInsight}
                </p>
              )}
            </div>

            {/* Actions: Reset Challenge or Next Mission */}
            <div className="thermo-challenge-section__actions" style={{ gap: '0.75rem' }}>
              <button
                type="button"
                className="thermo-challenge-reset-button"
                onClick={handleResetChallenge}
                onPointerEnter={() => setIntent('button', 'RESET CHALLENGE')}
                onPointerLeave={clearIntent}
              >
                RESET ARM POSITION
              </button>

              {challengeEval.isPassed && activeChallengeLevel < 3 && (
                <button
                  type="button"
                  className="mechanical-button mechanical-button--primary"
                  onClick={() => setActiveChallengeLevel((prev) => prev + 1)}
                  style={{ padding: '0.4rem 0.95rem', fontSize: '0.75rem' }}
                >
                  NEXT MISSION (LVL {activeChallengeLevel + 1}) →
                </button>
              )}
            </div>
          </section>

          {/* Prompt card to switch back to Sandbox */}
          <div className="lab-mode-prompt-card lab-mode-prompt-card--muted">
            <div className="lab-mode-prompt-card__content">
              <span className="lab-mode-prompt-card__badge">SANDBOX PLAY</span>
              <h3 className="lab-mode-prompt-card__title">
                Want to experiment without constraints?
              </h3>
              <p className="lab-mode-prompt-card__desc">
                Switch to Explore Mode to move the shoulder and elbow freely without mission targets.
              </p>
            </div>
            <button
              type="button"
              className="mechanical-button"
              onClick={() => onSwitchMode('explore')}
              onPointerEnter={() => setIntent('button', 'EXPLORE')}
              onPointerLeave={clearIntent}
            >
              SWITCH TO EXPLORE SANDBOX →
            </button>
          </div>
        </>
      )}

      {/* ── Section 4: Progressive Disclosure — "SEE THE ENGINEERING" ── */}
      <section className="thermo-deep-dive-grid" aria-label="Kinematic equations and technical data">
        <div className="thermo-equations-card">
          <div className="thermo-equations-card__head">
            <h2 className="thermo-equations-card__title">SEE THE ENGINEERING</h2>
            <span className="thermo-equations-card__badge">FORWARD &amp; INVERSE KINEMATICS</span>
          </div>

          <p className="thermo-equations-card__intro">
            These trigonometric relationships determine hand coordinates and required joint angles:
          </p>

          <div className="thermo-equations-list">
            <div className="thermo-equation-item">
              <span className="thermo-equation-item__title">FORWARD KINEMATICS (END-EFFECTOR POSITION)</span>
              <code className="thermo-equation-item__formula">
                X = L₁·cos(θ₁) + L₂·cos(θ₁ + θ₂)
              </code>
              <code className="thermo-equation-item__formula">
                Y = L₁·sin(θ₁) + L₂·sin(θ₁ + θ₂)
              </code>
              <p className="thermo-equation-item__desc">
                Given shoulder angle θ₁ and elbow angle θ₂, computes the exact Cartesian position of the robot hand.
              </p>
            </div>

            <div className="thermo-equation-item">
              <span className="thermo-equation-item__title">INVERSE KINEMATICS (LAW OF COSINES)</span>
              <code className="thermo-equation-item__formula">
                cos(θ₂) = (X² + Y² − L₁² − L₂²) / (2·L₁·L₂)
              </code>
              <p className="thermo-equation-item__desc">
                This is how the 🤖 AUTO POSITION solver computes the joint angles needed to place the hand at target (X, Y).
              </p>
            </div>
          </div>
        </div>

        <div className="thermo-technical-data-card">
          <div className="thermo-technical-data-card__head">
            <h2 className="thermo-technical-data-card__title">WORKSPACE SPECIFICATIONS</h2>
            <button
              type="button"
              className="thermo-technical-data-card__toggle-btn"
              onClick={() => setShowMoreData((prev) => !prev)}
              aria-expanded={showMoreData}
            >
              {showMoreData ? 'HIDE DETAILS ▲' : 'EXPAND ALL ▼'}
            </button>
          </div>

          <div className="thermo-tech-table">
            <div className="thermo-tech-row">
              <span>Upper Arm Link (L₁)</span>
              <strong>{ROBOT_ARM_CONFIG.link1Length} mm</strong>
            </div>
            <div className="thermo-tech-row">
              <span>Forearm Link (L₂)</span>
              <strong>{ROBOT_ARM_CONFIG.link2Length} mm</strong>
            </div>
            <div className="thermo-tech-row">
              <span>Max Reach (R_max = L₁ + L₂)</span>
              <strong>{ROBOT_ARM_CONFIG.link1Length + ROBOT_ARM_CONFIG.link2Length} mm</strong>
            </div>
            <div className="thermo-tech-row">
              <span>Min Reach (R_min = |L₁ − L₂|)</span>
              <strong>{Math.abs(ROBOT_ARM_CONFIG.link1Length - ROBOT_ARM_CONFIG.link2Length)} mm</strong>
            </div>
          </div>

          {showMoreData && (
            <div className="thermo-technical-expanded">
              <h3 className="thermo-technical-expanded__subtitle">KINEMATIC SINGULARITIES &amp; MULTIPLE SOLUTIONS</h3>
              <div className="thermo-assumptions-list">
                <div className="thermo-assumption-item">
                  <strong className="thermo-assumption-item__title">Boundary Singularity (θ₂ = 0°)</strong>
                  <p className="thermo-assumption-item__statement">
                    When the arm is fully straightened, it loses 1 degree of mobility along the radial vector. The robot cannot move outward any further.
                  </p>
                </div>
                <div className="thermo-assumption-item">
                  <strong className="thermo-assumption-item__title">Multiple Solutions (Elbow-Up vs. Elbow-Down)</strong>
                  <p className="thermo-assumption-item__statement">
                    For any reachable target in the workspace, there are two distinct valid postures: elbow-up (+θ₂) and elbow-down (−θ₂). Robots exploit this property to avoid obstacles.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

// ── Active Fluid Mechanics Flagship Experience ──────────────────────────
interface ActiveFluidProps {
  system: LabSystemConfig
  mode: 'explore' | 'challenge'
  onSwitchMode: (mode: 'explore' | 'challenge') => void
}

function ActiveFluidLab({ system, mode, onSwitchMode }: ActiveFluidProps) {
  const { setIntent, clearIntent } = usePointer()

  const [flowRate, setFlowRate] = useState<number>(FLUID_PARAM_LIMITS.flowRate.default)
  const [throatDiameter, setThroatDiameter] = useState<number>(FLUID_PARAM_LIMITS.throatDiameter.default)
  const [prevFlow, setPrevFlow] = useState<number>(FLUID_PARAM_LIMITS.flowRate.default)
  const [prevThroat, setPrevThroat] = useState<number>(FLUID_PARAM_LIMITS.throatDiameter.default)
  const [activeChallengeLevel, setActiveChallengeLevel] = useState<number>(1)
  const [showMoreData, setShowMoreData] = useState<boolean>(false)

  const handleParamChange = (newFlow: number, newThroat: number) => {
    setPrevFlow(flowRate)
    setPrevThroat(throatDiameter)
    setFlowRate(newFlow)
    setThroatDiameter(newThroat)
  }

  const handleReset = () => {
    setPrevFlow(flowRate)
    setPrevThroat(throatDiameter)
    setFlowRate(FLUID_PARAM_LIMITS.flowRate.default)
    setThroatDiameter(FLUID_PARAM_LIMITS.throatDiameter.default)
  }

  const fluidState = useMemo(
    () => calculateFluidState(flowRate, throatDiameter),
    [flowRate, throatDiameter]
  )

  const explanation = useMemo(
    () => getFluidDynamicExplanation(flowRate, prevFlow, throatDiameter, prevThroat),
    [flowRate, prevFlow, throatDiameter, prevThroat]
  )


  return (
    <div className="mech-lab-system-page">
      <MechLabSystemHeader
        system={system}
        mode={mode}
        onModeChange={onSwitchMode}
      />

      {/* ── Section 1: Main Venturi Flow Apparatus Stage ───────── */}
      <FluidExperimentView
        flowRate={flowRate}
        throatDiameter={throatDiameter}
        onParamChange={handleParamChange}
        onReset={handleReset}
        activeLevel={activeChallengeLevel}
        isChallengeMode={mode === 'challenge'}
        onSwitchMode={onSwitchMode}
        onLevelChange={setActiveChallengeLevel}
      />

      {/* ── Mode 1: EXPLORE FLOW (Sandbox, "What Do You Notice?", Challenge Prompt) ── */}
      {mode === 'explore' && (
        <>
          <section className="fluid-dynamic-reaction" aria-labelledby="dynamic-reaction-title">
            <div className="fluid-dynamic-reaction__header">
              <span className="fluid-dynamic-reaction__badge" aria-hidden="true">●</span>
              <h2 id="dynamic-reaction-title" className="fluid-dynamic-reaction__title">
                WHAT DO YOU NOTICE?
              </h2>
              <span className="fluid-dynamic-reaction__subtitle">
                Real-time physical reaction to your pipe changes
              </span>
            </div>

            <div className="fluid-dynamic-reaction__cards">
              <div className="fluid-dynamic-card">
                <span className="fluid-dynamic-card__step">01</span>
                <span className="fluid-dynamic-card__label">YOU CHANGED:</span>
                <p className="fluid-dynamic-card__content fluid-dynamic-card__content--changed">
                  {explanation.whatChanged}
                </p>
              </div>

              <div className="fluid-dynamic-card fluid-dynamic-card--highlight">
                <span className="fluid-dynamic-card__step">02</span>
                <span className="fluid-dynamic-card__label">THE FLOW RESPONDED:</span>
                <p className="fluid-dynamic-card__content">
                  {explanation.whatHappened}
                </p>
              </div>

              <div className="fluid-dynamic-card">
                <span className="fluid-dynamic-card__step">03</span>
                <span className="fluid-dynamic-card__label">WHY? (PHYSICAL CAUSE):</span>
                <p className="fluid-dynamic-card__content">
                  {explanation.why}
                </p>
              </div>
            </div>
          </section>

          <div className="lab-mode-prompt-card">
            <div className="lab-mode-prompt-card__content">
              <span className="lab-mode-prompt-card__badge">TEST YOUR INTUITION</span>
              <h3 className="lab-mode-prompt-card__title">
                Ready to test your flow balancing skills?
              </h3>
              <p className="lab-mode-prompt-card__desc">
                Take on the &ldquo;VENTURI FLOW BALANCING&rdquo; challenge. Accelerate the flow, generate target pressure drops, and balance high flow without cavitation!
              </p>
            </div>
            <button
              type="button"
              className="mechanical-button mechanical-button--primary"
              onClick={() => onSwitchMode('challenge')}
              onPointerEnter={() => setIntent('button', 'CHALLENGE')}
              onPointerLeave={clearIntent}
            >
              START FLOW CHALLENGE →
            </button>
          </div>
        </>
      )}

      {/* ── Mode 2: CHALLENGE FLOW (Clean Return to Sandbox Prompt) ── */}
      {mode === 'challenge' && (
        <div className="lab-mode-prompt-card lab-mode-prompt-card--muted">
          <div className="lab-mode-prompt-card__content">
            <span className="lab-mode-prompt-card__badge">SANDBOX PLAY</span>
            <h3 className="lab-mode-prompt-card__title">
              Want to experiment without constraints?
            </h3>
            <p className="lab-mode-prompt-card__desc">
              Switch to Explore Mode to tweak pump flow rate and throat diameter freely without mission targets.
            </p>
          </div>
          <button
            type="button"
            className="mechanical-button"
            onClick={() => onSwitchMode('explore')}
            onPointerEnter={() => setIntent('button', 'EXPLORE')}
            onPointerLeave={clearIntent}
          >
            SWITCH TO EXPLORE SANDBOX →
          </button>
        </div>
      )}

      {/* ── Section 4: Progressive Disclosure — "SEE THE ENGINEERING" ── */}
      <section className="fluid-deep-dive-grid" aria-label="Engineering equations and technical fluid data">
        <div className="fluid-equations-card">
          <div className="fluid-equations-card__head">
            <h2 className="fluid-equations-card__title">SEE THE ENGINEERING</h2>
            <span className="fluid-equations-card__badge">GOVERNING EQUATIONS</span>
          </div>

          <p className="thermo-equations-card__intro">
            These fundamental physical conservation laws govern fluid flow through variable-area conduits:
          </p>

          <div className="fluid-equations-list">
            {FLUID_EQUATIONS.map((eq, i) => (
              <div key={i} className="fluid-equation-item">
                <span className="fluid-equation-item__title">{eq.title}</span>
                <code className="fluid-equation-item__formula">{eq.formula}</code>
                <p className="fluid-equation-item__desc">{eq.explanation}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="fluid-technical-data-card">
          <div className="fluid-technical-data-card__head">
            <h2 className="fluid-technical-data-card__title">ENGINEERING DATA</h2>
            <button
              type="button"
              className="fluid-technical-data-card__toggle-btn"
              onClick={() => setShowMoreData((prev) => !prev)}
              aria-expanded={showMoreData}
            >
              {showMoreData ? 'HIDE DETAILS ▲' : 'EXPAND ALL ▼'}
            </button>
          </div>

          <div className="fluid-tech-table">
            <div className="fluid-tech-row">
              <span>Inlet Area (A₁)</span>
              <strong>{(fluidState.inlet.area * 1e4).toFixed(2)} cm²</strong>
            </div>
            <div className="fluid-tech-row">
              <span>Throat Area (A₂)</span>
              <strong>{(fluidState.throat.area * 1e4).toFixed(2)} cm²</strong>
            </div>
            <div className="fluid-tech-row">
              <span>Area Constriction Ratio</span>
              <strong>{(fluidState.inlet.area / fluidState.throat.area).toFixed(2)}:1</strong>
            </div>
            <div className="fluid-tech-row">
              <span>Inlet Dynamic Pressure</span>
              <strong>{fluidState.inlet.dynamicPressure.toFixed(2)} kPa</strong>
            </div>
            <div className="fluid-tech-row">
              <span>Throat Dynamic Pressure</span>
              <strong>{fluidState.throat.dynamicPressure.toFixed(2)} kPa</strong>
            </div>
            <div className="fluid-tech-row">
              <span>Manometer Deflection (Δh)</span>
              <strong>{fluidState.manometerDeltaH.toFixed(1)} mm</strong>
            </div>
          </div>

          {showMoreData && (
            <div className="thermo-technical-expanded">
              <h3 className="thermo-technical-expanded__subtitle">HYDRODYNAMIC REGIMES &amp; ASSUMPTIONS</h3>
              <div className="thermo-assumptions-list">
                <div className="thermo-assumption-item">
                  <strong className="thermo-assumption-item__title">Incompressibility (ρ = const)</strong>
                  <p className="thermo-assumption-item__statement">
                    Liquids such as water have extremely low compressibility. Fluid density remains constant at 1,000 kg/m³, making continuity Q = A₁V₁ = A₂V₂ exact.
                  </p>
                </div>
                <div className="thermo-assumption-item">
                  <strong className="thermo-assumption-item__title">Diffuser Head Loss (η ≈ 88%)</strong>
                  <p className="thermo-assumption-item__statement">
                    In the diverging section, boundary-layer growth causes slight turbulence losses. Approximately 88% of dynamic pressure converts back into static pressure.
                  </p>
                </div>
                <div className="thermo-assumption-item">
                  <strong className="thermo-assumption-item__title">Vapor Pressure &amp; Cavitation</strong>
                  <p className="thermo-assumption-item__statement">
                    If static pressure drops below water vapor pressure (~3.2 kPa at 25°C), microscopic vapor bubbles form and collapse violently (cavitation), eroding pipe walls.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

// ── Active Automotive Flagship Experience ──────────────────────────────
interface ActiveAutomotiveProps {
  system: LabSystemConfig
  mode: 'explore' | 'challenge'
  onSwitchMode: (mode: 'explore' | 'challenge') => void
}

function ActiveAutomotiveLab({ system, mode, onSwitchMode }: ActiveAutomotiveProps) {
  const { setIntent, clearIntent } = usePointer()

  const [power, setPower] = useState<number>(AUTOMOTIVE_LIMITS.power.default)
  const [grip, setGrip] = useState<number>(AUTOMOTIVE_LIMITS.grip.default)
  const [braking, setBraking] = useState<number>(AUTOMOTIVE_LIMITS.braking.default)
  const [steering, setSteering] = useState<number>(AUTOMOTIVE_LIMITS.steering.default)

  const [prevPower, setPrevPower] = useState<number>(AUTOMOTIVE_LIMITS.power.default)
  const [prevGrip, setPrevGrip] = useState<number>(AUTOMOTIVE_LIMITS.grip.default)
  const [prevBraking, setPrevBraking] = useState<number>(AUTOMOTIVE_LIMITS.braking.default)
  const [prevSteering, setPrevSteering] = useState<number>(AUTOMOTIVE_LIMITS.steering.default)

  const [activeChallengeLevel, setActiveChallengeLevel] = useState<number>(1)
  const [showMoreData, setShowMoreData] = useState<boolean>(false)

  const handleParamChange = (newPower: number, newGrip: number, newBraking: number, newSteering: number) => {
    setPrevPower(power)
    setPrevGrip(grip)
    setPrevBraking(braking)
    setPrevSteering(steering)
    setPower(newPower)
    setGrip(newGrip)
    setBraking(newBraking)
    setSteering(newSteering)
  }

  const handleReset = () => {
    setPrevPower(power)
    setPrevGrip(grip)
    setPrevBraking(braking)
    setPrevSteering(steering)
    setPower(AUTOMOTIVE_LIMITS.power.default)
    setGrip(AUTOMOTIVE_LIMITS.grip.default)
    setBraking(AUTOMOTIVE_LIMITS.braking.default)
    setSteering(AUTOMOTIVE_LIMITS.steering.default)
  }

  const perf = useMemo(
    () => calculateAutomotivePerformance({ power, grip, braking, steering }),
    [power, grip, braking, steering]
  )

  const explanation = useMemo(
    () =>
      getAutomotiveDynamicExplanation(
        { power, grip, braking, steering },
        { power: prevPower, grip: prevGrip, braking: prevBraking, steering: prevSteering }
      ),
    [power, grip, braking, steering, prevPower, prevGrip, prevBraking, prevSteering]
  )


  return (
    <div className="mech-lab-system-page">
      <MechLabSystemHeader
        system={system}
        mode={mode}
        onModeChange={onSwitchMode}
      />

      {/* ── Section 1: Main Interactive Car Stage ─────────────── */}
      <AutomotiveExperimentView
        power={power}
        grip={grip}
        braking={braking}
        steering={steering}
        onParamChange={handleParamChange}
        onReset={handleReset}
        activeLevel={activeChallengeLevel}
        isChallengeMode={mode === 'challenge'}
        onSwitchMode={onSwitchMode}
        onLevelChange={setActiveChallengeLevel}
      />

      {/* ── Mode 1: EXPLORE FLOW (Sandbox, "What's Happening?", Deep Dive) ── */}
      {mode === 'explore' && (
        <>
          <section className="auto-dynamic-reaction" aria-labelledby="dynamic-reaction-title">
            <div className="auto-dynamic-reaction__header">
              <span className="auto-dynamic-reaction__badge" aria-hidden="true">●</span>
              <h2 id="dynamic-reaction-title" className="auto-dynamic-reaction__title">
                WHAT&apos;S HAPPENING?
              </h2>
              <span className="auto-dynamic-reaction__subtitle">
                Real-time physical reaction to your vehicle setup
              </span>
            </div>

            <div className="auto-dynamic-reaction__cards">
              <div className="auto-dynamic-card">
                <span className="auto-dynamic-card__step">01</span>
                <span className="auto-dynamic-card__label">YOU CHANGED:</span>
                <p className="auto-dynamic-card__content auto-dynamic-card__content--changed">
                  {explanation.whatChanged}
                </p>
              </div>

              <div className="auto-dynamic-card auto-dynamic-card--highlight">
                <span className="auto-dynamic-card__step">02</span>
                <span className="auto-dynamic-card__label">THE CAR RESPONDED:</span>
                <p className="auto-dynamic-card__content">
                  {explanation.whatHappened}
                </p>
              </div>

              <div className="auto-dynamic-card">
                <span className="auto-dynamic-card__step">03</span>
                <span className="auto-dynamic-card__label">WHY? (PHYSICAL CAUSE):</span>
                <p className="auto-dynamic-card__content">
                  {explanation.why}
                </p>
              </div>
            </div>
          </section>

          <div className="lab-mode-prompt-card">
            <div className="lab-mode-prompt-card__content">
              <span className="lab-mode-prompt-card__badge">TEST YOUR SETUP</span>
              <h3 className="lab-mode-prompt-card__title">
                Ready to take on track challenges?
              </h3>
              <p className="lab-mode-prompt-card__desc">
                Test your machine in the &ldquo;PERFECT CAR BALANCE&rdquo; challenge. Nail a 0–100 sprint, stop in tight braking zones, and carve high-speed corners!
              </p>
            </div>
            <button
              type="button"
              className="mechanical-button mechanical-button--primary"
              onClick={() => onSwitchMode('challenge')}
              onPointerEnter={() => setIntent('button', 'CHALLENGE')}
              onPointerLeave={clearIntent}
            >
              START TRACK CHALLENGE →
            </button>
          </div>
        </>
      )}

      {/* ── Mode 2: CHALLENGE FLOW (Clean Return to Sandbox Prompt) ── */}
      {mode === 'challenge' && (
        <div className="lab-mode-prompt-card lab-mode-prompt-card--muted">
          <div className="lab-mode-prompt-card__content">
            <span className="lab-mode-prompt-card__badge">SANDBOX PLAY</span>
            <h3 className="lab-mode-prompt-card__title">
              Want to tweak your build freely?
            </h3>
            <p className="lab-mode-prompt-card__desc">
              Switch to Explore Mode to tune Power, Grip, Braking, and Steering without mission constraints.
            </p>
          </div>
          <button
            type="button"
            className="mechanical-button"
            onClick={() => onSwitchMode('explore')}
            onPointerEnter={() => setIntent('button', 'EXPLORE')}
            onPointerLeave={clearIntent}
          >
            SWITCH TO EXPLORE SANDBOX →
          </button>
        </div>
      )}

      {/* ── Section 4: Progressive Disclosure — "SEE THE ENGINEERING" ── */}
      <section className="auto-deep-dive-grid" aria-label="Vehicle dynamics equations and technical data">
        <div className="auto-equations-card">
          <div className="auto-equations-card__head">
            <h2 className="auto-equations-card__title">SEE THE ENGINEERING</h2>
            <span className="auto-equations-card__badge">GOVERNING DYNAMICS</span>
          </div>

          <p className="thermo-equations-card__intro">
            These physical laws govern vehicle acceleration, braking limits, and cornering adhesion:
          </p>

          <div className="auto-equations-list">
            {AUTOMOTIVE_EQUATIONS.map((eq, i) => (
              <div key={i} className="auto-equation-item">
                <span className="auto-equation-item__title">{eq.title}</span>
                <code className="auto-equation-item__formula">{eq.formula}</code>
                <p className="auto-equation-item__desc">{eq.explanation}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="auto-technical-data-card">
          <div className="auto-technical-data-card__head">
            <h2 className="auto-technical-data-card__title">ENGINEERING DATA</h2>
            <button
              type="button"
              className="auto-technical-data-card__toggle-btn"
              onClick={() => setShowMoreData((prev) => !prev)}
              aria-expanded={showMoreData}
            >
              {showMoreData ? 'HIDE DETAILS ▲' : 'EXPAND ALL ▼'}
            </button>
          </div>

          <div className="auto-tech-table">
            <div className="auto-tech-row">
              <span>Curb Weight</span>
              <strong>1,250 kg</strong>
            </div>
            <div className="auto-tech-row">
              <span>Drive Force (F_drive)</span>
              <strong>{perf.driveForceN.toLocaleString()} N</strong>
            </div>
            <div className="auto-tech-row">
              <span>Max Road Grip (F_friction)</span>
              <strong>{perf.maxTractionN.toLocaleString()} N</strong>
            </div>
            <div className="auto-tech-row">
              <span>Forward Acceleration</span>
              <strong>{perf.accelerationMps2.toFixed(2)} m/s² ({perf.accelerationG.toFixed(2)}g)</strong>
            </div>
            <div className="auto-tech-row">
              <span>Braking Deceleration</span>
              <strong>{perf.brakeDecelMps2.toFixed(2)} m/s²</strong>
            </div>
            <div className="auto-tech-row">
              <span>Lateral Cornering Load</span>
              <strong>{perf.lateralAccG.toFixed(2)}g</strong>
            </div>
          </div>

          {showMoreData && (
            <div className="thermo-technical-expanded">
              <h3 className="thermo-technical-expanded__subtitle">TIRE FRICTION &amp; WEIGHT TRANSFER</h3>
              <div className="thermo-assumptions-list">
                <div className="thermo-assumption-item">
                  <strong className="thermo-assumption-item__title">Dynamic Weight Transfer</strong>
                  <p className="thermo-assumption-item__statement">
                    Under acceleration, inertial reaction loads the rear axle and unloads the front (squat). Under heavy braking, weight shifts forward onto the front tires (dive).
                  </p>
                </div>
                <div className="thermo-assumption-item">
                  <strong className="thermo-assumption-item__title">Coulomb Friction Boundary (μ)</strong>
                  <p className="thermo-assumption-item__statement">
                    Tire adhesion is modeled via Coulomb friction. When vector sum of lateral and longitudinal forces exceeds μ·N, the contact patch transitions from static grip to sliding friction.
                  </p>
                </div>
                <div className="thermo-assumption-item">
                  <strong className="thermo-assumption-item__title">Aerodynamic Downforce &amp; Drag</strong>
                  <p className="thermo-assumption-item__statement">
                    At higher velocities, aerodynamic drag opposes forward motion (proportional to v²), while spoilers generate downforce that increases tire normal load N without adding mass.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

// ── Active Design Flagship Experience ──────────────────────────────────
interface ActiveDesignProps {
  system: LabSystemConfig
  mode: 'explore' | 'challenge'
  onSwitchMode: (mode: 'explore' | 'challenge') => void
}

function ActiveDesignLab({ system, mode, onSwitchMode }: ActiveDesignProps) {
  const { setIntent, clearIntent } = usePointer()

  const [lengthM, setLengthM] = useState<number>(BEAM_LIMITS.lengthM.default)
  const [widthMm, setWidthMm] = useState<number>(BEAM_LIMITS.widthMm.default)
  const [heightMm, setHeightMm] = useState<number>(BEAM_LIMITS.heightMm.default)
  const [loadKn, setLoadKn] = useState<number>(BEAM_LIMITS.loadKn.default)
  const [materialId, setMaterialId] = useState<MaterialId>('steel')

  const [prevParams, setPrevParams] = useState({
    lengthM: BEAM_LIMITS.lengthM.default,
    widthMm: BEAM_LIMITS.widthMm.default,
    heightMm: BEAM_LIMITS.heightMm.default,
    loadKn: BEAM_LIMITS.loadKn.default,
    materialId: 'steel' as MaterialId,
  })

  const [activeChallengeLevel, setActiveChallengeLevel] = useState<number>(1)
  const [showMoreData, setShowMoreData] = useState<boolean>(false)

  const handleParamChange = (
    newL: number,
    newW: number,
    newH: number,
    newF: number,
    newMat: MaterialId
  ) => {
    setPrevParams({ lengthM, widthMm, heightMm, loadKn, materialId })
    setLengthM(newL)
    setWidthMm(newW)
    setHeightMm(newH)
    setLoadKn(newF)
    setMaterialId(newMat)
  }

  const handleReset = () => {
    setPrevParams({ lengthM, widthMm, heightMm, loadKn, materialId })
    setLengthM(BEAM_LIMITS.lengthM.default)
    setWidthMm(BEAM_LIMITS.widthMm.default)
    setHeightMm(BEAM_LIMITS.heightMm.default)
    setLoadKn(BEAM_LIMITS.loadKn.default)
    setMaterialId('steel')
  }

  const analysis = useMemo(
    () => calculateBeamAnalysis({ lengthM, widthMm, heightMm, loadKn, materialId }),
    [lengthM, widthMm, heightMm, loadKn, materialId]
  )

  const explanation = useMemo(
    () =>
      getBeamDynamicExplanation(
        { lengthM, widthMm, heightMm, loadKn, materialId },
        prevParams
      ),
    [lengthM, widthMm, heightMm, loadKn, materialId, prevParams]
  )

  return (
    <div className="mech-lab-system-page">
      <MechLabSystemHeader
        system={system}
        mode={mode}
        onModeChange={onSwitchMode}
      />

      {/* ── Section 1: Main 3D CAD Beam Canvas Stage ────────── */}
      <DesignExperimentView
        lengthM={lengthM}
        widthMm={widthMm}
        heightMm={heightMm}
        loadKn={loadKn}
        materialId={materialId}
        onParamChange={handleParamChange}
        onReset={handleReset}
        activeLevel={activeChallengeLevel}
        isChallengeMode={mode === 'challenge'}
        onSwitchMode={onSwitchMode}
        onLevelChange={setActiveChallengeLevel}
      />

      {/* ── Mode 1: EXPLORE FLOW (Sandbox, "What's Happening?", Deep Dive) ── */}
      {mode === 'explore' && (
        <>
          <section className="design-dynamic-reaction" aria-labelledby="dynamic-reaction-title">
            <div className="design-dynamic-reaction__header">
              <span className="design-dynamic-reaction__badge" aria-hidden="true">●</span>
              <h2 id="dynamic-reaction-title" className="design-dynamic-reaction__title">
                WHAT&apos;S HAPPENING?
              </h2>
              <span className="design-dynamic-reaction__subtitle">
                Real-time structural reaction to your geometry and loading
              </span>
            </div>

            <div className="design-dynamic-reaction__cards">
              <div className="design-dynamic-card">
                <span className="design-dynamic-card__step">01</span>
                <span className="design-dynamic-card__label">YOU CHANGED:</span>
                <p className="design-dynamic-card__content design-dynamic-card__content--changed">
                  {explanation.whatChanged}
                </p>
              </div>

              <div className="design-dynamic-card design-dynamic-card--highlight">
                <span className="design-dynamic-card__step">02</span>
                <span className="design-dynamic-card__label">THE BEAM RESPONDED:</span>
                <p className="design-dynamic-card__content">
                  {explanation.whatHappened}
                </p>
              </div>

              <div className="design-dynamic-card">
                <span className="design-dynamic-card__step">03</span>
                <span className="design-dynamic-card__label">WHY? (PHYSICAL CAUSE):</span>
                <p className="design-dynamic-card__content">
                  {explanation.why}
                </p>
              </div>
            </div>
          </section>

          <div className="lab-mode-prompt-card">
            <div className="lab-mode-prompt-card__content">
              <span className="lab-mode-prompt-card__badge">TEST YOUR INTUITION</span>
              <h3 className="lab-mode-prompt-card__title">
                Ready to take on structural optimization missions?
              </h3>
              <p className="lab-mode-prompt-card__desc">
                Put your design intuition to the test in the &ldquo;STRUCTURAL BEAM OPTIMIZATION&rdquo; challenge. Survive heavy loads, engineer ultra-lightweight spars, and control precision tip deflection!
              </p>
            </div>
            <button
              type="button"
              className="mechanical-button mechanical-button--primary"
              onClick={() => onSwitchMode('challenge')}
              onPointerEnter={() => setIntent('button', 'CHALLENGE')}
              onPointerLeave={clearIntent}
            >
              START DESIGN CHALLENGE →
            </button>
          </div>
        </>
      )}

      {/* ── Mode 2: CHALLENGE FLOW (Clean Return to Sandbox Prompt) ── */}
      {mode === 'challenge' && (
        <div className="lab-mode-prompt-card lab-mode-prompt-card--muted">
          <div className="lab-mode-prompt-card__content">
            <span className="lab-mode-prompt-card__badge">SANDBOX PLAY</span>
            <h3 className="lab-mode-prompt-card__title">
              Want to design and test freely?
            </h3>
            <p className="lab-mode-prompt-card__desc">
              Switch to Explore Mode to tweak beam span, cross-section profile, materials, and loads without mission constraints.
            </p>
          </div>
          <button
            type="button"
            className="mechanical-button"
            onClick={() => onSwitchMode('explore')}
            onPointerEnter={() => setIntent('button', 'EXPLORE')}
            onPointerLeave={clearIntent}
          >
            SWITCH TO EXPLORE SANDBOX →
          </button>
        </div>
      )}

      {/* ── Section 4: Progressive Disclosure — "SEE THE ENGINEERING" ── */}
      <section className="design-deep-dive-grid" aria-label="Euler-Bernoulli equations and technical structural data">
        <div className="design-equations-card">
          <div className="design-equations-card__head">
            <h2 className="design-equations-card__title">SEE THE ENGINEERING</h2>
            <span className="design-equations-card__badge">EULER-BERNOULLI BEAM THEORY</span>
          </div>

          <p className="thermo-equations-card__intro">
            These structural mechanics equations govern bending stress, moment of inertia, and elastic deflection:
          </p>

          <div className="design-equations-list">
            {DESIGN_EQUATIONS.map((eq, i) => (
              <div key={i} className="design-equation-item">
                <span className="design-equation-item__title">{eq.title}</span>
                <code className="design-equation-item__formula">{eq.formula}</code>
                <p className="design-equation-item__desc">{eq.explanation}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="design-technical-data-card">
          <div className="design-technical-data-card__head">
            <h2 className="design-technical-data-card__title">ENGINEERING DATA</h2>
            <button
              type="button"
              className="design-technical-data-card__toggle-btn"
              onClick={() => setShowMoreData((prev) => !prev)}
              aria-expanded={showMoreData}
            >
              {showMoreData ? 'HIDE DETAILS ▲' : 'EXPAND ALL ▼'}
            </button>
          </div>

          <div className="design-tech-table">
            <div className="design-tech-row">
              <span>Selected Material</span>
              <strong>{analysis.material.name}</strong>
            </div>
            <div className="design-tech-row">
              <span>Cross-Section Area (A)</span>
              <strong>{(analysis.crossSectionAreaM2 * 1e4).toFixed(1)} cm²</strong>
            </div>
            <div className="design-tech-row">
              <span>Moment of Inertia (I_xx)</span>
              <strong>{(analysis.momentOfInertiaM4 * 1e8).toFixed(2)} ×10⁻⁴ m⁴</strong>
            </div>
            <div className="design-tech-row">
              <span>Section Modulus (Z)</span>
              <strong>{(analysis.sectionModulusM3 * 1e6).toFixed(1)} cm³</strong>
            </div>
            <div className="design-tech-row">
              <span>Max Bending Moment (M_max)</span>
              <strong>{(analysis.maxBendingMomentNm / 1000).toFixed(1)} kN·m</strong>
            </div>
            <div className="design-tech-row">
              <span>Total Beam Mass (m)</span>
              <strong>{analysis.massKg.toFixed(1)} kg</strong>
            </div>
          </div>

          {showMoreData && (
            <div className="thermo-technical-expanded">
              <h3 className="thermo-technical-expanded__subtitle">BEAM MECHANICS &amp; ASSUMPTIONS</h3>
              <div className="thermo-assumptions-list">
                <div className="thermo-assumption-item">
                  <strong className="thermo-assumption-item__title">Euler-Bernoulli Hypothesis</strong>
                  <p className="thermo-assumption-item__statement">
                    Plane sections perpendicular to the longitudinal axis remain plane and perpendicular after bending. Valid for slender beams (L/h &gt; 10) where shear deformation is negligible.
                  </p>
                </div>
                <div className="thermo-assumption-item">
                  <strong className="thermo-assumption-item__title">Cubic Stiffness Efficiency (h³)</strong>
                  <p className="thermo-assumption-item__statement">
                    Because area moment of inertia scales with h³, placing material further from the neutral axis provides exponentially more flexural rigidity per kilogram than widening the beam.
                  </p>
                </div>
                <div className="thermo-assumption-item">
                  <strong className="thermo-assumption-item__title">Elastic Limit &amp; Plastic Yielding</strong>
                  <p className="thermo-assumption-item__statement">
                    Calculations assume Hooke's Law (σ = E·ε). When max bending stress exceeds yield strength σ_y (FoS &lt; 1.0), permanent plastic deformation and structural collapse occur.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

// ── Main Page Router Component ─────────────────────────────────────────
export function MechLabSystemPage() {
  const { systemId } = useParams<{ systemId: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const rawMode = searchParams.get('mode')
  const mode = rawMode === 'challenge' ? 'challenge' : 'explore'

  const handleModeChange = (newMode: 'explore' | 'challenge') => {
    setSearchParams({ mode: newMode })
  }

  const system = labSystemsData.find((s) => s.id === systemId)

  if (!system) {
    return (
      <MechLabShell>
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <h1 className="heading-md" style={{ marginBottom: '1rem' }}>
            SYSTEM NOT RECOGNIZED
          </h1>
          <p className="body-small" style={{ marginBottom: '2rem', color: 'var(--color-text-muted)' }}>
            The requested engineering domain &ldquo;{systemId}&rdquo; is not part of Mech Lab.
          </p>
          <Link to="/lab" className="mechanical-button mechanical-button--primary">
            RETURN TO MECH LAB
          </Link>
        </div>
      </MechLabShell>
    )
  }

  return (
    <MechLabShell>
      <title>{system.title} — Mech Lab | MechESA IIT Indore</title>
      <meta
        name="description"
        content={`${system.exploreDescription} Explore ${system.title} interactively in the MechESA Mech Lab at IIT Indore.`}
      />

      {system.id === 'thermodynamics' ? (
        <ActiveThermodynamicsLab
          system={system}
          mode={mode}
          onSwitchMode={handleModeChange}
        />
      ) : system.id === 'robotics' ? (
        <ActiveRoboticsLab
          system={system}
          mode={mode}
          onSwitchMode={handleModeChange}
        />
      ) : system.id === 'fluid' ? (
        <ActiveFluidLab
          system={system}
          mode={mode}
          onSwitchMode={handleModeChange}
        />
      ) : system.id === 'automotive' ? (
        <ActiveAutomotiveLab
          system={system}
          mode={mode}
          onSwitchMode={handleModeChange}
        />
      ) : system.id === 'design' ? (
        <ActiveDesignLab
          system={system}
          mode={mode}
          onSwitchMode={handleModeChange}
        />
      ) : (
        <div className="mech-lab-system-page">
          <MechLabSystemHeader
            system={system}
            mode={mode}
            onModeChange={handleModeChange}
          />
          <GenericSystemInstrument
            system={system}
            mode={mode}
            onSwitchMode={handleModeChange}
          />
        </div>
      )}
    </MechLabShell>
  )
}
