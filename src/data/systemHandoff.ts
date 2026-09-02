export type HandoffNode = {
  id: string
  label: string
  context: string
  angle: number
}

export const handoffNodes: HandoffNode[] = [
  { id: 'core', label: 'CORE', context: 'MACHINE', angle: -90 },
  { id: 'events', label: 'EVENTS', context: 'PRODUCTION', angle: -30 },
  { id: 'team', label: 'TEAM', context: 'ASSEMBLY', angle: 30 },
  { id: 'motion', label: 'MOTION', context: 'TEST', angle: 90 },
  { id: 'logs', label: 'LOGS', context: 'DOCUMENTATION', angle: 150 },
  { id: 'lab', label: 'LAB', context: 'EXPERIMENT', angle: 210 },
]

export const handoffActions = {
  engage: { label: 'ENGAGE SYSTEM', route: '/contact' },
  explore: { label: 'EXPLORE SYSTEM', route: '/events' },
} as const
