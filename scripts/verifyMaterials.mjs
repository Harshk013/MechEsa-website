// scripts/verifyMaterials.mjs
// Automated verification suite for Materials Flagship Experience (ASTM E8 Tensile Test)

import {
  calculateMaterialsAnalysis,
  getMaterialsDynamicExplanation,
  MATERIALS_DATABASE,
  SPECIMEN_LIMITS,
  DEFAULT_SPECIMEN_PARAMS,
} from '../src/components/mechLab/experiments/materialsModel.ts'
import {
  MATERIALS_FLAGSHIP_CHALLENGE,
  MATERIALS_LEVELS,
} from '../src/components/mechLab/experiments/materialsChallenge.ts'

console.log('=== VERIFYING MATERIALS SCIENCE & TENSILE EXPERIMENT FLAGSHIP ===\n')

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
// TEST 1: DEFAULT SPECIMEN PHYSICAL ACCURACY
// -------------------------------------------------------------
console.log('--- TEST 1: DEFAULT SPECIMEN PHYSICAL ACCURACY ---')
const defaultAnalysis = calculateMaterialsAnalysis(DEFAULT_SPECIMEN_PARAMS)

console.log('Default specimen metrics (Steel 1018, 100mm × 20mm × 10mm, 20 kN):')
console.log(`  Area:          ${defaultAnalysis.crossSectionAreaMm2} mm²`)
console.log(`  Stress:        ${defaultAnalysis.normalStressMpa.toFixed(1)} MPa`)
console.log(`  Strain:        ${(defaultAnalysis.strainPercent).toFixed(4)}%`)
console.log(`  Elongation ΔL: ${defaultAnalysis.elongationMm.toFixed(4)} mm`)
console.log(`  FoS:           ${defaultAnalysis.factorOfSafety.toFixed(2)} (${defaultAnalysis.statusRating})`)
console.log(`  Gauge Mass:    ${(defaultAnalysis.specimenMassKg * 1000).toFixed(1)} g`)

assert(Math.abs(defaultAnalysis.crossSectionAreaMm2 - 200) < 0.01, 'Cross-sectional area is exactly 200 mm²')
assert(Math.abs(defaultAnalysis.normalStressMpa - 100) < 0.1, 'Normal stress σ = F/A is exactly 100 MPa')
assert(Math.abs(defaultAnalysis.factorOfSafety - 2.50) < 0.05, 'Factor of safety is 2.50 (250 MPa yield / 100 MPa stress)')
assert(defaultAnalysis.elongationMm > 0.045 && defaultAnalysis.elongationMm < 0.052, 'Elongation matches Hooke\'s law (~0.0488 mm)')
assert(!defaultAnalysis.isYielded && !defaultAnalysis.isRuptured, 'Default specimen remains purely elastic')

// -------------------------------------------------------------
// TEST 2: HOOKE\'S LAW LINEAR ELASTIC SCALING (LOAD & AREA)
// -------------------------------------------------------------
console.log('\n--- TEST 2: HOOKE\'S LAW LINEAR ELASTIC SCALING ---')
const load10 = calculateMaterialsAnalysis({ ...DEFAULT_SPECIMEN_PARAMS, appliedLoadKn: 10.0 })
const load20 = calculateMaterialsAnalysis({ ...DEFAULT_SPECIMEN_PARAMS, appliedLoadKn: 20.0 })
const load40 = calculateMaterialsAnalysis({ ...DEFAULT_SPECIMEN_PARAMS, appliedLoadKn: 40.0 })

assert(Math.abs(load20.normalStressMpa - 2 * load10.normalStressMpa) < 0.1, 'Doubling load exactly doubles normal stress (100 vs 50 MPa)')
assert(Math.abs(load40.normalStressMpa - 2 * load20.normalStressMpa) < 0.1, 'Doubling load again doubles normal stress (200 vs 100 MPa)')
assert(Math.abs(load20.elongationMm - 2 * load10.elongationMm) < 0.001, 'Doubling load doubles elastic elongation')

const thick10 = calculateMaterialsAnalysis({ ...DEFAULT_SPECIMEN_PARAMS, gaugeThicknessMm: 10.0 })
const thick20 = calculateMaterialsAnalysis({ ...DEFAULT_SPECIMEN_PARAMS, gaugeThicknessMm: 20.0 })
assert(Math.abs(thick20.normalStressMpa - 0.5 * thick10.normalStressMpa) < 0.1, 'Doubling thickness halves normal stress (50 vs 100 MPa)')

// -------------------------------------------------------------
// TEST 3: GAUGE LENGTH INDEPENDENCE OF STRESS VS ELONGATION
// -------------------------------------------------------------
console.log('\n--- TEST 3: GAUGE LENGTH SCALING ---')
const len100 = calculateMaterialsAnalysis({ ...DEFAULT_SPECIMEN_PARAMS, gaugeLengthMm: 100.0 })
const len200 = calculateMaterialsAnalysis({ ...DEFAULT_SPECIMEN_PARAMS, gaugeLengthMm: 200.0 })

assert(Math.abs(len100.normalStressMpa - len200.normalStressMpa) < 0.01, 'Stress is completely independent of gauge length (F/A)')
assert(Math.abs(len200.elongationMm - 2 * len100.elongationMm) < 0.001, 'Total elongation scales directly with gauge length (ΔL = ε · L0)')

// -------------------------------------------------------------
// TEST 4: MATERIAL SELECTION TRADEOFFS
// -------------------------------------------------------------
console.log('\n--- TEST 4: MATERIAL SELECTION TRADEOFFS ---')
const steel = calculateMaterialsAnalysis({ ...DEFAULT_SPECIMEN_PARAMS, materialId: 'structural_steel' })
const alu = calculateMaterialsAnalysis({ ...DEFAULT_SPECIMEN_PARAMS, materialId: 'aluminum_6061' })
const ti = calculateMaterialsAnalysis({ ...DEFAULT_SPECIMEN_PARAMS, materialId: 'titanium_ti6al4v' })
const cfrp = calculateMaterialsAnalysis({ ...DEFAULT_SPECIMEN_PARAMS, materialId: 'carbon_composite' })
const polymer = calculateMaterialsAnalysis({ ...DEFAULT_SPECIMEN_PARAMS, materialId: 'engineering_polymer' })

console.log(`  Steel 1018:     Mass=${(steel.specimenMassKg*1000).toFixed(1)}g, FoS=${steel.factorOfSafety.toFixed(2)}, ΔL=${steel.elongationMm.toFixed(4)}mm`)
console.log(`  Aluminum 6061:  Mass=${(alu.specimenMassKg*1000).toFixed(1)}g, FoS=${alu.factorOfSafety.toFixed(2)}, ΔL=${alu.elongationMm.toFixed(4)}mm`)
console.log(`  Titanium Gr5:   Mass=${(ti.specimenMassKg*1000).toFixed(1)}g, FoS=${ti.factorOfSafety.toFixed(2)}, ΔL=${ti.elongationMm.toFixed(4)}mm`)
console.log(`  CFRP Composite: Mass=${(cfrp.specimenMassKg*1000).toFixed(1)}g, FoS=${cfrp.factorOfSafety.toFixed(2)}, ΔL=${cfrp.elongationMm.toFixed(4)}mm`)
console.log(`  Nylon Polymer:  Mass=${(polymer.specimenMassKg*1000).toFixed(1)}g, FoS=${polymer.factorOfSafety.toFixed(2)}, ΔL=${polymer.elongationMm.toFixed(4)}mm`)

assert(alu.specimenMassKg < steel.specimenMassKg * 0.40, 'Aluminum is over 60% lighter than steel')
assert(alu.elongationMm > steel.elongationMm * 2.5, 'Aluminum stretches ~3x more than steel due to lower modulus (69 vs 205 GPa)')
assert(ti.factorOfSafety > steel.factorOfSafety * 3.0, 'Titanium Grade 5 has >3x higher safety factor due to 880 MPa yield')
assert(cfrp.specimenMassKg < steel.specimenMassKg * 0.25, 'CFRP composite is ~80% lighter than steel')
assert(polymer.elongationMm > steel.elongationMm * 50, 'Polymer exhibits massive compliance compared to metals')

// -------------------------------------------------------------
// TEST 5: PLASTIC YIELDING & RUPTURE BEHAVIOR
// -------------------------------------------------------------
console.log('\n--- TEST 5: PLASTIC YIELD & RUPTURE DETECTION ---')
// Severe load on slender steel: 60 kN on 10mm x 5mm = 50 mm² -> 1200 MPa (Steel yield: 250 MPa, UTS: 400 MPa)
const rupturedSteel = calculateMaterialsAnalysis({
  appliedLoadKn: 60.0,
  gaugeWidthMm: 10.0,
  gaugeThicknessMm: 5.0,
  gaugeLengthMm: 100.0,
  materialId: 'structural_steel',
})

assert(rupturedSteel.isYielded, 'Severe overload triggers plastic yielding')
assert(rupturedSteel.isRuptured, 'Stress exceeding ultimate tensile strength (UTS) triggers tensile rupture')
assert(rupturedSteel.statusRating === 'RUPTURED', 'Status rating indicates RUPTURED')

// -------------------------------------------------------------
// TEST 6: INPUT SANITIZATION & BOUNDARY INTEGRITY
// -------------------------------------------------------------
console.log('\n--- TEST 6: PARAMETER CLAMPING & SANITIZATION ---')
const clampedParams = calculateMaterialsAnalysis({
  appliedLoadKn: -50.0,
  gaugeWidthMm: 5.0,
  gaugeThicknessMm: 1.0,
  gaugeLengthMm: 500.0,
  materialId: 'structural_steel',
})

assert(clampedParams.params.appliedLoadKn === SPECIMEN_LIMITS.appliedLoadKn.min, 'Negative load clamped to minimum')
assert(clampedParams.params.gaugeWidthMm === SPECIMEN_LIMITS.gaugeWidthMm.min, 'Sub-minimum width clamped safely')
assert(clampedParams.params.gaugeThicknessMm === SPECIMEN_LIMITS.gaugeThicknessMm.min, 'Sub-minimum thickness clamped safely')
assert(clampedParams.params.gaugeLengthMm === SPECIMEN_LIMITS.gaugeLengthMm.max, 'Excessive length clamped safely')

// -------------------------------------------------------------
// TEST 7: CHALLENGE LEVEL 1 (STAY ELASTIC)
// -------------------------------------------------------------
console.log('\n--- TEST 7: CHALLENGE LEVEL 1 (STAY ELASTIC) ---')
const l1LowLoad = MATERIALS_FLAGSHIP_CHALLENGE.evaluate({ appliedLoadKn: 15.0, materialId: 'structural_steel' }, null, 1)
assert(!l1LowLoad.isPassed, 'Level 1 rejects test loads under 25.0 kN')

// Yielded aluminum under 25 kN
const l1Yielded = MATERIALS_FLAGSHIP_CHALLENGE.evaluate({
  appliedLoadKn: 25.0,
  gaugeWidthMm: 10.0,
  gaugeThicknessMm: 5.0,
  gaugeLengthMm: 100.0,
  materialId: 'aluminum_6061',
}, null, 1)
assert(!l1Yielded.isPassed, 'Level 1 detects yielding and fails')

// Robust steel under 25 kN
const l1Passed = MATERIALS_FLAGSHIP_CHALLENGE.evaluate({
  appliedLoadKn: 25.0,
  gaugeWidthMm: 25.0,
  gaugeThicknessMm: 10.0,
  gaugeLengthMm: 100.0,
  materialId: 'structural_steel',
}, null, 1)
assert(l1Passed.isPassed, 'Level 1 passes when specimen carries ≥25 kN purely elastically')

// -------------------------------------------------------------
// TEST 8: CHALLENGE LEVEL 2 (DESIGN FOR SAFETY)
// -------------------------------------------------------------
console.log('\n--- TEST 8: CHALLENGE LEVEL 2 (DESIGN FOR SAFETY) ---')
const l2LowLoad = MATERIALS_FLAGSHIP_CHALLENGE.evaluate({ appliedLoadKn: 30.0 }, null, 2)
assert(!l2LowLoad.isPassed, 'Level 2 requires at least 40.0 kN load')

// Slender titanium under 40 kN: stress high, FoS < 2.0
const l2LowFos = MATERIALS_FLAGSHIP_CHALLENGE.evaluate({
  appliedLoadKn: 40.0,
  gaugeWidthMm: 15.0,
  gaugeThicknessMm: 6.0,
  gaugeLengthMm: 100.0,
  materialId: 'titanium_ti6al4v',
}, null, 2)
assert(!l2LowFos.isPassed, 'Level 2 rejects designs with FoS < 2.00')

// Stout titanium under 40 kN: 25mm x 12mm = 300 mm² -> 133 MPa stress, FoS = 880 / 133 = 6.6, ΔL = 0.117 mm
const l2Passed = MATERIALS_FLAGSHIP_CHALLENGE.evaluate({
  appliedLoadKn: 40.0,
  gaugeWidthMm: 25.0,
  gaugeThicknessMm: 12.0,
  gaugeLengthMm: 100.0,
  materialId: 'titanium_ti6al4v',
}, null, 2)
assert(l2Passed.isPassed, 'Level 2 passes with certified safety margin (FoS ≥ 2.00, ΔL ≤ 0.50 mm)')

// -------------------------------------------------------------
// TEST 9: CHALLENGE LEVEL 3 (LIGHTWEIGHT BUT SAFE)
// -------------------------------------------------------------
console.log('\n--- TEST 9: CHALLENGE LEVEL 3 (LIGHTWEIGHT BUT SAFE) ---')
// Heavy steel under 35 kN: mass exceeds 0.180 kg limit
const l3OverweightSteel = MATERIALS_FLAGSHIP_CHALLENGE.evaluate({
  appliedLoadKn: 35.0,
  gaugeWidthMm: 35.0,
  gaugeThicknessMm: 15.0,
  gaugeLengthMm: 200.0,
  materialId: 'structural_steel',
}, null, 3)
assert(!l3OverweightSteel.isPassed, 'Level 3 rejects heavy steel specimen exceeding 0.180 kg mass')

// Optimized CFRP composite under 35 kN: 20mm x 6mm = 120 mm², L0 = 80mm
// stress = 292 MPa, yield = 600 MPa (FoS = 2.05), mass = 120e-6 * 0.08 * 1550 = 0.0148 kg (< 0.180 kg)
// elongation = (35e3 * 0.08) / (140e9 * 120e-6) = 0.166 mm (< 0.30 mm)
const l3Passed = MATERIALS_FLAGSHIP_CHALLENGE.evaluate({
  appliedLoadKn: 35.0,
  gaugeWidthMm: 20.0,
  gaugeThicknessMm: 6.0,
  gaugeLengthMm: 80.0,
  materialId: 'carbon_composite',
}, null, 3)
assert(l3Passed.isPassed, 'Level 3 passes with optimized lightweight, high-stiffness CFRP composite')

// -------------------------------------------------------------
// TEST 10: PROGRESSIVE 3-CARD EXPLANATIONS & ZERO NaN
// -------------------------------------------------------------
console.log('\n--- TEST 10: DYNAMIC EXPLANATIONS & NUMERICAL SANITY ---')
const expLoad = getMaterialsDynamicExplanation(
  { ...DEFAULT_SPECIMEN_PARAMS, appliedLoadKn: 35.0 },
  DEFAULT_SPECIMEN_PARAMS
)
console.log('Dynamic reaction on load change:')
console.log(`  01: ${expLoad.whatChanged}`)
console.log(`  02: ${expLoad.whatHappened}`)
console.log(`  03: ${expLoad.why}`)

assert(Boolean(expLoad.whatChanged), 'Card 01 (You Changed) generated')
assert(Boolean(expLoad.whatHappened), 'Card 02 (What Happened) generated')
assert(Boolean(expLoad.why), 'Card 03 (Why) generated')

// Check zero NaN or infinite numbers across 5 materials
for (const matKey of Object.keys(MATERIALS_DATABASE)) {
  const res = calculateMaterialsAnalysis({
    appliedLoadKn: 30.0,
    gaugeWidthMm: 20.0,
    gaugeThicknessMm: 10.0,
    gaugeLengthMm: 120.0,
    materialId: matKey,
  })
  assert(Number.isFinite(res.normalStressMpa), `Stress is finite for ${matKey}`)
  assert(Number.isFinite(res.elongationMm), `Elongation is finite for ${matKey}`)
  assert(Number.isFinite(res.factorOfSafety), `FoS is finite for ${matKey}`)
  assert(Number.isFinite(res.specimenMassKg), `Mass is finite for ${matKey}`)
}

console.log('\n========================================')
if (failures === 0) {
  console.log('ALL MATERIALS VERIFICATION CHECKS PASSED!')
  console.log('========================================\n')
} else {
  console.error(`FAILED: ${failures} checks failed!`)
  console.error('========================================\n')
  process.exit(1)
}
