import { useEffect, useRef, useState } from 'react'
import { CursorTarget } from '../../interaction/CursorTarget'
import { TechnicalLabel } from '../../typography/TechnicalLabel'
import { useReducedMotion } from '../../../hooks/useReducedMotion'
import { useRepresentation } from '../../../app/providers/RepresentationProvider'
import { calculateFluidMechanics, clampFlow } from './fluidMechanics'

const DESKTOP_PARTICLES = 58
const MOBILE_PARTICLES = 32
const PARTICLE_RADIUS = 1.45

type Particle = { progress: number; phase: number; node?: SVGCircleElement }

const pathPoints = [
  { x: 54, y: 104 }, { x: 170, y: 104 }, { x: 248, y: 74 },
  { x: 352, y: 74 }, { x: 430, y: 104 }, { x: 546, y: 104 },
]

function samplePath(progress: number) {
  const p = Math.max(0, Math.min(0.9999, progress)) * (pathPoints.length - 1)
  const i = Math.floor(p)
  const t = p - i
  const a = pathPoints[i]
  const b = pathPoints[Math.min(i + 1, pathPoints.length - 1)]
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }
}

export function FluidMechanicsInstrument() {
  const [flow, setFlow] = useState(45)
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const reduced = useReducedMotion()
  const { isBlueprint } = useRepresentation()
  const model = calculateFluidMechanics(flow)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: '180px 0px', threshold: 0.01 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const circles = Array.from(svg.querySelectorAll<SVGCircleElement>('[data-fluid-particle]'))
    const particles: Particle[] = circles.map((node, i) => ({ progress: i / circles.length, phase: i * 0.73, node }))
    particlesRef.current = particles
    let raf = 0
    let last = performance.now()
    const render = (now: number) => {
      const dt = Math.min(32, now - last)
      last = now
      const mobile = window.innerWidth <= 600
      const count = mobile ? MOBILE_PARTICLES : DESKTOP_PARTICLES
      const speed = 0.000018 + flow * 0.00000034
      particles.forEach((particle, index) => {
        if (index >= count) {
          particle.node?.setAttribute('opacity', '0')
          return
        }
        particle.node?.setAttribute('opacity', String(isBlueprint ? 0.55 : 0.7))
        if (!reduced && visible) {
          particle.progress = (particle.progress + speed * dt) % 1
        }
        const point = samplePath(particle.progress)
        const throatBoost = particle.progress > 0.34 && particle.progress < 0.66 ? 1.55 : 1
        const wobble = reduced ? 0 : Math.sin(now * 0.002 + particle.phase) * 1.5 / throatBoost
        particle.node?.setAttribute('cx', String(point.x))
        particle.node?.setAttribute('cy', String(point.y + wobble))
        particle.node?.setAttribute('r', String(PARTICLE_RADIUS + Math.min(1.4, flow / 80) * throatBoost))
      })
      if (visible && !reduced) raf = requestAnimationFrame(render)
    }
    if (visible && !reduced) raf = requestAnimationFrame(render)
    else render(performance.now())
    return () => cancelAnimationFrame(raf)
  }, [visible, reduced, flow, isBlueprint])

  const adjust = (delta: number) => setFlow(v => clampFlow(v + delta))
  const particleCount = DESKTOP_PARTICLES
  const stroke = isBlueprint ? 'var(--representation-blueprint-line)' : 'rgba(237,241,242,.5)'
  const pipeFill = isBlueprint ? 'rgba(130,169,199,.045)' : 'rgba(255,255,255,.018)'

  return <div ref={ref} className={`fluid-instrument ${isBlueprint ? 'is-blueprint' : 'is-reality'}`}>
    <div className="fluid-instrument__visual">
      <svg ref={svgRef} viewBox="0 0 600 210" role="img" aria-label="Conceptual fluid flow through a constricted pipe">
        <path d="M40 78 H190 L270 48 H330 L410 78 H560 V132 H410 L330 162 H270 L190 132 H40 Z" fill={pipeFill} stroke={stroke} />
        <path d="M40 105 H560" stroke={isBlueprint ? 'var(--representation-blueprint-line)' : 'rgba(201,208,211,.3)'} strokeDasharray="7 7" />
        <path d="M40 105 H190 L270 75 H330 L410 105 H560" fill="none" stroke={isBlueprint ? 'rgba(130,169,199,.34)' : 'rgba(216,164,95,.42)'} />
        <path d="M40 69 v18 M40 123 v18 M560 69 v18 M560 123 v18" stroke={stroke} />
        <path d="M244 43 V167 M356 43 V167" stroke={isBlueprint ? 'rgba(130,169,199,.24)' : 'rgba(201,208,211,.14)'} strokeDasharray="3 5" />
        {Array.from({ length: particleCount }, (_, i) => <circle key={i} data-fluid-particle="true" cx="0" cy="0" r={PARTICLE_RADIUS} fill={isBlueprint ? 'var(--representation-blueprint-accent)' : 'var(--color-accent)'} />)}
        <path className="fluid-streamline fluid-streamline--one" d="M40 91 H190 L270 61 H330 L410 91 H560" fill="none" />
        <path className="fluid-streamline fluid-streamline--two" d="M40 119 H190 L270 149 H330 L410 119 H560" fill="none" />
        <path d="M110 190 H490" stroke={stroke} />
        <path d="M270 184 V196 M330 184 V196" stroke={stroke} />
      </svg>
      <div className="fluid-instrument__annotation fluid-instrument__annotation--in">INLET / FLOW →</div>
      <div className="fluid-instrument__annotation fluid-instrument__annotation--throat">THROAT / HIGH VELOCITY</div>
      <div className="fluid-instrument__annotation fluid-instrument__annotation--out">→ / OUTLET</div>
      <div className="fluid-instrument__annotation fluid-instrument__annotation--pressure">PRESSURE / CONCEPTUAL</div>
    </div>

    <div className="fluid-instrument__controls">
      <div className="fluid-regulator">
        <div className="fluid-regulator__head"><TechnicalLabel prefix="ADJUST">FLOW RATE</TechnicalLabel><output htmlFor="flow-rate">{flow} %</output></div>
        <div className="fluid-regulator__rail">
          <CursorTarget label="FLOW" intent="view"><button type="button" onClick={() => adjust(-5)} aria-label="Decrease flow rate by 5 percent">−</button></CursorTarget>
          <div className="fluid-regulator__valve" aria-hidden="true"><i style={{ transform: `rotate(${flow * 2.7 - 135}deg)` }} /></div>
          <input id="flow-rate" type="range" min="0" max="100" step="1" value={flow} onChange={e => setFlow(Number(e.target.value))} aria-label="Flow rate, 0 to 100 percent" />
          <CursorTarget label="FLOW" intent="view"><button type="button" onClick={() => adjust(5)} aria-label="Increase flow rate by 5 percent">+</button></CursorTarget>
        </div>
        <div className="fluid-regulator__scale technical-small"><span>0 / IDLE</span><span>50 / ACTIVE</span><span>100 / MAX</span></div>
      </div>

      <div className="fluid-readout">
        <div className="fluid-readout__head"><TechnicalLabel prefix="FLUID">MECHANICS</TechnicalLabel><span className="technical-small">STATE / {model.state}</span></div>
        <div className="fluid-readout__grid">
          <div><span>FLOW RATE</span><strong>{model.flowRate} %</strong></div>
          <div><span>VELOCITY / CONCEPTUAL</span><strong>+{model.velocityIndex}</strong></div>
          <div><span>PRESSURE / CONCEPTUAL</span><strong>+{model.pressureIndex}</strong></div>
          <div><span>FLOW ACTIVITY</span><strong>+{model.flowActivity}</strong></div>
        </div>
        <p className="technical-small fluid-readout__note">CONCEPTUAL MODEL / NORMALIZED VISUALIZATION / NOT A LABORATORY MEASUREMENT</p>
      </div>
    </div>
  </div>
}
