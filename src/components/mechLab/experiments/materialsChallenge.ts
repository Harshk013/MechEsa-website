// src/components/mechLab/experiments/materialsChallenge.ts
// Level progression, mission objectives, and evaluation logic for Materials Flagship Experience

import type { LabChallenge, ChallengeEvaluation } from '../../../data/mechLabTypes'
import {
  calculateMaterialsAnalysis,
  type SpecimenParams,
  SPECIMEN_LIMITS,
} from './materialsModel.ts'

export const MATERIALS_LEVELS = [
  {
    levelNumber: 1,
    levelTitle: 'Stay Elastic',
    objective: 'Engineer a specimen that carries at least a 25 kN tensile service load with Factor of Safety FoS ≥ 1.25 without yielding.',
    targetCriteria: 'FoS ≥ 1.25 under applied load F ≥ 25.0 kN',
    hint: 'If the specimen yields (FoS < 1.0) or is critical, widen or thicken the gauge section to lower stress, or choose structural steel or titanium.',
  },
  {
    levelNumber: 2,
    levelTitle: 'Design for Safety',
    objective: 'Achieve a robust structural safety margin FoS ≥ 2.00 under a severe 40 kN tensile load while keeping elongation ΔL ≤ 0.50 mm.',
    targetCriteria: 'FoS ≥ 2.00 AND ΔL ≤ 0.50 mm under F ≥ 40.0 kN',
    hint: 'Carrying 40 kN with FoS ≥ 2.0 requires keeping normal stress under half the yield limit. Try Grade 5 Titanium or Carbon Composite with a stout cross-section.',
  },
  {
    levelNumber: 3,
    levelTitle: 'Lightweight but Safe',
    objective: 'Aerospace weight optimization: support 35 kN with FoS ≥ 1.50, elongation ΔL ≤ 0.30 mm, and total specimen mass ≤ 0.180 kg.',
    targetCriteria: 'FoS ≥ 1.50 AND ΔL ≤ 0.30 mm AND Mass ≤ 0.180 kg under F ≥ 35.0 kN',
    hint: 'Steel is stiff but dense. Carbon Fiber Composite and Titanium offer high strength and modulus with low density. Trim unnecessary gauge length to minimize mass.',
  },
]

export const MATERIALS_FLAGSHIP_CHALLENGE: LabChallenge<SpecimenParams, any> = {
  id: 'materials-tensile-optimization',
  systemId: 'materials',
  title: 'TENSILE SPECIMEN OPTIMIZATION',
  description:
    'Select engineering materials, tune cross-sectional dimensions and gauge length to balance tensile load capacity, elongation stiffness, and mass efficiency.',
  hint: 'Normal stress is force over area (σ = F / A). Thicker specimens lower stress, while materials with high Young’s Modulus (E) resist elongation.',
  defaultParams: {
    appliedLoadKn: SPECIMEN_LIMITS.appliedLoadKn.default,
    gaugeWidthMm: SPECIMEN_LIMITS.gaugeWidthMm.default,
    gaugeThicknessMm: SPECIMEN_LIMITS.gaugeThicknessMm.default,
    gaugeLengthMm: SPECIMEN_LIMITS.gaugeLengthMm.default,
    materialId: 'structural_steel',
  },
  targets: [
    {
      id: 'mat-fos',
      label: 'Factor of Safety',
      targetDisplay: '≥ 1.25',
      isMet: (params: SpecimenParams) => {
        const analysis = calculateMaterialsAnalysis(params)
        return analysis.factorOfSafety >= 1.25
      },
      currentDisplay: (params: SpecimenParams) => {
        const analysis = calculateMaterialsAnalysis(params)
        return analysis.factorOfSafety.toFixed(2)
      },
    },
    {
      id: 'mat-load',
      label: 'Applied Load',
      targetDisplay: '≥ 25.0 kN',
      isMet: (params: SpecimenParams) => (params?.appliedLoadKn ?? 0) >= 25.0,
      currentDisplay: (params: SpecimenParams) => `${(params?.appliedLoadKn ?? 0).toFixed(1)} kN`,
    },
  ],
  evaluate: (params: SpecimenParams, _result: any, level = 1): ChallengeEvaluation => {
    // Graceful fallback for empty object in automated suite
    const safeParams: SpecimenParams = {
      appliedLoadKn: params?.appliedLoadKn ?? SPECIMEN_LIMITS.appliedLoadKn.default,
      gaugeWidthMm: params?.gaugeWidthMm ?? SPECIMEN_LIMITS.gaugeWidthMm.default,
      gaugeThicknessMm: params?.gaugeThicknessMm ?? SPECIMEN_LIMITS.gaugeThicknessMm.default,
      gaugeLengthMm: params?.gaugeLengthMm ?? SPECIMEN_LIMITS.gaugeLengthMm.default,
      materialId: params?.materialId ?? 'structural_steel',
    }

    const analysis = calculateMaterialsAnalysis(safeParams)

    // Level 1: Stay Elastic (F >= 25.0 kN, FoS >= 1.25, not yielded)
    if (level === 1) {
      const minLoad = 25.0
      const targetFos = 1.25

      if (safeParams.appliedLoadKn < minLoad) {
        return {
          isPassed: false,
          status: 'TEST LOAD TOO LOW',
          feedbackMessage: `Increase applied tension to at least 25.0 kN to verify the specimen under the full Level 1 design load (currently ${safeParams.appliedLoadKn.toFixed(1)} kN).`,
          engineeringInsight: 'Tensile verification requires evaluating the structure under the specified maximum operational service force.',
        }
      }

      if (analysis.isRuptured) {
        return {
          isPassed: false,
          status: 'TENSILE RUPTURE ✕',
          feedbackMessage: `The specimen ruptured! Normal tensile stress (${analysis.normalStressMpa.toFixed(0)} MPa) exceeded the ultimate tensile strength (${analysis.material.ultimateTensileStrengthMpa} MPa).`,
          engineeringInsight: 'Increase gauge cross-section (width × thickness) or choose an alloy with higher tensile strength.',
        }
      }

      if (analysis.isYielded) {
        return {
          isPassed: false,
          status: 'PLASTIC YIELDING ⚠',
          feedbackMessage: `The specimen yielded! Tensile stress (${analysis.normalStressMpa.toFixed(0)} MPa) crossed the material yield threshold (${analysis.material.yieldStrengthMpa} MPa). FoS is ${analysis.factorOfSafety.toFixed(2)} (needs ≥ ${targetFos}).`,
          engineeringInsight: 'Permanent plastic deformation has occurred. Increase gauge cross-sectional area to lower the stress.',
        }
      }

      if (analysis.factorOfSafety >= targetFos) {
        return {
          isPassed: true,
          status: 'TARGET REACHED ✓',
          feedbackMessage: `TARGET REACHED ✓ — Specimen safely sustains ${safeParams.appliedLoadKn.toFixed(1)} kN tension in the elastic zone with FoS = ${analysis.factorOfSafety.toFixed(2)} (≥ ${targetFos})!`,
          engineeringInsight: `With cross-section ${safeParams.gaugeWidthMm} mm × ${safeParams.gaugeThicknessMm} mm (${analysis.crossSectionAreaMm2} mm²), normal stress is ${analysis.normalStressMpa.toFixed(0)} MPa, safely below the ${analysis.material.yieldStrengthMpa} MPa yield limit.`,
        }
      }

      return {
        isPassed: false,
        status: 'CRITICAL SAFETY MARGIN',
        feedbackMessage: `FoS is ${analysis.factorOfSafety.toFixed(2)}, which is below the safe threshold of ${targetFos}. Thicken the gauge section or choose a stronger material.`,
        engineeringInsight: 'A safety factor of at least 1.25 prevents unexpected yielding caused by slight material variances or shock tension.',
      }
    }

    // Level 2: Design for Safety (F >= 40.0 kN, FoS >= 2.00, Elongation <= 0.50 mm)
    if (level === 2) {
      const minLoad = 40.0
      const targetFos = 2.0
      const maxElongation = 0.5

      if (safeParams.appliedLoadKn < minLoad) {
        return {
          isPassed: false,
          status: 'TEST LOAD TOO LOW',
          feedbackMessage: `Dial tensile force to at least 40.0 kN to evaluate under severe service conditions (currently ${safeParams.appliedLoadKn.toFixed(1)} kN).`,
          engineeringInsight: 'Structural safety margins must be validated against peak severe loading.',
        }
      }

      if (analysis.isYielded) {
        return {
          isPassed: false,
          status: 'PLASTIC YIELDING ⚠',
          feedbackMessage: `The specimen yielded under 40 kN (FoS = ${analysis.factorOfSafety.toFixed(2)}). It needs higher tensile resistance.`,
          engineeringInsight: 'Select a high yield strength material such as Grade 5 Titanium or increase gauge width.',
        }
      }

      const fosPassed = analysis.factorOfSafety >= targetFos
      const elongationPassed = analysis.elongationMm <= maxElongation

      if (fosPassed && elongationPassed) {
        return {
          isPassed: true,
          status: 'TARGET REACHED ✓',
          feedbackMessage: `TARGET REACHED ✓ — Exceptional tensile engineering! FoS is ${analysis.factorOfSafety.toFixed(2)} and elongation is only ${analysis.elongationMm.toFixed(3)} mm (≤ ${maxElongation} mm).`,
          engineeringInsight: `Using ${analysis.material.name} provides a robust elastic buffer, holding normal stress to only ${analysis.normalStressMpa.toFixed(0)} MPa under 40 kN load.`,
        }
      }

      if (!fosPassed) {
        return {
          isPassed: false,
          status: 'SAFETY MARGIN LOW',
          feedbackMessage: `Factor of Safety is ${analysis.factorOfSafety.toFixed(2)} (needs ≥ ${targetFos}). Widen or thicken the gauge section, or switch to Titanium Ti-6Al-4V.`,
          engineeringInsight: 'High-safety industrial applications mandate an operating stress below 50% of the yield threshold.',
        }
      }

      return {
        isPassed: false,
        status: 'EXCESSIVE ELONGATION',
        feedbackMessage: `FoS is adequate (${analysis.factorOfSafety.toFixed(2)}), but specimen elongation is ${analysis.elongationMm.toFixed(3)} mm (exceeds ${maxElongation} mm limit). Choose a stiffer material with higher Young’s Modulus (E) or shorten the gauge length.`,
        engineeringInsight: 'Elastic stiffness is governed by Young’s Modulus E. Stiffer materials stretch less under identical stress.',
      }
    }

    // Level 3: Lightweight but Safe (F >= 35.0 kN, FoS >= 1.50, Elongation <= 0.30 mm, Mass <= 0.180 kg)
    if (level === 3) {
      const minLoad = 35.0
      const targetFos = 1.5
      const maxElongation = 0.3
      const maxMass = 0.18

      if (safeParams.appliedLoadKn < minLoad) {
        return {
          isPassed: false,
          status: 'TEST LOAD TOO LOW',
          feedbackMessage: `Set applied load to at least 35.0 kN to test under aerospace mission tension (currently ${safeParams.appliedLoadKn.toFixed(1)} kN).`,
          engineeringInsight: 'Full aerospace qualification requires testing at the 35 kN limit load.',
        }
      }

      if (analysis.isYielded) {
        return {
          isPassed: false,
          status: 'PLASTIC YIELDING ⚠',
          feedbackMessage: `The specimen yielded under 35 kN tension (FoS = ${analysis.factorOfSafety.toFixed(2)}).`,
          engineeringInsight: 'Switch to Carbon Fiber Composite or Titanium to drastically boost yield strength.',
        }
      }

      const fosPassed = analysis.factorOfSafety >= targetFos
      const elongationPassed = analysis.elongationMm <= maxElongation
      const massPassed = analysis.specimenMassKg <= maxMass

      if (fosPassed && elongationPassed && massPassed) {
        return {
          isPassed: true,
          status: 'TARGET REACHED ✓',
          feedbackMessage: `TARGET REACHED ✓ — Master Materials Engineer achieved! FoS = ${analysis.factorOfSafety.toFixed(2)} (≥ ${targetFos}), Elongation = ${analysis.elongationMm.toFixed(3)} mm (≤ ${maxElongation} mm), and Mass = ${analysis.specimenMassKg.toFixed(3)} kg (≤ ${maxMass} kg)!`,
          engineeringInsight: `You balanced the specific stiffness (E/ρ) and specific strength (σ_y/ρ) of ${analysis.material.name} to engineer an ultra-lean flight-ready tensile tie-rod.`,
        }
      }

      if (!fosPassed) {
        return {
          isPassed: false,
          status: 'SAFETY MARGIN LOW',
          feedbackMessage: `FoS is ${analysis.factorOfSafety.toFixed(2)} (needs ≥ ${targetFos}). Widen cross-section or use a stronger material.`,
          engineeringInsight: 'Aerospace structural ties require a 1.50 safety margin against yield.',
        }
      }

      if (!elongationPassed) {
        return {
          isPassed: false,
          status: 'ELONGATION TOO HIGH',
          feedbackMessage: `Elongation is ${analysis.elongationMm.toFixed(3)} mm (exceeds ${maxElongation} mm limit). Shorten the gauge length or pick a material with higher Young’s Modulus.`,
          engineeringInsight: 'Elongation scales directly with initial gauge length L₀ (ΔL = ε · L₀).',
        }
      }

      return {
        isPassed: false,
        status: 'SPECIMEN TOO HEAVY',
        feedbackMessage: `Strength and stiffness criteria are met, but specimen mass is ${analysis.specimenMassKg.toFixed(3)} kg (exceeds ${maxMass} kg limit). Switch from steel to carbon fiber or titanium, and trim cross-section.`,
        engineeringInsight: 'Steel’s high density (7850 kg/m³) penalizes flight structures. Lightweight alloys provide equal strength at a fraction of the mass.',
      }
    }

    return {
      isPassed: false,
      status: 'NOT QUITE',
      feedbackMessage: 'Adjust tensile parameters to satisfy mission requirements.',
    }
  },
}
