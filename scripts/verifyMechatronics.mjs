// scripts/verifyMechatronics.mjs
// Automated verification suite for Mechatronics Flagship Experience (Closed-Loop Servo Stage & PID Control)

import {
  calculateMechatronicsAnalysis,
  getMechatronicsDynamicExplanation,
  DEFAULT_MECHATRONICS_PARAMS,
  MECHATRONICS_LIMITS,
  MECHATRONICS_EQUATIONS,
} from '../src/components/mechLab/experiments/mechatronicsModel.ts'
import {
  MECHATRONICS_FLAGSHIP_CHALLENGE,
  MECHATRONICS_LEVELS,
} from '../src/components/mechLab/experiments/mechatronicsChallenge.ts'

console.log('=== VERIFYING MECHATRONICS & CLOSED-LOOP CONTROL FLAGSHIP EXPERIENCE ===\n')

let failures = 0
function assert(condition, message) {
  if (!condition) {
    console.error(`✗ FAIL: ${message}`)
    failures++
  } else {
    console.log(`✓ PASS: ${message}`)
  }
}

// -------------------------------------------------------------
// TEST 1: DEFAULT CONFIGURATION PHYSICAL CONSISTENCY
// -------------------------------------------------------------
console.log('--- TEST 1: DEFAULT CONFIGURATION PHYSICAL CONSISTENCY ---')
const defAnalysis = calculateMechatronicsAnalysis(DEFAULT_MECHATRONICS_PARAMS)

console.log('Default Mechatronic Stage Metrics (r=58mm, Kp=3.5, Kd=0.60, Ki=0.8, Load=0N):')
console.log(`  Target:           ${defAnalysis.targetPositionMm} mm`)
console.log(`  Actual Position:  ${defAnalysis.actualPositionMm} mm`)
console.log(`  Tracking Error:   ${defAnalysis.trackingErrorMm} mm`)
console.log(`  Natural Freq ωn:  ${defAnalysis.naturalFrequencyRadS} rad/s (${defAnalysis.naturalFrequencyHz} Hz)`)
console.log(`  Damping Ratio ζ:  ${defAnalysis.dampingRatio} (${defAnalysis.systemStability})`)
console.log(`  Peak Overshoot Mp:${defAnalysis.peakOvershootPercent}%`)
console.log(`  Settling Time ts: ${defAnalysis.settlingTimeSec} s`)
console.log(`  Control Effort u: ${defAnalysis.controlEffortVolts} V (${defAnalysis.actuatorDutyPercent}% duty)`)

assert(defAnalysis.targetPositionMm === 58, 'Default target position is 58 mm')
assert(Math.abs(defAnalysis.actualPositionMm - 58) <= 0.1, 'Default actual position converges cleanly to 58 mm')
assert(defAnalysis.trackingErrorMm <= 0.1, 'Default tracking error is zero under zero load')
assert(defAnalysis.naturalFrequencyRadS > 1.0, 'Natural frequency is positive and realistic')
assert(defAnalysis.dampingRatio >= 0.5 && defAnalysis.dampingRatio <= 1.2, 'Damping ratio is in stable underdamped / critically damped regime')
assert(defAnalysis.trajectory.length === 41, 'Trajectory generator outputs 41 time-domain response points')

// -------------------------------------------------------------
// TEST 2: PROPORTIONAL GAIN (Kp) SOFTWARE STIFFNESS SCALING
// -------------------------------------------------------------
console.log('\n--- TEST 2: PROPORTIONAL GAIN (Kp) SOFTWARE STIFFNESS SCALING ---')
const lowKpAnalysis = calculateMechatronicsAnalysis({ ...DEFAULT_MECHATRONICS_PARAMS, proportionalGainKp: 1.0 })
const highKpAnalysis = calculateMechatronicsAnalysis({ ...DEFAULT_MECHATRONICS_PARAMS, proportionalGainKp: 8.0 })

console.log(`  Kp=1.0: ωn = ${lowKpAnalysis.naturalFrequencyRadS} rad/s, tr = ${lowKpAnalysis.riseTimeSec} s`)
console.log(`  Kp=8.0: ωn = ${highKpAnalysis.naturalFrequencyRadS} rad/s, tr = ${highKpAnalysis.riseTimeSec} s`)

assert(highKpAnalysis.naturalFrequencyRadS > lowKpAnalysis.naturalFrequencyRadS, 'Higher Kp increases natural frequency bandwidth')
assert(highKpAnalysis.riseTimeSec < lowKpAnalysis.riseTimeSec, 'Higher Kp yields faster rise time tr')

// -------------------------------------------------------------
// TEST 3: DERIVATIVE GAIN (Kd) DAMPING & OVERSHOOT SUPPRESSION
// -------------------------------------------------------------
console.log('\n--- TEST 3: DERIVATIVE GAIN (Kd) DAMPING & OVERSHOOT SUPPRESSION ---')
const underdamped = calculateMechatronicsAnalysis({
  ...DEFAULT_MECHATRONICS_PARAMS,
  proportionalGainKp: 7.0,
  derivativeGainKd: 0.05,
})
const wellDamped = calculateMechatronicsAnalysis({
  ...DEFAULT_MECHATRONICS_PARAMS,
  proportionalGainKp: 7.0,
  derivativeGainKd: 1.2,
})

console.log(`  Kd=0.05 (Low Damping):  ζ = ${underdamped.dampingRatio}, Mp = ${underdamped.peakOvershootPercent}%`)
console.log(`  Kd=1.20 (High Damping): ζ = ${wellDamped.dampingRatio}, Mp = ${wellDamped.peakOvershootPercent}%`)

assert(wellDamped.dampingRatio > underdamped.dampingRatio, 'Increasing Kd increases damping ratio ζ')
assert(underdamped.peakOvershootPercent > wellDamped.peakOvershootPercent, 'Low Kd exhibits significant overshoot, high Kd suppresses overshoot')
assert(wellDamped.peakOvershootPercent <= 5.0, 'High Kd curtails overshoot to <= 5%')

// -------------------------------------------------------------
// TEST 4: DISTURBANCE LOAD & INTEGRAL ACTION (Ki) DROOP ELIMINATION
// -------------------------------------------------------------
console.log('\n--- TEST 4: DISTURBANCE LOAD & INTEGRAL ACTION (Ki) DROOP ELIMINATION ---')
const pdWithLoad = calculateMechatronicsAnalysis({
  ...DEFAULT_MECHATRONICS_PARAMS,
  integralGainKi: 0.0,
  disturbanceLoadN: 30,
})
const pidWithLoad = calculateMechatronicsAnalysis({
  ...DEFAULT_MECHATRONICS_PARAMS,
  integralGainKi: 2.5,
  disturbanceLoadN: 30,
})

console.log(`  30N load with Ki=0.0 (Pure PD): Droop = ${pdWithLoad.steadyStateErrorMm} mm`)
console.log(`  30N load with Ki=2.5 (PID):     Droop = ${pidWithLoad.steadyStateErrorMm} mm`)

assert(pdWithLoad.steadyStateErrorMm > 0.15, 'Pure PD exhibits steady-state droop under external load')
assert(pidWithLoad.steadyStateErrorMm < pdWithLoad.steadyStateErrorMm, 'Integral gain Ki substantially eliminates steady-state load droop')

// -------------------------------------------------------------
// TEST 5: CHALLENGE LEVEL 1 (TARGET IN 45-65 mm, ERROR <= 2.0 mm)
// -------------------------------------------------------------
console.log('\n--- TEST 5: CHALLENGE LEVEL 1 ---')
const l1OutRange = MECHATRONICS_FLAGSHIP_CHALLENGE.evaluate(
  { ...DEFAULT_MECHATRONICS_PARAMS, targetPositionMm: 20 },
  null,
  1
)
assert(!l1OutRange.isPassed, 'Level 1 fails when target position is outside 45-65 mm')
assert(l1OutRange.status === 'TARGET OUTSIDE RANGE', 'Level 1 indicates TARGET OUTSIDE RANGE')

const l1Pass = MECHATRONICS_FLAGSHIP_CHALLENGE.evaluate(
  { ...DEFAULT_MECHATRONICS_PARAMS, targetPositionMm: 55 },
  null,
  1
)
assert(l1Pass.isPassed, 'Level 1 passes when target is 55 mm with zero error')
assert(l1Pass.status === 'TARGET REACHED ✓', 'Level 1 status is TARGET REACHED ✓')

// -------------------------------------------------------------
// TEST 6: CHALLENGE LEVEL 2 (OVERSHOOT <= 12%, SETTLING <= 0.8s)
// -------------------------------------------------------------
console.log('\n--- TEST 6: CHALLENGE LEVEL 2 ---')
const l2Ringing = MECHATRONICS_FLAGSHIP_CHALLENGE.evaluate(
  { ...DEFAULT_MECHATRONICS_PARAMS, proportionalGainKp: 8.0, derivativeGainKd: 0.05 },
  null,
  2
)
assert(!l2Ringing.isPassed, 'Level 2 fails when carriage rings with excessive overshoot')
assert(l2Ringing.status === 'EXCESSIVE OVERSHOOT', 'Level 2 flags EXCESSIVE OVERSHOOT')

const l2Pass = MECHATRONICS_FLAGSHIP_CHALLENGE.evaluate(
  { ...DEFAULT_MECHATRONICS_PARAMS, proportionalGainKp: 6.0, derivativeGainKd: 0.9 },
  null,
  2
)
assert(l2Pass.isPassed, 'Level 2 passes when Kp and Kd are optimally tuned')
assert(l2Pass.status === 'DYNAMICS OPTIMIZED ✓', 'Level 2 status is DYNAMICS OPTIMIZED ✓')

// -------------------------------------------------------------
// TEST 7: CHALLENGE LEVEL 3 (DISTURBANCE >= 25 N, ERROR <= 1.8 mm)
// -------------------------------------------------------------
console.log('\n--- TEST 7: CHALLENGE LEVEL 3 ---')
const l3NoLoad = MECHATRONICS_FLAGSHIP_CHALLENGE.evaluate(
  { ...DEFAULT_MECHATRONICS_PARAMS, disturbanceLoadN: 5 },
  null,
  3
)
assert(!l3NoLoad.isPassed, 'Level 3 fails when disturbance load is under 25 N')
assert(l3NoLoad.status === 'DISTURBANCE TOO LOW', 'Level 3 flags DISTURBANCE TOO LOW')

const l3Pass = MECHATRONICS_FLAGSHIP_CHALLENGE.evaluate(
  { ...DEFAULT_MECHATRONICS_PARAMS, disturbanceLoadN: 35, proportionalGainKp: 6.0, integralGainKi: 2.0 },
  null,
  3
)
assert(l3Pass.isPassed, 'Level 3 passes under 35 N load with robust integral rejection')
assert(l3Pass.status === 'DISTURBANCE REJECTED ✓', 'Level 3 status is DISTURBANCE REJECTED ✓')

// -------------------------------------------------------------
// TEST 8: EMPTY PARAMS HANDLING IN AUTOMATED SUITE
// -------------------------------------------------------------
console.log('\n--- TEST 8: EMPTY PARAMS HANDLING ---')
const emptyEval = MECHATRONICS_FLAGSHIP_CHALLENGE.evaluate({}, null, 1)
assert(typeof emptyEval.isPassed === 'boolean', 'Empty params returns boolean isPassed')
assert(typeof emptyEval.status === 'string', 'Empty params returns string status')
assert(typeof emptyEval.feedbackMessage === 'string', 'Empty params returns feedbackMessage')

// -------------------------------------------------------------
// TEST 9: DYNAMIC 3-CARD EDUCATIONAL EXPLANATIONS
// -------------------------------------------------------------
console.log('\n--- TEST 9: DYNAMIC 3-CARD EDUCATIONAL EXPLANATIONS ---')
const expKp = getMechatronicsDynamicExplanation(
  { ...DEFAULT_MECHATRONICS_PARAMS, proportionalGainKp: 8.0 },
  DEFAULT_MECHATRONICS_PARAMS
)
console.log('Kp change explanation:')
console.log(`  Card 01: ${expKp.whatChanged}`)
console.log(`  Card 02: ${expKp.whatHappened}`)
console.log(`  Card 03: ${expKp.why}`)

assert(expKp.whatChanged.length > 10, 'Card 01 explains Kp change')
assert(expKp.whatHappened.length > 10, 'Card 02 explains system response')
assert(expKp.why.length > 10, 'Card 03 explains control theory principle')

const expKd = getMechatronicsDynamicExplanation(
  { ...DEFAULT_MECHATRONICS_PARAMS, derivativeGainKd: 1.5 },
  DEFAULT_MECHATRONICS_PARAMS
)
assert(expKd.whatChanged.includes('Derivative Gain'), 'Card 01 detects Kd change')

// -------------------------------------------------------------
// TEST 10: GOVERNING EQUATIONS COVERAGE
// -------------------------------------------------------------
console.log('\n--- TEST 10: GOVERNING EQUATIONS COVERAGE ---')
assert(MECHATRONICS_EQUATIONS.length >= 5, 'Mechatronics provides at least 5 governing equations')
assert(MECHATRONICS_EQUATIONS.some((eq) => eq.title.includes('PID')), 'Includes PID control law')
assert(MECHATRONICS_EQUATIONS.some((eq) => eq.title.includes('Second-Order')), 'Includes 2nd-order dynamic response')
assert(MECHATRONICS_EQUATIONS.some((eq) => eq.title.includes('Overshoot')), 'Includes percent overshoot equation')

console.log('\n=============================================================')
if (failures === 0) {
  console.log('✅ ALL MECHATRONICS FLAGSHIP TESTS PASSED PERFECTLY!')
} else {
  console.error(`❌ ${failures} TESTS FAILED`)
  process.exit(1)
}
