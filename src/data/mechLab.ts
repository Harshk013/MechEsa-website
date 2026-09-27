export interface LabParameter {
  id: string
  label: string
  min: number
  max: number
  default: number
  unit: string
  step?: number
}

export interface LabSystemConfig {
  id: string
  title: string
  shortLabel: string
  colorToken: string
  status: 'AVAILABLE' | 'IN DEVELOPMENT'
  exploreDescription: string
  focus: string
  parameters: LabParameter[]
  defaultResult: string
  challengePlaceholder: string
  calculateResult?: (params: Record<string, number>) => string
}

export const labSystemsData: LabSystemConfig[] = [
  {
    id: 'design',
    title: 'Design',
    shortLabel: 'DESIGN',
    colorToken: 'var(--sys-design)',
    status: 'AVAILABLE',
    exploreDescription: 'Design a beam. Balance geometry, material, and deflection.',
    focus: 'Cantilever bending, area moment of inertia, deflection, and factor of safety.',
    parameters: [
      { id: 'lengthM', label: 'Span Length (L)', min: 1.0, max: 4.0, default: 2.5, unit: 'm', step: 0.1 },
      { id: 'widthMm', label: 'Section Width (w)', min: 40, max: 200, default: 80, unit: 'mm', step: 5 },
      { id: 'heightMm', label: 'Section Height (h)', min: 60, max: 300, default: 160, unit: 'mm', step: 5 },
      { id: 'loadKn', label: 'Tip Load (F)', min: 2, max: 50, default: 12, unit: 'kN', step: 1 },
    ],
    defaultResult: 'Bending stiffness scales with the cube of height (I = w·h³/12). Taller beams resist deflection exponentially better.',
    challengePlaceholder: 'Design a beam to carry 20 kN load with FoS ≥ 1.50 while keeping total mass under 38.0 kg.',
    calculateResult: (p) => {
      const zCm3 = ((p.widthMm * Math.pow(p.heightMm, 2)) / 6) / 1000
      return `Section Modulus Z = ${zCm3.toFixed(1)} cm³. Under ${p.loadKn} kN load, moment M = ${(p.loadKn * p.lengthM).toFixed(1)} kN·m.`
    },
  },
  {
    id: 'materials',
    title: 'Materials',
    shortLabel: 'MATERIALS',
    colorToken: 'var(--sys-materials)',
    status: 'IN DEVELOPMENT',
    exploreDescription: 'Push a material until it bends, stretches, or fails.',
    focus: 'Crystal structure, tensile strength, and factor of safety under load.',
    parameters: [
      { id: 'appliedLoad', label: 'Tensile Force (F)', min: 1, max: 100, default: 35, unit: 'kN', step: 1 },
      { id: 'crossSectionArea', label: 'Cross-Section Area (A)', min: 50, max: 500, default: 150, unit: 'mm²', step: 5 },
    ],
    defaultResult: 'Applied load over cross-section yields engineering stress (σ = F/A).',
    challengePlaceholder: 'Maintain a factor of safety above 2.0 under an 80 kN tensile load.',
    calculateResult: (p) => {
      const stress = Math.round((p.appliedLoad * 1000) / p.crossSectionArea)
      const yieldStrength = 250 // MPa for mild steel
      const fos = (yieldStrength / stress).toFixed(2)
      return `Tensile stress σ = ${stress} MPa. Against typical mild steel yield (250 MPa), Factor of Safety is ${fos}.`
    },
  },
  {
    id: 'manufacturing',
    title: 'Manufacturing',
    shortLabel: 'MFG',
    colorToken: 'var(--sys-manufacturing)',
    status: 'IN DEVELOPMENT',
    exploreDescription: 'Choose how to make your part and discover the trade-offs.',
    focus: 'Process planning, cutter kinematics, and surface finish precision.',
    parameters: [
      { id: 'cuttingSpeed', label: 'Spindle Speed (N)', min: 200, max: 4000, default: 1200, unit: 'RPM', step: 50 },
      { id: 'feedRate', label: 'Feed per Tooth (fz)', min: 0.02, max: 0.3, default: 0.1, unit: 'mm/tooth', step: 0.01 },
    ],
    defaultResult: 'Higher feed rates increase material removal speed but elevate tool wear and surface roughness.',
    challengePlaceholder: 'Optimize surface finish (Ra < 1.6 µm) while maintaining material removal rate.',
    calculateResult: (p) => {
      const mrrIndex = ((p.cuttingSpeed * p.feedRate) / 100).toFixed(1)
      const finish = p.feedRate > 0.18 ? 'Rough cut — high removal rate, coarser surface finish.' : 'Fine finish cut — optimal surface texture with restrained tool wear.'
      return `At ${p.cuttingSpeed} RPM and ${p.feedRate} mm/tooth, relative removal index is ${mrrIndex}. ${finish}`
    },
  },
  {
    id: 'mechatronics',
    title: 'Mechatronics',
    shortLabel: 'MECHATRONICS',
    colorToken: 'var(--sys-mechatronics)',
    status: 'IN DEVELOPMENT',
    exploreDescription: 'Control motion, sensors and actuators.',
    focus: 'Electro-mechanical feedback loops and position stabilization.',
    parameters: [
      { id: 'proportionalGain', label: 'Proportional Gain (Kp)', min: 0.1, max: 10, default: 2.5, unit: '', step: 0.1 },
      { id: 'derivativeGain', label: 'Derivative Gain (Kd)', min: 0.01, max: 2, default: 0.4, unit: '', step: 0.02 },
    ],
    defaultResult: 'Increasing Kp accelerates system response time, while Kd dampens transient overshoot.',
    challengePlaceholder: 'Eliminate steady-state overshoot without inducing oscillation.',
    calculateResult: (p) => {
      const dampRatio = (p.derivativeGain * 1.5).toFixed(2)
      const response = p.proportionalGain > 6 ? 'Aggressive rise time with potential ripple.' : 'Controlled, stable convergence to setpoint.'
      return `Loop tuning: Kp=${p.proportionalGain}, Kd=${p.derivativeGain}. Effective damping ratio ~${dampRatio}. ${response}`
    },
  },
  {
    id: 'robotics',
    title: 'Robotics',
    shortLabel: 'ROBOTICS',
    colorToken: 'var(--sys-robotics)',
    status: 'AVAILABLE',
    exploreDescription: 'Control the arm. Reach the target. Learn how robots move.',
    focus: 'Multi-axis joint coordinate transforms, torque, and trajectory control.',
    parameters: [
      { id: 'joint1Angle', label: 'Base Joint Angle (θ1)', min: -90, max: 90, default: 30, unit: '°', step: 1 },
      { id: 'joint2Angle', label: 'Elbow Joint Angle (θ2)', min: -120, max: 120, default: -45, unit: '°', step: 1 },
    ],
    defaultResult: 'Joint angles determine the position vector of the end-effector in Cartesian workspace.',
    challengePlaceholder: 'Position the end effector at coordinate target (X: 350mm, Y: 200mm).',
    calculateResult: (p) => {
      const r1 = (p.joint1Angle * Math.PI) / 180
      const r2 = ((p.joint1Angle + p.joint2Angle) * Math.PI) / 180
      const l1 = 250, l2 = 200
      const x = Math.round(l1 * Math.cos(r1) + l2 * Math.cos(r2))
      const y = Math.round(l1 * Math.sin(r1) + l2 * Math.sin(r2))
      return `End-effector Cartesian coordinates resolve to X: ${x} mm, Y: ${y} mm with current 2-DOF linkage geometry.`
    },
  },
  {
    id: 'automotive',
    title: 'Automotive',
    shortLabel: 'AUTO',
    colorToken: 'var(--sys-automotive)',
    status: 'AVAILABLE',
    exploreDescription: 'Build your car. Balance power, grip, and braking.',
    focus: 'Traction, braking distance, and cornering stability.',
    parameters: [
      { id: 'gearRatio', label: 'Selected Gear Ratio', min: 0.7, max: 4.2, default: 2.1, unit: ':1', step: 0.1 },
      { id: 'engineRpm', label: 'Engine Speed', min: 1000, max: 7000, default: 3500, unit: 'RPM', step: 100 },
    ],
    defaultResult: 'Higher gear ratios deliver greater wheel torque at lower vehicle ground speeds.',
    challengePlaceholder: 'Select the optimal shift point to maximize tractive acceleration.',
    calculateResult: (p) => {
      const wheelRpm = Math.round(p.engineRpm / (p.gearRatio * 3.7))
      const speedKmh = Math.round((wheelRpm * 0.62 * Math.PI * 60) / 1000)
      return `At ${p.engineRpm} RPM with ${p.gearRatio}:1 ratio, wheel speed is ~${wheelRpm} RPM, corresponding to ~${speedKmh} km/h ground speed.`
    },
  },
  {
    id: 'thermodynamics',
    title: 'Thermodynamics',
    shortLabel: 'THERMAL',
    colorToken: 'var(--sys-thermodynamics)',
    status: 'AVAILABLE',
    exploreDescription: 'Make an engine work — without overheating it.',
    focus: 'Energy, temperature and heat transfer in closed and open volumes.',
    parameters: [
      { id: 'temperature', label: 'Inlet Temperature (T1)', min: 300, max: 1200, default: 600, unit: 'K', step: 10 },
      { id: 'pressureRatio', label: 'Compression Ratio (r)', min: 2, max: 20, default: 8, unit: ':1', step: 0.5 },
    ],
    defaultResult: 'Increasing the compression ratio raises thermal efficiency according to ideal cycle limits.',
    challengePlaceholder: 'Maximize cycle efficiency while keeping peak temperature under 1100 K.',
    calculateResult: (p) => {
      const eff = Math.min(68, Math.round(100 * (1 - 1 / Math.pow(p.pressureRatio, 0.4))))
      return `With r = ${p.pressureRatio}:1 and T1 = ${p.temperature} K, ideal air-standard efficiency is ~${eff}%. Higher compression extracts more work per unit mass.`
    },
  },
  {
    id: 'fluid',
    title: 'Fluid Mechanics',
    shortLabel: 'FLUID',
    colorToken: 'var(--sys-fluid)',
    status: 'AVAILABLE',
    exploreDescription: 'Control the flow. Discover what pressure is doing.',
    focus: 'Forces, viscosity, and continuity across moving fluid streams.',
    parameters: [
      { id: 'flowRate', label: 'Flow Velocity (v)', min: 0.1, max: 10, default: 2.5, unit: 'm/s', step: 0.1 },
      { id: 'pipeDiameter', label: 'Pipe Diameter (D)', min: 0.05, max: 0.5, default: 0.2, unit: 'm', step: 0.01 },
    ],
    defaultResult: 'As flow velocity increases, the Reynolds number shifts from laminar toward turbulent flow.',
    challengePlaceholder: 'Achieve laminar flow with a flow velocity above 3 m/s by adjusting pipe diameter.',
    calculateResult: (p) => {
      const reApprox = Math.round((p.flowRate * p.pipeDiameter) / 0.000001)
      const regime = reApprox < 2300 ? 'Laminar flow regime (Re < 2,300)' : reApprox < 4000 ? 'Transitional flow' : 'Fully turbulent flow regime (Re > 4,000)'
      return `Flow velocity ${p.flowRate} m/s in ${p.pipeDiameter} m pipe produces Reynolds number ~${reApprox.toLocaleString()}. State: ${regime}.`
    },
  },
]
