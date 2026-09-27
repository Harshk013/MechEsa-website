// src/components/mechLab/experiments/designModel.ts
// Mathematical model for Beam CAD & Structural Design: Area Moment of Inertia, Bending Stress, Deflection, Mass, and Factor of Safety

export type MaterialId = 'steel' | 'aluminum' | 'titanium' | 'carbon_fiber' | 'wood'

export interface MaterialProperties {
  id: MaterialId
  name: string
  densityKgM3: number // Density (kg/m³)
  youngsModulusGpa: number // Modulus of Elasticity E (GPa)
  yieldStrengthMpa: number // Yield Strength σ_y (MPa)
  colorAccent: string
  description: string
}

export const DESIGN_MATERIALS: Record<MaterialId, MaterialProperties> = {
  steel: {
    id: 'steel',
    name: 'Structural Steel (A36)',
    densityKgM3: 7850,
    youngsModulusGpa: 200,
    yieldStrengthMpa: 250,
    colorAccent: '#94a3b8',
    description: 'High stiffness (E = 200 GPa) and dependable strength, but heavy.',
  },
  aluminum: {
    id: 'aluminum',
    name: '6061-T6 Aluminum',
    densityKgM3: 2700,
    youngsModulusGpa: 69,
    yieldStrengthMpa: 276,
    colorAccent: '#38bdf8',
    description: '1/3 weight of steel with comparable yield strength, but 3× more flexible.',
  },
  titanium: {
    id: 'titanium',
    name: 'Grade 5 Titanium (Ti-6Al-4V)',
    densityKgM3: 4430,
    youngsModulusGpa: 114,
    yieldStrengthMpa: 880,
    colorAccent: '#a78bfa',
    description: 'Superior strength-to-weight ratio with high yield limit (880 MPa).',
  },
  carbon_fiber: {
    id: 'carbon_fiber',
    name: 'Carbon Fiber Composite',
    densityKgM3: 1600,
    youngsModulusGpa: 150,
    yieldStrengthMpa: 600,
    colorAccent: '#34d399',
    description: 'Ultra-lightweight with exceptional directional stiffness and strength.',
  },
  wood: {
    id: 'wood',
    name: 'Structural Pine',
    densityKgM3: 500,
    youngsModulusGpa: 11,
    yieldStrengthMpa: 40,
    colorAccent: '#d97706',
    description: 'Low density traditional timber, but low yield strength and high deflection.',
  },
}

export interface BeamParams {
  lengthM: number // meters (1.0 to 4.0 m)
  widthMm: number // millimeters (40 to 200 mm)
  heightMm: number // millimeters (60 to 300 mm)
  loadKn: number // kilonewtons (2 to 50 kN)
  materialId: MaterialId
}

export interface BeamAnalysis {
  params: BeamParams
  material: MaterialProperties
  crossSectionAreaM2: number
  momentOfInertiaM4: number // I = (w · h³) / 12
  sectionModulusM3: number // Z = (w · h²) / 6
  massKg: number // m = ρ · L · A
  maxBendingMomentNm: number // M = F · L
  maxBendingStressMpa: number // σ = M / Z
  tipDeflectionMm: number // δ = (F · L³) / (3 · E · I)
  factorOfSafety: number // FoS = σ_yield / σ_max
  isFailed: boolean // FoS < 1.0 (plastic yield failure)
  isCritical: boolean // 1.0 <= FoS < 1.5
  statusRating: 'OPTIMAL' | 'SAFE' | 'CRITICAL' | 'FAILED'
}

export const BEAM_LIMITS = {
  lengthM: { min: 1.0, max: 4.0, default: 2.5, step: 0.1, unit: 'm' },
  widthMm: { min: 40, max: 200, default: 80, step: 5, unit: 'mm' },
  heightMm: { min: 60, max: 300, default: 160, step: 5, unit: 'mm' },
  loadKn: { min: 2, max: 50, default: 12, step: 1, unit: 'kN' },
}

export function calculateBeamAnalysis(params: BeamParams): BeamAnalysis {
  // Clamp parameters
  const lengthM = Math.max(BEAM_LIMITS.lengthM.min, Math.min(BEAM_LIMITS.lengthM.max, params.lengthM))
  const widthMm = Math.max(BEAM_LIMITS.widthMm.min, Math.min(BEAM_LIMITS.widthMm.max, params.widthMm))
  const heightMm = Math.max(BEAM_LIMITS.heightMm.min, Math.min(BEAM_LIMITS.heightMm.max, params.heightMm))
  const loadKn = Math.max(BEAM_LIMITS.loadKn.min, Math.min(BEAM_LIMITS.loadKn.max, params.loadKn))
  const material = DESIGN_MATERIALS[params.materialId] || DESIGN_MATERIALS.steel

  // Convert dimensions to SI (meters)
  const wM = widthMm / 1000
  const hM = heightMm / 1000
  const loadN = loadKn * 1000

  // Geometric properties
  const crossSectionAreaM2 = wM * hM
  const momentOfInertiaM4 = (wM * Math.pow(hM, 3)) / 12
  const sectionModulusM3 = (wM * Math.pow(hM, 2)) / 6

  // Total beam mass (kg)
  const massKg = material.densityKgM3 * lengthM * crossSectionAreaM2

  // Cantilever mechanics under end point load
  // Max moment occurs at fixed root x = 0: M = F · L
  const maxBendingMomentNm = loadN * lengthM

  // Max bending stress: σ = M · (h/2) / I = M / Z
  const maxBendingStressPa = maxBendingMomentNm / sectionModulusM3
  const maxBendingStressMpa = maxBendingStressPa / 1e6

  // Tip deflection: δ = (F · L³) / (3 · E · I)
  const youngsModulusPa = material.youngsModulusGpa * 1e9
  const tipDeflectionM = (loadN * Math.pow(lengthM, 3)) / (3 * youngsModulusPa * momentOfInertiaM4)
  const tipDeflectionMm = tipDeflectionM * 1000

  // Factor of Safety: FoS = σ_yield / σ_max
  const factorOfSafety = maxBendingStressMpa > 0 ? material.yieldStrengthMpa / maxBendingStressMpa : 999

  const isFailed = factorOfSafety < 1.0
  const isCritical = factorOfSafety >= 1.0 && factorOfSafety < 1.5

  let statusRating: 'OPTIMAL' | 'SAFE' | 'CRITICAL' | 'FAILED' = 'OPTIMAL'
  if (isFailed) statusRating = 'FAILED'
  else if (isCritical) statusRating = 'CRITICAL'
  else if (factorOfSafety >= 2.0) statusRating = 'OPTIMAL'
  else statusRating = 'SAFE'

  return {
    params: { lengthM, widthMm, heightMm, loadKn, materialId: material.id },
    material,
    crossSectionAreaM2,
    momentOfInertiaM4,
    sectionModulusM3,
    massKg,
    maxBendingMomentNm,
    maxBendingStressMpa,
    tipDeflectionMm,
    factorOfSafety,
    isFailed,
    isCritical,
    statusRating,
  }
}

export interface DynamicExplanation {
  whatChanged: string
  whatHappened: string
  why: string
}

export function getBeamDynamicExplanation(
  current: BeamParams,
  prev: BeamParams
): DynamicExplanation {
  const curAnalysis = calculateBeamAnalysis(current)
  const prevAnalysis = calculateBeamAnalysis(prev)

  // 1. Material Change
  if (current.materialId !== prev.materialId) {
    const curMat = curAnalysis.material
    const prevMat = prevAnalysis.material
    return {
      whatChanged: `You swapped material from ${prevMat.name} to ${curMat.name}.`,
      whatHappened: `Mass shifted from ${prevAnalysis.massKg.toFixed(1)} kg to ${curAnalysis.massKg.toFixed(1)} kg, and deflection changed from ${prevAnalysis.tipDeflectionMm.toFixed(1)} mm to ${curAnalysis.tipDeflectionMm.toFixed(1)} mm.`,
      why: `Each material has distinct density (ρ), stiffness (Young's Modulus E), and yield strength (σ_y). Changing material alters strength without modifying geometry.`,
    }
  }

  // 2. Height Change (Major stiffness cubic effect)
  if (Math.abs(current.heightMm - prev.heightMm) >= 5) {
    const diff = current.heightMm - prev.heightMm
    const direction = diff > 0 ? 'increased' : 'reduced'
    return {
      whatChanged: `You ${direction} beam HEIGHT from ${prev.heightMm} mm to ${current.heightMm} mm.`,
      whatHappened: `Bending stress became ${curAnalysis.maxBendingStressMpa.toFixed(0)} MPa (FoS = ${curAnalysis.factorOfSafety.toFixed(2)}), and tip deflection shifted to ${curAnalysis.tipDeflectionMm.toFixed(1)} mm.`,
      why: `Moment of inertia scales with the CUBE of height (I = w·h³/12). Increasing height is the single most efficient way to resist bending and deflection!`,
    }
  }

  // 3. Width Change
  if (Math.abs(current.widthMm - prev.widthMm) >= 5) {
    const diff = current.widthMm - prev.widthMm
    const direction = diff > 0 ? 'widened' : 'narrowed'
    return {
      whatChanged: `You ${direction} beam WIDTH from ${prev.widthMm} mm to ${current.widthMm} mm.`,
      whatHappened: `Mass changed to ${curAnalysis.massKg.toFixed(1)} kg, and stress is now ${curAnalysis.maxBendingStressMpa.toFixed(0)} MPa.`,
      why: `Stiffness and strength scale linearly with width (I ∝ w). Widening adds strength, but increases mass proportionally without the cubic benefit of height.`,
    }
  }

  // 4. Length Change
  if (Math.abs(current.lengthM - prev.lengthM) >= 0.1) {
    const diff = current.lengthM - prev.lengthM
    const direction = diff > 0 ? 'extended' : 'shortened'
    return {
      whatChanged: `You ${direction} beam SPAN from ${prev.lengthM.toFixed(1)} m to ${current.lengthM.toFixed(1)} m.`,
      whatHappened: `Bending moment at the wall root is now ${(curAnalysis.maxBendingMomentNm / 1000).toFixed(1)} kN·m, and deflection is ${curAnalysis.tipDeflectionMm.toFixed(1)} mm.`,
      why: `Longer beams experience greater moment arms (M = F·L), and cantilever deflection scales with the CUBE of length (δ ∝ L³). Longer spans sag dramatically.`,
    }
  }

  // 5. Load Change
  if (Math.abs(current.loadKn - prev.loadKn) >= 1) {
    const diff = current.loadKn - prev.loadKn
    const direction = diff > 0 ? 'increased' : 'decreased'
    return {
      whatChanged: `You ${direction} the applied LOAD from ${prev.loadKn} kN to ${current.loadKn} kN.`,
      whatHappened: `Bending stress shifted to ${curAnalysis.maxBendingStressMpa.toFixed(0)} MPa. Factor of Safety is now ${curAnalysis.factorOfSafety.toFixed(2)} (${curAnalysis.statusRating}).`,
      why: `Transverse force F directly scales internal bending moment and stress (σ = 6FL / wh²). Doubling the load doubles stress and deflection simultaneously.`,
    }
  }

  // Default balanced overview
  return {
    whatChanged: `Beam configured at ${current.lengthM}m × ${current.widthMm}mm × ${current.heightMm}mm under ${current.loadKn} kN load.`,
    whatHappened: `Max stress is ${curAnalysis.maxBendingStressMpa.toFixed(0)} MPa, deflection is ${curAnalysis.tipDeflectionMm.toFixed(1)} mm, and mass is ${curAnalysis.massKg.toFixed(1)} kg.`,
    why: `Structural performance is the interplay of geometry (cross-section I), material stiffness (E), and loading moment (M = F·L).`,
  }
}

export const DESIGN_EQUATIONS = [
  {
    title: 'Area Moment of Inertia (Bending Resistance)',
    formula: 'I = \\frac{w \\cdot h^3}{12}',
    explanation: 'Height (h) contributes cubically to bending stiffness. A taller beam is exponentially more resistant to bending than a wider beam of equal area.',
  },
  {
    title: 'Flexural Bending Stress (Euler-Bernoulli)',
    formula: '\\sigma_{\\text{max}} = \\frac{M \\cdot y}{I} = \\frac{6 \\cdot F \\cdot L}{w \\cdot h^2}',
    explanation: 'Maximum normal stress occurs at the outermost top and bottom fibers at the fixed support root. It must not exceed the material yield strength.',
  },
  {
    title: 'Cantilever Tip Deflection',
    formula: '\\delta_{\\text{max}} = \\frac{F \\cdot L^3}{3 \\cdot E \\cdot I}',
    explanation: 'Deflection measures elastic sag under load. It is directly proportional to applied force F and length cubed L³, and inversely proportional to flexural rigidity E·I.',
  },
  {
    title: 'Factor of Safety (Design Margin)',
    formula: '\\text{FoS} = \\frac{\\sigma_{\\text{yield}}}{\\sigma_{\\text{max}}} \\ge 1.5',
    explanation: 'Engineering structures require FoS ≥ 1.5 to 2.0 to guard against manufacturing tolerances, fatigue, and unexpected peak shock loads.',
  },
]
