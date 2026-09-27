import type { BlogPost, EventItem, TeamMember } from './types'

export interface EngineeringSystem {
  id: string
  title: string
  shortLabel: string
  description: string
  status: 'ACTIVE' | 'STANDBY'
  metric: string
}

export const engineeringSystems: EngineeringSystem[] = [
  { id: 'design', title: 'Design', shortLabel: 'DESIGN', description: 'Geometry, mechanisms and decisions shaped into buildable systems.', status: 'ACTIVE', metric: 'FORM / FUNCTION' },
  { id: 'manufacturing', title: 'Manufacturing', shortLabel: 'MFG', description: 'From process planning to the precision of a finished component.', status: 'ACTIVE', metric: 'PROCESS / PRECISION' },
  { id: 'thermodynamics', title: 'Thermodynamics', shortLabel: 'THERMAL', description: 'Energy, temperature and heat transfer as a moving system.', status: 'ACTIVE', metric: 'ENERGY / HEAT' },
  { id: 'fluid', title: 'Fluid Mechanics', shortLabel: 'FLUID', description: 'Pressure, flow and forces moving through connected volumes.', status: 'ACTIVE', metric: 'FLOW / PRESSURE' },
  { id: 'robotics', title: 'Robotics', shortLabel: 'ROBOTICS', description: 'Mechanisms, control and motion working together.', status: 'ACTIVE', metric: 'CONTROL / MOTION' },
  { id: 'automotive', title: 'Automotive', shortLabel: 'AUTO', description: 'Performance engineering where forces become motion.', status: 'ACTIVE', metric: 'FORCE / SPEED' },
  { id: 'materials', title: 'Materials', shortLabel: 'MATERIALS', description: 'Structure, properties and the physical limits of a design.', status: 'ACTIVE', metric: 'STRESS / STRUCTURE' },
  { id: 'mechatronics', title: 'Mechatronics', shortLabel: 'MECHATRONICS', description: 'Mechanical systems coupled with sensing, electronics and control.', status: 'ACTIVE', metric: 'SENSE / ACTUATE' },
]

import { eventsData } from './events'
import { teamMembersData } from './team'
import { blogPostsData } from './blogs'

export const homepageEvents: EventItem[] = eventsData

export const homepageTeam: TeamMember[] = teamMembersData

export const homepageBlogs: BlogPost[] = blogPostsData.slice(0, 3)
