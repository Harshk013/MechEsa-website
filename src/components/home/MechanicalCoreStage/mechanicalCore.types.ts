export type MechanicalCoreState = 'off' | 'idle' | 'initializing' | 'active' | 'interacting' | 'engaged'

export type MechanicalCoreTelemetry = {
  rpm: number
  ratio: number
  cycle: number
  activeObject: string
}

export type MechanicalCoreStageProps = {
  state: MechanicalCoreState
  onTelemetry?: (telemetry: MechanicalCoreTelemetry) => void
  onHover?: (objectName: string | null) => void
  onEngage?: () => void
}
