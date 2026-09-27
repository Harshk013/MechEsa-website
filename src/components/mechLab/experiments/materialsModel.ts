// src/components/mechLab/experiments/materialsModel.ts
// Physical model, materials database, and state calculations for Materials Flagship Experience

export type MaterialId =
  | 'structural_steel'
  | 'aluminum_6061'
  | 'titanium_ti6al4v'
  | 'carbon_composite'
  | 'engineering_polymer'

export interface MaterialProperties {
  id: MaterialId
  name: string
  shortName: string
  category: string
  youngsModulusGpa: number // E in GPa (10^9 Pa)
  yieldStrengthMpa: number // sigma_y in MPa (10^6 Pa)
  ultimateTensileStrengthMpa: number // sigma_uts in MPa
  densityKgM3: number // rho in kg/m^3
  poissonsRatio: number // nu
  elongationAtFracturePercent: number
  colorHex: string
  accentColor: string
  description: string
}

export const MATERIALS_DATABASE: Record<MaterialId, MaterialProperties> = {
  structural_steel: {
    id: 'structural_steel',
    name: 'Structural Steel (AISI 1018)',
    shortName: 'Steel 1018',
    category: 'Ferrous Alloy',
    youngsModulusGpa: 205,
    yieldStrengthMpa: 250,
    ultimateTensileStrengthMpa: 400,
    densityKgM3: 7850,
    poissonsRatio: 0.29,
    elongationAtFracturePercent: 20.0,
    colorHex: '#94a3b8',
    accentColor: '#38bdf8',
    description: 'High stiffness, versatile structural steel with broad elastic range and predictable yield plateau.',
  },
  aluminum_6061: {
    id: 'aluminum_6061',
    name: '6061-T6 Aluminum Alloy',
    shortName: 'Al 6061-T6',
    category: 'Non-Ferrous Alloy',
    youngsModulusGpa: 69,
    yieldStrengthMpa: 276,
    ultimateTensileStrengthMpa: 310,
    densityKgM3: 2700,
    poissonsRatio: 0.33,
    elongationAtFracturePercent: 12.0,
    colorHex: '#cbd5e1',
    accentColor: '#67e8f9',
    description: 'Lightweight aerospace alloy offering exceptional strength-to-weight ratio with lower stiffness.',
  },
  titanium_ti6al4v: {
    id: 'titanium_ti6al4v',
    name: 'Titanium Ti-6Al-4V (Grade 5)',
    shortName: 'Titanium Gr5',
    category: 'Aerospace Metal',
    youngsModulusGpa: 114,
    yieldStrengthMpa: 880,
    ultimateTensileStrengthMpa: 950,
    densityKgM3: 4430,
    poissonsRatio: 0.34,
    elongationAtFracturePercent: 14.0,
    colorHex: '#e2e8f0',
    accentColor: '#b98a5e',
    description: 'Ultra-high yield strength benchmark alloy for extreme aerospace, marine, and biomedical components.',
  },
  carbon_composite: {
    id: 'carbon_composite',
    name: 'Carbon Fiber CFRP (Quasi-Isotropic)',
    shortName: 'CFRP Composite',
    category: 'Engineered Composite',
    youngsModulusGpa: 140,
    yieldStrengthMpa: 600,
    ultimateTensileStrengthMpa: 850,
    densityKgM3: 1550,
    poissonsRatio: 0.28,
    elongationAtFracturePercent: 1.8,
    colorHex: '#475569',
    accentColor: '#f59e0b',
    description: 'High modulus, ultra-low mass engineered composite with linear brittle elastic response up to rupture.',
  },
  engineering_polymer: {
    id: 'engineering_polymer',
    name: 'Engineering Polymer (Nylon 6/6)',
    shortName: 'Nylon 6/6',
    category: 'Thermoplastic',
    youngsModulusGpa: 3.0,
    yieldStrengthMpa: 75,
    ultimateTensileStrengthMpa: 85,
    densityKgM3: 1140,
    poissonsRatio: 0.39,
    elongationAtFracturePercent: 35.0,
    colorHex: '#f1f5f9',
    accentColor: '#ec4899',
    description: 'Highly compliant structural polymer with large elastic elongation and superior shock damping.',
  },
}

export interface SpecimenParams {
  appliedLoadKn: number // F in kN
  gaugeWidthMm: number // w in mm
  gaugeThicknessMm: number // t in mm
  gaugeLengthMm: number // L0 in mm
  materialId: MaterialId
}

export const SPECIMEN_LIMITS = {
  appliedLoadKn: { min: 1.0, max: 80.0, default: 20.0, step: 0.5 },
  gaugeWidthMm: { min: 10.0, max: 40.0, default: 20.0, step: 1.0 },
  gaugeThicknessMm: { min: 3.0, max: 20.0, default: 10.0, step: 0.5 },
  gaugeLengthMm: { min: 50.0, max: 250.0, default: 100.0, step: 5.0 },
}

export const DEFAULT_SPECIMEN_PARAMS: SpecimenParams = {
  appliedLoadKn: 20.0,
  gaugeWidthMm: 20.0,
  gaugeThicknessMm: 10.0,
  gaugeLengthMm: 100.0,
  materialId: 'structural_steel',
}

export interface MaterialsAnalysis {
  params: SpecimenParams
  material: MaterialProperties
  crossSectionAreaMm2: number
  crossSectionAreaM2: number
  appliedForceN: number
  normalStressMpa: number
  strain: number
  strainPercent: number
  elongationMm: number
  stretchedLengthMm: number
  factorOfSafety: number
  specimenMassKg: number
  isYielded: boolean
  isRuptured: boolean
  statusRating: 'OPTIMAL' | 'SAFE' | 'NEAR_YIELD' | 'PLASTIC_YIELD' | 'RUPTURED'
  statusLabel: string
}

export function calculateMaterialsAnalysis(rawParams: SpecimenParams): MaterialsAnalysis {
  const appliedLoadKn = Math.max(
    SPECIMEN_LIMITS.appliedLoadKn.min,
    Math.min(SPECIMEN_LIMITS.appliedLoadKn.max, rawParams.appliedLoadKn)
  )
  const gaugeWidthMm = Math.max(
    SPECIMEN_LIMITS.gaugeWidthMm.min,
    Math.min(SPECIMEN_LIMITS.gaugeWidthMm.max, rawParams.gaugeWidthMm)
  )
  const gaugeThicknessMm = Math.max(
    SPECIMEN_LIMITS.gaugeThicknessMm.min,
    Math.min(SPECIMEN_LIMITS.gaugeThicknessMm.max, rawParams.gaugeThicknessMm)
  )
  const gaugeLengthMm = Math.max(
    SPECIMEN_LIMITS.gaugeLengthMm.min,
    Math.min(SPECIMEN_LIMITS.gaugeLengthMm.max, rawParams.gaugeLengthMm)
  )

  const material = MATERIALS_DATABASE[rawParams.materialId] || MATERIALS_DATABASE.structural_steel

  // Cross section area A = width * thickness
  const crossSectionAreaMm2 = gaugeWidthMm * gaugeThicknessMm
  const crossSectionAreaM2 = crossSectionAreaMm2 * 1e-6 // mm^2 to m^2

  // Force F in Newtons
  const appliedForceN = appliedLoadKn * 1000

  // Engineering Normal Stress: sigma = F / A (in Pa, converted to MPa)
  const normalStressPa = appliedForceN / crossSectionAreaM2
  const normalStressMpa = normalStressPa / 1e6

  // Yield & Rupture evaluation
  const isYielded = normalStressMpa >= material.yieldStrengthMpa
  const isRuptured = normalStressMpa >= material.ultimateTensileStrengthMpa

  // Strain calculation:
  // In elastic regime: epsilon = sigma / E
  // In plastic regime: epsilon = epsilon_yield + (sigma - sigma_y) / E_tangent
  const youngsModulusPa = material.youngsModulusGpa * 1e9
  const elasticStrainYield = (material.yieldStrengthMpa * 1e6) / youngsModulusPa

  let strain = 0
  if (!isYielded) {
    strain = normalStressPa / youngsModulusPa
  } else {
    // Plastic strain hardening region with tangent modulus ~ 0.05 * E
    const tangentModulusPa = 0.05 * youngsModulusPa
    const plasticOverstressPa = (normalStressMpa - material.yieldStrengthMpa) * 1e6
    strain = elasticStrainYield + plasticOverstressPa / tangentModulusPa
  }

  const strainPercent = strain * 100

  // Elongation Delta L = epsilon * L0
  const elongationMm = strain * gaugeLengthMm
  const stretchedLengthMm = gaugeLengthMm + elongationMm

  // Factor of Safety FoS = sigma_yield / sigma
  const factorOfSafety = Number(
    (material.yieldStrengthMpa / Math.max(0.01, normalStressMpa)).toFixed(2)
  )

  // Total specimen mass (gauge section + 35% shoulder allowance)
  const gaugeVolumeM3 = crossSectionAreaM2 * (gaugeLengthMm * 1e-3)
  const totalVolumeM3 = gaugeVolumeM3 * 1.35
  const specimenMassKg = Number((material.densityKgM3 * totalVolumeM3).toFixed(3))

  // Status classification
  let statusRating: MaterialsAnalysis['statusRating'] = 'OPTIMAL'
  let statusLabel = 'ELASTIC (SAFE)'

  if (isRuptured) {
    statusRating = 'RUPTURED'
    statusLabel = 'TENSILE RUPTURE ✕'
  } else if (isYielded) {
    statusRating = 'PLASTIC_YIELD'
    statusLabel = 'PLASTIC YIELDING ⚠'
  } else if (factorOfSafety < 1.25) {
    statusRating = 'NEAR_YIELD'
    statusLabel = 'NEAR YIELD CRITICAL'
  } else if (factorOfSafety < 1.75) {
    statusRating = 'SAFE'
    statusLabel = 'ELASTIC (MODERATE MARGIN)'
  } else {
    statusRating = 'OPTIMAL'
    statusLabel = 'ELASTIC (OPTIMAL MARGIN)'
  }

  return {
    params: {
      appliedLoadKn,
      gaugeWidthMm,
      gaugeThicknessMm,
      gaugeLengthMm,
      materialId: material.id,
    },
    material,
    crossSectionAreaMm2,
    crossSectionAreaM2,
    appliedForceN,
    normalStressMpa,
    strain,
    strainPercent,
    elongationMm,
    stretchedLengthMm,
    factorOfSafety,
    specimenMassKg,
    isYielded,
    isRuptured,
    statusRating,
    statusLabel,
  }
}

export interface DynamicMaterialsExplanation {
  whatChanged: string
  whatHappened: string
  why: string
}

export function getMaterialsDynamicExplanation(
  current: SpecimenParams,
  prev: SpecimenParams
): DynamicMaterialsExplanation {
  const curAnalysis = calculateMaterialsAnalysis(current)
  const prevAnalysis = calculateMaterialsAnalysis(prev)

  // 1. Material Change
  if (current.materialId !== prev.materialId) {
    return {
      whatChanged: `You swapped the material from ${prevAnalysis.material.name} to ${curAnalysis.material.name}.`,
      whatHappened: `Yield strength changed from ${prevAnalysis.material.yieldStrengthMpa} MPa to ${curAnalysis.material.yieldStrengthMpa} MPa, while stiffness modulus (E) shifted to ${curAnalysis.material.youngsModulusGpa} GPa (FoS: ${curAnalysis.factorOfSafety.toFixed(2)}).`,
      why: `Each alloy has distinct atomic lattice bonding. Higher Young's Modulus (E) stiffens the specimen against elongation, while higher yield strength (σ_y) prevents permanent plastic deformation.`,
    }
  }

  // 2. Applied Load Change
  if (Math.abs(current.appliedLoadKn - prev.appliedLoadKn) >= 1) {
    const diff = current.appliedLoadKn - prev.appliedLoadKn
    const direction = diff > 0 ? 'increased' : 'reduced'
    return {
      whatChanged: `You ${direction} the applied tensile LOAD from ${prev.appliedLoadKn.toFixed(1)} kN to ${current.appliedLoadKn.toFixed(1)} kN.`,
      whatHappened: `Normal tensile stress shifted to ${curAnalysis.normalStressMpa.toFixed(0)} MPa. Elongation is now ${curAnalysis.elongationMm.toFixed(3)} mm (FoS = ${curAnalysis.factorOfSafety.toFixed(2)}).`,
      why: `Tensile stress scales directly with tensile force (σ = F / A). Pulling harder on the same cross-sectional area intensifies internal axial bond stretch.`,
    }
  }

  // 3. Cross Section Change (Width or Thickness)
  if (
    Math.abs(current.gaugeWidthMm - prev.gaugeWidthMm) >= 1 ||
    Math.abs(current.gaugeThicknessMm - prev.gaugeThicknessMm) >= 0.5
  ) {
    const prevArea = prev.gaugeWidthMm * prev.gaugeThicknessMm
    const curArea = current.gaugeWidthMm * current.gaugeThicknessMm
    const direction = curArea > prevArea ? 'widened / thickened' : 'thinned / narrowed'
    return {
      whatChanged: `You ${direction} the specimen gauge area from ${prevArea.toFixed(0)} mm² to ${curArea.toFixed(0)} mm².`,
      whatHappened: `Tensile stress shifted from ${prevAnalysis.normalStressMpa.toFixed(0)} MPa to ${curAnalysis.normalStressMpa.toFixed(0)} MPa (FoS = ${curAnalysis.factorOfSafety.toFixed(2)}).`,
      why: `Stress is inversely proportional to cross-sectional area (σ = F / A). Distributing the same load across more material reduces the load density per square millimeter.`,
    }
  }

  // 4. Gauge Length Change
  if (Math.abs(current.gaugeLengthMm - prev.gaugeLengthMm) >= 5) {
    const diff = current.gaugeLengthMm - prev.gaugeLengthMm
    const direction = diff > 0 ? 'lengthened' : 'shortened'
    return {
      whatChanged: `You ${direction} the specimen gauge length L₀ from ${prev.gaugeLengthMm} mm to ${current.gaugeLengthMm} mm.`,
      whatHappened: `Total elongation ΔL changed to ${curAnalysis.elongationMm.toFixed(3)} mm, while internal normal stress remained identical at ${curAnalysis.normalStressMpa.toFixed(0)} MPa.`,
      why: `Stress depends only on load and area (F / A), but total elongation accumulates over distance (ΔL = ε · L₀). Longer specimens stretch further in absolute millimeters under identical strain.`,
    }
  }

  // Default balanced overview
  return {
    whatChanged: `Specimen set to ${current.gaugeLengthMm} mm gauge length with ${current.gaugeWidthMm} mm × ${current.gaugeThicknessMm} mm section under ${current.appliedLoadKn.toFixed(1)} kN tension.`,
    whatHappened: `Operating at ${curAnalysis.normalStressMpa.toFixed(0)} MPa tensile stress, giving ${curAnalysis.elongationMm.toFixed(3)} mm elongation (FoS = ${curAnalysis.factorOfSafety.toFixed(2)}).`,
    why: `Materials behavior is dictated by Hooke's Law (σ = E · ε) within the elastic region, transitioning to plastic slip when reaching the yield threshold.`,
  }
}

export const MATERIALS_EQUATIONS = [
  {
    title: 'Normal Tensile Stress (Internal Load Intensity)',
    formula: 'σ = F / A',
    explanation:
      'Normal stress represents the internal force intensity perpendicular to the cross-sectional plane. For uniform axial tension, it is simply the applied force divided by the resisting cross-sectional area.',
  },
  {
    title: 'Engineering Normal Strain (Relative Deformation)',
    formula: 'ε = ΔL / L₀',
    explanation:
      'Strain is dimensionless deformation measuring how much the gauge length stretches relative to its original undeformed length. One percent strain equals 0.01 mm of elongation per millimeter.',
  },
  {
    title: "Hooke's Law (Uniaxial Linear Elasticity)",
    formula: 'σ = E · ε  ⟹  ΔL = (F · L₀) / (E · A)',
    explanation:
      "Within the elastic limit, stress is directly proportional to strain via Young's Modulus (E). When load is released, atomic bonds spring back to their exact original positions without permanent deformation.",
  },
  {
    title: 'Factor of Safety (Yield Margin)',
    formula: 'FoS = σ_yield / σ_working ≥ 1.50',
    explanation:
      'The factor of safety ensures the structure operates with a certified buffer below material yield strength, guarding against shock loads, material imperfections, and fatigue.',
  },
]
