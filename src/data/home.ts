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
  { id: 'thermodynamics', title: 'Thermodynamics', shortLabel: 'THERMAL', description: 'Energy, temperature and heat transfer as a moving system.', status: 'STANDBY', metric: 'ENERGY / HEAT' },
  { id: 'fluid', title: 'Fluid Mechanics', shortLabel: 'FLUID', description: 'Pressure, flow and forces moving through connected volumes.', status: 'STANDBY', metric: 'FLOW / PRESSURE' },
  { id: 'robotics', title: 'Robotics', shortLabel: 'ROBOTICS', description: 'Mechanisms, control and motion working together.', status: 'ACTIVE', metric: 'CONTROL / MOTION' },
  { id: 'automotive', title: 'Automotive', shortLabel: 'AUTO', description: 'Performance engineering where forces become motion.', status: 'ACTIVE', metric: 'FORCE / SPEED' },
  { id: 'materials', title: 'Materials', shortLabel: 'MATERIALS', description: 'Structure, properties and the physical limits of a design.', status: 'STANDBY', metric: 'STRESS / STRUCTURE' },
  { id: 'mechatronics', title: 'Mechatronics', shortLabel: 'MECHATRONICS', description: 'Mechanical systems coupled with sensing, electronics and control.', status: 'ACTIVE', metric: 'SENSE / ACTUATE' },
]

export const homepageEvents: EventItem[] = [
  { id: 'event-preview-01', title: 'Upcoming Event', category: 'MECHESA', date: 'DATE / TBD', description: 'Event information will be populated from the official MechESA calendar.', status: 'upcoming' },
  { id: 'event-preview-02', title: 'Recent Activity', category: 'ENGINEERING', date: 'DATE / TBD', description: 'A content-ready module for future MechESA activity.', status: 'upcoming' },
  { id: 'event-preview-03', title: 'Workshop Module', category: 'WORKSHOP', date: 'DATE / TBD', description: 'A future event module connected to the complete events archive.', status: 'upcoming' },
]

export const homepageTeam: TeamMember[] = [
  { id: 'member-01', name: 'TEAM MEMBER', role: 'ROLE / TBD', year: 'YEAR / TBD' },
  { id: 'member-02', name: 'TEAM MEMBER', role: 'ROLE / TBD', year: 'YEAR / TBD' },
  { id: 'member-03', name: 'TEAM MEMBER', role: 'ROLE / TBD', year: 'YEAR / TBD' },
  { id: 'member-04', name: 'TEAM MEMBER', role: 'ROLE / TBD', year: 'YEAR / TBD' },
]

export const homepageBlogs: BlogPost[] = [
  { id: 'log-01', title: 'Engineering Log', excerpt: 'A content-ready space for a future MechESA technical article.', date: 'DATE / TBD', author: 'MECHESA', readTime: 'TBD', category: 'TECHNICAL' },
  { id: 'log-02', title: 'Design Notes', excerpt: 'A content-ready space for design, making and engineering documentation.', date: 'DATE / TBD', author: 'MECHESA', readTime: 'TBD', category: 'DESIGN' },
  { id: 'log-03', title: 'Systems Journal', excerpt: 'A content-ready space for an engineering systems story.', date: 'DATE / TBD', author: 'MECHESA', readTime: 'TBD', category: 'SYSTEMS' },
]
