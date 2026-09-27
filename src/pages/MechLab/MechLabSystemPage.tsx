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
  FLUID_PARAM_LIMITS,
} from '../../components/mechLab/experiments/fluidModel'
import {
  FLUID_FLAGSHIP_CHALLENGE,
  FLUID_LEVELS,
} from '../../components/mechLab/experiments/fluidChallenge'
import { AutomotiveExperimentView } from '../../components/mechLab/experiments/AutomotiveExperimentView'
import {
  calculateAutomotivePerformance,
  getAutomotiveDynamicExplanation,
  AUTOMOTIVE_LIMITS,
} from '../../components/mechLab/experiments/automotiveModel'
import {
  AUTOMOTIVE_FLAGSHIP_CHALLENGE,
  AUTOMOTIVE_LEVELS,
} from '../../components/mechLab/experiments/automotiveChallenge'
import { DesignExperimentView } from '../../components/mechLab/experiments/DesignExperimentView'
import {
  calculateBeamAnalysis,
  getBeamDynamicExplanation,
  BEAM_LIMITS,
  type MaterialId,
} from '../../components/mechLab/experiments/designModel'
import {
  DESIGN_FLAGSHIP_CHALLENGE,
  DESIGN_LEVELS,
} from '../../components/mechLab/experiments/designChallenge'
import { MaterialsExperimentView } from '../../components/mechLab/experiments/MaterialsExperimentView'
import {
  calculateMaterialsAnalysis,
  getMaterialsDynamicExplanation,
  DEFAULT_SPECIMEN_PARAMS,
  type SpecimenParams,
} from '../../components/mechLab/experiments/materialsModel'
import {
  MATERIALS_FLAGSHIP_CHALLENGE,
  MATERIALS_LEVELS,
} from '../../components/mechLab/experiments/materialsChallenge'
import { ManufacturingExperimentView } from '../../components/mechLab/experiments/ManufacturingExperimentView'
import {
  calculateManufacturingAnalysis,
  getManufacturingDynamicExplanation,
  DEFAULT_MANUFACTURING_PARAMS,
  type ManufacturingParams,
} from '../../components/mechLab/experiments/manufacturingModel'
import {
  MANUFACTURING_FLAGSHIP_CHALLENGE,
  MANUFACTURING_LEVELS,
} from '../../components/mechLab/experiments/manufacturingChallenge'
import { MechatronicsExperimentView } from '../../components/mechLab/experiments/MechatronicsExperimentView'
import {
  calculateMechatronicsAnalysis,
  getMechatronicsDynamicExplanation,
  DEFAULT_MECHATRONICS_PARAMS,
  type MechatronicsParams,
} from '../../components/mechLab/experiments/mechatronicsModel'
import {
  MECHATRONICS_FLAGSHIP_CHALLENGE,
  MECHATRONICS_LEVELS,
} from '../../components/mechLab/experiments/mechatronicsChallenge'
import { MechLabHint } from '../../components/mechLab/shared/MechLabHint'

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
          <section className="thermo-dynamic-grid" aria-label="Live physical explanation of parameter changes">
            <div className="thermo-dynamic-grid__head">
              <span className="thermo-dynamic-grid__badge">LIVE THERMODYNAMIC REACTION</span>
              <h2 className="thermo-dynamic-grid__title">
                WHAT&apos;S HAPPENING?
              </h2>
              <p className="thermo-dynamic-grid__subtitle">
                Real-time physical reaction to your parameter changes
              </p>
            </div>

            <div className="thermo-dynamic-cards">
              <div className="design-dynamic-card">
                <span className="design-dynamic-card__step">01</span>
                <span className="design-dynamic-card__label">YOU CHANGED:</span>
                <p className="design-dynamic-card__content design-dynamic-card__content--changed">
                  {explanation.whatChanged}
                </p>
              </div>

              <div className="design-dynamic-card design-dynamic-card--highlight">
                <span className="design-dynamic-card__step">02</span>
                <span className="design-dynamic-card__label">THE ENGINE RESPONDED:</span>
                <p className="design-dynamic-card__content">
                  {explanation.whatHappened}
                </p>
              </div>

              <div className="design-dynamic-card">
                <span className="design-dynamic-card__step">03</span>
                <span className="design-dynamic-card__label">WHY? (PHYSICAL PRINCIPLE):</span>
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
              <strong>Mission:</strong> {THERMODYNAMICS_LEVELS[activeChallengeLevel - 1].objective}
              <MechLabHint hint={THERMODYNAMICS_LEVELS[activeChallengeLevel - 1].hint} />
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

            <div className="thermo-challenge-section__actions" style={{ gap: '0.75rem' }}>
              <button
                type="button"
                className="thermo-challenge-reset-button"
                onClick={handleResetChallenge}
                onPointerEnter={() => setIntent('button', 'RESET CHALLENGE')}
                onPointerLeave={clearIntent}
              >
                RESET CHALLENGE PARAMETERS
              </button>
              {challengeEval.isPassed && activeChallengeLevel < 3 && (
                <button
                  type="button"
                  className="mechanical-button mechanical-button--primary"
                  onClick={() => setActiveChallengeLevel((prev) => Math.min(3, prev + 1))}
                  onPointerEnter={() => setIntent('button', 'NEXT LEVEL')}
                  onPointerLeave={clearIntent}
                >
                  NEXT LEVEL →
                </button>
              )}
              {challengeEval.isPassed && activeChallengeLevel === 3 && (
                <div className="thermo-challenge-complete-banner">
                  ★ ALL 3 THERMODYNAMICS MISSIONS MASTERED! POWER SYSTEMS ENGINEER ACHIEVED ★
                </div>
              )}
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
            <div className="thermo-equation-item">
              <span className="thermo-equation-item__title">Thermal Efficiency (Air-Standard Otto)</span>
              <div className="math-equation" role="math" aria-label="eta thermal equals 1 minus 1 divided by (r to the power of gamma minus 1)">
                <span className="math-symbol">η<sub className="math-sub">th</sub></span>
                <span className="math-op">=</span>
                <span>1</span>
                <span className="math-op">−</span>
                <div className="math-fraction">
                  <span className="math-fraction__num">1</span>
                  <span className="math-fraction__den">
                    <span className="math-symbol">r</span><sup className="math-sup">γ − 1</sup>
                  </span>
                </div>
              </div>
              <p className="thermo-equation-item__desc">
                Efficiency depends solely on compression ratio r and specific heat ratio γ (1.4 for air). Higher compression squeezes more expansion work from the fuel.
              </p>
            </div>

            <div className="thermo-equation-item">
              <span className="thermo-equation-item__title">Ideal Gas State Equation</span>
              <div className="math-equation" role="math" aria-label="P times V equals m times R times T">
                <span className="math-symbol">P</span>
                <span className="math-op">·</span>
                <span className="math-symbol">V</span>
                <span className="math-op">=</span>
                <span className="math-symbol">m</span>
                <span className="math-op">·</span>
                <span className="math-symbol">R</span>
                <span className="math-op">·</span>
                <span className="math-symbol">T</span>
              </div>
              <p className="thermo-equation-item__desc">
                Relates cylinder pressure P, trapped volume V, charge mass m, gas constant R, and absolute temperature T across all four cycle states.
              </p>
            </div>

            <div className="thermo-equation-item">
              <span className="thermo-equation-item__title">Net Work Output (Enclosed P-V Area)</span>
              <div className="math-equation" role="math" aria-label="W net equals Q in minus Q out equals eta thermal times Q in equals integral P dV">
                <span className="math-symbol">W<sub className="math-sub">net</sub></span>
                <span className="math-op">=</span>
                <span className="math-symbol">Q<sub className="math-sub">in</sub></span>
                <span className="math-op">−</span>
                <span className="math-symbol">Q<sub className="math-sub">out</sub></span>
                <span className="math-op">=</span>
                <span className="math-symbol">η<sub className="math-sub">th</sub></span>
                <span className="math-op">·</span>
                <span className="math-symbol">Q<sub className="math-sub">in</sub></span>
                <span className="math-op">=</span>
                <span className="math-op">∮</span>
                <span className="math-symbol">P</span>
                <span className="math-op">·</span>
                <span>dV</span>
              </div>
              <p className="thermo-equation-item__desc">
                The area enclosed inside the P-V loop represents the net mechanical work produced per engine cycle.
              </p>
            </div>
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
          <section className="thermo-dynamic-grid" aria-label="Live physical explanation of robot kinematics">
            <div className="thermo-dynamic-grid__head">
              <span className="thermo-dynamic-grid__badge">LIVE ROBOTICS REACTION</span>
              <h2 className="thermo-dynamic-grid__title">
                WHAT&apos;S HAPPENING?
              </h2>
              <p className="thermo-dynamic-grid__subtitle">
                Physical consequence of moving the robot joints
              </p>
            </div>

            <div className="thermo-dynamic-cards">
              <div className="design-dynamic-card">
                <span className="design-dynamic-card__step">01</span>
                <span className="design-dynamic-card__label">YOU CHANGED:</span>
                <p className="design-dynamic-card__content design-dynamic-card__content--changed">
                  {explanation.whatChanged}
                </p>
              </div>

              <div className="design-dynamic-card design-dynamic-card--highlight">
                <span className="design-dynamic-card__step">02</span>
                <span className="design-dynamic-card__label">THE ROBOT RESPONDED:</span>
                <p className="design-dynamic-card__content">
                  {explanation.whatHappened}
                </p>
              </div>

              <div className="design-dynamic-card">
                <span className="design-dynamic-card__step">03</span>
                <span className="design-dynamic-card__label">WHY? (PHYSICAL PRINCIPLE):</span>
                <p className="design-dynamic-card__content">
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
              <strong>Mission:</strong> {ROBOTICS_LEVELS[activeChallengeLevel - 1].objective}
              <MechLabHint hint={ROBOTICS_LEVELS[activeChallengeLevel - 1].hint} />
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

              {challengeEval.isPassed && activeChallengeLevel === 3 && (
                <div className="thermo-challenge-complete-banner">
                  ★ ALL 3 ROBOTICS MISSIONS MASTERED! MECHATRONIC ROBOTICS SPECIALIST ACHIEVED ★
                </div>
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
              <div className="math-equation" role="math" aria-label="X equals L 1 cos theta 1 plus L 2 cos (theta 1 plus theta 2)">
                <span className="math-symbol">X</span>
                <span className="math-op">=</span>
                <span className="math-symbol">L<sub className="math-sub">1</sub></span>
                <span className="math-op">·</span>
                <span>cos(θ<sub className="math-sub">1</sub>)</span>
                <span className="math-op">+</span>
                <span className="math-symbol">L<sub className="math-sub">2</sub></span>
                <span className="math-op">·</span>
                <span>cos(θ<sub className="math-sub">1</sub> + θ<sub className="math-sub">2</sub>)</span>
              </div>
              <div className="math-equation" role="math" aria-label="Y equals L 1 sin theta 1 plus L 2 sin (theta 1 plus theta 2)">
                <span className="math-symbol">Y</span>
                <span className="math-op">=</span>
                <span className="math-symbol">L<sub className="math-sub">1</sub></span>
                <span className="math-op">·</span>
                <span>sin(θ<sub className="math-sub">1</sub>)</span>
                <span className="math-op">+</span>
                <span className="math-symbol">L<sub className="math-sub">2</sub></span>
                <span className="math-op">·</span>
                <span>sin(θ<sub className="math-sub">1</sub> + θ<sub className="math-sub">2</sub>)</span>
              </div>
              <p className="thermo-equation-item__desc">
                Given shoulder angle θ₁ and elbow angle θ₂, computes the exact Cartesian position of the robot hand.
              </p>
            </div>

            <div className="thermo-equation-item">
              <span className="thermo-equation-item__title">INVERSE KINEMATICS (LAW OF COSINES)</span>
              <div className="math-equation" role="math" aria-label="cos theta 2 equals (X squared plus Y squared minus L 1 squared minus L 2 squared) divided by (2 times L 1 times L 2)">
                <span>cos(θ<sub className="math-sub">2</sub>)</span>
                <span className="math-op">=</span>
                <div className="math-fraction">
                  <span className="math-fraction__num">
                    <span className="math-symbol">X</span><sup className="math-sup">2</sup>
                    <span className="math-op">+</span>
                    <span className="math-symbol">Y</span><sup className="math-sup">2</sup>
                    <span className="math-op">−</span>
                    <span className="math-symbol">L<sub className="math-sub">1</sub></span><sup className="math-sup">2</sup>
                    <span className="math-op">−</span>
                    <span className="math-symbol">L<sub className="math-sub">2</sub></span><sup className="math-sup">2</sup>
                  </span>
                  <span className="math-fraction__den">
                    2<span className="math-op">·</span><span className="math-symbol">L<sub className="math-sub">1</sub></span><span className="math-op">·</span><span className="math-symbol">L<sub className="math-sub">2</sub></span>
                  </span>
                </div>
              </div>
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

  const challengeEval = useMemo(
    () => FLUID_FLAGSHIP_CHALLENGE.evaluate({ flowRate, throatDiameter }, null, activeChallengeLevel),
    [flowRate, throatDiameter, activeChallengeLevel]
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
          <section className="thermo-dynamic-grid" aria-label="Live physical explanation of flow dynamics">
            <div className="thermo-dynamic-grid__head">
              <span className="thermo-dynamic-grid__badge">LIVE FLUID REACTION</span>
              <h2 className="thermo-dynamic-grid__title">
                WHAT&apos;S HAPPENING?
              </h2>
              <p className="thermo-dynamic-grid__subtitle">
                Real-time physical reaction to your pipe changes
              </p>
            </div>

            <div className="thermo-dynamic-cards">
              <div className="design-dynamic-card">
                <span className="design-dynamic-card__step">01</span>
                <span className="design-dynamic-card__label">YOU CHANGED:</span>
                <p className="design-dynamic-card__content design-dynamic-card__content--changed">
                  {explanation.whatChanged}
                </p>
              </div>

              <div className="design-dynamic-card design-dynamic-card--highlight">
                <span className="design-dynamic-card__step">02</span>
                <span className="design-dynamic-card__label">THE FLOW RESPONDED:</span>
                <p className="design-dynamic-card__content">
                  {explanation.whatHappened}
                </p>
              </div>

              <div className="design-dynamic-card">
                <span className="design-dynamic-card__step">03</span>
                <span className="design-dynamic-card__label">WHY? (PHYSICAL PRINCIPLE):</span>
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

      {/* ── Mode 2: CHALLENGE FLOW (Full Level Progression & Criteria Deck) ── */}
      {mode === 'challenge' && (
        <>
          <section
            id="challenge"
            className={`thermo-challenge-section${challengeEval.isPassed ? ' is-passed' : ''}`}
            aria-labelledby="fluid-challenge-heading"
          >
            <div className="thermo-challenge-section__header">
              <div className="thermo-challenge-section__title-group">
                <div className="thermo-challenge-section__badge">
                  <span>ENGINEERING CHALLENGE</span>
                  <span>// LEVEL {String(activeChallengeLevel).padStart(2, '0')}</span>
                </div>
                <h2 id="fluid-challenge-heading" className="thermo-challenge-section__title">
                  {FLUID_FLAGSHIP_CHALLENGE.title}
                </h2>
                <p className="thermo-challenge-section__desc">
                  {FLUID_FLAGSHIP_CHALLENGE.description}
                </p>
              </div>

              <div
                className={`thermo-challenge-section__status-badge ${
                  challengeEval.isPassed ? 'is-passed' : 'is-unmet'
                }`}
              >
                {challengeEval.isPassed ? 'TARGET REACHED ✓' : challengeEval.status}
              </div>
            </div>

            {/* Level Switcher (LVL 1, LVL 2, LVL 3) */}
            <div className="thermo-challenge-levels" role="tablist" aria-label="Challenge progression levels">
              {FLUID_LEVELS.map((lvl) => (
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
              <strong>Mission:</strong> {FLUID_LEVELS[activeChallengeLevel - 1].objective}
              <MechLabHint hint={FLUID_LEVELS[activeChallengeLevel - 1].hint} />
            </div>

            {/* Target Criteria Live Metrics */}
            <div className="thermo-challenge-criteria-grid">
              {activeChallengeLevel === 1 && (
                <>
                  <div className={`thermo-challenge-target-card${fluidState.throat.velocity >= 4.5 ? ' is-met' : ' is-unmet'}`}>
                    <div className="thermo-challenge-target-card__top">
                      <span className="thermo-challenge-target-card__name">THROAT VELOCITY (V₂)</span>
                      <span className="thermo-challenge-target-card__indicator">
                        {fluidState.throat.velocity >= 4.5 ? 'MET ✓' : 'NOT MET ✕'}
                      </span>
                    </div>
                    <div className="thermo-challenge-target-card__val">
                      {fluidState.throat.velocity.toFixed(2)} <small style={{ fontSize: '0.85rem' }}>m/s</small>
                    </div>
                    <div className="thermo-challenge-target-card__requirement">
                      Target: <strong>≥ 4.50 m/s</strong>
                    </div>
                  </div>

                  <div className={`thermo-challenge-target-card${throatDiameter <= 48 ? ' is-met' : ' is-unmet'}`}>
                    <div className="thermo-challenge-target-card__top">
                      <span className="thermo-challenge-target-card__name">PIPE CONSTRICTION</span>
                      <span className="thermo-challenge-target-card__indicator">
                        {throatDiameter <= 48 ? 'MET ✓' : 'NOT MET ✕'}
                      </span>
                    </div>
                    <div className="thermo-challenge-target-card__val">
                      {throatDiameter} <small style={{ fontSize: '0.85rem' }}>mm</small>
                    </div>
                    <div className="thermo-challenge-target-card__requirement">
                      Throat Ratio: <strong>{(throatDiameter / 50).toFixed(2)}:1</strong>
                    </div>
                  </div>
                </>
              )}

              {activeChallengeLevel === 2 && (
                <>
                  <div className={`thermo-challenge-target-card${fluidState.pressureDropKpa >= 8.0 ? ' is-met' : ' is-unmet'}`}>
                    <div className="thermo-challenge-target-card__top">
                      <span className="thermo-challenge-target-card__name">PRESSURE DROP (ΔP)</span>
                      <span className="thermo-challenge-target-card__indicator">
                        {fluidState.pressureDropKpa >= 8.0 ? 'MET ✓' : 'NOT MET ✕'}
                      </span>
                    </div>
                    <div className="thermo-challenge-target-card__val">
                      {fluidState.pressureDropKpa.toFixed(2)} <small style={{ fontSize: '0.85rem' }}>kPa</small>
                    </div>
                    <div className="thermo-challenge-target-card__requirement">
                      Target: <strong>≥ 8.00 kPa</strong>
                    </div>
                  </div>

                  <div className={`thermo-challenge-target-card${fluidState.manometerDeltaH >= 0.815 ? ' is-met' : ' is-unmet'}`}>
                    <div className="thermo-challenge-target-card__top">
                      <span className="thermo-challenge-target-card__name">MANOMETER COLUMN LIFT (Δh)</span>
                      <span className="thermo-challenge-target-card__indicator">
                        {fluidState.manometerDeltaH >= 0.815 ? 'MET ✓' : 'NOT MET ✕'}
                      </span>
                    </div>
                    <div className="thermo-challenge-target-card__val">
                      {Math.round(fluidState.manometerDeltaH * 1000)} <small style={{ fontSize: '0.85rem' }}>mm</small>
                    </div>
                    <div className="thermo-challenge-target-card__requirement">
                      Target: <strong>≥ 815 mm</strong>
                    </div>
                  </div>
                </>
              )}

              {activeChallengeLevel === 3 && (
                <>
                  <div className={`thermo-challenge-target-card${flowRate >= 35 ? ' is-met' : ' is-unmet'}`}>
                    <div className="thermo-challenge-target-card__top">
                      <span className="thermo-challenge-target-card__name">FLOW RATE (Q)</span>
                      <span className="thermo-challenge-target-card__indicator">
                        {flowRate >= 35 ? 'MET ✓' : 'NOT MET ✕'}
                      </span>
                    </div>
                    <div className="thermo-challenge-target-card__val">
                      {flowRate} <small style={{ fontSize: '0.85rem' }}>L/min</small>
                    </div>
                    <div className="thermo-challenge-target-card__requirement">
                      Target: <strong>≥ 35.0 L/min</strong>
                    </div>
                  </div>

                  <div className={`thermo-challenge-target-card${fluidState.pressureDropKpa <= 12.0 ? ' is-met' : ' is-unmet'}`}>
                    <div className="thermo-challenge-target-card__top">
                      <span className="thermo-challenge-target-card__name">PRESSURE DROP (ΔP)</span>
                      <span className="thermo-challenge-target-card__indicator">
                        {fluidState.pressureDropKpa <= 12.0 ? 'MET ✓' : 'NOT MET ✕'}
                      </span>
                    </div>
                    <div className="thermo-challenge-target-card__val">
                      {fluidState.pressureDropKpa.toFixed(2)} <small style={{ fontSize: '0.85rem' }}>kPa</small>
                    </div>
                    <div className="thermo-challenge-target-card__requirement">
                      Target: <strong>≤ 12.00 kPa</strong>
                    </div>
                  </div>

                  <div className={`thermo-challenge-target-card${!fluidState.isCavitationRisk && fluidState.throat.staticPressure >= 20.0 ? ' is-met' : ' is-unmet'}`}>
                    <div className="thermo-challenge-target-card__top">
                      <span className="thermo-challenge-target-card__name">CAVITATION STATUS</span>
                      <span className="thermo-challenge-target-card__indicator">
                        {!fluidState.isCavitationRisk && fluidState.throat.staticPressure >= 20.0 ? 'SAFE ✓' : 'CAVITATION RISK ✕'}
                      </span>
                    </div>
                    <div className="thermo-challenge-target-card__val">
                      {fluidState.throat.staticPressure.toFixed(1)} <small style={{ fontSize: '0.85rem' }}>kPa</small>
                    </div>
                    <div className="thermo-challenge-target-card__requirement">
                      Target: <strong>P_throat &gt; 20.0 kPa</strong>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Dynamic Guidance & Live Insight */}
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

            {/* Action Bar */}
            <div className="thermo-challenge-section__actions" style={{ gap: '0.75rem' }}>
              <button
                type="button"
                className="thermo-challenge-reset-button"
                onClick={handleReset}
                onPointerEnter={() => setIntent('button', 'RESET CHALLENGE')}
                onPointerLeave={clearIntent}
              >
                RESET CHALLENGE
              </button>
              {challengeEval.isPassed && activeChallengeLevel < 3 && (
                <button
                  type="button"
                  className="mechanical-button mechanical-button--primary"
                  onClick={() => setActiveChallengeLevel((prev) => Math.min(3, prev + 1))}
                  onPointerEnter={() => setIntent('button', 'NEXT LEVEL')}
                  onPointerLeave={clearIntent}
                >
                  NEXT LEVEL →
                </button>
              )}
              {challengeEval.isPassed && activeChallengeLevel === 3 && (
                <div className="thermo-challenge-complete-banner">
                  ★ ALL 3 FLUID MISSIONS MASTERED! VENTURI SPECIALIST ACHIEVED ★
                </div>
              )}
            </div>
          </section>

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
        </>
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
            <div className="fluid-equation-item">
              <span className="fluid-equation-item__title">CONTINUITY PRINCIPLE (MASS CONSERVATION)</span>
              <div className="math-equation" role="math" aria-label="Q equals A 1 times V 1 equals A 2 times V 2">
                <span className="math-symbol">Q</span>
                <span className="math-op">=</span>
                <span className="math-symbol">A<sub className="math-sub">1</sub></span>
                <span className="math-op">·</span>
                <span className="math-symbol">V<sub className="math-sub">1</sub></span>
                <span className="math-op">=</span>
                <span className="math-symbol">A<sub className="math-sub">2</sub></span>
                <span className="math-op">·</span>
                <span className="math-symbol">V<sub className="math-sub">2</sub></span>
              </div>
              <p className="fluid-equation-item__desc">
                For an incompressible fluid like water, the volumetric flow rate Q is constant everywhere. When the cross-sectional area A shrinks, velocity V must proportionally increase.
              </p>
            </div>

            <div className="fluid-equation-item">
              <span className="fluid-equation-item__title">BERNOULLI'S ENERGY CONSERVATION (HORIZONTAL PIPE)</span>
              <div className="math-equation" role="math" aria-label="P 1 plus half rho V 1 squared equals P 2 plus half rho V 2 squared">
                <span className="math-symbol">P<sub className="math-sub">1</sub></span>
                <span className="math-op">+</span>
                <div className="math-fraction">
                  <span className="math-fraction__num">1</span>
                  <span className="math-fraction__den">2</span>
                </div>
                <span className="math-symbol">ρ</span>
                <span className="math-symbol">V<sub className="math-sub">1</sub></span><sup className="math-sup">2</sup>
                <span className="math-op">=</span>
                <span className="math-symbol">P<sub className="math-sub">2</sub></span>
                <span className="math-op">+</span>
                <div className="math-fraction">
                  <span className="math-fraction__num">1</span>
                  <span className="math-fraction__den">2</span>
                </div>
                <span className="math-symbol">ρ</span>
                <span className="math-symbol">V<sub className="math-sub">2</sub></span><sup className="math-sup">2</sup>
              </div>
              <p className="fluid-equation-item__desc">
                Total mechanical energy is conserved along a streamline. When kinetic energy rises due to constriction acceleration, static pressure drops to balance the sum.
              </p>
            </div>

            <div className="fluid-equation-item">
              <span className="fluid-equation-item__title">DIFFERENTIAL MANOMETER DEFLECTION</span>
              <div className="math-equation" role="math" aria-label="delta P equals P 1 minus P 2 equals rho m times g times delta h">
                <span className="math-symbol">ΔP</span>
                <span className="math-op">=</span>
                <span className="math-symbol">P<sub className="math-sub">1</sub></span>
                <span className="math-op">−</span>
                <span className="math-symbol">P<sub className="math-sub">2</sub></span>
                <span className="math-op">=</span>
                <span className="math-symbol">ρ<sub className="math-sub">m</sub></span>
                <span className="math-op">·</span>
                <span className="math-symbol">g</span>
                <span className="math-op">·</span>
                <span className="math-symbol">Δh</span>
              </div>
              <p className="fluid-equation-item__desc">
                The pressure difference between the wide inlet and the narrow throat pushes down the liquid column at A and lifts it at B, producing a height difference Δh.
              </p>
            </div>
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

  const challengeEval = useMemo(
    () => AUTOMOTIVE_FLAGSHIP_CHALLENGE.evaluate({ power, grip, braking, steering }, null, activeChallengeLevel),
    [power, grip, braking, steering, activeChallengeLevel]
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
          <section className="thermo-dynamic-grid" aria-label="Live physical explanation of vehicle dynamics">
            <div className="thermo-dynamic-grid__head">
              <span className="thermo-dynamic-grid__badge">LIVE AUTOMOTIVE REACTION</span>
              <h2 className="thermo-dynamic-grid__title">
                WHAT&apos;S HAPPENING?
              </h2>
              <p className="thermo-dynamic-grid__subtitle">
                Real-time physical reaction to your vehicle setup
              </p>
            </div>

            <div className="thermo-dynamic-cards">
              <div className="design-dynamic-card">
                <span className="design-dynamic-card__step">01</span>
                <span className="design-dynamic-card__label">YOU CHANGED:</span>
                <p className="design-dynamic-card__content design-dynamic-card__content--changed">
                  {explanation.whatChanged}
                </p>
              </div>

              <div className="design-dynamic-card design-dynamic-card--highlight">
                <span className="design-dynamic-card__step">02</span>
                <span className="design-dynamic-card__label">THE CAR RESPONDED:</span>
                <p className="design-dynamic-card__content">
                  {explanation.whatHappened}
                </p>
              </div>

              <div className="design-dynamic-card">
                <span className="design-dynamic-card__step">03</span>
                <span className="design-dynamic-card__label">WHY? (PHYSICAL PRINCIPLE):</span>
                <p className="design-dynamic-card__content">
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

      {/* ── Mode 2: CHALLENGE FLOW (Full Level Progression & Criteria Deck) ── */}
      {mode === 'challenge' && (
        <>
          <section
            id="challenge"
            className={`thermo-challenge-section${challengeEval.isPassed ? ' is-passed' : ''}`}
            aria-labelledby="auto-challenge-heading"
          >
            <div className="thermo-challenge-section__header">
              <div className="thermo-challenge-section__title-group">
                <div className="thermo-challenge-section__badge">
                  <span>ENGINEERING CHALLENGE</span>
                  <span>// LEVEL {String(activeChallengeLevel).padStart(2, '0')}</span>
                </div>
                <h2 id="auto-challenge-heading" className="thermo-challenge-section__title">
                  {AUTOMOTIVE_FLAGSHIP_CHALLENGE.title}
                </h2>
                <p className="thermo-challenge-section__desc">
                  {AUTOMOTIVE_FLAGSHIP_CHALLENGE.description}
                </p>
              </div>

              <div
                className={`thermo-challenge-section__status-badge ${
                  challengeEval.isPassed ? 'is-passed' : 'is-unmet'
                }`}
              >
                {challengeEval.isPassed ? 'TARGET REACHED ✓' : challengeEval.status}
              </div>
            </div>

            {/* Level Switcher (LVL 1, LVL 2, LVL 3) */}
            <div className="thermo-challenge-levels" role="tablist" aria-label="Challenge progression levels">
              {AUTOMOTIVE_LEVELS.map((lvl) => (
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
              <strong>Mission:</strong> {AUTOMOTIVE_LEVELS[activeChallengeLevel - 1].objective}
              <MechLabHint hint={AUTOMOTIVE_LEVELS[activeChallengeLevel - 1].hint} />
            </div>

            {/* Target Criteria Live Metrics */}
            <div className="thermo-challenge-criteria-grid">
              {activeChallengeLevel === 1 && (
                <>
                  <div className={`thermo-challenge-target-card${perf.sprint0to100Sec <= 4.2 && !perf.hasWheelspin ? ' is-met' : ' is-unmet'}`}>
                    <div className="thermo-challenge-target-card__top">
                      <span className="thermo-challenge-target-card__name">0–100 KM/H SPRINT</span>
                      <span className="thermo-challenge-target-card__indicator">
                        {perf.sprint0to100Sec <= 4.2 && !perf.hasWheelspin ? 'MET ✓' : 'NOT MET ✕'}
                      </span>
                    </div>
                    <div className="thermo-challenge-target-card__val">
                      {perf.sprint0to100Sec.toFixed(2)} <small style={{ fontSize: '0.85rem' }}>s</small>
                    </div>
                    <div className="thermo-challenge-target-card__requirement">
                      Target: <strong>≤ 4.20 s</strong>
                    </div>
                  </div>

                  <div className={`thermo-challenge-target-card${!perf.hasWheelspin ? ' is-met' : ' is-unmet'}`}>
                    <div className="thermo-challenge-target-card__top">
                      <span className="thermo-challenge-target-card__name">LAUNCH TRACTION</span>
                      <span className="thermo-challenge-target-card__indicator">
                        {!perf.hasWheelspin ? 'OPTIMAL ADHESION ✓' : 'WHEELSPIN ✕'}
                      </span>
                    </div>
                    <div className="thermo-challenge-target-card__val">
                      {perf.hasWheelspin ? 'SLIPPING' : 'STATIC GRIP'}
                    </div>
                    <div className="thermo-challenge-target-card__requirement">
                      Target: <strong>Clean Launch (No Slip)</strong>
                    </div>
                  </div>
                </>
              )}

              {activeChallengeLevel === 2 && (
                <>
                  <div className={`thermo-challenge-target-card${perf.brakingDistanceM <= 38.0 ? ' is-met' : ' is-unmet'}`}>
                    <div className="thermo-challenge-target-card__top">
                      <span className="thermo-challenge-target-card__name">STOPPING DISTANCE (100–0)</span>
                      <span className="thermo-challenge-target-card__indicator">
                        {perf.brakingDistanceM <= 38.0 ? 'MET ✓' : 'NOT MET ✕'}
                      </span>
                    </div>
                    <div className="thermo-challenge-target-card__val">
                      {perf.brakingDistanceM.toFixed(1)} <small style={{ fontSize: '0.85rem' }}>m</small>
                    </div>
                    <div className="thermo-challenge-target-card__requirement">
                      Target: <strong>≤ 38.0 m</strong>
                    </div>
                  </div>

                  <div className={`thermo-challenge-target-card${perf.brakeDecelMps2 >= 10.0 ? ' is-met' : ' is-unmet'}`}>
                    <div className="thermo-challenge-target-card__top">
                      <span className="thermo-challenge-target-card__name">BRAKE DECELERATION</span>
                      <span className="thermo-challenge-target-card__indicator">
                        {perf.brakeDecelMps2 >= 10.0 ? 'MET ✓' : 'NOT MET ✕'}
                      </span>
                    </div>
                    <div className="thermo-challenge-target-card__val">
                      {perf.brakeDecelMps2.toFixed(1)} <small style={{ fontSize: '0.85rem' }}>m/s²</small>
                    </div>
                    <div className="thermo-challenge-target-card__requirement">
                      Target: <strong>≥ 10.0 m/s²</strong>
                    </div>
                  </div>
                </>
              )}

              {activeChallengeLevel === 3 && (
                <>
                  <div className={`thermo-challenge-target-card${perf.testCornerSpeedKmh >= 75.0 ? ' is-met' : ' is-unmet'}`}>
                    <div className="thermo-challenge-target-card__top">
                      <span className="thermo-challenge-target-card__name">APEX CORNER SPEED</span>
                      <span className="thermo-challenge-target-card__indicator">
                        {perf.testCornerSpeedKmh >= 75.0 ? 'MET ✓' : 'NOT MET ✕'}
                      </span>
                    </div>
                    <div className="thermo-challenge-target-card__val">
                      {perf.testCornerSpeedKmh} <small style={{ fontSize: '0.85rem' }}>km/h</small>
                    </div>
                    <div className="thermo-challenge-target-card__requirement">
                      Target: <strong>≥ 75 km/h</strong>
                    </div>
                  </div>

                  <div className={`thermo-challenge-target-card${perf.gripMarginPercent >= 15 && !perf.hasCornerSkid ? ' is-met' : ' is-unmet'}`}>
                    <div className="thermo-challenge-target-card__top">
                      <span className="thermo-challenge-target-card__name">GRIP SAFETY MARGIN</span>
                      <span className="thermo-challenge-target-card__indicator">
                        {perf.gripMarginPercent >= 15 && !perf.hasCornerSkid ? 'MET ✓' : 'NOT MET ✕'}
                      </span>
                    </div>
                    <div className="thermo-challenge-target-card__val">
                      +{perf.gripMarginPercent}%
                    </div>
                    <div className="thermo-challenge-target-card__requirement">
                      Target: <strong>≥ +15% Safety Buffer</strong>
                    </div>
                  </div>

                  <div className={`thermo-challenge-target-card${!perf.hasCornerSkid ? ' is-met' : ' is-unmet'}`}>
                    <div className="thermo-challenge-target-card__top">
                      <span className="thermo-challenge-target-card__name">LATERAL STABILITY</span>
                      <span className="thermo-challenge-target-card__indicator">
                        {!perf.hasCornerSkid ? 'STABLE ✓' : 'SKIDDING ✕'}
                      </span>
                    </div>
                    <div className="thermo-challenge-target-card__val">
                      {perf.lateralAccG.toFixed(2)}g
                    </div>
                    <div className="thermo-challenge-target-card__requirement">
                      Target: <strong>No Lateral Drift</strong>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Dynamic Guidance & Live Insight */}
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

            {/* Action Bar */}
            <div className="thermo-challenge-section__actions" style={{ gap: '0.75rem' }}>
              <button
                type="button"
                className="thermo-challenge-reset-button"
                onClick={handleReset}
                onPointerEnter={() => setIntent('button', 'RESET CHALLENGE')}
                onPointerLeave={clearIntent}
              >
                RESET CHALLENGE
              </button>
              {challengeEval.isPassed && activeChallengeLevel < 3 && (
                <button
                  type="button"
                  className="mechanical-button mechanical-button--primary"
                  onClick={() => setActiveChallengeLevel((prev) => Math.min(3, prev + 1))}
                  onPointerEnter={() => setIntent('button', 'NEXT LEVEL')}
                  onPointerLeave={clearIntent}
                >
                  NEXT LEVEL →
                </button>
              )}
              {challengeEval.isPassed && activeChallengeLevel === 3 && (
                <div className="thermo-challenge-complete-banner">
                  ★ ALL 3 VEHICLE MISSIONS MASTERED! RACE CHASSIS ENGINEER ACHIEVED ★
                </div>
              )}
            </div>
          </section>

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
        </>
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
            <div className="auto-equation-item">
              <span className="auto-equation-item__title">NEWTON'S SECOND LAW (TRACTION &amp; ACCELERATION)</span>
              <div className="math-equation" role="math" aria-label="acceleration a equals F drive divided by m">
                <span className="math-symbol">a</span>
                <span className="math-op">=</span>
                <div className="math-fraction">
                  <span className="math-fraction__num"><span className="math-symbol">F<sub className="math-sub">drive</sub></span></span>
                  <span className="math-fraction__den"><span className="math-symbol">m</span></span>
                </div>
              </div>
              <p className="auto-equation-item__desc">
                The forward acceleration of the car is directly proportional to the net wheel driving force and inversely proportional to vehicle curb mass.
              </p>
            </div>

            <div className="auto-equation-item">
              <span className="auto-equation-item__title">COULOMB TIRE FRICTION LIMIT (ADHESION)</span>
              <div className="math-equation" role="math" aria-label="F friction less than or equal to mu times N equals mu times m times g">
                <span className="math-symbol">F<sub className="math-sub">friction</sub></span>
                <span className="math-op">≤</span>
                <span className="math-symbol">μ</span>
                <span className="math-op">·</span>
                <span className="math-symbol">N</span>
                <span className="math-op">=</span>
                <span className="math-symbol">μ</span>
                <span className="math-op">·</span>
                <span className="math-symbol">m</span>
                <span className="math-op">·</span>
                <span className="math-symbol">g</span>
              </div>
              <p className="auto-equation-item__desc">
                Tires can only generate traction up to the friction coefficient μ multiplied by the normal weight. Exceeding this limit causes wheelspin or skidding.
              </p>
            </div>

            <div className="auto-equation-item">
              <span className="auto-equation-item__title">KINETIC BRAKING DISTANCE</span>
              <div className="math-equation" role="math" aria-label="d stop equals v squared divided by (2 times a brake) equals v squared divided by (2 times mu times g)">
                <span className="math-symbol">d<sub className="math-sub">stop</sub></span>
                <span className="math-op">=</span>
                <div className="math-fraction">
                  <span className="math-fraction__num"><span className="math-symbol">v</span><sup className="math-sup">2</sup></span>
                  <span className="math-fraction__den">2<span className="math-op">·</span><span className="math-symbol">a<sub className="math-sub">brake</sub></span></span>
                </div>
                <span className="math-op">=</span>
                <div className="math-fraction">
                  <span className="math-fraction__num"><span className="math-symbol">v</span><sup className="math-sup">2</sup></span>
                  <span className="math-fraction__den">2<span className="math-op">·</span><span className="math-symbol">μ</span><span className="math-op">·</span><span className="math-symbol">g</span></span>
                </div>
              </div>
              <p className="auto-equation-item__desc">
                Stopping distance scales quadratically with speed (v²). Doubling your speed quadruples the required braking distance on the same tires.
              </p>
            </div>

            <div className="auto-equation-item">
              <span className="auto-equation-item__title">CENTRIPETAL CORNERING BALANCE</span>
              <div className="math-equation" role="math" aria-label="a lat equals v squared divided by R less than or equal to mu times g">
                <span className="math-symbol">a<sub className="math-sub">lat</sub></span>
                <span className="math-op">=</span>
                <div className="math-fraction">
                  <span className="math-fraction__num"><span className="math-symbol">v</span><sup className="math-sup">2</sup></span>
                  <span className="math-fraction__den"><span className="math-symbol">R</span></span>
                </div>
                <span className="math-op">≤</span>
                <span className="math-symbol">μ</span>
                <span className="math-op">·</span>
                <span className="math-symbol">g</span>
              </div>
              <p className="auto-equation-item__desc">
                In a curve of radius R, lateral acceleration must not exceed available tire friction μ·g. If speed is too high, the vehicle understeers or spins out.
              </p>
            </div>
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

  const challengeEval = useMemo(
    () => DESIGN_FLAGSHIP_CHALLENGE.evaluate({ lengthM, widthMm, heightMm, loadKn, materialId }, null, activeChallengeLevel),
    [lengthM, widthMm, heightMm, loadKn, materialId, activeChallengeLevel]
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
          <section className="thermo-dynamic-grid" aria-label="Live physical explanation of structural changes">
            <div className="thermo-dynamic-grid__head">
              <span className="thermo-dynamic-grid__badge">LIVE STRUCTURAL REACTION</span>
              <h2 className="thermo-dynamic-grid__title">WHAT&apos;S HAPPENING?</h2>
              <p className="thermo-dynamic-grid__subtitle">
                Adjust beam span, cross-section geometry, load, or material to observe bending moment, peak stress, and deflection shift in real time.
              </p>
            </div>

            <div className="thermo-dynamic-cards">
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
                <span className="design-dynamic-card__label">WHY? (PHYSICAL PRINCIPLE):</span>
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

      {/* ── Mode 2: CHALLENGE FLOW (Full Level Progression & Criteria Deck) ── */}
      {mode === 'challenge' && (
        <>
          <section
            id="challenge"
            className={`thermo-challenge-section${challengeEval.isPassed ? ' is-passed' : ''}`}
            aria-labelledby="design-challenge-heading"
          >
            <div className="thermo-challenge-section__header">
              <div className="thermo-challenge-section__title-group">
                <div className="thermo-challenge-section__badge">
                  <span>ENGINEERING CHALLENGE</span>
                  <span>// LEVEL {String(activeChallengeLevel).padStart(2, '0')}</span>
                </div>
                <h2 id="design-challenge-heading" className="thermo-challenge-section__title">
                  {DESIGN_FLAGSHIP_CHALLENGE.title}
                </h2>
                <p className="thermo-challenge-section__desc">
                  {DESIGN_FLAGSHIP_CHALLENGE.description}
                </p>
              </div>

              <div
                className={`thermo-challenge-section__status-badge ${
                  challengeEval.isPassed ? 'is-passed' : 'is-unmet'
                }`}
              >
                {challengeEval.isPassed ? 'TARGET REACHED ✓' : challengeEval.status}
              </div>
            </div>

            {/* Level Switcher (LVL 1, LVL 2, LVL 3) */}
            <div className="thermo-challenge-levels" role="tablist" aria-label="Challenge progression levels">
              {DESIGN_LEVELS.map((lvl) => (
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
              <strong>Mission:</strong> {DESIGN_LEVELS[activeChallengeLevel - 1].objective}
              <MechLabHint hint={DESIGN_LEVELS[activeChallengeLevel - 1].hint} />
            </div>

            {/* Target Criteria Live Metrics */}
            <div className="thermo-challenge-criteria-grid">
              {activeChallengeLevel === 1 && (
                <>
                  <div className={`thermo-challenge-target-card${loadKn >= 15 ? ' is-met' : ' is-unmet'}`}>
                    <div className="thermo-challenge-target-card__top">
                      <span className="thermo-challenge-target-card__name">APPLIED TEST LOAD</span>
                      <span className="thermo-challenge-target-card__indicator">
                        {loadKn >= 15 ? 'MET ✓' : 'NOT MET ✕'}
                      </span>
                    </div>
                    <div className="thermo-challenge-target-card__val">
                      {loadKn} <small style={{ fontSize: '0.85rem' }}>kN</small>
                    </div>
                    <div className="thermo-challenge-target-card__requirement">
                      Target: <strong>≥ 15 kN</strong>
                    </div>
                  </div>

                  <div className={`thermo-challenge-target-card${analysis.factorOfSafety >= 1.50 ? ' is-met' : ' is-unmet'}`}>
                    <div className="thermo-challenge-target-card__top">
                      <span className="thermo-challenge-target-card__name">FACTOR OF SAFETY</span>
                      <span className="thermo-challenge-target-card__indicator">
                        {analysis.factorOfSafety >= 1.50 ? 'MET ✓' : 'NOT MET ✕'}
                      </span>
                    </div>
                    <div className="thermo-challenge-target-card__val">
                      {analysis.factorOfSafety.toFixed(2)}
                    </div>
                    <div className="thermo-challenge-target-card__requirement">
                      Target: <strong>≥ 1.50 FoS</strong>
                    </div>
                  </div>

                  <div className={`thermo-challenge-target-card${!analysis.isFailed ? ' is-met' : ' is-unmet'}`}>
                    <div className="thermo-challenge-target-card__top">
                      <span className="thermo-challenge-target-card__name">STRUCTURAL INTEGRITY</span>
                      <span className="thermo-challenge-target-card__indicator">
                        {!analysis.isFailed ? 'ELASTIC SAFE ✓' : 'YIELD FAILURE ✕'}
                      </span>
                    </div>
                    <div className="thermo-challenge-target-card__val">
                      {analysis.maxBendingStressMpa.toFixed(0)} <small style={{ fontSize: '0.85rem' }}>MPa</small>
                    </div>
                    <div className="thermo-challenge-target-card__requirement">
                      Target: <strong>Yield &lt; {analysis.material.yieldStrengthMpa} MPa</strong>
                    </div>
                  </div>
                </>
              )}

              {activeChallengeLevel === 2 && (
                <>
                  <div className={`thermo-challenge-target-card${loadKn >= 20 ? ' is-met' : ' is-unmet'}`}>
                    <div className="thermo-challenge-target-card__top">
                      <span className="thermo-challenge-target-card__name">APPLIED TEST LOAD</span>
                      <span className="thermo-challenge-target-card__indicator">
                        {loadKn >= 20 ? 'MET ✓' : 'NOT MET ✕'}
                      </span>
                    </div>
                    <div className="thermo-challenge-target-card__val">
                      {loadKn} <small style={{ fontSize: '0.85rem' }}>kN</small>
                    </div>
                    <div className="thermo-challenge-target-card__requirement">
                      Target: <strong>≥ 20 kN</strong>
                    </div>
                  </div>

                  <div className={`thermo-challenge-target-card${analysis.factorOfSafety >= 1.50 ? ' is-met' : ' is-unmet'}`}>
                    <div className="thermo-challenge-target-card__top">
                      <span className="thermo-challenge-target-card__name">FACTOR OF SAFETY</span>
                      <span className="thermo-challenge-target-card__indicator">
                        {analysis.factorOfSafety >= 1.50 ? 'MET ✓' : 'NOT MET ✕'}
                      </span>
                    </div>
                    <div className="thermo-challenge-target-card__val">
                      {analysis.factorOfSafety.toFixed(2)}
                    </div>
                    <div className="thermo-challenge-target-card__requirement">
                      Target: <strong>≥ 1.50 FoS</strong>
                    </div>
                  </div>

                  <div className={`thermo-challenge-target-card${analysis.massKg <= 38.0 ? ' is-met' : ' is-unmet'}`}>
                    <div className="thermo-challenge-target-card__top">
                      <span className="thermo-challenge-target-card__name">TOTAL BEAM MASS</span>
                      <span className="thermo-challenge-target-card__indicator">
                        {analysis.massKg <= 38.0 ? 'MET ✓' : 'NOT MET ✕'}
                      </span>
                    </div>
                    <div className="thermo-challenge-target-card__val">
                      {analysis.massKg.toFixed(1)} <small style={{ fontSize: '0.85rem' }}>kg</small>
                    </div>
                    <div className="thermo-challenge-target-card__requirement">
                      Target: <strong>≤ 38.0 kg</strong>
                    </div>
                  </div>
                </>
              )}

              {activeChallengeLevel === 3 && (
                <>
                  <div className={`thermo-challenge-target-card${loadKn >= 25 ? ' is-met' : ' is-unmet'}`}>
                    <div className="thermo-challenge-target-card__top">
                      <span className="thermo-challenge-target-card__name">APPLIED TEST LOAD</span>
                      <span className="thermo-challenge-target-card__indicator">
                        {loadKn >= 25 ? 'MET ✓' : 'NOT MET ✕'}
                      </span>
                    </div>
                    <div className="thermo-challenge-target-card__val">
                      {loadKn} <small style={{ fontSize: '0.85rem' }}>kN</small>
                    </div>
                    <div className="thermo-challenge-target-card__requirement">
                      Target: <strong>≥ 25 kN</strong>
                    </div>
                  </div>

                  <div className={`thermo-challenge-target-card${analysis.factorOfSafety >= 2.00 ? ' is-met' : ' is-unmet'}`}>
                    <div className="thermo-challenge-target-card__top">
                      <span className="thermo-challenge-target-card__name">HIGH-MARGIN FOS</span>
                      <span className="thermo-challenge-target-card__indicator">
                        {analysis.factorOfSafety >= 2.00 ? 'MET ✓' : 'NOT MET ✕'}
                      </span>
                    </div>
                    <div className="thermo-challenge-target-card__val">
                      {analysis.factorOfSafety.toFixed(2)}
                    </div>
                    <div className="thermo-challenge-target-card__requirement">
                      Target: <strong>≥ 2.00 FoS</strong>
                    </div>
                  </div>

                  <div className={`thermo-challenge-target-card${analysis.tipDeflectionMm <= 3.5 ? ' is-met' : ' is-unmet'}`}>
                    <div className="thermo-challenge-target-card__top">
                      <span className="thermo-challenge-target-card__name">PRECISION DEFLECTION</span>
                      <span className="thermo-challenge-target-card__indicator">
                        {analysis.tipDeflectionMm <= 3.5 ? 'MET ✓' : 'NOT MET ✕'}
                      </span>
                    </div>
                    <div className="thermo-challenge-target-card__val">
                      {analysis.tipDeflectionMm.toFixed(2)} <small style={{ fontSize: '0.85rem' }}>mm</small>
                    </div>
                    <div className="thermo-challenge-target-card__requirement">
                      Target: <strong>≤ 3.50 mm</strong>
                    </div>
                  </div>

                  <div className={`thermo-challenge-target-card${analysis.massKg <= 55.0 ? ' is-met' : ' is-unmet'}`}>
                    <div className="thermo-challenge-target-card__top">
                      <span className="thermo-challenge-target-card__name">AEROSPACE MASS LIMIT</span>
                      <span className="thermo-challenge-target-card__indicator">
                        {analysis.massKg <= 55.0 ? 'MET ✓' : 'NOT MET ✕'}
                      </span>
                    </div>
                    <div className="thermo-challenge-target-card__val">
                      {analysis.massKg.toFixed(1)} <small style={{ fontSize: '0.85rem' }}>kg</small>
                    </div>
                    <div className="thermo-challenge-target-card__requirement">
                      Target: <strong>≤ 55.0 kg</strong>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Dynamic Guidance & Live Insight */}
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

            {/* Action Bar */}
            <div className="thermo-challenge-section__actions" style={{ gap: '0.75rem' }}>
              <button
                type="button"
                className="thermo-challenge-reset-button"
                onClick={handleReset}
                onPointerEnter={() => setIntent('button', 'RESET CHALLENGE')}
                onPointerLeave={clearIntent}
              >
                RESET CHALLENGE
              </button>
              {challengeEval.isPassed && activeChallengeLevel < 3 && (
                <button
                  type="button"
                  className="mechanical-button mechanical-button--primary"
                  onClick={() => setActiveChallengeLevel((prev) => Math.min(3, prev + 1))}
                  onPointerEnter={() => setIntent('button', 'NEXT LEVEL')}
                  onPointerLeave={clearIntent}
                >
                  NEXT LEVEL →
                </button>
              )}
              {challengeEval.isPassed && activeChallengeLevel === 3 && (
                <div className="thermo-challenge-complete-banner">
                  ★ ALL 3 STRUCTURAL MISSIONS MASTERED! SENIOR CAD ENGINEER ACHIEVED ★
                </div>
              )}
            </div>
          </section>

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
        </>
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
            <div className="design-equation-item">
              <span className="design-equation-item__title">Area Moment of Inertia (Bending Resistance)</span>
              <div className="math-equation" role="math" aria-label="I equals (w times h cubed) divided by 12">
                <span className="math-symbol">I</span>
                <span className="math-op">=</span>
                <div className="math-fraction">
                  <span className="math-fraction__num">
                    <span className="math-symbol">w</span>
                    <span className="math-op">·</span>
                    <span className="math-symbol">h</span><sup className="math-sup">3</sup>
                  </span>
                  <span className="math-fraction__den">12</span>
                </div>
              </div>
              <p className="design-equation-item__desc">
                Height (h) contributes cubically to bending stiffness. A taller beam is exponentially more resistant to bending than a wider beam of equal area.
              </p>
            </div>

            <div className="design-equation-item">
              <span className="design-equation-item__title">Flexural Bending Stress (Euler-Bernoulli)</span>
              <div className="math-equation" role="math" aria-label="sigma max equals (M times y) divided by I equals (6 times F times L) divided by (w times h squared)">
                <span className="math-symbol">σ<sub className="math-sub">max</sub></span>
                <span className="math-op">=</span>
                <div className="math-fraction">
                  <span className="math-fraction__num">
                    <span className="math-symbol">M</span>
                    <span className="math-op">·</span>
                    <span className="math-symbol">y</span>
                  </span>
                  <span className="math-fraction__den">
                    <span className="math-symbol">I</span>
                  </span>
                </div>
                <span className="math-op">=</span>
                <div className="math-fraction">
                  <span className="math-fraction__num">
                    6<span className="math-op">·</span><span className="math-symbol">F</span><span className="math-op">·</span><span className="math-symbol">L</span>
                  </span>
                  <span className="math-fraction__den">
                    <span className="math-symbol">w</span><span className="math-op">·</span><span className="math-symbol">h</span><sup className="math-sup">2</sup>
                  </span>
                </div>
              </div>
              <p className="design-equation-item__desc">
                Maximum normal stress occurs at the outermost top and bottom fibers at the fixed support root. It must not exceed the material yield strength.
              </p>
            </div>

            <div className="design-equation-item">
              <span className="design-equation-item__title">Cantilever Tip Deflection</span>
              <div className="math-equation" role="math" aria-label="delta max equals (F times L cubed) divided by (3 times E times I)">
                <span className="math-symbol">δ<sub className="math-sub">max</sub></span>
                <span className="math-op">=</span>
                <div className="math-fraction">
                  <span className="math-fraction__num">
                    <span className="math-symbol">F</span><span className="math-op">·</span><span className="math-symbol">L</span><sup className="math-sup">3</sup>
                  </span>
                  <span className="math-fraction__den">
                    3<span className="math-op">·</span><span className="math-symbol">E</span><span className="math-op">·</span><span className="math-symbol">I</span>
                  </span>
                </div>
              </div>
              <p className="design-equation-item__desc">
                Deflection measures elastic sag under load. It is directly proportional to applied force F and length cubed L³, and inversely proportional to flexural rigidity E·I.
              </p>
            </div>

            <div className="design-equation-item">
              <span className="design-equation-item__title">Factor of Safety (Design Margin)</span>
              <div className="math-equation" role="math" aria-label="FoS equals sigma yield divided by sigma max greater than or equal to 1.50">
                <span className="math-symbol">FoS</span>
                <span className="math-op">=</span>
                <div className="math-fraction">
                  <span className="math-fraction__num">
                    <span className="math-symbol">σ<sub className="math-sub">yield</sub></span>
                  </span>
                  <span className="math-fraction__den">
                    <span className="math-symbol">σ<sub className="math-sub">max</sub></span>
                  </span>
                </div>
                <span className="math-op">≥</span>
                <span>1.50</span>
              </div>
              <p className="design-equation-item__desc">
                Engineering structures require FoS ≥ 1.5 to 2.0 to guard against manufacturing tolerances, fatigue, and unexpected peak shock loads.
              </p>
            </div>
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

// ── Active Materials Flagship Experience ────────────────────────────────
interface ActiveMaterialsProps {
  system: LabSystemConfig
  mode: 'explore' | 'challenge'
  onSwitchMode: (mode: 'explore' | 'challenge') => void
}

function ActiveMaterialsLab({ system, mode, onSwitchMode }: ActiveMaterialsProps) {
  const { setIntent, clearIntent } = usePointer()

  const [params, setParams] = useState<SpecimenParams>(DEFAULT_SPECIMEN_PARAMS)
  const [prevParams, setPrevParams] = useState<SpecimenParams>(DEFAULT_SPECIMEN_PARAMS)
  const [activeChallengeLevel, setActiveChallengeLevel] = useState<number>(1)
  const [showMoreData, setShowMoreData] = useState<boolean>(false)

  const analysis = useMemo(() => calculateMaterialsAnalysis(params), [params])

  const explanation = useMemo(
    () => getMaterialsDynamicExplanation(params, prevParams),
    [params, prevParams]
  )

  const challengeEval = useMemo(
    () => MATERIALS_FLAGSHIP_CHALLENGE.evaluate(params, analysis, activeChallengeLevel),
    [params, analysis, activeChallengeLevel]
  )

  const handleParamChange = (partial: Partial<SpecimenParams>) => {
    setPrevParams(params)
    setParams((prev) => ({ ...prev, ...partial }))
  }

  const handleReset = () => {
    setPrevParams(params)
    setParams(DEFAULT_SPECIMEN_PARAMS)
  }

  return (
    <div className="mech-lab-system-page">
      <MechLabSystemHeader
        system={system}
        mode={mode}
        onModeChange={onSwitchMode}
      />

      {/* ── Section 1: Materials Tensile Stage & Simulation ── */}
      <section aria-label="Tensile test specimen simulator and parameter controls">
        <MaterialsExperimentView
          appliedLoadKn={params.appliedLoadKn}
          gaugeWidthMm={params.gaugeWidthMm}
          gaugeThicknessMm={params.gaugeThicknessMm}
          gaugeLengthMm={params.gaugeLengthMm}
          materialId={params.materialId}
          onParamChange={(newLoad, newW, newT, newL, newMat) => {
            handleParamChange({
              appliedLoadKn: newLoad,
              gaugeWidthMm: newW,
              gaugeThicknessMm: newT,
              gaugeLengthMm: newL,
              materialId: newMat,
            })
          }}
          onReset={handleReset}
          activeLevel={activeChallengeLevel}
          isChallengeMode={mode === 'challenge'}
          onSwitchMode={onSwitchMode}
        />
      </section>

      {/* ── Section 2: Explore Mode — "WHAT'S HAPPENING?" ── */}
      {mode === 'explore' && (
        <>
          <section className="thermo-dynamic-grid" aria-label="Live physical explanation of parameter changes">
            <div className="thermo-dynamic-grid__head">
              <span className="thermo-dynamic-grid__badge">LIVE PHYSICAL REACTION</span>
              <h2 className="thermo-dynamic-grid__title">WHAT'S HAPPENING?</h2>
              <p className="thermo-dynamic-grid__subtitle">
                Tweak load, cross-section area, or material to observe how stress, atomic strain, and yield limits shift in real time.
              </p>
            </div>

            <div className="thermo-dynamic-cards">
              <div className="design-dynamic-card">
                <span className="design-dynamic-card__step">01</span>
                <span className="design-dynamic-card__label">YOU CHANGED:</span>
                <p className="design-dynamic-card__content">
                  {explanation.whatChanged}
                </p>
              </div>

              <div className="design-dynamic-card design-dynamic-card--highlight">
                <span className="design-dynamic-card__step">02</span>
                <span className="design-dynamic-card__label">THE SPECIMEN RESPONDED:</span>
                <p className="design-dynamic-card__content">
                  {explanation.whatHappened}
                </p>
              </div>

              <div className="design-dynamic-card">
                <span className="design-dynamic-card__step">03</span>
                <span className="design-dynamic-card__label">WHY? (PHYSICAL PRINCIPLE):</span>
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
                Ready to take on the Materials Qualification Missions?
              </h3>
              <p className="lab-mode-prompt-card__desc">
                Switch to Challenge Mode to test your mastery of yield thresholds, factors of safety, and lightweight aerospace alloy selection.
              </p>
            </div>
            <button
              type="button"
              className="mechanical-button mechanical-button--primary"
              onClick={() => onSwitchMode('challenge')}
              onPointerEnter={() => setIntent('button', 'CHALLENGE')}
              onPointerLeave={clearIntent}
            >
              START MATERIALS CHALLENGE →
            </button>
          </div>
        </>
      )}

      {/* ── Section 3: Challenge Mode ── */}
      {mode === 'challenge' && (
        <>
          <section className="thermo-challenge-section" aria-labelledby="materials-challenge-heading">
            <div className="thermo-challenge-section__head">
              <div>
                <div className="thermo-challenge-section__eyebrow">
                  MISSION PROGRESSION · LEVEL {activeChallengeLevel} OF 3
                </div>
                <h2 id="materials-challenge-heading" className="thermo-challenge-section__title">
                  {MATERIALS_FLAGSHIP_CHALLENGE.title}
                </h2>
                <p className="thermo-challenge-section__desc">
                  {MATERIALS_FLAGSHIP_CHALLENGE.description}
                </p>
              </div>

              <div
                className={`thermo-challenge-section__status-badge ${
                  challengeEval.isPassed ? 'is-passed' : 'is-unmet'
                }`}
              >
                {challengeEval.isPassed ? 'TARGET REACHED ✓' : challengeEval.status}
              </div>
            </div>

            {/* Level Switcher (LVL 1, LVL 2, LVL 3) */}
            <div className="thermo-challenge-levels" role="tablist" aria-label="Challenge progression levels">
              {MATERIALS_LEVELS.map((lvl) => (
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
              <strong>Mission:</strong> {MATERIALS_LEVELS[activeChallengeLevel - 1].objective}
              <MechLabHint hint={MATERIALS_LEVELS[activeChallengeLevel - 1].hint} />
            </div>

            {/* Target Criteria Live Metrics */}
            <div className="thermo-challenge-criteria-grid">
              {activeChallengeLevel === 1 && (
                <>
                  <div className={`thermo-challenge-target-card${params.appliedLoadKn >= 25 ? ' is-met' : ' is-unmet'}`}>
                    <div className="thermo-challenge-target-card__top">
                      <span className="thermo-challenge-target-card__name">TEST TENSILE LOAD</span>
                      <span className="thermo-challenge-target-card__indicator">
                        {params.appliedLoadKn >= 25 ? 'MET ✓' : 'NOT MET ✕'}
                      </span>
                    </div>
                    <div className="thermo-challenge-target-card__val">
                      {params.appliedLoadKn.toFixed(1)} <small style={{ fontSize: '0.85rem' }}>kN</small>
                    </div>
                    <div className="thermo-challenge-target-card__requirement">
                      Target: <strong>≥ 25.0 kN</strong>
                    </div>
                  </div>

                  <div className={`thermo-challenge-target-card${analysis.normalStressMpa < analysis.material.yieldStrengthMpa ? ' is-met' : ' is-unmet'}`}>
                    <div className="thermo-challenge-target-card__top">
                      <span className="thermo-challenge-target-card__name">STRESS VS YIELD</span>
                      <span className="thermo-challenge-target-card__indicator">
                        {analysis.normalStressMpa < analysis.material.yieldStrengthMpa ? 'ELASTIC ✓' : 'PLASTIC ✕'}
                      </span>
                    </div>
                    <div className="thermo-challenge-target-card__val">
                      {analysis.normalStressMpa.toFixed(0)} <small style={{ fontSize: '0.85rem' }}>MPa</small>
                    </div>
                    <div className="thermo-challenge-target-card__requirement">
                      Yield Limit: <strong>&lt; {analysis.material.yieldStrengthMpa} MPa</strong>
                    </div>
                  </div>

                  <div className={`thermo-challenge-target-card${!analysis.isYielded ? ' is-met' : ' is-unmet'}`}>
                    <div className="thermo-challenge-target-card__top">
                      <span className="thermo-challenge-target-card__name">MATERIAL BEHAVIOR</span>
                      <span className="thermo-challenge-target-card__indicator">
                        {!analysis.isYielded ? 'REVERSIBLE ✓' : 'PERMANENT SET ✕'}
                      </span>
                    </div>
                    <div className="thermo-challenge-target-card__val">
                      {!analysis.isYielded ? 'ELASTIC' : 'YIELDED'}
                    </div>
                    <div className="thermo-challenge-target-card__requirement">
                      Target: <strong>Remain 100% Elastic</strong>
                    </div>
                  </div>
                </>
              )}

              {activeChallengeLevel === 2 && (
                <>
                  <div className={`thermo-challenge-target-card${params.appliedLoadKn >= 35 ? ' is-met' : ' is-unmet'}`}>
                    <div className="thermo-challenge-target-card__top">
                      <span className="thermo-challenge-target-card__name">TEST TENSILE LOAD</span>
                      <span className="thermo-challenge-target-card__indicator">
                        {params.appliedLoadKn >= 35 ? 'MET ✓' : 'NOT MET ✕'}
                      </span>
                    </div>
                    <div className="thermo-challenge-target-card__val">
                      {params.appliedLoadKn.toFixed(1)} <small style={{ fontSize: '0.85rem' }}>kN</small>
                    </div>
                    <div className="thermo-challenge-target-card__requirement">
                      Target: <strong>≥ 35.0 kN</strong>
                    </div>
                  </div>

                  <div className={`thermo-challenge-target-card${analysis.factorOfSafety >= 1.50 ? ' is-met' : ' is-unmet'}`}>
                    <div className="thermo-challenge-target-card__top">
                      <span className="thermo-challenge-target-card__name">FACTOR OF SAFETY</span>
                      <span className="thermo-challenge-target-card__indicator">
                        {analysis.factorOfSafety >= 1.50 ? 'CERTIFIED ✓' : 'LOW MARGIN ✕'}
                      </span>
                    </div>
                    <div className="thermo-challenge-target-card__val">
                      {analysis.factorOfSafety.toFixed(2)}
                    </div>
                    <div className="thermo-challenge-target-card__requirement">
                      Target: <strong>≥ 1.50 FoS</strong>
                    </div>
                  </div>

                  <div className={`thermo-challenge-target-card${!analysis.isYielded ? ' is-met' : ' is-unmet'}`}>
                    <div className="thermo-challenge-target-card__top">
                      <span className="thermo-challenge-target-card__name">INTEGRITY STATE</span>
                      <span className="thermo-challenge-target-card__indicator">
                        {!analysis.isYielded ? 'INTACT ✓' : 'FAILED ✕'}
                      </span>
                    </div>
                    <div className="thermo-challenge-target-card__val">
                      {analysis.statusLabel}
                    </div>
                    <div className="thermo-challenge-target-card__requirement">
                      Target: <strong>Safe / Optimal Rating</strong>
                    </div>
                  </div>
                </>
              )}

              {activeChallengeLevel === 3 && (
                <>
                  <div className={`thermo-challenge-target-card${params.appliedLoadKn >= 40 ? ' is-met' : ' is-unmet'}`}>
                    <div className="thermo-challenge-target-card__top">
                      <span className="thermo-challenge-target-card__name">HIGH-TENSILE LOAD</span>
                      <span className="thermo-challenge-target-card__indicator">
                        {params.appliedLoadKn >= 40 ? 'MET ✓' : 'NOT MET ✕'}
                      </span>
                    </div>
                    <div className="thermo-challenge-target-card__val">
                      {params.appliedLoadKn.toFixed(1)} <small style={{ fontSize: '0.85rem' }}>kN</small>
                    </div>
                    <div className="thermo-challenge-target-card__requirement">
                      Target: <strong>≥ 40.0 kN</strong>
                    </div>
                  </div>

                  <div className={`thermo-challenge-target-card${analysis.factorOfSafety >= 2.00 ? ' is-met' : ' is-unmet'}`}>
                    <div className="thermo-challenge-target-card__top">
                      <span className="thermo-challenge-target-card__name">SAFETY MARGIN (FOS)</span>
                      <span className="thermo-challenge-target-card__indicator">
                        {analysis.factorOfSafety >= 2.00 ? 'MET ✓' : 'NOT MET ✕'}
                      </span>
                    </div>
                    <div className="thermo-challenge-target-card__val">
                      {analysis.factorOfSafety.toFixed(2)}
                    </div>
                    <div className="thermo-challenge-target-card__requirement">
                      Target: <strong>≥ 2.00 FoS</strong>
                    </div>
                  </div>

                  <div className={`thermo-challenge-target-card${analysis.specimenMassKg <= 0.050 ? ' is-met' : ' is-unmet'}`}>
                    <div className="thermo-challenge-target-card__top">
                      <span className="thermo-challenge-target-card__name">AEROSPACE MASS LIMIT</span>
                      <span className="thermo-challenge-target-card__indicator">
                        {analysis.specimenMassKg <= 0.050 ? 'MET ✓' : 'OVERWEIGHT ✕'}
                      </span>
                    </div>
                    <div className="thermo-challenge-target-card__val">
                      {(analysis.specimenMassKg * 1000).toFixed(1)} <small style={{ fontSize: '0.85rem' }}>g</small>
                    </div>
                    <div className="thermo-challenge-target-card__requirement">
                      Target: <strong>≤ 50.0 g (0.050 kg)</strong>
                    </div>
                  </div>

                  <div className={`thermo-challenge-target-card${analysis.elongationMm <= 0.35 ? ' is-met' : ' is-unmet'}`}>
                    <div className="thermo-challenge-target-card__top">
                      <span className="thermo-challenge-target-card__name">MAX DEFLECTION (ΔL)</span>
                      <span className="thermo-challenge-target-card__indicator">
                        {analysis.elongationMm <= 0.35 ? 'MET ✓' : 'TOO FLEXIBLE ✕'}
                      </span>
                    </div>
                    <div className="thermo-challenge-target-card__val">
                      {analysis.elongationMm.toFixed(3)} <small style={{ fontSize: '0.85rem' }}>mm</small>
                    </div>
                    <div className="thermo-challenge-target-card__requirement">
                      Target: <strong>≤ 0.350 mm</strong>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Dynamic Guidance & Live Insight */}
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

            {/* Action Bar */}
            <div className="thermo-challenge-section__actions" style={{ gap: '0.75rem' }}>
              <button
                type="button"
                className="thermo-challenge-reset-button"
                onClick={handleReset}
                onPointerEnter={() => setIntent('button', 'RESET CHALLENGE')}
                onPointerLeave={clearIntent}
              >
                RESET CHALLENGE
              </button>
              {challengeEval.isPassed && activeChallengeLevel < 3 && (
                <button
                  type="button"
                  className="mechanical-button mechanical-button--primary"
                  onClick={() => setActiveChallengeLevel((prev) => Math.min(3, prev + 1))}
                  onPointerEnter={() => setIntent('button', 'NEXT LEVEL')}
                  onPointerLeave={clearIntent}
                >
                  NEXT LEVEL →
                </button>
              )}
              {challengeEval.isPassed && activeChallengeLevel === 3 && (
                <div className="thermo-challenge-complete-banner">
                  ★ ALL 3 MATERIALS MISSIONS MASTERED! METALLURGICAL ENGINEER ACHIEVED ★
                </div>
              )}
            </div>
          </section>

          <div className="lab-mode-prompt-card lab-mode-prompt-card--muted">
            <div className="lab-mode-prompt-card__content">
              <span className="lab-mode-prompt-card__badge">SANDBOX PLAY</span>
              <h3 className="lab-mode-prompt-card__title">
                Want to test specimens freely?
              </h3>
              <p className="lab-mode-prompt-card__desc">
                Switch to Explore Mode to tweak loads, dimensions, and compare steel, aluminum, titanium, composites, and polymers without mission constraints.
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
      <section className="materials-deep-dive-grid" aria-label="Tensile test equations and technical material data">
        <div className="materials-equations-card">
          <div className="materials-equations-card__head">
            <h2 className="materials-equations-card__title">SEE THE ENGINEERING</h2>
            <span className="materials-equations-card__badge">SOLID MECHANICS &amp; ASTM E8</span>
          </div>

          <p className="thermo-equations-card__intro">
            These governing equations dictate tensile stress, engineering strain, elastic elongation, and design margins:
          </p>

          <div className="materials-equations-list">
            <div className="materials-equation-item">
              <span className="materials-equation-item__title">Normal Tensile Stress (Internal Force Intensity)</span>
              <div className="math-equation" role="math" aria-label="sigma equals F divided by A">
                <span className="math-symbol">σ</span>
                <span className="math-op">=</span>
                <div className="math-fraction">
                  <span className="math-fraction__num"><span className="math-symbol">F</span></span>
                  <span className="math-fraction__den"><span className="math-symbol">A</span></span>
                </div>
                <span className="math-op">=</span>
                <div className="math-fraction">
                  <span className="math-fraction__num"><span className="math-symbol">F</span></span>
                  <span className="math-fraction__den">
                    <span className="math-symbol">w</span><span className="math-op">·</span><span className="math-symbol">t</span>
                  </span>
                </div>
              </div>
              <p className="materials-equation-item__desc">
                Normal stress represents the internal resisting force per unit area. Increasing cross-sectional area (w · t) distributes the load across more atomic bonds, lowering internal stress.
              </p>
            </div>

            <div className="materials-equation-item">
              <span className="materials-equation-item__title">Engineering Normal Strain (Relative Elongation)</span>
              <div className="math-equation" role="math" aria-label="epsilon equals delta L divided by L 0">
                <span className="math-symbol">ε</span>
                <span className="math-op">=</span>
                <div className="math-fraction">
                  <span className="math-fraction__num"><span className="math-symbol">ΔL</span></span>
                  <span className="math-fraction__den"><span className="math-symbol">L<sub className="math-sub">0</sub></span></span>
                </div>
              </div>
              <p className="materials-equation-item__desc">
                Dimensionless measure of deformation. Normalizes total stretch ΔL against original gauge length L₀, enabling direct comparison across specimens of arbitrary geometry.
              </p>
            </div>

            <div className="materials-equation-item">
              <span className="materials-equation-item__title">Hooke's Law &amp; Total Elastic Elongation</span>
              <div className="math-equation" role="math" aria-label="sigma equals E times epsilon, which implies delta L equals (F times L 0) divided by (E times A)">
                <span className="math-symbol">σ</span>
                <span className="math-op">=</span>
                <span className="math-symbol">E</span>
                <span className="math-op">·</span>
                <span className="math-symbol">ε</span>
                <span className="math-op">⟹</span>
                <span className="math-symbol">ΔL</span>
                <span className="math-op">=</span>
                <div className="math-fraction">
                  <span className="math-fraction__num">
                    <span className="math-symbol">F</span><span className="math-op">·</span><span className="math-symbol">L<sub className="math-sub">0</sub></span>
                  </span>
                  <span className="math-fraction__den">
                    <span className="math-symbol">E</span><span className="math-op">·</span><span className="math-symbol">A</span>
                  </span>
                </div>
              </div>
              <p className="materials-equation-item__desc">
                Within the elastic limit, stress and strain are directly proportional through Young's Modulus E. High-modulus materials like steel (205 GPa) stretch far less than compliant polymers (3 GPa) under identical load.
              </p>
            </div>

            <div className="materials-equation-item">
              <span className="materials-equation-item__title">Factor of Safety (Yield Margin)</span>
              <div className="math-equation" role="math" aria-label="FoS equals sigma yield divided by sigma max greater than or equal to 1.50">
                <span className="math-symbol">FoS</span>
                <span className="math-op">=</span>
                <div className="math-fraction">
                  <span className="math-fraction__num">
                    <span className="math-symbol">σ<sub className="math-sub">yield</sub></span>
                  </span>
                  <span className="math-fraction__den">
                    <span className="math-symbol">σ</span>
                  </span>
                </div>
                <span className="math-op">≥</span>
                <span>1.50</span>
              </div>
              <p className="materials-equation-item__desc">
                Structures must operate with a guaranteed safety buffer below yield strength to prevent plastic deformation caused by shock loads, manufacturing tolerances, and cyclical fatigue.
              </p>
            </div>
          </div>
        </div>

        <div className="materials-technical-data-card">
          <div className="materials-technical-data-card__head">
            <h2 className="materials-technical-data-card__title">ENGINEERING DATA</h2>
            <button
              type="button"
              className="materials-technical-data-card__toggle-btn"
              onClick={() => setShowMoreData((prev) => !prev)}
              aria-expanded={showMoreData}
            >
              {showMoreData ? 'HIDE DETAILS ▲' : 'EXPAND ALL ▼'}
            </button>
          </div>

          <div className="materials-tech-table">
            <div className="materials-tech-row">
              <span>Selected Material</span>
              <strong>{analysis.material.name}</strong>
            </div>
            <div className="materials-tech-row">
              <span>Gauge Cross-Section (w × t)</span>
              <strong>{params.gaugeWidthMm} mm × {params.gaugeThicknessMm} mm</strong>
            </div>
            <div className="materials-tech-row">
              <span>Resisting Area (A)</span>
              <strong>{analysis.crossSectionAreaMm2.toFixed(1)} mm² ({(analysis.crossSectionAreaM2 * 1e4).toFixed(2)} cm²)</strong>
            </div>
            <div className="materials-tech-row">
              <span>Young's Modulus (E)</span>
              <strong>{analysis.material.youngsModulusGpa} GPa</strong>
            </div>
            <div className="materials-tech-row">
              <span>Yield Strength (σ_y)</span>
              <strong>{analysis.material.yieldStrengthMpa} MPa</strong>
            </div>
            <div className="materials-tech-row">
              <span>Ultimate Tensile Strength (UTS)</span>
              <strong>{analysis.material.ultimateTensileStrengthMpa} MPa</strong>
            </div>
            <div className="materials-tech-row">
              <span>Material Density (ρ)</span>
              <strong>{analysis.material.densityKgM3.toLocaleString()} kg/m³</strong>
            </div>
            <div className="materials-tech-row">
              <span>Specimen Gauge Mass</span>
              <strong>{(analysis.specimenMassKg * 1000).toFixed(2)} g ({analysis.specimenMassKg.toFixed(4)} kg)</strong>
            </div>
            <div className="materials-tech-row">
              <span>Poisson's Ratio (ν)</span>
              <strong>{analysis.material.poissonsRatio}</strong>
            </div>
            <div className="materials-tech-row">
              <span>Fracture Elongation Limit</span>
              <strong>{analysis.material.elongationAtFracturePercent}%</strong>
            </div>
          </div>

          {showMoreData && (
            <div className="thermo-technical-expanded">
              <h3 className="thermo-technical-expanded__subtitle">ASTM E8 TENSILE TESTING ASSUMPTIONS</h3>
              <div className="thermo-assumptions-list">
                <div className="thermo-assumption-item">
                  <strong className="thermo-assumption-item__title">Uniaxial Stress State</strong>
                  <p className="thermo-assumption-item__statement">
                    Load is applied purely along the longitudinal axis via rigid hydraulic wedge grips. End effects and localized clamping stresses attenuate outside the uniform gauge region by Saint-Venant's principle.
                  </p>
                </div>
                <div className="thermo-assumption-item">
                  <strong className="thermo-assumption-item__title">Poisson Contraction &amp; Necking</strong>
                  <p className="thermo-assumption-item__statement">
                    During axial tension, lateral dimensions shrink by ν · ε. Beyond the ultimate tensile strength (UTS), uniform deformation becomes unstable and localized necking precipitates ductile rupture.
                  </p>
                </div>
                <div className="thermo-assumption-item">
                  <strong className="thermo-assumption-item__title">Engineering vs. True Stress</strong>
                  <p className="thermo-assumption-item__statement">
                    Engineering stress σ = F / A₀ uses the original undeformed area A₀. For small elastic deformations (ε &lt; 0.2%), engineering stress matches true Cauchy stress within 0.1%.
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

// ── Active Manufacturing Flagship Experience ─────────────────────────
interface ActiveManufacturingProps {
  system: LabSystemConfig
  mode: 'explore' | 'challenge'
  onSwitchMode: (mode: 'explore' | 'challenge') => void
}

function ActiveManufacturingLab({ system, mode, onSwitchMode }: ActiveManufacturingProps) {
  const { setIntent, clearIntent } = usePointer()
  const [params, setParams] = useState<ManufacturingParams>(DEFAULT_MANUFACTURING_PARAMS)
  const [prevParams, setPrevParams] = useState<ManufacturingParams>(DEFAULT_MANUFACTURING_PARAMS)
  const [activeChallengeLevel, setActiveChallengeLevel] = useState<number>(1)
  const [showMoreData, setShowMoreData] = useState<boolean>(false)

  const analysis = useMemo(() => calculateManufacturingAnalysis(params), [params])
  const dynamicExp = useMemo(
    () => getManufacturingDynamicExplanation(params, prevParams),
    [params, prevParams]
  )
  const challengeEval = useMemo(
    () => MANUFACTURING_FLAGSHIP_CHALLENGE.evaluate(params, analysis, activeChallengeLevel),
    [params, analysis, activeChallengeLevel]
  )

  const handleParamChange = (partial: Partial<ManufacturingParams>) => {
    setPrevParams(params)
    setParams((prev) => ({ ...prev, ...partial }))
  }

  const handleReset = () => {
    setPrevParams(params)
    setParams(DEFAULT_MANUFACTURING_PARAMS)
  }

  return (
    <div className="mech-lab-system-page">
      <MechLabSystemHeader
        system={system}
        mode={mode}
        onModeChange={onSwitchMode}
      />

      {/* ── Section 1: CNC Machining Center Visualization & Telemetry Controls ── */}
      <section aria-label="CNC milling machining simulator and process telemetry">
        <ManufacturingExperimentView
          params={params}
          analysis={analysis}
          onParamChange={handleParamChange}
          onReset={handleReset}
          activeLevel={activeChallengeLevel}
          isChallengeMode={mode === 'challenge'}
          onSwitchMode={onSwitchMode}
        />
      </section>

      {/* ── Section 2: Explore Mode — "WHAT'S HAPPENING?" ── */}
      {mode === 'explore' && (
        <>
          <section className="thermo-dynamic-grid" aria-label="Live physical explanation of machining parameters">
            <div className="thermo-dynamic-grid__head">
              <span className="thermo-dynamic-grid__badge">LIVE PROCESS REACTION</span>
              <h2 className="thermo-dynamic-grid__title">WHAT'S HAPPENING?</h2>
              <p className="thermo-dynamic-grid__subtitle">
                Modify spindle RPM, feed per tooth, or cutting depth to watch cutting forces, chip evacuation rate, and surface finish react in real time.
              </p>
            </div>

            <div className="thermo-dynamic-cards">
              <div className="design-dynamic-card">
                <span className="design-dynamic-card__step">01</span>
                <span className="design-dynamic-card__label">YOU CHANGED:</span>
                <p className="design-dynamic-card__content">{dynamicExp.whatChanged}</p>
              </div>

              <div className="design-dynamic-card design-dynamic-card--highlight">
                <span className="design-dynamic-card__step">02</span>
                <span className="design-dynamic-card__label">THE PROCESS RESPONDED:</span>
                <p className="design-dynamic-card__content">{dynamicExp.whatHappened}</p>
              </div>

              <div className="design-dynamic-card">
                <span className="design-dynamic-card__step">03</span>
                <span className="design-dynamic-card__label">WHY? (PHYSICAL PRINCIPLE):</span>
                <p className="design-dynamic-card__content">{dynamicExp.why}</p>
              </div>
            </div>
          </section>

          <div className="lab-mode-prompt-card">
            <div className="lab-mode-prompt-card__content">
              <span className="lab-mode-prompt-card__badge">READY TO QUALIFY?</span>
              <h3 className="lab-mode-prompt-card__title">
                Put your machining parameters to the test
              </h3>
              <p className="lab-mode-prompt-card__desc">
                Engage Challenge Mode to tackle 3 graded machining missions: Roughing throughput, aerospace mirror finishing, and ferrous steel optimization.
              </p>
            </div>
            <button
              type="button"
              className="mechanical-button mechanical-button--primary"
              onClick={() => onSwitchMode('challenge')}
              onPointerEnter={() => setIntent('button', 'CHALLENGE')}
              onPointerLeave={clearIntent}
            >
              SWITCH TO CHALLENGE MODE →
            </button>
          </div>
        </>
      )}

      {/* ── Section 3: Challenge Mode ── */}
      {mode === 'challenge' && (
        <>
          <section className="thermo-challenge-section" aria-labelledby="mfg-challenge-heading">
            <div className="thermo-challenge-section__head">
              <div>
                <div className="thermo-challenge-section__eyebrow">
                  MISSION PROGRESSION · LEVEL {activeChallengeLevel} OF 3
                </div>
                <h2 id="mfg-challenge-heading" className="thermo-challenge-section__title">
                  {MANUFACTURING_FLAGSHIP_CHALLENGE.title}
                </h2>
                <p className="thermo-challenge-section__desc">
                  {MANUFACTURING_FLAGSHIP_CHALLENGE.description}
                </p>
              </div>

              <div
                className={`thermo-challenge-section__status-badge ${
                  challengeEval.isPassed ? 'is-passed' : 'is-unmet'
                }`}
              >
                {challengeEval.isPassed ? 'TARGET REACHED ✓' : challengeEval.status}
              </div>
            </div>

            {/* Level Switcher (LVL 1, LVL 2, LVL 3) */}
            <div className="thermo-challenge-levels" role="tablist" aria-label="Challenge progression levels">
              {MANUFACTURING_LEVELS.map((lvl) => (
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
              <strong>Mission:</strong> {MANUFACTURING_LEVELS[activeChallengeLevel - 1].objective}
              <MechLabHint hint={MANUFACTURING_LEVELS[activeChallengeLevel - 1].hint} />
            </div>

            {/* Target Criteria Live Metrics */}
            <div className="thermo-challenge-criteria-grid">
              {activeChallengeLevel === 1 && (
                <>
                  <div className={`thermo-challenge-target-card${analysis.materialRemovalRateCm3Min >= 25.0 ? ' is-met' : ' is-unmet'}`}>
                    <div className="thermo-challenge-target-card__top">
                      <span className="thermo-challenge-target-card__name">MATERIAL REMOVAL RATE (MRR)</span>
                      <span className="thermo-challenge-target-card__indicator">
                        {analysis.materialRemovalRateCm3Min >= 25.0 ? 'MET ✓' : 'NOT MET ✕'}
                      </span>
                    </div>
                    <div className="thermo-challenge-target-card__val">
                      {analysis.materialRemovalRateCm3Min.toFixed(1)} <small style={{ fontSize: '0.85rem' }}>cm³/min</small>
                    </div>
                    <div className="thermo-challenge-target-card__sub">
                      Target: ≥ 25.0 cm³/min
                    </div>
                  </div>

                  <div className={`thermo-challenge-target-card${analysis.spindlePowerKw <= 4.5 && !analysis.isOverloaded ? ' is-met' : ' is-unmet'}`}>
                    <div className="thermo-challenge-target-card__top">
                      <span className="thermo-challenge-target-card__name">SPINDLE POWER (Pc)</span>
                      <span className="thermo-challenge-target-card__indicator">
                        {analysis.spindlePowerKw <= 4.5 && !analysis.isOverloaded ? 'MET ✓' : 'NOT MET ✕'}
                      </span>
                    </div>
                    <div className="thermo-challenge-target-card__val">
                      {analysis.spindlePowerKw.toFixed(2)} <small style={{ fontSize: '0.85rem' }}>kW</small>
                    </div>
                    <div className="thermo-challenge-target-card__sub">
                      Target: ≤ 4.50 kW (Load: {analysis.spindleLoadPercent.toFixed(1)}%)
                    </div>
                  </div>
                </>
              )}

              {activeChallengeLevel === 2 && (
                <>
                  <div className={`thermo-challenge-target-card${analysis.surfaceRoughnessRaUm <= 1.20 ? ' is-met' : ' is-unmet'}`}>
                    <div className="thermo-challenge-target-card__top">
                      <span className="thermo-challenge-target-card__name">SURFACE ROUGHNESS (Ra)</span>
                      <span className="thermo-challenge-target-card__indicator">
                        {analysis.surfaceRoughnessRaUm <= 1.20 ? 'MET ✓' : 'NOT MET ✕'}
                      </span>
                    </div>
                    <div className="thermo-challenge-target-card__val">
                      {analysis.surfaceRoughnessRaUm.toFixed(2)} <small style={{ fontSize: '0.85rem' }}>µm</small>
                    </div>
                    <div className="thermo-challenge-target-card__sub">
                      Target: ≤ 1.20 µm (Fine Finish)
                    </div>
                  </div>

                  <div className={`thermo-challenge-target-card${analysis.materialRemovalRateCm3Min >= 10.0 ? ' is-met' : ' is-unmet'}`}>
                    <div className="thermo-challenge-target-card__top">
                      <span className="thermo-challenge-target-card__name">PRODUCTION THROUGHPUT (MRR)</span>
                      <span className="thermo-challenge-target-card__indicator">
                        {analysis.materialRemovalRateCm3Min >= 10.0 ? 'MET ✓' : 'NOT MET ✕'}
                      </span>
                    </div>
                    <div className="thermo-challenge-target-card__val">
                      {analysis.materialRemovalRateCm3Min.toFixed(1)} <small style={{ fontSize: '0.85rem' }}>cm³/min</small>
                    </div>
                    <div className="thermo-challenge-target-card__sub">
                      Target: ≥ 10.0 cm³/min
                    </div>
                  </div>

                  <div className={`thermo-challenge-target-card${analysis.spindlePowerKw <= 3.50 ? ' is-met' : ' is-unmet'}`}>
                    <div className="thermo-challenge-target-card__top">
                      <span className="thermo-challenge-target-card__name">FINISHING POWER (Pc)</span>
                      <span className="thermo-challenge-target-card__indicator">
                        {analysis.spindlePowerKw <= 3.50 ? 'MET ✓' : 'NOT MET ✕'}
                      </span>
                    </div>
                    <div className="thermo-challenge-target-card__val">
                      {analysis.spindlePowerKw.toFixed(2)} <small style={{ fontSize: '0.85rem' }}>kW</small>
                    </div>
                    <div className="thermo-challenge-target-card__sub">
                      Target: ≤ 3.50 kW
                    </div>
                  </div>
                </>
              )}

              {activeChallengeLevel === 3 && (
                <>
                  <div className={`thermo-challenge-target-card${params.materialId === 'mild_steel_1018' ? ' is-met' : ' is-unmet'}`}>
                    <div className="thermo-challenge-target-card__top">
                      <span className="thermo-challenge-target-card__name">WORKPIECE MATERIAL</span>
                      <span className="thermo-challenge-target-card__indicator">
                        {params.materialId === 'mild_steel_1018' ? 'MET ✓' : 'NOT MET ✕'}
                      </span>
                    </div>
                    <div className="thermo-challenge-target-card__val" style={{ fontSize: '1.25rem' }}>
                      {analysis.material.name}
                    </div>
                    <div className="thermo-challenge-target-card__sub">
                      Target: AISI 1018 Low-Carbon Steel
                    </div>
                  </div>

                  <div className={`thermo-challenge-target-card${analysis.materialRemovalRateCm3Min >= 28.0 ? ' is-met' : ' is-unmet'}`}>
                    <div className="thermo-challenge-target-card__top">
                      <span className="thermo-challenge-target-card__name">STEEL REMOVAL RATE (MRR)</span>
                      <span className="thermo-challenge-target-card__indicator">
                        {analysis.materialRemovalRateCm3Min >= 28.0 ? 'MET ✓' : 'NOT MET ✕'}
                      </span>
                    </div>
                    <div className="thermo-challenge-target-card__val">
                      {analysis.materialRemovalRateCm3Min.toFixed(1)} <small style={{ fontSize: '0.85rem' }}>cm³/min</small>
                    </div>
                    <div className="thermo-challenge-target-card__sub">
                      Target: ≥ 28.0 cm³/min
                    </div>
                  </div>

                  <div className={`thermo-challenge-target-card${analysis.surfaceRoughnessRaUm <= 1.80 ? ' is-met' : ' is-unmet'}`}>
                    <div className="thermo-challenge-target-card__top">
                      <span className="thermo-challenge-target-card__name">SURFACE ROUGHNESS (Ra)</span>
                      <span className="thermo-challenge-target-card__indicator">
                        {analysis.surfaceRoughnessRaUm <= 1.80 ? 'MET ✓' : 'NOT MET ✕'}
                      </span>
                    </div>
                    <div className="thermo-challenge-target-card__val">
                      {analysis.surfaceRoughnessRaUm.toFixed(2)} <small style={{ fontSize: '0.85rem' }}>µm</small>
                    </div>
                    <div className="thermo-challenge-target-card__sub">
                      Target: ≤ 1.80 µm
                    </div>
                  </div>

                  <div className={`thermo-challenge-target-card${analysis.spindleLoadPercent <= 85.0 ? ' is-met' : ' is-unmet'}`}>
                    <div className="thermo-challenge-target-card__top">
                      <span className="thermo-challenge-target-card__name">SPINDLE MOTOR LOAD</span>
                      <span className="thermo-challenge-target-card__indicator">
                        {analysis.spindleLoadPercent <= 85.0 ? 'MET ✓' : 'NOT MET ✕'}
                      </span>
                    </div>
                    <div className="thermo-challenge-target-card__val">
                      {analysis.spindleLoadPercent.toFixed(1)}%
                    </div>
                    <div className="thermo-challenge-target-card__sub">
                      Target: ≤ 85.0% ({analysis.spindlePowerKw.toFixed(2)} kW)
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Mission Status / Feedback Card */}
            <div
              className={`thermo-challenge-feedback-card ${
                challengeEval.isPassed ? 'is-success' : 'is-warning'
              }`}
            >
              <div className="thermo-challenge-feedback-card__status">
                {challengeEval.isPassed ? 'MISSION COMPLETE ✓' : `STATUS: ${challengeEval.status}`}
              </div>
              <p className="thermo-challenge-feedback-card__msg">
                {challengeEval.feedbackMessage}
              </p>
              {challengeEval.engineeringInsight && (
                <div className="thermo-challenge-feedback-card__insight">
                  <strong>Engineering Trade-off:</strong> {challengeEval.engineeringInsight}
                </div>
              )}
            </div>

            {/* Actions: Reset, Next Level, Complete */}
            <div className="thermo-challenge-actions">
              <button
                type="button"
                className="mechanical-button"
                onClick={handleReset}
                onPointerEnter={() => setIntent('button', 'RESET CHALLENGE')}
                onPointerLeave={clearIntent}
              >
                RESET CHALLENGE
              </button>
              {challengeEval.isPassed && activeChallengeLevel < 3 && (
                <button
                  type="button"
                  className="mechanical-button mechanical-button--primary"
                  onClick={() => setActiveChallengeLevel((prev) => Math.min(3, prev + 1))}
                  onPointerEnter={() => setIntent('button', 'NEXT LEVEL')}
                  onPointerLeave={clearIntent}
                >
                  NEXT LEVEL →
                </button>
              )}
              {challengeEval.isPassed && activeChallengeLevel === 3 && (
                <div className="thermo-challenge-complete-banner">
                  ★ ALL 3 MANUFACTURING MISSIONS MASTERED! PRODUCTION MACHINING SPECIALIST ACHIEVED ★
                </div>
              )}
            </div>
          </section>

          <div className="lab-mode-prompt-card lab-mode-prompt-card--muted">
            <div className="lab-mode-prompt-card__content">
              <span className="lab-mode-prompt-card__badge">SANDBOX PLAY</span>
              <h3 className="lab-mode-prompt-card__title">
                Want to cut chips freely?
              </h3>
              <p className="lab-mode-prompt-card__desc">
                Switch to Explore Mode to tweak cutting speeds, depth of cut, flute geometry, and compare aluminum, titanium, steel, and brass without mission boundaries.
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
      <section className="materials-deep-dive-grid" aria-label="Machining equations and CNC technical process telemetry">
        <div className="materials-equations-card">
          <div className="materials-equations-card__head">
            <h2 className="materials-equations-card__title">SEE THE ENGINEERING</h2>
            <span className="materials-equations-card__badge">METAL CUTTING MECHANICS &amp; ASME B5</span>
          </div>

          <p className="thermo-equations-card__intro">
            These governing equations dictate chip formation velocity, machine table productivity, spindle power consumption, and arithmetic surface texture:
          </p>

          <div className="materials-equations-list">
            <div className="materials-equation-item">
              <span className="materials-equation-item__title">Surface Cutting Speed (Peripheral Flute Velocity)</span>
              <div className="math-equation" role="math" aria-label="Vc equals pi times D times N divided by 1000">
                <span className="math-symbol">V<sub className="math-sub">c</sub></span>
                <span className="math-op">=</span>
                <div className="math-fraction">
                  <span className="math-fraction__num">
                    <span className="math-symbol">π</span><span className="math-op">·</span><span className="math-symbol">D</span><span className="math-op">·</span><span className="math-symbol">N</span>
                  </span>
                  <span className="math-fraction__den">
                    <span>1000</span>
                  </span>
                </div>
              </div>
              <p className="materials-equation-item__desc">
                The linear peripheral speed at the outermost cutter flute. Dictates tool life and shear zone temperature according to Taylor&apos;s tool life law (V_c · T^n = C).
              </p>
            </div>

            <div className="materials-equation-item">
              <span className="materials-equation-item__title">Table Traverse Feed Rate (Linear Machine Speed)</span>
              <div className="math-equation" role="math" aria-label="vf equals fz times z times N">
                <span className="math-symbol">v<sub className="math-sub">f</sub></span>
                <span className="math-op">=</span>
                <span className="math-symbol">f<sub className="math-sub">z</sub></span>
                <span className="math-op">·</span>
                <span className="math-symbol">z</span>
                <span className="math-op">·</span>
                <span className="math-symbol">N</span>
              </div>
              <p className="materials-equation-item__desc">
                The linear forward travel speed of the CNC machine table, calculated from programmed feed per tooth (f_z), total cutter flutes (z), and spindle rotational speed (N).
              </p>
            </div>

            <div className="materials-equation-item">
              <span className="materials-equation-item__title">Volumetric Material Removal Rate (Throughput)</span>
              <div className="math-equation" role="math" aria-label="MRR equals ap times ae times vf divided by 1000">
                <span className="math-symbol">MRR</span>
                <span className="math-op">=</span>
                <div className="math-fraction">
                  <span className="math-fraction__num">
                    <span className="math-symbol">a<sub className="math-sub">p</sub></span><span className="math-op">·</span><span className="math-symbol">a<sub className="math-sub">e</sub></span><span className="math-op">·</span><span className="math-symbol">v<sub className="math-sub">f</sub></span>
                  </span>
                  <span className="math-fraction__den">
                    <span>1000</span>
                  </span>
                </div>
              </div>
              <p className="materials-equation-item__desc">
                Measures total solid stock evacuated per minute into chips. Governed by axial depth of cut (a_p), radial width of engagement (a_e), and table translation speed (v_f).
              </p>
            </div>

            <div className="materials-equation-item">
              <span className="materials-equation-item__title">Spindle Cutting Power &amp; Specific Cutting Energy</span>
              <div className="math-equation" role="math" aria-label="Pc equals Fc times Vc divided by (60000 times eta)">
                <span className="math-symbol">P<sub className="math-sub">c</sub></span>
                <span className="math-op">=</span>
                <div className="math-fraction">
                  <span className="math-fraction__num">
                    <span className="math-symbol">F<sub className="math-sub">c</sub></span><span className="math-op">·</span><span className="math-symbol">V<sub className="math-sub">c</sub></span>
                  </span>
                  <span className="math-fraction__den">
                    <span>60000</span><span className="math-op">·</span><span className="math-symbol">η</span>
                  </span>
                </div>
                <span className="math-op">=</span>
                <div className="math-fraction">
                  <span className="math-fraction__num">
                    <span className="math-symbol">k<sub className="math-sub">c</sub></span><span className="math-op">·</span><span className="math-symbol">a<sub className="math-sub">p</sub></span><span className="math-op">·</span><span className="math-symbol">f<sub className="math-sub">z</sub></span><span className="math-op">·</span><span className="math-symbol">V<sub className="math-sub">c</sub></span>
                  </span>
                  <span className="math-fraction__den">
                    <span>60000</span><span className="math-op">·</span><span className="math-symbol">η</span>
                  </span>
                </div>
              </div>
              <p className="materials-equation-item__desc">
                Mechanical power demanded from the spindle motor. Scales with material specific cutting resistance (k_c) and instantaneous undeformed chip cross-section.
              </p>
            </div>

            <div className="materials-equation-item">
              <span className="materials-equation-item__title">Theoretical Surface Roughness (Cusp Height)</span>
              <div className="math-equation" role="math" aria-label="Ra equals (fz squared divided by 32 times r epsilon) times 1000">
                <span className="math-symbol">R<sub className="math-sub">a</sub></span>
                <span className="math-op">≈</span>
                <div className="math-fraction">
                  <span className="math-fraction__num">
                    <span className="math-symbol">f<sub className="math-sub">z</sub><sup className="math-sup">2</sup></span>
                  </span>
                  <span className="math-fraction__den">
                    <span>32</span><span className="math-op">·</span><span className="math-symbol">r<sub className="math-sub">ε</sub></span>
                  </span>
                </div>
                <span className="math-op">·</span>
                <span>1000</span>
              </div>
              <p className="materials-equation-item__desc">
                Arithmetic average roughness generated by tool nose cusps. Because roughness scales quadratically with feed per tooth (f_z²), moderating feed yields mirror-grade surface quality.
              </p>
            </div>
          </div>
        </div>

        <div className="materials-technical-data-card">
          <div className="materials-technical-data-card__head">
            <h2 className="materials-technical-data-card__title">ENGINEERING DATA</h2>
            <button
              type="button"
              className="materials-technical-data-card__toggle-btn"
              onClick={() => setShowMoreData((prev) => !prev)}
              aria-expanded={showMoreData}
            >
              {showMoreData ? 'HIDE DETAILS ▲' : 'EXPAND ALL ▼'}
            </button>
          </div>

          <div className="materials-tech-table">
            <div className="materials-tech-row">
              <span>Workpiece Stock</span>
              <strong>{analysis.material.name}</strong>
            </div>
            <div className="materials-tech-row">
              <span>Cutting Tool</span>
              <strong>{analysis.tool.name} (Ø{analysis.tool.diameterMm} mm, {analysis.tool.fluteCount}F)</strong>
            </div>
            <div className="materials-tech-row">
              <span>Specific Cutting Resistance (k_c)</span>
              <strong>{analysis.material.specificCuttingForceKc} N/mm²</strong>
            </div>
            <div className="materials-tech-row">
              <span>Surface Cutting Speed (V_c)</span>
              <strong>{analysis.cuttingSpeedMpm} m/min</strong>
            </div>
            <div className="materials-tech-row">
              <span>Table Traverse Feed (v_f)</span>
              <strong>{analysis.tableFeedMmPerMin} mm/min</strong>
            </div>
            <div className="materials-tech-row">
              <span>Material Removal Rate (MRR)</span>
              <strong>{analysis.materialRemovalRateCm3Min} cm³/min</strong>
            </div>
            <div className="materials-tech-row">
              <span>Tangential Cutting Force (F_c)</span>
              <strong>{analysis.tangentialCuttingForceN} N</strong>
            </div>
            <div className="materials-tech-row">
              <span>Spindle Motor Power (P_c)</span>
              <strong>{analysis.spindlePowerKw} kW ({analysis.spindleLoadPercent}% Load)</strong>
            </div>
            <div className="materials-tech-row">
              <span>Arithmetic Roughness (R_a)</span>
              <strong>{analysis.surfaceRoughnessRaUm} µm</strong>
            </div>
            <div className="materials-tech-row">
              <span>Estimated Cutting Zone Temp</span>
              <strong>{analysis.estimatedCuttingTempC} °C ({params.coolantActive ? 'Flood Coolant ON' : 'Dry Cut'})</strong>
            </div>
          </div>

          {showMoreData && (
            <div className="thermo-technical-expanded">
              <h3 className="thermo-technical-expanded__subtitle">CNC MILLING PROCESS ASSUMPTIONS &amp; PHYSICS</h3>
              <div className="thermo-assumptions-list">
                <div className="thermo-assumption-item">
                  <strong className="thermo-assumption-item__title">Kienzle Specific Force Model</strong>
                  <p className="thermo-assumption-item__statement">
                    Tangential cutting force F_c = k_c · a_p · f_z accounts for material shear flow stress and chip compression. In tougher ferrous alloys, high k_c demands proportional spindle torque.
                  </p>
                </div>
                <div className="thermo-assumption-item">
                  <strong className="thermo-assumption-item__title">Taylor Tool Life &amp; Thermal Wear</strong>
                  <p className="thermo-assumption-item__statement">
                    Elevated cutting speeds V_c generate high localized interface temperatures. Flood coolant suppresses crater wear, flushes chips, and prevents thermally induced tool breakdown.
                  </p>
                </div>
                <div className="thermo-assumption-item">
                  <strong className="thermo-assumption-item__title">Theoretical Cusp Scallop Geometry</strong>
                  <p className="thermo-assumption-item__statement">
                    Arithmetic roughness R_a follows the parabolic scallop profile left by tool nose radius r_ε across successive feed tooth passes, scaling with f_z² / (32 · r_ε).
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

// ── Active Mechatronics Flagship Experiment Experience ────────────────
interface ActiveMechatronicsProps {
  system: LabSystemConfig
  mode: 'explore' | 'challenge'
  onSwitchMode: (mode: 'explore' | 'challenge') => void
}

function ActiveMechatronicsLab({ system, mode, onSwitchMode }: ActiveMechatronicsProps) {
  const { setIntent, clearIntent } = usePointer()

  const [params, setParams] = useState<MechatronicsParams>(DEFAULT_MECHATRONICS_PARAMS)
  const [prevParams, setPrevParams] = useState<MechatronicsParams>(DEFAULT_MECHATRONICS_PARAMS)
  const [activeChallengeLevel, setActiveChallengeLevel] = useState<number>(1)
  const [showMoreData, setShowMoreData] = useState<boolean>(false)

  const analysis = useMemo(() => calculateMechatronicsAnalysis(params), [params])

  const dynamicExp = useMemo(
    () => getMechatronicsDynamicExplanation(params, prevParams),
    [params, prevParams]
  )

  const challengeEval = useMemo(
    () => MECHATRONICS_FLAGSHIP_CHALLENGE.evaluate(params, analysis, activeChallengeLevel),
    [params, analysis, activeChallengeLevel]
  )

  const handleParamChange = (
    targetMm: number,
    kp: number,
    kd: number,
    ki: number,
    disturbanceN: number
  ) => {
    setPrevParams(params)
    setParams({
      targetPositionMm: targetMm,
      targetPosition: targetMm,
      proportionalGainKp: kp,
      proportionalGain: kp,
      derivativeGainKd: kd,
      derivativeGain: kd,
      integralGainKi: ki,
      disturbanceLoadN: disturbanceN,
    })
  }

  const handleReset = () => {
    setPrevParams(params)
    setParams(DEFAULT_MECHATRONICS_PARAMS)
  }

  return (
    <div className="mech-lab-system-page">
      <MechLabSystemHeader
        system={system}
        mode={mode}
        onModeChange={onSwitchMode}
      />

      {/* ── Section 1: Mechatronics Linear Stage & Simulation ── */}
      <section aria-label="Closed-loop linear servo stage simulator and PID controller">
        <MechatronicsExperimentView
          targetPositionMm={params.targetPositionMm}
          proportionalGainKp={params.proportionalGainKp}
          derivativeGainKd={params.derivativeGainKd}
          integralGainKi={params.integralGainKi}
          disturbanceLoadN={params.disturbanceLoadN}
          onParamChange={handleParamChange}
          onReset={handleReset}
          activeLevel={activeChallengeLevel}
          isChallengeMode={mode === 'challenge'}
        />
      </section>

      {/* ── Section 2: Explore Mode — "WHAT'S HAPPENING?" ── */}
      {mode === 'explore' && (
        <>
          <section className="thermo-dynamic-grid" aria-label="Live physical explanation of closed-loop servo dynamics">
            <div className="thermo-dynamic-grid__head">
              <span className="thermo-dynamic-grid__badge">LIVE CLOSED-LOOP REACTION</span>
              <h2 className="thermo-dynamic-grid__title">WHAT&apos;S HAPPENING?</h2>
              <p className="thermo-dynamic-grid__subtitle">
                Command target coordinates or adjust PID gains to see how servo bandwidth, damping, overshoot, and disturbance rejection behave in real time.
              </p>
            </div>

            <div className="thermo-dynamic-cards">
              <div className="design-dynamic-card">
                <span className="design-dynamic-card__step">01</span>
                <span className="design-dynamic-card__label">YOU CHANGED:</span>
                <p className="design-dynamic-card__content">{dynamicExp.whatChanged}</p>
              </div>

              <div className="design-dynamic-card design-dynamic-card--highlight">
                <span className="design-dynamic-card__step">02</span>
                <span className="design-dynamic-card__label">THE SYSTEM RESPONDED:</span>
                <p className="design-dynamic-card__content">{dynamicExp.whatHappened}</p>
              </div>

              <div className="design-dynamic-card">
                <span className="design-dynamic-card__step">03</span>
                <span className="design-dynamic-card__label">WHY? (PHYSICAL PRINCIPLE):</span>
                <p className="design-dynamic-card__content">{dynamicExp.why}</p>
              </div>
            </div>
          </section>

          <div className="lab-mode-prompt-card">
            <div className="lab-mode-prompt-card__content">
              <span className="lab-mode-prompt-card__badge">READY TO QUALIFY?</span>
              <h3 className="lab-mode-prompt-card__title">
                Test your servo tuning intuition under real mission loads
              </h3>
              <p className="lab-mode-prompt-card__desc">
                Switch to Challenge Mode to test your closed-loop position accuracy, overshoot dampening, and disturbance rejection against standardized criteria.
              </p>
            </div>
            <button
              type="button"
              className="mechanical-button mechanical-button--primary"
              onClick={() => onSwitchMode('challenge')}
              onPointerEnter={() => setIntent('button', 'CHALLENGE')}
              onPointerLeave={clearIntent}
            >
              START MECHATRONICS CHALLENGE →
            </button>
          </div>
        </>
      )}

      {/* ── Section 3: Challenge Mode ── */}
      {mode === 'challenge' && (
        <>
          <section className="thermo-challenge-section" aria-labelledby="mechatronics-challenge-heading">
            <div className="thermo-challenge-section__head">
              <div>
                <div className="thermo-challenge-section__eyebrow">
                  MISSION PROGRESSION · LEVEL {activeChallengeLevel} OF 3
                </div>
                <h2 id="mechatronics-challenge-heading" className="thermo-challenge-section__title">
                  {MECHATRONICS_FLAGSHIP_CHALLENGE.title}
                </h2>
                <p className="thermo-challenge-section__desc">
                  {MECHATRONICS_FLAGSHIP_CHALLENGE.description}
                </p>
              </div>

              <div
                className={`thermo-challenge-section__status-badge ${
                  challengeEval.isPassed ? 'is-passed' : 'is-unmet'
                }`}
              >
                {challengeEval.isPassed ? 'TARGET REACHED ✓' : challengeEval.status}
              </div>
            </div>

            {/* Level Switcher (LVL 1, LVL 2, LVL 3) */}
            <div className="thermo-challenge-levels" role="tablist" aria-label="Challenge progression levels">
              {MECHATRONICS_LEVELS.map((lvl) => (
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
              <strong>Mission:</strong> {MECHATRONICS_LEVELS[activeChallengeLevel - 1].objective}
              <MechLabHint hint={MECHATRONICS_LEVELS[activeChallengeLevel - 1].hint} />
            </div>

            {/* Target Criteria Live Metrics */}
            <div className="thermo-challenge-criteria-grid">
              {activeChallengeLevel === 1 && (
                <>
                  <div className={`thermo-challenge-target-card${params.targetPositionMm >= 45 && params.targetPositionMm <= 65 ? ' is-met' : ' is-unmet'}`}>
                    <div className="thermo-challenge-target-card__top">
                      <span className="thermo-challenge-target-card__name">TARGET SETPOINT (r)</span>
                      <span className="thermo-challenge-target-card__indicator">
                        {params.targetPositionMm >= 45 && params.targetPositionMm <= 65 ? 'MET ✓' : 'NOT MET ✕'}
                      </span>
                    </div>
                    <div className="thermo-challenge-target-card__val">
                      {params.targetPositionMm} <small style={{ fontSize: '0.85rem' }}>mm</small>
                    </div>
                    <div className="thermo-challenge-target-card__requirement">
                      Target: <strong>45 mm – 65 mm</strong>
                    </div>
                  </div>

                  <div className={`thermo-challenge-target-card${analysis.trackingErrorMm <= 2.0 ? ' is-met' : ' is-unmet'}`}>
                    <div className="thermo-challenge-target-card__top">
                      <span className="thermo-challenge-target-card__name">TRACKING ERROR |e|</span>
                      <span className="thermo-challenge-target-card__indicator">
                        {analysis.trackingErrorMm <= 2.0 ? 'TIGHT ✓' : 'EXCESSIVE ✕'}
                      </span>
                    </div>
                    <div className="thermo-challenge-target-card__val">
                      {analysis.trackingErrorMm.toFixed(2)} <small style={{ fontSize: '0.85rem' }}>mm</small>
                    </div>
                    <div className="thermo-challenge-target-card__requirement">
                      Target: <strong>≤ 2.00 mm</strong>
                    </div>
                  </div>

                  <div className={`thermo-challenge-target-card${analysis.dampingRatio >= 0.5 ? ' is-met' : ' is-unmet'}`}>
                    <div className="thermo-challenge-target-card__top">
                      <span className="thermo-challenge-target-card__name">DAMPING RATIO (ζ)</span>
                      <span className="thermo-challenge-target-card__indicator">
                        {analysis.dampingRatio >= 0.5 ? 'STABLE ✓' : 'RINGING ✕'}
                      </span>
                    </div>
                    <div className="thermo-challenge-target-card__val">
                      {analysis.dampingRatio}
                    </div>
                    <div className="thermo-challenge-target-card__requirement">
                      Target: <strong>Stable convergence</strong>
                    </div>
                  </div>
                </>
              )}

              {activeChallengeLevel === 2 && (
                <>
                  <div className={`thermo-challenge-target-card${analysis.peakOvershootPercent <= 12.0 ? ' is-met' : ' is-unmet'}`}>
                    <div className="thermo-challenge-target-card__top">
                      <span className="thermo-challenge-target-card__name">PEAK OVERSHOOT (Mp)</span>
                      <span className="thermo-challenge-target-card__indicator">
                        {analysis.peakOvershootPercent <= 12.0 ? 'CONTROLLED ✓' : 'RINGING ✕'}
                      </span>
                    </div>
                    <div className="thermo-challenge-target-card__val">
                      {analysis.peakOvershootPercent}%
                    </div>
                    <div className="thermo-challenge-target-card__requirement">
                      Target: <strong>≤ 12.0%</strong>
                    </div>
                  </div>

                  <div className={`thermo-challenge-target-card${analysis.settlingTimeSec <= 0.80 ? ' is-met' : ' is-unmet'}`}>
                    <div className="thermo-challenge-target-card__top">
                      <span className="thermo-challenge-target-card__name">SETTLING TIME (ts)</span>
                      <span className="thermo-challenge-target-card__indicator">
                        {analysis.settlingTimeSec <= 0.80 ? 'RAPID ✓' : 'SLUGGISH ✕'}
                      </span>
                    </div>
                    <div className="thermo-challenge-target-card__val">
                      {analysis.settlingTimeSec.toFixed(2)} <small style={{ fontSize: '0.85rem' }}>s</small>
                    </div>
                    <div className="thermo-challenge-target-card__requirement">
                      Target: <strong>≤ 0.80 s</strong>
                    </div>
                  </div>

                  <div className={`thermo-challenge-target-card${analysis.trackingErrorMm <= 1.5 ? ' is-met' : ' is-unmet'}`}>
                    <div className="thermo-challenge-target-card__top">
                      <span className="thermo-challenge-target-card__name">STEADY ERROR |e|</span>
                      <span className="thermo-challenge-target-card__indicator">
                        {analysis.trackingErrorMm <= 1.5 ? 'MET ✓' : 'NOT MET ✕'}
                      </span>
                    </div>
                    <div className="thermo-challenge-target-card__val">
                      {analysis.trackingErrorMm.toFixed(2)} <small style={{ fontSize: '0.85rem' }}>mm</small>
                    </div>
                    <div className="thermo-challenge-target-card__requirement">
                      Target: <strong>≤ 1.50 mm</strong>
                    </div>
                  </div>
                </>
              )}

              {activeChallengeLevel === 3 && (
                <>
                  <div className={`thermo-challenge-target-card${params.disturbanceLoadN >= 25 ? ' is-met' : ' is-unmet'}`}>
                    <div className="thermo-challenge-target-card__top">
                      <span className="thermo-challenge-target-card__name">DISTURBANCE LOAD</span>
                      <span className="thermo-challenge-target-card__indicator">
                        {params.disturbanceLoadN >= 25 ? 'MET ✓' : 'NOT MET ✕'}
                      </span>
                    </div>
                    <div className="thermo-challenge-target-card__val">
                      {params.disturbanceLoadN} <small style={{ fontSize: '0.85rem' }}>N</small>
                    </div>
                    <div className="thermo-challenge-target-card__requirement">
                      Target: <strong>≥ 25 N</strong>
                    </div>
                  </div>

                  <div className={`thermo-challenge-target-card${analysis.trackingErrorMm <= 1.8 ? ' is-met' : ' is-unmet'}`}>
                    <div className="thermo-challenge-target-card__top">
                      <span className="thermo-challenge-target-card__name">STEADY DROOP |e|</span>
                      <span className="thermo-challenge-target-card__indicator">
                        {analysis.trackingErrorMm <= 1.8 ? 'REJECTED ✓' : 'DROOP ✕'}
                      </span>
                    </div>
                    <div className="thermo-challenge-target-card__val">
                      {analysis.trackingErrorMm.toFixed(2)} <small style={{ fontSize: '0.85rem' }}>mm</small>
                    </div>
                    <div className="thermo-challenge-target-card__requirement">
                      Target: <strong>≤ 1.80 mm</strong>
                    </div>
                  </div>

                  <div className={`thermo-challenge-target-card${analysis.controlEffortVolts <= 24.0 ? ' is-met' : ' is-unmet'}`}>
                    <div className="thermo-challenge-target-card__top">
                      <span className="thermo-challenge-target-card__name">ACTUATOR EFFORT</span>
                      <span className="thermo-challenge-target-card__indicator">
                        {analysis.controlEffortVolts <= 24.0 ? 'SAFE ✓' : 'SATURATED ✕'}
                      </span>
                    </div>
                    <div className="thermo-challenge-target-card__val">
                      {analysis.controlEffortVolts.toFixed(1)} <small style={{ fontSize: '0.85rem' }}>V</small>
                    </div>
                    <div className="thermo-challenge-target-card__requirement">
                      Target: <strong>≤ 24.0 V (No saturation)</strong>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Dynamic Guidance & Live Insight */}
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

            {/* Action Bar */}
            <div className="thermo-challenge-section__actions" style={{ gap: '0.75rem' }}>
              <button
                type="button"
                className="thermo-challenge-reset-button"
                onClick={handleReset}
                onPointerEnter={() => setIntent('button', 'RESET CHALLENGE')}
                onPointerLeave={clearIntent}
              >
                RESET CHALLENGE
              </button>
              {challengeEval.isPassed && activeChallengeLevel < 3 && (
                <button
                  type="button"
                  className="mechanical-button mechanical-button--primary"
                  onClick={() => setActiveChallengeLevel((prev) => Math.min(3, prev + 1))}
                  onPointerEnter={() => setIntent('button', 'NEXT LEVEL')}
                  onPointerLeave={clearIntent}
                >
                  NEXT LEVEL →
                </button>
              )}
              {challengeEval.isPassed && activeChallengeLevel === 3 && (
                <div className="thermo-challenge-complete-banner">
                  ★ ALL 3 MECHATRONICS MISSIONS MASTERED! CONTROL SYSTEMS ENGINEER CERTIFIED ★
                </div>
              )}
            </div>
          </section>

          <div className="lab-mode-prompt-card lab-mode-prompt-card--muted">
            <div className="lab-mode-prompt-card__content">
              <span className="lab-mode-prompt-card__badge">SANDBOX PLAY</span>
              <h3 className="lab-mode-prompt-card__title">
                Want to tune the linear stage freely?
              </h3>
              <p className="lab-mode-prompt-card__desc">
                Switch to Explore Mode to test setpoints, PID gains, and step responses without mission constraints.
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
      <section className="mechatronics-deep-dive-grid" aria-label="Control theory equations and mechatronics data">
        <div className="mechatronics-equations-panel">
          <div className="mechatronics-panel-head">
            <h2 className="mechatronics-panel-title">SEE THE ENGINEERING</h2>
            <span className="mechatronics-panel-badge">FEEDBACK &amp; CONTROL THEORY</span>
          </div>

          <p className="thermo-equations-card__intro" style={{ margin: 0 }}>
            These governing equations dictate feedback summation, PID control effort, and 2nd-order electro-mechanical dynamics:
          </p>

          <div className="mechatronics-equations-list">
            <div className="mechatronics-equation-card">
              <span className="mechatronics-equation-title">Kinematic Tracking Error (Feedback Summation)</span>
              <div className="math-equation" role="math" aria-label="e of t equals r of t minus y of t">
                <span className="math-symbol">e(t)</span>
                <span className="math-op">=</span>
                <span className="math-symbol">r(t)</span>
                <span className="math-op">−</span>
                <span className="math-symbol">y(t)</span>
              </div>
              <p className="mechatronics-equation-desc">
                Discrepancy between commanded setpoint reference r(t) and optical linear encoder feedback position y(t).
              </p>
            </div>

            <div className="mechatronics-equation-card">
              <span className="mechatronics-equation-title">PID Controller Control Law (Actuator Effort)</span>
              <div className="math-equation" role="math" aria-label="u of t equals Kp e plus Ki integral e plus Kd de dt">
                <span className="math-symbol">u(t)</span>
                <span className="math-op">=</span>
                <span className="math-symbol">K</span><span className="math-sub">p</span>
                <span className="math-op">·</span>
                <span className="math-symbol">e(t)</span>
                <span className="math-op">+</span>
                <span className="math-symbol">K</span><span className="math-sub">i</span>
                <span className="math-op">·</span>
                <span>∫</span>
                <span className="math-symbol">e(τ)</span><span className="math-symbol">dτ</span>
                <span className="math-op">+</span>
                <span className="math-symbol">K</span><span className="math-sub">d</span>
                <span className="math-op">·</span>
                <div className="math-fraction">
                  <span className="math-fraction__num"><span className="math-symbol">de(t)</span></span>
                  <span className="math-fraction__den"><span className="math-symbol">dt</span></span>
                </div>
              </div>
              <p className="mechatronics-equation-desc">
                Three-term control law computing motor command voltage: proportional to current error, integral to accumulated historical droop, and derivative to rate of approach.
              </p>
            </div>

            <div className="mechatronics-equation-card">
              <span className="mechatronics-equation-title">Closed-Loop Second-Order Dynamic Response</span>
              <div className="math-equation" role="math" aria-label="s squared plus 2 zeta omega_n s plus omega_n squared equals 0">
                <span className="math-symbol">s²</span>
                <span className="math-op">+</span>
                <span>2</span><span className="math-symbol">ζ</span><span className="math-symbol">ω</span><span className="math-sub">n</span><span className="math-symbol">s</span>
                <span className="math-op">+</span>
                <span className="math-symbol">ω</span><span className="math-sub">n</span><span>²</span>
                <span className="math-op">=</span>
                <span>0</span>
              </div>
              <p className="mechatronics-equation-desc">
                Characteristic polynomial governing carriage motion. Natural frequency ω_n dictates response bandwidth, while damping ratio ζ governs overshoot.
              </p>
            </div>

            <div className="mechatronics-equation-card">
              <span className="mechatronics-equation-title">Natural Frequency &amp; Damping Ratio from Physical Constants</span>
              <div className="math-equation" role="math" aria-label="omega_n and zeta formulas">
                <span className="math-symbol">ω</span><span className="math-sub">n</span>
                <span className="math-op">=</span>
                <span>√</span><span>(</span>
                <div className="math-fraction">
                  <span className="math-fraction__num"><span className="math-symbol">K</span><span className="math-sub">m</span><span className="math-op">·</span><span className="math-symbol">K</span><span className="math-sub">p</span></span>
                  <span className="math-fraction__den"><span className="math-symbol">m</span></span>
                </div>
                <span>)</span>
                <span className="math-op">,</span>
                <span style={{ marginLeft: '0.6rem' }} className="math-symbol">ζ</span>
                <span className="math-op">=</span>
                <div className="math-fraction">
                  <span className="math-fraction__num"><span className="math-symbol">c</span><span className="math-op">+</span><span className="math-symbol">K</span><span className="math-sub">m</span><span className="math-symbol">K</span><span className="math-sub">d</span></span>
                  <span className="math-fraction__den"><span>2</span><span className="math-op">·</span><span>√</span><span>(</span><span className="math-symbol">m</span><span className="math-symbol">K</span><span className="math-sub">m</span><span className="math-symbol">K</span><span className="math-sub">p</span><span>)</span></span>
                </div>
              </div>
              <p className="mechatronics-equation-desc">
                Physical mass m and viscous rail damping c are augmented electronically by controller gains Kp and Kd.
              </p>
            </div>

            <div className="mechatronics-equation-card">
              <span className="mechatronics-equation-title">Peak Percent Overshoot (Transient Ringing)</span>
              <div className="math-equation" role="math" aria-label="Mp percent formula">
                <span className="math-symbol">M</span><span className="math-sub">p</span>
                <span className="math-op">=</span>
                <span>100</span><span className="math-op">·</span>
                <span>exp</span><span>(</span>
                <div className="math-fraction">
                  <span className="math-fraction__num"><span className="math-op">−</span><span>π</span><span className="math-symbol">ζ</span></span>
                  <span className="math-fraction__den"><span>√</span><span>(</span><span>1</span><span className="math-op">−</span><span className="math-symbol">ζ²</span><span>)</span></span>
                </div>
                <span>)</span>
                <span>%</span>
              </div>
              <p className="mechatronics-equation-desc">
                Predicts the maximum percentage the carriage travels beyond its target before settling. Increasing Kd pushes ζ toward 0.707 to minimize Mp.
              </p>
            </div>

            <div className="mechatronics-equation-card">
              <span className="mechatronics-equation-title">Steady-State Disturbance Droop Elimination</span>
              <div className="math-equation" role="math" aria-label="e_ss equals F_dist over K_m K_p">
                <span className="math-symbol">e</span><span className="math-sub">ss</span>
                <span className="math-op">=</span>
                <div className="math-fraction">
                  <span className="math-fraction__num"><span className="math-symbol">F</span><span className="math-sub">dist</span></span>
                  <span className="math-fraction__den"><span className="math-symbol">K</span><span className="math-sub">m</span><span className="math-op">·</span><span className="math-symbol">K</span><span className="math-sub">p</span></span>
                </div>
                <span className="math-op">⟹</span>
                <span className="math-symbol">e</span><span className="math-sub">ss</span>
                <span className="math-op">→</span>
                <span>0</span>
                <span style={{ fontSize: '0.8rem', marginLeft: '0.4rem', color: '#9da6aa' }}>(with K_i &gt; 0)</span>
              </div>
              <p className="mechatronics-equation-desc">
                External cutting or payload loads cause proportional droop. Adding integral gain Ki provides infinite DC loop gain, eliminating steady-state offset completely.
              </p>
            </div>
          </div>
        </div>

        {/* ── Engineering Telemetry Data ── */}
        <div className="mechatronics-data-panel">
          <div className="mechatronics-panel-head">
            <h2 className="mechatronics-panel-title">ENGINEERING DATA</h2>
            <span className="mechatronics-panel-badge">REAL-TIME TELEMETRY</span>
          </div>

          <table className="mechatronics-telemetry-table" aria-label="Mechatronic simulation telemetry data">
            <tbody>
              <tr>
                <td>Target Setpoint (r)</td>
                <td>{analysis.targetPositionMm} mm</td>
              </tr>
              <tr>
                <td>Actual Carriage Position (y)</td>
                <td>{analysis.actualPositionMm} mm</td>
              </tr>
              <tr>
                <td>Tracking Error (|e|)</td>
                <td>{analysis.trackingErrorMm} mm</td>
              </tr>
              <tr>
                <td>Control Effort (u)</td>
                <td>{analysis.controlEffortVolts} V ({analysis.actuatorDutyPercent}% duty)</td>
              </tr>
              <tr>
                <td>Natural Frequency (ω_n)</td>
                <td>{analysis.naturalFrequencyRadS} rad/s ({analysis.naturalFrequencyHz} Hz)</td>
              </tr>
              <tr>
                <td>Damping Ratio (ζ)</td>
                <td>{analysis.dampingRatio} ({analysis.systemStability})</td>
              </tr>
              <tr>
                <td>Peak Overshoot (Mp)</td>
                <td>{analysis.peakOvershootPercent}%</td>
              </tr>
              <tr>
                <td>Rise Time (tr)</td>
                <td>{analysis.riseTimeSec} s</td>
              </tr>
              <tr>
                <td>Settling Time (ts, 2%)</td>
                <td>{analysis.settlingTimeSec} s</td>
              </tr>
              <tr>
                <td>External Disturbance Load (F_L)</td>
                <td>{params.disturbanceLoadN} N</td>
              </tr>
              <tr>
                <td>Stability Classification</td>
                <td>{analysis.stabilityRating}</td>
              </tr>
            </tbody>
          </table>

          <button
            type="button"
            className="thermo-data-toggle"
            onClick={() => setShowMoreData((prev) => !prev)}
            aria-expanded={showMoreData}
          >
            <span>{showMoreData ? '▲ HIDE' : '▼ VIEW'} SYSTEM CONSTANTS &amp; ASSUMPTIONS</span>
          </button>

          {showMoreData && (
            <div className="thermo-assumptions-box">
              <span className="thermo-assumptions-box__title">MECHATRONIC PLANT SPECIFICATION</span>
              <div className="thermo-assumptions-list">
                <div className="thermo-assumption-item">
                  <strong className="thermo-assumption-item__title">Linear Carriage Mass</strong>
                  <p className="thermo-assumption-item__statement">
                    Total payload plus aluminum carriage assembly m = 1.25 kg riding on low-friction recirculating linear ball guides.
                  </p>
                </div>
                <div className="thermo-assumption-item">
                  <strong className="thermo-assumption-item__title">Ballscrew &amp; Motor Torque Constant</strong>
                  <p className="thermo-assumption-item__statement">
                    Precision ground C5 ballscrew (5 mm lead) driven by a 24V brushed DC servo with Km = 14.0 N/V effective axial thrust conversion.
                  </p>
                </div>
                <div className="thermo-assumption-item">
                  <strong className="thermo-assumption-item__title">Optical Linear Encoder Feedback</strong>
                  <p className="thermo-assumption-item__statement">
                    Sub-micron resolution glass scale with optical readhead transmitting position directly to the DSP loop running at 1 kHz update rate.
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
      ) : system.id === 'materials' ? (
        <ActiveMaterialsLab
          system={system}
          mode={mode}
          onSwitchMode={handleModeChange}
        />
      ) : system.id === 'manufacturing' ? (
        <ActiveManufacturingLab
          system={system}
          mode={mode}
          onSwitchMode={handleModeChange}
        />
      ) : system.id === 'mechatronics' ? (
        <ActiveMechatronicsLab
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

