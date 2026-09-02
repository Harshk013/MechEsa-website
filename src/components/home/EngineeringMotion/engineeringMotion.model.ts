import { MOTION_BOUNDS, TRACK, TRACK_STATIONS } from './engineeringMotion.constants'
import type { MotionState, MotionStatus, TrackPoint, TrackSample, TrackStation } from './engineeringMotion.types'

export const clamp = (v: number, min: number, max: number) => Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : min

export function calculateSpeed(throttle: number, brake: number) {
  return clamp(throttle * 0.94 - brake * 0.72, 0, 100)
}

export function calculateLoad(speed: number, steering: number, brake: number) {
  return clamp(speed * 0.56 + Math.abs(steering) * 0.30 + brake * 0.18, 0, 100)
}

export function calculateThermal(throttle: number, brake: number) {
  return clamp(throttle * 0.34 + brake * 0.58, 0, 100)
}

export function calculateEfficiency(load: number, thermal: number) {
  return clamp(100 - load * 0.28 - thermal * 0.24, 0, 100)
}

export function calculateSystemStatus(value: number): MotionStatus {
  return value < 35 ? 'LOW' : value < 72 ? 'NOMINAL' : 'HIGH'
}

export function calculateMotionState(input: { throttle: number; brake: number; steering: number }): MotionState {
  const throttle = clamp(input.throttle, 0, 100)
  const brake = clamp(input.brake, 0, 100)
  const steering = clamp(input.steering, -100, 100)
  const speed = calculateSpeed(throttle, brake)
  const load = calculateLoad(speed, steering, brake)
  const thermal = calculateThermal(throttle, brake)
  const efficiency = calculateEfficiency(load, thermal)
  return { throttle, brake, steering, speed, load, thermal, efficiency }
}

export function getInterpretation(state: MotionState) {
  if (state.brake >= 60) return { title: 'HIGH DECELERATION LOAD', body: 'Forward motion is being reduced while conceptual thermal demand increases.' }
  if (Math.abs(state.steering) >= 60) return { title: 'HIGH LATERAL DEMAND', body: 'Directional input is increasing the conceptual load index.' }
  if (state.throttle >= 70) return { title: 'HIGH PROPULSIVE DEMAND', body: 'The system is prioritising forward motion. Thermal load rises with energy input.' }
  return { title: 'STABLE OPERATING STATE', body: 'The current input combination produces a relatively balanced conceptual system response.' }
}

function pushPoint(points: TrackPoint[], x: number, y: number) {
  const previous = points[points.length - 1]
  if (!previous || Math.hypot(x - previous.x, y - previous.y) > 0.001) points.push({ x, y })
}

export type TrackModel = {
  points: TrackPoint[]
  cumulativeLengths: number[]
  totalLength: number
}

export function buildTrack(): TrackModel {
  const points: TrackPoint[] = []
  const { centerX, centerY, halfWidth, halfHeight, cornerRadius, pointCount } = TRACK
  const straightX = halfWidth - cornerRadius
  const straightY = halfHeight - cornerRadius
  // Four corners are the only curved portions. 16 samples/corner yields ~66
  // total points: dense enough for smooth visual tangents without a large mesh.
  const cornerSamples = Math.max(8, Math.round(pointCount / 4))
  const pushArc = (cx: number, cy: number, start: number, end: number) => {
    for (let i = 0; i <= cornerSamples; i += 1) {
      const t = i / cornerSamples
      const a = start + (end - start) * t
      pushPoint(points, cx + Math.cos(a) * cornerRadius, cy + Math.sin(a) * cornerRadius)
    }
  }

  pushPoint(points, centerX + straightX, centerY - halfHeight)
  pushPoint(points, centerX - straightX, centerY - halfHeight)
  pushArc(centerX - straightX, centerY - straightY, -Math.PI / 2, -Math.PI)
  pushPoint(points, centerX - halfWidth, centerY + straightY)
  pushArc(centerX - straightX, centerY + straightY, Math.PI, Math.PI / 2)
  pushPoint(points, centerX + straightX, centerY + halfHeight)
  pushArc(centerX + straightX, centerY + straightY, Math.PI / 2, 0)
  pushPoint(points, centerX + halfWidth, centerY - straightY)
  pushArc(centerX + straightX, centerY - straightY, 0, -Math.PI / 2)

  const cumulativeLengths = new Array<number>(points.length + 1).fill(0)
  for (let i = 0; i < points.length; i += 1) {
    const next = points[(i + 1) % points.length]
    cumulativeLengths[i + 1] = cumulativeLengths[i] + Math.hypot(next.x - points[i].x, next.y - points[i].y)
  }
  return { points, cumulativeLengths, totalLength: cumulativeLengths[points.length] }
}

const wrapProgress = (progress: number) => {
  if (!Number.isFinite(progress)) return 0
  const normalized = progress % 1
  return normalized < 0 ? normalized + 1 : normalized
}

export function sampleTrack(track: TrackModel, progress: number, out: TrackSample): TrackSample {
  const normalized = wrapProgress(progress)
  const distance = normalized * track.totalLength
  let segment = 0
  while (segment < track.points.length - 1 && track.cumulativeLengths[segment + 1] < distance) segment += 1

  const start = track.points[segment]
  const end = track.points[(segment + 1) % track.points.length]
  const segmentLength = Math.max(0.0001, track.cumulativeLengths[segment + 1] - track.cumulativeLengths[segment])
  const local = (distance - track.cumulativeLengths[segment]) / segmentLength
  out.x = start.x + (end.x - start.x) * local
  out.y = start.y + (end.y - start.y) * local

  // Interpolate endpoint tangents rather than using the active segment's
  // direction directly. Both adjacent segments therefore agree on the
  // tangent at every sample boundary, including the 1 → 0 loop boundary.
  const previous = track.points[(segment - 1 + track.points.length) % track.points.length]
  const next = track.points[(segment + 2) % track.points.length]
  const startTangentX = end.x - previous.x
  const startTangentY = end.y - previous.y
  const endTangentX = next.x - start.x
  const endTangentY = next.y - start.y
  const startMagnitude = Math.max(0.0001, Math.hypot(startTangentX, startTangentY))
  const endMagnitude = Math.max(0.0001, Math.hypot(endTangentX, endTangentY))
  const startX = startTangentX / startMagnitude
  const startY = startTangentY / startMagnitude
  const endX = endTangentX / endMagnitude
  const endY = endTangentY / endMagnitude
  let tangentX = startX + (endX - startX) * local
  let tangentY = startY + (endY - startY) * local
  const magnitude = Math.max(0.0001, Math.hypot(tangentX, tangentY))
  tangentX /= magnitude
  tangentY /= magnitude
  out.tangentX = tangentX
  out.tangentY = tangentY
  return out
}

export function getTrackTangent(track: TrackModel, progress: number, out: TrackSample) {
  return sampleTrack(track, progress, out)
}

export function getTrackPoint(track: TrackModel, progress: number, out: TrackSample) {
  return sampleTrack(track, progress, out)
}


export type TrackStationMarker = TrackStation & TrackSample

export function buildTrackStationMarkers(track: TrackModel): TrackStationMarker[] {
  return TRACK_STATIONS.map(station => {
    const sample: TrackSample = { x: 0, y: 0, tangentX: 1, tangentY: 0 }
    sampleTrack(track, station.progress, sample)
    return { ...station, ...sample }
  })
}

export function getTrackStation(progress: number): TrackStation {
  const normalized = ((progress % 1) + 1) % 1
  let nearest = TRACK_STATIONS[0]
  let nearestDistance = 1
  for (const station of TRACK_STATIONS) {
    const distance = Math.min(Math.abs(normalized - station.progress), 1 - Math.abs(normalized - station.progress))
    if (distance < nearestDistance) {
      nearest = station
      nearestDistance = distance
    }
  }
  return nearest
}

export function getTrackNormal(tangentX: number, tangentY: number) {
  return { x: -tangentY, y: tangentX }
}

export function getMotionBounds() {
  return MOTION_BOUNDS
}
