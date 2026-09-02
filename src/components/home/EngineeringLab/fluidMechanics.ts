export type FluidModel = {
  flowRate: number
  velocityIndex: number
  pressureIndex: number
  flowActivity: number
  state: 'IDLE' | 'STEADY FLOW' | 'HIGH VELOCITY' | 'MAX FLOW'
}

export function clampFlow(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)))
}

export function calculateFluidMechanics(flowRate: number): FluidModel {
  const flow = clampFlow(flowRate)
  const velocityIndex = flow
  const pressureIndex = Math.round(100 - flow * 0.62)
  const flowActivity = flow
  const state = flow <= 10 ? 'IDLE' : flow <= 60 ? 'STEADY FLOW' : flow <= 85 ? 'HIGH VELOCITY' : 'MAX FLOW'
  return { flowRate: flow, velocityIndex, pressureIndex, flowActivity, state }
}
