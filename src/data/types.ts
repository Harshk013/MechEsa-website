export type EventStatus = 'upcoming' | 'ongoing' | 'completed'

export interface EventItem {
  id: string
  title: string
  category: string
  date: string
  description: string
  location?: string
  status: EventStatus
  image?: string
  registrationUrl?: string
  featured?: boolean
  organizer?: string
  photos?: string[]
  resources?: string
}

export interface TeamMember {
  id: string
  name: string
  role: string
  year?: string
  image?: string
  specialization?: string
  domain?: string
  subdomain?: string
  isCore?: boolean
  socials?: {
    linkedin?: string
    instagram?: string
    github?: string
    email?: string
  }
}

export interface BlogPost {
  id: string
  title: string
  excerpt: string
  date: string
  author: string
  readTime?: string
  category?: string
  image?: string
  content?: string
  tags?: string[]
  trackLink?: string
}
