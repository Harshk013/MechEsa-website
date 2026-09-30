import { useEffect, useRef, useState } from 'react'
import { CursorTarget } from '../../interaction/CursorTarget'
import { TechnicalLabel } from '../../typography/TechnicalLabel'
import { useReducedMotion } from '../../../hooks/useReducedMotion'
import { useRepresentation } from '../../../app/providers/RepresentationProvider'
import { clampHeat, calculateThermodynamics } from './thermodynamics'
import { ThermodynamicsReadout } from './ThermodynamicsReadout'

const COUNT = 54

export function ThermodynamicsInstrument() {
  const [heat, setHeat] = useState(35)
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduced = useReducedMotion()
  const { isBlueprint } = useRepresentation()
  const model = calculateThermodynamics(heat)

  useEffect(() => {
    const n = ref.current
    if (!n) return
    const o = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), {
      rootMargin: '160px 0px',
      threshold: 0.01,
    })
    o.observe(n)
    return () => o.disconnect()
  }, [])

  useEffect(() => {
    const c = canvasRef.current
    if (!c) return
    const ctx = c.getContext('2d')
    if (!ctx) return

    const ps = Array.from({ length: COUNT }, (_, i) => ({
      x: 0.24 + ((i * 0.071) % 0.52),
      y: 0.22 + ((i * 0.137) % 0.48),
      vx: ((i % 5) - 2) * 0.0009,
      vy: (((i * 3) % 7) - 3) * 0.0008,
      p: i * 0.91,
    }))

    let raf = 0
    let last = performance.now()

    const draw = (now: number) => {
      const dt = Math.min(32, now - last)
      last = now
      drawScene(ctx, c, ps, heat, isBlueprint, now, reduced ? 0 : dt)
      if (visible && !reduced) raf = requestAnimationFrame(draw)
    }

    const resize = () => {
      const r = c.getBoundingClientRect()
      const d = Math.min(devicePixelRatio || 1, 2)
      c.width = Math.max(1, r.width * d)
      c.height = Math.max(1, r.height * d)
      ctx.setTransform(d, 0, 0, d, 0, 0)
      drawScene(ctx, c, ps, heat, isBlueprint, performance.now(), 0)
    }

    resize()
    if (visible && !reduced) raf = requestAnimationFrame(draw)
    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [visible, reduced, heat, isBlueprint])

  const adjust = (d: number) => setHeat((v) => clampHeat(v + d))

  return (
    <div ref={ref} className={`thermo-instrument ${isBlueprint ? 'is-blueprint' : 'is-reality'}`}>
      <div className="thermo-instrument__visual">
        <canvas ref={canvasRef} aria-hidden="true" />

        {isBlueprint && (
          <div className="thermo-blueprint-cad-overlay" aria-hidden="true">
            <span className="thermo-cad-title">DWG: THERMO-CYL-05 // CLOSED SYSTEM EXPANSION</span>
            <span className="thermo-cad-sub">IDEAL GAS PV = mRT · COMPRESSION RATIO r = 10.5:1</span>
            <span className="thermo-cad-tdc">TDC (TOP DEAD CENTER) ──</span>
            <span className="thermo-cad-bdc">BDC (BOTTOM DEAD CENTER) ──</span>
            <span className="thermo-cad-bore">BORE ⌀85 mm</span>
            <span className="thermo-cad-stroke">STROKE 90 mm</span>
            <span className="thermo-cad-energy">Q_IN = {(heat * 1.6).toFixed(0)} J | W_OUT = {(model.energyIndex * 8).toFixed(0)} J</span>
          </div>
        )}

        <div className="thermo-instrument__labels" aria-hidden="true">
          <span>HEAT / INPUT</span>
          <span>STATE / {model.state}</span>
          <span>PISTON AXIS ℄</span>
          <span>ENERGY → WORK</span>
        </div>

        <div className="thermo-instrument__chamber" aria-hidden="true">
          {isBlueprint && (
            <div className="thermo-chamber-blueprint-marks">
              <i className="thermo-mark-tdc" />
              <i className="thermo-mark-bdc" />
            </div>
          )}
          <div
            className="thermo-instrument__piston"
            style={{ transform: `translateY(${model.pistonPosition * 0.34}%)` }}
          />
          <div
            className="thermo-instrument__rod"
            style={{ height: `${18 + model.pistonPosition * 0.2}%` }}
          />
          <div
            className="thermo-instrument__heat-source"
            style={{ opacity: 0.2 + heat / 150 }}
          />
        </div>
      </div>

      <div className="thermo-instrument__controls">
        <div className="thermo-control">
          <div className="thermo-control__head">
            <TechnicalLabel prefix="ADJUST">HEAT INPUT</TechnicalLabel>
            <output htmlFor="heat-input">{heat} %</output>
          </div>
          <div className="thermo-control__rail">
            <CursorTarget label="HEAT" intent="view">
              <button
                type="button"
                onClick={() => adjust(-5)}
                aria-label="Decrease heat input by 5 percent"
              >
                −
              </button>
            </CursorTarget>
            <input
              id="heat-input"
              type="range"
              min="0"
              max="100"
              step="1"
              value={heat}
              onChange={(e) => setHeat(Number(e.target.value))}
              aria-label="Heat input, 0 to 100 percent"
            />
            <CursorTarget label="HEAT" intent="view">
              <button
                type="button"
                onClick={() => adjust(5)}
                aria-label="Increase heat input by 5 percent"
              >
                +
              </button>
            </CursorTarget>
          </div>
          <div className="thermo-control__scale technical-small">
            <span>0 / IDLE</span>
            <span>50 / ACTIVE</span>
            <span>100 / HIGH</span>
          </div>
        </div>
        <ThermodynamicsReadout model={model} />
      </div>
    </div>
  )
}

function drawScene(
  ctx: CanvasRenderingContext2D,
  c: HTMLCanvasElement,
  ps: { x: number; y: number; vx: number; vy: number; p: number }[],
  heat: number,
  blueprint: boolean,
  now: number,
  dt: number
) {
  const w = c.clientWidth
  const h = c.clientHeight
  ctx.clearRect(0, 0, w, h)

  // Blueprint background grid
  if (blueprint) {
    ctx.strokeStyle = 'rgba(130, 169, 199, 0.08)'
    ctx.lineWidth = 0.8
    ctx.beginPath()
    for (let gx = 0; gx < w; gx += 40) {
      ctx.moveTo(gx, 0)
      ctx.lineTo(gx, h)
    }
    for (let gy = 0; gy < h; gy += 40) {
      ctx.moveTo(0, gy)
      ctx.lineTo(w, gy)
    }
    ctx.stroke()
  }

  const line = blueprint ? 'rgba(130, 169, 199, 0.78)' : 'rgba(201, 208, 211, 0.5)'
  ctx.strokeStyle = line
  ctx.lineWidth = blueprint ? 1.2 : 1
  const x = w * 0.2
  const y = h * 0.17
  const cw = w * 0.6
  const ch = h * 0.6
  ctx.strokeRect(x, y, cw, ch)

  // Cylinder centerline
  ctx.setLineDash(blueprint ? [10, 4, 2, 4] : [5, 5])
  ctx.strokeStyle = blueprint ? 'rgba(130, 169, 199, 0.6)' : line
  ctx.beginPath()
  ctx.moveTo(w * 0.5, y - 28)
  ctx.lineTo(w * 0.5, y + ch + 28)
  ctx.stroke()
  ctx.setLineDash([])

  // Heat boundary
  ctx.strokeStyle = blueprint ? 'rgba(130,169,199,.34)' : 'rgba(216,164,95,.5)'
  ctx.beginPath()
  ctx.moveTo(w * 0.34, h * 0.86)
  ctx.lineTo(w * 0.66, h * 0.86)
  ctx.stroke()

  const count = w < 520 ? 28 : COUNT
  const speed = 0.35 + (heat / 100) * 1.8

  for (let i = 0; i < count; i++) {
    const p = ps[i]
    if (dt) {
      p.x += (p.vx * speed + Math.sin(now * 0.002 + p.p) * 0.0018 * speed) * dt
      p.y += (p.vy * speed + Math.cos(now * 0.0017 + p.p) * 0.0015 * speed) * dt
      if (p.x < 0.23 || p.x > 0.77) p.vx *= -1
      if (p.y < 0.22 || p.y > 0.72) p.vy *= -1
      p.x = Math.max(0.23, Math.min(0.77, p.x))
      p.y = Math.max(0.22, Math.min(0.72, p.y))
    }
    ctx.fillStyle = blueprint
      ? 'rgba(169,196,216,.85)'
      : `rgba(237,241,242,${0.24 + heat / 180})`
    ctx.beginPath()
    ctx.arc(w * p.x, h * p.y, blueprint ? 1.8 : 1.3 + speed * 0.8, 0, Math.PI * 2)
    ctx.fill()

    if (blueprint && speed > 0.8) {
      ctx.strokeStyle = 'rgba(130, 169, 199, 0.4)'
      ctx.lineWidth = 0.7
      ctx.beginPath()
      ctx.moveTo(w * p.x, h * p.y)
      ctx.lineTo(w * (p.x - p.vx * 15 * speed), h * (p.y - p.vy * 15 * speed))
      ctx.stroke()
    }
  }

  ctx.strokeStyle = blueprint
    ? `rgba(130,169,199,${0.2 + heat / 180})`
    : `rgba(216,164,95,${0.16 + heat / 130})`
  ctx.beginPath()
  ctx.moveTo(w * 0.5, h * 0.87)
  ctx.lineTo(w * 0.5, h * 0.75)
  ctx.stroke()
}
