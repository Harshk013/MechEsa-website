// src/components/mechLab/experiments/mechatronicsChallenge.ts
// Multi-level qualification missions and verification logic for Mechatronics Flagship

import type { LabChallenge, ChallengeEvaluation } from '../../../data/mechLabTypes'
import {
  calculateMechatronicsAnalysis,
  type MechatronicsParams,
  MECHATRONICS_LIMITS,
} from './mechatronicsModel.ts'

export const MECHATRONICS_LEVELS = [
  {
    levelNumber: 1,
    levelTitle: 'Track the Target Setpoint',
    objective: 'Command the linear stage carriage to mid-stroke (45 mm to 65 mm) and achieve stable tracking with steady-state position error |e| ≤ 2.0 mm.',
    targetCriteria: 'Target Setpoint 45 mm – 65 mm AND Tracking Error |e| ≤ 2.0 mm',
    hint: 'Adjust the target position slider into the center travel zone (45–65 mm). The closed-loop controller will servo the carriage to the commanded setpoint.',
  },
  {
    levelNumber: 2,
    levelTitle: 'Control the Dynamic Response',
    objective: 'Attain rapid, stable positioning: tune Kp and Kd so peak overshoot Mp ≤ 12.0% and settling time ts ≤ 0.80 s with steady-state error |e| ≤ 1.5 mm.',
    targetCriteria: 'Overshoot Mp ≤ 12.0% AND Settling Time ts ≤ 0.80 s AND Error |e| ≤ 1.5 mm',
    hint: 'If the carriage rings or overshoots too much (Mp > 12%), increase Derivative Gain (Kd) to add active damping. If settling time is too sluggish, increase Kp.',
  },
  {
    levelNumber: 3,
    levelTitle: 'Robust Disturbance Rejection',
    objective: 'Subject the linear stage to a severe external load disturbance (F_dist ≥ 25 N) and maintain position accuracy with steady-state error |e| ≤ 1.8 mm.',
    targetCriteria: 'Disturbance Load F_dist ≥ 25 N AND Steady Error |e| ≤ 1.8 mm',
    hint: 'A heavy mechanical load pushes the carriage away from its target. Increase Proportional Gain (Kp) to stiffen the software spring, and add Integral Gain (Ki) to drive steady-state droop to zero!',
  },
]

export const MECHATRONICS_FLAGSHIP_CHALLENGE: LabChallenge<MechatronicsParams, any> = {
  id: 'mechatronics-closed-loop-positioning',
  systemId: 'mechatronics',
  title: 'CLOSED-LOOP POSITIONING & CONTROL',
  description:
    'Command the linear carriage setpoint, optimize PID gains (Kp, Kd, Ki), and reject mechanical disturbance loads to achieve precision servo tracking.',
  hint: 'Feedback sensors constantly measure actual carriage position and compute corrective motor effort to drive tracking error toward zero.',
  defaultParams: {
    targetPositionMm: MECHATRONICS_LIMITS.targetPositionMm.default,
    targetPosition: MECHATRONICS_LIMITS.targetPositionMm.default,
    proportionalGainKp: MECHATRONICS_LIMITS.proportionalGainKp.default,
    proportionalGain: MECHATRONICS_LIMITS.proportionalGainKp.default,
    derivativeGainKd: MECHATRONICS_LIMITS.derivativeGainKd.default,
    derivativeGain: MECHATRONICS_LIMITS.derivativeGainKd.default,
    integralGainKi: MECHATRONICS_LIMITS.integralGainKi.default,
    disturbanceLoadN: MECHATRONICS_LIMITS.disturbanceLoadN.default,
  },
  targets: [
    {
      id: 'mch-target',
      label: 'TARGET SETPOINT',
      targetDisplay: '45 – 65 mm',
      isMet: (params: MechatronicsParams) => {
        const target = params?.targetPositionMm ?? params?.targetPosition ?? 0
        return target >= 45 && target <= 65
      },
      currentDisplay: (params: MechatronicsParams) => {
        const target = params?.targetPositionMm ?? params?.targetPosition ?? 0
        return `${target.toFixed(0)} mm`
      },
    },
    {
      id: 'mch-error',
      label: 'TRACKING ERROR',
      targetDisplay: '≤ 2.0 mm',
      isMet: (params: MechatronicsParams) => {
        const analysis = calculateMechatronicsAnalysis(params)
        return analysis.trackingErrorMm <= 2.0
      },
      currentDisplay: (params: MechatronicsParams) => {
        const analysis = calculateMechatronicsAnalysis(params)
        return `${analysis.trackingErrorMm.toFixed(2)} mm`
      },
    },
  ],
  evaluate: (params: MechatronicsParams, _result: any, level = 1): ChallengeEvaluation => {
    // Graceful handling of empty or undefined params
    const analysis = calculateMechatronicsAnalysis(params)
    const target = analysis.targetPositionMm
    const err = analysis.trackingErrorMm
    const mp = analysis.peakOvershootPercent
    const ts = analysis.settlingTimeSec
    const fDist = analysis.params.disturbanceLoadN

    // LEVEL 1: Track the Target Setpoint (45 <= target <= 65, error <= 2.0 mm)
    if (level === 1) {
      if (target < 45 || target > 65) {
        return {
          isPassed: false,
          status: 'TARGET OUTSIDE RANGE',
          feedbackMessage: `Target setpoint is currently ${target.toFixed(0)} mm (required: 45 mm to 65 mm). Move the setpoint slider toward the center stroke.`,
          engineeringInsight: 'Target tracking begins by commanding the mechanism into its calibrated mid-stroke linear operating envelope.',
        }
      }

      if (err > 2.0) {
        return {
          isPassed: false,
          status: 'ERROR TOO HIGH',
          feedbackMessage: `Current tracking error is ${err.toFixed(2)} mm (target: ≤ 2.0 mm). Increase Proportional Gain (Kp) to boost corrective servo action.`,
          engineeringInsight: 'Low proportional gain results in a sluggish controller with wide position deadband.',
        }
      }

      return {
        isPassed: true,
        status: 'TARGET REACHED ✓',
        feedbackMessage: `Target verified at ${target.toFixed(0)} mm with tight tracking error of ${err.toFixed(2)} mm. Closed-loop servo tracking confirmed!`,
        engineeringInsight: 'Stable position feedback successfully eliminates open-loop drift and centers the carriage precisely.',
      }
    }

    // LEVEL 2: Control the Dynamic Response (Mp <= 12%, ts <= 0.80s, err <= 1.5mm)
    if (level === 2) {
      if (mp > 12.0) {
        return {
          isPassed: false,
          status: 'EXCESSIVE OVERSHOOT',
          feedbackMessage: `Peak overshoot is ${mp.toFixed(1)}% (needs ≤ 12.0%). The carriage is ringing past the target! Increase Derivative Gain (Kd) to dampen oscillations.`,
          engineeringInsight: 'High proportional gain without adequate velocity damping causes the mechanism to overshoot before settling.',
        }
      }

      if (ts > 0.80) {
        return {
          isPassed: false,
          status: 'RESPONSE TOO SLUGGISH',
          feedbackMessage: `Settling time is ${ts.toFixed(2)} s (needs ≤ 0.80 s). The system is overdamped. Increase Proportional Gain (Kp) or slightly reduce Kd.`,
          engineeringInsight: 'Excessive derivative damping prevents the actuator from converging briskly to the commanded coordinate.',
        }
      }

      if (err > 1.5) {
        return {
          isPassed: false,
          status: 'STEADY ERROR',
          feedbackMessage: `Steady-state error is ${err.toFixed(2)} mm (needs ≤ 1.5 mm). Boost Kp to sharpen steady position resolution.`,
          engineeringInsight: 'High-speed positioning requires both tight transient settling and clean steady-state accuracy.',
        }
      }

      return {
        isPassed: true,
        status: 'DYNAMICS OPTIMIZED ✓',
        feedbackMessage: `Fast, clean response achieved! Overshoot restricted to ${mp.toFixed(1)}%, settling time ${ts.toFixed(2)} s, error ${err.toFixed(2)} mm.`,
        engineeringInsight: 'Optimal pole placement balances software stiffness and electronic damping, yielding a well-mannered second-order step response.',
      }
    }

    // LEVEL 3: Robust Disturbance Rejection (F_dist >= 25 N, err <= 1.8 mm)
    if (level === 3) {
      if (fDist < 25) {
        return {
          isPassed: false,
          status: 'DISTURBANCE TOO LOW',
          feedbackMessage: `Mechanical disturbance load is ${fDist.toFixed(0)} N (needs ≥ 25 N). Increase external load to test disturbance rejection robustness.`,
          engineeringInsight: 'Real-world mechatronic systems must maintain tracking accuracy even under heavy cutting, friction, or external payload forces.',
        }
      }

      if (err > 1.8) {
        return {
          isPassed: false,
          status: 'LOAD DROOP DETECTED',
          feedbackMessage: `Carriage was dragged off-target by load! Steady-state droop is ${err.toFixed(2)} mm (needs ≤ 1.8 mm). Increase Integral Gain (Ki) to drive steady offset to zero, or boost Kp.`,
          engineeringInsight: 'A pure PD controller suffers steady-state droop under external force (e_ss = F_dist / K_eff). Adding integral action (Ki) provides infinite DC stiffness to eliminate droop.',
        }
      }

      return {
        isPassed: true,
        status: 'DISTURBANCE REJECTED ✓',
        feedbackMessage: `Outstanding disturbance rejection! Holding position against ${fDist.toFixed(0)} N external load with only ${err.toFixed(2)} mm residual offset.`,
        engineeringInsight: 'Integral compensation successfully integrated the load opposition, boosting motor duty cycle to hold the coordinate under full external resistance.',
      }
    }

    return {
      isPassed: false,
      status: 'QUALIFICATION PENDING',
      feedbackMessage: 'Configure mechatronic closed-loop parameters to meet level criteria.',
      engineeringInsight: 'Control loops balance bandwidth, damping, and disturbance rejection.',
    }
  },
}
