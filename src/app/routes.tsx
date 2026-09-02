import type { RouteObject } from 'react-router-dom'
import { Navigate } from 'react-router-dom'
import { PlaceholderPage } from '../pages/PlaceholderPage'
import { DesignSystem } from '../pages/DesignSystem'
import { HomePage } from '../pages/Home/HomePage'

export const routes: RouteObject[] = [
  { path: '/', element: <HomePage /> },
  { path: '/design-system', element: <DesignSystem /> },
  { path: '/events', element: <PlaceholderPage name="Events" /> },
  { path: '/team', element: <PlaceholderPage name="Team" /> },
  { path: '/blogs', element: <PlaceholderPage name="Blogs" /> },
  { path: '/about', element: <PlaceholderPage name="About" /> },
  { path: '/contact', element: <PlaceholderPage name="Contact" /> },
  { path: '*', element: <Navigate to="/" replace /> },
]
