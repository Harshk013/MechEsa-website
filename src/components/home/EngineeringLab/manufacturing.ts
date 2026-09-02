export type NormalizedPoint = { x: number; y: number }

export type ManufacturingModel = {
  progress: number
  state: 'RAW STOCK' | 'ROUGHING' | 'PROFILE FORMING' | 'FINISH PASS' | 'FINISHED PROFILE'
  pass: 'SETUP' | 'PASS / 01' | 'PASS / 02' | 'FINISH'
  profileIndex: number
  toolPosition: NormalizedPoint
  removalIndex: number
}

export const manufacturingToolpath: NormalizedPoint[] = [
  { x: 0.12, y: 0.27 },
  { x: 0.32, y: 0.27 },
  { x: 0.42, y: 0.27 },
  { x: 0.52, y: 0.40 },
  { x: 0.68, y: 0.40 },
  { x: 0.78, y: 0.27 },
  { x: 0.90, y: 0.27 },
  { x: 0.90, y: 0.67 },
  { x: 0.78, y: 0.67 },
  { x: 0.68, y: 0.54 },
  { x: 0.52, y: 0.54 },
  { x: 0.42, y: 0.67 },
  { x: 0.32, y: 0.67 },
  { x: 0.12, y: 0.67 },
]

export function clampManufacturingProgress(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)))
}

export function interpolateToolpath(points: NormalizedPoint[], progress: number): NormalizedPoint {
  if (!points.length) return { x: 0, y: 0 }
  if (points.length === 1) return points[0]
  const t = clampManufacturingProgress(progress) / 100
  const scaled = t * (points.length - 1)
  const index = Math.min(Math.floor(scaled), points.length - 2)
  const local = scaled - index
  const a = points[index]
  const b = points[index + 1]
  return { x: a.x + (b.x - a.x) * local, y: a.y + (b.y - a.y) * local }
}

export function calculateManufacturing(progress: number): ManufacturingModel {
  const value = clampManufacturingProgress(progress)
  const toolPosition = interpolateToolpath(manufacturingToolpath, value)
  const profileIndex = Math.min(4, Math.floor(value / 20))
  const removalIndex = Math.min(100, Math.max(0, Math.round((value - 4) / 0.96)))

  let state: ManufacturingModel['state'] = 'RAW STOCK'
  let pass: ManufacturingModel['pass'] = 'SETUP'
  if (value > 0 && value < 30) { state = 'ROUGHING'; pass = 'PASS / 01' }
  else if (value < 65) { state = 'PROFILE FORMING'; pass = 'PASS / 02' }
  else if (value < 100) { state = 'FINISH PASS'; pass = 'FINISH' }
  else { state = 'FINISHED PROFILE'; pass = 'FINISH' }

  return { progress: value, state, pass, profileIndex, toolPosition, removalIndex }
}
