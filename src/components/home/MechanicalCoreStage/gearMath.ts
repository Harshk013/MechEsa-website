export function calculateGearAngularVelocity(inputVelocity: number, inputTeeth: number, outputTeeth: number) {
  if (outputTeeth <= 0 || inputTeeth <= 0) return 0
  return -(inputVelocity * inputTeeth) / outputTeeth
}

export function calculateGearRatio(inputTeeth: number, outputTeeth: number) {
  if (inputTeeth <= 0 || outputTeeth <= 0) return 1
  return inputTeeth / outputTeeth
}

/** Simplified crank-slider position for a vertical piston axis.
 * The crank pin is represented by x = r cos(theta), y = r sin(theta).
 * pistonY is then solved from the fixed connecting-rod length: sqrt(L² - x²).
 * This uses the actual connecting-rod constraint instead of a sine-only piston path.
 */
export function solveCrankSlider(crankAngle: number, crankRadius: number, rodLength: number) {
  const crankOffset = crankRadius * Math.cos(crankAngle)
  const crankVertical = crankRadius * Math.sin(crankAngle)
  const pistonTravel = Math.sqrt(Math.max(0, rodLength ** 2 - crankOffset ** 2))
  // The piston sits on the slider axis, so its position is the crank-pin
  // vertical coordinate plus the remaining rod projection.
  const pistonY = crankVertical + pistonTravel
  return { x: crankOffset, y: crankVertical, pistonY }
}
