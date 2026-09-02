export interface AboutPrinciple {
  id: string
  index: string
  title: string
  description: string
}

export interface AboutLoopStage {
  id: string
  index: string
  title: string
  description: string
  output: string
}

export interface AboutManifestoLine {
  id: string
  index: string
  text: string
  annotation: string
}

export const aboutPrinciples: AboutPrinciple[] = [
  { id: 'understand', index: '01', title: 'UNDERSTAND', description: 'Study forces, constraints, materials and systems before changing them.' },
  { id: 'design', index: '02', title: 'DESIGN', description: 'Turn requirements into geometry, mechanisms and deliberate decisions.' },
  { id: 'build', index: '03', title: 'BUILD', description: 'Move from equations and screens into physical form.' },
  { id: 'test', index: '04', title: 'TEST', description: 'Measure what actually happens and compare it with the model.' },
  { id: 'iterate', index: '05', title: 'ITERATE', description: 'Use evidence to improve the system rather than protect the first idea.' },
  { id: 'move', index: '06', title: 'MOVE', description: 'Engineering becomes meaningful when ideas become motion.' },
]

export const aboutLoopStages: AboutLoopStage[] = [
  { id: 'learn', index: '01', title: 'LEARN', description: 'Technical knowledge, workshops and peer learning.', output: 'KNOWLEDGE' },
  { id: 'experiment', index: '02', title: 'EXPERIMENT', description: 'Explore mechanisms, materials, simulations and systems.', output: 'EVIDENCE' },
  { id: 'build', index: '03', title: 'BUILD', description: 'Turn ideas into physical form and testable systems.', output: 'PROTOTYPE' },
  { id: 'share', index: '04', title: 'SHARE', description: 'Document and communicate engineering work.', output: 'DOCUMENT' },
  { id: 'repeat', index: '05', title: 'REPEAT', description: 'Return to the problem with better information.', output: 'ITERATION' },
]

export const aboutManifesto: AboutManifestoLine[] = [
  { id: 'question', index: '01', text: 'WE QUESTION THE SYSTEM.', annotation: 'ASSUMPTION / INSPECT' },
  { id: 'geometry', index: '02', text: 'WE DRAW THE GEOMETRY.', annotation: 'FORM / DEFINE' },
  { id: 'part', index: '03', text: 'WE BUILD THE PART.', annotation: 'MATERIAL / FABRICATE' },
  { id: 'measure', index: '04', text: 'WE MEASURE THE RESULT.', annotation: 'DATA / VERIFY' },
  { id: 'iterate', index: '05', text: 'WE ITERATE.', annotation: 'EVIDENCE / IMPROVE' },
  { id: 'motion', index: '06', text: 'WE KEEP MOVING.', annotation: 'SYSTEM / MOTION' },
]
