export const MAX_HISTORY_POINTS = 80
export const WORLD_SCALE = 1
export const MOTION_BOUNDS = { x: 42, y: 50, width: 516, height: 260 }
export const INITIAL_MOTION = { throttle: 34, brake: 0, steering: 0 }
export const INITIAL_TRACK_PROGRESS = 0

export const TRACK = {
  centerX: 300,
  centerY: 180,
  halfWidth: 205,
  halfHeight: 100,
  cornerRadius: 48,
  laneHalfWidth: 18,
  maxLateralOffset: 15,
  pointCount: 64,
} as const

export const TRACK_STATIONS = [
  { id: 'T01', label: 'LOAD', progress: 0.08 },
  { id: 'T02', label: 'BRAKE', progress: 0.33 },
  { id: 'T03', label: 'THERMAL', progress: 0.58 },
  { id: 'T04', label: 'TRANSFER', progress: 0.83 },
] as const
