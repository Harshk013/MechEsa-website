export type MotionState = {
  throttle: number
  brake: number
  steering: number
  speed: number
  load: number
  thermal: number
  efficiency: number
}

export type MotionStatus = 'LOW' | 'NOMINAL' | 'HIGH'

export type TrackPoint = { x: number; y: number }
export type TrackSample = { x: number; y: number; tangentX: number; tangentY: number }
export type TrackStation = { id: string; label: string; progress: number }

export type MotionSample = MotionState & { x: number; y: number; heading: number }
