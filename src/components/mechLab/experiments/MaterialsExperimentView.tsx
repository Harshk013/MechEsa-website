// src/components/mechLab/experiments/MaterialsExperimentView.tsx
// Interactive Universal Testing Machine (UTM) Tensile Test Canvas & Dimension Controls

import { useState, useMemo } from 'react'
import { usePointer } from '../../interaction/PointerProvider'
import {
  calculateMaterialsAnalysis,
  type MaterialId,
  SPECIMEN_LIMITS,
  MATERIALS_DATABASE,
  type MaterialsAnalysis,
} from './materialsModel'
import {
  MATERIALS_FLAGSHIP_CHALLENGE,
  MATERIALS_LEVELS,
} from './materialsChallenge'
import './materials.css'

export interface MaterialsExperimentViewProps {
  appliedLoadKn: number
  gaugeWidthMm: number
  gaugeThicknessMm: number
  gaugeLengthMm: number
  materialId: MaterialId
  onParamChange: (
    loadKn: number,
    widthMm: number,
    thicknessMm: number,
    lengthMm: number,
    material: MaterialId
  ) => void
  onReset: () => void
  activeLevel?: number
  isChallengeMode?: boolean
  onSwitchMode?: (mode: 'explore' | 'challenge') => void
}

export function MaterialsExperimentView({
  appliedLoadKn,
  gaugeWidthMm,
  gaugeThicknessMm,
  gaugeLengthMm,
  materialId,
  onParamChange,
  onReset,
  activeLevel = 1,
  isChallengeMode = false,
}: MaterialsExperimentViewProps) {
  const { setIntent, clearIntent } = usePointer()

  const [visualExaggeration, setVisualExaggeration] = useState<number>(10) // 1x, 10x, 25x elongation scaling

  // Calculate full physical tensile analysis
  const analysis: MaterialsAnalysis = useMemo(
    () =>
      calculateMaterialsAnalysis({
        appliedLoadKn,
        gaugeWidthMm,
        gaugeThicknessMm,
        gaugeLengthMm,
        materialId,
      }),
    [appliedLoadKn, gaugeWidthMm, gaugeThicknessMm, gaugeLengthMm, materialId]
  )

  // Challenge evaluation
  const challengeEval = useMemo(
    () =>
      MATERIALS_FLAGSHIP_CHALLENGE.evaluate(
        {
          appliedLoadKn,
          gaugeWidthMm,
          gaugeThicknessMm,
          gaugeLengthMm,
          materialId,
        },
        null,
        activeLevel
      ),
    [appliedLoadKn, gaugeWidthMm, gaugeThicknessMm, gaugeLengthMm, materialId, activeLevel]
  )

  const currentLevelInfo = MATERIALS_LEVELS[activeLevel - 1] || MATERIALS_LEVELS[0]

  const applyPreset = (
    f: number,
    w: number,
    t: number,
    l: number,
    mat: MaterialId
  ) => {
    onParamChange(f, w, t, l, mat)
  }

  // ── UTM Visual Geometry Calculations ──────────────────────────────
  // Canvas coordinate space: 820 × 420
  // Specimen center at X = 250, bottom grip fixed at Y = 320
  const specCenterX = 250
  const bottomGripY = 320

  // Visual gauge length maps from 50..250 mm -> 110..220 px
  const baseGaugePx = 110 + ((gaugeLengthMm - 50) / (250 - 50)) * 110

  // Elongation visual stretch in pixels
  // In reality elastic stretch is fractions of a millimeter, so scale by visualExaggeration
  const visualElongationPx = Math.min(
    65,
    Math.max(0, analysis.elongationMm * visualExaggeration * 4)
  )

  const currentGaugePx = baseGaugePx + visualElongationPx

  // Top grip Y position moves up with elongation
  const topGripY = bottomGripY - currentGaugePx - 60 // 60px accounts for shoulder transitions

  // Visual gauge width in pixels (10..40 mm -> 14..36 px)
  const baseWidthPx = 14 + ((gaugeWidthMm - 10) / (40 - 10)) * 22

  // Poisson contraction & Necking
  // Elastic Poisson ratio ~ 0.3; if plastic yield occurs, necking concentrates at center
  const poissonFactor = analysis.isYielded ? 0.35 : 0.15 * analysis.material.poissonsRatio
  const neckingPx = Math.min(baseWidthPx * 0.45, visualElongationPx * poissonFactor)
  const contractedWidthPx = Math.max(8, baseWidthPx - neckingPx)

  // Shoulder width is wider than gauge section (standard ASTM dogbone)
  const shoulderWidthPx = Math.max(50, baseWidthPx + 32)
  const shoulderHalfW = shoulderWidthPx / 2
  const gaugeHalfW = contractedWidthPx / 2

  // Specimen dogbone outline path coordinates
  // Bottom shoulder transition
  const bottomTransY = bottomGripY - 25
  const topTransY = topGripY + 25

  // Generate SVG path for the dogbone tensile specimen
  const specimenPath = `
    M ${specCenterX - shoulderHalfW} ${bottomGripY}
    L ${specCenterX + shoulderHalfW} ${bottomGripY}
    L ${specCenterX + shoulderHalfW} ${bottomTransY}
    Q ${specCenterX + gaugeHalfW} ${bottomTransY - 10}, ${specCenterX + gaugeHalfW} ${bottomTransY - 20}
    L ${specCenterX + gaugeHalfW} ${topTransY + 20}
    Q ${specCenterX + gaugeHalfW} ${topTransY + 10}, ${specCenterX + shoulderHalfW} ${topTransY}
    L ${specCenterX + shoulderHalfW} ${topGripY}
    L ${specCenterX - shoulderHalfW} ${topGripY}
    L ${specCenterX - shoulderHalfW} ${topTransY}
    Q ${specCenterX - gaugeHalfW} ${topTransY + 10}, ${specCenterX - gaugeHalfW} ${topTransY + 20}
    L ${specCenterX - gaugeHalfW} ${bottomTransY - 20}
    Q ${specCenterX - gaugeHalfW} ${bottomTransY - 10}, ${specCenterX - shoulderHalfW} ${bottomTransY}
    Z
  `

  // Stress-dependent color indicator
  const stressRatio = analysis.normalStressMpa / analysis.material.yieldStrengthMpa
  let specimenColor = analysis.material.colorHex
  let stressGlowColor = 'rgba(56, 189, 248, 0.4)'

  if (analysis.isRuptured) {
    specimenColor = '#ef4444'
    stressGlowColor = 'rgba(239, 68, 68, 0.8)'
  } else if (analysis.isYielded) {
    specimenColor = '#f59e0b'
    stressGlowColor = 'rgba(245, 158, 11, 0.6)'
  } else if (stressRatio > 0.8) {
    specimenColor = '#eab308'
    stressGlowColor = 'rgba(234, 179, 8, 0.4)'
  } else {
    stressGlowColor = 'rgba(56, 189, 248, 0.3)'
  }

  // Load vector arrow length
  const loadArrowLength = Math.min(55, 20 + (appliedLoadKn / 80) * 35)

  return (
    <div className="materials-container">
      {/* ── Mode-Specific Upper Deck ─────────────────────────────── */}
      {isChallengeMode ? (
        <div className="materials-challenge-mission-strip" aria-label="Materials Design Mission Briefing">
          <div className="materials-mission-strip-content">
            <span className="materials-mission-badge">
              MISSION // LEVEL 0{activeLevel} OF 03: {currentLevelInfo.levelTitle.toUpperCase()}
            </span>
            <span className="materials-mission-strip-goal">
              GOAL: <strong>{currentLevelInfo.targetCriteria}</strong>
            </span>
          </div>
          <div
            className={`materials-mission-strip-status ${
              challengeEval.isPassed
                ? 'is-passed'
                : analysis.isYielded
                ? 'is-failed'
                : 'is-pending'
            }`}
          >
            {challengeEval.isPassed ? 'TARGET REACHED ✓' : challengeEval.status}
          </div>
        </div>
      ) : (
        /* Explore Mode Presets Bar */
        <div className="materials-explore-presets-bar" aria-label="Materials engineering presets">
          <div className="materials-explore-presets-label">
            <span className="materials-explore-dot" aria-hidden="true" />
            <span>TEST PRESETS:</span>
          </div>
          <div className="materials-presets-list">
            <button
              type="button"
              className="materials-preset-btn"
              onClick={() => applyPreset(25, 25, 12, 120, 'structural_steel')}
              title="Heavy industrial structural tie-rod"
            >
              🏗 HEAVY STEEL TIE-ROD
            </button>
            <button
              type="button"
              className="materials-preset-btn"
              onClick={() => applyPreset(35, 18, 8, 90, 'titanium_ti6al4v')}
              title="Extreme aerospace Grade 5 titanium fitting"
            >
              ✈ TITANIUM AEROSPACE SPAR
            </button>
            <button
              type="button"
              className="materials-preset-btn"
              onClick={() => applyPreset(30, 20, 8, 100, 'carbon_composite')}
              title="High-modulus carbon fiber strut"
            >
              🚀 CFRP COMPOSITE STRUT
            </button>
            <button
              type="button"
              className="materials-preset-btn"
              onClick={() => applyPreset(6, 24, 14, 100, 'engineering_polymer')}
              title="Compliant thermoplastic with large elastic elongation"
            >
              🧪 COMPLIANT NYLON LINK
            </button>
            <button
              type="button"
              className="materials-preset-btn materials-preset-btn--danger"
              onClick={() => applyPreset(70, 12, 4, 120, 'structural_steel')}
              title="Overload condition causing plastic yielding and necking rupture"
            >
              💥 OVERLOAD RUPTURE TEST
            </button>
          </div>
        </div>
      )}

      {/* ── Main Hero Grid: UTM Stage on Left, Controls on Right ── */}
      <div className="materials-hero-grid">
        {/* Left Column: Interactive UTM Tensile Stage Canvas */}
        <div className="materials-stage-card">
          <div className="materials-stage-card__header">
            <div className="materials-stage-title-group">
              <span className="materials-stage-badge">INSTRON / ASTM E8 UTM RIG</span>
              <h2 className="materials-stage-heading">UNIVERSAL TENSILE TEST RIG</h2>
            </div>

            <div className="materials-stage-controls-bar">
              <span className="materials-exaggeration-label">ELONGATION VISUAL:</span>
              <button
                type="button"
                className={`materials-scale-btn ${visualExaggeration === 1 ? 'is-active' : ''}`}
                onClick={() => setVisualExaggeration(1)}
              >
                1× REAL
              </button>
              <button
                type="button"
                className={`materials-scale-btn ${visualExaggeration === 10 ? 'is-active' : ''}`}
                onClick={() => setVisualExaggeration(10)}
              >
                10× ZOOM
              </button>
              <button
                type="button"
                className={`materials-scale-btn ${visualExaggeration === 25 ? 'is-active' : ''}`}
                onClick={() => setVisualExaggeration(25)}
              >
                25× EXTR
              </button>
            </div>
          </div>

          <div className="materials-canvas-wrapper" role="img" aria-label="Universal Tensile Testing Machine showing dogbone specimen under load">
            <svg
              className="materials-utm-svg"
              viewBox="0 0 520 380"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                {/* Metallic Frame Gradient */}
                <linearGradient id="frameGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#1e293b" />
                  <stop offset="50%" stopColor="#475569" />
                  <stop offset="100%" stopColor="#1e293b" />
                </linearGradient>

                {/* Guide Columns Gradient */}
                <linearGradient id="columnGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#334155" />
                  <stop offset="35%" stopColor="#94a3b8" />
                  <stop offset="65%" stopColor="#cbd5e1" />
                  <stop offset="100%" stopColor="#1e293b" />
                </linearGradient>

                {/* Hardened Wedge Grip Steel */}
                <linearGradient id="gripGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0f172a" />
                  <stop offset="50%" stopColor="#334155" />
                  <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>

                {/* Specimen Stress Gradient */}
                <linearGradient id="specimenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={specimenColor} stopOpacity="0.9" />
                  <stop offset="50%" stopColor={specimenColor} stopOpacity="1" />
                  <stop offset="100%" stopColor={specimenColor} stopOpacity="0.9" />
                </linearGradient>
              </defs>

              {/* Background Grid Pattern */}
              <g className="utm-grid-lines" opacity="0.15">
                {[50, 100, 150, 200, 250, 300, 350].map((y) => (
                  <line key={`h-${y}`} x1="40" y1={y} x2="480" y2={y} stroke="#64748b" strokeWidth="1" strokeDasharray="3 3" />
                ))}
                {[80, 160, 240, 320, 400, 480].map((x) => (
                  <line key={`v-${x}`} x1={x} y1="30" x2={x} y2="360" stroke="#64748b" strokeWidth="1" strokeDasharray="3 3" />
                ))}
              </g>

              {/* Left & Right UTM Vertical Structural Columns */}
              <rect x="70" y="30" width="24" height="320" rx="4" fill="url(#columnGrad)" stroke="#0f172a" strokeWidth="1.5" />
              <rect x="426" y="30" width="24" height="320" rx="4" fill="url(#columnGrad)" stroke="#0f172a" strokeWidth="1.5" />

              {/* Base Platen */}
              <rect x="50" y="340" width="420" height="24" rx="2" fill="url(#frameGrad)" stroke="#0f172a" strokeWidth="2" />
              <line x1="50" y1="344" x2="470" y2="344" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />

              {/* Stationary Top Crosshead Beam */}
              <rect x="50" y="24" width="420" height="26" rx="2" fill="url(#frameGrad)" stroke="#0f172a" strokeWidth="2" />

              {/* Moving Crosshead (Displaces with tensile stroke) */}
              <g transform={`translate(0, ${topGripY - 45})`}>
                <rect x="65" y="0" width="390" height="28" rx="3" fill="url(#frameGrad)" stroke="#38bdf8" strokeWidth="1" />
                {/* Crosshead linear guide collars */}
                <rect x="66" y="2" width="32" height="24" fill="#0f172a" rx="1" opacity="0.6" />
                <rect x="422" y="2" width="32" height="24" fill="#0f172a" rx="1" opacity="0.6" />
                <text x="260" y="18" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle" letterSpacing="0.1em">
                  MOVING HYDRAULIC CROSSHEAD
                </text>
              </g>

              {/* Top Moving Wedge Grip Assembly */}
              <g transform={`translate(${specCenterX}, ${topGripY - 16})`}>
                <rect x="-42" y="0" width="84" height="30" rx="3" fill="url(#gripGrad)" stroke="#64748b" strokeWidth="1.5" />
                {/* Wedge Teeth Marks */}
                <line x1="-30" y1="22" x2="30" y2="22" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                <line x1="-25" y1="26" x2="25" y2="26" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                <text x="0" y="-6" fill="#38bdf8" fontSize="8" fontFamily="monospace" fontWeight="700" textAnchor="middle">
                  UPPER GRIP (MOVING)
                </text>

                {/* Upward Tensile Load Arrow Vectors */}
                <g transform="translate(0, -18)">
                  <line x1="0" y1="0" x2="0" y2={-loadArrowLength} stroke="#ef4444" strokeWidth="3" />
                  <polygon points={`0,${-loadArrowLength - 8} -5,${-loadArrowLength} 5,${-loadArrowLength}`} fill="#ef4444" />
                  <rect x="-38" y={-loadArrowLength - 22} width="76" height="15" rx="2" fill="#0f172a" stroke="#ef4444" strokeWidth="1" />
                  <text x="0" y={-loadArrowLength - 11} fill="#ef4444" fontSize="9" fontFamily="monospace" fontWeight="800" textAnchor="middle">
                    {appliedLoadKn.toFixed(1)} kN ↑
                  </text>
                </g>
              </g>

              {/* Lower Fixed Grip Assembly */}
              <g transform={`translate(${specCenterX}, ${bottomGripY})`}>
                <rect x="-42" y="0" width="84" height="32" rx="3" fill="url(#gripGrad)" stroke="#64748b" strokeWidth="1.5" />
                <line x1="-30" y1="8" x2="30" y2="8" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                <line x1="-25" y1="12" x2="25" y2="12" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                <text x="0" y="24" fill="#64748b" fontSize="8" fontFamily="monospace" fontWeight="700" textAnchor="middle">
                  LOWER GRIP (FIXED BASE)
                </text>
              </g>

              {/* The Tensile Dogbone Specimen */}
              <g filter={`drop-shadow(0px 0px 8px ${stressGlowColor})`}>
                <path
                  d={specimenPath}
                  fill="url(#specimenGrad)"
                  stroke={analysis.isYielded ? '#f59e0b' : '#334155'}
                  strokeWidth="1.5"
                />

                {/* If ruptured, draw shear crack line */}
                {analysis.isRuptured && (
                  <path
                    d={`
                      M ${specCenterX - gaugeHalfW - 4} ${(topTransY + bottomTransY) / 2 - 4}
                      L ${specCenterX} ${(topTransY + bottomTransY) / 2 + 3}
                      L ${specCenterX + gaugeHalfW + 4} ${(topTransY + bottomTransY) / 2 - 2}
                    `}
                    stroke="#ef4444"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                )}
              </g>

              {/* Optical Clip-On Extensometer Readout HUD */}
              <g transform={`translate(${specCenterX + gaugeHalfW + 18}, ${(topTransY + bottomTransY) / 2 - 28})`}>
                {/* Extensometer arms clipped to gauge markers */}
                <line x1="-18" y1="6" x2="-2" y2="16" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="2 2" />
                <line x1="-18" y1="52" x2="-2" y2="40" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="2 2" />

                {/* Readout Card */}
                <rect x="0" y="0" width="140" height="56" rx="4" fill="rgba(15, 23, 42, 0.95)" stroke="#38bdf8" strokeWidth="1.2" />
                <text x="10" y="14" fill="#94a3b8" fontSize="8" fontFamily="monospace" fontWeight="700">
                  EXTENSOMETER // LIVE
                </text>
                <text x="10" y="30" fill="#38bdf8" fontSize="12" fontFamily="monospace" fontWeight="800">
                  ΔL: +{analysis.elongationMm.toFixed(3)} mm
                </text>
                <text x="10" y="46" fill={analysis.isYielded ? '#f59e0b' : '#94a3b8'} fontSize="9.5" fontFamily="monospace">
                  ε: {analysis.strainPercent.toFixed(2)}% ({analysis.statusRating})
                </text>
              </g>

              {/* Gauge Dimension Annotations on Left */}
              <g transform={`translate(${specCenterX - shoulderHalfW - 32}, 0)`}>
                {/* Gauge length dimension line */}
                <line x1="0" y1={topTransY} x2="0" y2={bottomTransY} stroke="#64748b" strokeWidth="1.2" />
                <line x1="-5" y1={topTransY} x2="5" y2={topTransY} stroke="#64748b" strokeWidth="1.2" />
                <line x1="-5" y1={bottomTransY} x2="5" y2={bottomTransY} stroke="#64748b" strokeWidth="1.2" />
                <text
                  x="-8"
                  y={(topTransY + bottomTransY) / 2}
                  fill="#94a3b8"
                  fontSize="8.5"
                  fontFamily="monospace"
                  textAnchor="end"
                  dominantBaseline="middle"
                >
                  L₀ = {gaugeLengthMm} mm
                </text>
              </g>
            </svg>
          </div>

          {/* Quick HUD Metrics Strip under Canvas */}
          <div className="materials-stage-hud">
            <div className="materials-hud-cell">
              <span className="materials-hud-cell__label">TENSILE STRESS (σ)</span>
              <span className="materials-hud-cell__val">
                {analysis.normalStressMpa.toFixed(1)} <small>MPa</small>
              </span>
            </div>
            <div className="materials-hud-cell">
              <span className="materials-hud-cell__label">ELASTIC ELONGATION (ΔL)</span>
              <span className="materials-hud-cell__val">
                {analysis.elongationMm.toFixed(3)} <small>mm</small>
              </span>
            </div>
            <div className="materials-hud-cell">
              <span className="materials-hud-cell__label">FACTOR OF SAFETY</span>
              <span
                className={`materials-hud-cell__val ${
                  analysis.factorOfSafety < 1.0
                    ? 'materials-hud-cell__val--fail'
                    : analysis.factorOfSafety < 1.5
                    ? 'materials-hud-cell__val--warn'
                    : 'materials-hud-cell__val--ok'
                }`}
              >
                {analysis.factorOfSafety.toFixed(2)}
              </span>
            </div>
            <div className="materials-hud-cell">
              <span className="materials-hud-cell__label">SPECIMEN STATUS</span>
              <span
                className={`materials-hud-status-tag ${
                  analysis.isRuptured
                    ? 'materials-hud-status-tag--rupture'
                    : analysis.isYielded
                    ? 'materials-hud-status-tag--yield'
                    : 'materials-hud-status-tag--safe'
                }`}
              >
                {analysis.statusLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Specimen & Tensile Test Controls */}
        <div className="materials-controls-card">
          <div className="materials-controls-head">
            <h3 className="materials-controls-title">TENSILE TEST SETUP</h3>
            <button
              type="button"
              className="materials-reset-btn"
              onClick={onReset}
              onPointerEnter={() => setIntent('button', 'RESET')}
              onPointerLeave={clearIntent}
            >
              ↺ RESET DEFAULT
            </button>
          </div>

          {/* Material Selection */}
          <div className="materials-control-group">
            <label className="materials-control-label">
              <span>SELECTED ALLOY / MATERIAL</span>
              <span className="materials-control-value">{analysis.material.name}</span>
            </label>
            <div className="materials-picker-grid">
              {(Object.keys(MATERIALS_DATABASE) as MaterialId[]).map((matKey) => {
                const mat = MATERIALS_DATABASE[matKey]
                const isSelected = materialId === matKey
                return (
                  <button
                    key={matKey}
                    type="button"
                    className={`materials-picker-btn ${isSelected ? 'is-selected' : ''}`}
                    onClick={() =>
                      onParamChange(
                        appliedLoadKn,
                        gaugeWidthMm,
                        gaugeThicknessMm,
                        gaugeLengthMm,
                        matKey
                      )
                    }
                  >
                    <div className="materials-picker-btn__top">
                      <span className="materials-picker-btn__name">{mat.shortName}</span>
                      <span className="materials-picker-btn__modulus">E: {mat.youngsModulusGpa} GPa</span>
                    </div>
                    <div className="materials-picker-btn__sub">
                      <span>σ_y: {mat.yieldStrengthMpa} MPa</span>
                      <span>ρ: {mat.densityKgM3} kg/m³</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Applied Tensile Load Slider */}
          <div className="materials-control-group">
            <div className="materials-control-header">
              <label htmlFor="mat-load-slider" className="materials-control-label">
                APPLIED TENSILE LOAD (F)
              </label>
              <span className="materials-control-value">{appliedLoadKn.toFixed(1)} kN</span>
            </div>
            <input
              id="mat-load-slider"
              type="range"
              min={SPECIMEN_LIMITS.appliedLoadKn.min}
              max={SPECIMEN_LIMITS.appliedLoadKn.max}
              step={SPECIMEN_LIMITS.appliedLoadKn.step}
              value={appliedLoadKn}
              onChange={(e) =>
                onParamChange(
                  parseFloat(e.target.value),
                  gaugeWidthMm,
                  gaugeThicknessMm,
                  gaugeLengthMm,
                  materialId
                )
              }
              className="materials-slider"
            />
            <div className="materials-slider-bounds">
              <span>{SPECIMEN_LIMITS.appliedLoadKn.min} kN</span>
              <span className="materials-slider-hint">ASTM E8 Pull Force</span>
              <span>{SPECIMEN_LIMITS.appliedLoadKn.max} kN</span>
            </div>
          </div>

          {/* Cross Section Width Slider */}
          <div className="materials-control-group">
            <div className="materials-control-header">
              <label htmlFor="mat-width-slider" className="materials-control-label">
                GAUGE WIDTH (w)
              </label>
              <span className="materials-control-value">{gaugeWidthMm} mm</span>
            </div>
            <input
              id="mat-width-slider"
              type="range"
              min={SPECIMEN_LIMITS.gaugeWidthMm.min}
              max={SPECIMEN_LIMITS.gaugeWidthMm.max}
              step={SPECIMEN_LIMITS.gaugeWidthMm.step}
              value={gaugeWidthMm}
              onChange={(e) =>
                onParamChange(
                  appliedLoadKn,
                  parseFloat(e.target.value),
                  gaugeThicknessMm,
                  gaugeLengthMm,
                  materialId
                )
              }
              className="materials-slider"
            />
            <div className="materials-slider-bounds">
              <span>{SPECIMEN_LIMITS.gaugeWidthMm.min} mm</span>
              <span className="materials-slider-hint">Cross-Section Width</span>
              <span>{SPECIMEN_LIMITS.gaugeWidthMm.max} mm</span>
            </div>
          </div>

          {/* Cross Section Thickness Slider */}
          <div className="materials-control-group">
            <div className="materials-control-header">
              <label htmlFor="mat-thick-slider" className="materials-control-label">
                GAUGE THICKNESS (t)
              </label>
              <span className="materials-control-value">{gaugeThicknessMm.toFixed(1)} mm</span>
            </div>
            <input
              id="mat-thick-slider"
              type="range"
              min={SPECIMEN_LIMITS.gaugeThicknessMm.min}
              max={SPECIMEN_LIMITS.gaugeThicknessMm.max}
              step={SPECIMEN_LIMITS.gaugeThicknessMm.step}
              value={gaugeThicknessMm}
              onChange={(e) =>
                onParamChange(
                  appliedLoadKn,
                  gaugeWidthMm,
                  parseFloat(e.target.value),
                  gaugeLengthMm,
                  materialId
                )
              }
              className="materials-slider"
            />
            <div className="materials-slider-bounds">
              <span>{SPECIMEN_LIMITS.gaugeThicknessMm.min} mm</span>
              <span className="materials-slider-hint">Plate Thickness</span>
              <span>{SPECIMEN_LIMITS.gaugeThicknessMm.max} mm</span>
            </div>
          </div>

          {/* Gauge Length Slider */}
          <div className="materials-control-group">
            <div className="materials-control-header">
              <label htmlFor="mat-length-slider" className="materials-control-label">
                GAUGE LENGTH (L₀)
              </label>
              <span className="materials-control-value">{gaugeLengthMm} mm</span>
            </div>
            <input
              id="mat-length-slider"
              type="range"
              min={SPECIMEN_LIMITS.gaugeLengthMm.min}
              max={SPECIMEN_LIMITS.gaugeLengthMm.max}
              step={SPECIMEN_LIMITS.gaugeLengthMm.step}
              value={gaugeLengthMm}
              onChange={(e) =>
                onParamChange(
                  appliedLoadKn,
                  gaugeWidthMm,
                  gaugeThicknessMm,
                  parseFloat(e.target.value),
                  materialId
                )
              }
              className="materials-slider"
            />
            <div className="materials-slider-bounds">
              <span>{SPECIMEN_LIMITS.gaugeLengthMm.min} mm</span>
              <span className="materials-slider-hint">Extensometer Span</span>
              <span>{SPECIMEN_LIMITS.gaugeLengthMm.max} mm</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
