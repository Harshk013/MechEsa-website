export type Point = { x: number; y: number }

export type RoboticsModel = {
  joint1: number
  joint2: number
  link1End: Point
  endEffector: Point
  reach: number
  maxReach: number
  minReach: number
  target: Point
  targetOffset: number
  state: 'IDLE' | 'MOVING' | 'EXTENDED' | 'RETRACTED'
}

export const LINK_1 = 120
export const LINK_2 = 90
export const TARGET: Point = { x: 118, y: 92 }

export function clampAngle(value: number) {
  return Math.max(-150, Math.min(150, Math.round(value)))
}

export function degreesToRadians(degrees: number) {
  return (degrees * Math.PI) / 180
}

export function calculateForwardKinematics(joint1: number, joint2: number) {
  const theta1 = degreesToRadians(clampAngle(joint1))
  const theta2 = degreesToRadians(clampAngle(joint2))
  const link1End = { x: LINK_1 * Math.cos(theta1), y: LINK_1 * Math.sin(theta1) }
  const endEffector = {
    x: link1End.x + LINK_2 * Math.cos(theta1 + theta2),
    y: link1End.y + LINK_2 * Math.sin(theta1 + theta2),
  }
  const reach = Math.hypot(endEffector.x, endEffector.y)
  return { link1End, endEffector, reach }
}

export function calculateWorkspace() {
  return { maxReach: LINK_1 + LINK_2, minReach: Math.abs(LINK_1 - LINK_2) }
}

export function distance(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

export function calculateRobotics(joint1: number, joint2: number): RoboticsModel {
  const j1 = clampAngle(joint1)
  const j2 = clampAngle(joint2)
  const kinematics = calculateForwardKinematics(j1, j2)
  const workspace = calculateWorkspace()
  const targetOffset = distance(kinematics.endEffector, TARGET)
  const state = kinematics.reach > workspace.maxReach * 0.84
    ? 'EXTENDED'
    : kinematics.reach < workspace.minReach + (workspace.maxReach - workspace.minReach) * 0.2
      ? 'RETRACTED'
      : 'IDLE'
  return { joint1: j1, joint2: j2, ...kinematics, ...workspace, target: TARGET, targetOffset, state }
}

export function toSvgPoint(point: Point, origin: Point, scale = 1): Point {
  return { x: origin.x + point.x * scale, y: origin.y - point.y * scale }
}
