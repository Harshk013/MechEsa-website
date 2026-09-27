// src/components/mechLab/experiments/manufacturingModel.ts
// Mathematical model, materials database, and physics for Manufacturing Flagship Experience (CNC Machining)

export type WorkpieceMaterialId =
  | 'aluminum_6061'
  | 'mild_steel_1018'
  | 'alloy_steel_4140'
  | 'titanium_ti6al4v'
  | 'brass_c360'

export interface WorkpieceMaterial {
  id: WorkpieceMaterialId
  name: string
  shortName: string
  category: string
  specificCuttingForceKc: number // N/mm² (specific cutting resistance)
  densityKgM3: number
  optimalCuttingSpeedMpm: number // m/min
  machinabilityRatingPercent: number
  colorHex: string
  accentColor: string
  description: string
}

export const WORKPIECE_MATERIALS: Record<WorkpieceMaterialId, WorkpieceMaterial> = {
  aluminum_6061: {
    id: 'aluminum_6061',
    name: 'Aluminum 6061-T6',
    shortName: 'Al 6061-T6',
    category: 'Non-Ferrous Alloy',
    specificCuttingForceKc: 700,
    densityKgM3: 2700,
    optimalCuttingSpeedMpm: 320,
    machinabilityRatingPercent: 100,
    colorHex: '#cbd5e1',
    accentColor: '#38bdf8',
    description: 'High thermal conductivity, easily sheared chips with low spindle power requirements.',
  },
  mild_steel_1018: {
    id: 'mild_steel_1018',
    name: 'AISI 1018 Low-Carbon Steel',
    shortName: 'Steel 1018',
    category: 'Ferrous Carbon Steel',
    specificCuttingForceKc: 1750,
    densityKgM3: 7850,
    optimalCuttingSpeedMpm: 150,
    machinabilityRatingPercent: 70,
    colorHex: '#94a3b8',
    accentColor: '#fbbf24',
    description: 'Ductile structural steel forming continuous chips. Requires moderate cutting force and coolant.',
  },
  alloy_steel_4140: {
    id: 'alloy_steel_4140',
    name: 'AISI 4140 Chromium-Molybdenum',
    shortName: 'Alloy 4140 (Q&T)',
    category: 'High-Strength Alloy',
    specificCuttingForceKc: 2350,
    densityKgM3: 7850,
    optimalCuttingSpeedMpm: 110,
    machinabilityRatingPercent: 52,
    colorHex: '#64748b',
    accentColor: '#f97316',
    description: 'High shear strength and toughness. Demands rigid tooling and delivers elevated cutting heat.',
  },
  titanium_ti6al4v: {
    id: 'titanium_ti6al4v',
    name: 'Titanium Ti-6Al-4V (Grade 5)',
    shortName: 'Ti-6Al-4V Gr5',
    category: 'Aerospace Superalloy',
    specificCuttingForceKc: 2800,
    densityKgM3: 4430,
    optimalCuttingSpeedMpm: 55,
    machinabilityRatingPercent: 28,
    colorHex: '#e2e8f0',
    accentColor: '#ef4444',
    description: 'Extremely poor thermal conductivity. Heat concentrates on tool cutting edge; requires slow speeds.',
  },
  brass_c360: {
    id: 'brass_c360',
    name: 'C36000 Free-Cutting Brass',
    shortName: 'Brass C360',
    category: 'Copper Alloy',
    specificCuttingForceKc: 580,
    densityKgM3: 8500,
    optimalCuttingSpeedMpm: 380,
    machinabilityRatingPercent: 120,
    colorHex: '#fef08a',
    accentColor: '#eab308',
    description: 'Discontinuous chip formation with self-lubricating lead particles, yielding superior surface finishes.',
  },
}

export type CuttingToolId =
  | 'carbide_endmill_4f'
  | 'carbide_endmill_2f'
  | 'face_mill_indexable'

export interface CuttingTool {
  id: CuttingToolId
  name: string
  shortName: string
  diameterMm: number
  fluteCount: number
  cornerNoseRadiusMm: number
  maxRpm: number
  coating: string
  description: string
}

export const CUTTING_TOOLS: Record<CuttingToolId, CuttingTool> = {
  carbide_endmill_4f: {
    id: 'carbide_endmill_4f',
    name: 'Solid Carbide 4-Flute End Mill (Ø12mm)',
    shortName: 'Ø12mm 4-Flute',
    diameterMm: 12.0,
    fluteCount: 4,
    cornerNoseRadiusMm: 0.8,
    maxRpm: 12000,
    coating: 'AlTiN (Titanium Aluminum Nitride)',
    description: 'Rigid 4-flute design ideal for peripheral side milling, semi-finishing, and high feed finishing.',
  },
  carbide_endmill_2f: {
    id: 'carbide_endmill_2f',
    name: 'Solid Carbide 2-Flute Slot Mill (Ø10mm)',
    shortName: 'Ø10mm 2-Flute',
    diameterMm: 10.0,
    fluteCount: 2,
    cornerNoseRadiusMm: 0.5,
    maxRpm: 15000,
    coating: 'TiB2 (Titanium Diboride)',
    description: 'Generous chip gullets optimized for aggressive full-slot plunging and non-ferrous roughing.',
  },
  face_mill_indexable: {
    id: 'face_mill_indexable',
    name: 'Indexable Face Mill Cutter (Ø40mm)',
    shortName: 'Ø40mm Face Mill',
    diameterMm: 40.0,
    fluteCount: 5,
    cornerNoseRadiusMm: 1.2,
    maxRpm: 6000,
    coating: 'CVD TiCN + Al2O3',
    description: 'Wide engagement cutter carrying 5 indexable inserts for high-volume face surfacing and bulk stock removal.',
  },
}

export interface ManufacturingParams {
  spindleSpeedRpm: number // N in RPM
  feedPerToothMm: number // fz in mm/tooth
  axialDepthMm: number // ap in mm
  radialWidthMm: number // ae in mm
  materialId: WorkpieceMaterialId
  toolId: CuttingToolId
  coolantActive: boolean
}

export const MANUFACTURING_LIMITS = {
  spindleSpeedRpm: { min: 400, max: 7000, default: 2400, step: 50, unit: 'RPM' },
  feedPerToothMm: { min: 0.02, max: 0.22, default: 0.08, step: 0.01, unit: 'mm/tooth' },
  axialDepthMm: { min: 0.5, max: 5.0, default: 2.0, step: 0.25, unit: 'mm' },
  radialWidthMm: { min: 1.0, max: 12.0, default: 6.0, step: 0.5, unit: 'mm' },
}

export const DEFAULT_MANUFACTURING_PARAMS: ManufacturingParams = {
  spindleSpeedRpm: 2400,
  feedPerToothMm: 0.08,
  axialDepthMm: 2.0,
  radialWidthMm: 6.0,
  materialId: 'aluminum_6061',
  toolId: 'carbide_endmill_4f',
  coolantActive: true,
}

export const MACHINE_SPECS = {
  ratedPowerKw: 7.5, // 7.5 kW spindle drive motor
  maxCuttingForceN: 4200, // 4.2 kN axis drive limit
  spindleEfficiency: 0.88, // 88% mechanical transmission efficiency
}

export interface ManufacturingAnalysis {
  params: ManufacturingParams
  material: WorkpieceMaterial
  tool: CuttingTool
  cuttingSpeedMpm: number // Vc in m/min
  tableFeedMmPerMin: number // vf in mm/min
  materialRemovalRateCm3Min: number // MRR in cm³/min
  tangentialCuttingForceN: number // Fc in N
  spindlePowerKw: number // Pc in kW
  spindleLoadPercent: number // % of 7.5 kW rated motor
  surfaceRoughnessRaUm: number // Ra in micrometers (µm)
  estimatedCuttingTempC: number // °C
  chipThicknessMm: number // hm in mm
  isOverloaded: boolean
  isChatterRisk: boolean
  statusRating: 'OPTIMAL' | 'STABLE' | 'HEAVY_LOAD' | 'CHATTER_RISK' | 'OVERLOAD'
  statusLabel: string
}

export function calculateManufacturingAnalysis(
  rawParams: ManufacturingParams
): ManufacturingAnalysis {
  const spindleSpeedRpm = Math.max(
    MANUFACTURING_LIMITS.spindleSpeedRpm.min,
    Math.min(MANUFACTURING_LIMITS.spindleSpeedRpm.max, rawParams.spindleSpeedRpm ?? 2400)
  )
  const feedPerToothMm = Math.max(
    MANUFACTURING_LIMITS.feedPerToothMm.min,
    Math.min(MANUFACTURING_LIMITS.feedPerToothMm.max, rawParams.feedPerToothMm ?? 0.08)
  )
  const axialDepthMm = Math.max(
    MANUFACTURING_LIMITS.axialDepthMm.min,
    Math.min(MANUFACTURING_LIMITS.axialDepthMm.max, rawParams.axialDepthMm ?? 2.0)
  )
  const radialWidthMm = Math.max(
    MANUFACTURING_LIMITS.radialWidthMm.min,
    Math.min(MANUFACTURING_LIMITS.radialWidthMm.max, rawParams.radialWidthMm ?? 6.0)
  )

  const materialId = rawParams.materialId in WORKPIECE_MATERIALS ? rawParams.materialId : 'aluminum_6061'
  const toolId = rawParams.toolId in CUTTING_TOOLS ? rawParams.toolId : 'carbide_endmill_4f'
  const coolantActive = Boolean(rawParams.coolantActive)

  const material = WORKPIECE_MATERIALS[materialId]
  const tool = CUTTING_TOOLS[toolId]

  // Radial width cannot physically exceed cutter diameter
  const effectiveAeMm = Math.min(radialWidthMm, tool.diameterMm)

  // 1. Surface Cutting Speed Vc = (pi * D * N) / 1000  [m/min]
  const cuttingSpeedMpm = (Math.PI * tool.diameterMm * spindleSpeedRpm) / 1000

  // 2. Table Feed Rate vf = fz * z * N  [mm/min]
  const tableFeedMmPerMin = feedPerToothMm * tool.fluteCount * spindleSpeedRpm

  // 3. Material Removal Rate MRR = (ap * ae * vf) / 1000  [cm³/min]
  const materialRemovalRateCm3Min = (axialDepthMm * effectiveAeMm * tableFeedMmPerMin) / 1000

  // 4. Mean chip thickness hm ≈ fz * sqrt(ae / D)
  const chipThicknessRatio = Math.min(1.0, Math.sqrt(effectiveAeMm / tool.diameterMm))
  const chipThicknessMm = feedPerToothMm * chipThicknessRatio

  // 5. Main Tangential Cutting Force Fc = kc * ap * fz * (chip thickness correction)  [N]
  // Thinner chips exhibit slight chip-thinning specific energy increase
  const chipThinningFactor = Math.pow(Math.max(0.02, chipThicknessMm) / 0.1, -0.22)
  const tangentialCuttingForceN =
    material.specificCuttingForceKc *
    axialDepthMm *
    chipThicknessMm *
    chipThinningFactor

  // 6. Spindle Cutting Power Pc = (Fc * Vc) / (60 * 1000 * efficiency)  [kW]
  const spindlePowerKw =
    (tangentialCuttingForceN * cuttingSpeedMpm) /
    (60 * 1000 * MACHINE_SPECS.spindleEfficiency)

  const spindleLoadPercent = (spindlePowerKw / MACHINE_SPECS.ratedPowerKw) * 100

  // 7. Theoretical Arithmetic Surface Roughness Ra (Cusp height model)
  // Ra_theory = (fz² / (32 * r_epsilon)) * 1000  [µm]
  const baseRaUm = (Math.pow(feedPerToothMm, 2) / (32 * tool.cornerNoseRadiusMm)) * 1000

  // Realistic machining corrections:
  // - High cutting speed promotes clean shear (reduces built-up edge)
  // - Coolant suppresses micro-welding (-18% roughness)
  // - Over-speed or heavy chip loading degrades finish
  const speedRatio = cuttingSpeedMpm / material.optimalCuttingSpeedMpm
  let speedQualityFactor = 1.0
  if (speedRatio < 0.6) {
    speedQualityFactor = 1.35 // Built-up edge at sluggish speed
  } else if (speedRatio > 1.6) {
    speedQualityFactor = 1.25 // Thermal degradation
  }

  const coolantFactor = coolantActive ? 0.82 : 1.18
  const surfaceRoughnessRaUm = Math.max(
    0.05,
    Number((baseRaUm * speedQualityFactor * coolantFactor).toFixed(2))
  )

  // 8. Cutting Zone Temperature Estimate (°C)
  const baseTemp = 24
  const heatGeneration = (material.specificCuttingForceKc * Math.pow(cuttingSpeedMpm, 0.45) * Math.pow(feedPerToothMm, 0.25)) / 14
  const coolantCooling = coolantActive ? 0.65 : 1.0
  const estimatedCuttingTempC = Math.round(baseTemp + heatGeneration * coolantCooling)

  // 9. Stability & Chatter Limit
  // Slender depth-to-diameter ratio (ap / D > 0.4) at high RPM without coolant elevates chatter
  const depthRatio = axialDepthMm / tool.diameterMm
  const isChatterRisk = depthRatio > 0.38 && feedPerToothMm < 0.04 && spindleSpeedRpm > 4500
  const isOverloaded = spindlePowerKw > MACHINE_SPECS.ratedPowerKw || tangentialCuttingForceN > MACHINE_SPECS.maxCuttingForceN

  let statusRating: ManufacturingAnalysis['statusRating'] = 'OPTIMAL'
  let statusLabel = 'OPTIMAL CUTTING'

  if (isOverloaded) {
    statusRating = 'OVERLOAD'
    statusLabel = 'SPINDLE OVERLOAD ✕'
  } else if (isChatterRisk) {
    statusRating = 'CHATTER_RISK'
    statusLabel = 'HARMONIC CHATTER ⚠'
  } else if (spindleLoadPercent > 85) {
    statusRating = 'HEAVY_LOAD'
    statusLabel = 'HEAVY POWER LOAD'
  } else if (spindleLoadPercent > 50) {
    statusRating = 'STABLE'
    statusLabel = 'STABLE PRODUCTION'
  } else {
    statusRating = 'OPTIMAL'
    statusLabel = 'CLEAN FINISHING CUT'
  }

  return {
    params: {
      spindleSpeedRpm,
      feedPerToothMm,
      axialDepthMm,
      radialWidthMm: effectiveAeMm,
      materialId,
      toolId,
      coolantActive,
    },
    material,
    tool,
    cuttingSpeedMpm: Number(cuttingSpeedMpm.toFixed(1)),
    tableFeedMmPerMin: Number(tableFeedMmPerMin.toFixed(0)),
    materialRemovalRateCm3Min: Number(materialRemovalRateCm3Min.toFixed(1)),
    tangentialCuttingForceN: Number(tangentialCuttingForceN.toFixed(0)),
    spindlePowerKw: Number(spindlePowerKw.toFixed(2)),
    spindleLoadPercent: Number(spindleLoadPercent.toFixed(1)),
    surfaceRoughnessRaUm,
    estimatedCuttingTempC,
    chipThicknessMm: Number(chipThicknessMm.toFixed(3)),
    isOverloaded,
    isChatterRisk,
    statusRating,
    statusLabel,
  }
}

export interface DynamicManufacturingExplanation {
  whatChanged: string
  whatHappened: string
  why: string
}

export function getManufacturingDynamicExplanation(
  current: ManufacturingParams,
  prev: ManufacturingParams
): DynamicManufacturingExplanation {
  const curAnalysis = calculateManufacturingAnalysis(current)
  const prevAnalysis = calculateManufacturingAnalysis(prev)

  // 1. Material Change
  if (current.materialId !== prev.materialId) {
    return {
      whatChanged: `You swapped the workpiece stock to ${curAnalysis.material.name}.`,
      whatHappened: `Specific cutting force shifted from ${prevAnalysis.material.specificCuttingForceKc} to ${curAnalysis.material.specificCuttingForceKc} N/mm², altering cutting power to ${curAnalysis.spindlePowerKw} kW.`,
      why: 'Harder alloys with elevated shear strength resist plastic shearing during chip formation, requiring significantly more spindle motor torque.',
    }
  }

  // 2. Tool Change
  if (current.toolId !== prev.toolId) {
    return {
      whatChanged: `You mounted the ${curAnalysis.tool.name}.`,
      whatHappened: `Cutter diameter changed to ${curAnalysis.tool.diameterMm} mm with ${curAnalysis.tool.fluteCount} flutes, setting cutting speed to ${curAnalysis.cuttingSpeedMpm} m/min.`,
      why: 'Surface cutting speed Vc scales linearly with cutter diameter (Vc = π·D·N / 1000). More flutes multiply table feed rate without changing per-tooth chip load.',
    }
  }

  // 3. Spindle Speed Change
  if (Math.abs(current.spindleSpeedRpm - prev.spindleSpeedRpm) >= 200) {
    const isHigher = current.spindleSpeedRpm > prev.spindleSpeedRpm
    return {
      whatChanged: `You dialed spindle speed ${isHigher ? 'up' : 'down'} to ${current.spindleSpeedRpm} RPM.`,
      whatHappened: `Surface speed shifted to ${curAnalysis.cuttingSpeedMpm} m/min and table feed to ${curAnalysis.tableFeedMmPerMin} mm/min (MRR = ${curAnalysis.materialRemovalRateCm3Min} cm³/min).`,
      why: 'Spindle RPM drives both tangential cutter surface speed and table traverse rate. Faster rotation shears chips more rapidly but raises tool friction temperature.',
    }
  }

  // 4. Feed per Tooth Change
  if (Math.abs(current.feedPerToothMm - prev.feedPerToothMm) >= 0.02) {
    const isHigher = current.feedPerToothMm > prev.feedPerToothMm
    return {
      whatChanged: `You ${isHigher ? 'increased' : 'reduced'} feed per tooth to ${current.feedPerToothMm} mm/tooth.`,
      whatHappened: `Surface roughness Ra became ${curAnalysis.surfaceRoughnessRaUm} µm while MRR shifted to ${curAnalysis.materialRemovalRateCm3Min} cm³/min.`,
      why: 'Surface finish roughness scales with the square of feed rate (Ra ∝ fz²). Lower feeds minimize scallop height, leaving a mirror-smooth finish.',
    }
  }

  // 5. Depth of Cut Change
  if (Math.abs(current.axialDepthMm - prev.axialDepthMm) >= 0.5) {
    const isDeeper = current.axialDepthMm > prev.axialDepthMm
    return {
      whatChanged: `You ${isDeeper ? 'increased' : 'reduced'} axial depth of cut (ap) to ${current.axialDepthMm} mm.`,
      whatHappened: `Material removal rate became ${curAnalysis.materialRemovalRateCm3Min} cm³/min and cutting power reached ${curAnalysis.spindlePowerKw} kW (${curAnalysis.spindleLoadPercent}% load).`,
      why: 'Deeper cuts shear a taller chip cross-section. Cutting force is directly proportional to depth of cut (Fc = kc · ap · fz), increasing spindle load.',
    }
  }

  // 6. Coolant Toggle
  if (current.coolantActive !== prev.coolantActive) {
    return {
      whatChanged: `You turned flood coolant ${current.coolantActive ? 'ON' : 'OFF'}.`,
      whatHappened: `Cutting zone temperature dropped to ~${curAnalysis.estimatedCuttingTempC} °C and surface roughness improved to ${curAnalysis.surfaceRoughnessRaUm} µm.`,
      why: 'High-pressure coolant flushes chips away from the shear zone, lubricates tool-chip contact, and halts built-up edge formation on cutting flutes.',
    }
  }

  // Default balanced overview
  return {
    whatChanged: `Operating at ${current.spindleSpeedRpm} RPM with ${current.feedPerToothMm} mm/tooth feed and ${current.axialDepthMm} mm depth of cut in ${curAnalysis.material.name}.`,
    whatHappened: `Removing material at ${curAnalysis.materialRemovalRateCm3Min} cm³/min with ${curAnalysis.spindlePowerKw} kW spindle power and ${curAnalysis.surfaceRoughnessRaUm} µm surface finish.`,
    why: 'Machining optimization is the classic engineering trade-off: aggressive feeds boost productivity (MRR), but elevate power consumption, tool wear, and surface roughness.',
  }
}

export const MANUFACTURING_EQUATIONS = [
  {
    title: 'Surface Cutting Speed (Peripheral Velocity)',
    formula: 'V_c = (π · D · N) / 1000',
    explanation:
      'The linear tangential speed at the outermost cutter flute. Dictates tool life and shear zone temperature according to the Taylor tool wear model.',
  },
  {
    title: 'Table Traverse Feed Rate (Linear Productivity)',
    formula: 'v_f = f_z · z · N',
    explanation:
      'The forward translation velocity of the CNC machine table, calculated from feed per tooth (fz), flute count (z), and spindle rotational speed (N).',
  },
  {
    title: 'Volumetric Material Removal Rate (MRR)',
    formula: 'MRR = (a_p · a_e · v_f) / 1000',
    explanation:
      'Measures the volume of solid stock evacuated per minute from axial depth (ap), radial engagement width (ae), and table feed velocity (vf).',
  },
  {
    title: 'Spindle Cutting Power & Specific Cutting Energy',
    formula: 'P_c = (F_c · V_c) / (60000 · η) = (k_c · a_p · f_z · V_c) / (60000 · η)',
    explanation:
      'Mechanical power demanded from the spindle motor. Scales with material specific cutting resistance (kc) and instantaneous chip cross-section.',
  },
  {
    title: 'Theoretical Surface Roughness (Scallop Peak-to-Valley)',
    formula: 'Ra = (f_z² / (32 · r_ε)) · 1000',
    explanation:
      'Arithmetic average roughness generated by tool nose radius cusps. Roughness scales with the square of feed rate (fz²); reducing feed dramatically polishes the machined texture.',
  },
]
