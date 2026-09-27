// src/components/mechLab/experiments/automotiveChallenge.ts
// Mission definitions, level progression, and evaluation logic for Automotive experience

import type { LabChallenge, ChallengeEvaluation } from '../../../data/mechLabTypes'
import {
  calculateAutomotivePerformance,
  type AutomotiveParams,
  AUTOMOTIVE_LIMITS,
} from './automotiveModel'

export const AUTOMOTIVE_LEVELS = [
  {
    levelNumber: 1,
    levelTitle: 'Quick Start (0–100 Sprint)',
    objective: 'Launch from 0 to 100 km/h in under 4.2 seconds without wheelspin.',
    targetCriteria: '0–100 km/h Time ≤ 4.2 s (Clean Launch)',
    hint: 'Increase Power to accelerate faster, but make sure Grip is high enough so the tires do not spin out on launch.',
  },
  {
    levelNumber: 2,
    levelTitle: 'Stop in Time (Braking Zone)',
    objective: 'Bring the vehicle to a full stop from 100 km/h inside 38.0 meters.',
    targetCriteria: 'Stopping Distance ≤ 38.0 m',
    hint: 'Braking force alone cannot stop the car if the tires slide. Pair high Braking strength with sufficient Grip.',
  },
  {
    levelNumber: 3,
    levelTitle: 'Perfect Corner (High-Speed Apex)',
    objective: 'Carve through the 45m curve at ≥ 75 km/h with at least +15% grip safety margin.',
    targetCriteria: 'Corner Speed ≥ 75 km/h AND Grip Margin ≥ 15%',
    hint: 'Balance Power and Grip. If the car skids, boost Grip or trim excess Power to prevent the tires from losing adhesion.',
  },
]

export const AUTOMOTIVE_FLAGSHIP_CHALLENGE: LabChallenge<AutomotiveParams, any> = {
  id: 'automotive-car-tuning',
  systemId: 'automotive',
  title: 'PERFECT CAR BALANCE',
  description:
    'Tune engine power, tire grip, braking strength, and steering response to achieve rapid acceleration, short stopping distances, and stable cornering balance.',
  hint: 'A truly fast car is not just raw power. It requires equal parts grip, braking, and chassis stability.',
  defaultParams: {
    power: AUTOMOTIVE_LIMITS.power.default,
    grip: AUTOMOTIVE_LIMITS.grip.default,
    braking: AUTOMOTIVE_LIMITS.braking.default,
    steering: AUTOMOTIVE_LIMITS.steering.default,
  },
  targets: [
    {
      id: 'target-sprint',
      label: '0–100 km/h Sprint',
      targetDisplay: '≤ 4.2 s',
      isMet: (params: AutomotiveParams) => {
        const perf = calculateAutomotivePerformance(params)
        return perf.sprint0to100Sec <= 4.2 && !perf.hasWheelspin
      },
      currentDisplay: (params: AutomotiveParams) => {
        const perf = calculateAutomotivePerformance(params)
        return `${perf.sprint0to100Sec.toFixed(2)} s`
      },
    },
    {
      id: 'target-braking',
      label: 'Stopping Distance',
      targetDisplay: '≤ 38.0 m',
      isMet: (params: AutomotiveParams) => {
        const perf = calculateAutomotivePerformance(params)
        return perf.brakingDistanceM <= 38.0
      },
      currentDisplay: (params: AutomotiveParams) => {
        const perf = calculateAutomotivePerformance(params)
        return `${perf.brakingDistanceM.toFixed(1)} m`
      },
    },
  ],
  evaluate: (params: AutomotiveParams, _result: any, level = 1): ChallengeEvaluation => {
    const perf = calculateAutomotivePerformance(params)

    // Level 1: 0-100 km/h Sprint
    if (level === 1) {
      const targetTime = 4.2
      const timeOk = perf.sprint0to100Sec <= targetTime
      const noSpin = !perf.hasWheelspin

      if (timeOk && noSpin) {
        return {
          isPassed: true,
          status: 'TARGET REACHED ✓',
          feedbackMessage: `TARGET REACHED ✓ — Blistering clean launch! 0–100 km/h achieved in ${perf.sprint0to100Sec.toFixed(2)} s with zero wheelspin.`,
          engineeringInsight: `Newton's second law in action: ${perf.driveForceN.toLocaleString()} N of drive force cleanly converted into ${(perf.accelerationG).toFixed(2)}g of forward acceleration.`,
        }
      }

      if (perf.hasWheelspin) {
        return {
          isPassed: false,
          status: 'WHEELSPIN DETECTED',
          feedbackMessage: `Wheelspin! Engine drive force (${perf.driveForceN.toLocaleString()} N) overwhelmed tire traction (${perf.maxTractionN.toLocaleString()} N). Increase GRIP to harness the power.`,
          engineeringInsight: 'Excessive wheelspin wastes energy in tire smoke rather than propelling the car forward.',
        }
      }

      const diff = (perf.sprint0to100Sec - targetTime).toFixed(2)
      return {
        isPassed: false,
        status: 'TOO SLOW',
        feedbackMessage: `Current sprint time is ${perf.sprint0to100Sec.toFixed(2)} s (needs to be ${diff} s faster). Increase POWER to generate more drive force.`,
        engineeringInsight: 'Acceleration is directly proportional to engine driving force.',
      }
    }

    // Level 2: Stop in Time (Braking distance <= 38m)
    if (level === 2) {
      const targetDist = 38.0
      const distOk = perf.brakingDistanceM <= targetDist

      if (distOk) {
        return {
          isPassed: true,
          status: 'TARGET REACHED ✓',
          feedbackMessage: `TARGET REACHED ✓ — Tremendous stopping power! The car came to a dead halt in ${perf.brakingDistanceM.toFixed(1)} m (target was ≤ ${targetDist} m).`,
          engineeringInsight: `Deceleration of ${(perf.brakeDecelMps2 / 9.81).toFixed(2)}g achieved by pairing ${params.braking}% brake clamping with ${params.grip}% tire adhesion.`,
        }
      }

      const diff = (perf.brakingDistanceM - targetDist).toFixed(1)
      return {
        isPassed: false,
        status: 'BRAKING TOO LATE',
        feedbackMessage: `Stopping distance is ${perf.brakingDistanceM.toFixed(1)} m (${diff} m over limit). Increase BRAKING strength and boost GRIP to grip the road harder.`,
        engineeringInsight: 'Brakes clamp the rotor, but tire-road friction is what actually stops the vehicle mass.',
      }
    }

    // Level 3: Perfect Corner (Speed >= 75 km/h, GripMargin >= 15%)
    const minCornerSpeed = 75
    const minMargin = 15
    const speedOk = perf.testCornerSpeedKmh >= minCornerSpeed
    const marginOk = perf.gripMarginPercent >= minMargin
    const noSkid = !perf.hasCornerSkid

    if (speedOk && marginOk && noSkid) {
      return {
        isPassed: true,
        status: 'TARGET REACHED ✓',
        feedbackMessage: `TARGET REACHED ✓ — Flawless apex navigation! Carried ${perf.testCornerSpeedKmh} km/h through the turn with a solid +${perf.gripMarginPercent}% grip safety margin.`,
        engineeringInsight: `Centripetal force was kept below the Coulomb friction boundary: lateral load ${(perf.lateralAccG).toFixed(2)}g safely inside tire limit ${(perf.lateralAccG / (1 - perf.gripMarginPercent / 100)).toFixed(2)}g.`,
      }
    }

    if (!noSkid || perf.gripMarginPercent < 0) {
      return {
        isPassed: false,
        status: 'LOST GRIP (SKID)',
        feedbackMessage: `Tire slide! At ${perf.testCornerSpeedKmh} km/h, lateral centripetal force exceeded tire road adhesion. Increase GRIP or modulate speed to settle the chassis.`,
        engineeringInsight: 'Centripetal acceleration increases with the square of speed (v²/R). Excess speed rapidly causes lateral skids.',
      }
    }

    if (!speedOk) {
      return {
        isPassed: false,
        status: 'TOO SLOW THROUGH APEX',
        feedbackMessage: `Cornering is stable, but speed through the bend was only ${perf.testCornerSpeedKmh} km/h (target is ≥ ${minCornerSpeed} km/h). Increase POWER slightly.`,
        engineeringInsight: 'A fast lap requires carrying maximum speed while staying just beneath the skid threshold.',
      }
    }

    // Low margin
    return {
      isPassed: false,
      status: 'GRIP MARGIN TOO THIN',
      feedbackMessage: `Corner speed is ${perf.testCornerSpeedKmh} km/h, but grip margin is only ${perf.gripMarginPercent}% (safety requirement is ≥ 15%). Boost GRIP to stabilize the chassis.`,
      engineeringInsight: 'Racing cars need safety margin to absorb bumps and mid-corner adjustments.',
    }
  },
}
