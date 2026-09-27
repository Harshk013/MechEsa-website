// src/components/mechLab/experiments/designChallenge.ts
// Mission definitions, level progression, and evaluation logic for Design / CAD Beam Engineering

import type { LabChallenge, ChallengeEvaluation } from '../../../data/mechLabTypes'
import {
  calculateBeamAnalysis,
  type BeamParams,
  BEAM_LIMITS,
} from './designModel.ts'

export const DESIGN_LEVELS = [
  {
    levelNumber: 1,
    levelTitle: 'Survive the Load',
    objective: 'Design a beam that carries a 15 kN load with a Factor of Safety FoS ≥ 1.50 without yielding.',
    targetCriteria: 'Factor of Safety FoS ≥ 1.50 under 15 kN',
    hint: 'If the beam fails (FoS < 1.0) or is critical, increase the beam height (h) to dramatically raise bending strength, or choose structural steel.',
  },
  {
    levelNumber: 2,
    levelTitle: 'Lightweight Structure',
    objective: 'Support 20 kN load with FoS ≥ 1.50 while minimizing total beam mass to under 38.0 kg.',
    targetCriteria: 'FoS ≥ 1.50 AND Mass ≤ 38.0 kg under 20 kN',
    hint: 'Steel is strong but heavy. Try 6061-T6 Aluminum or Carbon Fiber Composite, and optimize cross-section height rather than width.',
  },
  {
    levelNumber: 3,
    levelTitle: 'Precision Stiffness',
    objective: 'Support 25 kN with FoS ≥ 2.00, tip deflection ≤ 3.5 mm, and mass ≤ 55.0 kg.',
    targetCriteria: 'FoS ≥ 2.00 AND Deflection ≤ 3.5 mm AND Mass ≤ 55.0 kg',
    hint: 'Deflection depends on E·I. Use a high-modulus material (Carbon Fiber or Steel), maximize height for moment of inertia, and trim unnecessary span length.',
  },
]

export const DESIGN_FLAGSHIP_CHALLENGE: LabChallenge<BeamParams, any> = {
  id: 'design-beam-optimization',
  systemId: 'design',
  title: 'STRUCTURAL BEAM OPTIMIZATION',
  description:
    'Optimize beam length, cross-sectional width and height, and material selection to balance load capacity, mass efficiency, and deflection limits.',
  hint: 'Remember that bending stiffness scales with the cube of height (h³). A tall, narrow beam is far lighter and stiffer than a wide, flat beam.',
  defaultParams: {
    lengthM: BEAM_LIMITS.lengthM.default,
    widthMm: BEAM_LIMITS.widthMm.default,
    heightMm: BEAM_LIMITS.heightMm.default,
    loadKn: BEAM_LIMITS.loadKn.default,
    materialId: 'steel',
  },
  targets: [
    {
      id: 'target-fos',
      label: 'Factor of Safety',
      targetDisplay: '≥ 1.50',
      isMet: (params: BeamParams) => {
        const analysis = calculateBeamAnalysis(params)
        return analysis.factorOfSafety >= 1.50
      },
      currentDisplay: (params: BeamParams) => {
        const analysis = calculateBeamAnalysis(params)
        return analysis.factorOfSafety.toFixed(2)
      },
    },
    {
      id: 'target-mass',
      label: 'Beam Mass',
      targetDisplay: '≤ 38.0 kg',
      isMet: (params: BeamParams) => {
        const analysis = calculateBeamAnalysis(params)
        return analysis.massKg <= 38.0
      },
      currentDisplay: (params: BeamParams) => {
        const analysis = calculateBeamAnalysis(params)
        return `${analysis.massKg.toFixed(1)} kg`
      },
    },
  ],
  evaluate: (params: BeamParams, _result: any, level = 1): ChallengeEvaluation => {
    const analysis = calculateBeamAnalysis(params)

    // Level 1: Strength under 15 kN
    if (level === 1) {
      const targetFos = 1.50
      if (params.loadKn < 15) {
        return {
          isPassed: false,
          status: 'TEST LOAD TOO LOW',
          feedbackMessage: `Set applied load to at least 15 kN to test under mission conditions (currently ${params.loadKn} kN).`,
          engineeringInsight: 'Structural designs must be evaluated under the full specified service load.',
        }
      }

      if (analysis.isFailed) {
        return {
          isPassed: false,
          status: 'PLASTIC YIELD FAILURE',
          feedbackMessage: `The beam failed! Max bending stress (${analysis.maxBendingStressMpa.toFixed(0)} MPa) exceeded material yield strength (${analysis.material.yieldStrengthMpa} MPa). FoS is ${analysis.factorOfSafety.toFixed(2)} (needs ≥ ${targetFos}).`,
          engineeringInsight: 'Increase the beam height (h) to increase section modulus Z, reducing peak surface stress.',
        }
      }

      if (analysis.factorOfSafety >= targetFos) {
        return {
          isPassed: true,
          status: 'TARGET REACHED ✓',
          feedbackMessage: `TARGET REACHED ✓ — Beam successfully supports ${params.loadKn} kN with FoS = ${analysis.factorOfSafety.toFixed(2)} (≥ ${targetFos})!`,
          engineeringInsight: `With cross-section ${params.widthMm}mm × ${params.heightMm}mm, the beam maintains a safe elastic buffer against failure.`,
        }
      }

      return {
        isPassed: false,
        status: 'CRITICAL SAFETY MARGIN',
        feedbackMessage: `FoS is ${analysis.factorOfSafety.toFixed(2)}, which is below the safe threshold of ${targetFos}. Make the cross-section taller or pick a stronger material.`,
        engineeringInsight: 'A safety margin of at least 1.50 guards against unexpected shock loads and fatigue.',
      }
    }

    // Level 2: Strength + Mass Limit (FoS >= 1.50, Mass <= 38.0 kg under 20 kN)
    if (level === 2) {
      const targetFos = 1.50
      const targetMass = 38.0

      if (params.loadKn < 20) {
        return {
          isPassed: false,
          status: 'TEST LOAD TOO LOW',
          feedbackMessage: `Set applied load to at least 20 kN to evaluate Level 2 service loading (currently ${params.loadKn} kN).`,
          engineeringInsight: 'Test under the full 20 kN mission requirement.',
        }
      }

      if (analysis.isFailed) {
        return {
          isPassed: false,
          status: 'PLASTIC YIELD FAILURE',
          feedbackMessage: `The beam failed under 20 kN (FoS = ${analysis.factorOfSafety.toFixed(2)}). It needs higher bending resistance.`,
          engineeringInsight: 'Use a material with higher yield strength or increase height.',
        }
      }

      const fosPassed = analysis.factorOfSafety >= targetFos
      const massPassed = analysis.massKg <= targetMass

      if (fosPassed && massPassed) {
        return {
          isPassed: true,
          status: 'TARGET REACHED ✓',
          feedbackMessage: `TARGET REACHED ✓ — Excellent structural efficiency! FoS is ${analysis.factorOfSafety.toFixed(2)} and mass is only ${analysis.massKg.toFixed(1)} kg (target was ≤ ${targetMass} kg).`,
          engineeringInsight: `By using ${analysis.material.name} and tailoring geometry, you minimized dead weight while maintaining load strength.`,
        }
      }

      if (!fosPassed) {
        return {
          isPassed: false,
          status: 'INSUFFICIENT STRENGTH',
          feedbackMessage: `FoS is ${analysis.factorOfSafety.toFixed(2)} (needs ≥ ${targetFos}). Mass is ${analysis.massKg.toFixed(1)} kg. Increase height (h) to gain strength efficiently without adding excessive mass.`,
          engineeringInsight: 'Height increases strength by h², while mass only increases linearly with h.',
        }
      }

      return {
        isPassed: false,
        status: 'STRUCTURE TOO HEAVY',
        feedbackMessage: `Strength is adequate (FoS = ${analysis.factorOfSafety.toFixed(2)}), but beam mass is ${analysis.massKg.toFixed(1)} kg (exceeds ${targetMass} kg limit). Try aluminum or carbon fiber, or reduce beam width.`,
        engineeringInsight: 'Material density dominates total mass. Lighter alloys enable leaner structures.',
      }
    }

    // Level 3: Precision Stiffness (FoS >= 2.00, Deflection <= 3.5 mm, Mass <= 55.0 kg under 25 kN)
    if (level === 3) {
      const targetFos = 2.00
      const targetDeflection = 3.5
      const targetMass = 55.0

      if (params.loadKn < 25) {
        return {
          isPassed: false,
          status: 'TEST LOAD TOO LOW',
          feedbackMessage: `Set applied load to at least 25 kN to test precision stiffness under design load (currently ${params.loadKn} kN).`,
          engineeringInsight: 'Full structural verification requires the 25 kN service load.',
        }
      }

      if (analysis.isFailed) {
        return {
          isPassed: false,
          status: 'PLASTIC YIELD FAILURE',
          feedbackMessage: `The beam yielded under 25 kN. FoS is ${analysis.factorOfSafety.toFixed(2)}.`,
          engineeringInsight: 'Increase cross-section dimensions or use carbon fiber / titanium.',
        }
      }

      const fosPassed = analysis.factorOfSafety >= targetFos
      const deflPassed = analysis.tipDeflectionMm <= targetDeflection
      const massPassed = analysis.massKg <= targetMass

      if (fosPassed && deflPassed && massPassed) {
        return {
          isPassed: true,
          status: 'TARGET REACHED ✓',
          feedbackMessage: `TARGET REACHED ✓ — Master CAD balance! FoS = ${analysis.factorOfSafety.toFixed(2)} (≥ ${targetFos}), Deflection = ${analysis.tipDeflectionMm.toFixed(1)} mm (≤ ${targetDeflection} mm), and Mass = ${analysis.massKg.toFixed(1)} kg (≤ ${targetMass} kg)!`,
          engineeringInsight: `You balanced the stiffness modulus E·I against density and stress limits to create an optimal aerospace-grade structure.`,
        }
      }

      if (!deflPassed) {
        return {
          isPassed: false,
          status: 'DEFLECTION TOO HIGH',
          feedbackMessage: `Tip deflection is ${analysis.tipDeflectionMm.toFixed(1)} mm (exceeds ${targetDeflection} mm limit). Increase beam height (h) to boost moment of inertia I, or use a stiffer material with higher E.`,
          engineeringInsight: 'Deflection scales with L³/I. Taller sections and shorter spans reduce flexural sag.',
        }
      }

      if (!fosPassed) {
        return {
          isPassed: false,
          status: 'SAFETY MARGIN LOW',
          feedbackMessage: `FoS is ${analysis.factorOfSafety.toFixed(2)} (needs ≥ ${targetFos}). Increase section depth or switch to higher yield strength alloy.`,
          engineeringInsight: 'A 2.0 safety factor is standard for precision instruments and structural bearings.',
        }
      }

      return {
        isPassed: false,
        status: 'MASS EXCEEDED',
        feedbackMessage: `Stiffness and strength are met, but beam mass is ${analysis.massKg.toFixed(1)} kg (limit is ${targetMass} kg). Narrow the width or use carbon fiber.`,
        engineeringInsight: 'Optimize the strength-to-weight ratio.',
      }
    }

    return {
      isPassed: false,
      status: 'NOT QUITE',
      feedbackMessage: 'Adjust beam parameters to satisfy mission requirements.',
    }
  },
}
