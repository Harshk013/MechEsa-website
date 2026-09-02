import type { RouteObject } from 'react-router-dom'
import { Navigate } from 'react-router-dom'
import { DesignSystem } from '../pages/DesignSystem'
import { HomePage } from '../pages/Home/HomePage'
import { EventsPage } from '../pages/Events/EventsPage'
import { TeamPage } from '../pages/Team/TeamPage'
import { BlogsPage } from '../pages/Blogs/BlogsPage'
import { AboutPage } from '../pages/About/AboutPage'
import { ContactPage } from '../pages/Contact/ContactPage'

export const routes: RouteObject[] = [
  { path: '/', element: <HomePage /> },
  { path: '/design-system', element: <DesignSystem /> },
  { path: '/events', element: <EventsPage /> },
  { path: '/team', element: <TeamPage /> },
  { path: '/blogs', element: <BlogsPage /> },
  { path: '/about', element: <AboutPage /> },
  { path: '/contact', element: <ContactPage /> },
  { path: '*', element: <Navigate to="/" replace /> },
]
