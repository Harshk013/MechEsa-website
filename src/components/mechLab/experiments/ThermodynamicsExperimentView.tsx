import { useEffect, useRef, useState, useMemo } from 'react'
import type { ThermodynamicsCycleData } from '../../../data/mechLabTypes'
import { useRepresentation } from '../../../app/providers/RepresentationProvider'
import { useReducedMotion } from '../../../hooks/useReducedMotion'
import './thermodynamics.css'

interface ThermoViewProps {
  cycleData: ThermodynamicsCycleData
  heatInput: number
  compressionRatio: number
}

export type CycleStage = 1 | 2 | 3 | 4

export function ThermodynamicsExperimentView({
  cycleData,
  heatInput,
  compressionRatio,
}: ThermoViewProps) {
  const [activeTab, setActiveTab] = useState<'hero' | 'dual' | 'graph'>('hero')
  const [stage, setStage] = useState<CycleStage>(1)
  const [isAutoCycling, setIsAutoCycling] = useState<boolean>(true)
  const { isBlueprint } = useRepresentation()
  const reducedMotion = useReducedMotion()

  // Auto-cycling timer: cycles 1 -> 2 -> 3 -> 4 every 1.8s when enabled
  useEffect(() => {
    if (!isAutoCycling || reducedMotion) return
    const timer = setInterval(() => {
      setStage((prev) => (prev === 4 ? 1 : ((prev + 1) as CycleStage)))
    }, 1800)
    return () => clearInterval(timer)
  }, [isAutoCycling, reducedMotion])

  const handleToggleRunning = () => {
    setIsAutoCycling((prev) => !prev)
  }

  const handleNextStage = () => {
    setStage((prev) => (prev === 4 ? 1 : ((prev + 1) as CycleStage)))
  }

  const handleResetEngine = () => {
    setStage(1)
    setIsAutoCycling(false)
  }

  // Friendly beginner stage details
  const stageDescriptions = {
    1: {
      name: 'INTAKE',
      step: '1 of 4',
      short: 'Piston draws fresh air mixture into the cylinder as volume expands.',
      action: 'Cylinder volume fills to maximum (BDC).',
    },
    2: {
      name: 'COMPRESS',
      step: '2 of 4',
      short: 'Piston pushes upward, squeezing the mixture into a tiny clearance space.',
      action: 'Volume shrinks to minimum (TDC), pressure and temperature rise.',
    },
    3: {
      name: 'IGNITE',
      step: '3 of 4',
      short: 'Spark plug ignites the trapped air, producing sudden peak combustion pressure.',
      action: 'Instant heat release drives peak pressure P₃ to maximum.',
    },
    4: {
      name: 'EXPAND',
      step: '4 of 4',
      short: 'High combustion pressure forces the piston down during the power stroke.',
      action: 'Expanding hot gas does mechanical work on the piston.',
    },
  }

  return (
    <div className="thermo-exp">
      {/* ── Header: Simple, Direct & Approachable ──────────────── */}
      <div className="thermo-exp__header-bar">
        <div className="thermo-exp__title-group">
          <div className="thermo-exp__badge">
            <span className="thermo-exp__badge-dot" aria-hidden="true" />
            <span>ENGINE EXPERIMENT</span>
          </div>
          <p className="thermo-exp__subtitle">
            Watch the piston move through the four stages of the cycle.
          </p>
          <span className="thermo-exp__tech-sub">
            Technical name: Air-standard Otto cycle
          </span>
        </div>

        {/* View Mode Tabs */}
        <div className="thermo-exp__view-tabs" role="tablist" aria-label="Experiment view mode">
          <button
            type="button"
            className={`thermo-exp__view-tab${activeTab === 'hero' ? ' is-active' : ''}`}
            onClick={() => setActiveTab('hero')}
            role="tab"
            aria-selected={activeTab === 'hero'}
          >
            ENGINE HERO
          </button>
          <button
            type="button"
            className={`thermo-exp__view-tab${activeTab === 'dual' ? ' is-active' : ''}`}
            onClick={() => setActiveTab('dual')}
            role="tab"
            aria-selected={activeTab === 'dual'}
          >
            DUAL VIEW
          </button>
          <button
            type="button"
            className={`thermo-exp__view-tab${activeTab === 'graph' ? ' is-active' : ''}`}
            onClick={() => setActiveTab('graph')}
            role="tab"
            aria-selected={activeTab === 'graph'}
          >
            P-V DIAGRAM
          </button>
        </div>
      </div>

      {/* ── Engine Control Center: Start, Auto-Cycle, Stepper ────── */}
      <div className="thermo-engine-controls" aria-label="Engine running controls">
        <div className="thermo-engine-controls__main">
          {/* Prominent Start / Pause Button */}
          <button
            type="button"
            className={`thermo-engine-btn thermo-engine-btn--start${isAutoCycling ? ' is-running' : ''}`}
            onClick={handleToggleRunning}
            aria-pressed={isAutoCycling}
          >
            <span className="thermo-engine-btn__icon" aria-hidden="true">
              {isAutoCycling ? '⏸' : '▶'}
            </span>
            <span>{isAutoCycling ? 'PAUSE ENGINE' : 'START ENGINE'}</span>
          </button>

          {/* Explicit Auto-Cycle Toggle */}
          <div className="thermo-autocycle-indicator">
            <span className="thermo-autocycle-label">AUTO CYCLE:</span>
            <button
              type="button"
              className={`thermo-autocycle-toggle${isAutoCycling ? ' is-on' : ''}`}
              onClick={handleToggleRunning}
              aria-label={`Toggle auto-cycling, currently ${isAutoCycling ? 'ON' : 'OFF'}`}
            >
              <span className="thermo-autocycle-toggle__dot" aria-hidden="true" />
              <span>{isAutoCycling ? 'ON' : 'OFF'}</span>
            </button>
          </div>

          {/* Step to Next Stage when Paused */}
          <button
            type="button"
            className="thermo-engine-btn thermo-engine-btn--step"
            onClick={handleNextStage}
            disabled={isAutoCycling}
            title={isAutoCycling ? 'Pause auto cycle first to step manually' : 'Advance to next stroke'}
          >
            <span>NEXT STAGE</span>
            <span aria-hidden="true">→</span>
          </button>

          {/* Reset Engine */}
          <button
            type="button"
            className="thermo-engine-btn thermo-engine-btn--reset"
            onClick={handleResetEngine}
            title="Reset engine to stroke 1"
          >
            <span>RESET ENGINE</span>
          </button>
        </div>

        {/* 4-Stage Visual Sequence Track */}
        <div className="thermo-stage-track" role="tablist" aria-label="Engine cycle strokes">
          {([1, 2, 3, 4] as CycleStage[]).map((s) => {
            const isCurrent = stage === s
            const desc = stageDescriptions[s]
            return (
              <button
                key={s}
                type="button"
                className={`thermo-stage-pill${isCurrent ? ' is-active' : ''}`}
                onClick={() => {
                  setStage(s)
                  setIsAutoCycling(false)
                }}
                role="tab"
                aria-selected={isCurrent}
              >
                <span className="thermo-stage-pill__num">{s}</span>
                <span className="thermo-stage-pill__name">{desc.name}</span>
              </button>
            )
          })}
        </div>

        {/* Current Stage Context Callout */}
        <div className="thermo-stage-banner">
          <div className="thermo-stage-banner__left">
            <span className="thermo-stage-banner__tag">
              STROKE {stageDescriptions[stage].step} // {stageDescriptions[stage].name}
            </span>
            <p className="thermo-stage-banner__desc">
              {stageDescriptions[stage].short}
            </p>
          </div>
          <span className="thermo-stage-banner__action">
            {stageDescriptions[stage].action}
          </span>
        </div>
      </div>

      {/* ── Main Stage Area: Hero or Dual View ───────────────────── */}
      <div className={`thermo-exp__stage-wrapper thermo-exp__stage-wrapper--${activeTab}`}>
        {(activeTab === 'hero' || activeTab === 'dual') && (
          <ThermodynamicsApparatus
            cycleData={cycleData}
            heatInput={heatInput}
            compressionRatio={compressionRatio}
            isBlueprint={isBlueprint}
            effectiveStage={stage}
            isHero={activeTab === 'hero'}
          />
        )}

        {(activeTab === 'dual' || activeTab === 'graph') && (
          <ThermodynamicsPVGraph
            cycleData={cycleData}
            isBlueprint={isBlueprint}
            effectiveStage={stage}
            onSelectStage={(s) => {
              setStage(s)
              setIsAutoCycling(false)
            }}
          />
        )}
      </div>
    </div>
  )
}

// ── 1. Hero Kinetic Cylinder Apparatus ─────────────────────────────────
interface ApparatusProps {
  cycleData: ThermodynamicsCycleData
  heatInput: number
  compressionRatio: number
  isBlueprint: boolean
  effectiveStage: CycleStage
  isHero: boolean
}

function ThermodynamicsApparatus({
  cycleData,
  heatInput,
  compressionRatio,
  isBlueprint,
  effectiveStage,
  isHero,
}: ApparatusProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chamberRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  // Calculate piston stroke height:
  // Cylinder height is 280px.
  // Cylinder head is at top: 32px.
  // TDC (Top Dead Center): piston crown is at clearance height (min: 44px, max: 72px based on r).
  // BDC (Bottom Dead Center): piston crown is at 195px.
  const clearanceHeight = Math.max(42, Math.min(74, 32 + 160 / compressionRatio))
  const bdcHeight = 195
  const isAtTdc = effectiveStage === 2 || effectiveStage === 3
  const pistonTranslateY = isAtTdc ? clearanceHeight : bdcHeight

  // Height of the trapped gas chamber (from top cylinder head 32px to piston crown)
  const chamberHeight = Math.max(16, pistonTranslateY - 32)

  // ── Particle Simulation: Strictly Contained Inside Cylinder Chamber ──
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    const count = 38 // Controlled count to prevent runaway accumulation

    // Particle velocity scales with stage temperature
    const currentTemp =
      effectiveStage === 1
        ? cycleData.t1
        : effectiveStage === 2
        ? cycleData.t2
        : effectiveStage === 3
        ? cycleData.t3
        : cycleData.t4

    const tempRatio = Math.sqrt(Math.max(1, currentTemp / 300))
    const speedMultiplier = reducedMotion ? 0 : 0.95 * tempRatio

    // Initialize particles bounded inside the chamber width and height
    const w = canvas.clientWidth || 210
    const h = chamberHeight
    const particles = Array.from({ length: count }, () => ({
      x: 6 + Math.random() * Math.max(10, w - 12),
      y: 4 + Math.random() * Math.max(8, h - 8),
      vx: (Math.random() - 0.5) * 1.8 * speedMultiplier,
      vy: (Math.random() - 0.5) * 1.8 * speedMultiplier,
    }))

    const render = () => {
      const curW = canvas.clientWidth || 210
      const curH = canvas.clientHeight || chamberHeight
      if (curW === 0 || curH === 0) return

      ctx.clearRect(0, 0, curW, curH)

      // Particles glow amber/orange during State 3 (Ignition), cyan in Blueprint, crisp steel otherwise
      let color = isBlueprint ? 'rgba(111, 179, 184, 0.9)' : 'rgba(237, 241, 242, 0.85)'
      if (effectiveStage === 3) {
        color = 'rgba(235, 150, 60, 0.95)'
      }

      ctx.fillStyle = color

      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy

        // Strict clamp inside chamber boundaries
        p.x = Math.max(5, Math.min(curW - 5, p.x))
        p.y = Math.max(5, Math.min(curH - 5, p.y))

        // Strict physical collision with chamber inner walls
        if (p.x <= 5) {
          p.x = 5
          p.vx = Math.abs(p.vx)
        } else if (p.x >= curW - 5) {
          p.x = curW - 5
          p.vx = -Math.abs(p.vx)
        }

        // Strict physical collision with top cylinder head and moving piston crown
        if (p.y <= 5) {
          p.y = 5
          p.vy = Math.abs(p.vy)
        } else if (p.y >= curH - 5) {
          p.y = curH - 5
          p.vy = -Math.abs(p.vy)
        }

        ctx.beginPath()
        ctx.arc(p.x, p.y, effectiveStage === 3 ? 2.5 : 2, 0, Math.PI * 2)
        ctx.fill()
      })

      if (!reducedMotion) {
        raf = requestAnimationFrame(render)
      }
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const curW = canvas.clientWidth || 210
      const curH = chamberHeight
      canvas.width = curW * dpr
      canvas.height = curH * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      render()
    }

    resize()
    return () => {
      cancelAnimationFrame(raf)
    }
  }, [cycleData, effectiveStage, chamberHeight, isBlueprint, reducedMotion])

  return (
    <div className={`thermo-apparatus${isBlueprint ? ' is-blueprint' : ''}${isHero ? ' is-hero' : ''}`}>
      {/* Top telemetry tags */}
      <div className="thermo-apparatus__top-tags">
        <span className="thermo-apparatus__tag">
          BORE: 85.0 mm // STROKE: {cycleData.totalVolume - cycleData.clearanceVolume} cm³
        </span>
        <span
          className="thermo-apparatus__tag"
          style={{ color: effectiveStage === 3 ? 'var(--color-signal)' : 'var(--sys-thermodynamics)' }}
        >
          {effectiveStage === 1 && 'INTAKE AT BDC'}
          {effectiveStage === 2 && 'COMPRESSION AT TDC'}
          {effectiveStage === 3 && 'COMBUSTION IGNITION (P_max)'}
          {effectiveStage === 4 && 'POWER EXPANSION'}
        </span>
      </div>

      {/* Centered Mechanical Cylinder */}
      <div className="thermo-apparatus__stage">
        <div className="thermo-cylinder" role="img" aria-label="Engine cylinder reciprocating cross-section">
          {/* Cylinder Top Head */}
          <div className="thermo-cylinder-head" aria-hidden="true">
            {/* Left: Intake Valve (Open at Stage 1) */}
            <div className={`thermo-valve thermo-valve--intake${effectiveStage === 1 ? ' is-open' : ''}`} />
            
            {/* Center: Spark Plug with Ignition Glow at Stage 3 */}
            <div className={`thermo-spark-plug${effectiveStage === 3 ? ' is-firing' : ''}`} />

            {/* Right: Exhaust Valve (Open at Stage 4) */}
            <div className={`thermo-valve thermo-valve--exhaust${effectiveStage === 4 ? ' is-open' : ''}`} />
          </div>

          {/* ── Trapped Gas Chamber: Physical Boundary for Particles ── */}
          <div
            ref={chamberRef}
            className="thermo-gas-chamber"
            style={{
              height: `${chamberHeight}px`,
            }}
            aria-hidden="true"
          >
            {/* Ignition Radial Flare inside chamber at Stage 3 */}
            {effectiveStage === 3 && (
              <div
                className="thermo-combustion-flash"
                style={{
                  opacity: Math.min(1.0, 0.6 + heatInput / 3.0),
                }}
              />
            )}

            {/* Particles Canvas — Physically Mounted Inside Chamber */}
            <canvas ref={canvasRef} className="thermo-gas-canvas" />
          </div>

          {/* ── Moving Piston Head ─────────────────────────────────── */}
          <div
            className="thermo-piston"
            style={{
              transform: `translateY(${pistonTranslateY}px)`,
            }}
            aria-hidden="true"
          >
            <div className="thermo-piston__ring-groove" />
            <div className="thermo-piston__pin" />
          </div>

          {/* ── Connecting Rod & Wrist Pin ─────────────────────────── */}
          <div
            className="thermo-rod"
            style={{
              top: `${pistonTranslateY + 16}px`,
              height: `${Math.max(30, 260 - pistonTranslateY)}px`,
            }}
            aria-hidden="true"
          />

          {/* Blueprint Measurement Annotations */}
          {isBlueprint && (
            <>
              <span className="thermo-dim-label thermo-dim-label--clearance" style={{ top: `${clearanceHeight}px` }}>
                ◄ Vc: {cycleData.clearanceVolume} cm³
              </span>
              <span className="thermo-dim-label thermo-dim-label--bdc" style={{ top: `${bdcHeight}px` }}>
                ◄ V₁: {cycleData.totalVolume} cm³
              </span>
            </>
          )}
        </div>
      </div>

      {/* Bottom status readout */}
      <div className="thermo-apparatus__bottom-tags">
        <span className="thermo-apparatus__tag">
          TDC CLEARANCE: {cycleData.clearanceVolume} cm³
        </span>
        <span className="thermo-apparatus__tag">
          BDC TOTAL: {cycleData.totalVolume} cm³
        </span>
      </div>
    </div>
  )
}

// ── 2. Live P-V Indicator Diagram (Pressure vs Volume Graph) ───────────
interface GraphProps {
  cycleData: ThermodynamicsCycleData
  isBlueprint: boolean
  effectiveStage: CycleStage
  onSelectStage: (stage: CycleStage) => void
}

function ThermodynamicsPVGraph({
  cycleData,
  isBlueprint,
  effectiveStage,
  onSelectStage,
}: GraphProps) {
  const points = cycleData.pvCurvePoints

  // Graph dimensions in SVG coordinates
  const svgWidth = 460
  const svgHeight = 260
  const padLeft = 60
  const padRight = 30
  const padTop = 32
  const padBottom = 48

  const plotW = svgWidth - padLeft - padRight
  const plotH = svgHeight - padTop - padBottom

  // Domain & Range calculations
  const maxV = useMemo(() => Math.ceil(cycleData.totalVolume * 1.15), [cycleData.totalVolume])
  const maxP = useMemo(() => Math.ceil(cycleData.peakPressure * 1.12), [cycleData.peakPressure])

  // Coordinate mapping functions
  const toX = (v: number) => padLeft + (v / maxV) * plotW
  const toY = (p: number) => padTop + plotH - (p / maxP) * plotH

  // Construct SVG Path String for the closed cycle
  const pathD = useMemo(() => {
    if (!points || points.length === 0) return ''
    return points
      .map((pt, idx) => {
        const x = toX(pt.volume).toFixed(1)
        const y = toY(pt.pressure).toFixed(1)
        return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`
      })
      .concat('Z')
      .join(' ')
  }, [points, maxV, maxP])

  // Key state coordinates for labeled markers
  const state1 = { x: toX(cycleData.v1), y: toY(cycleData.p1) }
  const state2 = { x: toX(cycleData.v2), y: toY(cycleData.p2) }
  const state3 = { x: toX(cycleData.v2), y: toY(cycleData.p3) }
  const state4 = { x: toX(cycleData.v1), y: toY(cycleData.p4) }

  return (
    <div className={`thermo-graph-card${isBlueprint ? ' is-blueprint' : ''}`}>
      <div className="thermo-graph-card__head">
        <div>
          <h3 className="thermo-graph-card__title">P-V INDICATOR DIAGRAM</h3>
          <span style={{ fontSize: '0.68rem', color: 'var(--color-text-dim)' }}>
            CLICK 1, 2, 3, 4 TO STEP TO STROKE
          </span>
        </div>
        <span className="thermo-graph-card__badge">
          CLOSED AIR-STANDARD CYCLE
        </span>
      </div>

      <div className="thermo-graph-card__svg-container">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="thermo-graph-svg"
          role="img"
          aria-label="Pressure-Volume indicator diagram of Otto cycle"
        >
          {/* Horizontal grid lines */}
          {[0.25, 0.5, 0.75, 1.0].map((frac) => {
            const y = padTop + plotH * (1 - frac)
            const pVal = Math.round(maxP * frac)
            return (
              <g key={`h-${frac}`}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={svgWidth - padRight}
                  y2={y}
                  className="thermo-graph-svg__grid-line"
                />
                <text x={padLeft - 6} y={y + 3} textAnchor="end" className="thermo-graph-svg__label">
                  {pVal > 1000 ? `${(pVal / 1000).toFixed(1)}k` : pVal}
                </text>
              </g>
            )
          })}

          {/* Vertical grid lines */}
          {[0.25, 0.5, 0.75, 1.0].map((frac) => {
            const x = padLeft + plotW * frac
            const vVal = Math.round(maxV * frac)
            return (
              <g key={`v-${frac}`}>
                <line
                  x1={x}
                  y1={padTop}
                  x2={x}
                  y2={padTop + plotH}
                  className="thermo-graph-svg__grid-line"
                />
                <text x={x} y={svgHeight - padBottom + 16} textAnchor="middle" className="thermo-graph-svg__label">
                  {vVal}
                </text>
              </g>
            )
          })}

          {/* Axes */}
          <line
            x1={padLeft}
            y1={padTop + plotH}
            x2={svgWidth - padRight + 10}
            y2={padTop + plotH}
            className="thermo-graph-svg__axis"
          />
          <line
            x1={padLeft}
            y1={padTop + plotH}
            x2={padLeft}
            y2={padTop - 10}
            className="thermo-graph-svg__axis"
          />

          {/* Axis Titles with Clear Explanations */}
          <text
            x={svgWidth - padRight}
            y={svgHeight - 12}
            textAnchor="end"
            className="thermo-graph-svg__label"
            style={{ fontWeight: 700 }}
          >
            Volume V (cm³) →
          </text>
          <text
            x={padLeft}
            y={padTop - 16}
            textAnchor="start"
            className="thermo-graph-svg__label"
            style={{ fontWeight: 700 }}
          >
            ↑ Pressure P (kPa)
          </text>

          {/* Shaded Cycle Work Area: W_net = ∮ P dV */}
          {pathD && <path d={pathD} className="thermo-graph-svg__area" />}

          {/* Thermodynamic Cycle Curve */}
          {pathD && <path d={pathD} className="thermo-graph-svg__curve" />}

          {/* Key Cycle State Points with Click to Step */}
          <g style={{ cursor: 'pointer' }}>
            {/* State 1: Intake BDC */}
            <circle
              cx={state1.x}
              cy={state1.y}
              r={effectiveStage === 1 ? 7.5 : 4.5}
              className="thermo-graph-svg__point"
              style={effectiveStage === 1 ? { fill: '#ffffff', stroke: 'var(--color-signal)', strokeWidth: 2.5 } : {}}
              onClick={() => onSelectStage(1)}
            />
            <text
              x={state1.x + 8}
              y={state1.y + 4}
              className="thermo-graph-svg__state-label"
              onClick={() => onSelectStage(1)}
              style={effectiveStage === 1 ? { fill: 'var(--color-signal)' } : {}}
            >
              1. Intake
            </text>

            {/* State 2: Compress TDC */}
            <circle
              cx={state2.x}
              cy={state2.y}
              r={effectiveStage === 2 ? 7.5 : 4.5}
              className="thermo-graph-svg__point"
              style={effectiveStage === 2 ? { fill: '#ffffff', stroke: 'var(--color-signal)', strokeWidth: 2.5 } : {}}
              onClick={() => onSelectStage(2)}
            />
            <text
              x={state2.x - 8}
              y={state2.y - 4}
              textAnchor="end"
              className="thermo-graph-svg__state-label"
              onClick={() => onSelectStage(2)}
              style={effectiveStage === 2 ? { fill: 'var(--color-signal)' } : {}}
            >
              2. Compress
            </text>

            {/* State 3: Ignite P_max */}
            <circle
              cx={state3.x}
              cy={state3.y}
              r={effectiveStage === 3 ? 7.5 : 4.5}
              className="thermo-graph-svg__point"
              style={effectiveStage === 3 ? { fill: '#ffffff', stroke: 'var(--color-signal)', strokeWidth: 2.5 } : {}}
              onClick={() => onSelectStage(3)}
            />
            <text
              x={state3.x + 8}
              y={state3.y + 2}
              className="thermo-graph-svg__state-label"
              onClick={() => onSelectStage(3)}
              style={effectiveStage === 3 ? { fill: 'var(--color-signal)' } : {}}
            >
              3. Ignite
            </text>

            {/* State 4: Expand Exhaust */}
            <circle
              cx={state4.x}
              cy={state4.y}
              r={effectiveStage === 4 ? 7.5 : 4.5}
              className="thermo-graph-svg__point"
              style={effectiveStage === 4 ? { fill: '#ffffff', stroke: 'var(--color-signal)', strokeWidth: 2.5 } : {}}
              onClick={() => onSelectStage(4)}
            />
            <text
              x={state4.x + 8}
              y={state4.y - 4}
              className="thermo-graph-svg__state-label"
              onClick={() => onSelectStage(4)}
              style={effectiveStage === 4 ? { fill: 'var(--color-signal)' } : {}}
            >
              4. Expand
            </text>
          </g>

          {/* Centered Area Label: Enclosed Area = Net Work W_net */}
          <text
            x={(state1.x + state2.x) / 2}
            y={(state1.y + state3.y) / 2 + 6}
            textAnchor="middle"
            className="thermo-graph-svg__label"
            style={{ fill: isBlueprint ? '#6fb3b8' : '#c77b78', fontWeight: 700, fontSize: 11 }}
          >
            Enclosed Area = Net Work (W_net)
          </text>
          <text
            x={(state1.x + state2.x) / 2}
            y={(state1.y + state3.y) / 2 + 20}
            textAnchor="middle"
            className="thermo-graph-svg__label"
            style={{ fill: 'var(--color-text)', fontWeight: 800, fontSize: 13 }}
          >
            {cycleData.netWork} kJ
          </text>
        </svg>
      </div>
    </div>
  )
}

