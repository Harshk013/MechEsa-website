// ==========================================================================
// MECHESA ABOUT PAGE DATA
// Simple, realistic, editable data for MechESA IIT Indore
// ==========================================================================

export interface AboutActivity {
  id: string
  index: string
  title: string
  subtitle: string
  description: string
  tag: string
}

export interface AboutDiscipline {
  id: string
  index: string
  title: string
  tag: string
  description: string
}

export const aboutActivities: AboutActivity[] = [
  {
    id: 'events',
    index: '01',
    title: 'EVENTS',
    subtitle: 'TECHNICAL & STUDENT CONCLAVES',
    description: 'Technical and student-focused events throughout the academic year, bringing students together to share ideas.',
    tag: 'ACTIVITIES',
  },
  {
    id: 'workshops',
    index: '02',
    title: 'WORKSHOPS',
    subtitle: 'HANDS-ON LEARNING',
    description: 'Hands-on sessions and opportunities to learn new skills in CAD modeling, simulation, and practical engineering.',
    tag: 'LEARNING',
  },
  {
    id: 'industry-visits',
    index: '03',
    title: 'INDUSTRY VISITS',
    subtitle: 'PRACTICAL EXPOSURE',
    description: 'Exposure to real-world engineering environments, industrial manufacturing plants, and industry practices.',
    tag: 'EXPOSURE',
  },
  {
    id: 'student-engagement',
    index: '04',
    title: 'STUDENT ACTIVITIES',
    subtitle: 'COMMUNITY & PEER LEARNING',
    description: 'Interactive sessions, senior-junior peer mentorship, and activities that bring Mechanical Engineering students together.',
    tag: 'COMMUNITY',
  },
]

export const aboutDisciplines: AboutDiscipline[] = [
  {
    id: 'design',
    index: '01',
    title: 'Design',
    tag: 'CAD / MODELING',
    description: 'Geometry, mechanism design, 3D modeling, and turning ideas into buildable parts.',
  },
  {
    id: 'manufacturing',
    index: '02',
    title: 'Manufacturing',
    tag: 'MACHINING / CNC',
    description: 'Machining, CNC processes, rapid prototyping, and production methods.',
  },
  {
    id: 'thermodynamics',
    index: '03',
    title: 'Thermodynamics',
    tag: 'ENERGY / HEAT',
    description: 'Energy systems, heat transfer, refrigeration cycles, and thermal behavior.',
  },
  {
    id: 'fluid',
    index: '04',
    title: 'Fluid Mechanics',
    tag: 'FLOW / PRESSURE',
    description: 'Fluid dynamics, aerodynamics, pumps, piping systems, and flow forces.',
  },
  {
    id: 'robotics',
    index: '05',
    title: 'Robotics',
    tag: 'KINEMATICS / CONTROL',
    description: 'Robotic mechanisms, kinematic chains, motion control, and automation.',
  },
  {
    id: 'automotive',
    index: '06',
    title: 'Automotive',
    tag: 'VEHICLE / POWERTRAIN',
    description: 'Vehicle dynamics, suspension setups, powertrain layouts, and mobility engineering.',
  },
  {
    id: 'materials',
    index: '07',
    title: 'Materials',
    tag: 'METALS / POLYMERS',
    description: 'Material properties, stress-strain behavior, testing, and material selection.',
  },
  {
    id: 'mechatronics',
    index: '08',
    title: 'Mechatronics',
    tag: 'SENSING / ACTUATION',
    description: 'Mechanical systems coupled with sensors, electronics, microcontrollers, and actuators.',
  },
]
