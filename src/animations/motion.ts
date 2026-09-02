export const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value))
export const mapRange = (value: number, inMin: number, inMax: number, outMin: number, outMax: number) => outMin + (clamp((value - inMin) / (inMax - inMin)) * (outMax - outMin))
export const rotateWithProgress = (progress: number, degrees: number) => progress * degrees
export const slideWithResistance = (progress: number, distance: number, resistance = 0.72) => Math.pow(clamp(progress), resistance) * distance
export const dampedValue = (current: number, target: number, smoothing = 0.12) => current + (target - current) * smoothing
