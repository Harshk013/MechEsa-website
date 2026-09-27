// src/components/mechLab/experiments/FluidExperimentView.tsx
// Flagship Venturi flow apparatus with dynamic streamlines, U-tube manometer, inline taps, and integrated explore/challenge decks

import { useState, useEffect, useRef, useMemo } from 'react'
import {
  calculateFluidState,
  FLUID_PARAM_LIMITS,
  type FluidState,
} from './fluidModel'
import {
  FLUID_LEVELS,
  FLUID_FLAGSHIP_CHALLENGE,
} from './fluidChallenge'
import { usePointer } from '../../interaction/PointerProvider'
import './fluid.css'

interface FluidExperimentViewProps {
  flowRate: number
  throatDiameter: number
  onParamChange: (flowRate: number, throatDiameter: number) => void
  onReset: () => void
  activeLevel?: number
  isChallengeMode?: boolean
  onSwitchMode?: (mode: 'explore' | 'challenge') => void
  onLevelChange?: (level: number) => void
}

interface Particle {
  id: number
  x: number
  streamlineOffset: number // -0.7 to +0.7
  speedFactor: number
}

export function FluidExperimentView({
  flowRate,
  throatDiameter,
  onParamChange,
  onReset,
  activeLevel = 1,
  isChallengeMode = false,
  onSwitchMode,
  onLevelChange,
}: FluidExperimentViewProps) {
  const { setIntent, clearIntent } = usePointer()

  // Playback & Auto Flow state
  const [isFlowRunning, setIsFlowRunning] = useState<boolean>(true)
  const [showHint, setShowHint] = useState<boolean>(false)

  // Fluid physics calculation
  const fluidState: FluidState = useMemo(
    () => calculateFluidState(flowRate, throatDiameter),
    [flowRate, throatDiameter]
  )

  // Challenge evaluation
  const challengeEval = useMemo(
    () =>
      FLUID_FLAGSHIP_CHALLENGE.evaluate(
        { flowRate, throatDiameter },
        null,
        activeLevel
      ),
    [flowRate, throatDiameter, activeLevel]
  )

  const currentLevelInfo = FLUID_LEVELS[activeLevel - 1] || FLUID_LEVELS[0]

  // Particle simulation state
  const particlesRef = useRef<Particle[]>([])
  const [particlePositions, setParticlePositions] = useState<{ x: number; y: number }[]>([])
  const animFrameRef = useRef<number | null>(null)

  // Initialize deterministic particles distributed across 5 streamlines
  useEffect(() => {
    const offsets = [-0.68, -0.34, 0, 0.34, 0.68]
    const initial: Particle[] = []
    let idCounter = 0

    // 7 particles per streamline = 35 particles total
    for (const offset of offsets) {
      for (let i = 0; i < 7; i++) {
        initial.push({
          id: idCounter++,
          x: 65 + i * 95 + (Math.random() * 20 - 10),
          streamlineOffset: offset,
          speedFactor: 0.95 + Math.random() * 0.1,
        })
      }
    }
    particlesRef.current = initial
  }, [])

  // Geometry dimensions in SVG coordinates
  // Canvas: 820 x 360
  const yCenter = 120
  const r1 = 44 // Half-height at inlet (50mm pipe)
  // Throat radius r2 scales between 13px (15mm) and 39px (45mm), default 25mm -> 22px
  const r2 = Math.round(13 + ((throatDiameter - 15) / (45 - 15)) * (39 - 13))

  // Radius function along X coordinate
  const getRadiusAtX = (x: number): number => {
    if (x <= 230) return r1
    if (x >= 230 && x <= 330) {
      const progress = (x - 230) / 100
      const factor = 0.5 * (1 + Math.cos(progress * Math.PI)) // 1 to 0
      return r2 + (r1 - r2) * factor
    }
    if (x >= 330 && x <= 470) return r2
    if (x >= 470 && x <= 590) {
      const progress = (x - 470) / 120
      const factor = 0.5 * (1 - Math.cos(progress * Math.PI)) // 0 to 1
      return r2 + (r1 - r2) * factor
    }
    return r1
  }

  // Animation Loop: updates particle positions with velocity scaled by Continuity
  useEffect(() => {
    let lastTimestamp = performance.now()

    const updateLoop = (timestamp: number) => {
      const dt = Math.min((timestamp - lastTimestamp) / 1000, 0.05)
      lastTimestamp = timestamp

      if (isFlowRunning) {
        const baseSpeedPxPerSec = 80 * (fluidState.inlet.velocity / 0.25)

        particlesRef.current.forEach((p) => {
          const currentR = getRadiusAtX(p.x)
          const speedMultiplier = (r1 / currentR) * p.speedFactor
          p.x += baseSpeedPxPerSec * speedMultiplier * dt

          if (p.x > 745) {
            p.x = 60 + (p.x - 745)
          }
        })

        const positions = particlesRef.current.map((p) => {
          const localR = getRadiusAtX(p.x)
          const y = yCenter + p.streamlineOffset * (localR - 7)
          return { x: p.x, y }
        })
        setParticlePositions(positions)
      }

      animFrameRef.current = requestAnimationFrame(updateLoop)
    }

    animFrameRef.current = requestAnimationFrame(updateLoop)

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current)
      }
    }
  }, [isFlowRunning, fluidState.inlet.velocity, r1, r2])

  // SVG Contours for the Venturi Tube
  const topPath = `M 55 ${yCenter - r1} L 230 ${yCenter - r1} C 280 ${yCenter - r1}, 280 ${yCenter - r2}, 330 ${yCenter - r2} L 470 ${yCenter - r2} C 530 ${yCenter - r2}, 530 ${yCenter - r1}, 590 ${yCenter - r1} L 745 ${yCenter - r1}`
  const bottomPath = `L 745 ${yCenter + r1} L 590 ${yCenter + r1} C 530 ${yCenter + r1}, 530 ${yCenter + r2}, 470 ${yCenter + r2} L 330 ${yCenter + r2} C 280 ${yCenter + r2}, 280 ${yCenter + r1}, 230 ${yCenter + r1} L 55 ${yCenter + r1} Z`
  const pipeEnclosurePath = `${topPath} ${bottomPath}`

  // Manometer visual deflection
  // Left column connected to Point A (x = 175)
  // Right column connected to Point B (x = 400)
  const maxManometerMm = 1400
  const normalizedDeltaH = Math.min(1, fluidState.manometerDeltaH / maxManometerMm)
  const deltaHPx = normalizedDeltaH * 76
  const leftLiquidY = 275 + deltaHPx / 2
  const rightLiquidY = 275 - deltaHPx / 2

  // Visual meter percentage calculations
  const maxVScale = 6.0 // m/s
  const maxPScale = 30.0 // kPa
  const inletVPct = Math.min(100, Math.round((fluidState.inlet.velocity / maxVScale) * 100))
  const inletPPct = Math.min(100, Math.round((fluidState.inlet.staticPressure / maxPScale) * 100))
  const throatVPct = Math.min(100, Math.round((fluidState.throat.velocity / maxVScale) * 100))
  const throatPPct = Math.min(100, Math.round((fluidState.throat.staticPressure / maxPScale) * 100))

  // Sandbox Presets
  const applyPreset = (flow: number, throat: number) => {
    onParamChange(flow, throat)
  }

  // Velocity arrow lengths
  const v1ArrowLen = Math.min(45, Math.max(14, fluidState.inlet.velocity * 35))
  const v2ArrowLen = Math.min(75, Math.max(20, fluidState.throat.velocity * 22))

  return (
    <div className="fluid-container">
      {/* ── Mode-Specific Upper Deck ─────────────────────────────── */}
      {isChallengeMode ? (
        <div className="fluid-challenge-mission-deck" aria-label="Fluid Flow Mission Briefing">
          <div className="fluid-mission-header">
            <div className="fluid-mission-title-group">
              <span className="fluid-mission-badge">
                MISSION // LEVEL 0{activeLevel} OF 03
              </span>
              <h2 className="fluid-mission-heading">
                {currentLevelInfo.levelTitle.toUpperCase()}
              </h2>
              <p className="fluid-mission-objective">{currentLevelInfo.objective}</p>
            </div>

            {/* Level Selector Pills */}
            <div className="fluid-mission-level-pills" role="tablist" aria-label="Mission levels">
              {FLUID_LEVELS.map((lvl) => (
                <button
                  key={lvl.levelNumber}
                  type="button"
                  role="tab"
                  aria-selected={activeLevel === lvl.levelNumber}
                  className={`fluid-level-pill${activeLevel === lvl.levelNumber ? ' is-active' : ''}`}
                  onClick={() => onLevelChange?.(lvl.levelNumber)}
                >
                  <span className="fluid-level-pill__dot" aria-hidden="true" />
                  <span>LVL 0{lvl.levelNumber}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Target Status & Feedback Bar */}
          <div className="fluid-mission-status-bar">
            <div className="fluid-mission-criteria">
              <span className="fluid-mission-criteria__label">TARGET:</span>
              <span className="fluid-mission-criteria__val">{currentLevelInfo.targetCriteria}</span>
            </div>

            <div className="fluid-mission-current">
              <span className="fluid-mission-current__label">CURRENT:</span>
              <span className="fluid-mission-current__val">
                {activeLevel === 1 && `V₂ = ${fluidState.throat.velocity.toFixed(2)} m/s`}
                {activeLevel === 2 && `ΔP = ${fluidState.pressureDropKpa.toFixed(2)} kPa`}
                {activeLevel === 3 && `Q = ${flowRate} L/min | ΔP = ${fluidState.pressureDropKpa.toFixed(2)} kPa`}
              </span>
            </div>

            <div
              className={`fluid-mission-badge-status ${
                challengeEval.isPassed
                  ? 'is-passed'
                  : challengeEval.status === 'PRESSURE DROP TOO HIGH'
                  ? 'is-warn'
                  : 'is-pending'
              }`}
            >
              {challengeEval.isPassed ? '✓ TARGET MET' : challengeEval.status}
            </div>

            <div className="fluid-mission-actions">
              <button
                type="button"
                className="fluid-hint-btn"
                onClick={() => setShowHint((prev) => !prev)}
              >
                {showHint ? 'HIDE HINT ▴' : '💡 HINT'}
              </button>

              {challengeEval.isPassed && activeLevel < 3 && (
                <button
                  type="button"
                  className="fluid-btn-next-mission"
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
            <div className="fluid-mission-hint-box" role="note">
              <strong>Engineer Tip:</strong> {currentLevelInfo.hint}
            </div>
          )}
        </div>
      ) : (
        /* Explore Mode Presets Bar */
        <div className="fluid-explore-presets-bar" aria-label="Flow sandbox presets">
          <div className="fluid-explore-presets-label">
            <span className="fluid-explore-dot" aria-hidden="true" />
            <span>SANDBOX PRESETS:</span>
          </div>
          <div className="fluid-presets-list">
            <button
              type="button"
              className="fluid-preset-btn"
              onClick={() => applyPreset(20, 35)}
              title="Low flow, wide constriction"
            >
              💧 GENTLE FLOW
            </button>
            <button
              type="button"
              className="fluid-preset-btn"
              onClick={() => applyPreset(42, 18)}
              title="High flow, tight throat: rapid jet"
            >
              ⚡ VENTURI JET
            </button>
            <button
              type="button"
              className="fluid-preset-btn"
              onClick={() => applyPreset(58, 15)}
              title="Extreme constriction causing pressure collapse"
            >
              ⚠ CAVITATION LIMIT
            </button>
            <button
              type="button"
              className="fluid-preset-btn"
              onClick={() => applyPreset(30, 25)}
              title="Standard balanced Venturi configuration"
            >
              ⚖ LAB DEFAULT
            </button>
          </div>
        </div>
      )}

      {/* ── Main Hero Layout: Apparatus on Left, Controls on Right ── */}
      <div className="fluid-hero-grid">
        {/* Left Column: Interactive Flow Apparatus */}
        <div className="fluid-stage-card">
          <div className="fluid-stage-card__header">
            <div className="fluid-stage-card__title-group">
              <span
                className={`fluid-stage-card__status-dot${!isFlowRunning ? ' is-paused' : ''}`}
                aria-hidden="true"
              />
              <h2 className="fluid-stage-card__title">VENTURI FLOW APPARATUS</h2>
              <span className="fluid-stage-card__tag">
                {isChallengeMode ? `CHALLENGE L0${activeLevel}` : 'FREE EXPERIMENT'}
              </span>
            </div>

            <div className="fluid-stage-card__header-right">
              <span
                className={`fluid-stage-card__regime-badge${
                  fluidState.isCavitationRisk ? ' is-cavitation' : ''
                }`}
              >
                {fluidState.isCavitationRisk
                  ? '⚠ CAVITATION RISK (P₂ < 3.2 kPa)'
                  : `Re_throat ≈ ${fluidState.reynoldsThroat.toLocaleString()}`}
              </span>
            </div>
          </div>

          {/* ── Interactive SVG Canvas ── */}
          <div className="fluid-canvas-container" aria-label="Venturi pipe simulation canvas">
            <svg
              className="fluid-apparatus-svg"
              viewBox="0 0 810 360"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                {/* Pipe interior clipping mask */}
                <clipPath id="venturi-pipe-clip">
                  <path d={pipeEnclosurePath} />
                </clipPath>

                {/* Fluid body kinetic energy gradient */}
                <linearGradient id="fluid-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0369a1" stopOpacity="0.45" />
                  <stop offset="26%" stopColor="#0284c7" stopOpacity="0.6" />
                  <stop offset="42%" stopColor="#38bdf8" stopOpacity="0.85" />
                  <stop offset="50%" stopColor="#e0f2fe" stopOpacity="0.95" />
                  <stop offset="58%" stopColor="#38bdf8" stopOpacity="0.85" />
                  <stop offset="74%" stopColor="#0284c7" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#0369a1" stopOpacity="0.45" />
                </linearGradient>

                {/* Glass pipe wall gradient */}
                <linearGradient id="glass-reflection" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
                  <stop offset="25%" stopColor="#ffffff" stopOpacity="0.06" />
                  <stop offset="80%" stopColor="#000000" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0.25" />
                </linearGradient>

                {/* Manometer liquid gradient */}
                <linearGradient id="manometer-fluid" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#b45309" />
                </linearGradient>

                {/* Cavitation warning glow */}
                <radialGradient id="cavitation-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(239, 68, 68, 0.45)" />
                  <stop offset="100%" stopColor="rgba(239, 68, 68, 0)" />
                </radialGradient>
              </defs>

              {/* Background Technical Grid */}
              <g opacity="0.12" stroke="#38bdf8" strokeWidth="0.5">
                <line x1="50" y1="50" x2="750" y2="50" strokeDasharray="3 3" />
                <line x1="50" y1={yCenter} x2="750" y2={yCenter} strokeDasharray="5 5" strokeWidth="1" opacity="0.35" />
                <line x1="50" y1="190" x2="750" y2="190" strokeDasharray="3 3" />
                <line x1="175" y1="20" x2="175" y2="330" strokeDasharray="3 3" />
                <line x1="400" y1="20" x2="400" y2="330" strokeDasharray="3 3" />
                <line x1="660" y1="20" x2="660" y2="200" strokeDasharray="3 3" />
              </g>

              {/* Manometer Glass Tubing Structure (Below pipe) */}
              <g stroke="rgba(255, 255, 255, 0.22)" strokeWidth="8" fill="none" strokeLinecap="round">
                {/* Left Tap from Point A (x=175) down to U-tube left (x=260) */}
                <path d={`M 175 ${yCenter + r1} L 175 220 Q 175 235, 195 235 L 245 235 Q 260 235, 260 250 L 260 330`} />
                {/* Right Tap from Point B (x=400) down to U-tube right (x=340) */}
                <path d={`M 400 ${yCenter + r2} L 400 220 Q 400 235, 385 235 L 355 235 Q 340 235, 340 250 L 340 330`} />
                {/* Bottom U-bend */}
                <path d="M 260 330 Q 300 350, 340 330" />
              </g>

              {/* Manometer Scale Tick Marks (0mm, 200mm, 400mm, 600mm) */}
              <g stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1">
                {[260, 275, 290, 305, 320].map((yVal, i) => (
                  <g key={i}>
                    <line x1="250" y1={yVal} x2="254" y2={yVal} />
                    <line x1="346" y1={yVal} x2="350" y2={yVal} />
                  </g>
                ))}
              </g>

              {/* Manometer Liquid Fill */}
              {/* Left Column liquid */}
              <rect
                x="256"
                y={leftLiquidY}
                width="8"
                height={Math.max(2, 330 - leftLiquidY)}
                fill="url(#manometer-fluid)"
                rx="2"
              />
              {/* Right Column liquid */}
              <rect
                x="336"
                y={rightLiquidY}
                width="8"
                height={Math.max(2, 330 - rightLiquidY)}
                fill="url(#manometer-fluid)"
                rx="2"
              />
              {/* U-bend liquid */}
              <path
                d="M 256 330 Q 300 350, 344 330 L 344 334 Q 300 354, 256 334 Z"
                fill="url(#manometer-fluid)"
              />

              {/* Manometer Height Difference Dimension Bracket */}
              {deltaHPx > 4 && (
                <g>
                  <line
                    x1="352"
                    y1={leftLiquidY}
                    x2="372"
                    y2={leftLiquidY}
                    stroke="var(--color-signal)"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                  <line
                    x1="352"
                    y1={rightLiquidY}
                    x2="372"
                    y2={rightLiquidY}
                    stroke="var(--color-signal)"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                  <line
                    x1="368"
                    y1={rightLiquidY}
                    x2="368"
                    y2={leftLiquidY}
                    stroke="var(--color-signal)"
                    strokeWidth="1.5"
                  />
                  <polygon
                    points={`368,${rightLiquidY} 365,${rightLiquidY + 5} 371,${rightLiquidY + 5}`}
                    fill="var(--color-signal)"
                  />
                  <polygon
                    points={`368,${leftLiquidY} 365,${leftLiquidY - 5} 371,${leftLiquidY - 5}`}
                    fill="var(--color-signal)"
                  />
                  <text
                    x="378"
                    y={(leftLiquidY + rightLiquidY) / 2 + 4}
                    fill="var(--color-signal)"
                    fontSize="11"
                    fontFamily="monospace"
                    fontWeight="700"
                  >
                    Δh = {fluidState.manometerDeltaH.toFixed(0)} mm
                  </text>
                </g>
              )}

              {/* Manometer Tube Labels */}
              <text x="220" y="322" fill="#94a3b8" fontSize="10" fontFamily="monospace">TAP A</text>
              <text x="362" y="322" fill="#94a3b8" fontSize="10" fontFamily="monospace">TAP B</text>
              <text
                x="300"
                y="354"
                textAnchor="middle"
                fill="#94a3b8"
                fontSize="9"
                fontFamily="monospace"
                letterSpacing="0.08em"
              >
                U-TUBE MANOMETER (ΔP = ρ_m · g · Δh)
              </text>

              {/* Fluid Body (Clipped inside pipe geometry) */}
              <path d={pipeEnclosurePath} fill="url(#fluid-gradient)" />

              {/* Cavitation warning overlay if active */}
              {fluidState.isCavitationRisk && (
                <rect
                  x="330"
                  y={yCenter - r2}
                  width="140"
                  height={r2 * 2}
                  fill="url(#cavitation-glow)"
                  clipPath="url(#venturi-pipe-clip)"
                />
              )}

              {/* 5 Visible Streamlines (demonstrates flow compression into throat) */}
              <g clipPath="url(#venturi-pipe-clip)" stroke="rgba(255, 255, 255, 0.16)" strokeWidth="1" fill="none">
                {[-0.68, -0.34, 0, 0.34, 0.68].map((offset, i) => (
                  <path
                    key={i}
                    d={`M 55 ${yCenter + offset * (r1 - 6)}
                        L 230 ${yCenter + offset * (r1 - 6)}
                        C 280 ${yCenter + offset * (r1 - 6)}, 280 ${yCenter + offset * (r2 - 4)}, 330 ${yCenter + offset * (r2 - 4)}
                        L 470 ${yCenter + offset * (r2 - 4)}
                        C 530 ${yCenter + offset * (r2 - 4)}, 530 ${yCenter + offset * (r1 - 6)}, 590 ${yCenter + offset * (r1 - 6)}
                        L 745 ${yCenter + offset * (r1 - 6)}`}
                    strokeDasharray={offset === 0 ? '6 3' : '3 3'}
                  />
                ))}
              </g>

              {/* Water Particles (Accelerate noticeably through throat) */}
              <g clipPath="url(#venturi-pipe-clip)">
                {particlePositions.map((pos, idx) => {
                  const localR = getRadiusAtX(pos.x)
                  const speedFactor = r1 / localR
                  const streakLength = Math.max(5, Math.round(20 * speedFactor))
                  const inThroat = pos.x >= 330 && pos.x <= 470
                  return (
                    <g key={idx}>
                      <line
                        x1={pos.x - streakLength}
                        y1={pos.y}
                        x2={pos.x}
                        y2={pos.y}
                        stroke={inThroat ? '#ffffff' : '#bae6fd'}
                        strokeWidth={inThroat ? '3' : '2'}
                        strokeOpacity={inThroat ? '0.95' : '0.75'}
                        strokeLinecap="round"
                      />
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={inThroat ? '2.5' : '2'}
                        fill={inThroat ? '#ffffff' : '#7dd3fc'}
                        filter={inThroat ? 'drop-shadow(0 0 5px #38bdf8)' : undefined}
                      />
                    </g>
                  )
                })}
              </g>

              {/* Glass Pipe Structural Walls */}
              <path
                d={topPath}
                stroke="rgba(255, 255, 255, 0.75)"
                strokeWidth="3.5"
                fill="none"
                filter="drop-shadow(0 0 3px rgba(255,255,255,0.35))"
              />
              <path
                d={bottomPath}
                stroke="rgba(255, 255, 255, 0.75)"
                strokeWidth="3.5"
                fill="none"
                filter="drop-shadow(0 0 3px rgba(255,255,255,0.35))"
              />

              {/* Glass Reflection Highlight */}
              <path d={pipeEnclosurePath} fill="url(#glass-reflection)" pointerEvents="none" />

              {/* Metal Couplings at Ends */}
              <rect x="50" y={yCenter - r1 - 10} width="10" height={r1 * 2 + 20} rx="2" fill="#334155" stroke="#64748b" strokeWidth="1" />
              <rect x="742" y={yCenter - r1 - 10} width="10" height={r1 * 2 + 20} rx="2" fill="#334155" stroke="#64748b" strokeWidth="1" />

              {/* Velocity Vectors (Point A vs Point B) */}
              {/* V1 Vector at Point A */}
              <g transform={`translate(130, ${yCenter})`}>
                <line x1="0" y1="0" x2={v1ArrowLen} y2="0" stroke="var(--sys-fluid)" strokeWidth="2.5" />
                <polygon points={`${v1ArrowLen},0 ${v1ArrowLen - 6},-4 ${v1ArrowLen - 6},4`} fill="var(--sys-fluid)" />
                <text x="0" y="-8" fill="var(--sys-fluid)" fontSize="10" fontFamily="monospace" fontWeight="700">
                  V₁ = {fluidState.inlet.velocity.toFixed(2)} m/s
                </text>
              </g>

              {/* V2 Vector at Throat */}
              <g transform={`translate(360, ${yCenter})`}>
                <line x1="0" y1="0" x2={v2ArrowLen} y2="0" stroke="#f0fdf4" strokeWidth="3" />
                <polygon points={`${v2ArrowLen},0 ${v2ArrowLen - 7},-5 ${v2ArrowLen - 7},5`} fill="#ffffff" />
                <text x="0" y="-8" fill="#ffffff" fontSize="10.5" fontFamily="monospace" fontWeight="700">
                  V₂ = {fluidState.throat.velocity.toFixed(2)} m/s
                </text>
              </g>

              {/* Diameter Dimensions */}
              {/* Inlet Ø 50mm dimension */}
              <g transform="translate(100, 48)">
                <line x1="0" y1="0" x2="0" y2={yCenter - r1 - 48} stroke="#64748b" strokeWidth="1" strokeDasharray="2 2" />
                <rect x="-35" y="-14" width="70" height="18" rx="3" fill="#0f172a" stroke="#334155" strokeWidth="1" />
                <text x="0" y="-1" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace">
                  Ø 50 mm
                </text>
              </g>

              {/* Throat Ø dimension */}
              <g transform="translate(400, 48)">
                <line x1="0" y1="0" x2="0" y2={yCenter - r2 - 48} stroke="var(--color-signal)" strokeWidth="1" strokeDasharray="2 2" />
                <rect x="-40" y="-14" width="80" height="18" rx="3" fill="#0f172a" stroke="var(--color-signal)" strokeWidth="1" />
                <text x="0" y="-1" textAnchor="middle" fill="var(--color-signal)" fontSize="10" fontFamily="monospace" fontWeight="700">
                  Ø {throatDiameter} mm
                </text>
              </g>

              {/* Measurement Taps Markers */}
              {/* Point A (Inlet Tap) */}
              <g transform="translate(175, 45)">
                <circle cx="0" cy="0" r="14" fill="#0f172a" stroke="var(--sys-fluid)" strokeWidth="2" />
                <text x="0" y="4" textAnchor="middle" fill="#f0f2f5" fontSize="11" fontWeight="700" fontFamily="monospace">A</text>
                <text x="0" y="-18" textAnchor="middle" fill="#94a3b8" fontSize="9.5" fontFamily="monospace">WIDE INLET</text>
              </g>

              {/* Point B (Throat Tap) */}
              <g transform="translate(400, 45)">
                <circle cx="0" cy="0" r="14" fill="#0f172a" stroke="var(--color-signal)" strokeWidth="2" />
                <text x="0" y="4" textAnchor="middle" fill="#f0f2f5" fontSize="11" fontWeight="700" fontFamily="monospace">B</text>
                <text x="0" y="-18" textAnchor="middle" fill="#94a3b8" fontSize="9.5" fontFamily="monospace">CONSTRICTION</text>
              </g>

              {/* Point C (Recovered Outlet) */}
              <g transform="translate(660, 45)">
                <circle cx="0" cy="0" r="14" fill="#0f172a" stroke="#64748b" strokeWidth="2" />
                <text x="0" y="4" textAnchor="middle" fill="#f0f2f5" fontSize="11" fontWeight="700" fontFamily="monospace">C</text>
                <text x="0" y="-18" textAnchor="middle" fill="#94a3b8" fontSize="9.5" fontFamily="monospace">OUTLET</text>
              </g>
            </svg>
          </div>

          {/* ── Visual Comparison Meters (Velocity vs Pressure) ── */}
          <div className="fluid-visual-meters" aria-label="Visual velocity and pressure indicators">
            {/* Inlet Meter */}
            <div className="fluid-meter-card">
              <div className="fluid-meter-card__title">
                <span>POINT A: WIDE PIPE (Ø 50 mm)</span>
                <span className="fluid-meter-card__badge">INLET</span>
              </div>

              <div className="fluid-meter-row">
                <div className="fluid-meter-row__label-row">
                  <span>VELOCITY (V₁)</span>
                  <span>{fluidState.inlet.velocity.toFixed(2)} m/s (LOW)</span>
                </div>
                <div className="fluid-meter-bar-track">
                  <div
                    className="fluid-meter-bar-fill fluid-meter-bar-fill--velocity"
                    style={{ width: `${inletVPct}%` }}
                  />
                </div>
              </div>

              <div className="fluid-meter-row">
                <div className="fluid-meter-row__label-row">
                  <span>STATIC PRESSURE (P₁)</span>
                  <span>{fluidState.inlet.staticPressure.toFixed(1)} kPa (HIGH)</span>
                </div>
                <div className="fluid-meter-bar-track">
                  <div
                    className="fluid-meter-bar-fill fluid-meter-bar-fill--pressure"
                    style={{ width: `${inletPPct}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Throat Meter */}
            <div className="fluid-meter-card">
              <div className="fluid-meter-card__title">
                <span>POINT B: NARROW THROAT (Ø {throatDiameter} mm)</span>
                <span className="fluid-meter-card__badge is-highlight">CONSTRICTION</span>
              </div>

              <div className="fluid-meter-row">
                <div className="fluid-meter-row__label-row">
                  <span>VELOCITY (V₂)</span>
                  <span style={{ color: 'var(--sys-fluid)' }}>
                    {fluidState.throat.velocity.toFixed(2)} m/s (SPEED ×{fluidState.relativeVelocityRatio.toFixed(1)})
                  </span>
                </div>
                <div className="fluid-meter-bar-track">
                  <div
                    className="fluid-meter-bar-fill fluid-meter-bar-fill--velocity"
                    style={{ width: `${throatVPct}%` }}
                  />
                  {/* Target line for Challenge Level 1 */}
                  {isChallengeMode && activeLevel === 1 && (
                    <div
                      className="fluid-meter-target-marker"
                      style={{ left: `${Math.min(100, Math.round((4.5 / maxVScale) * 100))}%` }}
                      title="Target V2 ≥ 4.5 m/s"
                    >
                      <span className="fluid-target-marker-flag">TARGET (4.5)</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="fluid-meter-row">
                <div className="fluid-meter-row__label-row">
                  <span>STATIC PRESSURE (P₂)</span>
                  <span style={{ color: 'var(--color-signal)' }}>
                    {fluidState.throat.staticPressure.toFixed(1)} kPa (DROP ΔP = {fluidState.pressureDropKpa.toFixed(1)} kPa)
                  </span>
                </div>
                <div className="fluid-meter-bar-track">
                  <div
                    className="fluid-meter-bar-fill fluid-meter-bar-fill--pressure"
                    style={{ width: `${throatPPct}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Controls & Telemetry Panel */}
        <div className="fluid-controls-panel">
          <div className="fluid-controls-panel__head">
            <h2 className="fluid-controls-panel__title">FLOW CONTROLS</h2>
            <button
              type="button"
              className="fluid-btn-reset-compact"
              onClick={onReset}
              onPointerEnter={() => setIntent('button', 'RESET')}
              onPointerLeave={clearIntent}
              title="Reset parameters to defaults"
            >
              RESET
            </button>
          </div>

          {/* Start / Pause Flow */}
          <div className="fluid-flow-actions-bar">
            <button
              type="button"
              className={`fluid-btn-flow-toggle${!isFlowRunning ? ' is-paused' : ''}`}
              onClick={() => setIsFlowRunning((prev) => !prev)}
              onPointerEnter={() => setIntent('button', isFlowRunning ? 'PAUSE' : 'START')}
              onPointerLeave={clearIntent}
              aria-label={isFlowRunning ? 'Pause fluid flow' : 'Start fluid flow'}
            >
              {isFlowRunning ? '⏸ PAUSE FLOW' : '▶ START FLOW'}
            </button>
          </div>

          {/* Primary Slider 1: Flow Rate */}
          <div className="fluid-control-group">
            <div className="fluid-control-group__label-row">
              <label htmlFor="fluid-flow-rate" className="fluid-control-group__name">
                FLOW RATE (Q)
              </label>
              <span className="fluid-control-group__value">
                {flowRate} {FLUID_PARAM_LIMITS.flowRate.unit}
              </span>
            </div>

            <input
              id="fluid-flow-rate"
              type="range"
              className="fluid-control-slider"
              min={FLUID_PARAM_LIMITS.flowRate.min}
              max={FLUID_PARAM_LIMITS.flowRate.max}
              step={FLUID_PARAM_LIMITS.flowRate.step}
              value={flowRate}
              onChange={(e) => onParamChange(Number(e.target.value), throatDiameter)}
              aria-label={`Flow rate in ${FLUID_PARAM_LIMITS.flowRate.unit}`}
            />

            <div className="fluid-control-group__scale">
              <span>{FLUID_PARAM_LIMITS.flowRate.min} L/min (Slow)</span>
              <span>{FLUID_PARAM_LIMITS.flowRate.max} L/min (Fast)</span>
            </div>
          </div>

          {/* Primary Slider 2: Throat Size */}
          <div className="fluid-control-group">
            <div className="fluid-control-group__label-row">
              <label htmlFor="fluid-throat-diameter" className="fluid-control-group__name">
                THROAT SIZE (Ø)
              </label>
              <span className="fluid-control-group__value">
                {throatDiameter} {FLUID_PARAM_LIMITS.throatDiameter.unit}
              </span>
            </div>

            <input
              id="fluid-throat-diameter"
              type="range"
              className="fluid-control-slider"
              min={FLUID_PARAM_LIMITS.throatDiameter.min}
              max={FLUID_PARAM_LIMITS.throatDiameter.max}
              step={FLUID_PARAM_LIMITS.throatDiameter.step}
              value={throatDiameter}
              onChange={(e) => onParamChange(flowRate, Number(e.target.value))}
              aria-label={`Throat diameter in ${FLUID_PARAM_LIMITS.throatDiameter.unit}`}
            />

            <div className="fluid-control-group__scale">
              <span>{FLUID_PARAM_LIMITS.throatDiameter.min} mm (Narrow / Fast)</span>
              <span>{FLUID_PARAM_LIMITS.throatDiameter.max} mm (Wide / Mild)</span>
            </div>
          </div>

          {/* Telemetry Quick Status Grid */}
          <div className="fluid-telemetry-grid">
            <div className="fluid-telemetry-cell">
              <span className="fluid-telemetry-cell__label">THROAT VELOCITY</span>
              <span className="fluid-telemetry-cell__value is-accent">
                {fluidState.throat.velocity.toFixed(2)} m/s
              </span>
            </div>

            <div className="fluid-telemetry-cell">
              <span className="fluid-telemetry-cell__label">PRESSURE DROP (ΔP)</span>
              <span className="fluid-telemetry-cell__value is-warn">
                {fluidState.pressureDropKpa.toFixed(2)} kPa
              </span>
            </div>

            <div className="fluid-telemetry-cell">
              <span className="fluid-telemetry-cell__label">MANOMETER (Δh)</span>
              <span className="fluid-telemetry-cell__value">
                {fluidState.manometerDeltaH.toFixed(0)} mm
              </span>
            </div>

            <div className="fluid-telemetry-cell">
              <span className="fluid-telemetry-cell__label">SPEED RATIO</span>
              <span className="fluid-telemetry-cell__value">
                {fluidState.relativeVelocityRatio.toFixed(1)}×
              </span>
            </div>
          </div>

          {/* Contextual guidance in Explore Mode vs Challenge Mode */}
          {!isChallengeMode ? (
            <div className="fluid-try-this-card">
              <span className="fluid-try-this-card__tag">TRY THIS</span>
              <p className="fluid-try-this-card__prompt">
                Slide <strong>THROAT SIZE</strong> down to 18 mm. Notice how the water particles rush faster through the center, while the liquid in the manometer visibly shifts!
              </p>
              <button
                type="button"
                className="fluid-try-mission-link"
                onClick={() => onSwitchMode?.('challenge')}
              >
                Ready for a mission? Start Challenge Mode →
              </button>
            </div>
          ) : (
            <div className="fluid-challenge-live-feedback">
              <div className="fluid-challenge-live-feedback__header">
                <span className="fluid-challenge-live-feedback__tag">LIVE MISSION FEEDBACK</span>
              </div>
              <p className="fluid-challenge-live-feedback__msg">
                {challengeEval.feedbackMessage}
              </p>
              {challengeEval.engineeringInsight && (
                <p className="fluid-challenge-live-feedback__insight">
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
