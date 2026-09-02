export type ContactChannel = {
  id: string
  index: string
  title: string
  label: string
  destination: string
  status: 'CONTENT / READY' | 'READY'
  description: string
  href?: string
  external?: boolean
}

export type ContactFlowNode = {
  id: string
  index: string
  title: string
  description: string
}

// No official contact endpoints are present in the current project data.
// These registry entries are intentionally content-ready and non-interactive.
export const contactChannels: ContactChannel[] = [
  { id: 'email', index: '01', title: 'EMAIL', label: 'OFFICIAL CONTACT', destination: 'CONTENT / READY', status: 'CONTENT / READY', description: 'Insert the official MechESA email endpoint here.' },
  { id: 'social', index: '02', title: 'SOCIAL', label: 'OFFICIAL SOCIAL CHANNEL', destination: 'CONTENT / READY', status: 'CONTENT / READY', description: 'Insert an official social destination here when supplied.' },
  { id: 'direct', index: '03', title: 'DIRECT MESSAGE', label: 'OFFICIAL MESSAGE CHANNEL', destination: 'CONTENT / READY', status: 'CONTENT / READY', description: 'Insert the official direct-message endpoint here when available.' },
]

export const contactFlowNodes: ContactFlowNode[] = [
  { id: 'input', index: '01', title: 'INPUT', description: 'Message payload enters the terminal.' },
  { id: 'terminal', index: '02', title: 'MECHESA TERMINAL', description: 'The interface validates and prepares the payload locally.' },
  { id: 'routing', index: '03', title: 'ROUTING', description: 'Conceptual handoff toward an official communication endpoint.' },
  { id: 'response', index: '04', title: 'RESPONSE', description: 'Human connection occurs through the configured official channel.' },
]
