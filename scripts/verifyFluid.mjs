// scripts/verifyFluid.mjs
// Verification suite for Fluid Mechanics Venturi Flow: Continuity, Bernoulli, Manometer, Challenges, Dynamic Explanation

import {
  calculateFluidState,
  getFluidDynamicExplanation,
  FLUID_PARAM_LIMITS,
  FLUID_CONSTANTS,
} from '../src/components/mechLab/experiments/fluidModel.ts';
import {
  FLUID_FLAGSHIP_CHALLENGE,
  FLUID_LEVELS,
} from '../src/components/mechLab/experiments/fluidChallenge.ts';

console.log('=== VERIFYING FLUID MECHANICS INTERACTIVE ENGINEERING EXPERIENCE ===\n');

// 1. CONTINUITY EQUATION TEST (Q = A1*V1 = A2*V2)
console.log('--- TEST 1: CONTINUITY PRINCIPLE (Q = A * V) ---');
const stateDefault = calculateFluidState(30, 25);
const qInlet = stateDefault.inlet.area * stateDefault.inlet.velocity;
const qThroat = stateDefault.throat.area * stateDefault.throat.velocity;
console.log(`At Q = 30 L/min, Throat Ø = 25 mm:`);
console.log(`  Inlet Flow:  A₁·V₁ = ${(qInlet * 1000 * 60).toFixed(4)} L/min`);
console.log(`  Throat Flow: A₂·V₂ = ${(qThroat * 1000 * 60).toFixed(4)} L/min`);

if (Math.abs(qInlet - qThroat) < 1e-7 && Math.abs(qInlet * 60000 - 30) < 1e-3) {
  console.log('✓ Continuity exactly preserved: Q = A₁V₁ = A₂V₂ = 30 L/min');
} else {
  console.error('✗ Continuity violation detected!', { qInlet, qThroat });
  process.exit(1);
}

// 2. SMALLER THROAT -> HIGHER VELOCITY
console.log('\n--- TEST 2: NARROWER THROAT INCREASES VELOCITY MONOTONICALLY ---');
const throatSizes = [45, 35, 25, 20, 15];
let prevV = -1;
let monotonicIncrease = true;
for (const d of throatSizes) {
  const st = calculateFluidState(30, d);
  console.log(`  Throat Ø = ${d} mm -> V₂ = ${st.throat.velocity.toFixed(3)} m/s, Speed Ratio = ${st.relativeVelocityRatio.toFixed(1)}×`);
  if (prevV !== -1 && st.throat.velocity <= prevV) {
    monotonicIncrease = false;
  }
  prevV = st.throat.velocity;
}
if (monotonicIncrease) {
  console.log('✓ Monotonic velocity increase confirmed as throat narrows');
} else {
  console.error('✗ Non-monotonic velocity response');
  process.exit(1);
}

// 3. BERNOULLI PRESSURE DROP (HIGHER VELOCITY -> LOWER STATIC PRESSURE)
console.log('\n--- TEST 3: BERNOULLI ENERGY TRADEOFF (STATIC PRESSURE DROP) ---');
console.log(`  Inlet P₁: ${stateDefault.inlet.staticPressure.toFixed(2)} kPa, V₁: ${stateDefault.inlet.velocity.toFixed(2)} m/s`);
console.log(`  Throat P₂: ${stateDefault.throat.staticPressure.toFixed(2)} kPa, V₂: ${stateDefault.throat.velocity.toFixed(2)} m/s`);
console.log(`  Static Pressure Drop ΔP: ${stateDefault.pressureDropKpa.toFixed(3)} kPa`);

if (stateDefault.throat.staticPressure < stateDefault.inlet.staticPressure && stateDefault.pressureDropKpa > 0) {
  console.log('✓ Static pressure drops at high-velocity throat as predicted by Bernoulli');
} else {
  console.error('✗ Bernoulli pressure drop failed');
  process.exit(1);
}

// 4. FLOW RATE INCREASE RAISES VELOCITIES PROPORTIONALLY
console.log('\n--- TEST 4: PUMP FLOW RATE SCALING ---');
const stLow = calculateFluidState(15, 25);
const stHigh = calculateFluidState(60, 25);
console.log(`  Q = 15 L/min -> V_throat = ${stLow.throat.velocity.toFixed(2)} m/s, ΔP = ${stLow.pressureDropKpa.toFixed(3)} kPa`);
console.log(`  Q = 60 L/min -> V_throat = ${stHigh.throat.velocity.toFixed(2)} m/s, ΔP = ${stHigh.pressureDropKpa.toFixed(3)} kPa`);

if (stHigh.throat.velocity > stLow.throat.velocity * 3.9 && stHigh.throat.velocity < stLow.throat.velocity * 4.1) {
  console.log('✓ Velocity scales linearly with volumetric flow (4× flow -> 4× velocity)');
} else {
  console.error('✗ Linear flow rate velocity scaling failed');
  process.exit(1);
}

// 5. MANOMETER RELATIONSHIP (ΔP = rho * g * Δh)
console.log('\n--- TEST 5: MANOMETER DIFFERENTIAL DEFLECTION ---');
console.log(`  Calculated ΔP: ${stateDefault.pressureDropKpa.toFixed(3)} kPa`);
console.log(`  Calculated Manometer Δh: ${stateDefault.manometerDeltaH.toFixed(1)} mm`);
// Check deltaH = deltaP / (rho * g) * 1000
const expectedDeltaH = (stateDefault.pressureDropKpa * 1000) / (FLUID_CONSTANTS.indicatorDensity * FLUID_CONSTANTS.gravity) * 1000;
if (Math.abs(stateDefault.manometerDeltaH - expectedDeltaH) < 0.01) {
  console.log(`✓ Manometer liquid height matches hydrostatic equation: Δh = ΔP / (ρ·g)`);
} else {
  console.error('✗ Manometer deflection mismatch', { calculated: stateDefault.manometerDeltaH, expected: expectedDeltaH });
  process.exit(1);
}

// 6. CHALLENGE LEVEL 1 (MAKE IT FAST: V2 >= 4.5 m/s)
console.log('\n--- TEST 6: CHALLENGE LEVEL 1 (MAKE IT FAST) ---');
// Default (30 L/min, 25 mm) -> V2 = ~1.02 m/s -> should fail
const resLvl1Fail = FLUID_FLAGSHIP_CHALLENGE.evaluate({ flowRate: 30, throatDiameter: 25 }, null, 1);
console.log(`  Default state: isPassed=${resLvl1Fail.isPassed}, status="${resLvl1Fail.status}"`);
if (resLvl1Fail.isPassed) {
  console.error('✗ Default state should not pass level 1');
  process.exit(1);
}

// High speed: (50 L/min, 15 mm) -> V2 ~ 4.72 m/s -> should pass
const resLvl1Pass = FLUID_FLAGSHIP_CHALLENGE.evaluate({ flowRate: 50, throatDiameter: 15 }, null, 1);
console.log(`  Tuned state (50 L/min, 15 mm): isPassed=${resLvl1Pass.isPassed}, status="${resLvl1Pass.status}"`);
if (!resLvl1Pass.isPassed) {
  console.error('✗ Tuned state should pass level 1');
  process.exit(1);
}
console.log('✓ Challenge Level 1 evaluated successfully');

// 7. CHALLENGE LEVEL 2 (FIND THE PRESSURE DROP: ΔP >= 8.0 kPa)
console.log('\n--- TEST 7: CHALLENGE LEVEL 2 (PRESSURE DROP) ---');
const resLvl2Fail = FLUID_FLAGSHIP_CHALLENGE.evaluate({ flowRate: 20, throatDiameter: 30 }, null, 2);
console.log(`  Mild constriction: isPassed=${resLvl2Fail.isPassed}, status="${resLvl2Fail.status}"`);
if (resLvl2Fail.isPassed) {
  console.error('✗ Mild constriction should not pass level 2');
  process.exit(1);
}

// Aggressive constriction: (50 L/min, 15 mm) -> ΔP ~ 11 kPa -> should pass
const resLvl2Pass = FLUID_FLAGSHIP_CHALLENGE.evaluate({ flowRate: 50, throatDiameter: 15 }, null, 2);
console.log(`  Aggressive constriction: isPassed=${resLvl2Pass.isPassed}, status="${resLvl2Pass.status}"`);
if (!resLvl2Pass.isPassed) {
  console.error('✗ Aggressive constriction should pass level 2');
  process.exit(1);
}
console.log('✓ Challenge Level 2 evaluated successfully');

// 8. CHALLENGE LEVEL 3 (FLOW ENGINEER: Q >= 35 L/min AND ΔP <= 12.0 kPa)
console.log('\n--- TEST 8: CHALLENGE LEVEL 3 (FLOW ENGINEER TRADE-OFF) ---');
// Case A: High flow but over-constricted (60 L/min, 15 mm) -> ΔP > 15 kPa -> overpressure failure
const resLvl3Over = FLUID_FLAGSHIP_CHALLENGE.evaluate({ flowRate: 60, throatDiameter: 15 }, null, 3);
console.log(`  Case A (Over-constricted 60 L/min, 15 mm): isPassed=${resLvl3Over.isPassed}, status="${resLvl3Over.status}"`);
if (resLvl3Over.isPassed || resLvl3Over.status !== 'PRESSURE DROP TOO HIGH') {
  console.error('✗ Over-constricted throat should fail due to excessive pressure drop');
  process.exit(1);
}

// Case B: Low flow (25 L/min, 22 mm) -> Flow rate deficit
const resLvl3Low = FLUID_FLAGSHIP_CHALLENGE.evaluate({ flowRate: 25, throatDiameter: 22 }, null, 3);
console.log(`  Case B (Under-flow 25 L/min): isPassed=${resLvl3Low.isPassed}, status="${resLvl3Low.status}"`);
if (resLvl3Low.isPassed) {
  console.error('✗ Low flow should not pass level 3');
  process.exit(1);
}

// Case C: Optimal balanced engineering (40 L/min, 22 mm) -> Flow ok (40 >= 35), ΔP ~ 4 kPa <= 12 kPa -> pass!
const resLvl3Pass = FLUID_FLAGSHIP_CHALLENGE.evaluate({ flowRate: 40, throatDiameter: 22 }, null, 3);
console.log(`  Case C (Balanced 40 L/min, 22 mm): isPassed=${resLvl3Pass.isPassed}, status="${resLvl3Pass.status}"`);
if (!resLvl3Pass.isPassed) {
  console.error('✗ Balanced configuration should pass level 3');
  process.exit(1);
}
console.log('✓ Challenge Level 3 trade-off evaluated successfully');

// 9. PARAMETER BOUNDARIES & INPUT SANITIZATION
console.log('\n--- TEST 9: PARAMETER SANITIZATION & BOUNDARY INTEGRITY ---');
const clampedUnder = calculateFluidState(-10, 5);
const clampedOver = calculateFluidState(150, 100);

if (clampedUnder.params.flowRate === FLUID_PARAM_LIMITS.flowRate.min &&
    clampedUnder.params.throatDiameter === FLUID_PARAM_LIMITS.throatDiameter.min &&
    clampedOver.params.flowRate === FLUID_PARAM_LIMITS.flowRate.max &&
    clampedOver.params.throatDiameter === FLUID_PARAM_LIMITS.throatDiameter.max) {
  console.log('✓ Out-of-bounds parameters safely clamped to physical limits');
} else {
  console.error('✗ Parameter clamping failed', { clampedUnder, clampedOver });
  process.exit(1);
}

// Check for any NaN or Infinite values
for (const [key, val] of Object.entries(stateDefault.inlet)) {
  if (typeof val === 'number' && (isNaN(val) || !isFinite(val))) {
    console.error(`✗ Invalid numerical value in inlet: ${key} = ${val}`);
    process.exit(1);
  }
}
for (const [key, val] of Object.entries(stateDefault.throat)) {
  if (typeof val === 'number' && (isNaN(val) || !isFinite(val))) {
    console.error(`✗ Invalid numerical value in throat: ${key} = ${val}`);
    process.exit(1);
  }
}
console.log('✓ Zero NaN or infinite values across all physics calculations');

// 10. DYNAMIC PHYSICAL EXPLANATION ("WHAT DO YOU NOTICE?")
console.log('\n--- TEST 10: PROGRESSIVE PHYSICAL EXPLANATIONS ---');
const expNarrow = getFluidDynamicExplanation(30, 30, 20, 30);
console.log('Narrower throat explanation:');
console.log(`  01: ${expNarrow.whatChanged}`);
console.log(`  02: ${expNarrow.whatHappened}`);
console.log(`  03: ${expNarrow.why}`);

if (!expNarrow.whatChanged || !expNarrow.whatHappened || !expNarrow.why) {
  console.error('✗ Incomplete explanation cards');
  process.exit(1);
}
console.log('✓ 3-card progressive explanation structure verified');

console.log('\n========================================');
console.log('ALL FLUID MECHANICS VERIFICATION CHECKS PASSED!');
console.log('========================================');
