import { SYSTEM_CHALLENGES } from '../src/data/mechLabChallenges.ts'

console.log('=== VERIFYING SYSTEM CHALLENGES ACROSS ALL 8 SYSTEMS ===\n')

const systems = [
  'thermodynamics',
  'robotics',
  'design',
  'materials',
  'manufacturing',
  'mechatronics',
  'automotive',
  'fluid',
]

let passedCount = 0

for (const sysId of systems) {
  const challenge = SYSTEM_CHALLENGES[sysId]
  if (!challenge) {
    console.error(`FAIL: Missing challenge definition for system: ${sysId}`)
    process.exit(1)
  }

  console.log(`[${sysId.toUpperCase()}] "${challenge.title}"`)
  console.log(`  Description: ${challenge.description.slice(0, 60)}...`)
  console.log(`  Levels count: ${challenge.levels?.length || 0}`)

  // Evaluate Level 1 with default dummy inputs
  const evalL1 = challenge.evaluate({}, {}, 1)
  console.log(`  Level 1 Evaluation -> Status: "${evalL1.status}", Passed: ${evalL1.isPassed}`)
  console.log(`  Feedback: "${evalL1.feedbackMessage}"`)

  if (!evalL1.status || typeof evalL1.isPassed !== 'boolean' || !evalL1.feedbackMessage) {
    console.error(`FAIL: Invalid evaluation structure for ${sysId}`)
    process.exit(1)
  }

  passedCount++
  console.log('')
}

console.log(`SUCCESS: All ${passedCount}/8 system challenges verified and structured correctly!`)
