// src/components/mechLab/experiments/DesignExperimentView.tsx
// Flagship CAD & Structural Beam Design Experience: Isometric 3D beam deformation, stress contour gradient, cross-section inspector, and material selector

import { useState, useMemo } from 'react'
import {
  calculateBeamAnalysis,
  DESIGN_MATERIALS,
  BEAM_LIMITS,
  type BeamParams,
  type MaterialId,
  type BeamAnalysis,
} from './designModel'
import {
  DESIGN_LEVELS,
  DESIGN_FLAGSHIP_CHALLENGE,
} from './designChallenge'
import { usePointer } from '../../interaction/PointerProvider'
import './design.css'

interface DesignExperimentViewProps {
  lengthM: number
  widthMm: number
  heightMm: number
  loadKn: number
  materialId: MaterialId
  onParamChange: (lengthM: number, widthMm: number, heightMm: number, loadKn: number, materialId: MaterialId) => void
  onReset: () => void
  activeLevel?: number
  isChallengeMode?: boolean
  onSwitchMode?: (mode: 'explore' | 'challenge') => void
  onLevelChange?: (level: number) => void
}

export function DesignExperimentView({
  lengthM,
  widthMm,
  heightMm,
  loadKn,
  materialId,
  onParamChange,
  onReset,
  activeLevel = 1,
  isChallengeMode = false,
  onSwitchMode,
}: DesignExperimentViewProps) {
  const { setIntent, clearIntent } = usePointer()

  const [deflectionScale, setDeflectionScale] = useState<number>(5) // 1x, 5x, 10x visual exaggeration

  // Calculate full structural beam analysis
  const analysis: BeamAnalysis = useMemo(
    () =>
      calculateBeamAnalysis({
        lengthM,
        widthMm,
        heightMm,
        loadKn,
        materialId,
      }),
    [lengthM, widthMm, heightMm, loadKn, materialId]
  )

  // Challenge evaluation
  const challengeEval = useMemo(
    () =>
      DESIGN_FLAGSHIP_CHALLENGE.evaluate(
        { lengthM, widthMm, heightMm, loadKn, materialId },
        null,
        activeLevel
      ),
    [lengthM, widthMm, heightMm, loadKn, materialId, activeLevel]
  )

  const currentLevelInfo = DESIGN_LEVELS[activeLevel - 1] || DESIGN_LEVELS[0]

  // Handlers for sliders and materials
  const handleSliderChange = (field: keyof BeamParams, val: number) => {
    const updated: BeamParams = {
      lengthM,
      widthMm,
      heightMm,
      loadKn,
      materialId,
      [field]: val,
    }
    onParamChange(updated.lengthM, updated.widthMm, updated.heightMm, updated.loadKn, updated.materialId)
  }

  const handleMaterialSelect = (matId: MaterialId) => {
    onParamChange(lengthM, widthMm, heightMm, loadKn, matId)
  }

  const applyPreset = (l: number, w: number, h: number, f: number, mat: MaterialId) => {
    onParamChange(l, w, h, f, mat)
  }

  // ── Isometric CAD Projection Calculations ───────────────────
  // Canvas coordinate space: 820 × 380
  // Wall root at (120, 150)
  const rootX = 120
  const rootY = 150

  // Pixel length scales with beam length (1.0m -> 200px, 4.0m -> 560px)
  const beamPixelLength = 160 + ((lengthM - 1.0) / (4.0 - 1.0)) * 380

  // Visual width and height scale with cross-section
  const beamPixelHeight = Math.round(24 + ((heightMm - 60) / (300 - 60)) * 48)
  const beamPixelWidth = Math.round(18 + ((widthMm - 40) / (200 - 40)) * 36)

  // Isometric oblique projection angles (x: horizontal span, y: vertical height, z: depth)
  // Depth vector: dx = +0.707 * depth, dy = -0.4 * depth
  const depthDx = Math.round(beamPixelWidth * 0.75)
  const depthDy = Math.round(beamPixelWidth * -0.42)

  // Max tip visual sag based on deflection and exaggeration scale
  // Cap visual sag so it doesn't leave the canvas
  const visualTipSag = Math.min(110, Math.round(analysis.tipDeflectionMm * 1.8 * (deflectionScale / 5)))

  // Generate curved points for top, bottom, and side faces of the bent cantilever
  const numSegments = 16
  const topFrontPts: { x: number; y: number }[] = []
  const bottomFrontPts: { x: number; y: number }[] = []
  const topBackPts: { x: number; y: number }[] = []

  for (let i = 0; i <= numSegments; i++) {
    const frac = i / numSegments
    const x = rootX + frac * beamPixelLength
    // Cubic polynomial cantilever deflection curve: y(x) = y_max * (3*frac^2 - frac^3) / 2
    const sag = visualTipSag * ((3 * Math.pow(frac, 2) - Math.pow(frac, 3)) / 2)

    topFrontPts.push({ x, y: rootY + sag })
    bottomFrontPts.push({ x, y: rootY + beamPixelHeight + sag })
    topBackPts.push({ x: x + depthDx, y: rootY + depthDy + sag })
  }

  // Path strings
  const frontFacePath = [
    `M ${topFrontPts[0].x} ${topFrontPts[0].y}`,
    ...topFrontPts.slice(1).map((p) => `L ${p.x} ${p.y}`),
    `L ${bottomFrontPts[numSegments].x} ${bottomFrontPts[numSegments].y}`,
    ...[...bottomFrontPts].reverse().slice(1).map((p) => `L ${p.x} ${p.y}`),
    'Z',
  ].join(' ')

  const topFacePath = [
    `M ${topFrontPts[0].x} ${topFrontPts[0].y}`,
    ...topFrontPts.slice(1).map((p) => `L ${p.x} ${p.y}`),
    `L ${topBackPts[numSegments].x} ${topBackPts[numSegments].y}`,
    ...[...topBackPts].reverse().slice(1).map((p) => `L ${p.x} ${p.y}`),
    'Z',
  ].join(' ')

  // End cap (free tip face)
  const endCapPath = [
    `M ${topFrontPts[numSegments].x} ${topFrontPts[numSegments].y}`,
    `L ${topBackPts[numSegments].x} ${topBackPts[numSegments].y}`,
    `L ${topBackPts[numSegments].x} ${topBackPts[numSegments].y + beamPixelHeight}`,
    `L ${bottomFrontPts[numSegments].x} ${bottomFrontPts[numSegments].y}`,
    'Z',
  ].join(' ')

  // Tip load arrow coordinates
  const tipX = topFrontPts[numSegments].x
  const tipY = topFrontPts[numSegments].y
  const loadArrowLen = Math.min(75, Math.max(30, (loadKn / 50) * 75))

  return (
    <div className="design-container">
      {/* ── Mode-Specific Upper Deck ─────────────────────────────── */}
      {isChallengeMode ? (
        <div className="design-challenge-mission-strip" aria-label="Structural Design Mission Briefing">
          <div className="design-mission-strip-content">
            <span className="design-mission-badge">
              MISSION // LEVEL 0{activeLevel} OF 03: {currentLevelInfo.levelTitle.toUpperCase()}
            </span>
            <span className="design-mission-strip-goal">
              GOAL: <strong>{currentLevelInfo.targetCriteria}</strong>
            </span>
          </div>
          <div
            className={`design-mission-strip-status ${
              challengeEval.isPassed
                ? 'is-passed'
                : analysis.isFailed
                ? 'is-failed'
                : 'is-pending'
            }`}
          >
            {challengeEval.isPassed ? 'TARGET REACHED ✓' : challengeEval.status}
          </div>
        </div>
      ) : (
        /* Explore Mode Presets Bar */
        <div className="design-explore-presets-bar" aria-label="CAD design presets">
          <div className="design-explore-presets-label">
            <span className="design-explore-dot" aria-hidden="true" />
            <span>DESIGN PRESETS:</span>
          </div>
          <div className="design-presets-list">
            <button
              type="button"
              className="design-preset-btn"
              onClick={() => applyPreset(2.5, 60, 240, 15, 'steel')}
              title="Tall rectangular beam optimizing bending resistance"
            >
              📐 TALL I-BEAM SECTION
            </button>
            <button
              type="button"
              className="design-preset-btn"
              onClick={() => applyPreset(2.0, 70, 180, 12, 'carbon_fiber')}
              title="Ultra-lightweight aerospace carbon spar"
            >
              🚀 AEROSPACE CARBON SPAR
            </button>
            <button
              type="button"
              className="design-preset-btn"
              onClick={() => applyPreset(3.0, 90, 220, 6, 'wood')}
              title="Traditional timber floor joist"
            >
              🌲 TIMBER JOIST
            </button>
            <button
              type="button"
              className="design-preset-btn"
              onClick={() => applyPreset(3.5, 45, 90, 35, 'aluminum')}
              title="Under-designed thin beam that fails in plastic yield"
            >
              ⚠ OVERLOAD RUPTURE
            </button>
          </div>
        </div>
      )}

      {/* ── Main Hero Layout: CAD Viewport on Left, Dimension Controls on Right ── */}
      <div className="design-hero-grid">
        {/* Left Column: Interactive 3D CAD Isometric Canvas */}
        <div className="design-stage-card">
          <div className="design-stage-card__header">
            <div className="design-stage-card__title-group">
              <span
                className={`design-stage-card__status-dot ${
                  analysis.isFailed ? 'is-failed' : analysis.isCritical ? 'is-critical' : 'is-safe'
                }`}
                aria-hidden="true"
              />
              <h2 className="design-stage-card__title">CANTILEVER BEAM CAD STAGE</h2>
              <span className="design-stage-card__tag">
                {isChallengeMode ? `CHALLENGE L0${activeLevel}` : '3D CAD VIEW'}
              </span>
            </div>

            <div className="design-stage-card__header-right">
              {/* Deflection Visual Exaggeration Selector */}
              <div className="design-exaggeration-toggle">
                <span className="design-exaggeration-label">DEFLECTION ZOOM:</span>
                {[1, 5, 10].map((scale) => (
                  <button
                    key={scale}
                    type="button"
                    className={`design-scale-btn${deflectionScale === scale ? ' is-active' : ''}`}
                    onClick={() => setDeflectionScale(scale)}
                  >
                    {scale}×
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Interactive SVG CAD Canvas ── */}
          <div className="design-canvas-container" aria-label="3D beam deformation CAD canvas">
            <svg
              className="design-cad-svg"
              viewBox="0 0 820 375"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                {/* Fixed Wall Hatch Pattern */}
                <pattern id="wall-hatch" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                  <line x1="0" y1="0" x2="0" y2="10" stroke="#475569" strokeWidth="1.5" />
                </pattern>

                {/* Bending Stress Gradient (High stress at fixed wall -> Zero at tip) */}
                <linearGradient id="stress-front-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={analysis.isFailed ? '#ef4444' : analysis.isCritical ? '#f59e0b' : '#38bdf8'} stopOpacity="0.95" />
                  <stop offset="35%" stopColor={analysis.isFailed ? '#f97316' : '#0284c7'} stopOpacity="0.85" />
                  <stop offset="70%" stopColor="#0369a1" stopOpacity="0.75" />
                  <stop offset="100%" stopColor="#0f172a" stopOpacity="0.8" />
                </linearGradient>

                <linearGradient id="stress-top-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={analysis.isFailed ? '#fca5a5' : '#7dd3fc'} stopOpacity="0.9" />
                  <stop offset="60%" stopColor="#38bdf8" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0.6" />
                </linearGradient>

                {/* Plastic Yield Failure Glow */}
                <radialGradient id="yield-failure-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(239, 68, 68, 0.7)" />
                  <stop offset="100%" stopColor="rgba(239, 68, 68, 0)" />
                </radialGradient>
              </defs>

              {/* Background Engineering Blueprint Grid */}
              <g opacity="0.1" stroke="#38bdf8" strokeWidth="0.5">
                <line x1="40" y1="50" x2="780" y2="50" strokeDasharray="3 3" />
                <line x1="40" y1="150" x2="780" y2="150" strokeDasharray="3 3" />
                <line x1="40" y1="250" x2="780" y2="250" strokeDasharray="3 3" />
                <line x1="40" y1="330" x2="780" y2="330" strokeDasharray="3 3" />
                <line x1="120" y1="20" x2="120" y2="360" strokeDasharray="3 3" />
                <line x1="380" y1="20" x2="380" y2="360" strokeDasharray="3 3" />
                <line x1="680" y1="20" x2="680" y2="360" strokeDasharray="3 3" />
              </g>

              {/* Fixed Wall Support Boundary (Cantilever Foundation) */}
              <rect x="40" y="80" width="80" height="230" fill="url(#wall-hatch)" stroke="#334155" strokeWidth="1.5" />
              <line x1="120" y1="70" x2="120" y2="320" stroke="#94a3b8" strokeWidth="3" />

              {/* Undeflected Reference Neutral Axis (Dashed centerline) */}
              <line
                x1={rootX}
                y1={rootY + beamPixelHeight / 2}
                x2={rootX + beamPixelLength}
                y2={rootY + beamPixelHeight / 2}
                stroke="#64748b"
                strokeWidth="1.2"
                strokeDasharray="4 4"
                opacity="0.4"
              />

              {/* ── 3D Deformed Beam Geometry ── */}
              {/* Top Face */}
              <path
                d={topFacePath}
                fill="url(#stress-top-gradient)"
                stroke="rgba(255, 255, 255, 0.4)"
                strokeWidth="1.2"
              />

              {/* Front Face */}
              <path
                d={frontFacePath}
                fill="url(#stress-front-gradient)"
                stroke="rgba(255, 255, 255, 0.5)"
                strokeWidth="1.5"
              />

              {/* End Cap Tip Face */}
              <path
                d={endCapPath}
                fill="#1e293b"
                stroke="rgba(255, 255, 255, 0.5)"
                strokeWidth="1.2"
              />

              {/* Fixed Root Clamp Plate & Bolts */}
              <g transform={`translate(${rootX - 6}, ${rootY - 10})`}>
                <rect x="0" y="0" width="12" height={beamPixelHeight + 20} rx="2" fill="#334155" stroke="#94a3b8" strokeWidth="1.5" />
                <circle cx="6" cy="6" r="2.5" fill="#f1f5f9" />
                <circle cx="6" cy={beamPixelHeight + 14} r="2.5" fill="#f1f5f9" />
              </g>

              {/* Yield Failure Warning Aura at Root */}
              {analysis.isFailed && (
                <g>
                  <circle cx={rootX} cy={rootY + beamPixelHeight / 2} r="45" fill="url(#yield-failure-glow)" />
                  <text
                    x={rootX + 15}
                    y={rootY - 24}
                    fill="#f87171"
                    fontSize="11"
                    fontFamily="monospace"
                    fontWeight="700"
                    filter="drop-shadow(0 0 6px #ef4444)"
                  >
                    ⚠ PLASTIC YIELD RUPTURE (σ &gt; σ_y)
                  </text>
                </g>
              )}

              {/* Applied Load Arrow Vector (F kN at tip) */}
              <g transform={`translate(${tipX}, ${tipY - loadArrowLen - 8})`}>
                <line x1="0" y1="0" x2="0" y2={loadArrowLen} stroke="#ef4444" strokeWidth="3" />
                <polygon points={`0,${loadArrowLen + 6} -5,${loadArrowLen - 4} 5,${loadArrowLen - 4}`} fill="#ef4444" />
                <rect x="-35" y="-22" width="70" height="20" rx="3" fill="#0f172a" stroke="#ef4444" strokeWidth="1" />
                <text x="0" y="-8" textAnchor="middle" fill="#f87171" fontSize="11" fontFamily="monospace" fontWeight="700">
                  F = {loadKn} kN
                </text>
              </g>

              {/* Deflection Dimension Bracket at Tip */}
              {analysis.tipDeflectionMm > 0.5 && (
                <g transform={`translate(${tipX + depthDx + 16}, ${rootY + depthDy})`}>
                  <line x1="0" y1="0" x2="16" y2="0" stroke="var(--color-signal)" strokeWidth="1" strokeDasharray="2 2" />
                  <line x1="0" y1={visualTipSag} x2="16" y2={visualTipSag} stroke="var(--color-signal)" strokeWidth="1" strokeDasharray="2 2" />
                  <line x1="10" y1="0" x2="10" y2={visualTipSag} stroke="var(--color-signal)" strokeWidth="1.5" />
                  <polygon points={`10,0 7,6 13,6`} fill="var(--color-signal)" />
                  <polygon points={`10,${visualTipSag} 7,${visualTipSag - 6} 13,${visualTipSag - 6}`} fill="var(--color-signal)" />
                  <text
                    x="22"
                    y={visualTipSag / 2 + 4}
                    fill="var(--color-signal)"
                    fontSize="11"
                    fontFamily="monospace"
                    fontWeight="700"
                  >
                    δ = {analysis.tipDeflectionMm.toFixed(1)} mm
                  </text>
                </g>
              )}

              {/* Beam Span Length Dimension Line */}
              <g transform={`translate(0, 340)`}>
                <line x1={rootX} y1="0" x2={rootX + beamPixelLength} y2="0" stroke="#94a3b8" strokeWidth="1.5" />
                <line x1={rootX} y1="-6" x2={rootX} y2="6" stroke="#94a3b8" strokeWidth="1.5" />
                <line x1={rootX + beamPixelLength} y1="-6" x2={rootX + beamPixelLength} y2="6" stroke="#94a3b8" strokeWidth="1.5" />
                <rect x={(rootX + rootX + beamPixelLength) / 2 - 40} y="-12" width="80" height="20" rx="3" fill="#0f172a" stroke="#334155" strokeWidth="1" />
                <text
                  x={(rootX + rootX + beamPixelLength) / 2}
                  y="2"
                  textAnchor="middle"
                  fill="#f1f5f9"
                  fontSize="11"
                  fontFamily="monospace"
                  fontWeight="700"
                >
                  L = {lengthM.toFixed(1)} m
                </text>
              </g>

              {/* ── Cross-Section Inset Box (Top Right) ── */}
              <g transform="translate(630, 20)">
                <rect x="0" y="0" width="170" height="120" rx="6" fill="rgba(15, 23, 42, 0.9)" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1" />
                <text x="14" y="20" fill="#94a3b8" fontSize="10" fontFamily="monospace" fontWeight="700">
                  CROSS-SECTION
                </text>
                <g transform="translate(60, 36)">
                  {/* Profile rectangle */}
                  <rect
                    x="0"
                    y="0"
                    width={Math.min(50, Math.max(16, (widthMm / 200) * 50))}
                    height={Math.min(65, Math.max(22, (heightMm / 300) * 65))}
                    fill="rgba(56, 189, 248, 0.2)"
                    stroke="var(--sys-design)"
                    strokeWidth="1.5"
                  />
                  {/* Width label */}
                  <text
                    x={Math.min(50, Math.max(16, (widthMm / 200) * 50)) / 2}
                    y="-5"
                    textAnchor="middle"
                    fill="var(--sys-design)"
                    fontSize="9.5"
                    fontFamily="monospace"
                  >
                    w={widthMm}mm
                  </text>
                  {/* Height label */}
                  <text
                    x="-6"
                    y={Math.min(65, Math.max(22, (heightMm / 300) * 65)) / 2 + 3}
                    textAnchor="end"
                    fill="var(--color-signal)"
                    fontSize="9.5"
                    fontFamily="monospace"
                  >
                    h={heightMm}mm
                  </text>
                </g>
                <text x="14" y="112" fill="#94a3b8" fontSize="9" fontFamily="monospace">
                  I = {(analysis.momentOfInertiaM4 * 1e8).toFixed(1)} ×10⁻⁴ m⁴
                </text>
              </g>
            </svg>
          </div>

          {/* ── Visual Performance Metrics Deck ── */}
          <div className="design-visual-meters">
            {/* Stress Meter */}
            <div className="design-meter-card">
              <div className="design-meter-card__title">
                <span>BENDING STRESS (σ_max)</span>
                <span className={`design-meter-badge ${analysis.isFailed ? 'is-danger' : 'is-good'}`}>
                  {analysis.maxBendingStressMpa.toFixed(0)} / {analysis.material.yieldStrengthMpa} MPa
                </span>
              </div>
              <div className="design-meter-bar-track">
                <div
                  className={`design-meter-bar-fill ${analysis.isFailed ? 'is-failed' : analysis.isCritical ? 'is-critical' : 'is-safe'}`}
                  style={{ width: `${Math.min(100, Math.round((analysis.maxBendingStressMpa / analysis.material.yieldStrengthMpa) * 100))}%` }}
                />
              </div>
              <div className="design-meter-card__sub">
                <span>Yield Margin: {analysis.factorOfSafety >= 1.0 ? `+${((analysis.factorOfSafety - 1) * 100).toFixed(0)}%` : 'RUPTURE'}</span>
                <span>Limit: σ_y = {analysis.material.yieldStrengthMpa} MPa</span>
              </div>
            </div>

            {/* Factor of Safety Pill */}
            <div className="design-meter-card">
              <div className="design-meter-card__title">
                <span>FACTOR OF SAFETY (FoS)</span>
                <span className={`design-meter-badge ${analysis.isFailed ? 'is-danger' : analysis.factorOfSafety >= 2.0 ? 'is-good' : 'is-warn'}`}>
                  FoS = {analysis.factorOfSafety.toFixed(2)}
                </span>
              </div>
              <div className="design-meter-bar-track">
                <div
                  className="design-meter-bar-fill is-fos"
                  style={{ width: `${Math.min(100, Math.round((analysis.factorOfSafety / 4.0) * 100))}%` }}
                />
              </div>
              <div className="design-meter-card__sub">
                <span>Status: {analysis.statusRating}</span>
                <span>Target: FoS ≥ 1.50</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: CAD Controls & Material Deck */}
        <div className="design-controls-panel">
          <div className="design-controls-panel__head">
            <h2 className="design-controls-panel__title">BEAM PARAMETERS</h2>
            <button
              type="button"
              className="design-btn-reset-compact"
              onClick={onReset}
              onPointerEnter={() => setIntent('button', 'RESET')}
              onPointerLeave={clearIntent}
              title="Reset parameters to defaults"
            >
              RESET
            </button>
          </div>

          {/* Material Selector Chips */}
          <div className="design-material-selector">
            <span className="design-control-label">MATERIAL SELECTION:</span>
            <div className="design-material-chips">
              {(Object.keys(DESIGN_MATERIALS) as MaterialId[]).map((matId) => {
                const mat = DESIGN_MATERIALS[matId]
                return (
                  <button
                    key={matId}
                    type="button"
                    className={`design-mat-chip${materialId === matId ? ' is-active' : ''}`}
                    onClick={() => handleMaterialSelect(matId)}
                    title={mat.description}
                  >
                    <span className="design-mat-chip__dot" style={{ background: mat.colorAccent }} />
                    <span>{mat.name.split(' ')[0]}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Slider 1: Length */}
          <div className="design-control-group">
            <div className="design-control-group__label-row">
              <label htmlFor="design-length" className="design-control-group__name">
                SPAN LENGTH (L)
              </label>
              <span className="design-control-group__value">{lengthM.toFixed(1)} m</span>
            </div>
            <input
              id="design-length"
              type="range"
              className="design-control-slider"
              min={BEAM_LIMITS.lengthM.min}
              max={BEAM_LIMITS.lengthM.max}
              step={BEAM_LIMITS.lengthM.step}
              value={lengthM}
              onChange={(e) => handleSliderChange('lengthM', Number(e.target.value))}
            />
            <div className="design-control-group__scale">
              <span>Short (1.0m)</span>
              <span>Long (4.0m)</span>
            </div>
          </div>

          {/* Slider 2: Width */}
          <div className="design-control-group">
            <div className="design-control-group__label-row">
              <label htmlFor="design-width" className="design-control-group__name">
                SECTION WIDTH (w)
              </label>
              <span className="design-control-group__value">{widthMm} mm</span>
            </div>
            <input
              id="design-width"
              type="range"
              className="design-control-slider"
              min={BEAM_LIMITS.widthMm.min}
              max={BEAM_LIMITS.widthMm.max}
              step={BEAM_LIMITS.widthMm.step}
              value={widthMm}
              onChange={(e) => handleSliderChange('widthMm', Number(e.target.value))}
            />
            <div className="design-control-group__scale">
              <span>Thin (40mm)</span>
              <span>Wide (200mm)</span>
            </div>
          </div>

          {/* Slider 3: Height */}
          <div className="design-control-group">
            <div className="design-control-group__label-row">
              <label htmlFor="design-height" className="design-control-group__name">
                SECTION HEIGHT (h)
              </label>
              <span className="design-control-group__value is-highlight">{heightMm} mm</span>
            </div>
            <input
              id="design-height"
              type="range"
              className="design-control-slider"
              min={BEAM_LIMITS.heightMm.min}
              max={BEAM_LIMITS.heightMm.max}
              step={BEAM_LIMITS.heightMm.step}
              value={heightMm}
              onChange={(e) => handleSliderChange('heightMm', Number(e.target.value))}
            />
            <div className="design-control-group__scale">
              <span>Flat (60mm)</span>
              <span>Deep (300mm / Cube Stiffness)</span>
            </div>
          </div>

          {/* Slider 4: Load */}
          <div className="design-control-group">
            <div className="design-control-group__label-row">
              <label htmlFor="design-load" className="design-control-group__name">
                TIP LOAD (F)
              </label>
              <span className="design-control-group__value is-load">{loadKn} kN</span>
            </div>
            <input
              id="design-load"
              type="range"
              className="design-control-slider"
              min={BEAM_LIMITS.loadKn.min}
              max={BEAM_LIMITS.loadKn.max}
              step={BEAM_LIMITS.loadKn.step}
              value={loadKn}
              onChange={(e) => handleSliderChange('loadKn', Number(e.target.value))}
            />
            <div className="design-control-group__scale">
              <span>Light (2 kN)</span>
              <span>Heavy (50 kN)</span>
            </div>
          </div>

          {/* Telemetry Quick Status Grid */}
          <div className="design-telemetry-grid">
            <div className="design-telemetry-cell">
              <span className="design-telemetry-cell__label">MAX STRESS</span>
              <span className={`design-telemetry-cell__value ${analysis.isFailed ? 'is-danger' : 'is-accent'}`}>
                {analysis.maxBendingStressMpa.toFixed(0)} MPa
              </span>
            </div>

            <div className="design-telemetry-cell">
              <span className="design-telemetry-cell__label">DEFLECTION</span>
              <span className="design-telemetry-cell__value is-warn">
                {analysis.tipDeflectionMm.toFixed(1)} mm
              </span>
            </div>

            <div className="design-telemetry-cell">
              <span className="design-telemetry-cell__label">BEAM MASS</span>
              <span className="design-telemetry-cell__value">
                {analysis.massKg.toFixed(1)} kg
              </span>
            </div>

            <div className="design-telemetry-cell">
              <span className="design-telemetry-cell__label">SAFETY FACTOR</span>
              <span className={`design-telemetry-cell__value ${analysis.isFailed ? 'is-danger' : 'is-good'}`}>
                {analysis.factorOfSafety.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Contextual Guidance */}
          {!isChallengeMode ? (
            <div className="design-try-this-card">
              <span className="design-try-this-card__tag">TRY THIS</span>
              <p className="design-try-this-card__prompt">
                Double <strong>SECTION HEIGHT (h)</strong> and watch how tip deflection shrinks by 8× due to the cubic formula (I = w·h³/12)!
              </p>
              <button
                type="button"
                className="design-try-mission-link"
                onClick={() => onSwitchMode?.('challenge')}
              >
                Ready to optimize? Start Challenge Mode →
              </button>
            </div>
          ) : (
            <div className="design-challenge-live-feedback">
              <div className="design-challenge-live-feedback__header">
                <span className="design-challenge-live-feedback__tag">LIVE MISSION FEEDBACK</span>
              </div>
              <p className="design-challenge-live-feedback__msg">
                {challengeEval.feedbackMessage}
              </p>
              {challengeEval.engineeringInsight && (
                <p className="design-challenge-live-feedback__insight">
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
