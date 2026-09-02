export type EventStatus = 'upcoming' | 'ongoing' | 'completed'
export interface EventItem { id: string; title: string; category: string; date: string; description: string; location?: string; status: EventStatus; image?: string; registrationUrl?: string }
export interface TeamMember { id: string; name: string; role: string; year?: string; image?: string; specialization?: string }
export interface BlogPost { id: string; title: string; excerpt: string; date: string; author: string; readTime?: string; category?: string }
