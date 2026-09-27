// scripts/verifyRobotics.mjs
// Verification suite for upgraded Robotics experiment: Forward Kinematics, Inverse Kinematics, Collision, Challenges

import {
  calculateRoboticsKinematics,
  calculateInverseKinematics,
  getRoboticsDynamicExplanation,
  ROBOT_ARM_CONFIG,
  ROBOTICS_LEVEL_TARGETS,
} from '../src/components/mechLab/experiments/roboticsModel.ts';
import {
  ROBOTICS_FLAGSHIP_CHALLENGE,
} from '../src/components/mechLab/experiments/roboticsChallenge.ts';

console.log('=== VERIFYING ROBOTICS INTERACTIVE ENGINEERING EXPERIENCE ===\n');

// 1. FORWARD KINEMATICS ACCURACY
console.log('--- TEST 1: FORWARD KINEMATICS ---');
// At 0 deg shoulder and 0 deg elbow, arm is fully horizontal: X = L1 + L2 = 140 + 110 = 250, Y = 0
const kinZero = calculateRoboticsKinematics(0, 0, { x: 180, y: 110 });
console.log(`Angles (0°, 0°): Hand X = ${kinZero.hand.x}, Y = ${kinZero.hand.y}, Reach = ${kinZero.reach}`);
if (Math.abs(kinZero.hand.x - 250) < 0.1 && Math.abs(kinZero.hand.y - 0) < 0.1) {
  console.log('✓ Zero configuration matches geometry (250mm, 0mm)');
} else {
  console.error('✗ Forward kinematics zero angle mismatch', kinZero);
  process.exit(1);
}

// At 90 deg shoulder and 0 deg elbow, arm is fully vertical: X = 0, Y = 250
const kin90 = calculateRoboticsKinematics(90, 0, { x: 180, y: 110 });
console.log(`Angles (90°, 0°): Hand X = ${kin90.hand.x.toFixed(1)}, Y = ${kin90.hand.y.toFixed(1)}, Reach = ${kin90.reach.toFixed(1)}`);
if (Math.abs(kin90.hand.x - 0) < 0.1 && Math.abs(kin90.hand.y - 250) < 0.1) {
  console.log('✓ 90° configuration matches vertical arm (0mm, 250mm)');
} else {
  console.error('✗ Forward kinematics 90 angle mismatch', kin90);
  process.exit(1);
}

// 2. INVERSE KINEMATICS (AUTO POSITION)
console.log('\n--- TEST 2: INVERSE KINEMATICS SOLVER (AUTO POSITION) ---');
for (const [lvl, cfg] of Object.entries(ROBOTICS_LEVEL_TARGETS)) {
  const target = cfg.target;
  const ikElbowUp = calculateInverseKinematics(target, true);
  const ikElbowDown = calculateInverseKinematics(target, false);

  console.log(`Level ${lvl} Target (${target.x}, ${target.y}):`);
  console.log(`  Elbow Up:   θ1=${ikElbowUp.shoulderAngle}°, θ2=${ikElbowUp.elbowAngle}°, reachable=${ikElbowUp.isReachable}`);
  console.log(`  Elbow Down: θ1=${ikElbowDown.shoulderAngle}°, θ2=${ikElbowDown.elbowAngle}°, reachable=${ikElbowDown.isReachable}`);

  if (!ikElbowUp.isReachable) {
    console.error(`✗ Target for level ${lvl} is not reachable by IK!`);
    process.exit(1);
  }

  // Verify that applying the IK angles actually places the hand onto the target!
  const verifiedKin = calculateRoboticsKinematics(ikElbowUp.shoulderAngle, ikElbowUp.elbowAngle, target);
  console.log(`  -> Hand verified at (${verifiedKin.hand.x.toFixed(1)}, ${verifiedKin.hand.y.toFixed(1)}), distance=${verifiedKin.distanceToTarget.toFixed(2)} mm`);
  if (verifiedKin.distanceToTarget > 2.0) {
    console.error(`✗ IK solution did not reach target within tolerance! Distance: ${verifiedKin.distanceToTarget}`);
    process.exit(1);
  }
}
console.log('✓ Inverse kinematics solves targets accurately across all levels');

// 3. LEVEL 1 CHALLENGE: REACH THE TARGET
console.log('\n--- TEST 3: CHALLENGE LEVEL 1 (REACH TARGET) ---');
const lvl1Target = ROBOTICS_LEVEL_TARGETS[1].target;
// Default folded arm (θ1=25, θ2=70) should not reach
const resFail1 = ROBOTICS_FLAGSHIP_CHALLENGE.evaluate({ shoulderAngle: 25, elbowAngle: 70 }, {}, 1);
console.log(`Default folded arm: isPassed=${resFail1.isPassed}, status="${resFail1.status}"`);
if (resFail1.isPassed) {
  console.error('✗ Folded arm should not pass level 1');
  process.exit(1);
}

// Solve IK for Level 1
const ik1 = calculateInverseKinematics(lvl1Target, true);
const resPass1 = ROBOTICS_FLAGSHIP_CHALLENGE.evaluate({ shoulderAngle: ik1.shoulderAngle, elbowAngle: ik1.elbowAngle }, {}, 1);
console.log(`IK placed arm (θ1=${ik1.shoulderAngle}°, θ2=${ik1.elbowAngle}°): isPassed=${resPass1.isPassed}, status="${resPass1.status}"`);
if (!resPass1.isPassed) {
  console.error('✗ IK solution should pass level 1');
  process.exit(1);
}
console.log('✓ Level 1 Challenge evaluates correctly');

// 4. LEVEL 2 CHALLENGE: PRECISION PICKUP
console.log('\n--- TEST 4: CHALLENGE LEVEL 2 (PRECISION PICKUP) ---');
const lvl2Target = ROBOTICS_LEVEL_TARGETS[2].target;
const ik2 = calculateInverseKinematics(lvl2Target, true);
const resPass2 = ROBOTICS_FLAGSHIP_CHALLENGE.evaluate({ shoulderAngle: ik2.shoulderAngle, elbowAngle: ik2.elbowAngle }, {}, 2);
console.log(`Level 2 Precision evaluation: isPassed=${resPass2.isPassed}, status="${resPass2.status}"`);
if (!resPass2.isPassed) {
  console.error('✗ IK solution should pass level 2 precision');
  process.exit(1);
}
console.log('✓ Level 2 Challenge evaluates correctly');

// 5. LEVEL 3 CHALLENGE: OBSTACLE AVOIDANCE
console.log('\n--- TEST 5: CHALLENGE LEVEL 3 (OBSTACLE AVOIDANCE) ---');
const lvl3Cfg = ROBOTICS_LEVEL_TARGETS[3];
// Notice: If the arm tries a low-slung elbow-down configuration, does it collide or can it collide with the obstacle?
// Let's test collision detection explicitly
const ik3ElbowUp = calculateInverseKinematics(lvl3Cfg.target, true);
const resPass3 = ROBOTICS_FLAGSHIP_CHALLENGE.evaluate({ shoulderAngle: ik3ElbowUp.shoulderAngle, elbowAngle: ik3ElbowUp.elbowAngle }, {}, 3);
console.log(`Level 3 Elbow Up (θ1=${ik3ElbowUp.shoulderAngle}°, θ2=${ik3ElbowUp.elbowAngle}°): isPassed=${resPass3.isPassed}, status="${resPass3.status}"`);
if (!resPass3.isPassed) {
  console.error('✗ Level 3 elbow up should pass');
  process.exit(1);
}

// Test an angle that intentionally cuts through the obstacle box { x: 45, y: 35, width: 55, height: 65 }
// An angle like shoulder=35, elbow=0 shoots right through (50, 35) to (100, 70)
const collKin = calculateRoboticsKinematics(35, 0, lvl3Cfg.target, lvl3Cfg.radius, lvl3Cfg.obstacle);
console.log(`Direct-cut arm (35°, 0°): collision=${collKin.hasObstacleCollision}`);
if (collKin.hasObstacleCollision) {
  console.log('✓ Obstacle collision successfully detected on direct-cut posture');
  const resColl = ROBOTICS_FLAGSHIP_CHALLENGE.evaluate({ shoulderAngle: 35, elbowAngle: 0 }, {}, 3);
  console.log(`Collision Challenge feedback: "${resColl.feedbackMessage}"`);
  if (!resColl.feedbackMessage.includes('OBSTACLE HIT')) {
    console.error('✗ Should report OBSTACLE HIT');
    process.exit(1);
  }
} else {
  console.error('✗ Expected collision at (35°, 0°) through obstacle');
  process.exit(1);
}
console.log('✓ Level 3 Obstacle navigation & collision handling verified');

// 6. PROGRESSIVE EXPLANATION (WHAT'S HAPPENING?)
console.log('\n--- TEST 6: DYNAMIC PHYSICAL EXPLANATION ---');
const expFolded = getRoboticsDynamicExplanation(45, 25, 60, 60);
console.log('Shoulder move explanation:', expFolded);
if (!expFolded.whatChanged || !expFolded.whatHappened || !expFolded.why) {
  console.error('✗ Incomplete explanation cards');
  process.exit(1);
}
console.log('✓ Explanation cards provide 01-You Moved, 02-Robot Moved, 03-Why structure');

console.log('\n========================================');
console.log('ALL ROBOTICS VERIFICATION CHECKS PASSED!');
console.log('========================================');
