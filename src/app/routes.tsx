import type { RouteObject } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { Navigate } from 'react-router-dom'
import { DesignSystem } from '../pages/DesignSystem'
import { HomePage } from '../pages/Home/HomePage'
import { EventsPage } from '../pages/Events/EventsPage'
import { TeamPage } from '../pages/Team/TeamPage'
import { BlogsPage } from '../pages/Blogs/BlogsPage'
import { CareerStoriesPage } from '../pages/Blogs/CareerStoriesPage'
import { AboutPage } from '../pages/About/AboutPage'
import { ContactPage } from '../pages/Contact/ContactPage'
import { SystemsPage } from '../pages/Systems/SystemsPage'
import { MechLabErrorBoundary } from '../components/mechLab/MechLabErrorBoundary'
import { MechLabLoadingFallback } from '../components/mechLab/MechLabLoadingFallback'

const LazyMechLabPage = lazy(() =>
  import('../pages/MechLab/MechLabPage').then((m) => ({ default: m.MechLabPage }))
)
const LazyMechLabSystemPage = lazy(() =>
  import('../pages/MechLab/MechLabSystemPage').then((m) => ({ default: m.MechLabSystemPage }))
)

function withLabSuspense(element: React.ReactNode) {
  return (
    <MechLabErrorBoundary>
      <Suspense fallback={<MechLabLoadingFallback />}>{element}</Suspense>
    </MechLabErrorBoundary>
  )
}

export const routes: RouteObject[] = [
  { path: '/', element: <HomePage /> },
  { path: '/design-system', element: <DesignSystem /> },
  { path: '/events', element: <EventsPage /> },
  { path: '/team', element: <TeamPage /> },
  { path: '/blogs', element: <BlogsPage /> },
  { path: '/blogs/internships', element: <CareerStoriesPage track="internships" /> },
  { path: '/blogs/placements', element: <CareerStoriesPage track="placements" /> },
  { path: '/about', element: <AboutPage /> },
  { path: '/contact', element: <ContactPage /> },
  { path: '/systems', element: <SystemsPage /> },
  { path: '/lab', element: withLabSuspense(<LazyMechLabPage />) },
  { path: '/lab/:systemId', element: withLabSuspense(<LazyMechLabSystemPage />) },
  { path: '/mech-lab', element: <Navigate to="/lab" replace /> },
  { path: '*', element: <Navigate to="/" replace /> },
]
