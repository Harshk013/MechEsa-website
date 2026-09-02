import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '../../../hooks/useReducedMotion'
import { useRepresentation } from '../../../app/providers/RepresentationProvider'
import { CursorTarget } from '../../interaction/CursorTarget'
import { INITIAL_MOTION, INITIAL_TRACK_PROGRESS, MAX_HISTORY_POINTS, TRACK, TRACK_STATIONS } from './engineeringMotion.constants'
import { buildTrack, buildTrackStationMarkers, calculateMotionState, getTrackStation, sampleTrack } from './engineeringMotion.model'
import type { MotionSample, TrackSample, TrackStation } from './engineeringMotion.types'
import { MotionTrace } from './MotionTrace'

const TRACK_MODEL = buildTrack()
const TRACK_STATION_MARKERS = buildTrackStationMarkers(TRACK_MODEL)
const TRACK_CENTERLINE_POINTS = `${TRACK_MODEL.points.map(point => `${point.x},${point.y}`).join(' ')} ${TRACK_MODEL.points[0].x},${TRACK_MODEL.points[0].y}`
const INITIAL_TRACK_SAMPLE: TrackSample = { x: 0, y: 0, tangentX: 1, tangentY: 0 }

function deriveVehicleState(progress: number, steering: number, sample: TrackSample = INITIAL_TRACK_SAMPLE) {
  sampleTrack(TRACK_MODEL, progress, sample)
  const normalX = -sample.tangentY
  const normalY = sample.tangentX
  const steeringRatio = steering / 100
  return {
    x: sample.x + normalX * steeringRatio * TRACK.maxLateralOffset,
    y: sample.y + normalY * steeringRatio * TRACK.maxLateralOffset,
    heading: Math.atan2(sample.tangentY, sample.tangentX) + steeringRatio * 0.12,
    speed: 0,
  }
}

const INITIAL_VEHICLE_STATE = deriveVehicleState(INITIAL_TRACK_PROGRESS, INITIAL_MOTION.steering)

function applyVehicleVisualState(
  refs: {
    vehicle: { current: SVGGElement | null }
    vector: { current: SVGLineElement | null }
    lateralVector: { current: SVGLineElement | null }
    thermal: { current: SVGCircleElement | null }
    frontWheels: { current: SVGGElement | null }
  },
  x: number,
  y: number,
  heading: number,
  steering: number,
  thermal: number,
) {
  const xText = x.toFixed(1)
  const yText = y.toFixed(1)
  const headingDegrees = (heading * 180 / Math.PI).toFixed(2)

  if (refs.vehicle.current) {
    refs.vehicle.current.setAttribute('transform', `translate(${xText} ${yText}) rotate(${headingDegrees})`)
  }
  if (refs.vector.current) {
    refs.vector.current.setAttribute('x1', xText)
    refs.vector.current.setAttribute('y1', yText)
    refs.vector.current.setAttribute('x2', (x + Math.cos(heading) * 45).toFixed(1))
    refs.vector.current.setAttribute('y2', (y + Math.sin(heading) * 45).toFixed(1))
  }
  if (refs.lateralVector.current) {
    const trackHeading = heading - (steering / 100) * 0.12
    const trackNormalX = -Math.sin(trackHeading)
    const trackNormalY = Math.cos(trackHeading)
    refs.lateralVector.current.setAttribute('x1', xText)
    refs.lateralVector.current.setAttribute('y1', yText)
    refs.lateralVector.current.setAttribute('x2', (x + trackNormalX * steering * 0.35).toFixed(1))
    refs.lateralVector.current.setAttribute('y2', (y + trackNormalY * steering * 0.35).toFixed(1))
  }
  if (refs.thermal.current) {
    refs.thermal.current.setAttribute('r', (6 + thermal * 0.12).toFixed(1))
  }
  if (refs.frontWheels.current) {
    refs.frontWheels.current.setAttribute('transform', `rotate(${(steering * 0.18).toFixed(2)} 28 0)`)
  }
}

function createHistoryBuffer(): MotionSample[] {
  return Array.from({ length: MAX_HISTORY_POINTS }, () => ({
    ...calculateMotionState(INITIAL_MOTION),
    x: INITIAL_VEHICLE_STATE.x,
    y: INITIAL_VEHICLE_STATE.y,
    heading: INITIAL_VEHICLE_STATE.heading,
  }))
}


export function MotionInstrument({ onStateChange, onHistoryChange }: { onStateChange?: (state: ReturnType<typeof calculateMotionState>) => void; onHistoryChange?: (samples: MotionSample[]) => void }) {
  const reduced = useReducedMotion()
  const { isBlueprint } = useRepresentation()
  const root = useRef<HTMLDivElement>(null)
  const trace = useRef<SVGPolylineElement>(null)
  const vehicle = useRef<SVGGElement>(null)
  const vector = useRef<SVGLineElement>(null)
  const lateralVector = useRef<SVGLineElement>(null)
  const thermal = useRef<SVGCircleElement>(null)
  const frontWheels = useRef<SVGGElement>(null)
  const raf = useRef(0)
  const visible = useRef(true)
  const trackProgressRef = useRef(INITIAL_TRACK_PROGRESS)
  const stateRef = useRef({ ...INITIAL_VEHICLE_STATE })
  const sampleRef = useRef<TrackSample | null>(null)
  const historyRef = useRef<MotionSample[]>([])
  if (!sampleRef.current) sampleRef.current = { x: 0, y: 0, tangentX: 1, tangentY: 0 }
  if (historyRef.current.length === 0) historyRef.current = createHistoryBuffer()
  const historyCountRef = useRef(0)
  const historyWriteRef = useRef(0)
  const [inputs, setInputs] = useState(INITIAL_MOTION)
  const [activeStation, setActiveStation] = useState<TrackStation>(TRACK_STATIONS[0])
  const modelStateRef = useRef(calculateMotionState(INITIAL_MOTION))
  const inputsRef = useRef(INITIAL_MOTION)
  const lastRef = useRef(0)
  const publishRef = useRef(0)
  const traceRenderRef = useRef(0)
  const onStateChangeRef = useRef(onStateChange)
  const onHistoryChangeRef = useRef(onHistoryChange)
  const vehicleRefs = { vehicle, vector, lateralVector, thermal, frontWheels }

  useEffect(() => {
    onStateChangeRef.current = onStateChange
  }, [onStateChange])

  useEffect(() => {
    onHistoryChangeRef.current = onHistoryChange
  }, [onHistoryChange])

  useEffect(() => {
    modelStateRef.current = calculateMotionState(inputsRef.current)
    onStateChangeRef.current?.(modelStateRef.current)
  }, [inputs])

  useEffect(() => {
    const el = root.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      visible.current = entry.isIntersecting
      if (entry.isIntersecting && !reduced && !raf.current) raf.current = requestAnimationFrame(tick)
    }, { rootMargin: '180px 0px', threshold: 0.01 })
    observer.observe(el)
    if (!reduced) raf.current = requestAnimationFrame(tick)
    return () => {
      observer.disconnect()
      if (raf.current) cancelAnimationFrame(raf.current)
      raf.current = 0
    }
  }, [reduced])

  const tick = (now: number) => {
    raf.current = 0
    if (!visible.current || reduced) return
    const state = modelStateRef.current
    const dt = Math.min(0.04, Math.max(0.001, (now - lastRef.current || 16) / 1000))
    lastRef.current = now
    const s = stateRef.current
    s.speed += (state.speed / 100 - s.speed) * Math.min(1, dt * 4)

    const progressRate = (s.speed / 100) * (0.018 + state.throttle / 100 * 0.012) * (1 - state.brake / 100 * 0.55)
    trackProgressRef.current = (trackProgressRef.current + progressRate * dt) % 1
    const trackSample = sampleTrack(TRACK_MODEL, trackProgressRef.current, sampleRef.current ?? INITIAL_TRACK_SAMPLE)
    const normalX = -trackSample.tangentY
    const normalY = trackSample.tangentX
    const lateralOffset = (state.steering / 100) * TRACK.maxLateralOffset
    const targetX = trackSample.x + normalX * lateralOffset
    const targetY = trackSample.y + normalY * lateralOffset
    s.x += (targetX - s.x) * Math.min(1, dt * 8)
    s.y += (targetY - s.y) * Math.min(1, dt * 8)
    const steeringBias = (state.steering / 100) * 0.12
    const targetHeading = Math.atan2(trackSample.tangentY, trackSample.tangentX) + steeringBias
    const headingDelta = Math.atan2(Math.sin(targetHeading - s.heading), Math.cos(targetHeading - s.heading))
    s.heading += headingDelta * Math.min(1, dt * 9)

    const historyIndex = historyWriteRef.current
    const historySample = historyRef.current[historyIndex]
    historySample.throttle = state.throttle
    historySample.brake = state.brake
    historySample.steering = state.steering
    historySample.speed = state.speed
    historySample.load = state.load
    historySample.thermal = state.thermal
    historySample.efficiency = state.efficiency
    historySample.x = s.x
    historySample.y = s.y
    historySample.heading = s.heading
    historyWriteRef.current = (historyIndex + 1) % MAX_HISTORY_POINTS
    historyCountRef.current = Math.min(MAX_HISTORY_POINTS, historyCountRef.current + 1)

    if (trace.current && now - traceRenderRef.current >= 33) {
      traceRenderRef.current = now
      const count = historyCountRef.current
      const start = count === MAX_HISTORY_POINTS ? historyWriteRef.current : 0
      let points = ''
      for (let i = 0; i < count; i += 1) {
        const item = historyRef.current[(start + i) % MAX_HISTORY_POINTS]
        if (i > 0) points += ' '
        points += `${item.x.toFixed(1)},${item.y.toFixed(1)}`
      }
      trace.current.setAttribute('points', points)
    }
    if (onHistoryChangeRef.current && now - publishRef.current > 120) {
      publishRef.current = now
      const count = historyCountRef.current
      const start = count === MAX_HISTORY_POINTS ? historyWriteRef.current : 0
      const snapshot: MotionSample[] = []
      for (let i = 0; i < count; i += 1) {
        const item = historyRef.current[(start + i) % MAX_HISTORY_POINTS]
        snapshot.push({ ...item })
      }
      onHistoryChangeRef.current?.(snapshot)
      setActiveStation(getTrackStation(trackProgressRef.current))
    }
    applyVehicleVisualState(vehicleRefs, s.x, s.y, s.heading, state.steering, state.thermal)
    raf.current = requestAnimationFrame(tick)
  }

  const update = (key: keyof typeof INITIAL_MOTION, value: number) => {
    const next = { ...inputsRef.current, [key]: value }
    inputsRef.current = next
    setInputs(next)
  }

  const reset = () => {
    inputsRef.current = INITIAL_MOTION
    setInputs(INITIAL_MOTION)
    trackProgressRef.current = INITIAL_TRACK_PROGRESS
    historyCountRef.current = 0
    historyWriteRef.current = 0
    stateRef.current = deriveVehicleState(INITIAL_TRACK_PROGRESS, INITIAL_MOTION.steering, sampleRef.current ?? INITIAL_TRACK_SAMPLE)
    modelStateRef.current = calculateMotionState(INITIAL_MOTION)
    traceRenderRef.current = 0
    setActiveStation(getTrackStation(INITIAL_TRACK_PROGRESS))
    if (trace.current) trace.current.setAttribute('points', `${stateRef.current.x.toFixed(1)},${stateRef.current.y.toFixed(1)}`)
    applyVehicleVisualState(
      vehicleRefs,
      stateRef.current.x,
      stateRef.current.y,
      stateRef.current.heading,
      INITIAL_MOTION.steering,
      modelStateRef.current.thermal,
    )
  }

  const station = activeStation
  const displayX = stateRef.current.x
  const displayY = stateRef.current.y
  const displayHeading = stateRef.current.heading

  useEffect(() => {
    if (!reduced) return
    const state = modelStateRef.current
    const derived = deriveVehicleState(trackProgressRef.current, state.steering, sampleRef.current ?? INITIAL_TRACK_SAMPLE)
    stateRef.current.x = derived.x
    stateRef.current.y = derived.y
    stateRef.current.heading = derived.heading
    applyVehicleVisualState(
      vehicleRefs,
      stateRef.current.x,
      stateRef.current.y,
      stateRef.current.heading,
      state.steering,
      state.thermal,
    )
  }, [inputs, reduced])

  return <div className={`motion-instrument ${isBlueprint ? 'is-blueprint' : 'is-reality'}`} ref={root}>
    <div className="motion-instrument__visual">
      <svg viewBox="0 0 600 360" aria-hidden="true">
        <g className="motion-track">
          <rect x="95" y="32" width="410" height="296" rx="66" />
          <rect x="131" y="68" width="338" height="224" rx="48" />
          <polyline points={TRACK_CENTERLINE_POINTS} />
          <g className="motion-track__arrows"><path d="M300 78 l8 6 -8 6 -8 -6z"/><path d="M462 180 l-6 8 -6 -8 6 -8z"/><path d="M300 282 l-8 -6 8 -6 8 6z"/><path d="M138 180 l6 -8 6 8 -6 8z"/></g>
          {TRACK_STATION_MARKERS.map(item => <g className="motion-station" key={item.id} transform={`translate(${item.x.toFixed(1)} ${item.y.toFixed(1)})`}><path d="M-8 -8 H8 M0 -8 V8"/><text x="12" y="-10">{item.id} / {item.label}</text></g>)}
        </g>
        <g className="motion-reference"><line x1="42" y1="180" x2="558" y2="180"/><line x1="300" y1="42" x2="300" y2="318"/></g>
        <MotionTrace ref={trace} points={`${INITIAL_VEHICLE_STATE.x.toFixed(1)},${INITIAL_VEHICLE_STATE.y.toFixed(1)}`} />
        <line ref={vector} className="motion-vector" x1={INITIAL_VEHICLE_STATE.x} y1={INITIAL_VEHICLE_STATE.y} x2={INITIAL_VEHICLE_STATE.x + Math.cos(INITIAL_VEHICLE_STATE.heading) * 45} y2={INITIAL_VEHICLE_STATE.y + Math.sin(INITIAL_VEHICLE_STATE.heading) * 45} />
        <line ref={lateralVector} className="motion-lateral-vector" x1={INITIAL_VEHICLE_STATE.x} y1={INITIAL_VEHICLE_STATE.y} x2={INITIAL_VEHICLE_STATE.x} y2={INITIAL_VEHICLE_STATE.y} />
        <circle ref={thermal} className="motion-thermal" cx={INITIAL_VEHICLE_STATE.x} cy={INITIAL_VEHICLE_STATE.y} r={6 + modelStateRef.current.thermal * 0.12} />
        <g ref={vehicle} className="motion-vehicle" transform={`translate(${displayX.toFixed(1)} ${displayY.toFixed(1)}) rotate(${(displayHeading * 180 / Math.PI).toFixed(2)})`}>
          <rect className="motion-chassis" x="-42" y="-20" width="84" height="40" rx="3" />
          <rect className="motion-cabin" x="-18" y="-14" width="36" height="12" rx="2" />
          <line className="motion-centerline" x1="0" y1="-30" x2="0" y2="30" />
          <g className="motion-rear-wheels"><circle cx="-28" cy="22" r="8"/><circle cx="-28" cy="-22" r="8"/></g>
          <g ref={frontWheels} className="motion-front-wheels"><circle cx="28" cy="22" r="8"/><circle cx="28" cy="-22" r="8"/></g>
          <line className="motion-axle" x1="-31" y1="0" x2="31" y2="0" />
        </g>
        <text className="motion-label motion-label--test-cell" x="48" y="48">TEST CELL / 01</text>
        <text className="motion-label motion-label--forward" x="430" y="52">FORWARD VECTOR</text>
        <text className="motion-label motion-label--lateral" x="430" y="312">LATERAL LOAD</text>
        <text className="motion-label motion-label--thermal" x="52" y="52">THERMAL ZONE</text>
        <text className="motion-label motion-label--contact" x="52" y="312">CONTACT LINE</text>
      </svg>
      <div className="motion-instrument__caption"><span>MOTION INSTRUMENT / TEST TRACK</span><span>ACTIVE TEST STATION / {station.id} / {station.label}</span><span>CONCEPTUAL PROVING GROUND</span></div>
    </div>
    <div className="motion-controls"><Control label="THROTTLE" value={inputs.throttle} min={0} max={100} onChange={v => update('throttle', v)} cursor="ADJUST THROTTLE" /><Control label="BRAKE" value={inputs.brake} min={0} max={100} onChange={v => update('brake', v)} cursor="ADJUST BRAKE" /><Control label="STEERING" value={inputs.steering} min={-100} max={100} onChange={v => update('steering', v)} cursor="ADJUST STEERING" /><CursorTarget label="RESET SYSTEM" intent="button"><button className="motion-reset" type="button" onClick={reset}>RESET</button></CursorTarget></div>
  </div>
}

function Control({ label, value, min, max, onChange, cursor }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void; cursor: string }) {
  return <CursorTarget label={cursor} intent="drag" className="motion-control"><label>{label}<output>{value > 0 ? '+' : ''}{value}</output></label><input aria-label={label} type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))} /></CursorTarget>
}
