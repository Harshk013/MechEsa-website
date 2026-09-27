// Verification script for Thermodynamics Model & Challenge Evaluation
const GAMMA = 1.4
const CV = 0.718
const R_AIR = 0.287
const P_ATM = 101.325

function calculateCycle(rIn, qInRaw, t1Raw, vdRaw) {
  const r = Math.max(4.0, Math.min(16.0, rIn))
  const qIn = Math.max(0.6, Math.min(2.4, qInRaw))
  const t1 = Math.max(280, Math.min(360, t1Raw))
  const vd = Math.max(250, Math.min(750, vdRaw))

  const v2 = vd / (r - 1)
  const v1 = v2 + vd
  const v1M3 = v1 * 1e-6
  const p1 = P_ATM
  const mKg = (p1 * v1M3) / (R_AIR * t1)
  const mGrams = mKg * 1000

  const t2 = t1 * Math.pow(r, GAMMA - 1)
  const p2 = p1 * Math.pow(r, GAMMA)

  const deltaT = qIn / (mKg * CV)
  const t3 = t2 + deltaT
  const p3 = p2 * (t3 / t2)

  const efficiencyDecimal = 1 - 1 / Math.pow(r, GAMMA - 1)
  const efficiencyPercent = Number((efficiencyDecimal * 100).toFixed(1))
  const netWorkKj = Number((efficiencyDecimal * qIn).toFixed(3))

  return {
    r,
    qIn,
    t1,
    vd,
    efficiencyPercent,
    netWorkKj,
    peakPressureKpa: Math.round(p3),
    peakTemperatureK: Math.round(t3),
    trappedMassGrams: Number(mGrams.toFixed(3)),
    clearanceVolumeCm3: Number(v2.toFixed(1)),
    totalVolumeCm3: Number(v1.toFixed(1)),
  }
}

function evaluateChallenge(params, cycle) {
  const effMet = cycle.efficiencyPercent >= 60.0
  const pressMet = cycle.peakPressureKpa <= 9000
  const isPassed = effMet && pressMet

  let status = isPassed ? 'TARGET ACHIEVED' : 'NOT MET'
  let feedback = ''

  if (isPassed) {
    feedback = `Target achieved! At r = ${params.r}:1 and Qin = ${params.qIn} kJ, efficiency is ${cycle.efficiencyPercent}% with peak pressure ${cycle.peakPressureKpa} kPa.`
  } else if (!effMet && pressMet) {
    feedback = `Efficiency is below the target (current: ${cycle.efficiencyPercent}%, target: ≥ 60.0%). Increase compression ratio.`
  } else if (effMet && !pressMet) {
    feedback = `Efficiency target met, but peak pressure exceeds limit (current: ${cycle.peakPressureKpa} kPa, limit: ≤ 9,000 kPa). Reduce heat input.`
  } else {
    feedback = `Neither criterion met. Adjust both compression ratio and heat input.`
  }

  return { isPassed, status, feedback }
}

// ── TEST 1: DEFAULT VALUES ─────────────────────────────────────────────
console.log('--- TEST 1: DEFAULT VALUES (r=8.5, Qin=1.4 kJ, T1=300 K, Vd=500 cm³) ---')
const defResult = calculateCycle(8.5, 1.4, 300, 500)
console.log(defResult)
if (defResult.efficiencyPercent < 55 || defResult.efficiencyPercent > 60) throw new Error('Default efficiency out of expected range')
if (isNaN(defResult.peakPressureKpa) || !isFinite(defResult.peakPressureKpa)) throw new Error('Peak pressure invalid')

// ── TEST 2: LOWER BOUNDARY ─────────────────────────────────────────────
console.log('\n--- TEST 2: LOWER BOUNDARY (r=4.0, Qin=0.6 kJ, T1=280 K, Vd=250 cm³) ---')
const lowResult = calculateCycle(4.0, 0.6, 280, 250)
console.log(lowResult)
if (lowResult.efficiencyPercent <= 0 || lowResult.efficiencyPercent > 50) throw new Error('Low bound efficiency unexpected')

// ── TEST 3: UPPER BOUNDARY ─────────────────────────────────────────────
console.log('\n--- TEST 3: UPPER BOUNDARY (r=16.0, Qin=2.4 kJ, T1=360 K, Vd=750 cm³) ---')
const highResult = calculateCycle(16.0, 2.4, 360, 750)
console.log(highResult)
if (highResult.efficiencyPercent < 65 || highResult.efficiencyPercent > 75) throw new Error('High bound efficiency unexpected')

// ── TEST 4: MONOTONIC EFFICIENCY INCREASE ──────────────────────────────
console.log('\n--- TEST 4: MONOTONIC EFFICIENCY INCREASE WITH COMPRESSION RATIO ---')
const rValues = [5, 7, 9, 11, 13, 15]
let prevEff = 0
for (const r of rValues) {
  const res = calculateCycle(r, 1.4, 300, 500)
  console.log(`r = ${r}:1 -> Efficiency = ${res.efficiencyPercent}%, Net Work = ${res.netWorkKj} kJ`)
  if (res.efficiencyPercent <= prevEff) throw new Error(`Efficiency did not increase for r=${r}`)
  prevEff = res.efficiencyPercent
}

// ── TEST 5: CHALLENGE EVALUATION (FAILURE & SUCCESS CASES) ─────────────
console.log('\n--- TEST 5: CHALLENGE EVALUATION ---')
// Case A: Default params (r=8.5, Qin=1.4) -> Efficiency=57.5% < 60% => NOT MET
const evalDefault = evaluateChallenge({ r: 8.5, qIn: 1.4 }, defResult)
console.log('Case A (Default):', evalDefault.status, '=>', evalDefault.feedback)
if (evalDefault.isPassed) throw new Error('Default params should not pass the challenge')

// Case B: High compression, moderate heat (r=10.0, Qin=0.8, T1=300, Vd=500)
// Efficiency = 60.2% >= 60%, Peak pressure = 8,301 kPa <= 9,000 kPa => TARGET ACHIEVED!
const targetCycle = calculateCycle(10.0, 0.8, 300, 500)
const evalTarget = evaluateChallenge({ r: 10.0, qIn: 0.8 }, targetCycle)
console.log('Case B (Tuned Target):', evalTarget.status, '=>', evalTarget.feedback)
if (!evalTarget.isPassed) throw new Error('Tuned target params should pass the challenge')

// Case C: Excessive heat input (r=12.0, Qin=2.2) -> Peak pressure > 15,000 kPa => NOT MET
const overpressureCycle = calculateCycle(12.0, 2.2, 300, 500)
const evalOverpress = evaluateChallenge({ r: 12.0, qIn: 2.2 }, overpressureCycle)
console.log('Case C (Overpressure):', evalOverpress.status, '=>', evalOverpress.feedback)
if (evalOverpress.isPassed) throw new Error('Overpressure case should not pass the challenge')

// ── TEST 6: INPUT SANITIZATION & NO NAN/INFINITY ───────────────────────
console.log('\n--- TEST 6: INVALID INPUT SANITIZATION ---')
const clampedNegative = calculateCycle(-10, -5, 100, 50)
if (isNaN(clampedNegative.efficiencyPercent) || isNaN(clampedNegative.peakPressureKpa)) {
  throw new Error('NaN produced on negative input')
}
if (!isFinite(clampedNegative.efficiencyPercent) || !isFinite(clampedNegative.peakPressureKpa)) {
  throw new Error('Infinity produced on negative input')
}
console.log('Clamped negative input verified safely:', clampedNegative)

console.log('\nALL 6 THERMODYNAMIC & CHALLENGE TESTS PASSED SUCCESSFULLY!')
