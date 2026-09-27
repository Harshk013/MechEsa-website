// src/components/mechLab/experiments/MechatronicsExperimentView.tsx
// Interactive Closed-Loop Linear Stage, PID Motion Controller & Step Response Oscilloscope

import { useMemo } from 'react'
import { usePointer } from '../../interaction/PointerProvider'
import {
  calculateMechatronicsAnalysis,
  type MechatronicsAnalysis,
  MECHATRONICS_LIMITS,
} from './mechatronicsModel'
import './mechatronics.css'

export interface MechatronicsExperimentViewProps {
  targetPositionMm: number
  proportionalGainKp: number
  derivativeGainKd: number
  integralGainKi: number
  disturbanceLoadN: number
  onParamChange: (
    targetMm: number,
    kp: number,
    kd: number,
    ki: number,
    disturbanceN: number
  ) => void
  onReset: () => void
  activeLevel?: number
  isChallengeMode?: boolean
}

export function MechatronicsExperimentView({
  targetPositionMm,
  proportionalGainKp,
  derivativeGainKd,
  integralGainKi,
  disturbanceLoadN,
  onParamChange,
  onReset,
  activeLevel: _activeLevel = 1,
  isChallengeMode: _isChallengeMode = false,
}: MechatronicsExperimentViewProps) {
  const { setIntent, clearIntent } = usePointer()

  // Compute full mechatronics dynamic analysis
  const analysis: MechatronicsAnalysis = useMemo(
    () =>
      calculateMechatronicsAnalysis({
        targetPositionMm,
        proportionalGainKp,
        derivativeGainKd,
        integralGainKi,
        disturbanceLoadN,
      }),
    [targetPositionMm, proportionalGainKp, derivativeGainKd, integralGainKi, disturbanceLoadN]
  )

  // Stage coordinate mapping: travel stroke is 120px to 560px (440px span for 100mm)
  const strokeStartPx = 120
  const strokeSpanPx = 440
  const targetX = strokeStartPx + (analysis.targetPositionMm / 100) * strokeSpanPx
  const carriageX = strokeStartPx + (analysis.actualPositionMm / 100) * strokeSpanPx

  // Oscilloscope path generator
  const scopeWidth = 560
  const scopeHeight = 65
  const scopePadding = 10

  const targetScopeY = scopeHeight - (analysis.targetPositionMm / 100) * (scopeHeight - 15)
  const scopePathD = useMemo(() => {
    if (!analysis.trajectory || analysis.trajectory.length === 0) return ''
    return analysis.trajectory
      .map((pt, idx) => {
        const x = scopePadding + (pt.timeSec / 2.0) * (scopeWidth - scopePadding * 2)
        const y = scopeHeight - (Math.min(105, pt.positionMm) / 100) * (scopeHeight - 15)
        return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
      })
      .join(' ')
  }, [analysis.trajectory, scopeHeight, scopeWidth])

  return (
    <div className="mechatronics-hero-grid">
      {/* ── Left Column: Stage Visualization, Oscilloscope & DRO HUD ── */}
      <div className="mechatronics-stage-container">
        <div className="mechatronics-stage-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ color: 'var(--sys-mechatronics, #8f9fd6)', fontSize: '0.75rem' }}>●</span>
            <h3 className="mechatronics-stage-title">CLOSED-LOOP LINEAR SERVO STAGE</h3>
          </div>
          <span
            className={`mechatronics-stage-status ${
              analysis.stabilityRating === 'RINGING'
                ? 'is-ringing'
                : analysis.stabilityRating === 'OSCILLATORY'
                ? 'is-oscillatory'
                : ''
            }`}
          >
            {analysis.systemStability}
          </span>
        </div>

        {/* ── Precision SVG Linear Stage ── */}
        <div className="mechatronics-canvas-wrap" aria-label="Interactive linear positioning stage with moving carriage">
          <svg
            className="mechatronics-svg"
            viewBox="0 0 700 220"
            role="img"
            aria-label="Closed-loop linear stage showing DC servo motor, ballscrew, optical encoder and carriage"
          >
            <defs>
              <linearGradient id="mchRailGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#334155" />
                <stop offset="50%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
              <linearGradient id="mchCarriageGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#475569" />
                <stop offset="50%" stopColor="#334155" />
                <stop offset="100%" stopColor="#1e293b" />
              </linearGradient>
              <linearGradient id="mchMotorGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="70%" stopColor="#334155" />
                <stop offset="100%" stopColor="#475569" />
              </linearGradient>
              <pattern id="mchScrewThread" width="12" height="12" patternUnits="userSpaceOnUse">
                <line x1="0" y1="12" x2="12" y2="0" stroke="rgba(205, 214, 219, 0.25)" strokeWidth="1.5" />
              </pattern>
            </defs>

            {/* Background Datum Grid */}
            <path
              d="M30 40H670 M30 85H670 M30 130H670 M30 175H670 M80 20V200 M200 20V200 M320 20V200 M440 20V200 M560 20V200 M640 20V200"
              stroke="rgba(255, 255, 255, 0.03)"
              strokeWidth="1"
            />

            {/* Ground / Bench Surface */}
            <line x1="20" y1="185" x2="680" y2="185" stroke="rgba(205, 214, 219, 0.2)" strokeWidth="2" />
            <path
              d="M30 185l-10 10 M70 185l-10 10 M110 185l-10 10 M150 185l-10 10 M190 185l-10 10 M230 185l-10 10 M270 185l-10 10 M310 185l-10 10 M350 185l-10 10 M390 185l-10 10 M430 185l-10 10 M470 185l-10 10 M510 185l-10 10 M550 185l-10 10 M590 185l-10 10 M630 185l-10 10 M670 185l-10 10"
              stroke="rgba(205, 214, 219, 0.12)"
              strokeWidth="1.5"
            />

            {/* Aluminum Extrusion Guide Bed */}
            <rect x="70" y="135" width="530" height="42" rx="3" fill="url(#mchRailGrad)" stroke="rgba(205, 214, 219, 0.2)" strokeWidth="1.5" />
            <line x1="70" y1="152" x2="600" y2="152" stroke="rgba(56, 189, 248, 0.25)" strokeWidth="1" />
            <line x1="70" y1="162" x2="600" y2="162" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />

            {/* DC Servo Motor Assembly (Left End) */}
            <g transform="translate(25, 95)">
              <rect x="0" y="20" width="55" height="60" rx="3" fill="url(#mchMotorGrad)" stroke="#475569" strokeWidth="1.5" />
              {/* Motor cooling fins */}
              <line x1="12" y1="20" x2="12" y2="80" stroke="rgba(0,0,0,0.4)" strokeWidth="1" />
              <line x1="22" y1="20" x2="22" y2="80" stroke="rgba(0,0,0,0.4)" strokeWidth="1" />
              <line x1="32" y1="20" x2="32" y2="80" stroke="rgba(0,0,0,0.4)" strokeWidth="1" />
              <line x1="42" y1="20" x2="42" y2="80" stroke="rgba(0,0,0,0.4)" strokeWidth="1" />
              {/* Encoder cap */}
              <rect x="-8" y="32" width="8" height="36" rx="2" fill="#0f172a" stroke="#334155" strokeWidth="1" />
              {/* Shaft coupling */}
              <rect x="55" y="42" width="22" height="16" rx="2" fill="#64748b" stroke="#94a3b8" strokeWidth="1" />
              <text x="27" y="54" fill="#94a3b8" fontSize="7" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                DC SERVO
              </text>
            </g>

            {/* Bearing End Support Block (Right End) */}
            <rect x="595" y="115" width="25" height="62" rx="3" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
            <circle cx="607" cy="146" r="6" fill="#64748b" />

            {/* Precision Ballscrew Shaft */}
            <g>
              <rect x="100" y="141" width="495" height="10" rx="1" fill="#475569" stroke="#94a3b8" strokeWidth="1" />
              <rect x="100" y="141" width="495" height="10" fill="url(#mchScrewThread)" />
            </g>

            {/* Optical Linear Encoder Glass Scale (Under rail) */}
            <g transform="translate(120, 178)">
              <rect x="0" y="0" width="440" height="5" fill="#0f172a" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
              {/* Scale Tick Marks */}
              {[0, 20, 40, 60, 80, 100].map((val) => {
                const tx = (val / 100) * 440
                return (
                  <g key={val}>
                    <line x1={tx} y1="0" x2={tx} y2="5" stroke="#94a3b8" strokeWidth="1.5" />
                    <text x={tx} y="14" fill="#697276" fontSize="7" fontFamily="monospace" textAnchor="middle">
                      {val}
                    </text>
                  </g>
                )
              })}
            </g>

            {/* Target Setpoint Vertical Marker (Amber) */}
            <g transform={`translate(${targetX}, 0)`}>
              <line x1="0" y1="35" x2="0" y2="185" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" />
              {/* Target Flag */}
              <polygon points="0,35 48,35 42,47 48,59 0,59" fill="rgba(245, 158, 11, 0.2)" stroke="#f59e0b" strokeWidth="1.2" />
              <text x="6" y="49" fill="#f59e0b" fontSize="8" fontFamily="monospace" fontWeight="bold">
                r: {analysis.targetPositionMm}mm
              </text>
            </g>

            {/* Moving Linear Carriage Assembly */}
            <g transform={`translate(${carriageX}, 146)`}>
              {/* Carriage Main Body */}
              <rect x="-35" y="-45" width="70" height="74" rx="4" fill="url(#mchCarriageGrad)" stroke="#64748b" strokeWidth="2" />
              {/* Bearing guide shoes */}
              <rect x="-35" y="10" width="70" height="19" fill="#0f172a" stroke="#334155" strokeWidth="1" />
              {/* Ballscrew nut center */}
              <rect x="-16" y="-12" width="32" height="24" rx="2" fill="#475569" stroke="#94a3b8" strokeWidth="1" />
              <circle cx="0" cy="0" r="5" fill="#38bdf8" />

              {/* Optical Encoder Readhead Sensor Bracket */}
              <rect x="-10" y="27" width="20" height="8" rx="1" fill="#38bdf8" stroke="#0284c7" strokeWidth="1" />
              <circle cx="0" cy="31" r="2" fill="#ffffff" />

              {/* Carriage Centerline Sensed Marker */}
              <line x1="0" y1="-55" x2="0" y2="-45" stroke="#38bdf8" strokeWidth="2" />
              <polygon points="0,-45 -4,-53 4,-53" fill="#38bdf8" />

              {/* Carriage Label & Readout */}
              <text x="0" y="-22" fill="#ffffff" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                y(t)
              </text>
              <text x="0" y="-10" fill="#38bdf8" fontSize="7" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                {analysis.actualPositionMm} mm
              </text>

              {/* Disturbance Force Arrow (If Active) */}
              {disturbanceLoadN > 0 && (
                <g transform="translate(42, -15)">
                  <line x1="38" y1="0" x2="6" y2="0" stroke="#f43f5e" strokeWidth="2.5" />
                  <polygon points="6,0 14,-5 14,5" fill="#f43f5e" />
                  <text x="22" y="-7" fill="#f43f5e" fontSize="7" fontFamily="monospace" fontWeight="bold">
                    F_L: {disturbanceLoadN}N
                  </text>
                </g>
              )}
            </g>

            {/* Signal Flow Annotation */}
            <text x="350" y="28" fill="#697276" fontSize="7.5" fontFamily="monospace" textAnchor="middle" letterSpacing="0.08em">
              OPTICAL ENCODER FEEDBACK LOOP ── e(t) = r(t) − y(t) = {(analysis.trackingErrorMm).toFixed(2)} mm
            </text>
          </svg>
        </div>

        {/* ── Oscilloscope Step Response Graph ── */}
        <div className="mechatronics-scope-wrap">
          <div className="mechatronics-scope-head">
            <span className="mechatronics-scope-title">TRANSIENT STEP RESPONSE OSCILLOSCOPE [0.0s – 2.0s]</span>
            <div className="mechatronics-scope-legend">
              <span>
                <i className="legend-dot legend-dot--target" /> Commanded Setpoint r(t)
              </span>
              <span>
                <i className="legend-dot legend-dot--actual" /> Measured Position y(t)
              </span>
            </div>
          </div>

          <svg className="mechatronics-scope-svg" viewBox={`0 0 ${scopeWidth} ${scopeHeight}`}>
            {/* Grid Lines */}
            <line x1="0" y1={scopeHeight * 0.25} x2={scopeWidth} y2={scopeHeight * 0.25} stroke="rgba(255,255,255,0.06)" strokeDasharray="2 2" />
            <line x1="0" y1={scopeHeight * 0.5} x2={scopeWidth} y2={scopeHeight * 0.5} stroke="rgba(255,255,255,0.06)" strokeDasharray="2 2" />
            <line x1="0" y1={scopeHeight * 0.75} x2={scopeWidth} y2={scopeHeight * 0.75} stroke="rgba(255,255,255,0.06)" strokeDasharray="2 2" />
            <line x1={scopeWidth * 0.25} y1="0" x2={scopeWidth * 0.25} y2={scopeHeight} stroke="rgba(255,255,255,0.06)" strokeDasharray="2 2" />
            <line x1={scopeWidth * 0.5} y1="0" x2={scopeWidth * 0.5} y2={scopeHeight} stroke="rgba(255,255,255,0.06)" strokeDasharray="2 2" />
            <line x1={scopeWidth * 0.75} y1="0" x2={scopeWidth * 0.75} y2={scopeHeight} stroke="rgba(255,255,255,0.06)" strokeDasharray="2 2" />

            {/* Target Setpoint Line */}
            <line
              x1="0"
              y1={targetScopeY}
              x2={scopeWidth}
              y2={targetScopeY}
              stroke="#f59e0b"
              strokeWidth="1.2"
              strokeDasharray="4 3"
            />

            {/* Actual Step Response Trajectory */}
            <path d={scopePathD} fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* ── Under-Stage DRO Telemetry Strip ── */}
        <div className="mechatronics-dro-strip" aria-label="Digital readout telemetry metrics">
          <div className="mechatronics-dro-cell">
            <span className="mechatronics-dro-label">SETPOINT r</span>
            <span className="mechatronics-dro-val mechatronics-dro-val--target">{analysis.targetPositionMm} mm</span>
          </div>
          <div className="mechatronics-dro-cell">
            <span className="mechatronics-dro-label">ACTUAL y</span>
            <span className="mechatronics-dro-val mechatronics-dro-val--highlight">{analysis.actualPositionMm} mm</span>
          </div>
          <div className="mechatronics-dro-cell">
            <span className="mechatronics-dro-label">ERROR |e|</span>
            <span className="mechatronics-dro-val">{analysis.trackingErrorMm} mm</span>
          </div>
          <div className="mechatronics-dro-cell">
            <span className="mechatronics-dro-label">EFFORT u</span>
            <span className="mechatronics-dro-val mechatronics-dro-val--accent">{analysis.controlEffortVolts} V</span>
          </div>
          <div className="mechatronics-dro-cell">
            <span className="mechatronics-dro-label">DAMPING ζ</span>
            <span className="mechatronics-dro-val">{analysis.dampingRatio}</span>
          </div>
          <div className="mechatronics-dro-cell">
            <span className="mechatronics-dro-label">OVERSHOOT</span>
            <span className="mechatronics-dro-val">{analysis.peakOvershootPercent}%</span>
          </div>
        </div>
      </div>

      {/* ── Right Column: Parameter Controls ── */}
      <div className="mechatronics-controls-panel">
        <div className="mechatronics-controls-header">
          <h3 className="mechatronics-controls-title">CONTROLLER & SERVO CONTROLS</h3>
          <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.68rem', color: 'var(--sys-mechatronics, #8f9fd6)' }}>
            CLOSED-LOOP
          </span>
        </div>

        <div className="mechatronics-controls-group">
          {/* Target Position Slider */}
          <div className="mechatronics-control-item">
            <div className="mechatronics-control-label-row">
              <label htmlFor="mch-target-slider" className="mechatronics-control-label">
                TARGET SETPOINT (r)
              </label>
              <span className="mechatronics-control-value" style={{ color: '#f59e0b' }}>
                {targetPositionMm} mm
              </span>
            </div>
            <input
              id="mch-target-slider"
              type="range"
              min={MECHATRONICS_LIMITS.targetPositionMm.min}
              max={MECHATRONICS_LIMITS.targetPositionMm.max}
              step={MECHATRONICS_LIMITS.targetPositionMm.step}
              value={targetPositionMm}
              onChange={(e) =>
                onParamChange(
                  Number(e.target.value),
                  proportionalGainKp,
                  derivativeGainKd,
                  integralGainKi,
                  disturbanceLoadN
                )
              }
              className="mechatronics-slider"
              onPointerEnter={() => setIntent('drag', 'TARGET POSITION')}
              onPointerLeave={clearIntent}
            />
            <div className="mechatronics-control-scale">
              <span>0 mm (HOME)</span>
              <span>50 mm (MID)</span>
              <span>100 mm (END)</span>
            </div>
          </div>

          {/* Proportional Gain Kp Slider */}
          <div className="mechatronics-control-item">
            <div className="mechatronics-control-label-row">
              <label htmlFor="mch-kp-slider" className="mechatronics-control-label">
                PROPORTIONAL GAIN (Kp)
              </label>
              <span className="mechatronics-control-value">{proportionalGainKp.toFixed(1)} V/mm</span>
            </div>
            <input
              id="mch-kp-slider"
              type="range"
              min={MECHATRONICS_LIMITS.proportionalGainKp.min}
              max={MECHATRONICS_LIMITS.proportionalGainKp.max}
              step={MECHATRONICS_LIMITS.proportionalGainKp.step}
              value={proportionalGainKp}
              onChange={(e) =>
                onParamChange(
                  targetPositionMm,
                  Number(e.target.value),
                  derivativeGainKd,
                  integralGainKi,
                  disturbanceLoadN
                )
              }
              className="mechatronics-slider"
              onPointerEnter={() => setIntent('drag', 'PROPORTIONAL GAIN')}
              onPointerLeave={clearIntent}
            />
            <div className="mechatronics-control-scale">
              <span>0.5 (Compliant)</span>
              <span>7.5</span>
              <span>15.0 (Stiff)</span>
            </div>
          </div>

          {/* Derivative Gain Kd Slider */}
          <div className="mechatronics-control-item">
            <div className="mechatronics-control-label-row">
              <label htmlFor="mch-kd-slider" className="mechatronics-control-label">
                DERIVATIVE GAIN (Kd)
              </label>
              <span className="mechatronics-control-value">{derivativeGainKd.toFixed(2)} V·s/mm</span>
            </div>
            <input
              id="mch-kd-slider"
              type="range"
              min={MECHATRONICS_LIMITS.derivativeGainKd.min}
              max={MECHATRONICS_LIMITS.derivativeGainKd.max}
              step={MECHATRONICS_LIMITS.derivativeGainKd.step}
              value={derivativeGainKd}
              onChange={(e) =>
                onParamChange(
                  targetPositionMm,
                  proportionalGainKp,
                  Number(e.target.value),
                  integralGainKi,
                  disturbanceLoadN
                )
              }
              className="mechatronics-slider"
              onPointerEnter={() => setIntent('drag', 'DERIVATIVE GAIN')}
              onPointerLeave={clearIntent}
            />
            <div className="mechatronics-control-scale">
              <span>0.00 (Undamped)</span>
              <span>1.50</span>
              <span>3.00 (Heavily Damped)</span>
            </div>
          </div>

          {/* Integral Gain Ki Slider */}
          <div className="mechatronics-control-item">
            <div className="mechatronics-control-label-row">
              <label htmlFor="mch-ki-slider" className="mechatronics-control-label">
                INTEGRAL GAIN (Ki)
              </label>
              <span className="mechatronics-control-value">{integralGainKi.toFixed(1)} V/(mm·s)</span>
            </div>
            <input
              id="mch-ki-slider"
              type="range"
              min={MECHATRONICS_LIMITS.integralGainKi.min}
              max={MECHATRONICS_LIMITS.integralGainKi.max}
              step={MECHATRONICS_LIMITS.integralGainKi.step}
              value={integralGainKi}
              onChange={(e) =>
                onParamChange(
                  targetPositionMm,
                  proportionalGainKp,
                  derivativeGainKd,
                  Number(e.target.value),
                  disturbanceLoadN
                )
              }
              className="mechatronics-slider"
              onPointerEnter={() => setIntent('drag', 'INTEGRAL GAIN')}
              onPointerLeave={clearIntent}
            />
            <div className="mechatronics-control-scale">
              <span>0.0 (PD Mode)</span>
              <span>2.5</span>
              <span>5.0 (Zero Droop)</span>
            </div>
          </div>

          {/* External Disturbance Load Slider */}
          <div className="mechatronics-control-item">
            <div className="mechatronics-control-label-row">
              <label htmlFor="mch-fdist-slider" className="mechatronics-control-label">
                DISTURBANCE LOAD (F_dist)
              </label>
              <span className="mechatronics-control-value" style={{ color: disturbanceLoadN > 0 ? '#f43f5e' : '#94a3b8' }}>
                {disturbanceLoadN} N
              </span>
            </div>
            <input
              id="mch-fdist-slider"
              type="range"
              min={MECHATRONICS_LIMITS.disturbanceLoadN.min}
              max={MECHATRONICS_LIMITS.disturbanceLoadN.max}
              step={MECHATRONICS_LIMITS.disturbanceLoadN.step}
              value={disturbanceLoadN}
              onChange={(e) =>
                onParamChange(
                  targetPositionMm,
                  proportionalGainKp,
                  derivativeGainKd,
                  integralGainKi,
                  Number(e.target.value)
                )
              }
              className="mechatronics-slider"
              onPointerEnter={() => setIntent('drag', 'DISTURBANCE LOAD')}
              onPointerLeave={clearIntent}
            />
            <div className="mechatronics-control-scale">
              <span>0 N (Unloaded)</span>
              <span>25 N (Moderate)</span>
              <span>50 N (Severe)</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="mechatronics-reset-btn"
          onPointerEnter={() => setIntent('button', 'RESET')}
          onPointerLeave={clearIntent}
        >
          ↺ RESET CONTROLS
        </button>
      </div>
    </div>
  )
}
