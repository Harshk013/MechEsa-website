import type { LabChallenge, ChallengeEvaluation } from './mechLabTypes'
import { THERMODYNAMICS_CHALLENGE, THERMODYNAMICS_LEVELS } from '../components/mechLab/experiments/thermodynamicsChallenge'

export const SYSTEM_CHALLENGES: Record<string, LabChallenge<any, any>> = {
  thermodynamics: {
    ...THERMODYNAMICS_CHALLENGE,
    levels: THERMODYNAMICS_LEVELS.map((lvl) => ({
      levelNumber: lvl.levelNumber,
      levelTitle: lvl.levelTitle,
      objective: lvl.objective,
      hint: lvl.hint,
      targets: THERMODYNAMICS_CHALLENGE.targets,
    })),
  },

  robotics: {
    id: 'robotics-kinematics',
    systemId: 'robotics',
    title: 'TARGET END-EFFECTOR',
    description: 'Coordinate both revolute arm joints to navigate the end-effector to the target coordinate without overshooting the workspace reach.',
    hint: 'Joint 1 rotates the base link while Joint 2 articulates the elbow. Positive angles fold the arm towards the upper quadrant.',
    levels: [
      {
        levelNumber: 1,
        levelTitle: 'Workspace Reach',
        objective: 'Articulate both joints to achieve an effective arm reach of at least 120 mm.',
        hint: 'Unfold the elbow joint so the arm extends outward from the origin.',
        targets: [
          {
            id: 'rob-reach',
            label: 'ARM REACH',
            targetDisplay: '≥ 120 mm',
            isMet: (_, r) => (r?.reach || 0) >= 120,
            currentDisplay: (_, r) => `${(r?.reach || 0).toFixed(1)} mm`,
          },
        ],
      },
      {
        levelNumber: 2,
        levelTitle: 'Target Proximity',
        objective: 'Position the gripper tip within 50 mm of the target coordinate.',
        hint: 'Balance Joint 1 around 20°–35° and adjust Joint 2 to steer the tip toward the target marker.',
        targets: [
          {
            id: 'rob-offset',
            label: 'TARGET OFFSET',
            targetDisplay: '≤ 50 mm',
            isMet: (_, r) => (r?.targetOffset || 100) <= 50,
            currentDisplay: (_, r) => `${(r?.targetOffset || 0).toFixed(1)} mm`,
          },
        ],
      },
      {
        levelNumber: 3,
        levelTitle: 'Precision Docking',
        objective: 'Align the end-effector to within 25 mm of the target while maintaining steady arm posture.',
        hint: 'Fine-tune both angles in small 1° increments to close the remaining offset distance.',
        targets: [
          {
            id: 'rob-dock',
            label: 'PRECISION OFFSET',
            targetDisplay: '≤ 25 mm',
            isMet: (_, r) => (r?.targetOffset || 100) <= 25,
            currentDisplay: (_, r) => `${(r?.targetOffset || 0).toFixed(1)} mm`,
          },
        ],
      },
    ],
    targets: [
      {
        id: 'rob-offset',
        label: 'TARGET OFFSET',
        targetDisplay: '≤ 35 mm',
        isMet: (_, r) => (r?.targetOffset || 100) <= 35,
        currentDisplay: (_, r) => `${(r?.targetOffset || 0).toFixed(1)} mm`,
      },
    ],
    evaluate: (_params, result, level = 1): ChallengeEvaluation => {
      const offset = result?.targetOffset ?? 100
      const reach = result?.reach ?? 0
      if (level === 1) {
        const passed = reach >= 120
        return {
          isPassed: passed,
          status: passed ? 'TARGET ACHIEVED' : 'NOT QUITE',
          feedbackMessage: passed
            ? 'Success! The kinematic linkage has extended beyond the 120 mm reach threshold.'
            : 'The arm is too curled. Increase Joint 1 or Joint 2 angles to extend reach outward.',
          engineeringInsight: 'Multi-link reach is bounded by the triangle inequality: R_max = L1 + L2.',
        }
      }
      if (level === 2) {
        const passed = offset <= 50
        return {
          isPassed: passed,
          status: passed ? 'TARGET ACHIEVED' : 'NOT QUITE',
          feedbackMessage: passed
            ? 'Well done! The gripper is now in close proximity to the target zone.'
            : `Current offset is ${offset.toFixed(1)} mm (target ≤ 50 mm). Adjust joint angles to close the gap.`,
          engineeringInsight: 'Inverse kinematics determines joint configurations required for given Cartesian coordinates.',
        }
      }
      const passed = offset <= 25
      return {
        isPassed: passed,
        status: passed ? 'TARGET ACHIEVED' : 'NOT QUITE',
        feedbackMessage: passed
          ? 'Precision docking achieved! Excellent multi-axis coordination.'
          : `Current offset is ${offset.toFixed(1)} mm (target ≤ 25 mm). Fine-tune angles carefully.`,
        engineeringInsight: 'Singularities occur when the Jacobian matrix loses full rank at extreme reach boundaries.',
      }
    },
  },

  design: {
    id: 'design-linkage',
    systemId: 'design',
    title: 'FOUR-BAR TRANSMISSION',
    description: 'Tune the drive crank angle to achieve optimal motion transfer through the coupler without toggle lockup.',
    hint: 'The transmission index measures how efficiently input crank torque converts into output rocker motion.',
    levels: [
      {
        levelNumber: 1,
        levelTitle: 'Motion Transfer Zone',
        objective: 'Drive the linkage into the active transfer state (drive angle between 60° and 120°).',
        hint: 'Use the slider or step buttons to move the input crank past the initial retraction phase.',
        targets: [
          {
            id: 'des-range',
            label: 'DRIVE ANGLE',
            targetDisplay: '60° – 120°',
            isMet: (p) => (p?.driveAngle ?? 0) >= 60 && (p?.driveAngle ?? 0) <= 120,
            currentDisplay: (p) => `${p?.driveAngle ?? 0}°`,
          },
        ],
      },
      {
        levelNumber: 2,
        levelTitle: 'High Transmission Index',
        objective: 'Achieve a transmission index of at least 0.85 for smooth force transmission.',
        hint: 'Near 90° crank angle, the coupler and rocker form an optimal angle for torque transmission.',
        targets: [
          {
            id: 'des-trans',
            label: 'TRANSMISSION INDEX',
            targetDisplay: '≥ 0.85',
            isMet: (p) => {
              const val = p?.driveAngle ?? 0
              const idx = 0.62 + Math.abs(Math.sin((val * Math.PI) / 180)) * 0.34
              return idx >= 0.85
            },
            currentDisplay: (p) => {
              const val = p?.driveAngle ?? 0
              return (0.62 + Math.abs(Math.sin((val * Math.PI) / 180)) * 0.34).toFixed(2)
            },
          },
        ],
      },
      {
        levelNumber: 3,
        levelTitle: 'Peak Mechanical Advantage',
        objective: 'Reach a transmission index ≥ 0.92 with the output rocker in high-torque transfer.',
        hint: 'Crank angles between 85° and 95° maximize the sine component of the transmission angle.',
        targets: [
          {
            id: 'des-peak',
            label: 'PEAK TRANSMISSION',
            targetDisplay: '≥ 0.92',
            isMet: (p) => {
              const val = p?.driveAngle ?? 0
              const idx = 0.62 + Math.abs(Math.sin((val * Math.PI) / 180)) * 0.34
              return idx >= 0.92
            },
            currentDisplay: (p) => {
              const val = p?.driveAngle ?? 0
              return (0.62 + Math.abs(Math.sin((val * Math.PI) / 180)) * 0.34).toFixed(2)
            },
          },
        ],
      },
    ],
    targets: [
      {
        id: 'des-trans',
        label: 'TRANSMISSION INDEX',
        targetDisplay: '≥ 0.85',
        isMet: (p) => {
          const val = p?.driveAngle ?? 0
          return 0.62 + Math.abs(Math.sin((val * Math.PI) / 180)) * 0.34 >= 0.85
        },
        currentDisplay: (p) => (0.62 + Math.abs(Math.sin(((p?.driveAngle ?? 0) * Math.PI) / 180)) * 0.34).toFixed(2),
      },
    ],
    evaluate: (params, _result, level = 1): ChallengeEvaluation => {
      const angle = params?.driveAngle ?? 0
      const idx = 0.62 + Math.abs(Math.sin((angle * Math.PI) / 180)) * 0.34
      if (level === 1) {
        const passed = angle >= 60 && angle <= 120
        return {
          isPassed: passed,
          status: passed ? 'TARGET ACHIEVED' : 'NOT QUITE',
          feedbackMessage: passed
            ? 'Linkage is now transferring motion smoothly across the mid-stroke.'
            : 'Drive angle is outside the active transfer window. Tune toward 90°.',
          engineeringInsight: 'Planar linkages obey Grashof criteria for continuous crank rotation.',
        }
      }
      if (level === 2) {
        const passed = idx >= 0.85
        return {
          isPassed: passed,
          status: passed ? 'TARGET ACHIEVED' : 'NOT QUITE',
          feedbackMessage: passed
            ? `Transmission index is ${idx.toFixed(2)} (≥ 0.85). Favorable force transmission!`
            : `Transmission index is ${idx.toFixed(2)} (below 0.85 target). Adjust drive angle closer to perpendicular transfer.`,
          engineeringInsight: 'Transmission angle deviation from 90° increases joint reaction forces.',
        }
      }
      const passed = idx >= 0.92
      return {
        isPassed: passed,
        status: passed ? 'TARGET ACHIEVED' : 'NOT QUITE',
        feedbackMessage: passed
          ? `Peak mechanical advantage achieved at index ${idx.toFixed(2)}!`
          : `Current index is ${idx.toFixed(2)}. Center the drive crank between 85° and 95°.`,
        engineeringInsight: 'Perpendicular coupler-rocker alignment yields maximum instantaneous torque transfer.',
      }
    },
  },

  materials: {
    id: 'materials-beam',
    systemId: 'materials',
    title: 'BEAM DEFLECTION & SAFETY',
    description: 'Control the transverse bending load applied to a simply supported beam to maximize load carrying while keeping deflection within structural limits.',
    hint: 'Bending deflection scales non-linearly with load: Delta ~ F * L^3 / (48 * E * I).',
    levels: [
      {
        levelNumber: 1,
        levelTitle: 'Safe Elastic Loading',
        objective: 'Apply an initial load of at least 30% while keeping deflection under 8 mm.',
        hint: 'Loads up to 45% remain comfortably in the low elastic range.',
        targets: [
          {
            id: 'mat-load1',
            label: 'APPLIED LOAD',
            targetDisplay: '≥ 30%',
            isMet: (p) => (p?.appliedLoad ?? 0) >= 30,
            currentDisplay: (p) => `${p?.appliedLoad ?? 0}%`,
          },
          {
            id: 'mat-defl1',
            label: 'DEFLECTION',
            targetDisplay: '≤ 8.0 mm',
            isMet: (p) => Math.pow((p?.appliedLoad ?? 0) / 100, 2) * 28 <= 8.0,
            currentDisplay: (p) => `${(Math.pow((p?.appliedLoad ?? 0) / 100, 2) * 28).toFixed(1)} mm`,
          },
        ],
      },
      {
        levelNumber: 2,
        levelTitle: 'Controlled High Load',
        objective: 'Carry at least 50% load while keeping total deflection below 12 mm.',
        hint: 'Between 50% and 65% load, deflection grows as the square of applied force.',
        targets: [
          {
            id: 'mat-load2',
            label: 'APPLIED LOAD',
            targetDisplay: '≥ 50%',
            isMet: (p) => (p?.appliedLoad ?? 0) >= 50,
            currentDisplay: (p) => `${p?.appliedLoad ?? 0}%`,
          },
          {
            id: 'mat-defl2',
            label: 'DEFLECTION',
            targetDisplay: '≤ 12.0 mm',
            isMet: (p) => Math.pow((p?.appliedLoad ?? 0) / 100, 2) * 28 <= 12.0,
            currentDisplay: (p) => `${(Math.pow((p?.appliedLoad ?? 0) / 100, 2) * 28).toFixed(1)} mm`,
          },
        ],
      },
      {
        levelNumber: 3,
        levelTitle: 'Maximum Elastic Threshold',
        objective: 'Push load between 60% and 72% while ensuring deflection does not exceed 15 mm.',
        hint: 'Carefully balance the load slider just below the high-response threshold.',
        targets: [
          {
            id: 'mat-load3',
            label: 'LOAD RANGE',
            targetDisplay: '60% – 72%',
            isMet: (p) => (p?.appliedLoad ?? 0) >= 60 && (p?.appliedLoad ?? 0) <= 72,
            currentDisplay: (p) => `${p?.appliedLoad ?? 0}%`,
          },
          {
            id: 'mat-defl3',
            label: 'MAX DEFLECTION',
            targetDisplay: '≤ 15.0 mm',
            isMet: (p) => Math.pow((p?.appliedLoad ?? 0) / 100, 2) * 28 <= 15.0,
            currentDisplay: (p) => `${(Math.pow((p?.appliedLoad ?? 0) / 100, 2) * 28).toFixed(1)} mm`,
          },
        ],
      },
    ],
    targets: [
      {
        id: 'mat-load',
        label: 'LOAD CAPACITY',
        targetDisplay: '≥ 50%',
        isMet: (p) => (p?.appliedLoad ?? 0) >= 50,
        currentDisplay: (p) => `${p?.appliedLoad ?? 0}%`,
      },
      {
        id: 'mat-defl',
        label: 'DEFLECTION LIMIT',
        targetDisplay: '≤ 12.0 mm',
        isMet: (p) => Math.pow((p?.appliedLoad ?? 0) / 100, 2) * 28 <= 12.0,
        currentDisplay: (p) => `${(Math.pow((p?.appliedLoad ?? 0) / 100, 2) * 28).toFixed(1)} mm`,
      },
    ],
    evaluate: (params, _result, level = 1): ChallengeEvaluation => {
      const load = params?.appliedLoad ?? 0
      const deflection = Math.pow(load / 100, 2) * 28
      if (level === 1) {
        const passed = load >= 30 && deflection <= 8.0
        return {
          isPassed: passed,
          status: passed ? 'TARGET ACHIEVED' : 'NOT QUITE',
          feedbackMessage: passed
            ? 'Elastic load test verified with minimal structural deflection.'
            : 'Load is either too low (< 30%) or deflection exceeds 8.0 mm limit.',
          engineeringInsight: 'Elastic modulus governs deflection under small strain conditions.',
        }
      }
      if (level === 2) {
        const passed = load >= 50 && deflection <= 12.0
        return {
          isPassed: passed,
          status: passed ? 'TARGET ACHIEVED' : 'NOT QUITE',
          feedbackMessage: passed
            ? `Excellent! Carrying ${load}% load with ${deflection.toFixed(1)} mm deflection.`
            : `Current deflection is ${deflection.toFixed(1)} mm. Keep load near 55% to stay under 12.0 mm.`,
          engineeringInsight: 'Bending stress sigma = M * y / I is highest at the outermost fibers.',
        }
      }
      const passed = load >= 60 && load <= 72 && deflection <= 15.0
      return {
        isPassed: passed,
        status: passed ? 'TARGET ACHIEVED' : 'NOT QUITE',
        feedbackMessage: passed
          ? `High elastic threshold achieved! Load ${load}% safely balanced with ${deflection.toFixed(1)} mm deflection.`
          : `Out of range. Target load between 60% and 72% with deflection <= 15 mm.`,
        engineeringInsight: 'Exceeding yield strength causes permanent plastic strain.',
      }
    },
  },

  manufacturing: {
    id: 'mfg-cutting',
    systemId: 'manufacturing',
    title: 'PRECISION CNC MACHINING',
    description: 'Advance the cutting tool along the planned toolpath to remove stock material and form the finished part profile.',
    hint: 'Material removal rate progresses continuously as the cutter traverses the coordinate envelope.',
    levels: [
      {
        levelNumber: 1,
        levelTitle: 'Roughing Cut',
        objective: 'Traverse the tool to complete at least 40% of the bulk stock removal.',
        hint: 'Advance the cutting progress slider past 40%.',
        targets: [
          {
            id: 'mfg-prog1',
            label: 'MACHINING PROGRESS',
            targetDisplay: '≥ 40%',
            isMet: (p) => (p?.progress ?? 0) >= 40,
            currentDisplay: (p) => `${p?.progress ?? 0}%`,
          },
        ],
      },
      {
        levelNumber: 2,
        levelTitle: 'Semi-Finish Contouring',
        objective: 'Complete at least 75% of the toolpath passes.',
        hint: 'Guide the cutter through the central contour steps.',
        targets: [
          {
            id: 'mfg-prog2',
            label: 'MACHINING PROGRESS',
            targetDisplay: '≥ 75%',
            isMet: (p) => (p?.progress ?? 0) >= 75,
            currentDisplay: (p) => `${p?.progress ?? 0}%`,
          },
        ],
      },
      {
        levelNumber: 3,
        levelTitle: 'Final Finished Part',
        objective: 'Achieve 100% toolpath completion to produce the fully formed part profile.',
        hint: 'Complete the final smoothing pass to 100%.',
        targets: [
          {
            id: 'mfg-prog3',
            label: 'FINISHED PROFILE',
            targetDisplay: '100% (FINISHED)',
            isMet: (p) => (p?.progress ?? 0) >= 100,
            currentDisplay: (p) => `${p?.progress ?? 0}%`,
          },
        ],
      },
    ],
    targets: [
      {
        id: 'mfg-prog',
        label: 'TOOLPATH COMPLETION',
        targetDisplay: '≥ 75%',
        isMet: (p) => (p?.progress ?? 0) >= 75,
        currentDisplay: (p) => `${p?.progress ?? 0}%`,
      },
    ],
    evaluate: (params, _result, level = 1): ChallengeEvaluation => {
      const prog = params?.progress ?? 0
      if (level === 1) {
        const passed = prog >= 40
        return {
          isPassed: passed,
          status: passed ? 'TARGET ACHIEVED' : 'NOT QUITE',
          feedbackMessage: passed
            ? 'Roughing pass complete! Bulk stock material successfully excised.'
            : 'Continue advancing the cutter to reach at least 40% removal.',
          engineeringInsight: 'Roughing passes prioritize high volumetric material removal over finish.',
        }
      }
      if (level === 2) {
        const passed = prog >= 75
        return {
          isPassed: passed,
          status: passed ? 'TARGET ACHIEVED' : 'NOT QUITE',
          feedbackMessage: passed
            ? 'Semi-finish contouring reached. Profile steps are clearly defined.'
            : `Current progress is ${prog}%. Advance further along the toolpath.`,
          engineeringInsight: 'Stepover distance controls scallop height and resultant surface finish.',
        }
      }
      const passed = prog >= 100
      return {
        isPassed: passed,
        status: passed ? 'TARGET ACHIEVED' : 'NOT QUITE',
        feedbackMessage: passed
          ? 'Part machining 100% complete! Final profile verified to tolerance.'
          : `Current progress is ${prog}%. Push the cutter to 100% to finalize.`,
        engineeringInsight: 'Climb milling improves surface finish by beginning cut at maximum chip thickness.',
      }
    },
  },

  mechatronics: {
    id: 'mech-actuator',
    systemId: 'mechatronics',
    title: 'CLOSED-LOOP POSITIONING',
    description: 'Command the actuator carriage target and verify that the closed-loop feedback loop tracks with minimal error.',
    hint: 'Feedback sensors constantly measure actual position and adjust motor duty to minimize tracking error.',
    levels: [
      {
        levelNumber: 1,
        levelTitle: 'Mid-Stroke Position',
        objective: 'Command target position between 45% and 65% of actuator travel.',
        hint: 'Move the target slider to the center tracking region.',
        targets: [
          {
            id: 'mch-pos1',
            label: 'TARGET SETPOINT',
            targetDisplay: '45% – 65%',
            isMet: (p) => (p?.targetPosition ?? 0) >= 45 && (p?.targetPosition ?? 0) <= 65,
            currentDisplay: (p) => `${p?.targetPosition ?? 0}%`,
          },
        ],
      },
      {
        levelNumber: 2,
        levelTitle: 'Tight Error Tracking',
        objective: 'Maintain tracking error <= 3% while keeping actuator duty above 40%.',
        hint: 'Smooth commands allow the closed-loop controller to track the setpoint accurately.',
        targets: [
          {
            id: 'mch-err2',
            label: 'TRACKING ERROR',
            targetDisplay: '≤ 3%',
            isMet: (p) => {
              const val = p?.targetPosition ?? 0
              const sensed = Math.max(0, Math.min(100, val - 4 + (val > 78 ? 2 : 0)))
              return Math.abs(val - sensed) <= 3
            },
            currentDisplay: (p) => {
              const val = p?.targetPosition ?? 0
              const sensed = Math.max(0, Math.min(100, val - 4 + (val > 78 ? 2 : 0)))
              return `${Math.abs(val - sensed)}%`
            },
          },
        ],
      },
      {
        levelNumber: 3,
        levelTitle: 'Full-Stroke Precision',
        objective: 'Command a high target position (>= 80%) with tracking error <= 2%.',
        hint: 'At high stroke, actuator duty approaches saturation.',
        targets: [
          {
            id: 'mch-full3',
            label: 'HIGH TARGET',
            targetDisplay: '≥ 80%',
            isMet: (p) => (p?.targetPosition ?? 0) >= 80,
            currentDisplay: (p) => `${p?.targetPosition ?? 0}%`,
          },
          {
            id: 'mch-err3',
            label: 'TRACKING ERROR',
            targetDisplay: '≤ 2%',
            isMet: (p) => {
              const val = p?.targetPosition ?? 0
              const sensed = Math.max(0, Math.min(100, val - 4 + (val > 78 ? 2 : 0)))
              return Math.abs(val - sensed) <= 2
            },
            currentDisplay: (p) => {
              const val = p?.targetPosition ?? 0
              const sensed = Math.max(0, Math.min(100, val - 4 + (val > 78 ? 2 : 0)))
              return `${Math.abs(val - sensed)}%`
            },
          },
        ],
      },
    ],
    targets: [
      {
        id: 'mch-err',
        label: 'TRACKING ERROR',
        targetDisplay: '≤ 3%',
        isMet: (p) => {
          const val = p?.targetPosition ?? 0
          const sensed = Math.max(0, Math.min(100, val - 4 + (val > 78 ? 2 : 0)))
          return Math.abs(val - sensed) <= 3
        },
        currentDisplay: (p) => {
          const val = p?.targetPosition ?? 0
          const sensed = Math.max(0, Math.min(100, val - 4 + (val > 78 ? 2 : 0)))
          return `${Math.abs(val - sensed)}%`
        },
      },
    ],
    evaluate: (params, _result, level = 1): ChallengeEvaluation => {
      const val = params?.targetPosition ?? 0
      const sensed = Math.max(0, Math.min(100, val - 4 + (val > 78 ? 2 : 0)))
      const err = Math.abs(val - sensed)
      if (level === 1) {
        const passed = val >= 45 && val <= 65
        return {
          isPassed: passed,
          status: passed ? 'TARGET ACHIEVED' : 'NOT QUITE',
          feedbackMessage: passed
            ? 'Mid-stroke positioning converged safely.'
            : 'Target position is outside the 45%–65% window.',
          engineeringInsight: 'Closed-loop feedback eliminates steady-state drift in mechanical drives.',
        }
      }
      if (level === 2) {
        const passed = err <= 3
        return {
          isPassed: passed,
          status: passed ? 'TARGET ACHIEVED' : 'NOT QUITE',
          feedbackMessage: passed
            ? `Tracking error is ${err}%. High precision position convergence!`
            : `Tracking error is ${err}% (> 3%). Adjust command setpoint.`,
          engineeringInsight: 'PID controllers compute correction from proportional, integral, and derivative errors.',
        }
      }
      const passed = val >= 80 && err <= 2
      return {
        isPassed: passed,
        status: passed ? 'TARGET ACHIEVED' : 'NOT QUITE',
        feedbackMessage: passed
          ? `Full-stroke settlement achieved with tight ${err}% tracking error!`
          : `Command >= 80% with error <= 2% to achieve mission success.`,
        engineeringInsight: 'Actuator saturation occurs when control signal exceeds motor voltage limits.',
      }
    },
  },

  automotive: {
    id: 'auto-drivetrain',
    systemId: 'automotive',
    title: 'DRIVETRAIN LOAD TUNING',
    description: 'Modulate throttle input to balance engine RPM, torque transmission, and wheel ground speed.',
    hint: 'Higher throttle commands increase engine torque output and rotational speed through the gearset.',
    levels: [
      {
        levelNumber: 1,
        levelTitle: 'Engage Drive',
        objective: 'Apply at least 25% throttle to take the vehicle from IDLE into active DRIVE state.',
        hint: 'Increase throttle past 15%.',
        targets: [
          {
            id: 'aut-throt1',
            label: 'THROTTLE INPUT',
            targetDisplay: '≥ 25%',
            isMet: (p) => (p?.throttle ?? 0) >= 25,
            currentDisplay: (p) => `${p?.throttle ?? 0}%`,
          },
        ],
      },
      {
        levelNumber: 2,
        levelTitle: 'Highway Cruise Speed',
        objective: 'Balance throttle to achieve an engine speed between 2,200 and 3,600 RPM.',
        hint: 'Throttle between 30% and 60% provides comfortable highway cruising.',
        targets: [
          {
            id: 'aut-rpm2',
            label: 'ENGINE SPEED',
            targetDisplay: '2200 – 3600 RPM',
            isMet: (p) => {
              const rpm = Math.round(820 + (p?.throttle ?? 0) * 46)
              return rpm >= 2200 && rpm <= 3600
            },
            currentDisplay: (p) => `${Math.round(820 + (p?.throttle ?? 0) * 46)} RPM`,
          },
        ],
      },
      {
        levelNumber: 3,
        levelTitle: 'High-Torque Acceleration',
        objective: 'Achieve a Drive Torque Index >= 55% while avoiding redline limit (RPM <= 4,800).',
        hint: 'Throttle between 64% and 86% maximizes acceleration torque.',
        targets: [
          {
            id: 'aut-torq3',
            label: 'DRIVE TORQUE',
            targetDisplay: '≥ 55%',
            isMet: (p) => Math.round((p?.throttle ?? 0) * 0.86) >= 55,
            currentDisplay: (p) => `${Math.round((p?.throttle ?? 0) * 0.86)}%`,
          },
          {
            id: 'aut-rpm3',
            label: 'MAX ENGINE RPM',
            targetDisplay: '≤ 4800 RPM',
            isMet: (p) => Math.round(820 + (p?.throttle ?? 0) * 46) <= 4800,
            currentDisplay: (p) => `${Math.round(820 + (p?.throttle ?? 0) * 46)} RPM`,
          },
        ],
      },
    ],
    targets: [
      {
        id: 'aut-torq',
        label: 'DRIVE TORQUE',
        targetDisplay: '≥ 40%',
        isMet: (p) => Math.round((p?.throttle ?? 0) * 0.86) >= 40,
        currentDisplay: (p) => `${Math.round((p?.throttle ?? 0) * 0.86)}%`,
      },
    ],
    evaluate: (params, _result, level = 1): ChallengeEvaluation => {
      const throt = params?.throttle ?? 0
      const rpm = Math.round(820 + throt * 46)
      const torq = Math.round(throt * 0.86)
      if (level === 1) {
        const passed = throt >= 25
        return {
          isPassed: passed,
          status: passed ? 'TARGET ACHIEVED' : 'NOT QUITE',
          feedbackMessage: passed
            ? 'Vehicle drive state engaged. Power transmission active.'
            : 'Engine is near idle. Increase throttle to engage drive.',
          engineeringInsight: 'Torque converters and clutches decouple the drivetrain at idle to prevent engine stall.',
        }
      }
      if (level === 2) {
        const passed = rpm >= 2200 && rpm <= 3600
        return {
          isPassed: passed,
          status: passed ? 'TARGET ACHIEVED' : 'NOT QUITE',
          feedbackMessage: passed
            ? `Cruise engine speed stable at ${rpm} RPM.`
            : `Current speed is ${rpm} RPM. Adjust throttle into the 30%–60% band.`,
          engineeringInsight: 'Specific fuel consumption (BSFC) is typically minimized in the mid-RPM band.',
        }
      }
      const passed = torq >= 55 && rpm <= 4800
      return {
        isPassed: passed,
        status: passed ? 'TARGET ACHIEVED' : 'NOT QUITE',
        feedbackMessage: passed
          ? `High-torque acceleration achieved! Torque: ${torq}%, RPM: ${rpm}.`
          : `Torque is ${torq}% (target >= 55%) or RPM exceeds 4,800. Fine-tune throttle.`,
        engineeringInsight: 'Drivetrain tractive effort F_t = (T_e * i_g * i_f * eta) / r_wheel.',
      }
    },
  },

  fluid: {
    id: 'fluid-venturi',
    systemId: 'fluid',
    title: 'VENTURI FLOW BALANCING',
    description: 'Control flow velocity through the constricted Venturi nozzle to deliver high flow while balancing the static pressure drop.',
    hint: 'Bernoulli principle: as velocity increases in a constriction, static pressure decreases.',
    levels: [
      {
        levelNumber: 1,
        levelTitle: 'Flow Initiation',
        objective: 'Establish a steady stream with flow velocity index of at least 30%.',
        hint: 'Increase the flow slider from zero.',
        targets: [
          {
            id: 'fld-flow1',
            label: 'FLOW INDEX',
            targetDisplay: '≥ 30%',
            isMet: (p) => (p?.flow ?? 0) >= 30,
            currentDisplay: (p) => `${p?.flow ?? 0}%`,
          },
        ],
      },
      {
        levelNumber: 2,
        levelTitle: 'Controlled Transport',
        objective: 'Deliver between 45% and 75% flow while maintaining steady pressure gradient.',
        hint: 'Mid-range flow balances delivery volume against pressure head loss.',
        targets: [
          {
            id: 'fld-flow2',
            label: 'FLOW WINDOW',
            targetDisplay: '45% – 75%',
            isMet: (p) => (p?.flow ?? 0) >= 45 && (p?.flow ?? 0) <= 75,
            currentDisplay: (p) => `${p?.flow ?? 0}%`,
          },
        ],
      },
      {
        levelNumber: 3,
        levelTitle: 'High-Volume Delivery',
        objective: 'Achieve flow index >= 80% without cavitation breakdown.',
        hint: 'Push flow into the high delivery zone.',
        targets: [
          {
            id: 'fld-flow3',
            label: 'HIGH FLOW INDEX',
            targetDisplay: '≥ 80%',
            isMet: (p) => (p?.flow ?? 0) >= 80,
            currentDisplay: (p) => `${p?.flow ?? 0}%`,
          },
        ],
      },
    ],
    targets: [
      {
        id: 'fld-flow',
        label: 'FLOW VELOCITY',
        targetDisplay: '≥ 45%',
        isMet: (p) => (p?.flow ?? 0) >= 45,
        currentDisplay: (p) => `${p?.flow ?? 0}%`,
      },
    ],
    evaluate: (params, _result, level = 1): ChallengeEvaluation => {
      const flow = params?.flow ?? 0
      if (level === 1) {
        const passed = flow >= 30
        return {
          isPassed: passed,
          status: passed ? 'TARGET ACHIEVED' : 'NOT QUITE',
          feedbackMessage: passed
            ? 'Steady flow stream established across the nozzle.'
            : 'Flow rate is too low. Increase the flow input slider.',
          engineeringInsight: 'Continuity equation: A1 * v1 = A2 * v2 for incompressible fluid.',
        }
      }
      if (level === 2) {
        const passed = flow >= 45 && flow <= 75
        return {
          isPassed: passed,
          status: passed ? 'TARGET ACHIEVED' : 'NOT QUITE',
          feedbackMessage: passed
            ? `Optimal flow delivery balanced at ${flow}% index.`
            : `Flow is ${flow}%. Adjust into the 45%–75% window.`,
          engineeringInsight: 'Bernoulli equation balances static pressure, dynamic pressure, and elevation head.',
        }
      }
      const passed = flow >= 80
      return {
        isPassed: passed,
        status: passed ? 'TARGET ACHIEVED' : 'NOT QUITE',
        feedbackMessage: passed
          ? `High-velocity transport achieved at ${flow}% flow index!`
          : `Current flow is ${flow}%. Increase above 80% to complete challenge.`,
        engineeringInsight: 'Extreme throat velocities can drop pressure below vapor pressure, causing cavitation.',
      }
    },
  },
}
