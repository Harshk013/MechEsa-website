import { useRoutes } from 'react-router-dom'
import { routes } from './routes'
import { AppProviders } from './providers/AppProviders'
import { AmbientEnvironment } from '../components/ambient/AmbientEnvironment'
import { EngineeringCursor } from '../components/interaction/EngineeringCursor'
import { MechanicalNavigation } from '../components/navigation/MechanicalNavigation'
import { PageTransition } from '../components/transitions/PageTransition'
import { InitializationOverlay } from '../components/transitions/InitializationOverlay'
import { SiteFooter } from '../components/navigation/SiteFooter'

function RoutedApp() {
  const content = useRoutes(routes)
  return <><a className="skip-link" href="#main-content">SKIP TO SYSTEM</a><MechanicalNavigation /><PageTransition><div id="main-content" className="app-content">{content}<SiteFooter /></div></PageTransition><EngineeringCursor /><InitializationOverlay /></>
}
export default function App() {
  return <AppProviders><div className="app-shell"><AmbientEnvironment /><RoutedApp /></div></AppProviders>
}
