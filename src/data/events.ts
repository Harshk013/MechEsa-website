import type { EventItem } from './types'

export const eventsData: EventItem[] = [
  {
    id: 'event-preview-01',
    title: 'Upcoming Event',
    category: 'MECHESA',
    date: 'DATE / TBD',
    description: 'Event information will be populated from the official MechESA calendar.',
    location: 'IIT Indore Campus',
    status: 'upcoming',
    featured: true,
    organizer: 'MechESA Executive Council',
  },
  {
    id: 'event-preview-03',
    title: 'Workshop Module',
    category: 'WORKSHOP',
    date: 'DATE / TBD',
    description: 'A hands-on engineering workshop session connected to the complete events archive.',
    location: 'Mechanical Engineering Workshop',
    status: 'upcoming',
    featured: false,
    organizer: 'MechESA Technical Division',
  },
  {
    id: 'event-preview-02',
    title: 'Recent Activity',
    category: 'ENGINEERING',
    date: 'DATE / TBD',
    description: 'A content-ready module documenting completed MechESA engineering activities and sessions.',
    location: 'Central Workshop / IIT Indore',
    status: 'completed',
    featured: false,
    organizer: 'MechESA Student Body',
  },
]
