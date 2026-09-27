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
  onReset: () => void
  activeLevel?: number
  isChallengeMode?: boolean
  onSwitchMode?: (mode: 'explore' | 'challenge') => void
}

export function ManufacturingExperimentView({
  params,
  analysis,
  onParamChange,
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
      {/* ── CNC Machine Center Stage ─────────────────────────────────────── */}
      <div className="mfg-stage-card">
        <div className="mfg-stage-header">
          <div className="mfg-stage-title-wrap">
            <span className="mfg-stage-badge">3-AXIS CNC VMC</span>
            <span>SPINDLE STATUS: RUNNING ({analysis.params.spindleSpeedRpm} RPM)</span>
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
            <span>{analysis.statusLabel}</span>
          </div>
        </div>

        {/* ── Visual Machining Viewport SVG ───────────────────────────────── */}
        <div className="mfg-canvas-viewport">
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

                {/* Rotating Flute Spiral Grooves with CSS Rotation Animation */}
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

                {/* Shear Heat Glow Indicator */}
                <circle
                  cx="0"
                  cy={33 + slotDepthPx}
                  r="6"
                  fill={analysis.estimatedCuttingTempC > 350 ? '#ef4444' : '#f59e0b'}
                  opacity={analysis.estimatedCuttingTempC > 350 ? '0.75' : '0.4'}
                />

                {/* Ejecting Metallic Curling Chips Effect */}
                <g transform={`translate(${toolDiameterPx / 2 + 2}, ${28 + slotDepthPx})`}>
                  <path
                    d="M 0 0 C 8 -10, 14 -4, 18 -16"
                    stroke={analysis.material.accentColor}
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.85"
                  />
                  <path
                    d="M 2 2 C 12 -5, 18 -1, 24 -11"
                    stroke="#fbbf24"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.75"
                  />
                  <circle cx="16" cy="-14" r="1.5" fill="#f8fafc" />
                  <circle cx="22" cy="-9" r="1.2" fill="#fbbf24" />
                </g>
              </g>

              {/* Dual Flood Coolant Nozzles & Spray Jets (when active) */}
              {analysis.params.coolantActive && (
                <g>
                  {/* Left Coolant Pipe & Nozzle */}
                  <path d="M -38 60 Q -55 80, -42 120" stroke="#475569" strokeWidth="3" fill="none" />
                  <circle cx="-42" cy="120" r="4" fill="#38bdf8" />
                  {/* Left Spray Stream targeting tool tip */}
                  <polygon
                    points={`-42,120 -38,122 0,${168 + slotDepthPx} -6,${168 + slotDepthPx}`}
                    fill="url(#mfgCoolantJet)"
                  />

                  {/* Right Coolant Pipe & Nozzle */}
                  <path d="M 38 60 Q 55 80, 42 120" stroke="#475569" strokeWidth="3" fill="none" />
                  <circle cx="42" cy="120" r="4" fill="#38bdf8" />
                  {/* Right Spray Stream */}
                  <polygon
                    points={`42,120 38,122 0,${168 + slotDepthPx} 6,${168 + slotDepthPx}`}
                    fill="url(#mfgCoolantJet)"
                  />
                </g>
              )}
            </g>
          </svg>
        </div>

        {/* ── CNC Digital Readout (DRO) Live Telemetry HUD ───────────────── */}
        <div className="mfg-hud-bar">
          <div className="mfg-hud-card">
            <span className="mfg-hud-label">SURFACE SPEED (Vc)</span>
            <div className="mfg-hud-value">
              {analysis.cuttingSpeedMpm} <span className="mfg-hud-unit">m/min</span>
            </div>
            <span className="mfg-hud-subtext">Opt: {analysis.material.optimalCuttingSpeedMpm} m/min</span>
          </div>

          <div className="mfg-hud-card">
            <span className="mfg-hud-label">TABLE FEED (vf)</span>
            <div className="mfg-hud-value">
              {analysis.tableFeedMmPerMin} <span className="mfg-hud-unit">mm/min</span>
            </div>
            <span className="mfg-hud-subtext">{analysis.params.feedPerToothMm} mm/tooth</span>
          </div>

          <div className="mfg-hud-card">
            <span className="mfg-hud-label">REMOVAL RATE (MRR)</span>
            <div className="mfg-hud-value" style={{ color: '#38bdf8' }}>
              {analysis.materialRemovalRateCm3Min} <span className="mfg-hud-unit">cm³/min</span>
            </div>
            <span className="mfg-hud-subtext">Throughput Productivity</span>
          </div>

          <div className="mfg-hud-card">
            <span className="mfg-hud-label">SPINDLE LOAD (Pc)</span>
            <div className="mfg-hud-value">
              {analysis.spindlePowerKw} <span className="mfg-hud-unit">kW</span>
            </div>
            <div className="mfg-load-meter">
              <div
                className={`mfg-load-fill ${
                  analysis.isOverloaded
                    ? 'is-overload'
                    : analysis.spindleLoadPercent > 80
                    ? 'is-heavy'
                    : 'is-optimal'
                }`}
                style={{ width: `${Math.min(100, analysis.spindleLoadPercent)}%` }}
              />
            </div>
            <span className="mfg-hud-subtext">{analysis.spindleLoadPercent}% of 7.5 kW</span>
          </div>

          <div className="mfg-hud-card">
            <span className="mfg-hud-label">SURFACE FINISH (Ra)</span>
            <div className="mfg-hud-value" style={{ color: analysis.surfaceRoughnessRaUm <= 1.2 ? '#22c55e' : '#fbbf24' }}>
              {analysis.surfaceRoughnessRaUm} <span className="mfg-hud-unit">µm</span>
            </div>
            <span className="mfg-hud-subtext">
              {analysis.surfaceRoughnessRaUm <= 0.8
                ? 'Precision Ground'
                : analysis.surfaceRoughnessRaUm <= 1.6
                ? 'Smooth Finish'
                : 'Rough Commercial'}
            </span>
          </div>

          <div className="mfg-hud-card">
            <span className="mfg-hud-label">CUTTING FORCE (Fc)</span>
            <div className="mfg-hud-value">
              {analysis.tangentialCuttingForceN} <span className="mfg-hud-unit">N</span>
            </div>
            <span className="mfg-hud-subtext">Zone: ~{analysis.estimatedCuttingTempC} °C</span>
          </div>
        </div>
      </div>

      {/* ── Quick Presets Toolbar ────────────────────────────────────────── */}
      <div className="mfg-presets-bar">
        <span className="mfg-presets-label">PROCESS PRESETS:</span>
        <button
          type="button"
          className="mfg-preset-chip"
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
          className="mfg-preset-chip"
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
          className="mfg-preset-chip"
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
          className="mfg-preset-chip"
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

      {/* ── Workpiece Material Selection ─────────────────────────────────── */}
      <div className="mfg-materials-selector">
        <div className="mfg-selector-title">
          <span>01 · SELECT WORKPIECE STOCK MATERIAL</span>
        </div>

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
                <div className="mfg-material-name">{mat.name}</div>
                <div className="mfg-material-kc">kc = {mat.specificCuttingForceKc} N/mm²</div>
                <div className="mfg-material-desc">{mat.description}</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Tooling Selection Bar ────────────────────────────────────────── */}
      <div className="mfg-materials-selector">
        <div className="mfg-selector-title">
          <span>02 · SELECT CUTTER TOOLING GEOMETRY</span>
        </div>

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
                <span>{tool.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Parameter Controls Deck ──────────────────────────────────────── */}
      <div className="mfg-controls-panel">
        <div className="mfg-selector-title">
          <span>03 · CNC PROCESS PARAMETER CONTROLS</span>
        </div>

        <div className="mfg-sliders-grid">
          {/* Spindle Speed N */}
          <div className="mfg-control-group">
            <div className="mfg-control-header">
              <label htmlFor="mfg-slider-rpm" className="mfg-control-label">
                SPINDLE SPEED (N)
              </label>
              <span className="mfg-control-val">{params.spindleSpeedRpm} RPM</span>
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
            <div className="mfg-control-meta">
              <span>{MANUFACTURING_LIMITS.spindleSpeedRpm.min} RPM</span>
              <span>Vc = {analysis.cuttingSpeedMpm} m/min</span>
              <span>{MANUFACTURING_LIMITS.spindleSpeedRpm.max} RPM</span>
            </div>
          </div>

          {/* Feed per Tooth fz */}
          <div className="mfg-control-group">
            <div className="mfg-control-header">
              <label htmlFor="mfg-slider-fz" className="mfg-control-label">
                FEED PER TOOTH (fz)
              </label>
              <span className="mfg-control-val">{params.feedPerToothMm} mm/tooth</span>
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
            <div className="mfg-control-meta">
              <span>{MANUFACTURING_LIMITS.feedPerToothMm.min} mm</span>
              <span>vf = {analysis.tableFeedMmPerMin} mm/min</span>
              <span>{MANUFACTURING_LIMITS.feedPerToothMm.max} mm</span>
            </div>
          </div>

          {/* Axial Depth of Cut ap */}
          <div className="mfg-control-group">
            <div className="mfg-control-header">
              <label htmlFor="mfg-slider-ap" className="mfg-control-label">
                AXIAL DEPTH (ap)
              </label>
              <span className="mfg-control-val">{params.axialDepthMm} mm</span>
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
            <div className="mfg-control-meta">
              <span>{MANUFACTURING_LIMITS.axialDepthMm.min} mm</span>
              <span>Groove Height</span>
              <span>{MANUFACTURING_LIMITS.axialDepthMm.max} mm</span>
            </div>
          </div>

          {/* Radial Width of Cut ae */}
          <div className="mfg-control-group">
            <div className="mfg-control-header">
              <label htmlFor="mfg-slider-ae" className="mfg-control-label">
                RADIAL WIDTH (ae)
              </label>
              <span className="mfg-control-val">{params.radialWidthMm} mm</span>
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
            <div className="mfg-control-meta">
              <span>{MANUFACTURING_LIMITS.radialWidthMm.min} mm</span>
              <span>Engagement Width</span>
              <span>{MANUFACTURING_LIMITS.radialWidthMm.max} mm</span>
            </div>
          </div>
        </div>

        {/* Flood Coolant Toggle Bar */}
        <div className="mfg-coolant-row">
          <div className="mfg-coolant-label">
            <span>💧 HIGH-PRESSURE FLOOD COOLANT</span>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 400 }}>
              (Suppresses thermal build-up, extends tool life, and polishes Ra finish)
            </span>
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
  )
}
