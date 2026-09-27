// scripts/verifyDesign.mjs
// Automated verification suite for CAD & Structural Beam Design Flagship Experience

import {
  calculateBeamAnalysis,
  getBeamDynamicExplanation,
  DESIGN_MATERIALS,
  BEAM_LIMITS,
} from '../src/components/mechLab/experiments/designModel.ts'
import {
  DESIGN_FLAGSHIP_CHALLENGE,
  DESIGN_LEVELS,
} from '../src/components/mechLab/experiments/designChallenge.ts'

console.log('=== VERIFYING CAD & STRUCTURAL BEAM DESIGN FLAGSHIP EXPERIENCE ===\n')

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
const defaultAnalysis = calculateBeamAnalysis({
  lengthM: BEAM_LIMITS.lengthM.default,
  widthMm: BEAM_LIMITS.widthMm.default,
  heightMm: BEAM_LIMITS.heightMm.default,
  loadKn: BEAM_LIMITS.loadKn.default,
  materialId: 'steel',
})

console.log('Default beam metrics (2.5m × 80mm × 160mm, Steel, 12 kN):')
console.log(`  Mass:          ${defaultAnalysis.massKg.toFixed(1)} kg`)
console.log(`  Bending Moment:${(defaultAnalysis.maxBendingMomentNm / 1000).toFixed(1)} kN·m`)
console.log(`  Max Stress:    ${defaultAnalysis.maxBendingStressMpa.toFixed(1)} MPa`)
console.log(`  Tip Deflection:${defaultAnalysis.tipDeflectionMm.toFixed(1)} mm`)
console.log(`  Factor of Safety: ${defaultAnalysis.factorOfSafety.toFixed(2)} (${defaultAnalysis.statusRating})`)

assert(defaultAnalysis.massKg > 100 && defaultAnalysis.massKg < 350, 'Default mass is within expected range')
assert(defaultAnalysis.maxBendingStressMpa > 50 && defaultAnalysis.maxBendingStressMpa < 120, 'Max bending stress is physically accurate')
assert(defaultAnalysis.tipDeflectionMm > 2 && defaultAnalysis.tipDeflectionMm < 25, 'Tip deflection is within reasonable elastic limits')
assert(defaultAnalysis.factorOfSafety >= 2.0, 'Default steel beam is safe with FoS >= 2.0')
assert(!defaultAnalysis.isFailed, 'Default beam is not failed')

// -------------------------------------------------------------
// TEST 2: CUBIC STIFFNESS EFFECT OF BEAM HEIGHT (h)
// -------------------------------------------------------------
console.log('\n--- TEST 2: CUBIC STIFFNESS EFFECT OF BEAM HEIGHT (h) ---')
const shortH = calculateBeamAnalysis({ lengthM: 2.0, widthMm: 80, heightMm: 100, loadKn: 10, materialId: 'steel' })
const tallH = calculateBeamAnalysis({ lengthM: 2.0, widthMm: 80, heightMm: 200, loadKn: 10, materialId: 'steel' })

console.log(`  Height 100mm -> Deflection = ${shortH.tipDeflectionMm.toFixed(2)} mm, Stress = ${shortH.maxBendingStressMpa.toFixed(1)} MPa`)
console.log(`  Height 200mm -> Deflection = ${tallH.tipDeflectionMm.toFixed(2)} mm, Stress = ${tallH.maxBendingStressMpa.toFixed(1)} MPa`)

const deflectionRatio = shortH.tipDeflectionMm / tallH.tipDeflectionMm
console.log(`  Deflection reduction factor for 2× height: ${deflectionRatio.toFixed(2)}× (theory predicts exactly 2³ = 8.0×)`)

assert(Math.abs(deflectionRatio - 8.0) < 0.05, 'Deflection reduces by exactly 8× when doubling height (cubic relationship I = wh³/12)')
assert(Math.abs(shortH.maxBendingStressMpa / tallH.maxBendingStressMpa - 4.0) < 0.05, 'Stress reduces by exactly 4× when doubling height (Z = wh²/6)')

// -------------------------------------------------------------
// TEST 3: SPAN LENGTH CUBIC DEFLECTION SCALING
// -------------------------------------------------------------
console.log('\n--- TEST 3: SPAN LENGTH CUBIC DEFLECTION SCALING ---')
const span1m = calculateBeamAnalysis({ lengthM: 1.5, widthMm: 80, heightMm: 160, loadKn: 10, materialId: 'steel' })
const span3m = calculateBeamAnalysis({ lengthM: 3.0, widthMm: 80, heightMm: 160, loadKn: 10, materialId: 'steel' })

console.log(`  Span 1.5m -> Deflection = ${span1m.tipDeflectionMm.toFixed(2)} mm`)
console.log(`  Span 3.0m -> Deflection = ${span3m.tipDeflectionMm.toFixed(2)} mm`)

const spanRatio = span3m.tipDeflectionMm / span1m.tipDeflectionMm
console.log(`  Deflection increase for 2× span: ${spanRatio.toFixed(2)}× (theory predicts 2³ = 8.0×)`)
assert(Math.abs(spanRatio - 8.0) < 0.05, 'Deflection scales cubically with span length L³')

// -------------------------------------------------------------
// TEST 4: MATERIAL SELECTION TRADEOFFS
// -------------------------------------------------------------
console.log('\n--- TEST 4: MATERIAL SELECTION TRADEOFFS ---')
const steelBeam = calculateBeamAnalysis({ lengthM: 2.0, widthMm: 80, heightMm: 160, loadKn: 15, materialId: 'steel' })
const alumBeam = calculateBeamAnalysis({ lengthM: 2.0, widthMm: 80, heightMm: 160, loadKn: 15, materialId: 'aluminum' })
const carbonBeam = calculateBeamAnalysis({ lengthM: 2.0, widthMm: 80, heightMm: 160, loadKn: 15, materialId: 'carbon_fiber' })

console.log(`  Steel:        Mass = ${steelBeam.massKg.toFixed(1)} kg, Deflection = ${steelBeam.tipDeflectionMm.toFixed(2)} mm`)
console.log(`  Aluminum:     Mass = ${alumBeam.massKg.toFixed(1)} kg, Deflection = ${alumBeam.tipDeflectionMm.toFixed(2)} mm`)
console.log(`  Carbon Fiber: Mass = ${carbonBeam.massKg.toFixed(1)} kg, Deflection = ${carbonBeam.tipDeflectionMm.toFixed(2)} mm`)

assert(alumBeam.massKg < steelBeam.massKg * 0.4, 'Aluminum is ~65% lighter than steel')
assert(alumBeam.tipDeflectionMm > steelBeam.tipDeflectionMm * 2.5, 'Aluminum deflects ~2.9× more than steel due to lower E modulus')
assert(carbonBeam.massKg < alumBeam.massKg, 'Carbon fiber is lighter than aluminum')

// -------------------------------------------------------------
// TEST 5: PLASTIC YIELD FAILURE DETECTION
// -------------------------------------------------------------
console.log('\n--- TEST 5: PLASTIC YIELD FAILURE DETECTION ---')
const overloadedBeam = calculateBeamAnalysis({
  lengthM: 3.5,
  widthMm: 45,
  heightMm: 80,
  loadKn: 40,
  materialId: 'aluminum',
})

console.log(`  Overloaded beam stress = ${overloadedBeam.maxBendingStressMpa.toFixed(0)} MPa vs yield = ${overloadedBeam.material.yieldStrengthMpa} MPa`)
console.log(`  FoS = ${overloadedBeam.factorOfSafety.toFixed(2)}, isFailed = ${overloadedBeam.isFailed}, rating = ${overloadedBeam.statusRating}`)

assert(overloadedBeam.isFailed === true, 'Yield failure correctly detected when σ > σ_yield')
assert(overloadedBeam.statusRating === 'FAILED', 'Status rating indicates FAILED')

// -------------------------------------------------------------
// TEST 6: PARAMETER CLAMPING & SANITIZATION
// -------------------------------------------------------------
console.log('\n--- TEST 6: PARAMETER CLAMPING & SANITIZATION ---')
const clampedLow = calculateBeamAnalysis({ lengthM: 0.1, widthMm: 5, heightMm: 10, loadKn: -5, materialId: 'steel' })
assert(clampedLow.params.lengthM === BEAM_LIMITS.lengthM.min, 'Negative length clamped to minimum')
assert(clampedLow.params.widthMm === BEAM_LIMITS.widthMm.min, 'Sub-minimum width clamped safely')
assert(clampedLow.params.heightMm === BEAM_LIMITS.heightMm.min, 'Sub-minimum height clamped safely')
assert(clampedLow.params.loadKn === BEAM_LIMITS.loadKn.min, 'Negative load clamped safely')

// -------------------------------------------------------------
// TEST 7: CHALLENGE LEVEL 1 (SURVIVE 15 kN LOAD)
// -------------------------------------------------------------
console.log('\n--- TEST 7: CHALLENGE LEVEL 1 (SURVIVE 15 kN LOAD) ---')
const l1LowLoad = DESIGN_FLAGSHIP_CHALLENGE.evaluate({ lengthM: 2.0, widthMm: 80, heightMm: 180, loadKn: 10, materialId: 'steel' }, null, 1)
assert(!l1LowLoad.isPassed, 'Level 1 rejects test loads under 15 kN')

const l1Failing = DESIGN_FLAGSHIP_CHALLENGE.evaluate({ lengthM: 3.5, widthMm: 45, heightMm: 80, loadKn: 15, materialId: 'aluminum' }, null, 1)
assert(!l1Failing.isPassed && l1Failing.status.includes('FAILURE'), 'Level 1 detects plastic yield failure under 15 kN')

const l1Passing = DESIGN_FLAGSHIP_CHALLENGE.evaluate({ lengthM: 2.0, widthMm: 80, heightMm: 180, loadKn: 15, materialId: 'steel' }, null, 1)
assert(l1Passing.isPassed, 'Level 1 passes when beam survives 15 kN with FoS >= 1.50')

// -------------------------------------------------------------
// TEST 8: CHALLENGE LEVEL 2 (LIGHTWEIGHT STRUCTURE)
// -------------------------------------------------------------
console.log('\n--- TEST 8: CHALLENGE LEVEL 2 (LIGHTWEIGHT STRUCTURE) ---')
const l2TooHeavy = DESIGN_FLAGSHIP_CHALLENGE.evaluate({ lengthM: 2.5, widthMm: 120, heightMm: 220, loadKn: 20, materialId: 'steel' }, null, 2)
assert(!l2TooHeavy.isPassed && l2TooHeavy.status === 'STRUCTURE TOO HEAVY', 'Level 2 flags heavy steel beam as exceeding mass limit')

const l2Passing = DESIGN_FLAGSHIP_CHALLENGE.evaluate({ lengthM: 1.5, widthMm: 50, heightMm: 160, loadKn: 20, materialId: 'aluminum' }, null, 2)
assert(l2Passing.isPassed, 'Level 2 passes with lightweight aluminum beam under 38.0 kg')

// -------------------------------------------------------------
// TEST 9: CHALLENGE LEVEL 3 (PRECISION STIFFNESS)
// -------------------------------------------------------------
console.log('\n--- TEST 9: CHALLENGE LEVEL 3 (PRECISION STIFFNESS) ---')
const l3Saggy = DESIGN_FLAGSHIP_CHALLENGE.evaluate({ lengthM: 2.5, widthMm: 60, heightMm: 120, loadKn: 25, materialId: 'carbon_fiber' }, null, 3)
assert(!l3Saggy.isPassed && l3Saggy.status === 'DEFLECTION TOO HIGH', 'Level 3 flags beam with excessive tip deflection')

const l3Passing = DESIGN_FLAGSHIP_CHALLENGE.evaluate({ lengthM: 1.3, widthMm: 60, heightMm: 220, loadKn: 25, materialId: 'carbon_fiber' }, null, 3)
assert(l3Passing.isPassed, 'Level 3 passes with optimized high-stiffness, low-mass carbon beam')

// -------------------------------------------------------------
// TEST 10: PROGRESSIVE 3-CARD EXPLANATIONS & ZERO NaN
// -------------------------------------------------------------
console.log('\n--- TEST 10: PROGRESSIVE 3-CARD EXPLANATIONS & ZERO NaN ---')
const explanation = getBeamDynamicExplanation(
  { lengthM: 2.0, widthMm: 80, heightMm: 200, loadKn: 15, materialId: 'steel' },
  { lengthM: 2.0, widthMm: 80, heightMm: 120, loadKn: 15, materialId: 'steel' }
)
console.log('Height change explanation:')
console.log(`  01: ${explanation.whatChanged}`)
console.log(`  02: ${explanation.whatHappened}`)
console.log(`  03: ${explanation.why}`)

assert(explanation.whatChanged.length > 10, 'Explanation card 1 generated')
assert(explanation.whatHappened.length > 10, 'Explanation card 2 generated')
assert(explanation.why.length > 10, 'Explanation card 3 generated')

// Sanity check across 20 configurations for NaN or Infinity
let hasNaN = false
for (let l = 1.0; l <= 4.0; l += 0.8) {
  for (let h = 60; h <= 300; h += 60) {
    for (const mat of ['steel', 'aluminum', 'titanium', 'carbon_fiber', 'wood']) {
      const res = calculateBeamAnalysis({ lengthM: l, widthMm: 80, heightMm: h, loadKn: 20, materialId: mat })
      if (
        isNaN(res.massKg) ||
        isNaN(res.maxBendingStressMpa) ||
        isNaN(res.tipDeflectionMm) ||
        isNaN(res.factorOfSafety) ||
        !isFinite(res.massKg) ||
        !isFinite(res.maxBendingStressMpa)
      ) {
        hasNaN = true
      }
    }
  }
}
assert(!hasNaN, 'Zero NaN or infinite values across multiple configurations')

console.log('\n========================================')
if (failures === 0) {
  console.log('ALL DESIGN VERIFICATION CHECKS PASSED!')
  console.log('========================================\n')
  process.exit(0)
} else {
  console.error(`FAILED: ${failures} check(s) did not pass.`)
  console.log('========================================\n')
  process.exit(1)
}
