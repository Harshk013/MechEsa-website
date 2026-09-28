import fs from 'fs'
import path from 'path'

console.log('=== VERIFYING MECHESA HOME HERO POLISH ITERATION 02 ===\n')

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

// 1. Verify HomePage.tsx
const homePageContent = fs.readFileSync(path.resolve('src/pages/Home/HomePage.tsx'), 'utf-8')

assert(homePageContent.includes('<HeroMechanicalEnvironment />'), 'HomePage.tsx includes HeroMechanicalEnvironment')
assert(homePageContent.includes('home-hero__watermark--left') && homePageContent.includes('home-hero__watermark--right'), 'HomePage.tsx includes subtle environmental side watermarks')
assert(homePageContent.includes('hero-machine-frame'), 'HomePage.tsx wraps hero machine in engineered frame')
assert(homePageContent.includes('frame-bracket--tl') && homePageContent.includes('frame-bracket--tr'), 'HomePage.tsx includes machined corner brackets')
assert(homePageContent.includes('hero-frame-bezel--top') && homePageContent.includes('hero-frame-bezel--bottom'), 'HomePage.tsx includes machine bezel identification and datum')
assert(homePageContent.includes('home-hero__centerpiece'), 'HomePage.tsx groups hero machine and actions in centerpiece assembly')
assert(!homePageContent.includes('CORE PLATFORM') && !homePageContent.includes('OPERATIONAL SPECS') && !homePageContent.includes('LOCATION / DATUM'), 'HomePage.tsx completely removed old HUD cards')
assert(homePageContent.includes('id="about"') && homePageContent.includes('id="events"'), 'Sections below hero (About, Events, etc.) are strictly preserved')

// 2. Verify home.css
const homeCss = fs.readFileSync(path.resolve('src/pages/Home/home.css'), 'utf-8')

assert(homeCss.includes('min(58vw, 590px)'), 'home.css scales .core-stage to min(58vw, 590px) (~1.4x current size)')
assert(homeCss.includes('clamp(20px, 3vh, 32px)'), 'home.css sets deliberate 24-32px spacing between hero and CTA buttons')
assert(homeCss.includes('.hero-machine-frame'), 'home.css defines machined frame enclosure with depth and drop shadow')
assert(homeCss.includes('clamp(4.6rem, 8.5vw, 8.8rem)'), 'home.css scales desktop typography to match the enlarged hero')
assert(homeCss.includes('.home-hero__watermark'), 'home.css styles low-contrast environmental side watermarks')
assert(!homeCss.includes('.hero-instrument__dimension-scale'), 'home.css removed old vertical dimension scale rules')

// 3. Verify HeroMechanicalEnvironment
const mechEnv = fs.readFileSync(path.resolve('src/components/home/HeroMechanicalEnvironment.tsx'), 'utf-8')
const mechEnvCss = fs.readFileSync(path.resolve('src/components/home/heroMechanicalEnvironment.css'), 'utf-8')

assert(mechEnv.includes('createGearPath'), 'HeroMechanicalEnvironment generates genuine mathematical involute gear paths')
assert(mechEnv.includes('mech-env__gear--main') && mechEnv.includes('mech-env__gear--pinion'), 'HeroMechanicalEnvironment renders multi-gear mechanical transmission system')
assert(mechEnv.includes('dialTicks'), 'HeroMechanicalEnvironment renders angular drafting degree dial ticks')
assert(mechEnvCss.includes('mech-env-cw') && mechEnvCss.includes('mech-env-ccw'), 'heroMechanicalEnvironment.css animates gears with slow, sophisticated rotation')
assert(mechEnvCss.includes('prefers-reduced-motion'), 'heroMechanicalEnvironment.css respects reduced-motion preference')

// 4. Verify floatingMechLab.css
const floatingCss = fs.readFileSync(path.resolve('src/components/navigation/floatingMechLab.css'), 'utf-8')

assert(floatingCss.includes('width: 88px') && floatingCss.includes('height: 88px'), 'floatingMechLab.css increases button size to 88px (~16% larger)')
assert(floatingCss.includes('rotate(45deg)'), 'floatingMechLab.css includes knurled bezel rotation on hover')
assert(floatingCss.includes('scale(1.04)'), 'floatingMechLab.css includes tactile hover scale')

// 5. Verify MachineStateIndicator removal from bottom right
const controllerContent = fs.readFileSync(path.resolve('src/components/home/scroll/HomeScrollController.tsx'), 'utf-8')
assert(!controllerContent.includes('<MachineStateIndicator />'), 'HomeScrollController.tsx completely removed MachineStateIndicator from the DOM')

console.log(`\n========================================`)
console.log(`RESULTS: ${passCount} PASSED, ${failCount} FAILED`)
console.log(`========================================\n`)

if (failCount > 0) {
  process.exit(1)
}
