// src/components/mechLab/experiments/automotiveModel.ts
// Mathematical model for vehicle dynamics: Acceleration, Braking, Grip, and Cornering Mechanics

export interface AutomotiveParams {
  power: number // Engine Power (%) 30% - 100%
  grip: number // Tire Grip (%) 30% - 100%
  braking: number // Braking Strength (%) 30% - 100%
  steering: number // Steering Response (%) 20% - 100%
}

export interface VehiclePerformance {
  params: AutomotiveParams
  // Acceleration
  driveForceN: number
  maxTractionN: number
  accelerationMps2: number
  accelerationG: number
  sprint0to100Sec: number
  topSpeedKmh: number
  hasWheelspin: boolean
  // Braking
  brakeForceN: number
  maxBrakeTractionN: number
  brakeDecelMps2: number
  brakingDistanceM: number
  // Cornering
  cornerRadiusM: number
  maxCornerSpeedKmh: number
  testCornerSpeedKmh: number
  lateralAccG: number
  gripMarginPercent: number
  hasCornerSkid: boolean
  // Overall Vehicle State
  balanceScore: number // 0 - 100%
  balanceRating: 'BALANCED' | 'OVERPOWERED' | 'UNDER-BRAKED' | 'LOW-GRIP'
}

export const AUTOMOTIVE_LIMITS = {
  power: { min: 30, max: 100, default: 65, step: 1, unit: '%' },
  grip: { min: 30, max: 100, default: 65, step: 1, unit: '%' },
  braking: { min: 30, max: 100, default: 65, step: 1, unit: '%' },
  steering: { min: 20, max: 100, default: 50, step: 1, unit: '%' },
}

export const VEHICLE_CONSTANTS = {
  massKg: 1250, // Sports coupe curb weight
  gravity: 9.80665, // m/s²
  normalForceN: 1250 * 9.80665, // ~12,258 N
  testCornerRadiusM: 45, // 45 m hairpin radius
  referenceSpeedKmh: 100, // 100 km/h reference
}

export function calculateAutomotivePerformance(params: AutomotiveParams): VehiclePerformance {
  // Clamp parameters within defined limits
  const p = {
    power: Math.max(AUTOMOTIVE_LIMITS.power.min, Math.min(AUTOMOTIVE_LIMITS.power.max, params.power)),
    grip: Math.max(AUTOMOTIVE_LIMITS.grip.min, Math.min(AUTOMOTIVE_LIMITS.grip.max, params.grip)),
    braking: Math.max(AUTOMOTIVE_LIMITS.braking.min, Math.min(AUTOMOTIVE_LIMITS.braking.max, params.braking)),
    steering: Math.max(AUTOMOTIVE_LIMITS.steering.min, Math.min(AUTOMOTIVE_LIMITS.steering.max, params.steering)),
  }

  // 1. Friction coefficient μ derived from grip: 30% -> 0.65 (wet road), 100% -> 1.45 (racing slicks)
  const mu = 0.65 + ((p.grip - 30) / (100 - 30)) * (1.45 - 0.65)
  const maxTractionN = mu * VEHICLE_CONSTANTS.normalForceN

  // 2. Drive force: 30% -> 3,200 N (~130 hp), 100% -> 10,200 N (~410 hp)
  const driveForceN = 3200 + ((p.power - 30) / (100 - 30)) * (10200 - 3200)

  // Wheelspin occurs when engine driving force exceeds tire road grip
  const hasWheelspin = driveForceN > maxTractionN
  const effectiveAccForceN = Math.min(driveForceN, maxTractionN)

  // Acceleration a = F / m
  const accMps2 = effectiveAccForceN / VEHICLE_CONSTANTS.massKg
  const accG = accMps2 / VEHICLE_CONSTANTS.gravity

  // 0 - 100 km/h (27.78 m/s) sprint time with slight wheelspin penalty
  const wheelspinDelay = hasWheelspin ? 0.45 : 0
  const sprint0to100Sec = Math.max(2.8, (27.78 / Math.max(0.5, accMps2)) + wheelspinDelay)

  // Top speed: 180 km/h to 290 km/h based on power
  const topSpeedKmh = Math.round(180 + ((p.power - 30) / 70) * (290 - 180))

  // 3. Braking: clamp force 30% -> 4,000 N, 100% -> 15,800 N (~1.29g max)
  const brakeForceN = 4000 + ((p.braking - 30) / 70) * (15800 - 4000)
  const effectiveBrakeForceN = Math.min(brakeForceN, maxTractionN)
  const brakeDecelMps2 = effectiveBrakeForceN / VEHICLE_CONSTANTS.massKg

  // Braking distance from 100 km/h (v = 27.78 m/s): d = v² / (2 * a)
  const vRefMps = 27.78
  const brakingDistanceM = Math.max(28, (vRefMps * vRefMps) / (2 * Math.max(1, brakeDecelMps2)))

  // 4. Cornering mechanics (R = 45m radius curve)
  // Max safe corner speed: v_max = sqrt(μ * g * R)
  const maxCornerSpeedMps = Math.sqrt(mu * VEHICLE_CONSTANTS.gravity * VEHICLE_CONSTANTS.testCornerRadiusM)
  const maxCornerSpeedKmh = maxCornerSpeedMps * 3.6

  // Vehicle test corner entry speed based on power: 50 km/h at 30% up to 82 km/h at 100%
  const testCornerSpeedKmh = Math.round(50 + ((p.power - 30) / 70) * (82 - 50))
  const testCornerSpeedMps = testCornerSpeedKmh / 3.6

  // Lateral acceleration: a_lat = v² / R
  const latAccMps2 = (testCornerSpeedMps * testCornerSpeedMps) / VEHICLE_CONSTANTS.testCornerRadiusM
  const latAccG = latAccMps2 / VEHICLE_CONSTANTS.gravity

  // Skid condition: test lateral acceleration exceeds tire lateral grip limit (μ)
  const hasCornerSkid = latAccG > mu
  const gripMarginPercent = Math.max(-50, Math.round(((mu - latAccG) / mu) * 100))

  // 5. Balance Score Calculation (0-100%)
  // Penalize mismatched setups (e.g. huge power with low grip or weak brakes)
  const powerGripDiff = Math.abs(p.power - p.grip)
  const powerBrakeDiff = Math.abs(p.power - p.braking)
  const penalty = (powerGripDiff * 0.45) + (powerBrakeDiff * 0.45)
  const balanceScore = Math.max(25, Math.min(100, Math.round(100 - penalty)))

  let balanceRating: 'BALANCED' | 'OVERPOWERED' | 'UNDER-BRAKED' | 'LOW-GRIP' = 'BALANCED'
  if (p.power > p.grip + 25) balanceRating = 'OVERPOWERED'
  else if (p.power > p.braking + 25) balanceRating = 'UNDER-BRAKED'
  else if (p.grip < 45) balanceRating = 'LOW-GRIP'

  return {
    params: p,
    driveForceN,
    maxTractionN,
    accelerationMps2: accMps2,
    accelerationG: accG,
    sprint0to100Sec,
    topSpeedKmh,
    hasWheelspin,
    brakeForceN,
    maxBrakeTractionN: maxTractionN,
    brakeDecelMps2,
    brakingDistanceM,
    cornerRadiusM: VEHICLE_CONSTANTS.testCornerRadiusM,
    maxCornerSpeedKmh,
    testCornerSpeedKmh,
    lateralAccG: latAccG,
    gripMarginPercent,
    hasCornerSkid,
    balanceScore,
    balanceRating,
  }
}

// Beginner-friendly dynamic explanation cards
export interface AutomotiveDynamicExplanation {
  whatChanged: string
  whatHappened: string
  why: string
}

export function getAutomotiveDynamicExplanation(
  current: AutomotiveParams,
  prev: AutomotiveParams
): AutomotiveDynamicExplanation {
  const pDiff = Math.abs(current.power - prev.power)
  const gDiff = Math.abs(current.grip - prev.grip)
  const bDiff = Math.abs(current.braking - prev.braking)
  const sDiff = Math.abs(current.steering - prev.steering)

  const maxDiff = Math.max(pDiff, gDiff, bDiff, sDiff)

  if (maxDiff === pDiff && pDiff > 0) {
    if (current.power > prev.power) {
      return {
        whatChanged: `You dialed POWER up to ${current.power}%.`,
        whatHappened: 'The engine delivers greater driving force, launching the car harder and reducing sprint times.',
        why: "Newton's 2nd Law (F = m·a): For a fixed vehicle weight, more forward force directly creates stronger acceleration.",
      }
    } else {
      return {
        whatChanged: `You reduced POWER to ${current.power}%.`,
        whatHappened: 'Acceleration is smoother and gentler, eliminating tire spin but taking longer to reach top speed.',
        why: 'Lower torque output stays well within the tire grip limit, preventing wheelspin at the cost of peak speed.',
      }
    }
  }

  if (maxDiff === gDiff && gDiff > 0) {
    if (current.grip > prev.grip) {
      return {
        whatChanged: `You increased GRIP to ${current.grip}%.`,
        whatHappened: 'The tires stick much more firmly to the tarmac, raising cornering speeds and stopping power.',
        why: 'Higher friction coefficient (μ) increases maximum lateral and longitudinal forces before the tires slide.',
      }
    } else {
      return {
        whatChanged: `You lowered GRIP to ${current.grip}%.`,
        whatHappened: 'The car begins to slide and skid during hard cornering or aggressive acceleration.',
        why: 'With less friction against the asphalt, centrifugal forces easily overcome tire contact patches, causing skids.',
      }
    }
  }

  if (maxDiff === bDiff && bDiff > 0) {
    if (current.braking > prev.braking) {
      return {
        whatChanged: `You boosted BRAKING strength to ${current.braking}%.`,
        whatHappened: 'The car sheds speed rapidly, dramatically shortening the stopping distance from 100 km/h.',
        why: 'Stronger brake calipers convert vehicle kinetic energy into friction heat faster, causing steeper deceleration.',
      }
    } else {
      return {
        whatChanged: `You softened BRAKING to ${current.braking}%.`,
        whatHappened: 'Deceleration is gentler, but the stopping distance lengthens significantly.',
        why: 'Lower braking force requires more meters of road to dissipate the car’s stored momentum and kinetic energy.',
      }
    }
  }

  if (maxDiff === sDiff && sDiff > 0) {
    return {
      whatChanged: `You adjusted STEERING response to ${current.steering}%.`,
      whatHappened: 'The front wheels turn more decisively into corners, altering the lateral forces on the chassis.',
      why: 'Steering angle sets the slip angle of the front tires, dictating how rapidly the vehicle pivots into the apex.',
    }
  }

  return {
    whatChanged: 'Tune POWER, GRIP, or BRAKING using the sliders.',
    whatHappened: 'Watch the vehicle chassis, wheels, speed gauges, and test run indicators react live.',
    why: 'Vehicle performance is a balance between drive force, tire friction limits, and stopping capability.',
  }
}

// Progressive Disclosure Engineering Equations
export const AUTOMOTIVE_EQUATIONS = [
  {
    title: "NEWTON'S SECOND LAW (TRACTION & ACCELERATION)",
    formula: 'F_net = m · a  ⟹  a = F_drive / m',
    explanation:
      'The forward acceleration of the car is directly proportional to the net wheel driving force and inversely proportional to vehicle curb mass.',
  },
  {
    title: 'COULOMB TIRE FRICTION LIMIT (ADHESION)',
    formula: 'F_friction ≤ μ · N = μ · m · g',
    explanation:
      'Tires can only generate traction up to the friction coefficient μ multiplied by the normal weight. Exceeding this limit causes wheelspin or skidding.',
  },
  {
    title: 'KINETIC BRAKING DISTANCE',
    formula: 'd_stop = v² / (2 · a_brake) = v² / (2 · μ · g)',
    explanation:
      'Stopping distance scales quadratically with speed (v²). Doubling your speed quadruples the required braking distance on the same tires.',
  },
  {
    title: 'CENTRIPETAL CORNERING BALANCE',
    formula: 'a_lat = v² / R ≤ μ · g',
    explanation:
      'In a curve of radius R, lateral acceleration must not exceed available tire friction μ·g. If speed is too high, the vehicle understeers or spins out.',
  },
]
