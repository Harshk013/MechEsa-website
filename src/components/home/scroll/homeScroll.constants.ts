import type { HomeSectionConfig } from './homeScroll.types'

export const HOME_SECTIONS: HomeSectionConfig[] = [
  { id: 'home-core', number: '01', name: 'MACHINE CORE', machineState: 'ACTIVE', transition: 'MECHANICAL_LOCK' },
  { id: 'engineering', number: '02', name: 'ENGINEERING IDENTITY', machineState: 'TRANSMITTING', transition: 'MECHANICAL_LOCK' },
  { id: 'systems', number: '03', name: 'ENGINEERING SYSTEMS', machineState: 'PROCESSING', transition: 'SIGNAL_PROPAGATION' },
  { id: 'events', number: '04', name: 'PRODUCTION LINE', machineState: 'PROCESSING', transition: 'PRODUCTION_LINE' },
  { id: 'team', number: '05', name: 'TEAM ASSEMBLY', machineState: 'ASSEMBLING', transition: 'ASSEMBLY' },
  { id: 'logs', number: '06', name: 'ENGINEERING LOGS', machineState: 'DOCUMENTING', transition: 'DOCUMENT_REVEAL' },
  { id: 'motion', number: '07', name: 'ENGINEERING IN MOTION', machineState: 'MOTION', transition: 'TELEMETRY_SWEEP' },
  { id: 'join', number: '08', name: 'SYSTEM CONVERGENCE', machineState: 'READY', transition: 'MECHANICAL_LOCK' },
]

