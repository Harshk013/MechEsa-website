// src/components/mechLab/experiments/ManufacturingExperimentView.tsx
// Interactive CNC Milling Machining Center Visualization & Telemetry Controls

import { useState, useEffect } from 'react'
import { usePointer } from '../../interaction/PointerProvider'
import {
  type ManufacturingParams,
  type WorkpieceMaterialId,
  type CuttingToolId,
  WORKPIECE_MATERIALS,
  CUTTING_TOOLS,
  MANUFACTURING_LIMITS,
  type ManufacturingAnalysis,
} from './manufacturingModel'
import './manufacturing.css'

export interface ManufacturingExperimentViewProps {
  params: ManufacturingParams
  analysis: ManufacturingAnalysis
  onParamChange: (partial: Partial<ManufacturingParams>) => void
  onReset?: () => void
  activeLevel?: number
  isChallengeMode?: boolean
  onSwitchMode?: (mode: 'explore' | 'challenge') => void
}

export function ManufacturingExperimentView({
  params,
  analysis,
  onParamChange,
  onReset,
}: ManufacturingExperimentViewProps) {
  const { setIntent, clearIntent } = usePointer()

  // Real-time tool traversing animation along the workpiece
  const [toolXOffset, setToolXOffset] = useState<number>(0)

  useEffect(() => {
    let animId: number
    let lastTime = performance.now()

    // Table feed rate vf mm/min -> mm/s
    const feedSpeedMmPerSec = Math.max(10, analysis.tableFeedMmPerMin / 60)
    const travelRangeMm = 160 // length of cut slot travel

    const animate = (currentTime: number) => {
      const dt = (currentTime - lastTime) / 1000
      lastTime = currentTime

      setToolXOffset((prev) => {
        const next = prev + feedSpeedMmPerSec * dt * 0.45
        return next > travelRangeMm ? -travelRangeMm * 0.3 : next
      })

      animId = requestAnimationFrame(animate)
    }

    animId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animId)
  }, [analysis.tableFeedMmPerMin])

  const handleMaterialSelect = (matId: WorkpieceMaterialId) => {
    onParamChange({ materialId: matId })
  }

  const handleToolSelect = (toolId: CuttingToolId) => {
    onParamChange({ toolId })
  }

  const applyPreset = (presetParams: Partial<ManufacturingParams>) => {
    onParamChange(presetParams)
  }

  // Workpiece & Slot Geometry Mapping
  const workpieceWidth = 260
  const workpieceHeight = 90
  const slotDepthPx = Math.min(45, (analysis.params.axialDepthMm / 5.0) * 45)
  const toolDiameterPx = Math.max(16, (analysis.tool.diameterMm / 12.0) * 28)

  return (
    <div className="mfg-experiment-container">
      {/* ── Upper Presets Bar ────────────────────────────────────────────── */}
      <div className="mfg-explore-presets-bar">
        <div className="mfg-explore-presets-label">
          <span className="mfg-explore-dot" aria-hidden="true" />
          <span>PRESET MACHINING CYCLES:</span>
        </div>
        <div className="mfg-presets-list">
          <button
            type="button"
            className="mfg-preset-btn"
            onClick={() =>
              applyPreset({
                materialId: 'aluminum_6061',
                toolId: 'carbide_endmill_4f',
                spindleSpeedRpm: 4200,
                feedPerToothMm: 0.1,
                axialDepthMm: 3.0,
                radialWidthMm: 8.0,
                coolantActive: true,
              })
            }
            onPointerEnter={() => setIntent('button', 'PRESET ALUMINUM ROUGHING')}
            onPointerLeave={clearIntent}
          >
            High-Speed Aluminum Roughing
          </button>

          <button
            type="button"
            className="mfg-preset-btn"
            onClick={() =>
              applyPreset({
                materialId: 'aluminum_6061',
                toolId: 'carbide_endmill_4f',
                spindleSpeedRpm: 3400,
                feedPerToothMm: 0.04,
                axialDepthMm: 1.0,
                radialWidthMm: 4.0,
                coolantActive: true,
              })
            }
            onPointerEnter={() => setIntent('button', 'PRESET MIRROR FINISH')}
            onPointerLeave={clearIntent}
          >
            Aerospace Mirror Finishing (Ra &lt; 0.8 µm)
          </button>

          <button
            type="button"
            className="mfg-preset-btn"
            onClick={() =>
              applyPreset({
                materialId: 'mild_steel_1018',
                toolId: 'carbide_endmill_4f',
                spindleSpeedRpm: 1900,
                feedPerToothMm: 0.08,
                axialDepthMm: 2.25,
                radialWidthMm: 6.0,
                coolantActive: true,
              })
            }
            onPointerEnter={() => setIntent('button', 'PRESET STEEL SLOTTING')}
            onPointerLeave={clearIntent}
          >
            Structural Steel Slotting
          </button>

          <button
            type="button"
            className="mfg-preset-btn"
            onClick={() =>
              applyPreset({
                materialId: 'titanium_ti6al4v',
                toolId: 'carbide_endmill_2f',
                spindleSpeedRpm: 800,
                feedPerToothMm: 0.05,
                axialDepthMm: 1.5,
                radialWidthMm: 3.0,
                coolantActive: true,
              })
            }
            onPointerEnter={() => setIntent('button', 'PRESET TITANIUM PROFILING')}
            onPointerLeave={clearIntent}
          >
            Titanium Ti-6Al-4V Profiling
          </button>
        </div>
      </div>

      {/* ── Main Hero Stage Grid (Left: CNC Machining Stage, Right: Controls) ── */}
      <div className="mfg-hero-grid">
        {/* Left Column: Bounded CNC Stage Card */}
        <div className="mfg-stage-card">
          <div className="mfg-stage-card__header">
            <div className="mfg-stage-title-wrap">
              <span className="mfg-stage-badge">3-AXIS CNC VMC</span>
              <span className="mfg-stage-subtitle">
                MILLING CELL // RUNNING ({analysis.params.spindleSpeedRpm} RPM)
              </span>
            </div>

            <div className="mfg-stage-status-indicator">
              <span
                className={`mfg-stage-led ${
                  analysis.isOverloaded
                    ? 'is-overload'
                    : analysis.isChatterRisk || analysis.spindleLoadPercent > 85
                    ? 'is-warning'
                    : ''
                }`}
              />
              <span className="mfg-stage-status-text">{analysis.statusLabel}</span>
            </div>
          </div>

          {/* Visual Machining Canvas Wrapper */}
          <div className="mfg-canvas-wrapper">
            <svg
              className="mfg-svg-canvas"
              viewBox="0 0 840 380"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              aria-label="CNC end milling simulation showing spindle cutter engaging workpiece"
            >
              <defs>
                {/* Spindle Cast-Iron Gradients */}
                <linearGradient id="mfgSpindleHead" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#1e293b" />
                  <stop offset="35%" stopColor="#334155" />
                  <stop offset="65%" stopColor="#475569" />
                  <stop offset="100%" stopColor="#1e293b" />
                </linearGradient>

                {/* Tool Carbide Steel Gradient */}
                <linearGradient id="mfgCarbideTool" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#64748b" />
                  <stop offset="40%" stopColor="#cbd5e1" />
                  <stop offset="70%" stopColor="#94a3b8" />
                  <stop offset="100%" stopColor="#475569" />
                </linearGradient>

                {/* Workpiece Metallic Texture */}
                <linearGradient id="mfgWorkpieceMat" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={analysis.material.colorHex} stopOpacity="0.9" />
                  <stop offset="50%" stopColor={analysis.material.colorHex} stopOpacity="0.75" />
                  <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>

                {/* Milled Pocket Groove Shadow */}
                <linearGradient id="mfgMilledSlot" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0f172a" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#1e293b" stopOpacity="0.8" />
                </linearGradient>

                {/* Coolant Fluid Glow */}
                <linearGradient id="mfgCoolantJet" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0.2" />
                </linearGradient>
              </defs>

              {/* Machine Enclosure Background datum grid */}
              <g opacity="0.25">
                <line x1="80" y1="310" x2="760" y2="310" stroke="#475569" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="420" y1="30" x2="420" y2="350" stroke="#475569" strokeWidth="1" strokeDasharray="4 4" />
                <text x="740" y="305" fill="#64748b" fontSize="10" fontFamily="monospace">+X</text>
                <text x="425" y="45" fill="#64748b" fontSize="10" fontFamily="monospace">+Z</text>
              </g>

              {/* T-Slot Machine Table Bed */}
              <rect x="120" y="300" width="600" height="24" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
              <rect x="140" y="308" width="560" height="6" fill="#020617" />
              <circle cx="160" cy="312" r="3" fill="#475569" />
              <circle cx="680" cy="312" r="3" fill="#475569" />

              {/* Heavy Precision Machine Vise */}
              <g transform="translate(250, 220)">
                {/* Vise Base */}
                <rect x="0" y="60" width="340" height="20" fill="#1e293b" stroke="#475569" strokeWidth="1" />
                {/* Fixed Jaw (Left) */}
                <rect x="20" y="10" width="22" height="50" fill="#334155" stroke="#64748b" strokeWidth="1" />
                {/* Movable Jaw (Right) */}
                <rect x="298" y="10" width="22" height="50" fill="#334155" stroke="#64748b" strokeWidth="1" />
                {/* Clamping Lead Screw */}
                <rect x="320" y="30" width="18" height="12" fill="#475569" />
              </g>

              {/* Workpiece Stock Block clamped in vise */}
              <g transform="translate(292, 170)">
                {/* Uncut Workpiece Block */}
                <rect
                  x="0"
                  y="0"
                  width={workpieceWidth}
                  height={workpieceHeight}
                  fill="url(#mfgWorkpieceMat)"
                  stroke="#64748b"
                  strokeWidth="1.5"
                  rx="2"
                />

                {/* Material Name Stamp on Stock */}
                <text
                  x="15"
                  y="75"
                  fill="#0f172a"
                  opacity="0.65"
                  fontSize="11"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {analysis.material.shortName.toUpperCase()} · KC={analysis.material.specificCuttingForceKc}
                </text>

                {/* Real-time Milled Slot Cavity (representing depth of cut ap and width ae) */}
                <rect
                  x="0"
                  y="0"
                  width={Math.max(20, Math.min(workpieceWidth, 80 + toolXOffset))}
                  height={slotDepthPx}
                  fill="url(#mfgMilledSlot)"
                  stroke="#38bdf8"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />

                {/* Scalloped Machined Finish Lines in Pocket Bottom */}
                <g opacity="0.35">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <path
                      key={i}
                      d={`M ${i * 18} ${slotDepthPx} Q ${i * 18 + 9} ${slotDepthPx - 3}, ${i * 18 + 18} ${slotDepthPx}`}
                      stroke="#38bdf8"
                      strokeWidth="1"
                      fill="none"
                    />
                  ))}
                </g>

                {/* Dimension Callouts: Depth of cut ap */}
                <g transform={`translate(${workpieceWidth + 12}, 0)`}>
                  <line x1="0" y1="0" x2="0" y2={slotDepthPx} stroke="#f59e0b" strokeWidth="1.5" />
                  <line x1="-4" y1="0" x2="4" y2="0" stroke="#f59e0b" strokeWidth="1" />
                  <line x1="-4" y1={slotDepthPx} x2="4" y2={slotDepthPx} stroke="#f59e0b" strokeWidth="1" />
                  <text x="8" y={Math.max(12, slotDepthPx / 2 + 4)} fill="#f59e0b" fontSize="10" fontFamily="monospace" fontWeight="bold">
                    ap={analysis.params.axialDepthMm}mm
                  </text>
                </g>
              </g>

              {/* ── Moving CNC Spindle & Rotating Cutter Assembly ─────────── */}
              <g transform={`translate(${372 + Math.min(180, Math.max(0, toolXOffset))}, 0)`}>
                {/* Spindle Housing Column */}
                <rect x="-35" y="0" width="70" height="90" fill="url(#mfgSpindleHead)" stroke="#334155" strokeWidth="1" />
                {/* Spindle Nose Ring */}
                <rect x="-42" y="80" width="84" height="15" fill="#0f172a" stroke="#475569" strokeWidth="1" rx="2" />
                {/* ER Collet Chuck Holder */}
                <polygon points="-24,95 24,95 18,135 -18,135" fill="#334155" stroke="#475569" strokeWidth="1" />
                <rect x="-20" y="125" width="40" height="12" fill="#1e293b" />

                {/* Rotating Solid Carbide End Mill Tool Body */}
                <g transform="translate(0, 137)">
                  {/* Tool Shank */}
                  <rect
                    x={-toolDiameterPx / 2}
                    y="0"
                    width={toolDiameterPx}
                    height={33 + slotDepthPx}
                    fill="url(#mfgCarbideTool)"
                    stroke="#475569"
                    strokeWidth="1"
                  />

                  {/* Rotating Flute Spiral Grooves */}
                  <g opacity="0.6">
                    <path
                      d={`M ${-toolDiameterPx / 2} 10 Q 0 16, ${toolDiameterPx / 2} 22`}
                      stroke="#0f172a"
                      strokeWidth="2.5"
                      fill="none"
                    />
                    <path
                      d={`M ${-toolDiameterPx / 2} 24 Q 0 30, ${toolDiameterPx / 2} 36`}
                      stroke="#0f172a"
                      strokeWidth="2.5"
                      fill="none"
                    />
                    <path
                      d={`M ${-toolDiameterPx / 2} 38 Q 0 44, ${toolDiameterPx / 2} 50`}
                      stroke="#0f172a"
                      strokeWidth="2.5"
                      fill="none"
                    />
                  </g>

                  {/* Active Cutting Tip at Workpiece Surface */}
                  <rect
                    x={-toolDiameterPx / 2}
                    y={31 + slotDepthPx}
                    width={toolDiameterPx}
                    height="4"
                    fill="#f59e0b"
                    opacity="0.8"
                  />

                  {/* High-Pressure Dual Flood Coolant Jets */}
                  {params.coolantActive && (
                    <g opacity="0.85">
                      {/* Left Jet */}
                      <path
                        d={`M -28 65 Q -15 ${95 + slotDepthPx}, ${-toolDiameterPx / 2} ${31 + slotDepthPx}`}
                        stroke="url(#mfgCoolantJet)"
                        strokeWidth="3.5"
                        fill="none"
                        strokeLinecap="round"
                      />
                      {/* Right Jet */}
                      <path
                        d={`M 28 65 Q 15 ${95 + slotDepthPx}, ${toolDiameterPx / 2} ${31 + slotDepthPx}`}
                        stroke="url(#mfgCoolantJet)"
                        strokeWidth="3.5"
                        fill="none"
                        strokeLinecap="round"
                      />
                      {/* Coolant mist droplets */}
                      <circle cx={-toolDiameterPx / 2 - 4} cy={31 + slotDepthPx + 2} r="2" fill="#38bdf8" />
                      <circle cx={toolDiameterPx / 2 + 5} cy={31 + slotDepthPx + 3} r="2.5" fill="#38bdf8" />
                      <circle cx={0} cy={31 + slotDepthPx + 4} r="1.5" fill="#7dd3fc" />
                    </g>
                  )}

                  {/* Ejected Machining Chip Particles */}
                  <g>
                    <path
                      d={`M ${toolDiameterPx / 2} ${30 + slotDepthPx} C ${toolDiameterPx / 2 + 10} ${20 + slotDepthPx}, ${
                        toolDiameterPx / 2 + 18
                      } ${25 + slotDepthPx}, ${toolDiameterPx / 2 + 25} ${15 + slotDepthPx}`}
                      stroke="#e2e8f0"
                      strokeWidth="1.8"
                      fill="none"
                    />
                    <path
                      d={`M ${toolDiameterPx / 2 + 2} ${32 + slotDepthPx} C ${toolDiameterPx / 2 + 14} ${26 + slotDepthPx}, ${
                        toolDiameterPx / 2 + 22
                      } ${32 + slotDepthPx}, ${toolDiameterPx / 2 + 32} ${24 + slotDepthPx}`}
                      stroke="#cbd5e1"
                      strokeWidth="1.4"
                      fill="none"
                    />
                  </g>
                </g>

                {/* Coolant Nozzle Blocks attached to spindle body */}
                {params.coolantActive && (
                  <g>
                    <rect x="-38" y="70" width="10" height="18" fill="#475569" rx="2" />
                    <rect x="28" y="70" width="10" height="18" fill="#475569" rx="2" />
                  </g>
                )}
              </g>

              {/* Feed Direction Motion Arrow */}
              <g transform="translate(180, 200)">
                <line x1="0" y1="0" x2="35" y2="0" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 2" />
                <polygon points="35,-4 42,0 35,4" fill="#38bdf8" />
                <text x="0" y="-8" fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="bold">
                  +X FEED vf={analysis.tableFeedMmPerMin} mm/min
                </text>
              </g>
            </svg>
          </div>

          {/* Under-Stage Quick Live Telemetry DRO Strip */}
          <div className="mfg-stage-hud">
            <div className="mfg-hud-cell">
              <span className="mfg-hud-cell__label">CUTTING SPEED (Vc)</span>
              <span className="mfg-hud-cell__val">
                {analysis.cuttingSpeedMpm} <small>m/min</small>
              </span>
              <span className="mfg-hud-cell__sub">π·D·N / 1000</span>
            </div>

            <div className="mfg-hud-cell">
              <span className="mfg-hud-cell__label">TABLE FEED (vf)</span>
              <span className="mfg-hud-cell__val">
                {analysis.tableFeedMmPerMin} <small>mm/min</small>
              </span>
              <span className="mfg-hud-cell__sub">fz·z·N</span>
            </div>

            <div className="mfg-hud-cell">
              <span className="mfg-hud-cell__label">REMOVAL RATE (MRR)</span>
              <span className="mfg-hud-cell__val">
                {analysis.materialRemovalRateCm3Min} <small>cm³/min</small>
              </span>
              <span className="mfg-hud-cell__sub">ap·ae·vf</span>
            </div>

            <div className="mfg-hud-cell">
              <span className="mfg-hud-cell__label">CUTTING FORCE (Fc)</span>
              <span className="mfg-hud-cell__val">
                {analysis.tangentialCuttingForceN} <small>N</small>
              </span>
              <span className="mfg-hud-cell__sub">kc = {analysis.material.specificCuttingForceKc}</span>
            </div>

            <div className="mfg-hud-cell">
              <span className="mfg-hud-cell__label">SPINDLE POWER (Pc)</span>
              <span
                className={`mfg-hud-cell__val ${
                  analysis.isOverloaded
                    ? 'mfg-hud-cell__val--fail'
                    : analysis.spindleLoadPercent > 85
                    ? 'mfg-hud-cell__val--warn'
                    : 'mfg-hud-cell__val--ok'
                }`}
              >
                {analysis.spindlePowerKw} <small>kW</small>
              </span>
              <div className="mfg-load-meter">
                <div
                  className={`mfg-load-fill ${
                    analysis.isOverloaded
                      ? 'is-overload'
                      : analysis.spindleLoadPercent > 85
                      ? 'is-heavy'
                      : 'is-optimal'
                  }`}
                  style={{ width: `${Math.min(100, analysis.spindleLoadPercent)}%` }}
                />
              </div>
            </div>

            <div className="mfg-hud-cell">
              <span className="mfg-hud-cell__label">ROUGHNESS (Ra)</span>
              <span className="mfg-hud-cell__val">
                {analysis.surfaceRoughnessRaUm} <small>µm</small>
              </span>
              <span className="mfg-hud-cell__sub">
                {analysis.surfaceRoughnessRaUm <= 0.8
                  ? 'Mirror Finish'
                  : analysis.surfaceRoughnessRaUm <= 1.6
                  ? 'Fine Machined'
                  : 'Rough Pass'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Bounded Controls Card */}
        <div className="mfg-controls-card">
          <div className="mfg-controls-head">
            <h3 className="mfg-controls-title">CNC PROCESS CONTROLS</h3>
            {onReset && (
              <button
                type="button"
                className="mfg-reset-btn"
                onClick={onReset}
                onPointerEnter={() => setIntent('button', 'RESET DEFAULT')}
                onPointerLeave={clearIntent}
              >
                ↺ RESET DEFAULT
              </button>
            )}
          </div>

          {/* 01 · Select Workpiece Stock */}
          <div className="mfg-control-section">
            <label className="mfg-control-section__label">
              <span>01 · WORKPIECE STOCK MATERIAL</span>
              <span className="mfg-control-section__active-val">{analysis.material.name}</span>
            </label>
            <div className="mfg-materials-grid">
              {Object.values(WORKPIECE_MATERIALS).map((mat) => {
                const isSelected = params.materialId === mat.id
                return (
                  <button
                    key={mat.id}
                    type="button"
                    className={`mfg-material-btn ${isSelected ? 'is-active' : ''}`}
                    onClick={() => handleMaterialSelect(mat.id)}
                    onPointerEnter={() => setIntent('button', `SELECT ${mat.shortName}`)}
                    onPointerLeave={clearIntent}
                  >
                    <div className="mfg-material-name">{mat.shortName}</div>
                    <div className="mfg-material-kc">kc = {mat.specificCuttingForceKc} N/mm²</div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 02 · Select Cutter Tooling */}
          <div className="mfg-control-section">
            <label className="mfg-control-section__label">
              <span>02 · CUTTER TOOLING GEOMETRY</span>
              <span className="mfg-control-section__active-val">{analysis.tool.shortName}</span>
            </label>
            <div className="mfg-tools-row">
              {Object.values(CUTTING_TOOLS).map((tool) => {
                const isSelected = params.toolId === tool.id
                return (
                  <button
                    key={tool.id}
                    type="button"
                    className={`mfg-tool-btn ${isSelected ? 'is-active' : ''}`}
                    onClick={() => handleToolSelect(tool.id)}
                    onPointerEnter={() => setIntent('button', `TOOL ${tool.shortName}`)}
                    onPointerLeave={clearIntent}
                  >
                    <span>⚙</span>
                    <span>{tool.shortName}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 03 · Process Parameter Sliders */}
          <div className="mfg-control-section">
            <label className="mfg-control-section__label">
              <span>03 · CUTTING SPEED &amp; ENGAGEMENT</span>
            </label>

            <div className="mfg-sliders-stack">
              {/* Spindle Speed N */}
              <div className="mfg-slider-group">
                <div className="mfg-slider-header">
                  <span className="mfg-slider-name">SPINDLE SPEED (N)</span>
                  <span className="mfg-slider-val">{params.spindleSpeedRpm} RPM</span>
                </div>
                <input
                  id="mfg-slider-rpm"
                  type="range"
                  className="mfg-slider"
                  min={MANUFACTURING_LIMITS.spindleSpeedRpm.min}
                  max={MANUFACTURING_LIMITS.spindleSpeedRpm.max}
                  step={MANUFACTURING_LIMITS.spindleSpeedRpm.step}
                  value={params.spindleSpeedRpm}
                  onChange={(e) => onParamChange({ spindleSpeedRpm: Number(e.target.value) })}
                  onPointerEnter={() => setIntent('drag', 'SPINDLE SPEED')}
                  onPointerLeave={clearIntent}
                />
                <div className="mfg-slider-meta">
                  <span>{MANUFACTURING_LIMITS.spindleSpeedRpm.min} RPM</span>
                  <span>Vc = {analysis.cuttingSpeedMpm} m/min</span>
                  <span>{MANUFACTURING_LIMITS.spindleSpeedRpm.max} RPM</span>
                </div>
              </div>

              {/* Feed per Tooth fz */}
              <div className="mfg-slider-group">
                <div className="mfg-slider-header">
                  <span className="mfg-slider-name">FEED PER TOOTH (fz)</span>
                  <span className="mfg-slider-val">{params.feedPerToothMm} mm/tooth</span>
                </div>
                <input
                  id="mfg-slider-fz"
                  type="range"
                  className="mfg-slider"
                  min={MANUFACTURING_LIMITS.feedPerToothMm.min}
                  max={MANUFACTURING_LIMITS.feedPerToothMm.max}
                  step={MANUFACTURING_LIMITS.feedPerToothMm.step}
                  value={params.feedPerToothMm}
                  onChange={(e) => onParamChange({ feedPerToothMm: Number(e.target.value) })}
                  onPointerEnter={() => setIntent('drag', 'FEED PER TOOTH')}
                  onPointerLeave={clearIntent}
                />
                <div className="mfg-slider-meta">
                  <span>{MANUFACTURING_LIMITS.feedPerToothMm.min} mm</span>
                  <span>vf = {analysis.tableFeedMmPerMin} mm/min</span>
                  <span>{MANUFACTURING_LIMITS.feedPerToothMm.max} mm</span>
                </div>
              </div>

              {/* Axial Depth of Cut ap */}
              <div className="mfg-slider-group">
                <div className="mfg-slider-header">
                  <span className="mfg-slider-name">AXIAL DEPTH (ap)</span>
                  <span className="mfg-slider-val">{params.axialDepthMm} mm</span>
                </div>
                <input
                  id="mfg-slider-ap"
                  type="range"
                  className="mfg-slider"
                  min={MANUFACTURING_LIMITS.axialDepthMm.min}
                  max={MANUFACTURING_LIMITS.axialDepthMm.max}
                  step={MANUFACTURING_LIMITS.axialDepthMm.step}
                  value={params.axialDepthMm}
                  onChange={(e) => onParamChange({ axialDepthMm: Number(e.target.value) })}
                  onPointerEnter={() => setIntent('drag', 'AXIAL DEPTH')}
                  onPointerLeave={clearIntent}
                />
                <div className="mfg-slider-meta">
                  <span>{MANUFACTURING_LIMITS.axialDepthMm.min} mm</span>
                  <span>Cut Depth</span>
                  <span>{MANUFACTURING_LIMITS.axialDepthMm.max} mm</span>
                </div>
              </div>

              {/* Radial Width of Cut ae */}
              <div className="mfg-slider-group">
                <div className="mfg-slider-header">
                  <span className="mfg-slider-name">RADIAL WIDTH (ae)</span>
                  <span className="mfg-slider-val">{params.radialWidthMm} mm</span>
                </div>
                <input
                  id="mfg-slider-ae"
                  type="range"
                  className="mfg-slider"
                  min={MANUFACTURING_LIMITS.radialWidthMm.min}
                  max={MANUFACTURING_LIMITS.radialWidthMm.max}
                  step={MANUFACTURING_LIMITS.radialWidthMm.step}
                  value={params.radialWidthMm}
                  onChange={(e) => onParamChange({ radialWidthMm: Number(e.target.value) })}
                  onPointerEnter={() => setIntent('drag', 'RADIAL WIDTH')}
                  onPointerLeave={clearIntent}
                />
                <div className="mfg-slider-meta">
                  <span>{MANUFACTURING_LIMITS.radialWidthMm.min} mm</span>
                  <span>Engagement Width</span>
                  <span>{MANUFACTURING_LIMITS.radialWidthMm.max} mm</span>
                </div>
              </div>
            </div>
          </div>

          {/* 04 · Flood Coolant Toggle Bar */}
          <div className="mfg-coolant-row">
            <div className="mfg-coolant-label">
              <span>💧 HIGH-PRESSURE FLOOD COOLANT</span>
              <span className="mfg-coolant-sub">(Thermal buffer &amp; Ra polish)</span>
            </div>

            <button
              type="button"
              className={`mfg-coolant-toggle-btn ${params.coolantActive ? 'is-active' : ''}`}
              onClick={() => onParamChange({ coolantActive: !params.coolantActive })}
              onPointerEnter={() => setIntent('button', 'TOGGLE COOLANT')}
              onPointerLeave={clearIntent}
            >
              <span>{params.coolantActive ? '● ACTIVE (ON)' : '○ DISABLED (OFF)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
