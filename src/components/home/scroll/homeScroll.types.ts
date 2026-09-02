export type HomeMachineState = 'IDLE' | 'ACTIVE' | 'TRANSMITTING' | 'PROCESSING' | 'ASSEMBLING' | 'DOCUMENTING' | 'MOTION' | 'READY'

export type HomeSectionConfig = {
  id: string
  number: string
  name: string
  machineState: HomeMachineState
  transition: 'MECHANICAL_LOCK' | 'SIGNAL_PROPAGATION' | 'PRODUCTION_LINE' | 'ASSEMBLY' | 'DOCUMENT_REVEAL' | 'TELEMETRY_SWEEP' | 'SYSTEM_HANDOFF'
}

export type HomeScrollSnapshot = {
  globalProgress: number
  sectionProgress: number
  velocity: number
  direction: 'forward' | 'backward' | 'idle'
  activeSection: string
  machineState: HomeMachineState
}
