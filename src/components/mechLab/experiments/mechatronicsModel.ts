// src/components/mechLab/experiments/mechatronicsModel.ts
// Physics model, state calculations, step response trajectory, and governing equations for Mechatronics Flagship

export interface MechatronicsParams {
  targetPositionMm: number // Setpoint r in mm [0, 100]
  targetPosition?: number // Alias for compatibility with baseline challenge [0, 100]
  proportionalGainKp: number // Proportional gain Kp [0.5, 15.0]
  proportionalGain?: number // Alias for baseline
  derivativeGainKd: number // Derivative gain Kd [0.0, 3.0]
  derivativeGain?: number // Alias for baseline
  integralGainKi: number // Integral gain Ki [0.0, 5.0]
  disturbanceLoadN: number // External disturbance load force F_dist in N [0, 50]
}

export interface TrajectoryPoint {
  timeSec: number
  positionMm: number
  targetMm: number
  controlEffortVolts: number
}

export interface MechatronicsAnalysis {
  params: MechatronicsParams
  targetPositionMm: number
  actualPositionMm: number
  trackingErrorMm: number
  steadyStateErrorMm: number
  naturalFrequencyRadS: number // omega_n in rad/s
  naturalFrequencyHz: number // f_n in Hz
  dampingRatio: number // zeta
  peakOvershootPercent: number // Mp %
  peakTimeSec: number // tp in sec
  riseTimeSec: number // tr in sec
  settlingTimeSec: number // ts (2% band) in sec
  controlEffortVolts: number // u in Volts
  actuatorDutyPercent: number // Duty %
  systemStability: 'OPTIMAL UNDERDAMPED' | 'CRITICALLY DAMPED' | 'OVERDAMPED' | 'UNDERDAMPED' | 'UNSTABLE'
  stabilityRating: 'EXCELLENT' | 'STABLE' | 'RINGING' | 'SLOW' | 'OSCILLATORY'
  trajectory: TrajectoryPoint[]
}

export const MECHATRONICS_LIMITS = {
  targetPositionMm: { min: 0, max: 100, default: 58, step: 1, unit: 'mm' },
  proportionalGainKp: { min: 0.5, max: 15.0, default: 3.5, step: 0.1, unit: 'V/mm' },
  derivativeGainKd: { min: 0.0, max: 3.0, default: 0.6, step: 0.05, unit: 'V·s/mm' },
  integralGainKi: { min: 0.0, max: 5.0, default: 0.8, step: 0.1, unit: 'V/(mm·s)' },
  disturbanceLoadN: { min: 0, max: 50, default: 0, step: 1, unit: 'N' },
}

export const DEFAULT_MECHATRONICS_PARAMS: MechatronicsParams = {
  targetPositionMm: MECHATRONICS_LIMITS.targetPositionMm.default,
  targetPosition: MECHATRONICS_LIMITS.targetPositionMm.default,
  proportionalGainKp: MECHATRONICS_LIMITS.proportionalGainKp.default,
  proportionalGain: MECHATRONICS_LIMITS.proportionalGainKp.default,
  derivativeGainKd: MECHATRONICS_LIMITS.derivativeGainKd.default,
  derivativeGain: MECHATRONICS_LIMITS.derivativeGainKd.default,
  integralGainKi: MECHATRONICS_LIMITS.integralGainKi.default,
  disturbanceLoadN: MECHATRONICS_LIMITS.disturbanceLoadN.default,
}

// Physical constants of the linear stage workstation
const CARRIAGE_MASS_KG = 1.25 // Linear carriage mass m
const VISCOUS_DAMPING_N_S_M = 2.0 // Intrinsic mechanical rail friction c (N/(m/s))
const ACTUATOR_FORCE_CONSTANT_N_PER_V = 14.0 // Motor + ballscrew drive constant Km (N/V)

export function calculateMechatronicsAnalysis(rawParams?: Partial<MechatronicsParams>): MechatronicsAnalysis {
  const target = Math.max(
    MECHATRONICS_LIMITS.targetPositionMm.min,
    Math.min(
      MECHATRONICS_LIMITS.targetPositionMm.max,
      rawParams?.targetPositionMm ??
        rawParams?.targetPosition ??
        (rawParams && Object.keys(rawParams).length === 0 ? 0 : DEFAULT_MECHATRONICS_PARAMS.targetPositionMm)
    )
  )

  const kp = Math.max(
    MECHATRONICS_LIMITS.proportionalGainKp.min,
    Math.min(
      MECHATRONICS_LIMITS.proportionalGainKp.max,
      rawParams?.proportionalGainKp ?? rawParams?.proportionalGain ?? DEFAULT_MECHATRONICS_PARAMS.proportionalGainKp
    )
  )

  const kd = Math.max(
    MECHATRONICS_LIMITS.derivativeGainKd.min,
    Math.min(
      MECHATRONICS_LIMITS.derivativeGainKd.max,
      rawParams?.derivativeGainKd ?? rawParams?.derivativeGain ?? DEFAULT_MECHATRONICS_PARAMS.derivativeGainKd
    )
  )

  const ki = Math.max(
    MECHATRONICS_LIMITS.integralGainKi.min,
    Math.min(
      MECHATRONICS_LIMITS.integralGainKi.max,
      rawParams?.integralGainKi ?? DEFAULT_MECHATRONICS_PARAMS.integralGainKi
    )
  )

  const fDist = Math.max(
    MECHATRONICS_LIMITS.disturbanceLoadN.min,
    Math.min(
      MECHATRONICS_LIMITS.disturbanceLoadN.max,
      rawParams?.disturbanceLoadN ?? DEFAULT_MECHATRONICS_PARAMS.disturbanceLoadN
    )
  )

  const params: MechatronicsParams = {
    targetPositionMm: target,
    targetPosition: target,
    proportionalGainKp: kp,
    proportionalGain: kp,
    derivativeGainKd: kd,
    derivativeGain: kd,
    integralGainKi: ki,
    disturbanceLoadN: fDist,
  }

  // Equivalent 2nd-order closed-loop characteristics
  // m * d2y/dt2 + (c + Km * Kd) * dy/dt + Km * Kp * y = Km * Kp * r - F_dist
  const kEff = ACTUATOR_FORCE_CONSTANT_N_PER_V * kp // Effective electronic stiffness (N/m)
  const cEff = VISCOUS_DAMPING_N_S_M + ACTUATOR_FORCE_CONSTANT_N_PER_V * kd // Intrinsic rail damping + electronic derivative damping

  // Undamped natural frequency omega_n (rad/s)
  const omegaN = Math.sqrt(Math.max(0.1, kEff / CARRIAGE_MASS_KG))
  const naturalFrequencyHz = omegaN / (2 * Math.PI)

  // Damping ratio zeta = c_eff / (2 * sqrt(m * k_eff))
  const zeta = Math.max(0.01, cEff / (2 * Math.sqrt(Math.max(0.1, CARRIAGE_MASS_KG * kEff))))

  // Steady-state error under disturbance force
  // Integral gain drives steady-state disturbance error to zero!
  let steadyStateErrorMm = 0
  if (ki > 0.1) {
    steadyStateErrorMm = (fDist / kEff) / (1 + ki * 5)
  } else {
    steadyStateErrorMm = fDist / kEff
  }
  // Clamp steady-state error
  steadyStateErrorMm = Number(steadyStateErrorMm.toFixed(2))

  // Peak Overshoot Mp (%)
  let peakOvershootPercent = 0
  if (zeta < 1.0) {
    const exponent = (-Math.PI * zeta) / Math.sqrt(1 - zeta * zeta)
    peakOvershootPercent = Number((100 * Math.exp(exponent)).toFixed(1))
  }

  // Peak time tp (s)
  const omegaD = omegaN * Math.sqrt(Math.max(0.001, Math.abs(1 - zeta * zeta)))
  const peakTimeSec = zeta < 1.0 ? Number((Math.PI / omegaD).toFixed(2)) : 0

  // Rise time tr (s)
  const riseTimeSec = Number((1.8 / omegaN).toFixed(2))

  // Settling time ts (s) (2% criterion ~ 4 / (zeta * omegaN))
  const settlingTimeSec = Number((4 / Math.max(0.1, zeta * omegaN)).toFixed(2))

  // Steady actual position
  const actualPositionMm = Number(Math.max(0, Math.min(100, target - steadyStateErrorMm)).toFixed(2))
  const trackingErrorMm = Number(Math.abs(target - actualPositionMm).toFixed(2))

  // Control effort / voltage
  const controlEffortVolts = Number((kp * trackingErrorMm + (fDist / ACTUATOR_FORCE_CONSTANT_N_PER_V)).toFixed(2))
  const actuatorDutyPercent = Math.min(100, Math.round((controlEffortVolts / 24.0) * 100))

  // System stability rating
  let systemStability: MechatronicsAnalysis['systemStability'] = 'OPTIMAL UNDERDAMPED'
  let stabilityRating: MechatronicsAnalysis['stabilityRating'] = 'EXCELLENT'

  if (zeta < 0.2) {
    systemStability = 'UNSTABLE'
    stabilityRating = 'OSCILLATORY'
  } else if (zeta < 0.6) {
    systemStability = 'UNDERDAMPED'
    stabilityRating = 'RINGING'
  } else if (zeta <= 0.85) {
    systemStability = 'OPTIMAL UNDERDAMPED'
    stabilityRating = 'EXCELLENT'
  } else if (zeta <= 1.15) {
    systemStability = 'CRITICALLY DAMPED'
    stabilityRating = 'STABLE'
  } else {
    systemStability = 'OVERDAMPED'
    stabilityRating = 'SLOW'
  }

  // Generate 40-point step response trajectory for t in [0, 2.0] seconds
  const trajectory: TrajectoryPoint[] = []
  const steps = 40
  const maxTime = 2.0
  const dt = maxTime / steps

  for (let i = 0; i <= steps; i++) {
    const t = Number((i * dt).toFixed(2))
    let y = 0

    if (t === 0) {
      y = 0
    } else if (zeta < 1.0) {
      // Underdamped step response
      const decay = Math.exp(-zeta * omegaN * t)
      const phi = Math.atan(Math.sqrt(1 - zeta * zeta) / zeta)
      const osc = Math.sin(omegaD * t + phi) / Math.sqrt(1 - zeta * zeta)
      y = target * (1 - decay * osc) - steadyStateErrorMm * (1 - decay)
    } else if (Math.abs(zeta - 1.0) < 0.05) {
      // Critically damped step response
      const decay = Math.exp(-omegaN * t)
      y = target * (1 - (1 + omegaN * t) * decay) - steadyStateErrorMm * (1 - decay)
    } else {
      // Overdamped step response
      const s1 = -omegaN * (zeta - Math.sqrt(zeta * zeta - 1))
      const s2 = -omegaN * (zeta + Math.sqrt(zeta * zeta - 1))
      y = target * (1 - (s2 * Math.exp(s1 * t) - s1 * Math.exp(s2 * t)) / (s2 - s1)) - steadyStateErrorMm * (1 - Math.exp(s1 * t))
    }

    const clampedY = Number(Math.max(0, Math.min(110, y)).toFixed(2))
    const err = target - clampedY
    const u = Number((kp * err).toFixed(2))

    trajectory.push({
      timeSec: t,
      positionMm: clampedY,
      targetMm: target,
      controlEffortVolts: u,
    })
  }

  return {
    params,
    targetPositionMm: target,
    actualPositionMm,
    trackingErrorMm,
    steadyStateErrorMm,
    naturalFrequencyRadS: Number(omegaN.toFixed(2)),
    naturalFrequencyHz: Number(naturalFrequencyHz.toFixed(2)),
    dampingRatio: Number(zeta.toFixed(2)),
    peakOvershootPercent,
    peakTimeSec,
    riseTimeSec,
    settlingTimeSec,
    controlEffortVolts,
    actuatorDutyPercent,
    systemStability,
    stabilityRating,
    trajectory,
  }
}

export interface DynamicMechatronicsExplanation {
  whatChanged: string
  whatHappened: string
  why: string
}

export function getMechatronicsDynamicExplanation(
  current: MechatronicsParams,
  prev: MechatronicsParams
): DynamicMechatronicsExplanation {
  const curAnalysis = calculateMechatronicsAnalysis(current)

  // 1. Proportional Gain Kp change
  if (Math.abs(current.proportionalGainKp - prev.proportionalGainKp) >= 0.2) {
    const diff = current.proportionalGainKp - prev.proportionalGainKp
    const dir = diff > 0 ? 'increased' : 'reduced'
    return {
      whatChanged: `You ${dir} Proportional Gain (Kp) from ${prev.proportionalGainKp.toFixed(1)} to ${current.proportionalGainKp.toFixed(1)} V/mm.`,
      whatHappened: `Loop bandwidth accelerated (natural frequency ωn = ${curAnalysis.naturalFrequencyRadS} rad/s, rise time tr = ${curAnalysis.riseTimeSec}s). Damping ratio shifted to ζ = ${curAnalysis.dampingRatio} (${curAnalysis.systemStability}).`,
      why: `Proportional control acts like an active software spring. Higher Kp amplifies corrective actuator force in direct proportion to tracking error, speeding up convergence but reducing phase margin if not damped by Kd.`,
    }
  }

  // 2. Derivative Gain Kd change
  if (Math.abs(current.derivativeGainKd - prev.derivativeGainKd) >= 0.1) {
    const diff = current.derivativeGainKd - prev.derivativeGainKd
    const dir = diff > 0 ? 'increased' : 'reduced'
    return {
      whatChanged: `You ${dir} Derivative Gain (Kd) from ${prev.derivativeGainKd.toFixed(2)} to ${current.derivativeGainKd.toFixed(2)} V·s/mm.`,
      whatHappened: `Effective damping ratio shifted to ζ = ${curAnalysis.dampingRatio} with peak overshoot ${curAnalysis.peakOvershootPercent}% and settling time ${curAnalysis.settlingTimeSec}s.`,
      why: `Derivative control acts as an active electronic dashpot damper. It measures the rate of error velocity (de/dt) and generates counter-torque before the carriage overshoots, suppressing oscillation and stabilizing the mechanism.`,
    }
  }

  // 3. Integral Gain Ki change
  if (Math.abs(current.integralGainKi - prev.integralGainKi) >= 0.2) {
    const diff = current.integralGainKi - prev.integralGainKi
    const dir = diff > 0 ? 'increased' : 'reduced'
    return {
      whatChanged: `You ${dir} Integral Gain (Ki) from ${prev.integralGainKi.toFixed(1)} to ${current.integralGainKi.toFixed(1)} V/(mm·s).`,
      whatHappened: `Steady-state offset under load shifted to ${curAnalysis.steadyStateErrorMm.toFixed(2)} mm (tracking error |e| = ${curAnalysis.trackingErrorMm.toFixed(2)} mm).`,
      why: `Integral control accumulates residual error over time (∫e dt). Even tiny persistent offsets pump up control voltage until steady-state position error is entirely driven to zero.`,
    }
  }

  // 4. Disturbance Load change
  if (Math.abs(current.disturbanceLoadN - prev.disturbanceLoadN) >= 2) {
    const diff = current.disturbanceLoadN - prev.disturbanceLoadN
    const dir = diff > 0 ? 'applied an increased' : 'decreased'
    return {
      whatChanged: `You ${dir} external mechanical DISTURBANCE LOAD from ${prev.disturbanceLoadN} N to ${current.disturbanceLoadN} N on the carriage.`,
      whatHappened: `Carriage was subjected to opposing force. Steady-state position offset is ${curAnalysis.steadyStateErrorMm.toFixed(2)} mm with actuator drawing ${curAnalysis.controlEffortVolts.toFixed(1)} V (${curAnalysis.actuatorDutyPercent}% duty).`,
      why: `External mechanical resistance opposes motor thrust. Without integral feedback or sufficient proportional stiffness, opposing force creates steady-state droop (e_ss = F_dist / K_eff).`,
    }
  }

  // 5. Target Position change
  if (Math.abs(current.targetPositionMm - prev.targetPositionMm) >= 2) {
    const diff = current.targetPositionMm - prev.targetPositionMm
    const dir = diff > 0 ? 'forward toward' : 'back toward'
    return {
      whatChanged: `You commanded the TARGET POSITION ${dir} ${current.targetPositionMm} mm along the linear encoder stroke.`,
      whatHappened: `Linear carriage trajectory tracked to ${curAnalysis.actualPositionMm} mm with transient control voltage peaking at ${curAnalysis.controlEffortVolts} V.`,
      why: `A step change in setpoint r(t) generates an instantaneous tracking error e(t) = r(t) - y(t), triggering actuator current to accelerate carriage inertia along the ballscrew axis.`,
    }
  }

  // Default balanced overview
  return {
    whatChanged: `Linear stage commanded to ${current.targetPositionMm} mm with PID gains Kp=${current.proportionalGainKp}, Kd=${current.derivativeGainKd}, Ki=${current.integralGainKi} under ${current.disturbanceLoadN} N load.`,
    whatHappened: `Operating at actual position ${curAnalysis.actualPositionMm} mm (error |e| = ${curAnalysis.trackingErrorMm} mm, damping ζ = ${curAnalysis.dampingRatio}, overshoot = ${curAnalysis.peakOvershootPercent}%).`,
    why: `Closed-loop mechatronic tracking unites sensing (optical encoder), computation (PID control law), and actuation (DC ballscrew servo) to achieve precision motion under mechanical loads.`,
  }
}

export const MECHATRONICS_EQUATIONS = [
  {
    title: 'Kinematic Tracking Error (Feedback Sensor Summation)',
    formula: 'e(t) = r(t) − y(t)',
    explanation:
      'The tracking error represents the instantaneous discrepancy between the commanded setpoint reference r(t) and the measured physical carriage position y(t) from the optical encoder.',
  },
  {
    title: 'PID Controller Control Law (Actuator Effort)',
    formula: 'u(t) = K_p · e(t) + K_i · ∫ e(τ) dτ + K_d · (de(t) / dt)',
    explanation:
      'The three-term PID controller computes corrective actuator effort u(t): proportional to current error, integral to accumulated historical offset, and derivative to rate of error change.',
  },
  {
    title: 'Closed-Loop Second-Order Dynamic Response',
    formula: 's² + 2 · ζ · ω_n · s + ω_n² = 0',
    explanation:
      'The characteristic polynomial governing closed-loop mechanical motion. The natural frequency ω_n dictates response speed, while the damping ratio ζ governs overshoot and transient stability.',
  },
  {
    title: 'Damping Ratio & Natural Frequency from Physical Parameters',
    formula: 'ω_n = √(K_m · K_p / m),    ζ = (c + K_m · K_d) / (2 · √(m · K_m · K_p))',
    explanation:
      'Mechanical stiffness is synthesized electronically by proportional gain K_p, while physical viscous friction is augmented by derivative feedback damping K_d.',
  },
  {
    title: 'Peak Percent Overshoot (Transient Ringing)',
    formula: 'M_p = 100 · exp(−π · ζ / √(1 − ζ²)) %  (for ζ < 1)',
    explanation:
      'Underdamped systems (ζ < 1) overshoot their target position before settling. Tuning derivative damping K_d increases ζ toward the optimal range (0.6 to 0.8), curtailing overshoot.',
  },
  {
    title: 'Steady-State Disturbance Error & Integral Elimination',
    formula: 'e_ss = F_dist / (K_m · K_p)  ⟹  e_ss → 0  with K_i > 0',
    explanation:
      'An external disturbance force creates a persistent position offset under proportional-only control. Incorporating integral action K_i provides infinite DC gain, forcing steady-state error to zero.',
  },
]
