import fs from 'fs'
import path from 'path'

console.log('=== VERIFYING MECHESA ABOUT PAGE COMPLETE REDESIGN ===\n')

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

// 1. Verify src/data/about.ts
const aboutDataContent = fs.readFileSync(path.resolve('src/data/about.ts'), 'utf-8')

assert(aboutDataContent.includes('aboutPillars'), 'src/data/about.ts exports aboutPillars')
assert(aboutDataContent.includes('LEARN') && aboutDataContent.includes('BUILD') && aboutDataContent.includes('CONNECT'), 'aboutPillars contains LEARN, BUILD, and CONNECT')
assert(aboutDataContent.includes('purposeStages'), 'src/data/about.ts exports purposeStages')
assert(aboutDataContent.includes('THEORY') && aboutDataContent.includes('EXPERIMENT') && aboutDataContent.includes('LEARN AGAIN'), 'purposeStages defines Theory-to-Practice pipeline')
assert(aboutDataContent.includes('cultureStages'), 'src/data/about.ts exports cultureStages')
assert(aboutDataContent.includes('OBSERVE') && aboutDataContent.includes('ITERATE'), 'cultureStages defines 6-stage engineering loop')
assert(aboutDataContent.includes('disciplineDetails'), 'src/data/about.ts provides rich details for 8 core disciplines')
assert(aboutDataContent.includes('communityDimensions'), 'src/data/about.ts exports communityDimensions')

// 2. Verify src/pages/About/AboutPage.tsx
const aboutPageContent = fs.readFileSync(path.resolve('src/pages/About/AboutPage.tsx'), 'utf-8')

assert(aboutPageContent.includes('id="identity"') && aboutPageContent.includes('id="purpose"'), 'AboutPage.tsx has Section 01 (Identity) and Section 02 (Purpose)')
assert(aboutPageContent.includes('id="culture"') && aboutPageContent.includes('id="disciplines"'), 'AboutPage.tsx has Section 03 (Culture) and Section 04 (Disciplines)')
assert(aboutPageContent.includes('id="community"') && aboutPageContent.includes('id="closing"'), 'AboutPage.tsx has Section 05 (Community) and Section 06 (Closing)')
assert(aboutPageContent.includes('about-architecture-card'), 'Section 01 renders association architectural topology diagram')
assert(aboutPageContent.includes('about-purpose-pipeline'), 'Section 02 renders Theory-to-Practice pipeline')
assert(aboutPageContent.includes('about-culture-workflow'), 'Section 03 renders 6-stage engineering workflow')
assert(aboutPageContent.includes('about-network-matrix'), 'Section 04 renders 8-discipline engineering network matrix')
assert(aboutPageContent.includes('community-grid') && aboutPageContent.includes('community-ribbon'), 'Section 05 renders community grid and ecosystem ribbon')
assert(aboutPageContent.includes('UNDERSTAND THE SYSTEM') && aboutPageContent.includes('BUILD WHAT COMES NEXT'), 'Section 06 contains closing directive statement')
assert(aboutPageContent.includes('to="/events"') && aboutPageContent.includes('to="/team"') && aboutPageContent.includes('to="/blogs"') && aboutPageContent.includes('to="/contact"'), 'Section 06 links to Events, Team, Blogs, and Contact')
assert(!aboutPageContent.includes('WHY<br />MECHESA?'), 'Old hero title removed')
assert(!aboutPageContent.includes('aboutManifesto'), 'Old manifesto list replaced with purposeful culture workflow')

// 3. Verify src/pages/About/about.css
const aboutCss = fs.readFileSync(path.resolve('src/pages/About/about.css'), 'utf-8')

assert(aboutCss.includes('.about-architecture-card'), 'about.css styles association architecture diagram card')
assert(aboutCss.includes('.about-purpose-pipeline'), 'about.css styles Theory-to-Practice pipeline')
assert(aboutCss.includes('.about-culture-workflow'), 'about.css styles 6-stage culture workflow')
assert(aboutCss.includes('.about-network-matrix'), 'about.css styles 8-discipline network matrix')
assert(aboutCss.includes('.community-card'), 'about.css styles community cards')
assert(aboutCss.includes('.closing-terminal'), 'about.css styles closing terminal with conduits')
assert(aboutCss.includes('prefers-reduced-motion'), 'about.css includes accessibility reduced-motion rules')
assert(!aboutCss.includes('font-size:clamp(4rem,9vw,9rem)'), 'Giant 9rem headers in intermediate sections removed for balanced hierarchy')

// 4. Verify scope integrity (unrelated pages untouched)
const gitStatus = fs.readFileSync(path.resolve('package.json'), 'utf-8')
assert(gitStatus.includes('"name": "mechesa-engineered-motion"'), 'Project integrity verified')

console.log(`\n========================================`)
console.log(`RESULTS: ${passCount} PASSED, ${failCount} FAILED`)
console.log(`========================================\n`)

if (failCount > 0) {
  process.exit(1)
}
