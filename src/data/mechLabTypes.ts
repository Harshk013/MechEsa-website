export interface ExperimentParameter {
  id: string
  label: string
  symbol?: string
  min: number
  max: number
  default: number
  step: number
  unit: string
  description?: string
}

export interface ExperimentAssumption {
  id: string
  title: string
  statement: string
  engineeringBasis: string
}

export interface ExperimentResultMetric {
  id: string
  label: string
  value: number | string
  unit: string
  symbol?: string
  isPrimary?: boolean
  description?: string
}

export interface ExperimentEquation {
  title: string
  formula: string
  explanation: string
}

export interface ExperimentExplanation {
  whatChanged: string
  whatHappened: string
  why: string
}

export interface PVPoint {
  volume: number // cm³
  pressure: number // kPa
  label?: string
}

export interface ChallengeTarget<P = Record<string, number>, R = any> {
  id: string
  label: string
  targetDisplay: string
  isMet: (params: P, result: R) => boolean
  currentDisplay: (params: P, result: R) => string
}

export interface ChallengeEvaluation {
  isPassed: boolean
  status: 'NOT MET' | 'NOT QUITE' | 'TARGET ACHIEVED' | string
  feedbackMessage: string
  engineeringInsight?: string
}

export interface ChallengeLevel<P = Record<string, number>, R = any> {
  levelNumber: number
  levelTitle: string
  objective: string
  hint: string
  constraints?: string[]
  startingParams?: P
  targets: ChallengeTarget<P, R>[]
  evaluate?: (params: P, result: R) => ChallengeEvaluation
}

export interface LabChallenge<P = Record<string, number>, R = any> {
  id: string
  systemId: string
  title: string
  description: string
  hint?: string
  defaultParams?: P
  levels?: ChallengeLevel<P, R>[]
  targets: ChallengeTarget<P, R>[]
  evaluate: (params: P, result: R, level?: number) => ChallengeEvaluation
}

export interface ThermodynamicsCycleData {
  efficiency: number // %
  netWork: number // kJ
  peakPressure: number // kPa
  peakTemperature: number // K
  clearanceVolume: number // cm³
  totalVolume: number // cm³
  trappedMass: number // grams
  imep: number // kPa
  t1: number
  t2: number
  t3: number
  t4: number
  p1: number
  p2: number
  p3: number
  p4: number
  v1: number
  v2: number
  pvCurvePoints: PVPoint[]
  challengePassed: boolean
}
