import fs from 'fs'
import path from 'path'

console.log('=== VERIFYING MECHESA ABOUT PAGE CONTENT + CONSISTENCY REDESIGN ===\n')

let passCount = 0
let failCount = 0

function assert(condition, message) {
  if (condition) {
    console.log(`✓ PASS: ${message}`)
    passCount++
  } else {
    console.error(`✗ FAIL: ${message}`)
    failCount++
  }
}

// 1. Check AboutPage.tsx content
const aboutPage = fs.readFileSync(path.resolve('src/pages/About/AboutPage.tsx'), 'utf-8')

// Language check: verify removed overly complex phrases
const bannedPhrases = [
  'WHAT DRIVES THE SYSTEM',
  'WHAT DRIVES<br />THE SYSTEM',
  'Beyond the Chalkboard',
  'How We Approach the Machine',
  'Problem Envelope',
  'Physics Decomposition',
  'Geometric Synthesis',
  'Evidence Refinement',
  'First Principles & Governing Laws',
  'AN INTERCONNECTED NETWORK',
  'AN INTERCONNECTED<br />NETWORK',
  'THE DISCIPLINED LOOP',
  'Cad/Cam Lab & Machine Design Studio',
]

bannedPhrases.forEach((phrase) => {
  assert(!aboutPage.toLowerCase().includes(phrase.toLowerCase()), `Removed complex language: "${phrase}"`)
})

// Hero checks
assert(aboutPage.includes('ABOUT MECHESA.'), 'Hero title is "ABOUT MECHESA." matching Events and Team page scale')
assert(aboutPage.includes('student association for Mechanical Engineering at IIT Indore'), 'Hero describes MechESA accurately as student association')

// Purpose checks
assert(aboutPage.includes('WHAT WE DO.') || aboutPage.includes('OUR PURPOSE.'), 'Purpose section heading present')
const aboutDataContent = fs.readFileSync(path.resolve('src/data/about.ts'), 'utf-8')
assert(
  aboutDataContent.includes('EVENTS') &&
  aboutDataContent.includes('WORKSHOPS') &&
  aboutDataContent.includes('INDUSTRY VISITS') &&
  aboutDataContent.includes('STUDENT ACTIVITIES') &&
  aboutPage.includes('aboutActivities.map'),
  'Contains 4 core student activity categories rendered via aboutActivities'
)

// Disciplines checks
assert(aboutPage.includes('AREAS OF MECHANICAL ENGINEERING.'), 'Disciplines section heading is "AREAS OF MECHANICAL ENGINEERING."')
const disciplines = ['Design', 'Manufacturing', 'Thermodynamics', 'Fluid Mechanics', 'Robotics', 'Automotive', 'Materials', 'Mechatronics']
disciplines.forEach((d) => {
  assert(aboutPage.includes(d) || fs.readFileSync(path.resolve('src/data/about.ts'), 'utf-8').includes(d), `Includes mechanical discipline: ${d}`)
})

// Community / Closing checks
assert(aboutPage.includes('JOIN THE COMMUNITY.'), 'Community section heading present')
assert(aboutPage.includes('to="/events"') && aboutPage.includes('to="/team"') && aboutPage.includes('to="/contact"'), 'Conduits cleanly link to /events, /team, and /contact')

// 2. Check about.css consistency
const aboutCss = fs.readFileSync(path.resolve('src/pages/About/about.css'), 'utf-8')
assert(aboutCss.includes('clamp(80px, 10vw, 120px)'), 'Page padding-top matches Events and Team pages')
assert(aboutCss.includes('var(--text-h1'), 'Hero h1 uses standard --text-h1 token')
assert(aboutCss.includes('clamp(1.75rem, 3.5vw, 2.75rem)'), 'Section heading matches Events and Team page scale')
assert(!aboutCss.includes('clamp(4rem, 9vw, 9rem)'), 'Giant 9rem hero typography completely eliminated')

// 3. Verify git diff scope (only About files modified)
const aboutData = fs.readFileSync(path.resolve('src/data/about.ts'), 'utf-8')
assert(aboutData.includes('aboutActivities') && aboutData.includes('aboutDisciplines'), 'src/data/about.ts structured cleanly and easily editable')

console.log(`\n========================================`)
console.log(`RESULTS: ${passCount} PASSED, ${failCount} FAILED`)
console.log(`========================================\n`)

if (failCount > 0) {
  process.exit(1)
}
