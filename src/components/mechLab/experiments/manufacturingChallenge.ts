// src/components/mechLab/experiments/manufacturingChallenge.ts
// Mission definitions, level progression, and evaluation logic for Manufacturing Flagship Experience

import type { LabChallenge, ChallengeEvaluation } from '../../../data/mechLabTypes'
import {
  calculateManufacturingAnalysis,
  type ManufacturingParams,
  MANUFACTURING_LIMITS,
  DEFAULT_MANUFACTURING_PARAMS,
} from './manufacturingModel.ts'

export const MANUFACTURING_LEVELS = [
  {
    levelNumber: 1,
    levelTitle: 'Control the Cut',
    objective:
      'Execute a high-volume roughing pass achieving Material Removal Rate MRR ≥ 25.0 cm³/min while keeping Spindle Power Pc ≤ 4.50 kW without motor overload.',
    targetCriteria: 'MRR ≥ 25.0 cm³/min AND Spindle Power Pc ≤ 4.50 kW',
    hint: 'Aluminum 6061 has low cutting resistance (kc = 700 N/mm²). Use a 4-flute end mill, set axial depth ap ≥ 2.0 mm and spindle speed ≥ 2200 RPM to hit 25 cm³/min while keeping power under 4.5 kW.',
  },
  {
    levelNumber: 2,
    levelTitle: 'Precision Finishing',
    objective:
      'Execute an aerospace finishing pass achieving mirror surface finish Ra ≤ 1.20 µm while maintaining production throughput with MRR ≥ 10.0 cm³/min and Pc ≤ 3.50 kW.',
    targetCriteria: 'Surface Roughness Ra ≤ 1.20 µm AND MRR ≥ 10.0 cm³/min AND Pc ≤ 3.50 kW',
    hint: 'Surface roughness scales quadratically with feed per tooth (Ra ∝ fz²). Reduce feed to ~0.04–0.06 mm/tooth, boost spindle RPM to ~3000+, and ensure flood coolant is active.',
  },
  {
    levelNumber: 3,
    levelTitle: 'High-Performance Machining',
    objective:
      'Maximize production in structural steel (AISI 1018): achieve MRR ≥ 28.0 cm³/min, surface roughness Ra ≤ 1.80 µm, and Spindle Load ≤ 85% (Pc ≤ 6.37 kW).',
    targetCriteria: 'MRR ≥ 28.0 cm³/min AND Ra ≤ 1.80 µm AND Spindle Load ≤ 85% (Steel 1018)',
    hint: 'AISI 1018 steel has high cutting resistance (kc = 1750 N/mm²). Balance spindle speed around 1800–2400 RPM with moderate feed (0.07–0.09 mm/tooth) and solid depth of cut (2.0–2.5 mm). Keep coolant ON to control thermal load.',
  },
]

export const MANUFACTURING_FLAGSHIP_CHALLENGE: LabChallenge<ManufacturingParams, any> = {
  id: 'manufacturing-process-optimization',
  systemId: 'manufacturing',
  title: 'CNC MACHINING PROCESS OPTIMIZATION',
  description:
    'Optimize spindle speed, feed per tooth, depth of cut, and tooling to balance volumetric material removal rate against spindle power consumption and precision surface roughness.',
  hint: 'Material removal rate (MRR) dictates production throughput, while surface roughness (Ra) governs part quality. Tune parameters to satisfy both constraints without overloading the spindle.',
  defaultParams: DEFAULT_MANUFACTURING_PARAMS,
  targets: [
    {
      id: 'mfg-mrr',
      label: 'Material Removal Rate',
      targetDisplay: '≥ 25.0 cm³/min',
      isMet: (params: ManufacturingParams) => {
        const analysis = calculateManufacturingAnalysis(params)
        return analysis.materialRemovalRateCm3Min >= 25.0
      },
      currentDisplay: (params: ManufacturingParams) => {
        const analysis = calculateManufacturingAnalysis(params)
        return `${analysis.materialRemovalRateCm3Min.toFixed(1)} cm³/min`
      },
    },
    {
      id: 'mfg-power',
      label: 'Spindle Power',
      targetDisplay: '≤ 4.50 kW',
      isMet: (params: ManufacturingParams) => {
        const analysis = calculateManufacturingAnalysis(params)
        return analysis.spindlePowerKw <= 4.5 && !analysis.isOverloaded
      },
      currentDisplay: (params: ManufacturingParams) => {
        const analysis = calculateManufacturingAnalysis(params)
        return `${analysis.spindlePowerKw.toFixed(2)} kW`
      },
    },
  ],
  evaluate: (params: Partial<ManufacturingParams>, _result: any, level = 1): ChallengeEvaluation => {
    // Graceful fallback for empty object in automated suite
    const safeParams: ManufacturingParams = {
      spindleSpeedRpm: params?.spindleSpeedRpm ?? MANUFACTURING_LIMITS.spindleSpeedRpm.default,
      feedPerToothMm: params?.feedPerToothMm ?? MANUFACTURING_LIMITS.feedPerToothMm.default,
      axialDepthMm: params?.axialDepthMm ?? MANUFACTURING_LIMITS.axialDepthMm.default,
      radialWidthMm: params?.radialWidthMm ?? MANUFACTURING_LIMITS.radialWidthMm.default,
      materialId: params?.materialId ?? 'aluminum_6061',
      toolId: params?.toolId ?? 'carbide_endmill_4f',
      coolantActive: params?.coolantActive ?? true,
    }

    const analysis = calculateManufacturingAnalysis(safeParams)

    // ── LEVEL 1: CONTROL THE CUT (MRR >= 25 cm³/min, Pc <= 4.5 kW, no overload) ──
    if (level === 1) {
      const minMrr = 25.0
      const maxPower = 4.5

      if (analysis.isOverloaded) {
        return {
          isPassed: false,
          status: 'SPINDLE OVERLOAD',
          feedbackMessage: `Spindle overloaded at ${analysis.spindlePowerKw.toFixed(2)} kW! Reduce axial depth of cut (ap) or feed per tooth (fz) to relieve the motor.`,
          engineeringInsight: 'Cutting power scales with material removal rate: Pc = (Fc · Vc) / (60000 · η).',
        }
      }

      if (analysis.materialRemovalRateCm3Min < minMrr) {
        return {
          isPassed: false,
          status: 'MRR TOO LOW',
          feedbackMessage: `Current removal rate is ${analysis.materialRemovalRateCm3Min.toFixed(1)} cm³/min (target ≥ ${minMrr.toFixed(1)} cm³/min). Increase feed rate, depth, or spindle RPM.`,
          engineeringInsight: 'Roughing passes prioritize volumetric chip evacuation to minimize cycle time.',
        }
      }

      if (analysis.spindlePowerKw > maxPower) {
        return {
          isPassed: false,
          status: 'POWER EXCEEDED',
          feedbackMessage: `Cutting power is ${analysis.spindlePowerKw.toFixed(2)} kW (target ≤ ${maxPower.toFixed(2)} kW). Try switching to Aluminum 6061 or trimming depth of cut slightly.`,
          engineeringInsight: 'High specific cutting resistance (kc) draws excessive torque from the machine spindle.',
        }
      }

      return {
        isPassed: true,
        status: 'TARGET REACHED ✓',
        feedbackMessage: `Optimal roughing achieved! MRR is ${analysis.materialRemovalRateCm3Min.toFixed(1)} cm³/min drawing only ${analysis.spindlePowerKw.toFixed(2)} kW spindle power (${analysis.spindleLoadPercent}% load).`,
        engineeringInsight: 'Operating inside the machine power envelope prevents premature motor thermal trips and cutter chipping.',
      }
    }

    // ── LEVEL 2: PRECISION FINISHING (Ra <= 1.20 µm, MRR >= 10.0 cm³/min, Pc <= 3.5 kW) ──
    if (level === 2) {
      const maxRa = 1.20
      const minMrr = 10.0
      const maxPower = 3.5

      if (analysis.surfaceRoughnessRaUm > maxRa) {
        return {
          isPassed: false,
          status: 'SURFACE TOO ROUGH',
          feedbackMessage: `Surface finish Ra is ${analysis.surfaceRoughnessRaUm.toFixed(2)} µm (target ≤ ${maxRa.toFixed(2)} µm). Reduce feed per tooth (fz) to under 0.06 mm/tooth and enable coolant.`,
          engineeringInsight: 'Theoretical cusp roughness scales quadratically with feed: Ra ≈ fz² / (32 · rε).',
        }
      }

      if (analysis.materialRemovalRateCm3Min < minMrr) {
        return {
          isPassed: false,
          status: 'FEED TOO SLOW',
          feedbackMessage: `Surface finish is excellent (${analysis.surfaceRoughnessRaUm.toFixed(2)} µm), but MRR is only ${analysis.materialRemovalRateCm3Min.toFixed(1)} cm³/min (target ≥ ${minMrr.toFixed(1)} cm³/min). Increase spindle RPM to maintain table speed.`,
          engineeringInsight: 'High-speed machining (HSM) couples fast spindle rotation with low chip load for efficient finishing.',
        }
      }

      if (analysis.spindlePowerKw > maxPower) {
        return {
          isPassed: false,
          status: 'POWER EXCEEDED',
          feedbackMessage: `Finishing power draw is ${analysis.spindlePowerKw.toFixed(2)} kW (target ≤ ${maxPower.toFixed(2)} kW). Reduce radial width (ae) or axial depth (ap).`,
          engineeringInsight: 'Finishing cuts require light depth of cut to minimize cutter deflection and chatter.',
        }
      }

      return {
        isPassed: true,
        status: 'TARGET REACHED ✓',
        feedbackMessage: `Precision finish achieved! Surface roughness Ra is ${analysis.surfaceRoughnessRaUm.toFixed(2)} µm with productive MRR of ${analysis.materialRemovalRateCm3Min.toFixed(1)} cm³/min.`,
        engineeringInsight: 'Low feed per tooth combined with high peripheral speed and flood cooling prevents built-up edge formation.',
      }
    }

    // ── LEVEL 3: HIGH-PERFORMANCE MACHINING (Steel 1018, MRR >= 28.0 cm³/min, Ra <= 1.80 µm, Load <= 85%) ──
    const targetMaterial = 'mild_steel_1018'
    const minMrr = 28.0
    const maxRa = 1.80
    const maxLoad = 85.0

    if (safeParams.materialId !== targetMaterial) {
      return {
        isPassed: false,
        status: 'WRONG WORKPIECE',
        feedbackMessage: 'Level 3 requires qualifying the machining parameters on AISI 1018 Low-Carbon Steel.',
        engineeringInsight: 'Harder ferrous steels present challenging specific cutting force (kc = 1750 N/mm²).',
      }
    }

    if (analysis.materialRemovalRateCm3Min < minMrr) {
      return {
        isPassed: false,
        status: 'MRR TOO LOW',
        feedbackMessage: `Removal rate in steel is ${analysis.materialRemovalRateCm3Min.toFixed(1)} cm³/min (target ≥ ${minMrr.toFixed(1)} cm³/min). Increase axial depth (ap) or feed per tooth (fz).`,
        engineeringInsight: 'Production machining targets high throughput while respecting insert wear limits.',
      }
    }

    if (analysis.surfaceRoughnessRaUm > maxRa) {
      return {
        isPassed: false,
        status: 'SURFACE TOO ROUGH',
        feedbackMessage: `Surface finish in steel is ${analysis.surfaceRoughnessRaUm.toFixed(2)} µm (target ≤ ${maxRa.toFixed(2)} µm). Moderate the feed per tooth to under 0.08 mm/tooth and verify coolant is active.`,
        engineeringInsight: 'Continuous chips in mild steel can mar the finished surface without active chip flushing.',
      }
    }

    if (analysis.spindleLoadPercent > maxLoad) {
      return {
        isPassed: false,
        status: 'SPINDLE OVERLOADED',
        feedbackMessage: `Spindle load is ${analysis.spindleLoadPercent.toFixed(1)}% (${analysis.spindlePowerKw.toFixed(2)} kW), exceeding 85% motor threshold. Reduce radial engagement or depth of cut.`,
        engineeringInsight: 'Continuous machine operation should stay below 85% of motor nameplate power to prevent thermal derating.',
      }
    }

    return {
      isPassed: true,
      status: 'TARGET REACHED ✓',
      feedbackMessage: `Process mastered! Achieved ${analysis.materialRemovalRateCm3Min.toFixed(1)} cm³/min in AISI 1018 steel with Ra = ${analysis.surfaceRoughnessRaUm.toFixed(2)} µm at ${analysis.spindleLoadPercent.toFixed(1)}% spindle load.`,
      engineeringInsight: 'You successfully balanced cutting speed, chip thickness, and spindle power across tough ferrous alloy.',
    }
  },
}
