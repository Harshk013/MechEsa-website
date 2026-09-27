import { useState } from 'react'
import type { LabSystemConfig } from '../../../data/mechLab'
import { SYSTEM_CHALLENGES } from '../../../data/mechLabChallenges'
import { SharedChallengePanel } from './SharedChallengePanel'
import { RoboticsInstrument } from '../../home/EngineeringLab/RoboticsInstrument'
import { FluidMechanicsInstrument } from '../../home/EngineeringLab/FluidMechanicsInstrument'
import { ManufacturingInstrument } from '../../home/EngineeringLab/ManufacturingInstrument'
import { MechanicalSystemsInstrument } from '../../home/EngineeringLab/MechanicalSystemsInstrument'

interface GenericSystemInstrumentProps {
  system: LabSystemConfig
  mode: 'explore' | 'challenge'
  onSwitchMode: (mode: 'explore' | 'challenge') => void
}

export function GenericSystemInstrument({
  system,
  mode,
  onSwitchMode,
}: GenericSystemInstrumentProps) {
  const challenge = SYSTEM_CHALLENGES[system.id]
  const [activeChallengeLevel, setActiveChallengeLevel] = useState<number>(1)
  const [showMoreData, setShowMoreData] = useState<boolean>(false)

  // Map system.id to default parameter states for challenge evaluation
  const [params, setParams] = useState<Record<string, number>>(() => {
    const defaults: Record<string, number> = {
      driveAngle: 62,
      appliedLoad: 42,
      progress: 35,
      targetPosition: 58,
      throttle: 38,
      flow: 45,
      joint1: 25,
      joint2: 40,
    }
    return defaults
  })

  // Dynamic explanation strings based on system focus
  const getDynamicExplanation = () => {
    switch (system.id) {
      case 'design':
        return {
          whatChanged: 'Input drive crank angle articulated through linkage.',
          whatHappened: 'Coupler transfers force to rocker arm, changing instantaneous mechanical advantage.',
          why: 'Transmission angle dictates the proportion of force directed along the output motion vector.',
        }
      case 'materials':
        return {
          whatChanged: 'Applied transverse bending force shifted along the beam span.',
          whatHappened: 'Beam exhibits elastic downward deflection with maximum stress at outermost fibers.',
          why: 'Curvature is proportional to bending moment: M(x) = E * I * d²w/dx².',
        }
      case 'manufacturing':
        return {
          whatChanged: 'Cutter toolpath position advanced across stock envelope.',
          whatHappened: 'Material is removed layer by layer, shaping the final component profile.',
          why: 'Controlled feed rate balances cycle time against cutter wear and surface roughness.',
        }
      case 'mechatronics':
        return {
          whatChanged: 'Target position setpoint adjusted for closed-loop linear stage.',
          whatHappened: 'Feedback sensors measure carriage position and drive motor to minimize tracking error.',
          why: 'Closed-loop controller applies corrective action proportional to instantaneous error.',
        }
      case 'robotics':
        return {
          whatChanged: 'Joint angles articulated across revolute axes.',
          whatHappened: 'End-effector coordinates update through forward kinematic chain.',
          why: 'Cartesian position is the vector sum of individual link transformations.',
        }
      case 'automotive':
        return {
          whatChanged: 'Throttle command modulated for drivetrain load.',
          whatHappened: 'Engine RPM, drive torque, and wheel speed respond through gear reduction.',
          why: 'Gear ratio trades rotational velocity for tractive torque: T_wheel = T_engine * gear_ratio.',
        }
      case 'fluid':
        return {
          whatChanged: 'Fluid velocity regulated through constricted Venturi nozzle.',
          whatHappened: 'Flow accelerates in throat section, causing a localized drop in static pressure.',
          why: 'Bernoulli energy conservation balances static pressure and dynamic pressure: P + 0.5 * rho * v² = const.',
        }
      default:
        return {
          whatChanged: 'Parameter adjusted.',
          whatHappened: 'System responds according to physical model.',
          why: 'Governed by fundamental mechanical laws.',
        }
    }
  }

  const explanation = getDynamicExplanation()

  const handleResetChallenge = () => {
    if (system.id === 'design') setParams({ driveAngle: 62 })
    else if (system.id === 'materials') setParams({ appliedLoad: 42 })
    else if (system.id === 'manufacturing') setParams({ progress: 15 })
    else if (system.id === 'mechatronics') setParams({ targetPosition: 58 })
    else if (system.id === 'automotive') setParams({ throttle: 38 })
    else if (system.id === 'fluid') setParams({ flow: 45 })
    else if (system.id === 'robotics') setParams({ joint1: 25, joint2: 40 })
  }

  return (
    <div className="generic-system-instrument">
      {/* ── Visual Instrument Viewport ─────────────────────────────── */}
      <section className="generic-instrument-stage-card" aria-label={`${system.title} visual interactive study`}>
        <div className="generic-instrument-stage-card__header">
          <div className="generic-instrument-stage-card__title-group">
            <span className="generic-instrument-badge">
              <span>●</span> {mode === 'explore' ? 'SANDBOX EXPERIMENT' : 'MISSION TARGET'}
            </span>
            <h2 className="generic-instrument-title">{system.title.toUpperCase()} // INTERACTIVE STUDY</h2>
          </div>
          <span className="generic-instrument-status">
            INTERACTIVE KINEMATIC MODEL
          </span>
        </div>

        {/* Mount the dedicated instrument */}
        <div className="generic-instrument-viewport">
          {system.id === 'robotics' && <RoboticsInstrument />}
          {system.id === 'fluid' && <FluidMechanicsInstrument />}
          {system.id === 'manufacturing' && <ManufacturingInstrument />}
          {(['design', 'automotive', 'materials', 'mechatronics'].includes(system.id)) && (
            <MechanicalSystemsInstrument system={system.id as 'design' | 'automotive' | 'materials' | 'mechatronics'} />
          )}
        </div>
      </section>

      {/* ── Mode 1: EXPLORE MODE (Sandbox, Dynamic Explanation, Deep Dive) ── */}
      {mode === 'explore' && (
        <>
          {/* "WHAT'S HAPPENING?" Real-Time Dynamic Reaction */}
          <section className="thermo-dynamic-grid" aria-labelledby="generic-reaction-title">
            <div className="thermo-dynamic-grid__head">
              <span className="thermo-dynamic-grid__badge">LIVE SYSTEM REACTION</span>
              <h3 id="generic-reaction-title" className="thermo-dynamic-grid__title">
                WHAT&apos;S HAPPENING?
              </h3>
              <p className="thermo-dynamic-grid__subtitle">
                Physical consequence of parameter changes in {system.title}
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
                <span className="design-dynamic-card__label">THE SYSTEM RESPONDED:</span>
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

          {/* Prompt card to switch to Challenge Mode */}
          {challenge && (
            <div className="lab-mode-prompt-card">
              <div className="lab-mode-prompt-card__content">
                <span className="lab-mode-prompt-card__badge">TEST YOUR INTUITION</span>
                <h3 className="lab-mode-prompt-card__title">
                  Ready to test your {system.title} skills?
                </h3>
                <p className="lab-mode-prompt-card__desc">
                  Take on the &ldquo;{challenge.title}&rdquo; engineering mission. Meet constraints and solve the challenge.
                </p>
              </div>
              <button
                type="button"
                className="mechanical-button mechanical-button--primary"
                onClick={() => onSwitchMode('challenge')}
              >
                ENTER CHALLENGE MODE →
              </button>
            </div>
          )}

          {/* Progressive Disclosure: Engineering Concepts */}
          <section className="thermo-deep-dive-grid" aria-label="Engineering concepts and parameters">
            <div className="thermo-equations-card">
              <div className="thermo-equations-card__head">
                <h3 className="thermo-equations-card__title">SEE THE ENGINEERING</h3>
                <span className="thermo-equations-card__badge">CORE PRINCIPLES</span>
              </div>
              <p className="thermo-equations-card__intro">
                Underlying physics governing this mechanical system:
              </p>
              <div className="thermo-equations-list">
                <div className="thermo-equation-item">
                  <span className="thermo-equation-item__title">SYSTEM FOCUS</span>
                  <code className="thermo-equation-item__formula">{system.focus}</code>
                  <p className="thermo-equation-item__desc">{system.defaultResult}</p>
                </div>
              </div>
            </div>

            <div className="thermo-technical-data-card">
              <div className="thermo-technical-data-card__head">
                <h3 className="thermo-technical-data-card__title">SYSTEM PARAMETERS</h3>
                <button
                  type="button"
                  className="thermo-technical-data-card__toggle-btn"
                  onClick={() => setShowMoreData((prev) => !prev)}
                >
                  {showMoreData ? 'HIDE DETAILS ▲' : 'EXPAND ALL ▼'}
                </button>
              </div>

              <div className="thermo-tech-table">
                {system.parameters.map((p) => (
                  <div key={p.id} className="thermo-tech-row">
                    <span>{p.label}</span>
                    <strong>{p.default} {p.unit}</strong>
                  </div>
                ))}
              </div>

              {showMoreData && (
                <div className="thermo-technical-expanded">
                  <h4 className="thermo-technical-expanded__subtitle">DEVELOPMENT SCOPE</h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.5 }}>
                    This module is currently an interactive physical study. Future iterations will introduce multi-body dynamics, friction losses, and material non-linearities.
                  </p>
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {/* ── Mode 2: CHALLENGE MODE (Specific Objective, Constraints, Targets, Hints) ── */}
      {mode === 'challenge' && challenge && (
        <>
          <SharedChallengePanel
            challenge={challenge}
            activeLevel={activeChallengeLevel}
            onSelectLevel={setActiveLevel => setActiveChallengeLevel(setActiveLevel)}
            currentParams={params}
            currentResult={{
              reach: 125,
              targetOffset: 28,
              driveAngle: params.driveAngle ?? 62,
              appliedLoad: params.appliedLoad ?? 42,
              progress: params.progress ?? 35,
              targetPosition: params.targetPosition ?? 58,
              throttle: params.throttle ?? 38,
              flow: params.flow ?? 45,
            }}
            onResetChallenge={handleResetChallenge}
          />

          {/* Prompt card to switch back to Explore Mode */}
          <div className="lab-mode-prompt-card lab-mode-prompt-card--muted">
            <div className="lab-mode-prompt-card__content">
              <span className="lab-mode-prompt-card__badge">SANDBOX PLAY</span>
              <h3 className="lab-mode-prompt-card__title">
                Want to experiment without constraints?
              </h3>
              <p className="lab-mode-prompt-card__desc">
                Switch to Explore Mode to play with {system.title} freely without mission targets.
              </p>
            </div>
            <button
              type="button"
              className="mechanical-button"
              onClick={() => onSwitchMode('explore')}
            >
              SWITCH TO EXPLORE MODE →
            </button>
          </div>
        </>
      )}
    </div>
  )
}
