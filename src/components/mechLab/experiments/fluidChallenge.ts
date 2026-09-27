// src/components/mechLab/experiments/fluidChallenge.ts
// Challenge mission definitions, level progression, and evaluation logic for Fluid Mechanics

import type { LabChallenge, ChallengeEvaluation } from '../../../data/mechLabTypes'
import {
  calculateFluidState,
  type FluidParams,
  FLUID_PARAM_LIMITS,
} from './fluidModel'

export const FLUID_LEVELS = [
  {
    levelNumber: 1,
    levelTitle: 'Make it Fast',
    objective: 'Accelerate the water to reach at least 4.5 m/s through the throat.',
    targetCriteria: 'Throat Velocity V₂ ≥ 4.5 m/s',
    hint: 'Make the throat narrower or increase the pump flow rate so the water is forced to speed up.',
  },
  {
    levelNumber: 2,
    levelTitle: 'Find the Pressure Drop',
    objective: 'Generate a static pressure drop of at least 8.0 kPa between the inlet and throat.',
    targetCriteria: 'Pressure Drop ΔP ≥ 8.0 kPa',
    hint: 'A smaller throat creates a sharper velocity jump, which causes a large static pressure drop on the manometer.',
  },
  {
    levelNumber: 3,
    levelTitle: 'Flow Engineer',
    objective: 'Deliver at least 35 L/min flow while keeping pressure drop under 12.0 kPa to prevent cavitation.',
    targetCriteria: 'Flow Rate Q ≥ 35 L/min AND ΔP ≤ 12.0 kPa',
    hint: 'You need high flow, but narrowing the throat too much causes excessive pressure drop. Find the balanced throat size.',
  },
]

export const FLUID_FLAGSHIP_CHALLENGE: LabChallenge<FluidParams, any> = {
  id: 'fluid-venturi-flow',
  systemId: 'fluid',
  title: 'VENTURI FLOW BALANCING',
  description:
    'Modulate pump flow rate and throat diameter to control fluid velocity, static pressure drop, and manometer height across the Venturi constriction.',
  hint: 'Adjust the throat diameter to speed up or slow down the water. Observe how pressure responds opposite to speed.',
  defaultParams: {
    flowRate: FLUID_PARAM_LIMITS.flowRate.default,
    throatDiameter: FLUID_PARAM_LIMITS.throatDiameter.default,
  },
  targets: [
    {
      id: 'target-velocity',
      label: 'Throat Velocity (V₂)',
      targetDisplay: '≥ 4.5 m/s',
      isMet: (params: FluidParams) => {
        const state = calculateFluidState(params.flowRate, params.throatDiameter)
        return state.throat.velocity >= 4.5
      },
      currentDisplay: (params: FluidParams) => {
        const state = calculateFluidState(params.flowRate, params.throatDiameter)
        return `${state.throat.velocity.toFixed(2)} m/s`
      },
    },
    {
      id: 'target-pressure-drop',
      label: 'Pressure Drop (ΔP)',
      targetDisplay: '≥ 8.0 kPa',
      isMet: (params: FluidParams) => {
        const state = calculateFluidState(params.flowRate, params.throatDiameter)
        return state.pressureDropKpa >= 8.0
      },
      currentDisplay: (params: FluidParams) => {
        const state = calculateFluidState(params.flowRate, params.throatDiameter)
        return `${state.pressureDropKpa.toFixed(2)} kPa`
      },
    },
  ],
  evaluate: (params: FluidParams, _result: any, level = 1): ChallengeEvaluation => {
    const state = calculateFluidState(params.flowRate, params.throatDiameter)

    // Level 1: Velocity Target
    if (level === 1) {
      const targetV = 4.5
      const currentV = state.throat.velocity
      if (currentV >= targetV) {
        return {
          isPassed: true,
          status: 'TARGET REACHED ✓',
          feedbackMessage: `TARGET REACHED ✓ — Water is rushing through the throat at ${currentV.toFixed(2)} m/s (target was ≥ ${targetV} m/s)!`,
          engineeringInsight: `By narrowing the passage to ${params.throatDiameter} mm, velocity increased by a factor of ${(state.throat.velocity / state.inlet.velocity).toFixed(1)}× via Continuity (A₁V₁ = A₂V₂).`,
        }
      }
      const deficit = (targetV - currentV).toFixed(2)
      return {
        isPassed: false,
        status: 'NOT QUITE',
        feedbackMessage: `The throat velocity is currently ${currentV.toFixed(2)} m/s (needs +${deficit} m/s more). Try narrowing the throat or turning up the flow.`,
        engineeringInsight: 'Fluid must speed up when forced through a smaller cross-section.',
      }
    }

    // Level 2: Pressure Drop Target
    if (level === 2) {
      const targetDeltaP = 8.0
      const currentDeltaP = state.pressureDropKpa
      if (currentDeltaP >= targetDeltaP) {
        return {
          isPassed: true,
          status: 'TARGET REACHED ✓',
          feedbackMessage: `TARGET REACHED ✓ — Static pressure dropped by ${currentDeltaP.toFixed(2)} kPa, shifting the manometer by ${state.manometerDeltaH.toFixed(0)} mm!`,
          engineeringInsight: `Bernoulli's principle demonstrated: As kinetic energy surged (V = ${state.throat.velocity.toFixed(2)} m/s), static pressure dropped from ${state.inlet.staticPressure.toFixed(1)} kPa to ${state.throat.staticPressure.toFixed(1)} kPa.`,
        }
      }
      const deficit = (targetDeltaP - currentDeltaP).toFixed(2)
      return {
        isPassed: false,
        status: 'NOT QUITE',
        feedbackMessage: `Current pressure drop is ${currentDeltaP.toFixed(2)} kPa (needs ${deficit} kPa more). Narrow the throat further to induce a steeper pressure difference.`,
        engineeringInsight: 'Greater velocity contrast between inlet and throat yields a larger pressure drop.',
      }
    }

    // Level 3: Flow Engineer Trade-Off (High Flow with Safe Pressure Drop)
    const minFlow = 35
    const maxDeltaP = 12.0
    const flowOk = params.flowRate >= minFlow
    const deltaPOk = state.pressureDropKpa <= maxDeltaP

    if (flowOk && deltaPOk) {
      return {
        isPassed: true,
        status: 'TARGET REACHED ✓',
        feedbackMessage: `TARGET REACHED ✓ — Balanced flow achieved! Delivering ${params.flowRate} L/min with safe pressure drop (${state.pressureDropKpa.toFixed(2)} kPa ≤ 12.0 kPa).`,
        engineeringInsight: `You avoided cavitation risk while delivering high volumetric flow by selecting an optimal throat diameter (${params.throatDiameter} mm).`,
      }
    }

    if (!flowOk && !deltaPOk) {
      return {
        isPassed: false,
        status: 'NOT QUITE',
        feedbackMessage: `Flow rate is too low (${params.flowRate} L/min < 35 L/min) and pressure drop exceeds limit (${state.pressureDropKpa.toFixed(2)} kPa > 12.0 kPa). Open the throat and increase pump flow.`,
        engineeringInsight: 'Balance throat constriction against pump flow capacity.',
      }
    }

    if (!flowOk) {
      return {
        isPassed: false,
        status: 'NOT QUITE',
        feedbackMessage: `Pressure drop is within limit (${state.pressureDropKpa.toFixed(2)} kPa), but flow rate is only ${params.flowRate} L/min (target is ≥ 35 L/min). Increase the flow slider.`,
        engineeringInsight: 'Increase pump flow while keeping an eye on the pressure drop.',
      }
    }

    // deltaPOk is false: overpressure drop
    return {
      isPassed: false,
      status: 'PRESSURE DROP TOO HIGH',
      feedbackMessage: `Flow rate meets requirement (${params.flowRate} L/min), but pressure drop (${state.pressureDropKpa.toFixed(2)} kPa) exceeds the 12.0 kPa safe limit. Widen the throat slightly.`,
      engineeringInsight: 'Overly constricted throats create high pumping losses and cavitation danger.',
    }
  },
}
