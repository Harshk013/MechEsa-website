import type { HomeSectionConfig } from './homeScroll.types'

export const HOME_SECTIONS: HomeSectionConfig[] = [
  { id: 'home-core', number: '01', name: 'MACHINE CORE', machineState: 'ACTIVE', transition: 'MECHANICAL_LOCK' },
  { id: 'about', number: '02', name: 'ABOUT MECHESA', machineState: 'TRANSMITTING', transition: 'MECHANICAL_LOCK' },
  { id: 'events', number: '03', name: 'UPCOMING EVENTS', machineState: 'PROCESSING', transition: 'PRODUCTION_LINE' },
  { id: 'blogs', number: '04', name: 'ENGINEERING LOG', machineState: 'DOCUMENTING', transition: 'DOCUMENT_REVEAL' },
  { id: 'contact', number: '05', name: 'CONTACT & CONNECT', machineState: 'READY', transition: 'MECHANICAL_LOCK' },
]

