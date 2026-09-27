// scripts/verifyManufacturing.mjs
// Automated verification suite for Manufacturing Flagship Experience (CNC Machining & Milling Mechanics)

import {
  calculateManufacturingAnalysis,
  getManufacturingDynamicExplanation,
  WORKPIECE_MATERIALS,
  CUTTING_TOOLS,
  MANUFACTURING_LIMITS,
  DEFAULT_MANUFACTURING_PARAMS,
  MANUFACTURING_EQUATIONS,
} from '../src/components/mechLab/experiments/manufacturingModel.ts'
import {
  MANUFACTURING_FLAGSHIP_CHALLENGE,
  MANUFACTURING_LEVELS,
} from '../src/components/mechLab/experiments/manufacturingChallenge.ts'

console.log('=== VERIFYING MANUFACTURING & CNC MACHINING FLAGSHIP EXPERIENCE ===\n')

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
// TEST 1: DEFAULT CNC MILLING CUTTING KINEMATICS
// -------------------------------------------------------------
console.log('--- TEST 1: DEFAULT CNC MILLING CUTTING KINEMATICS ---')
const defAnalysis = calculateManufacturingAnalysis(DEFAULT_MANUFACTURING_PARAMS)

console.log('Default CNC Parameters (Al 6061-T6, Ø12mm 4-Flute, 2400 RPM, fz=0.08 mm, ap=2.0 mm, ae=6.0 mm):')
console.log(`  Cutting Speed Vc:     ${defAnalysis.cuttingSpeedMpm} m/min`)
console.log(`  Table Feed vf:        ${defAnalysis.tableFeedMmPerMin} mm/min`)
console.log(`  Removal Rate MRR:     ${defAnalysis.materialRemovalRateCm3Min} cm³/min`)
console.log(`  Cutting Force Fc:     ${defAnalysis.tangentialCuttingForceN} N`)
console.log(`  Spindle Power Pc:     ${defAnalysis.spindlePowerKw} kW (${defAnalysis.spindleLoadPercent}% load)`)
console.log(`  Surface Roughness Ra: ${defAnalysis.surfaceRoughnessRaUm} µm`)
console.log(`  Cutting Temp:         ${defAnalysis.estimatedCuttingTempC} °C`)

// Theoretical: Vc = π * 12 * 2400 / 1000 = 90.478 m/min
assert(Math.abs(defAnalysis.cuttingSpeedMpm - 90.5) < 0.2, 'Cutting speed Vc = π·D·N/1000 is ~90.5 m/min')
// Theoretical: vf = 0.08 * 4 * 2400 = 768 mm/min
assert(Math.abs(defAnalysis.tableFeedMmPerMin - 768) < 1, 'Table feed rate vf = fz·z·N is exactly 768 mm/min')
// Theoretical: MRR = 2.0 * 6.0 * 768 / 1000 = 9.216 cm³/min
assert(Math.abs(defAnalysis.materialRemovalRateCm3Min - 9.2) < 0.2, 'Material removal rate MRR = ap·ae·vf/1000 is ~9.2 cm³/min')
assert(defAnalysis.spindlePowerKw > 0.1 && defAnalysis.spindlePowerKw < 1.0, 'Default power draw is modest and within motor capacity (< 1 kW)')
assert(!defAnalysis.isOverloaded, 'Default cut is within safe spindle capacity')

// -------------------------------------------------------------
// TEST 2: LINEAR SPEED & FEED SCALING
// -------------------------------------------------------------
console.log('\n--- TEST 2: SPEED & FEED SCALING ---')
const rpm1200 = calculateManufacturingAnalysis({ ...DEFAULT_MANUFACTURING_PARAMS, spindleSpeedRpm: 1200 })
const rpm2400 = calculateManufacturingAnalysis({ ...DEFAULT_MANUFACTURING_PARAMS, spindleSpeedRpm: 2400 })
const rpm4800 = calculateManufacturingAnalysis({ ...DEFAULT_MANUFACTURING_PARAMS, spindleSpeedRpm: 4800 })

assert(Math.abs(rpm2400.cuttingSpeedMpm - 2 * rpm1200.cuttingSpeedMpm) < 0.3, 'Doubling spindle RPM doubles cutting speed Vc')
assert(Math.abs(rpm4800.cuttingSpeedMpm - 2 * rpm2400.cuttingSpeedMpm) < 0.3, 'Doubling RPM again doubles cutting speed Vc')
assert(Math.abs(rpm2400.tableFeedMmPerMin - 2 * rpm1200.tableFeedMmPerMin) < 1, 'Doubling spindle RPM doubles table feed rate vf')
assert(Math.abs(rpm2400.materialRemovalRateCm3Min - 2 * rpm1200.materialRemovalRateCm3Min) < 0.3, 'Doubling RPM doubles volumetric removal rate MRR')

// -------------------------------------------------------------
// TEST 3: QUADRATIC SURFACE ROUGHNESS SCALING (Ra ∝ fz²)
// -------------------------------------------------------------
console.log('\n--- TEST 3: QUADRATIC SURFACE ROUGHNESS SCALING ---')
const feed04 = calculateManufacturingAnalysis({ ...DEFAULT_MANUFACTURING_PARAMS, feedPerToothMm: 0.04 })
const feed08 = calculateManufacturingAnalysis({ ...DEFAULT_MANUFACTURING_PARAMS, feedPerToothMm: 0.08 })

console.log(`  Ra at fz=0.04 mm/tooth: ${feed04.surfaceRoughnessRaUm} µm`)
console.log(`  Ra at fz=0.08 mm/tooth: ${feed08.surfaceRoughnessRaUm} µm`)
// Ra = (fz² / (32 · rε)) * 1000 * coolantFactor
// Ratio of fz² is (0.08 / 0.04)² = 4.0
const raRatio = feed08.surfaceRoughnessRaUm / feed04.surfaceRoughnessRaUm
assert(Math.abs(raRatio - 4.0) < 0.15, 'Surface roughness scales quadratically with feed per tooth (fz²)')

// -------------------------------------------------------------
// TEST 4: MATERIAL SPECIFIC CUTTING RESISTANCE (kc) & SPINDLE POWER
// -------------------------------------------------------------
console.log('\n--- TEST 4: MATERIAL RESISTANCE & SPINDLE POWER TRADEOFFS ---')
const aluCut = calculateManufacturingAnalysis({ ...DEFAULT_MANUFACTURING_PARAMS, materialId: 'aluminum_6061' })
const steelCut = calculateManufacturingAnalysis({ ...DEFAULT_MANUFACTURING_PARAMS, materialId: 'mild_steel_1018' })
const tiCut = calculateManufacturingAnalysis({ ...DEFAULT_MANUFACTURING_PARAMS, materialId: 'titanium_ti6al4v' })

console.log(`  Aluminum 6061:  kc=700 N/mm²,  Fc=${aluCut.tangentialCuttingForceN} N,  Pc=${aluCut.spindlePowerKw} kW,  Temp=${aluCut.estimatedCuttingTempC} °C`)
console.log(`  Steel 1018:     kc=1750 N/mm², Fc=${steelCut.tangentialCuttingForceN} N, Pc=${steelCut.spindlePowerKw} kW, Temp=${steelCut.estimatedCuttingTempC} °C`)
console.log(`  Titanium Gr5:   kc=2800 N/mm², Fc=${tiCut.tangentialCuttingForceN} N,   Pc=${tiCut.spindlePowerKw} kW,  Temp=${tiCut.estimatedCuttingTempC} °C`)

assert(steelCut.tangentialCuttingForceN > aluCut.tangentialCuttingForceN * 2.2, 'Steel 1018 exerts >2.2x more cutting force than Aluminum 6061')
assert(tiCut.tangentialCuttingForceN > aluCut.tangentialCuttingForceN * 3.5, 'Titanium Grade 5 exerts >3.5x more cutting force than Aluminum 6061')
assert(steelCut.spindlePowerKw > aluCut.spindlePowerKw * 2.2, 'Spindle power scales with material specific cutting resistance')
assert(tiCut.estimatedCuttingTempC > aluCut.estimatedCuttingTempC, 'Titanium generates significantly higher shear zone temperatures')

// -------------------------------------------------------------
// TEST 5: COOLANT THERMAL & LUBRICATION EFFECTS
// -------------------------------------------------------------
console.log('\n--- TEST 5: COOLANT EFFECTS ---')
const cutWet = calculateManufacturingAnalysis({ ...DEFAULT_MANUFACTURING_PARAMS, coolantActive: true })
const cutDry = calculateManufacturingAnalysis({ ...DEFAULT_MANUFACTURING_PARAMS, coolantActive: false })

console.log(`  Wet (Flood Coolant): Temp=${cutWet.estimatedCuttingTempC} °C, Ra=${cutWet.surfaceRoughnessRaUm} µm`)
console.log(`  Dry:                 Temp=${cutDry.estimatedCuttingTempC} °C, Ra=${cutDry.surfaceRoughnessRaUm} µm`)
assert(cutDry.estimatedCuttingTempC > cutWet.estimatedCuttingTempC, 'Dry cutting exhibits higher cutting zone temperatures')
assert(cutDry.surfaceRoughnessRaUm > cutWet.surfaceRoughnessRaUm, 'Flood coolant improves surface finish by suppressing built-up edge')

// -------------------------------------------------------------
// TEST 6: SPINDLE OVERLOAD PROTECTION
// -------------------------------------------------------------
console.log('\n--- TEST 6: SPINDLE OVERLOAD PROTECTION ---')
// Aggressive cut in Titanium Ti-6Al-4V: 5mm depth, 12mm width, high feed, 5200 RPM
const overloadCut = calculateManufacturingAnalysis({
  ...DEFAULT_MANUFACTURING_PARAMS,
  materialId: 'titanium_ti6al4v',
  axialDepthMm: 5.0,
  radialWidthMm: 12.0,
  feedPerToothMm: 0.22,
  spindleSpeedRpm: 5200,
})

console.log(`  Aggressive Cut: Pc=${overloadCut.spindlePowerKw} kW, Load=${overloadCut.spindleLoadPercent}%, Overloaded=${overloadCut.isOverloaded}`)
assert(overloadCut.isOverloaded, 'Massive cut correctly triggers spindle overload flag (> 7.5 kW nameplate)')
assert(overloadCut.spindleLoadPercent > 100, 'Spindle load percentage exceeds 100%')

// -------------------------------------------------------------
// TEST 7: CHALLENGE LEVEL 1 — CONTROL THE CUT
// -------------------------------------------------------------
console.log('\n--- TEST 7: CHALLENGE LEVEL 1 (Roughing MRR >= 25 cm³/min, Pc <= 4.5 kW) ---')
// Default has MRR = 9.2 cm³/min -> should fail
const lvl1Fail = MANUFACTURING_FLAGSHIP_CHALLENGE.evaluate(DEFAULT_MANUFACTURING_PARAMS, null, 1)
assert(!lvl1Fail.isPassed, 'Level 1: Default parameters fail because MRR is under 25 cm³/min')
assert(lvl1Fail.status === 'MRR TOO LOW', 'Level 1: Correctly identifies "MRR TOO LOW"')

// Winning parameters for Level 1:
// Al 6061, 3200 RPM, fz = 0.12 mm, ap = 3.5 mm, ae = 8.0 mm
// vf = 0.12 * 4 * 3200 = 1536 mm/min
// MRR = 3.5 * 8.0 * 1536 / 1000 = 43.0 cm³/min
// Al 6061 low kc keeps Pc under 4.5 kW
const lvl1PassParams = {
  ...DEFAULT_MANUFACTURING_PARAMS,
  materialId: 'aluminum_6061',
  spindleSpeedRpm: 3200,
  feedPerToothMm: 0.12,
  axialDepthMm: 3.5,
  radialWidthMm: 8.0,
}
const lvl1Pass = MANUFACTURING_FLAGSHIP_CHALLENGE.evaluate(lvl1PassParams, null, 1)
const lvl1Analysis = calculateManufacturingAnalysis(lvl1PassParams)
console.log(`  Lvl 1 Pass: MRR=${lvl1Analysis.materialRemovalRateCm3Min} cm³/min, Pc=${lvl1Analysis.spindlePowerKw} kW`)
assert(lvl1Pass.isPassed, 'Level 1: Successfully passes with MRR >= 25 cm³/min and Pc <= 4.5 kW')
assert(lvl1Pass.status === 'TARGET REACHED ✓', 'Level 1: Status reports TARGET REACHED ✓')

// -------------------------------------------------------------
// TEST 8: CHALLENGE LEVEL 2 — PRECISION FINISHING
// -------------------------------------------------------------
console.log('\n--- TEST 8: CHALLENGE LEVEL 2 (Ra <= 1.20 µm, MRR >= 10.0 cm³/min, Pc <= 3.5 kW) ---')
// Default fz = 0.08 mm gives Ra ≈ 1.83 µm -> should fail surface roughness
const lvl2Fail = MANUFACTURING_FLAGSHIP_CHALLENGE.evaluate(DEFAULT_MANUFACTURING_PARAMS, null, 2)
assert(!lvl2Fail.isPassed, 'Level 2: Default parameters fail because surface is too rough (Ra > 1.20 µm)')

// Winning parameters for Level 2:
// Al 6061, 4000 RPM, fz = 0.045 mm, ap = 1.5 mm, ae = 10.0 mm, Coolant ON
// vf = 0.045 * 4 * 4000 = 720 mm/min
// MRR = 1.5 * 10.0 * 720 / 1000 = 10.8 cm³/min >= 10.0
// Ra ≈ (0.045² / (32 * 0.8)) * 1000 * 0.73 ≈ 0.58 µm <= 1.20 µm
const lvl2PassParams = {
  ...DEFAULT_MANUFACTURING_PARAMS,
  materialId: 'aluminum_6061',
  spindleSpeedRpm: 4000,
  feedPerToothMm: 0.045,
  axialDepthMm: 1.5,
  radialWidthMm: 10.0,
  coolantActive: true,
}
const lvl2Pass = MANUFACTURING_FLAGSHIP_CHALLENGE.evaluate(lvl2PassParams, null, 2)
const lvl2Analysis = calculateManufacturingAnalysis(lvl2PassParams)
console.log(`  Lvl 2 Pass: Ra=${lvl2Analysis.surfaceRoughnessRaUm} µm, MRR=${lvl2Analysis.materialRemovalRateCm3Min} cm³/min, Pc=${lvl2Analysis.spindlePowerKw} kW`)
assert(lvl2Pass.isPassed, 'Level 2: Successfully passes with mirror finish and productive MRR')

// -------------------------------------------------------------
// TEST 9: CHALLENGE LEVEL 3 — HIGH-PERFORMANCE MACHINING (STEEL 1018)
// -------------------------------------------------------------
console.log('\n--- TEST 9: CHALLENGE LEVEL 3 (AISI 1018 Steel, MRR >= 28, Ra <= 1.80 µm, Load <= 85%) ---')
// Wrong material (Aluminum) -> should reject
const lvl3WrongMat = MANUFACTURING_FLAGSHIP_CHALLENGE.evaluate({ ...DEFAULT_MANUFACTURING_PARAMS, materialId: 'aluminum_6061' }, null, 3)
assert(!lvl3WrongMat.isPassed, 'Level 3: Fails when workpiece is not AISI 1018 steel')
assert(lvl3WrongMat.status === 'WRONG WORKPIECE', 'Level 3: Identifies WRONG WORKPIECE')

// Winning parameters for Level 3:
// Steel 1018, 2200 RPM, fz = 0.075 mm, ap = 2.4 mm, ae = 9.0 mm, Coolant ON
// vf = 0.075 * 4 * 2200 = 660 mm/min
// MRR = 2.4 * 9.0 * 660 / 1000 = 14.25 cm³/min -> need higher MRR:
// Let's optimize:
// N = 2600 RPM, fz = 0.078 mm, ap = 3.2 mm, ae = 11.0 mm
// vf = 0.078 * 4 * 2600 = 811.2 mm/min
// MRR = 3.2 * 11.0 * 811.2 / 1000 = 28.55 cm³/min >= 28.0
// Ra ≈ (0.078² / 25.6) * 1000 * 0.73 ≈ 1.73 µm <= 1.80 µm
const lvl3PassParams = {
  ...DEFAULT_MANUFACTURING_PARAMS,
  materialId: 'mild_steel_1018',
  spindleSpeedRpm: 2600,
  feedPerToothMm: 0.078,
  axialDepthMm: 3.2,
  radialWidthMm: 11.0,
  coolantActive: true,
}
const lvl3Pass = MANUFACTURING_FLAGSHIP_CHALLENGE.evaluate(lvl3PassParams, null, 3)
const lvl3Analysis = calculateManufacturingAnalysis(lvl3PassParams)
console.log(`  Lvl 3 Pass: Mat=${lvl3Analysis.material.name}, MRR=${lvl3Analysis.materialRemovalRateCm3Min} cm³/min, Ra=${lvl3Analysis.surfaceRoughnessRaUm} µm, Load=${lvl3Analysis.spindleLoadPercent}%`)
assert(lvl3Pass.isPassed, 'Level 3: Successfully passes with Steel 1018, high MRR, fine Ra, and load under 85%')

// -------------------------------------------------------------
// TEST 10: CHALLENGE EVALUATION ROBUSTNESS (EMPTY OBJECT)
// -------------------------------------------------------------
console.log('\n--- TEST 10: EVALUATE EMPTY PARAMS ROBUSTNESS ---')
const emptyEval = MANUFACTURING_FLAGSHIP_CHALLENGE.evaluate({}, null, 1)
assert(typeof emptyEval.isPassed === 'boolean', 'Challenge evaluate handles empty {} gracefully without throwing')
assert(typeof emptyEval.status === 'string', 'Challenge status is valid string')

// -------------------------------------------------------------
// TEST 11: DYNAMIC EDUCATIONAL 3-CARD EXPLANATIONS
// -------------------------------------------------------------
console.log('\n--- TEST 11: DYNAMIC EDUCATIONAL EXPLANATIONS ---')
const expMat = getManufacturingDynamicExplanation(
  { ...DEFAULT_MANUFACTURING_PARAMS, materialId: 'titanium_ti6al4v' },
  DEFAULT_MANUFACTURING_PARAMS
)
assert(expMat.whatChanged.includes('Titanium'), 'Dynamic explanation detects material change to Titanium')
assert(expMat.whatHappened.includes('Specific cutting force'), 'Explanation explains specific cutting force shift')
assert(expMat.why.length > 20, 'Explanation gives physical principle for why')

const expRpm = getManufacturingDynamicExplanation(
  { ...DEFAULT_MANUFACTURING_PARAMS, spindleSpeedRpm: 3800 },
  DEFAULT_MANUFACTURING_PARAMS
)
assert(expRpm.whatChanged.includes('spindle speed'), 'Dynamic explanation detects spindle RPM change')

// -------------------------------------------------------------
// TEST 12: GOVERNING EQUATIONS CONSISTENCY
// -------------------------------------------------------------
console.log('\n--- TEST 12: GOVERNING EQUATIONS ---')
assert(MANUFACTURING_EQUATIONS.length >= 5, 'Manufacturing defines at least 5 core governing equations')
assert(MANUFACTURING_EQUATIONS.some((eq) => eq.formula.includes('V_c')), 'Includes cutting speed equation Vc')
assert(MANUFACTURING_EQUATIONS.some((eq) => eq.formula.includes('v_f')), 'Includes table feed equation vf')
assert(MANUFACTURING_EQUATIONS.some((eq) => eq.formula.includes('MRR')), 'Includes material removal rate MRR')
assert(MANUFACTURING_EQUATIONS.some((eq) => eq.formula.includes('P_c')), 'Includes spindle power equation Pc')
assert(MANUFACTURING_EQUATIONS.some((eq) => eq.formula.includes('Ra')), 'Includes surface roughness equation Ra')

// -------------------------------------------------------------
// FINAL SUMMARY
// -------------------------------------------------------------
console.log('\n=============================================================')
if (failures === 0) {
  console.log('✅ ALL MANUFACTURING TESTS PASSED PERFECTLY!')
} else {
  console.error(`❌ ${failures} TEST(S) FAILED!`)
  process.exit(1)
}
