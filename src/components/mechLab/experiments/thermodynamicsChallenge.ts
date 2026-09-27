import type {
  LabChallenge,
  ThermodynamicsCycleData,
} from '../../../data/mechLabTypes'
import type { ThermoParams } from './thermodynamicsModel.ts'
import { DEFAULT_THERMO_PARAMS } from './thermodynamicsModel.ts'

export interface ThermoChallengeLevel {
  levelNumber: number
  levelTitle: string
  objective: string
  hint: string
}

export const THERMODYNAMICS_LEVELS: ThermoChallengeLevel[] = [
  {
    levelNumber: 1,
    levelTitle: 'Fire Up the Engine',
    objective: 'Start the engine and watch it cycle through all four strokes.',
    hint: 'Hit "START ENGINE" to activate continuous reciprocating motion.',
  },
  {
    levelNumber: 2,
    levelTitle: 'Push for Efficiency',
    objective: 'Tune the engine parameters to achieve Thermal Efficiency ≥ 55.0%.',
    hint: 'Increase the compression ratio slider. More compression expands the power stroke.',
  },
  {
    levelNumber: 3,
    levelTitle: 'Master the Trade-off',
    objective: 'Reach at least 60% efficiency while keeping peak combustion pressure below 9,000 kPa (9.0 MPa).',
    hint: 'Higher compression boosts efficiency, but pushes peak pressure dangerously high. Counteract excess pressure by moderating heat added (Q_in).',
  },
]

export const THERMODYNAMICS_CHALLENGE: LabChallenge<ThermoParams, ThermodynamicsCycleData> = {
  id: 'thermo-engineer-the-engine',
  systemId: 'thermodynamics',
  title: 'ENGINEER THE ENGINE',
  description:
    'Reach at least 60.0% thermal efficiency while keeping peak combustion pressure below 9,000 kPa (9.0 MPa).',
  defaultParams: DEFAULT_THERMO_PARAMS,
  hint:
    'A higher compression ratio increases efficiency, but pushes peak pressure upward. Counteract excess cylinder stress by reducing heat input per cycle.',
  targets: [
    {
      id: 'target-efficiency',
      label: 'Thermal Efficiency (η_th)',
      targetDisplay: '≥ 60.0%',
      isMet: (_params, result) => result.efficiency >= 60.0,
      currentDisplay: (_params, result) => `${result.efficiency}%`,
    },
    {
      id: 'target-pressure',
      label: 'Peak Combustion Pressure (P₃)',
      targetDisplay: '≤ 9,000 kPa (9.0 MPa)',
      isMet: (_params, result) => result.peakPressure <= 9000,
      currentDisplay: (_params, result) => `${result.peakPressure.toLocaleString()} kPa (${(result.peakPressure / 1000).toFixed(1)} MPa)`,
    },
  ],
  evaluate: (params, result) => {
    const effMet = result.efficiency >= 60.0
    const pressMet = result.peakPressure <= 9000
    const isPassed = effMet && pressMet

    if (isPassed) {
      return {
        isPassed: true,
        status: 'TARGET ACHIEVED',
        feedbackMessage: `ENGINEERING CHALLENGE COMPLETE ✓ — You found a configuration that satisfies both constraints! At r = ${params.compressionRatio}:1 and Q_in = ${params.heatInput.toFixed(1)} kJ, efficiency is ${result.efficiency}% and peak pressure is ${(result.peakPressure / 1000).toFixed(1)} MPa.`,
        engineeringInsight:
          'Engineering insight: High compression extracts more mechanical work during the power stroke, while moderating heat input limits mechanical stress on the cylinder head and gasket.',
      }
    }

    if (!effMet && pressMet) {
      return {
        isPassed: false,
        status: 'NOT QUITE',
        feedbackMessage: `Not quite! Efficiency is below target (current: ${result.efficiency}%, target: ≥ 60.0%). Try increasing the compression ratio slider to squeeze more work from the expansion stroke.`,
      }
    }

    if (effMet && !pressMet) {
      return {
        isPassed: false,
        status: 'NOT QUITE',
        feedbackMessage: `Not quite! Your engine is efficient enough (${result.efficiency}%), but the peak pressure is ${(result.peakPressure / 1000).toFixed(1)} MPa (${result.peakPressure.toLocaleString()} kPa), which exceeds the 9.0 MPa safety limit. Try reducing the heat input (Q_in) or slightly trimming compression to protect the cylinder head.`,
      }
    }

    return {
      isPassed: false,
      status: 'NOT QUITE',
      feedbackMessage: `Not quite! Efficiency is ${result.efficiency}% (needs ≥ 60.0%) and peak pressure is ${(result.peakPressure / 1000).toFixed(1)} MPa (needs ≤ 9.0 MPa). Try stepping up compression to ~10:1 and dropping heat input to ~0.8 kJ to balance both goals.`,
    }
  },
}

