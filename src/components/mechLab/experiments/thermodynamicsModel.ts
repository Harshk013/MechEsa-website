import type {
  ThermodynamicsCycleData,
  ExperimentParameter,
  ExperimentAssumption,
  ExperimentEquation,
  ExperimentExplanation,
  PVPoint,
} from '../../../data/mechLabTypes'

// ── Physical Constants (Air as Ideal Gas) ──────────────────────────────
export const GAMMA = 1.4 // Ratio of specific heats (Cp / Cv) for air
export const CV = 0.718 // Specific heat at constant volume (kJ / kg·K)
export const R_AIR = 0.287 // Specific gas constant for air (kJ / kg·K)
export const P_ATM = 101.325 // Standard ambient atmospheric pressure (kPa)

// ── Default Parameters ────────────────────────────────────────────────
export const DEFAULT_THERMO_PARAMS = {
  compressionRatio: 8.5, // :1
  heatInput: 1.4, // kJ per cycle
  inletTemp: 300, // K (27 °C)
  displacement: 500, // cm³
}

export type ThermoParams = typeof DEFAULT_THERMO_PARAMS

// ── Parameter Definitions ─────────────────────────────────────────────
export const THERMODYNAMICS_PARAMETERS: ExperimentParameter[] = [
  {
    id: 'compressionRatio',
    label: 'Compression Ratio',
    symbol: 'r',
    min: 4.0,
    max: 16.0,
    default: 8.5,
    step: 0.5,
    unit: ':1',
    description: 'Ratio of maximum cylinder volume (BDC) to minimum clearance volume (TDC).',
  },
  {
    id: 'heatInput',
    label: 'Heat Added per Cycle',
    symbol: 'Q_in',
    min: 0.6,
    max: 2.4,
    default: 1.4,
    step: 0.1,
    unit: 'kJ',
    description: 'Thermal energy transferred to the trapped air charge during combustion.',
  },
  {
    id: 'inletTemp',
    label: 'Inlet Air Temperature',
    symbol: 'T_1',
    min: 280,
    max: 360,
    default: 300,
    step: 5,
    unit: 'K',
    description: 'Ambient air intake temperature at the beginning of the compression stroke.',
  },
  {
    id: 'displacement',
    label: 'Displacement Volume',
    symbol: 'V_d',
    min: 250,
    max: 750,
    default: 500,
    step: 25,
    unit: 'cm³',
    description: 'Swept volume displaced by the piston between Bottom Dead Center and Top Dead Center.',
  },
]

// ── Assumptions ───────────────────────────────────────────────────────
export const THERMODYNAMICS_ASSUMPTIONS: ExperimentAssumption[] = [
  {
    id: 'ideal-gas',
    title: 'Ideal Gas Behavior',
    statement: 'The working fluid is modeled as air behaving as an ideal gas with constant specific heats (γ = 1.4, Cv = 0.718 kJ/kg·K).',
    engineeringBasis: 'Valid at typical engine air-fuel pressures and temperatures within ~2-3% of real-gas tables.',
  },
  {
    id: 'otto-standard',
    title: 'Air-Standard Otto Cycle',
    statement: 'Combustion is modeled as instantaneous, reversible constant-volume heat addition at Top Dead Center.',
    engineeringBasis: 'Provides the theoretical upper-bound thermal efficiency benchmark for spark-ignition engines.',
  },
  {
    id: 'closed-system',
    title: 'Closed Charge Mass',
    statement: 'The cylinder charge mass remains trapped with zero ring blowby between inlet valve closure and exhaust opening.',
    engineeringBasis: 'Standard engineering approximation for analyzing power stroke thermodynamics.',
  },
  {
    id: 'reversible-adiabatic',
    title: 'Isentropic Compression & Expansion',
    statement: 'Friction between piston rings and cylinder wall is neglected, and heat loss through cylinder boundaries during compression and expansion is assumed negligible (P·V^γ = constant).',
    engineeringBasis: 'Separates aerodynamic/mechanical friction from thermodynamic cycle performance.',
  },
]

// ── Equations ─────────────────────────────────────────────────────────
export const THERMODYNAMICS_EQUATIONS: ExperimentEquation[] = [
  {
    title: 'Thermal Efficiency (Air-Standard Otto)',
    formula: 'η_th = 1 − 1 / r^(γ − 1)',
    explanation: 'Efficiency depends solely on compression ratio r and specific heat ratio γ (1.4 for air). Higher compression squeezes more expansion work from the fuel.',
  },
  {
    title: 'Ideal Gas State Equation',
    formula: 'P · V = m · R · T',
    explanation: 'Relates cylinder pressure P, trapped volume V, charge mass m, gas constant R, and absolute temperature T across all four cycle states.',
  },
  {
    title: 'Net Work Output (Enclosed P-V Area)',
    formula: 'W_net = Q_in − Q_out = η_th · Q_in = ∮ P dV',
    explanation: 'The area enclosed inside the P-V loop represents the net mechanical work produced per engine cycle.',
  },
]

// ── Core Engineering Calculation Function ─────────────────────────────
export function calculateThermodynamicsCycle(params: ThermoParams): ThermodynamicsCycleData {
  // Input validation and clamping to prevent non-physical numbers
  const r = Math.max(4.0, Math.min(16.0, params.compressionRatio))
  const qIn = Math.max(0.6, Math.min(2.4, params.heatInput))
  const t1 = Math.max(280, Math.min(360, params.inletTemp))
  const vd = Math.max(250, Math.min(750, params.displacement))

  // 1. Cylinder Geometry
  // Clearance volume Vc: Vd = V1 - V2 = r*Vc - Vc = Vc * (r - 1) => Vc = Vd / (r - 1)
  const v2 = vd / (r - 1) // Clearance volume (cm³)
  const v1 = v2 + vd // Total cylinder volume (cm³)
  const vc = v2

  // 2. Trapped Mass Calculation (at State 1: P1, V1, T1)
  // P1 in kPa, V1 in m³ (1 cm³ = 1e-6 m³), R in kJ/(kg·K), T1 in K => mass in kg
  const v1M3 = v1 * 1e-6
  const p1 = P_ATM
  const mKg = (p1 * v1M3) / (R_AIR * t1)
  const mGrams = mKg * 1000

  // 3. State 2: After Isentropic Compression (1 -> 2)
  // T2 / T1 = (V1 / V2)^(gamma - 1) = r^(gamma - 1)
  const t2 = t1 * Math.pow(r, GAMMA - 1)
  // P2 / P1 = (V1 / V2)^gamma = r^gamma
  const p2 = p1 * Math.pow(r, GAMMA)

  // 4. State 3: After Constant-Volume Heat Addition (2 -> 3)
  // Qin = m * Cv * (T3 - T2) => Delta T = Qin / (m * Cv)
  const deltaT = qIn / (mKg * CV)
  const t3 = t2 + deltaT
  // At constant volume V3 = V2: P3 / P2 = T3 / T2
  const p3 = p2 * (t3 / t2)
  const v3 = v2

  // 5. State 4: After Isentropic Expansion (3 -> 4)
  // V4 = V1
  const v4 = v1
  // T4 / T3 = (V3 / V4)^(gamma - 1) = (1 / r)^(gamma - 1)
  const t4 = t3 * Math.pow(1 / r, GAMMA - 1)
  // P4 / P3 = (1 / r)^gamma
  const p4 = p3 * Math.pow(1 / r, GAMMA)

  // 6. Thermal Efficiency and Work
  // eta_th = 1 - 1 / r^(gamma - 1)
  const efficiencyDecimal = 1 - 1 / Math.pow(r, GAMMA - 1)
  const efficiencyPercent = Number((efficiencyDecimal * 100).toFixed(1))

  // Net work W_net = eta * Qin (kJ)
  const netWorkKj = Number((efficiencyDecimal * qIn).toFixed(3))

  // Mean Effective Pressure IMEP = W_net / Vd (kPa)
  // W_net in kJ, Vd in m³ => IMEP in kPa
  const vdM3 = vd * 1e-6
  const imepKpa = Math.round(netWorkKj / vdM3)

  // 7. P-V Diagram Curve Generation (Smooth closed cycle)
  const pvCurvePoints: PVPoint[] = []
  const steps = 18

  // Process 1 -> 2 (Isentropic Compression: P * V^gamma = P1 * V1^gamma)
  for (let i = 0; i <= steps; i++) {
    const fraction = i / steps
    const v = v1 - fraction * (v1 - v2)
    const p = p1 * Math.pow(v1 / v, GAMMA)
    pvCurvePoints.push({
      volume: Number(v.toFixed(1)),
      pressure: Number(p.toFixed(1)),
      label: i === 0 ? 'State 1 (BDC)' : i === steps ? 'State 2 (TDC)' : undefined,
    })
  }

  // Process 2 -> 3 (Isochoric Heat Addition at V2 from P2 to P3)
  pvCurvePoints.push({
    volume: Number(v2.toFixed(1)),
    pressure: Number(p3.toFixed(1)),
    label: 'State 3 (Peak Pressure)',
  })

  // Process 3 -> 4 (Isentropic Expansion: P * V^gamma = P3 * V3^gamma)
  for (let i = 0; i <= steps; i++) {
    const fraction = i / steps
    const v = v3 + fraction * (v4 - v3)
    const p = p3 * Math.pow(v3 / v, GAMMA)
    pvCurvePoints.push({
      volume: Number(v.toFixed(1)),
      pressure: Number(p.toFixed(1)),
      label: i === steps ? 'State 4 (Exhaust Blowdown)' : undefined,
    })
  }

  // Process 4 -> 1 (Isochoric Heat Rejection back to P1)
  pvCurvePoints.push({
    volume: Number(v1.toFixed(1)),
    pressure: Number(p1.toFixed(1)),
  })

  // 8. Challenge Objective:
  // Target: Achieve Efficiency >= 60.0% while keeping Peak Pressure P3 <= 9,000 kPa
  const challengePassed = efficiencyPercent >= 60.0 && p3 <= 9000

  return {
    efficiency: efficiencyPercent,
    netWork: netWorkKj,
    peakPressure: Math.round(p3),
    peakTemperature: Math.round(t3),
    clearanceVolume: Number(vc.toFixed(1)),
    totalVolume: Number(v1.toFixed(1)),
    trappedMass: Number(mGrams.toFixed(3)),
    imep: imepKpa,
    t1: Math.round(t1),
    t2: Math.round(t2),
    t3: Math.round(t3),
    t4: Math.round(t4),
    p1: Math.round(p1),
    p2: Math.round(p2),
    p3: Math.round(p3),
    p4: Math.round(p4),
    v1: Math.round(v1),
    v2: Math.round(v2),
    pvCurvePoints,
    challengePassed,
  }
}

// ── Dynamic Engineering Explanation Generator ─────────────────────────
export function getThermodynamicsExplanation(
  current: ThermoParams,
  previous: ThermoParams
): ExperimentExplanation {
  const rDiff = current.compressionRatio - previous.compressionRatio
  const qDiff = current.heatInput - previous.heatInput
  const tDiff = current.inletTemp - previous.inletTemp
  const vDiff = current.displacement - previous.displacement

  let whatChanged = ''
  let whatHappened = ''
  let why = ''

  if (Math.abs(rDiff) >= 0.5) {
    if (rDiff > 0) {
      whatChanged = `Compression ratio ↑ (from ${previous.compressionRatio}:1 to ${current.compressionRatio}:1)`
      whatHappened = `The piston compresses the mixture into a tighter clearance space. Ideal thermal efficiency increased to ${(100 * (1 - 1 / Math.pow(current.compressionRatio, 0.4))).toFixed(1)}%, and combustion pressure rose.`
      why = `A higher compression ratio increases the expansion ratio during the power stroke, extracting more shaft work from the burning fuel before heat is rejected into the exhaust.`
    } else {
      whatChanged = `Compression ratio ↓ (from ${previous.compressionRatio}:1 to ${current.compressionRatio}:1)`
      whatHappened = `The clearance volume enlarged. Thermal efficiency dropped, and peak combustion pressure decreased.`
      why = `A lower compression ratio gives the piston less stroke to expand the hot gases, dumping more thermal energy out through the exhaust without turning it into useful mechanical work.`
    }
  } else if (Math.abs(qDiff) >= 0.1) {
    if (qDiff > 0) {
      whatChanged = `Heat added per cycle ↑ (from ${previous.heatInput.toFixed(1)} kJ to ${current.heatInput.toFixed(1)} kJ)`
      whatHappened = `Combustion chamber pressure and peak temperature jumped proportionally, increasing net work output.`
      why = `Adding more thermal energy creates a more powerful explosion at TDC, pushing the piston down with higher mechanical force throughout the expansion stroke.`
    } else {
      whatChanged = `Heat added per cycle ↓ (from ${previous.heatInput.toFixed(1)} kJ to ${current.heatInput.toFixed(1)} kJ)`
      whatHappened = `Peak combustion pressure and peak temperature dropped, decreasing net cycle work.`
      why = `Less heat addition reduces the pressure rise behind the piston, resulting in less force to drive the crankshaft during power expansion.`
    }
  } else if (Math.abs(vDiff) >= 25) {
    whatChanged = `Engine displacement adjusted (from ${previous.displacement} cm³ to ${current.displacement} cm³)`
    whatHappened = `The cylinder swept volume changed, scaling the trapped air charge mass proportionally.`
    why = `A larger cylinder draws in more air and fuel mass per stroke, producing greater total power output for the same cycle pressure limits.`
  } else if (Math.abs(tDiff) >= 5) {
    whatChanged = `Inlet air temperature adjusted to ${current.inletTemp} K (${current.inletTemp - 273} °C)`
    whatHappened = `The entire temperature profile shifted upward, raising compression temperature T₂ and combustion peak T₃.`
    why = `Hotter intake air is less dense, so the cylinder traps slightly less air mass per stroke (P·V = m·R·T) while operating at higher internal temperatures.`
  } else {
    whatChanged = `Engine tuned to ${current.compressionRatio}:1 compression with ${current.heatInput.toFixed(1)} kJ heat added.`
    whatHappened = `The engine operates smoothly through all four strokes: intake, compression, power ignition, and exhaust blowdown.`
    why = `The Otto cycle turns thermal heat into useful mechanical motion by compressing air, igniting fuel at constant volume, and letting the high pressure expand against the moving piston face.`
  }

  return { whatChanged, whatHappened, why }
}
