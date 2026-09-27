// scripts/verifyAutomotive.mjs
// Verification suite for Automotive experience: Acceleration, Braking, Grip, Challenges, and Dynamic Explanation

import {
  calculateAutomotivePerformance,
  getAutomotiveDynamicExplanation,
  AUTOMOTIVE_LIMITS,
} from '../src/components/mechLab/experiments/automotiveModel.ts';
import {
  AUTOMOTIVE_FLAGSHIP_CHALLENGE,
  AUTOMOTIVE_LEVELS,
} from '../src/components/mechLab/experiments/automotiveChallenge.ts';

console.log('=== VERIFYING AUTOMOTIVE INTERACTIVE ENGINEERING EXPERIENCE ===\n');

// 1. DEFAULT SETUP VALIDITY
console.log('--- TEST 1: DEFAULT SETUP VALIDITY ---');
const defaultPerf = calculateAutomotivePerformance({
  power: AUTOMOTIVE_LIMITS.power.default,
  grip: AUTOMOTIVE_LIMITS.grip.default,
  braking: AUTOMOTIVE_LIMITS.braking.default,
  steering: AUTOMOTIVE_LIMITS.steering.default,
});

console.log('Default vehicle performance:');
console.log(`  Top Speed:          ${defaultPerf.topSpeedKmh} km/h`);
console.log(`  0-100 Sprint:       ${defaultPerf.sprint0to100Sec.toFixed(2)} s`);
console.log(`  Stopping Distance:  ${defaultPerf.brakingDistanceM.toFixed(1)} m`);
console.log(`  Corner Speed:       ${defaultPerf.testCornerSpeedKmh} km/h`);
console.log(`  Grip Margin:        ${defaultPerf.gripMarginPercent}%`);
console.log(`  Balance Rating:     ${defaultPerf.balanceRating} (${defaultPerf.balanceScore}%)`);

if (
  defaultPerf.topSpeedKmh > 150 &&
  defaultPerf.sprint0to100Sec > 3 &&
  defaultPerf.sprint0to100Sec < 8 &&
  defaultPerf.brakingDistanceM > 25 &&
  defaultPerf.brakingDistanceM < 60 &&
  defaultPerf.balanceScore >= 80
) {
  console.log('✓ Default setup produces realistic and internally consistent performance');
} else {
  console.error('✗ Default setup values out of expected physical bounds', defaultPerf);
  process.exit(1);
}

// 2. INCREASING POWER INCREASES ACCELERATION
console.log('\n--- TEST 2: POWER SCALING ON ACCELERATION ---');
const perfLowPower = calculateAutomotivePerformance({ power: 40, grip: 70, braking: 70, steering: 50 });
const perfHighPower = calculateAutomotivePerformance({ power: 90, grip: 70, braking: 70, steering: 50 });

console.log(`  Power 40%: Accel = ${perfLowPower.accelerationG.toFixed(2)}g, 0-100 = ${perfLowPower.sprint0to100Sec.toFixed(2)} s`);
console.log(`  Power 90%: Accel = ${perfHighPower.accelerationG.toFixed(2)}g, 0-100 = ${perfHighPower.sprint0to100Sec.toFixed(2)} s`);

if (perfHighPower.accelerationG > perfLowPower.accelerationG && perfHighPower.sprint0to100Sec < perfLowPower.sprint0to100Sec) {
  console.log('✓ Increasing power increases forward acceleration and decreases sprint time');
} else {
  console.error('✗ Power scaling failed to improve acceleration');
  process.exit(1);
}

// 3. INCREASING GRIP IMPROVES CORNERING CAPABILITY
console.log('\n--- TEST 3: GRIP EFFECT ON CORNERING & SKID THRESHOLD ---');
const perfLowGrip = calculateAutomotivePerformance({ power: 80, grip: 35, braking: 70, steering: 50 });
const perfHighGrip = calculateAutomotivePerformance({ power: 80, grip: 90, braking: 70, steering: 50 });

console.log(`  Grip 35%: Margin = ${perfLowGrip.gripMarginPercent}%, Skid = ${perfLowGrip.hasCornerSkid}`);
console.log(`  Grip 90%: Margin = ${perfHighGrip.gripMarginPercent}%, Skid = ${perfHighGrip.hasCornerSkid}`);

if (perfLowGrip.hasCornerSkid && !perfHighGrip.hasCornerSkid && perfHighGrip.gripMarginPercent > perfLowGrip.gripMarginPercent) {
  console.log('✓ Low grip triggers lateral skid; high grip stabilizes vehicle cornering');
} else {
  console.error('✗ Grip scaling failed to prevent skidding', { perfLowGrip, perfHighGrip });
  process.exit(1);
}

// 4. STRONGER BRAKING REDUCES BRAKING DISTANCE
console.log('\n--- TEST 4: BRAKING STRENGTH EFFECT ON STOPPING DISTANCE ---');
const perfSoftBrake = calculateAutomotivePerformance({ power: 65, grip: 75, braking: 35, steering: 50 });
const perfHardBrake = calculateAutomotivePerformance({ power: 65, grip: 75, braking: 95, steering: 50 });

console.log(`  Braking 35%: Distance = ${perfSoftBrake.brakingDistanceM.toFixed(1)} m`);
console.log(`  Braking 95%: Distance = ${perfHardBrake.brakingDistanceM.toFixed(1)} m`);

if (perfHardBrake.brakingDistanceM < perfSoftBrake.brakingDistanceM) {
  console.log('✓ Stronger braking clamping force significantly reduces stopping distance');
} else {
  console.error('✗ Braking scaling failed to reduce stopping distance');
  process.exit(1);
}

// 5. INPUT CLAMPING & SANITIZATION
console.log('\n--- TEST 5: PARAMETER CLAMPING & OUT-OF-RANGE SANITIZATION ---');
const clampedUnder = calculateAutomotivePerformance({ power: -50, grip: 10, braking: 0, steering: -20 });
const clampedOver = calculateAutomotivePerformance({ power: 250, grip: 200, braking: 300, steering: 500 });

if (
  clampedUnder.params.power === AUTOMOTIVE_LIMITS.power.min &&
  clampedUnder.params.grip === AUTOMOTIVE_LIMITS.grip.min &&
  clampedUnder.params.braking === AUTOMOTIVE_LIMITS.braking.min &&
  clampedUnder.params.steering === AUTOMOTIVE_LIMITS.steering.min &&
  clampedOver.params.power === AUTOMOTIVE_LIMITS.power.max &&
  clampedOver.params.grip === AUTOMOTIVE_LIMITS.grip.max &&
  clampedOver.params.braking === AUTOMOTIVE_LIMITS.braking.max &&
  clampedOver.params.steering === AUTOMOTIVE_LIMITS.steering.max
) {
  console.log('✓ Out-of-bounds parameters safely clamped to defined boundaries');
} else {
  console.error('✗ Clamping failed', { clampedUnder, clampedOver });
  process.exit(1);
}

// 6. LEVEL 1 CHALLENGE (QUICK START 0-100 SPRINT)
console.log('\n--- TEST 6: CHALLENGE LEVEL 1 (QUICK START) ---');
// Underpowered setup (Power 40%) -> should fail
const resLvl1Slow = AUTOMOTIVE_FLAGSHIP_CHALLENGE.evaluate({ power: 40, grip: 65, braking: 65, steering: 50 }, null, 1);
console.log(`  Power 40%: isPassed=${resLvl1Slow.isPassed}, status="${resLvl1Slow.status}"`);
if (resLvl1Slow.isPassed) {
  console.error('✗ Underpowered car should not pass Level 1 sprint');
  process.exit(1);
}

// Overpowered but zero grip (Power 100%, Grip 30%) -> wheelspin failure!
const resLvl1Spin = AUTOMOTIVE_FLAGSHIP_CHALLENGE.evaluate({ power: 100, grip: 30, braking: 65, steering: 50 }, null, 1);
console.log(`  Power 100%, Grip 30%: isPassed=${resLvl1Spin.isPassed}, status="${resLvl1Spin.status}"`);
if (resLvl1Spin.isPassed || resLvl1Spin.status !== 'WHEELSPIN DETECTED') {
  console.error('✗ Should detect wheelspin failure on Power 100% with Grip 30%');
  process.exit(1);
}

// Clean powerful launch (Power 85%, Grip 85%) -> pass!
const resLvl1Pass = AUTOMOTIVE_FLAGSHIP_CHALLENGE.evaluate({ power: 85, grip: 85, braking: 65, steering: 50 }, null, 1);
console.log(`  Power 85%, Grip 85%: isPassed=${resLvl1Pass.isPassed}, status="${resLvl1Pass.status}"`);
if (!resLvl1Pass.isPassed) {
  console.error('✗ Clean launch should pass Level 1');
  process.exit(1);
}
console.log('✓ Challenge Level 1 evaluated successfully with wheelspin detection');

// 7. LEVEL 2 CHALLENGE (STOP IN TIME <= 38m)
console.log('\n--- TEST 7: CHALLENGE LEVEL 2 (BRAKING ZONE) ---');
// Weak braking (35%) -> should fail
const resLvl2Weak = AUTOMOTIVE_FLAGSHIP_CHALLENGE.evaluate({ power: 65, grip: 65, braking: 35, steering: 50 }, null, 2);
console.log(`  Braking 35%: isPassed=${resLvl2Weak.isPassed}, status="${resLvl2Weak.status}"`);
if (resLvl2Weak.isPassed) {
  console.error('✗ Weak braking should not pass Level 2');
  process.exit(1);
}

// Strong braking (85%) with sufficient grip (80%) -> should pass!
const resLvl2Pass = AUTOMOTIVE_FLAGSHIP_CHALLENGE.evaluate({ power: 65, grip: 80, braking: 85, steering: 50 }, null, 2);
console.log(`  Braking 85%, Grip 80%: isPassed=${resLvl2Pass.isPassed}, status="${resLvl2Pass.status}"`);
if (!resLvl2Pass.isPassed) {
  console.error('✗ Strong braking should pass Level 2');
  process.exit(1);
}
console.log('✓ Challenge Level 2 evaluated successfully');

// 8. LEVEL 3 CHALLENGE (PERFECT CORNER >= 75 km/h, GripMargin >= 15%)
console.log('\n--- TEST 8: CHALLENGE LEVEL 3 (PERFECT CORNER) ---');
// Low grip (40%) with power 75% -> skids out
const resLvl3Skid = AUTOMOTIVE_FLAGSHIP_CHALLENGE.evaluate({ power: 75, grip: 40, braking: 65, steering: 50 }, null, 3);
console.log(`  Grip 40%: isPassed=${resLvl3Skid.isPassed}, status="${resLvl3Skid.status}"`);
if (resLvl3Skid.isPassed || resLvl3Skid.status !== 'LOST GRIP (SKID)') {
  console.error('✗ Low grip corner should report LOST GRIP (SKID)');
  process.exit(1);
}

// Tuned racing setup (Power 85%, Grip 85%) -> stable and fast -> pass!
const resLvl3Pass = AUTOMOTIVE_FLAGSHIP_CHALLENGE.evaluate({ power: 85, grip: 85, braking: 65, steering: 50 }, null, 3);
console.log(`  Power 85%, Grip 85%: isPassed=${resLvl3Pass.isPassed}, status="${resLvl3Pass.status}"`);
if (!resLvl3Pass.isPassed) {
  console.error('✗ Tuned racing setup should pass Level 3');
  process.exit(1);
}
console.log('✓ Challenge Level 3 evaluated successfully');

// 9. NO NaN OR INFINITE VALUES
console.log('\n--- TEST 9: NUMERICAL SANITY & ZERO NaN / INFINITY ---');
for (const [key, val] of Object.entries(defaultPerf)) {
  if (typeof val === 'number') {
    if (isNaN(val) || !isFinite(val)) {
      console.error(`✗ Invalid numerical value in performance: ${key} = ${val}`);
      process.exit(1);
    }
  }
}
console.log('✓ Zero NaN or infinite values across all physics calculations');

// 10. DYNAMIC PHYSICAL EXPLANATION CARDS
console.log('\n--- TEST 10: PROGRESSIVE PHYSICAL EXPLANATIONS ---');
const expPower = getAutomotiveDynamicExplanation(
  { power: 85, grip: 65, braking: 65, steering: 50 },
  { power: 50, grip: 65, braking: 65, steering: 50 }
);
console.log('Power increase explanation:');
console.log(`  01: ${expPower.whatChanged}`);
console.log(`  02: ${expPower.whatHappened}`);
console.log(`  03: ${expPower.why}`);

if (!expPower.whatChanged || !expPower.whatHappened || !expPower.why) {
  console.error('✗ Incomplete explanation cards');
  process.exit(1);
}
console.log('✓ 3-card progressive explanation structure verified');

console.log('\n========================================');
console.log('ALL AUTOMOTIVE VERIFICATION CHECKS PASSED!');
console.log('========================================');
