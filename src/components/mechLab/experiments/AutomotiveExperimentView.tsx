// src/components/mechLab/experiments/AutomotiveExperimentView.tsx
// Flagship vehicle engineering playground with dynamic sports chassis, cockpit HUD telemetry, and integrated mission deck

import { useState, useEffect, useRef, useMemo } from 'react'
import {
  calculateAutomotivePerformance,
  AUTOMOTIVE_LIMITS,
  type VehiclePerformance,
} from './automotiveModel'
import {
  AUTOMOTIVE_LEVELS,
  AUTOMOTIVE_FLAGSHIP_CHALLENGE,
} from './automotiveChallenge'
import { usePointer } from '../../interaction/PointerProvider'
import './automotive.css'

interface AutomotiveExperimentViewProps {
  power: number
  grip: number
  braking: number
  steering: number
  onParamChange: (power: number, grip: number, braking: number, steering: number) => void
  onReset: () => void
  activeLevel?: number
  isChallengeMode?: boolean
  onSwitchMode?: (mode: 'explore' | 'challenge') => void
  onLevelChange?: (level: number) => void
}

export function AutomotiveExperimentView({
  power,
  grip,
  braking,
  steering,
  onParamChange,
  onReset,
  activeLevel = 1,
  isChallengeMode = false,
  onSwitchMode,
  onLevelChange,
}: AutomotiveExperimentViewProps) {
  const { setIntent, clearIntent } = usePointer()

  // Calculate vehicle physics performance
  const perf: VehiclePerformance = useMemo(
    () => calculateAutomotivePerformance({ power, grip, braking, steering }),
    [power, grip, braking, steering]
  )

  // Challenge evaluation
  const challengeEval = useMemo(
    () =>
      AUTOMOTIVE_FLAGSHIP_CHALLENGE.evaluate(
        { power, grip, braking, steering },
        null,
        activeLevel
      ),
    [power, grip, braking, steering, activeLevel]
  )

  const currentLevelInfo = AUTOMOTIVE_LEVELS[activeLevel - 1] || AUTOMOTIVE_LEVELS[0]

  // Simulation run state
  const [isRunning, setIsRunning] = useState<boolean>(false)
  const [runProgress, setRunProgress] = useState<number>(0)
  const [liveSpeedKmh, setLiveSpeedKmh] = useState<number>(0)
  const [liveRpm, setLiveRpm] = useState<number>(900)
  const [currentPhase, setCurrentPhase] = useState<'IDLE' | 'ACCEL' | 'CORNER' | 'BRAKE' | 'COMPLETE'>('IDLE')
  const [runOutcome, setRunOutcome] = useState<string>('READY FOR RUN')
  const [showHint, setShowHint] = useState<boolean>(false)

  // Sandbox interactive states (throttle revving, brake clamping)
  const [isThrottling, setIsThrottling] = useState<boolean>(false)
  const [isBrakeClamped, setIsBrakeClamped] = useState<boolean>(false)

  const animFrameRef = useRef<number | null>(null)
  const runStartRef = useRef<number>(0)
  const [wheelRotationDeg, setWheelRotationDeg] = useState<number>(0)

  // Quick Presets
  const applyPreset = (p: number, g: number, b: number, s: number) => {
    onParamChange(p, g, b, s)
  }

  // Trigger test run animation
  const handleStartRun = () => {
    if (isRunning) return
    setIsRunning(true)
    setRunProgress(0)
    setLiveSpeedKmh(0)
    setLiveRpm(2500)
    setCurrentPhase('ACCEL')
    setRunOutcome('LAUNCHING...')
    runStartRef.current = performance.now()
  }

  const handleResetRun = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    setIsRunning(false)
    setRunProgress(0)
    setLiveSpeedKmh(0)
    setLiveRpm(900)
    setCurrentPhase('IDLE')
    setRunOutcome('READY FOR RUN')
    onReset()
  }

  // Animation Loop for Run Simulation
  useEffect(() => {
    if (!isRunning) return

    const totalDurationMs = 3400 // 3.4s test run

    const stepRun = (now: number) => {
      const elapsed = now - runStartRef.current
      const progress = Math.min(1, elapsed / totalDurationMs)
      setRunProgress(progress)

      if (progress < 0.45) {
        // Phase 1: Launch & Acceleration
        setCurrentPhase('ACCEL')
        const pFrac = progress / 0.45
        const curSpd = Math.round(perf.topSpeedKmh * 0.55 * pFrac)
        const curRpm = Math.min(7600, Math.round(2500 + pFrac * 4800))
        setLiveSpeedKmh(curSpd)
        setLiveRpm(curRpm)
        setWheelRotationDeg((prev) => (prev + curSpd * 0.45) % 360)
        setRunOutcome(perf.hasWheelspin ? '⚠ WHEELSPIN (LOSS OF TRACTION)' : 'ACCELERATING...')
      } else if (progress < 0.75) {
        // Phase 2: High Speed Corner
        setCurrentPhase('CORNER')
        const curSpd = perf.testCornerSpeedKmh
        const curRpm = 5800
        setLiveSpeedKmh(curSpd)
        setLiveRpm(curRpm)
        setWheelRotationDeg((prev) => (prev + curSpd * 0.45) % 360)
        setRunOutcome(
          perf.hasCornerSkid
            ? '⚠ LATERAL SKID (EXCEEDED GRIP LIMIT)'
            : `CLEAN APEX (+${perf.gripMarginPercent}% MARGIN)`
        )
      } else if (progress < 0.98) {
        // Phase 3: Hard Braking
        setCurrentPhase('BRAKE')
        const bFrac = (progress - 0.75) / 0.23
        const curSpd = Math.max(0, Math.round(perf.testCornerSpeedKmh * (1 - bFrac)))
        const curRpm = Math.max(900, Math.round(5800 * (1 - bFrac)))
        setLiveSpeedKmh(curSpd)
        setLiveRpm(curRpm)
        setWheelRotationDeg((prev) => (prev + curSpd * 0.3) % 360)
        setRunOutcome(
          perf.brakingDistanceM > 42
            ? '⚠ BRAKING DISTANCE LONG'
            : 'BRAKING HARD TO HALT...'
        )
      } else {
        // Phase 4: Complete
        setCurrentPhase('COMPLETE')
        setLiveSpeedKmh(0)
        setLiveRpm(900)
        setIsRunning(false)
        if (perf.hasCornerSkid) {
          setRunOutcome('RUN COMPLETED: LOST GRIP IN TURN')
        } else if (perf.hasWheelspin) {
          setRunOutcome('RUN COMPLETED: EXCESSIVE WHEELSPIN')
        } else {
          setRunOutcome('RUN COMPLETED: BALANCED SETUP ✓')
        }
        return
      }

      animFrameRef.current = requestAnimationFrame(stepRun)
    }

    animFrameRef.current = requestAnimationFrame(stepRun)

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [isRunning, perf])

  // Interactive throttle rev effect
  useEffect(() => {
    if (!isThrottling || isRunning) return
    setLiveRpm(6800)
    const interval = setInterval(() => {
      setWheelRotationDeg((prev) => (prev + 35) % 360)
    }, 40)
    return () => {
      clearInterval(interval)
      setLiveRpm(900)
    }
  }, [isThrottling, isRunning])

  // Dynamic visual parameters
  const carBaseX = 140 + runProgress * 420
  const chassisPitchDeg = currentPhase === 'ACCEL' || isThrottling ? -1.8 : currentPhase === 'BRAKE' || isBrakeClamped ? 2.5 : 0
  const frontSteerAngle =
    currentPhase === 'CORNER'
      ? Math.round(steering * 0.3)
      : Math.round(((steering - 50) / 50) * 15)

  const isBrakingActive = currentPhase === 'BRAKE' || isBrakeClamped
  const isAccelActive = currentPhase === 'ACCEL' || isThrottling

  // Speedometer needle angle: 0 km/h = -120 deg, 260 km/h = +120 deg
  const displaySpeed = isRunning ? liveSpeedKmh : Math.round(perf.topSpeedKmh * (isThrottling ? 0.35 : 0))
  const speedNeedleDeg = -120 + Math.min(1, displaySpeed / 260) * 240

  // Tachometer needle angle: 0 RPM = -120 deg, 8000 RPM = +120 deg
  const rpmNeedleDeg = -120 + Math.min(1, liveRpm / 8000) * 240

  return (
    <div className="auto-container">
      {/* ── Mode-Specific Upper Deck ─────────────────────────────── */}
      {isChallengeMode ? (
        <div className="auto-challenge-mission-deck" aria-label="Automotive Challenge Mission Briefing">
          <div className="auto-mission-header">
            <div className="auto-mission-title-group">
              <span className="auto-mission-badge">
                MISSION // LEVEL 0{activeLevel} OF 03
              </span>
              <h2 className="auto-mission-heading">
                {currentLevelInfo.levelTitle.toUpperCase()}
              </h2>
              <p className="auto-mission-objective">{currentLevelInfo.objective}</p>
            </div>

            {/* Level Selector Pills */}
            <div className="auto-mission-level-pills" role="tablist" aria-label="Mission levels">
              {AUTOMOTIVE_LEVELS.map((lvl) => (
                <button
                  key={lvl.levelNumber}
                  type="button"
                  role="tab"
                  aria-selected={activeLevel === lvl.levelNumber}
                  className={`auto-level-pill${activeLevel === lvl.levelNumber ? ' is-active' : ''}`}
                  onClick={() => onLevelChange?.(lvl.levelNumber)}
                >
                  <span className="auto-level-pill__dot" aria-hidden="true" />
                  <span>LVL 0{lvl.levelNumber}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Target Status & Feedback Bar */}
          <div className="auto-mission-status-bar">
            <div className="auto-mission-criteria">
              <span className="auto-mission-criteria__label">TARGET:</span>
              <span className="auto-mission-criteria__val">{currentLevelInfo.targetCriteria}</span>
            </div>

            <div className="auto-mission-current">
              <span className="auto-mission-current__label">CURRENT:</span>
              <span className="auto-mission-current__val">
                {activeLevel === 1 && `0–100: ${perf.sprint0to100Sec.toFixed(2)} s ${perf.hasWheelspin ? '(Spinning)' : '(Clean)'}`}
                {activeLevel === 2 && `Braking Dist: ${perf.brakingDistanceM.toFixed(1)} m`}
                {activeLevel === 3 && `Corner: ${perf.testCornerSpeedKmh} km/h (Margin: ${perf.gripMarginPercent > 0 ? `+${perf.gripMarginPercent}` : perf.gripMarginPercent}%)`}
              </span>
            </div>

            <div
              className={`auto-mission-badge-status ${
                challengeEval.isPassed
                  ? 'is-passed'
                  : challengeEval.status.includes('SKID') || challengeEval.status.includes('WHEELSPIN')
                  ? 'is-warn'
                  : 'is-pending'
              }`}
            >
              {challengeEval.isPassed ? '✓ TARGET MET' : challengeEval.status}
            </div>

            <div className="auto-mission-actions">
              <button
                type="button"
                className="auto-hint-btn"
                onClick={() => setShowHint((prev) => !prev)}
              >
                {showHint ? 'HIDE HINT ▴' : '💡 HINT'}
              </button>

              {challengeEval.isPassed && activeLevel < 3 && (
                <button
                  type="button"
                  className="auto-btn-next-mission"
                  onClick={() => onLevelChange?.(Math.min(3, activeLevel + 1))}
                  onPointerEnter={() => setIntent('button', 'NEXT LEVEL')}
                  onPointerLeave={clearIntent}
                >
                  NEXT LEVEL →
                </button>
              )}
            </div>
          </div>

          {showHint && (
            <div className="auto-mission-hint-box" role="note">
              <strong>Engineer Tip:</strong> {currentLevelInfo.hint}
            </div>
          )}
        </div>
      ) : (
        /* Explore Mode Presets Bar */
        <div className="auto-explore-presets-bar" aria-label="Vehicle setup presets">
          <div className="auto-explore-presets-label">
            <span className="auto-explore-dot" aria-hidden="true" />
            <span>GARAGE PRESETS:</span>
          </div>
          <div className="auto-presets-list">
            <button
              type="button"
              className="auto-preset-btn"
              onClick={() => applyPreset(90, 90, 85, 65)}
              title="High power, high grip sprint setup"
            >
              🚀 SUPERCAR SPRINT
            </button>
            <button
              type="button"
              className="auto-preset-btn"
              onClick={() => applyPreset(85, 35, 50, 85)}
              title="Excess power with low rear grip for controlled slides"
            >
              🔥 DRIFT SPEC
            </button>
            <button
              type="button"
              className="auto-preset-btn"
              onClick={() => applyPreset(70, 85, 80, 75)}
              title="Balanced grip, strong brakes and sharp steering"
            >
              🏁 TRACK DAY
            </button>
            <button
              type="button"
              className="auto-preset-btn"
              onClick={() => applyPreset(55, 65, 60, 50)}
              title="Comfortable daily street vehicle balance"
            >
              🚗 STREET SPEC
            </button>
          </div>
        </div>
      )}

      {/* ── Main Hero Layout: Car Stage on Left, Controls on Right ── */}
      <div className="auto-hero-grid">
        {/* Left Column: Interactive Vehicle Stage */}
        <div className="auto-stage-card">
          <div className="auto-stage-card__header">
            <div className="auto-stage-card__title-group">
              <span
                className={`auto-stage-card__status-dot${isRunning ? ' is-running' : ''}`}
                aria-hidden="true"
              />
              <h2 className="auto-stage-card__title">VEHICLE DYNAMICS TEST STAGE</h2>
              <span className="auto-stage-card__tag">
                {isChallengeMode ? `CHALLENGE L0${activeLevel}` : 'FREE SANDBOX'}
              </span>
            </div>

            <div className="auto-stage-card__header-right">
              <span
                className={`auto-stage-card__status-pill ${
                  perf.hasCornerSkid
                    ? 'is-skid'
                    : perf.hasWheelspin
                    ? 'is-wheelspin'
                    : 'is-balanced'
                }`}
              >
                {perf.hasCornerSkid
                  ? '⚠ LATERAL SKID'
                  : perf.hasWheelspin
                  ? '⚠ WHEELSPIN'
                  : 'BALANCED GRIP'}
              </span>
            </div>
          </div>

          {/* ── Interactive Track & Vehicle SVG Canvas ── */}
          <div className="auto-canvas-container" aria-label="Vehicle simulation track canvas">
            <svg
              className="auto-stage-svg"
              viewBox="0 0 820 370"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                {/* Track Asphalt Texture Gradient */}
                <linearGradient id="road-asphalt" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#1e293b" />
                  <stop offset="25%" stopColor="#0f172a" />
                  <stop offset="85%" stopColor="#090d16" />
                  <stop offset="100%" stopColor="#05080f" />
                </linearGradient>

                {/* Car Body Metallic Gradient */}
                <linearGradient id="car-body" x1="0%" y1="0%" x2="100%" y2="50%">
                  <stop offset="0%" stopColor="#0284c7" />
                  <stop offset="45%" stopColor="#0369a1" />
                  <stop offset="70%" stopColor="#0ea5e9" />
                  <stop offset="100%" stopColor="#0284c7" />
                </linearGradient>

                {/* Windshield Tint */}
                <linearGradient id="windshield-tint" x1="0%" y1="0%" x2="50%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#0f172a" stopOpacity="0.9" />
                </linearGradient>

                {/* Glowing Brake Caliper / Disc */}
                <radialGradient id="brake-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#f87171" stopOpacity="1" />
                  <stop offset="70%" stopColor="#ef4444" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#b91c1c" stopOpacity="0" />
                </radialGradient>

                {/* Exhaust Flame Pulse */}
                <linearGradient id="exhaust-flame" x1="100%" y1="50%" x2="0%" y2="50%">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="50%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Background Technical Grid */}
              <g opacity="0.08" stroke="#38bdf8" strokeWidth="0.5">
                <line x1="30" y1="60" x2="790" y2="60" strokeDasharray="3 3" />
                <line x1="30" y1="140" x2="790" y2="140" strokeDasharray="3 3" />
                <line x1="30" y1="220" x2="790" y2="220" strokeDasharray="3 3" />
                <line x1="200" y1="20" x2="200" y2="350" strokeDasharray="3 3" />
                <line x1="450" y1="20" x2="450" y2="350" strokeDasharray="3 3" />
                <line x1="680" y1="20" x2="680" y2="350" strokeDasharray="3 3" />
              </g>

              {/* Track Environment Surface */}
              <rect x="30" y="240" width="760" height="110" rx="6" fill="url(#road-asphalt)" stroke="#334155" strokeWidth="1" />

              {/* Track Curb Rumble Strips (Red and White alternating blocks) */}
              <g transform="translate(30, 234)">
                {Array.from({ length: 38 }).map((_, i) => (
                  <rect
                    key={i}
                    x={i * 20}
                    y="0"
                    width="20"
                    height="6"
                    fill={i % 2 === 0 ? '#ef4444' : '#f8fafc'}
                  />
                ))}
              </g>

              {/* Road Lane Markings */}
              <g stroke="rgba(255, 255, 255, 0.25)" strokeWidth="2" strokeDasharray="25 20">
                <line x1="40" y1="295" x2="780" y2="295" />
              </g>

              {/* Target Overlays for Challenge Mode */}
              {isChallengeMode && (
                <g>
                  {/* Level 1 Sprint 100 km/h finish line marker */}
                  {activeLevel === 1 && (
                    <g transform="translate(680, 230)">
                      <line x1="0" y1="0" x2="0" y2="120" stroke="var(--sys-fluid)" strokeWidth="2.5" strokeDasharray="4 2" />
                      <rect x="-45" y="-22" width="90" height="20" rx="3" fill="#0f172a" stroke="var(--sys-fluid)" strokeWidth="1" />
                      <text x="0" y="-8" textAnchor="middle" fill="var(--sys-fluid)" fontSize="10" fontFamily="monospace" fontWeight="700">
                        100 KM/H GATE
                      </text>
                    </g>
                  )}

                  {/* Level 2 Braking Zone Target Box */}
                  {activeLevel === 2 && (
                    <g transform="translate(480, 240)">
                      <rect x="0" y="0" width="180" height="110" fill="rgba(217, 138, 61, 0.12)" stroke="var(--color-signal)" strokeWidth="1.5" strokeDasharray="4 4" />
                      <text x="90" y="24" textAnchor="middle" fill="var(--color-signal)" fontSize="11" fontFamily="monospace" fontWeight="700">
                        TARGET STOPPING ZONE (≤ 38.0m)
                      </text>
                    </g>
                  )}

                  {/* Level 3 Apex Radius Marker */}
                  {activeLevel === 3 && (
                    <g transform="translate(420, 230)">
                      <circle cx="0" cy="65" r="50" fill="none" stroke="rgba(56, 189, 248, 0.3)" strokeWidth="2" strokeDasharray="3 3" />
                      <text x="0" y="-8" textAnchor="middle" fill="var(--sys-fluid)" fontSize="10" fontFamily="monospace" fontWeight="700">
                        APEX R = 45m (≥ 75 km/h)
                      </text>
                    </g>
                  )}
                </g>
              )}

              {/* Skid Marks on Road if traction is broken */}
              {(perf.hasWheelspin || perf.hasCornerSkid || isRunning) && (
                <g stroke="#000000" strokeWidth="6" opacity={perf.hasCornerSkid || perf.hasWheelspin ? 0.75 : 0.25} strokeLinecap="round">
                  <line x1={carBaseX - 60} y1="318" x2={carBaseX - 10} y2="318" />
                  <line x1={carBaseX + 60} y1="318" x2={carBaseX + 110} y2="318" />
                </g>
              )}

              {/* ── Animated Sports Car ── */}
              <g transform={`translate(${carBaseX}, 285) rotate(${chassisPitchDeg})`}>
                {/* Exhaust Flame Pulse */}
                {isAccelActive && (
                  <ellipse
                    cx="-115"
                    cy="8"
                    rx={20 + (power / 100) * 15}
                    ry="6"
                    fill="url(#exhaust-flame)"
                    opacity="0.9"
                  />
                )}

                {/* Shadow underneath car */}
                <ellipse cx="0" cy="30" rx="105" ry="8" fill="#000" opacity="0.6" filter="blur(3px)" />

                {/* Chassis Lower Base & Front Splitter / Rear Diffuser */}
                <path
                  d="M -105 18 L 105 18 L 112 14 L 110 8 L -105 8 Z"
                  fill="#090d16"
                  stroke="#334155"
                  strokeWidth="1.5"
                />

                {/* Car Main Body Silhouette */}
                <path
                  d="M -102 12
                     C -98 -6, -85 -18, -60 -20
                     C -40 -20, -25 -25, -5 -42
                     C 15 -42, 35 -38, 52 -20
                     C 70 -16, 92 -2, 102 8
                     L 105 16
                     L -102 16 Z"
                  fill="url(#car-body)"
                  stroke="rgba(255, 255, 255, 0.4)"
                  strokeWidth="1.5"
                />

                {/* Cabin Roof & Windshield Glass */}
                <path
                  d="M -48 -18
                     L -12 -38
                     L 32 -38
                     L 52 -18
                     Z"
                  fill="url(#windshield-tint)"
                  stroke="rgba(255, 255, 255, 0.6)"
                  strokeWidth="1.2"
                />
                <line x1="8" y1="-38" x2="16" y2="-18" stroke="#334155" strokeWidth="2" />

                {/* Aerodynamic Body Styling Creases */}
                <path
                  d="M -55 -2 Q 0 -6 65 -2"
                  stroke="rgba(255, 255, 255, 0.3)"
                  strokeWidth="1.5"
                  fill="none"
                />

                {/* Rear Spoiler Wing */}
                <g transform="translate(-95, -24)">
                  <line x1="0" y1="0" x2="6" y2="8" stroke="#0f172a" strokeWidth="3" />
                  <rect x="-12" y="-4" width="28" height="4" rx="2" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
                </g>

                {/* Front Headlight LED cluster */}
                <polygon points="95,0 104,4 98,8" fill="#e0f2fe" filter="drop-shadow(0 0 4px #38bdf8)" />

                {/* Rear Taillight / Brake Light */}
                <polygon
                  points="-102,4 -96,2 -96,8 -102,10"
                  fill={isBrakingActive ? '#ef4444' : '#991b1b'}
                  filter={isBrakingActive ? 'drop-shadow(0 0 8px #ef4444)' : undefined}
                />

                {/* ── Rear Wheel Assembly (x = -65, y = 20) ── */}
                <g transform="translate(-65, 20)">
                  {/* Wheel Arch */}
                  <path d="M -26 0 A 26 26 0 0 1 26 0" stroke="#090d16" strokeWidth="4" fill="none" />

                  {/* Vented Brake Rotor & Glowing Caliper */}
                  <circle cx="0" cy="0" r="14" fill="#334155" stroke="#64748b" strokeWidth="1" />
                  {isBrakingActive && (
                    <circle cx="0" cy="0" r="14" fill="url(#brake-glow)" />
                  )}
                  {/* Caliper */}
                  <rect x="-13" y="-12" width="7" height="10" rx="1.5" fill={isBrakingActive ? '#ef4444' : '#f59e0b'} />

                  {/* Rotating Tire and Alloy Rim */}
                  <g transform={`rotate(${wheelRotationDeg})`}>
                    <circle cx="0" cy="0" r="22" fill="#0f172a" stroke="#1e293b" strokeWidth="5" />
                    <circle cx="0" cy="0" r="15" fill="#1e293b" stroke="#94a3b8" strokeWidth="1" />
                    {/* Alloy Spokes (5-spoke) */}
                    {[0, 72, 144, 216, 288].map((angle, i) => (
                      <line
                        key={i}
                        x1="0"
                        y1="0"
                        x2={14 * Math.cos((angle * Math.PI) / 180)}
                        y2={14 * Math.sin((angle * Math.PI) / 180)}
                        stroke="#cbd5e1"
                        strokeWidth="2"
                      />
                    ))}
                    <circle cx="0" cy="0" r="4" fill="#38bdf8" />
                  </g>
                </g>

                {/* ── Front Wheel Assembly with Dynamic Steering (x = 65, y = 20) ── */}
                <g transform={`translate(65, 20) rotate(${frontSteerAngle})`}>
                  {/* Vented Brake Rotor & Glowing Caliper */}
                  <circle cx="0" cy="0" r="14" fill="#334155" stroke="#64748b" strokeWidth="1" />
                  {isBrakingActive && (
                    <circle cx="0" cy="0" r="14" fill="url(#brake-glow)" />
                  )}
                  {/* Caliper */}
                  <rect x="7" y="-12" width="7" height="10" rx="1.5" fill={isBrakingActive ? '#ef4444' : '#f59e0b'} />

                  {/* Rotating Front Tire */}
                  <g transform={`rotate(${wheelRotationDeg})`}>
                    <circle cx="0" cy="0" r="22" fill="#0f172a" stroke="#1e293b" strokeWidth="5" />
                    <circle cx="0" cy="0" r="15" fill="#1e293b" stroke="#94a3b8" strokeWidth="1" />
                    {[0, 72, 144, 216, 288].map((angle, i) => (
                      <line
                        key={i}
                        x1="0"
                        y1="0"
                        x2={14 * Math.cos((angle * Math.PI) / 180)}
                        y2={14 * Math.sin((angle * Math.PI) / 180)}
                        stroke="#cbd5e1"
                        strokeWidth="2"
                      />
                    ))}
                    <circle cx="0" cy="0" r="4" fill="#38bdf8" />
                  </g>
                </g>
              </g>

              {/* Live Run HUD Overlay in Canvas Top Right */}
              <g transform="translate(560, 20)">
                <rect x="0" y="0" width="220" height="70" rx="5" fill="rgba(10, 15, 24, 0.85)" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" />
                <text x="14" y="22" fill="#94a3b8" fontSize="10" fontFamily="monospace">STATUS:</text>
                <text x="70" y="22" fill="var(--sys-fluid)" fontSize="10" fontFamily="monospace" fontWeight="700">
                  {runOutcome}
                </text>
                <text x="14" y="42" fill="#94a3b8" fontSize="10" fontFamily="monospace">SPEED:</text>
                <text x="70" y="42" fill="#fff" fontSize="13" fontFamily="monospace" fontWeight="700">
                  {displaySpeed} km/h
                </text>
                <text x="14" y="60" fill="#94a3b8" fontSize="10" fontFamily="monospace">RPM:</text>
                <text x="70" y="60" fill="#f59e0b" fontSize="11" fontFamily="monospace" fontWeight="700">
                  {liveRpm.toLocaleString()}
                </text>
              </g>
            </svg>
          </div>

          {/* ── Cockpit Telemetry HUD Deck ── */}
          <div className="auto-cockpit-hud">
            {/* Speedometer Cluster */}
            <div className="auto-gauge-card">
              <span className="auto-gauge-label">SPEEDOMETER</span>
              <div className="auto-gauge-visual">
                <svg viewBox="0 0 100 60" className="auto-gauge-svg">
                  <path d="M 15 50 A 35 35 0 0 1 85 50" fill="none" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="8" strokeLinecap="round" />
                  <path
                    d="M 15 50 A 35 35 0 0 1 85 50"
                    fill="none"
                    stroke="var(--sys-fluid)"
                    strokeWidth="8"
                    strokeDasharray="110"
                    strokeDashoffset={110 - Math.min(110, (displaySpeed / 260) * 110)}
                    strokeLinecap="round"
                  />
                  {/* Needle */}
                  <g transform={`translate(50, 50) rotate(${speedNeedleDeg})`}>
                    <line x1="0" y1="0" x2="0" y2="-32" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="0" cy="0" r="4" fill="#38bdf8" />
                  </g>
                </svg>
              </div>
              <div className="auto-gauge-readout">
                <span className="auto-gauge-val">{displaySpeed}</span>
                <span className="auto-gauge-unit">KM/H</span>
              </div>
            </div>

            {/* Tachometer (RPM) Cluster */}
            <div className="auto-gauge-card">
              <span className="auto-gauge-label">TACHOMETER</span>
              <div className="auto-gauge-visual">
                <svg viewBox="0 0 100 60" className="auto-gauge-svg">
                  <path d="M 15 50 A 35 35 0 0 1 85 50" fill="none" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="8" strokeLinecap="round" />
                  <path
                    d="M 15 50 A 35 35 0 0 1 85 50"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="8"
                    strokeDasharray="110"
                    strokeDashoffset={110 - Math.min(110, (liveRpm / 8000) * 110)}
                    strokeLinecap="round"
                  />
                  {/* Needle */}
                  <g transform={`translate(50, 50) rotate(${rpmNeedleDeg})`}>
                    <line x1="0" y1="0" x2="0" y2="-32" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="0" cy="0" r="4" fill="#f59e0b" />
                  </g>
                </svg>
              </div>
              <div className="auto-gauge-readout">
                <span className="auto-gauge-val">{(liveRpm / 1000).toFixed(1)}</span>
                <span className="auto-gauge-unit">RPM ×1k</span>
              </div>
            </div>

            {/* Traction Adhesion Meter */}
            <div className="auto-hud-tile">
              <div className="auto-hud-tile__head">
                <span>TIRE TRACTION LIMIT</span>
                <span className={`auto-hud-badge ${perf.hasWheelspin ? 'is-warn' : 'is-good'}`}>
                  {perf.hasWheelspin ? 'SLIP' : 'GRIP'}
                </span>
              </div>
              <div className="auto-hud-bar-track">
                <div
                  className={`auto-hud-bar-fill ${perf.hasWheelspin ? 'is-slip' : 'is-grip'}`}
                  style={{ width: `${Math.min(100, Math.round((perf.driveForceN / perf.maxTractionN) * 100))}%` }}
                />
              </div>
              <div className="auto-hud-tile__sub">
                <span>F_drive: {perf.driveForceN} N</span>
                <span>Limit: {perf.maxTractionN} N</span>
              </div>
            </div>

            {/* Lateral Cornering Balance */}
            <div className="auto-hud-tile">
              <div className="auto-hud-tile__head">
                <span>CORNERING APEX (45m)</span>
                <span className={`auto-hud-badge ${perf.hasCornerSkid ? 'is-warn' : 'is-good'}`}>
                  {perf.hasCornerSkid ? 'SKID' : 'CLEAN'}
                </span>
              </div>
              <div className="auto-hud-bar-track">
                <div
                  className={`auto-hud-bar-fill ${perf.hasCornerSkid ? 'is-slip' : 'is-apex'}`}
                  style={{ width: `${Math.min(100, Math.max(10, Math.round((perf.lateralAccG / (perf.maxTractionN / 12260)) * 100)))}%` }}
                />
              </div>
              <div className="auto-hud-tile__sub">
                <span>Lateral G: {perf.lateralAccG.toFixed(2)}g</span>
                <span>Margin: {perf.gripMarginPercent > 0 ? `+${perf.gripMarginPercent}%` : `${perf.gripMarginPercent}%`}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Vehicle Setup Controls */}
        <div className="auto-controls-panel">
          <div className="auto-controls-panel__head">
            <h2 className="auto-controls-panel__title">VEHICLE TUNING DECK</h2>
            <button
              type="button"
              className="auto-btn-reset-compact"
              onClick={handleResetRun}
              onPointerEnter={() => setIntent('button', 'RESET')}
              onPointerLeave={clearIntent}
              title="Reset vehicle setup to defaults"
            >
              RESET
            </button>
          </div>

          {/* Interactive Action Controls */}
          <div className="auto-actions-strip">
            <button
              type="button"
              className={`auto-btn-track-run${isRunning ? ' is-running' : ''}`}
              onClick={handleStartRun}
              disabled={isRunning}
              onPointerEnter={() => setIntent('button', 'START RUN')}
              onPointerLeave={clearIntent}
            >
              {isRunning ? '⏱ TESTING RUN...' : 'START TRACK RUN ▶'}
            </button>

            {/* Micro-interaction buttons */}
            <div className="auto-micro-btns">
              <button
                type="button"
                className="auto-micro-btn"
                onMouseDown={() => setIsThrottling(true)}
                onMouseUp={() => setIsThrottling(false)}
                onMouseLeave={() => setIsThrottling(false)}
                onTouchStart={() => setIsThrottling(true)}
                onTouchEnd={() => setIsThrottling(false)}
                title="Hold to rev engine"
              >
                🏁 REV
              </button>
              <button
                type="button"
                className="auto-micro-btn"
                onMouseDown={() => setIsBrakeClamped(true)}
                onMouseUp={() => setIsBrakeClamped(false)}
                onMouseLeave={() => setIsBrakeClamped(false)}
                onTouchStart={() => setIsBrakeClamped(true)}
                onTouchEnd={() => setIsBrakeClamped(false)}
                title="Hold to clamp brakes"
              >
                🛑 BRAKE
              </button>
            </div>
          </div>

          {/* Slider 1: POWER */}
          <div className="auto-control-group">
            <div className="auto-control-group__label-row">
              <label htmlFor="auto-power" className="auto-control-group__name">
                POWER (ENGINE FORCE)
              </label>
              <span className="auto-control-group__value">{power}%</span>
            </div>
            <input
              id="auto-power"
              type="range"
              className="auto-control-slider"
              min={AUTOMOTIVE_LIMITS.power.min}
              max={AUTOMOTIVE_LIMITS.power.max}
              step={AUTOMOTIVE_LIMITS.power.step}
              value={power}
              onChange={(e) => onParamChange(Number(e.target.value), grip, braking, steering)}
            />
            <div className="auto-control-group__scale">
              <span>Low (30%)</span>
              <span>Sprint: {perf.sprint0to100Sec.toFixed(2)}s</span>
              <span>Extreme (100%)</span>
            </div>
          </div>

          {/* Slider 2: GRIP */}
          <div className="auto-control-group">
            <div className="auto-control-group__label-row">
              <label htmlFor="auto-grip" className="auto-control-group__name">
                GRIP (TIRE ADHESION)
              </label>
              <span className="auto-control-group__value">{grip}%</span>
            </div>
            <input
              id="auto-grip"
              type="range"
              className="auto-control-slider"
              min={AUTOMOTIVE_LIMITS.grip.min}
              max={AUTOMOTIVE_LIMITS.grip.max}
              step={AUTOMOTIVE_LIMITS.grip.step}
              value={grip}
              onChange={(e) => onParamChange(power, Number(e.target.value), braking, steering)}
            />
            <div className="auto-control-group__scale">
              <span>Slick / Slide (30%)</span>
              <span>Max Grip: {perf.maxTractionN} N</span>
              <span>Racing Sticky (100%)</span>
            </div>
          </div>

          {/* Slider 3: BRAKING */}
          <div className="auto-control-group">
            <div className="auto-control-group__label-row">
              <label htmlFor="auto-braking" className="auto-control-group__name">
                BRAKING (CALIPER FORCE)
              </label>
              <span className="auto-control-group__value">{braking}%</span>
            </div>
            <input
              id="auto-braking"
              type="range"
              className="auto-control-slider"
              min={AUTOMOTIVE_LIMITS.braking.min}
              max={AUTOMOTIVE_LIMITS.braking.max}
              step={AUTOMOTIVE_LIMITS.braking.step}
              value={braking}
              onChange={(e) => onParamChange(power, grip, Number(e.target.value), steering)}
            />
            <div className="auto-control-group__scale">
              <span>Soft (30%)</span>
              <span>Stop: {perf.brakingDistanceM.toFixed(1)}m</span>
              <span>Bite (100%)</span>
            </div>
          </div>

          {/* Slider 4: STEERING */}
          <div className="auto-control-group">
            <div className="auto-control-group__label-row">
              <label htmlFor="auto-steering" className="auto-control-group__name">
                STEERING (TURN ANGLE)
              </label>
              <span className="auto-control-group__value">{steering}%</span>
            </div>
            <input
              id="auto-steering"
              type="range"
              className="auto-control-slider"
              min={AUTOMOTIVE_LIMITS.steering.min}
              max={AUTOMOTIVE_LIMITS.steering.max}
              step={AUTOMOTIVE_LIMITS.steering.step}
              value={steering}
              onChange={(e) => onParamChange(power, grip, braking, Number(e.target.value))}
            />
            <div className="auto-control-group__scale">
              <span>Gentle (20%)</span>
              <span>Angle: {frontSteerAngle}°</span>
              <span>Sharp (100%)</span>
            </div>
          </div>

          {/* Performance Quick Telemetry */}
          <div className="auto-telemetry-grid">
            <div className="auto-telemetry-cell">
              <span className="auto-telemetry-cell__label">0–100 SPRINT</span>
              <span className="auto-telemetry-cell__value is-accent">
                {perf.sprint0to100Sec.toFixed(2)} s
              </span>
            </div>

            <div className="auto-telemetry-cell">
              <span className="auto-telemetry-cell__label">STOPPING DIST</span>
              <span className="auto-telemetry-cell__value is-warn">
                {perf.brakingDistanceM.toFixed(1)} m
              </span>
            </div>

            <div className="auto-telemetry-cell">
              <span className="auto-telemetry-cell__label">CORNER SPEED</span>
              <span className="auto-telemetry-cell__value">
                {perf.testCornerSpeedKmh} km/h
              </span>
            </div>

            <div className="auto-telemetry-cell">
              <span className="auto-telemetry-cell__label">CHASSIS BALANCE</span>
              <span className="auto-telemetry-cell__value">
                {perf.balanceRating}
              </span>
            </div>
          </div>

          {/* Contextual Guidance */}
          {!isChallengeMode ? (
            <div className="auto-try-this-card">
              <span className="auto-try-this-card__tag">TRY THIS</span>
              <p className="auto-try-this-card__prompt">
                Slide <strong>POWER</strong> to 90% and <strong>GRIP</strong> down to 35%. Click <strong>START TRACK RUN ▶</strong> to watch the car break traction into wheelspin and slide!
              </p>
              <button
                type="button"
                className="auto-try-mission-link"
                onClick={() => onSwitchMode?.('challenge')}
              >
                Ready to solve missions? Start Challenge Mode →
              </button>
            </div>
          ) : (
            <div className="auto-challenge-live-feedback">
              <div className="auto-challenge-live-feedback__header">
                <span className="auto-challenge-live-feedback__tag">LIVE MISSION FEEDBACK</span>
              </div>
              <p className="auto-challenge-live-feedback__msg">
                {challengeEval.feedbackMessage}
              </p>
              {challengeEval.engineeringInsight && (
                <p className="auto-challenge-live-feedback__insight">
                  💡 {challengeEval.engineeringInsight}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
