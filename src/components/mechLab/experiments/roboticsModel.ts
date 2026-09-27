export interface Point {
  x: number
  y: number
}

export interface Obstacle {
  x: number
  y: number
  width: number
  height: number
  label: string
}

export interface RoboticsState {
  shoulderAngle: number // degrees (theta 1)
  elbowAngle: number // degrees (theta 2)
  target: Point
  targetRadius: number
  obstacle?: Obstacle
}

export interface RoboticsKinematics {
  link1Length: number
  link2Length: number
  shoulder: Point
  elbow: Point
  hand: Point
  reach: number
  maxReach: number
  minReach: number
  distanceToTarget: number
  isTargetReached: boolean
  hasObstacleCollision: boolean
  posture: 'ELBOW_UP' | 'ELBOW_DOWN' | 'ALIGNED'
}

export const ROBOT_ARM_CONFIG = {
  link1Length: 140,
  link2Length: 110,
  shoulderMinAngle: -35,
  shoulderMaxAngle: 125,
  elbowMinAngle: -140,
  elbowMaxAngle: 140,
  origin: { x: 80, y: 220 }, // SVG canvas coordinates for base
  scale: 1.0,
}

export const DEFAULT_ROBOTICS_STATE: RoboticsState = {
  shoulderAngle: 35,
  elbowAngle: 45,
  target: { x: 135, y: 105 },
  targetRadius: 36,
}

export const ROBOTICS_LEVEL_TARGETS: Record<number, { target: Point; radius: number; obstacle?: Obstacle; objective: string; hint: string }> = {
  1: {
    target: { x: 145, y: 110 },
    radius: 38,
    objective: 'Move the robot hand into the target zone.',
    hint: 'Move the Shoulder slider first to point towards the target, then adjust the Elbow.',
  },
  2: {
    target: { x: 115, y: 155 },
    radius: 18,
    objective: 'Position the hand inside the smaller precision pickup zone.',
    hint: 'Fine-tune both angles in small increments. Look at the live distance readout.',
  },
  3: {
    target: { x: 150, y: 90 },
    radius: 22,
    obstacle: { x: 45, y: 35, width: 55, height: 65, label: 'HAZARD ZONE' },
    objective: 'Reach the target without touching the hazard barrier.',
    hint: 'There are two ways to reach a point: elbow-up and elbow-down. Try folding the elbow upward over the barrier.',
  },
}

export function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180
}

export function radiansToDegrees(radians: number): number {
  return (radians * 180) / Math.PI
}

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val))
}

// Check distance between two points
export function getDistance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

// Distance from line segment AB to point P
function distToSegmentSquared(p: Point, v: Point, w: Point): number {
  const l2 = Math.hypot(v.x - w.x, v.y - w.y) ** 2
  if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y) ** 2
  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2
  t = Math.max(0, Math.min(1, t))
  return Math.hypot(p.x - (v.x + t * (w.x - v.x)), p.y - (v.y + t * (w.y - v.y))) ** 2
}

// Check if a line segment intersects a box (rectangle)
export function segmentIntersectsBox(p1: Point, p2: Point, box: Obstacle): boolean {
  // Test center proximity and corners
  const boxCenter = { x: box.x + box.width / 2, y: box.y + box.height / 2 }
  const boxRadius = Math.max(box.width, box.height) / 2
  const distSq = distToSegmentSquared(boxCenter, p1, p2)
  if (distSq < (boxRadius * 0.9) ** 2) return true

  // Sample points along segment
  const steps = 10
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const sx = p1.x + t * (p2.x - p1.x)
    const sy = p1.y + t * (p2.y - p1.y)
    if (sx >= box.x && sx <= box.x + box.width && sy >= box.y && sy <= box.y + box.height) {
      return true
    }
  }
  return false
}

// Calculate Forward Kinematics
export function calculateRoboticsKinematics(
  shoulderAngle: number,
  elbowAngle: number,
  target: Point,
  targetRadius: number,
  obstacle?: Obstacle
): RoboticsKinematics {
  const sAngle = clamp(shoulderAngle, ROBOT_ARM_CONFIG.shoulderMinAngle, ROBOT_ARM_CONFIG.shoulderMaxAngle)
  const eAngle = clamp(elbowAngle, ROBOT_ARM_CONFIG.elbowMinAngle, ROBOT_ARM_CONFIG.elbowMaxAngle)

  const th1 = degreesToRadians(sAngle)
  const th2 = degreesToRadians(eAngle)

  const L1 = ROBOT_ARM_CONFIG.link1Length
  const L2 = ROBOT_ARM_CONFIG.link2Length

  const shoulder: Point = { x: 0, y: 0 }
  const elbow: Point = {
    x: L1 * Math.cos(th1),
    y: L1 * Math.sin(th1),
  }
  const hand: Point = {
    x: elbow.x + L2 * Math.cos(th1 + th2),
    y: elbow.y + L2 * Math.sin(th1 + th2),
  }

  const reach = Math.hypot(hand.x, hand.y)
  const maxReach = L1 + L2
  const minReach = Math.abs(L1 - L2)

  const distanceToTarget = getDistance(hand, target)
  const isTargetReached = distanceToTarget <= targetRadius

  // Check collision with obstacle if present
  let hasObstacleCollision = false
  if (obstacle) {
    const link1Hits = segmentIntersectsBox(shoulder, elbow, obstacle)
    const link2Hits = segmentIntersectsBox(elbow, hand, obstacle)
    const handHits =
      hand.x >= obstacle.x &&
      hand.x <= obstacle.x + obstacle.width &&
      hand.y >= obstacle.y &&
      hand.y <= obstacle.y + obstacle.height

    hasObstacleCollision = link1Hits || link2Hits || handHits
  }

  const posture = eAngle > 5 ? 'ELBOW_UP' : eAngle < -5 ? 'ELBOW_DOWN' : 'ALIGNED'

  return {
    link1Length: L1,
    link2Length: L2,
    shoulder,
    elbow,
    hand,
    reach,
    maxReach,
    minReach,
    distanceToTarget,
    isTargetReached,
    hasObstacleCollision,
    posture,
  }
}

// Inverse Kinematics calculation to auto-reach a target
export function calculateInverseKinematics(
  target: Point,
  preferElbowUp = true
): { shoulderAngle: number; elbowAngle: number; isReachable: boolean } {
  const L1 = ROBOT_ARM_CONFIG.link1Length
  const L2 = ROBOT_ARM_CONFIG.link2Length

  const dist = Math.hypot(target.x, target.y)
  const maxR = L1 + L2
  const minR = Math.abs(L1 - L2)

  if (dist > maxR || dist < minR || dist === 0) {
    return { shoulderAngle: 35, elbowAngle: 45, isReachable: false }
  }

  // Law of Cosines for elbow angle theta 2
  const cosTheta2 = clamp((dist ** 2 - L1 ** 2 - L2 ** 2) / (2 * L1 * L2), -1, 1)
  let theta2Rad = Math.acos(cosTheta2)
  if (!preferElbowUp) {
    theta2Rad = -theta2Rad
  }

  // Shoulder angle theta 1
  const alpha = Math.atan2(target.y, target.x)
  const beta = Math.atan2(L2 * Math.sin(theta2Rad), L1 + L2 * Math.cos(theta2Rad))
  const theta1Rad = alpha - beta

  const sAngle = Math.round(radiansToDegrees(theta1Rad))
  const eAngle = Math.round(radiansToDegrees(theta2Rad))

  return {
    shoulderAngle: clamp(sAngle, ROBOT_ARM_CONFIG.shoulderMinAngle, ROBOT_ARM_CONFIG.shoulderMaxAngle),
    elbowAngle: clamp(eAngle, ROBOT_ARM_CONFIG.elbowMinAngle, ROBOT_ARM_CONFIG.elbowMaxAngle),
    isReachable: true,
  }
}

// Beginner-friendly dynamic explanation
export function getRoboticsDynamicExplanation(
  currentShoulder: number,
  prevShoulder: number,
  currentElbow: number,
  prevElbow: number
): { whatChanged: string; whatHappened: string; why: string } {
  const shoulderDiff = Math.abs(currentShoulder - prevShoulder)
  const elbowDiff = Math.abs(currentElbow - prevElbow)

  if (shoulderDiff >= elbowDiff && shoulderDiff > 0) {
    const dir = currentShoulder > prevShoulder ? 'upward / counter-clockwise' : 'downward / clockwise'
    return {
      whatChanged: `You moved the SHOULDER joint by ${shoulderDiff}° ${dir}.`,
      whatHappened: 'The entire robot arm pivoted from its base, sweeping the elbow and hand across the workspace.',
      why: 'Because all parts of the arm connect to the shoulder, changing the base joint moves everything downstream.',
    }
  }

  if (elbowDiff > 0) {
    const dir = currentElbow > prevElbow ? 'curled inward' : 'unfolded outward'
    return {
      whatChanged: `You rotated the ELBOW joint by ${elbowDiff}° (${dir}).`,
      whatHappened: 'The forearm folded relative to the upper arm, altering the distance of the hand from the base.',
      why: 'The elbow controls how bent the arm is. Extending it reaches further, while bending it brings the hand closer.',
    }
  }

  return {
    whatChanged: 'Move either the Shoulder or Elbow slider.',
    whatHappened: 'Watch the joints pivot and guide the robot hand toward the target.',
    why: 'Together, the two angles determine the exact position (X, Y) of the robot hand.',
  }
}
