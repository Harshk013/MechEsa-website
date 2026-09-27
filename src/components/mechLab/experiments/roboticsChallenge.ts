import type { LabChallenge, ChallengeEvaluation } from '../../../data/mechLabTypes'
import {
  ROBOTICS_LEVEL_TARGETS,
  calculateRoboticsKinematics,
} from './roboticsModel.ts'

export interface RoboticsChallengeParams {
  shoulderAngle: number
  elbowAngle: number
}

export const ROBOTICS_LEVELS = [
  {
    levelNumber: 1,
    levelTitle: 'Reach the Target',
    objective: 'Guide the robot hand into the target pickup zone.',
    hint: 'Move the Shoulder slider first to face the target, then extend the Elbow.',
    targetZoneRadius: ROBOTICS_LEVEL_TARGETS[1].radius,
  },
  {
    levelNumber: 2,
    levelTitle: 'Precision Pickup',
    objective: 'Position the hand inside the tight precision tolerance circle.',
    hint: 'Make small 1° to 2° adjustments on the Elbow slider to settle within the circle.',
    targetZoneRadius: ROBOTICS_LEVEL_TARGETS[2].radius,
  },
  {
    levelNumber: 3,
    levelTitle: 'Obstacle Navigation',
    objective: 'Reach the target without any link touching the hazard barrier.',
    hint: 'There are two kinematic solutions: elbow-up and elbow-down. Route the arm over the barrier.',
    targetZoneRadius: ROBOTICS_LEVEL_TARGETS[3].radius,
  },
]

export const ROBOTICS_FLAGSHIP_CHALLENGE: LabChallenge<RoboticsChallengeParams, any> = {
  id: 'robotics-pickup',
  systemId: 'robotics',
  title: 'PICK UP THE PART',
  description: 'A component is waiting at the designated coordinate. Position the robot hand accurately over the target to complete the pickup mission.',
  hint: 'Combine both joint rotations to navigate the workspace. Use Auto Position if you get stuck.',
  defaultParams: {
    shoulderAngle: 35,
    elbowAngle: 45,
  },
  targets: [
    {
      id: 'rob-target-dist',
      label: 'DISTANCE TO TARGET',
      targetDisplay: 'Within Target Zone',
      isMet: (p, res) => {
        const lvl = res?.activeLevel || 1
        const targetConfig = ROBOTICS_LEVEL_TARGETS[lvl] || ROBOTICS_LEVEL_TARGETS[1]
        const kin = calculateRoboticsKinematics(
          p.shoulderAngle,
          p.elbowAngle,
          targetConfig.target,
          targetConfig.radius,
          targetConfig.obstacle
        )
        return kin.isTargetReached && !kin.hasObstacleCollision
      },
      currentDisplay: (p, res) => {
        const lvl = res?.activeLevel || 1
        const targetConfig = ROBOTICS_LEVEL_TARGETS[lvl] || ROBOTICS_LEVEL_TARGETS[1]
        const kin = calculateRoboticsKinematics(
          p.shoulderAngle,
          p.elbowAngle,
          targetConfig.target,
          targetConfig.radius,
          targetConfig.obstacle
        )
        return `${kin.distanceToTarget.toFixed(1)} mm`
      },
    },
  ],
  evaluate: (params, _result, level = 1): ChallengeEvaluation => {
    const targetConfig = ROBOTICS_LEVEL_TARGETS[level] || ROBOTICS_LEVEL_TARGETS[1]
    const kin = calculateRoboticsKinematics(
      params.shoulderAngle,
      params.elbowAngle,
      targetConfig.target,
      targetConfig.radius,
      targetConfig.obstacle
    )

    // Check collision first on Level 3
    if (kin.hasObstacleCollision) {
      return {
        isPassed: false,
        status: 'OBSTACLE HIT',
        feedbackMessage: '⚠ OBSTACLE HIT — The robot arm crossed into the hazard zone! Try changing the shoulder first, then fold the elbow to route around it.',
        engineeringInsight: 'Robots solve obstacle avoidance by exploring alternate kinematic solutions (elbow-up vs elbow-down).',
      }
    }

    if (kin.isTargetReached) {
      return {
        isPassed: true,
        status: 'TARGET REACHED ✓',
        feedbackMessage: `MISSION COMPLETE ✓ — Excellent positioning! The gripper is within ${kin.distanceToTarget.toFixed(1)} mm of the target center.`,
        engineeringInsight: `You satisfied the spatial constraint with posture: ${kin.posture.replace('_', ' ')}. Total reach is ${kin.reach.toFixed(1)} mm.`,
      }
    }

    // Not yet reached
    const diff = (kin.distanceToTarget - targetConfig.radius).toFixed(1)
    return {
      isPassed: false,
      status: 'NOT QUITE',
      feedbackMessage: `Not quite there yet. The hand is ${kin.distanceToTarget.toFixed(1)} mm from target (needs to close by ${diff} mm).`,
      engineeringInsight: targetConfig.hint,
    }
  },
}
