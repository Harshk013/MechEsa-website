// src/components/mechLab/experiments/fluidModel.ts
// Mathematical model for Venturi flow: Continuity, Bernoulli equation, and Manometer deflection

export interface FluidParams {
  flowRate: number // Liters per minute (L/min)
  throatDiameter: number // millimeters (mm)
}

export interface PointMeasurement {
  x: number
  label: string
  diameter: number // mm
  area: number // m²
  velocity: number // m/s
  staticPressure: number // kPa
  dynamicPressure: number // kPa
  totalPressure: number // kPa
}

export interface FluidState {
  params: FluidParams
  inlet: PointMeasurement
  throat: PointMeasurement
  outlet: PointMeasurement
  pressureDropKpa: number
  manometerDeltaH: number // mm of indicator fluid
  reynoldsInlet: number
  reynoldsThroat: number
  isCavitationRisk: boolean
  relativeVelocityRatio: number
}

// Physical Constants
export const FLUID_CONSTANTS = {
  fluidDensity: 1000, // Water density in kg/m³
  indicatorDensity: 1000, // Manometer indicator fluid density (kg/m³)
  gravity: 9.80665, // m/s²
  inletDiameterMm: 50, // 50 mm fixed inlet pipe
  outletDiameterMm: 50, // 50 mm fixed outlet pipe
  baseInletPressureKpa: 25.0, // Gauge pressure at Point A in kPa
  diffuserEfficiency: 0.88, // 88% pressure recovery in diverging section
  kinematicViscosity: 1.004e-6, // m²/s for water at 20°C
}

export const FLUID_PARAM_LIMITS = {
  flowRate: { min: 10, max: 60, default: 30, step: 1, unit: 'L/min' },
  throatDiameter: { min: 15, max: 45, default: 25, step: 1, unit: 'mm' },
}

export function calculateFluidState(flowRateLpm: number, throatDiameterMm: number): FluidState {
  // Clamp inputs within safe physical ranges
  const flowRate = Math.max(FLUID_PARAM_LIMITS.flowRate.min, Math.min(FLUID_PARAM_LIMITS.flowRate.max, flowRateLpm))
  const throatD = Math.max(FLUID_PARAM_LIMITS.throatDiameter.min, Math.min(FLUID_PARAM_LIMITS.throatDiameter.max, throatDiameterMm))

  // Volumetric flow rate Q: convert L/min to m³/s (1 L = 0.001 m³, 1 min = 60 s)
  const qM3s = (flowRate * 0.001) / 60

  // Point A: Inlet (Wide)
  const dInletM = FLUID_CONSTANTS.inletDiameterMm / 1000
  const areaInletM2 = (Math.PI * Math.pow(dInletM, 2)) / 4
  const vInlet = qM3s / areaInletM2 // m/s
  const dynPInletPa = 0.5 * FLUID_CONSTANTS.fluidDensity * Math.pow(vInlet, 2)
  const staticPInletPa = FLUID_CONSTANTS.baseInletPressureKpa * 1000
  const totalPInletPa = staticPInletPa + dynPInletPa

  // Point B: Throat (Narrow)
  const dThroatM = throatD / 1000
  const areaThroatM2 = (Math.PI * Math.pow(dThroatM, 2)) / 4
  const vThroat = qM3s / areaThroatM2 // m/s via Continuity A1*V1 = A2*V2
  const dynPThroatPa = 0.5 * FLUID_CONSTANTS.fluidDensity * Math.pow(vThroat, 2)

  // Via Bernoulli: P1 + 0.5*rho*V1² = P2 + 0.5*rho*V2²
  // P2 = P1 - 0.5*rho*(V2² - V1²)
  const deltaPPa = dynPThroatPa - dynPInletPa
  const staticPThroatPa = Math.max(0, staticPInletPa - deltaPPa)
  const totalPThroatPa = staticPThroatPa + dynPThroatPa

  // Point C: Outlet (Diffuser recovery)
  const dOutletM = FLUID_CONSTANTS.outletDiameterMm / 1000
  const areaOutletM2 = (Math.PI * Math.pow(dOutletM, 2)) / 4
  const vOutlet = qM3s / areaOutletM2
  const dynPOutletPa = 0.5 * FLUID_CONSTANTS.fluidDensity * Math.pow(vOutlet, 2)
  // Recover static pressure minus diffuser loss
  const recoveredPPa = staticPThroatPa + (dynPThroatPa - dynPOutletPa) * FLUID_CONSTANTS.diffuserEfficiency
  const staticPOutletPa = Math.max(0, recoveredPPa)
  const totalPOutletPa = staticPOutletPa + dynPOutletPa

  // Manometer deflection: Delta h = Delta P / (rho_m * g) in meters, convert to mm
  const manometerM = deltaPPa / (FLUID_CONSTANTS.indicatorDensity * FLUID_CONSTANTS.gravity)
  const manometerDeltaHMm = Math.max(0, manometerM * 1000)

  // Reynolds numbers: Re = (V * D) / nu
  const reInlet = Math.round((vInlet * dInletM) / FLUID_CONSTANTS.kinematicViscosity)
  const reThroat = Math.round((vThroat * dThroatM) / FLUID_CONSTANTS.kinematicViscosity)

  return {
    params: { flowRate, throatDiameter: throatD },
    inlet: {
      x: 180,
      label: 'POINT A (INLET)',
      diameter: FLUID_CONSTANTS.inletDiameterMm,
      area: areaInletM2,
      velocity: vInlet,
      staticPressure: staticPInletPa / 1000,
      dynamicPressure: dynPInletPa / 1000,
      totalPressure: totalPInletPa / 1000,
    },
    throat: {
      x: 400,
      label: 'POINT B (THROAT)',
      diameter: throatD,
      area: areaThroatM2,
      velocity: vThroat,
      staticPressure: staticPThroatPa / 1000,
      dynamicPressure: dynPThroatPa / 1000,
      totalPressure: totalPThroatPa / 1000,
    },
    outlet: {
      x: 620,
      label: 'POINT C (OUTLET)',
      diameter: FLUID_CONSTANTS.outletDiameterMm,
      area: areaOutletM2,
      velocity: vOutlet,
      staticPressure: staticPOutletPa / 1000,
      dynamicPressure: dynPOutletPa / 1000,
      totalPressure: totalPOutletPa / 1000,
    },
    pressureDropKpa: deltaPPa / 1000,
    manometerDeltaH: manometerDeltaHMm,
    reynoldsInlet: reInlet,
    reynoldsThroat: reThroat,
    isCavitationRisk: staticPThroatPa < 3500, // Risk below water vapor pressure margin (~3.5 kPa)
    relativeVelocityRatio: vThroat / Math.max(0.001, vInlet),
  }
}

// Beginner-friendly dynamic explanation cards
export interface FluidDynamicExplanation {
  whatChanged: string
  whatHappened: string
  why: string
}

export function getFluidDynamicExplanation(
  currentFlow: number,
  prevFlow: number,
  currentThroat: number,
  prevThroat: number
): FluidDynamicExplanation {
  const throatDiff = Math.abs(currentThroat - prevThroat)
  const flowDiff = Math.abs(currentFlow - prevFlow)

  if (throatDiff >= flowDiff && throatDiff > 0) {
    if (currentThroat < prevThroat) {
      return {
        whatChanged: `You made the throat narrower (from ${prevThroat} mm down to ${currentThroat} mm).`,
        whatHappened: 'The water noticeably accelerated through the throat, and the static pressure dropped.',
        why: 'Because the same volume of water must squeeze through a smaller area, it speeds up. Faster flow converts static pressure into kinetic energy.',
      }
    } else {
      return {
        whatChanged: `You opened the throat wider (from ${prevThroat} mm up to ${currentThroat} mm).`,
        whatHappened: 'The throat velocity decreased, and the static pressure rose back closer to the inlet pressure.',
        why: 'With more cross-sectional area, the fluid does not need to rush as fast to carry the flow, so less pressure is traded for speed.',
      }
    }
  }

  if (flowDiff > 0) {
    if (currentFlow > prevFlow) {
      return {
        whatChanged: `You increased the pump flow rate (from ${prevFlow} to ${currentFlow} L/min).`,
        whatHappened: 'Water moves faster across the entire pipe, creating a larger pressure difference on the manometer.',
        why: 'Pumping more fluid per second raises velocities everywhere, magnifying the pressure drop across the constriction.',
      }
    } else {
      return {
        whatChanged: `You dialed down the flow rate (from ${prevFlow} to ${currentFlow} L/min).`,
        whatHappened: 'Flow velocity decreased and the manometer liquid levels moved closer together.',
        why: 'With less fluid moving through the pipe, velocity differences are milder, producing a smaller pressure drop.',
      }
    }
  }

  return {
    whatChanged: 'Adjust the Flow Rate or Throat Size sliders.',
    whatHappened: 'Watch the animated water particles speed up and the manometer columns shift.',
    why: 'Narrower pipe sections speed up the fluid, which lowers static pressure (the Venturi effect).',
  }
}

// Progressive Engineering Equations
export const FLUID_EQUATIONS = [
  {
    title: 'CONTINUITY PRINCIPLE (MASS CONSERVATION)',
    formula: 'Q = A₁ · V₁ = A₂ · V₂',
    explanation:
      'For an incompressible fluid like water, the flow rate Q is constant everywhere. When the cross-sectional area A shrinks, velocity V must proportionally increase.',
  },
  {
    title: "BERNOULLI'S ENERGY EQUATION (HORIZONTAL PIPE)",
    formula: 'P₁ + ½·ρ·V₁² = P₂ + ½·ρ·V₂²',
    explanation:
      'Total mechanical energy is conserved along a streamline. When kinetic energy (½·ρ·V²) rises due to acceleration, static pressure (P) drops to balance the sum.',
  },
  {
    title: 'DIFFERENTIAL MANOMETER DEFLECTION',
    formula: 'ΔP = P₁ - P₂ = ρ_m · g · Δh',
    explanation:
      'The pressure difference between the wide inlet and the narrow throat pushes down the liquid column at A and lifts it at B, producing a height difference Δh.',
  },
]
