import type { TeamMember } from './types'

export const teamMembersData: TeamMember[] = [
  {
    id: 'member-01',
    name: 'TEAM MEMBER',
    role: 'HEAD / TBD',
    year: 'YEAR / TBD',
    domain: 'CORE TEAM',
    isCore: true,
    specialization: 'Mechanical Systems & Administration',
  },
  {
    id: 'member-02',
    name: 'TEAM MEMBER',
    role: 'CO-HEAD / TBD',
    year: 'YEAR / TBD',
    domain: 'CORE TEAM',
    isCore: true,
    specialization: 'Operations & Event Coordination',
  },
  {
    id: 'member-03',
    name: 'TEAM MEMBER',
    role: 'TECHNICAL LEAD / TBD',
    year: 'YEAR / TBD',
    domain: 'OPERATIONS',
    isCore: false,
    specialization: 'Workshops & Technical Projects',
  },
  {
    id: 'member-04',
    name: 'TEAM MEMBER',
    role: 'CREATIVE LEAD / TBD',
    year: 'YEAR / TBD',
    domain: 'CREATIVES',
    isCore: false,
    specialization: 'Visual Design & Publications',
  },
]

export const teamDomains = ['ALL', 'CORE TEAM', 'OPERATIONS', 'CREATIVES'] as const
