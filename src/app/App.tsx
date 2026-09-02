import { useRoutes } from 'react-router-dom'
import { routes } from './routes'
import { AppProviders } from './providers/AppProviders'
import { AmbientEnvironment } from '../components/ambient/AmbientEnvironment'
import { EngineeringCursor } from '../components/interaction/EngineeringCursor'
import { MechanicalNavigation } from '../components/navigation/MechanicalNavigation'
import { PageTransition } from '../components/transitions/PageTransition'
import { InitializationOverlay } from '../components/transitions/InitializationOverlay'
import { DebugOverlay } from '../components/interaction/DebugOverlay'

function RoutedApp() {
  const content = useRoutes(routes)
  return <><MechanicalNavigation /><PageTransition><main className="app-content">{content}</main></PageTransition><EngineeringCursor /><InitializationOverlay /><DebugOverlay /></>
}
export default function App() {
  return <AppProviders><div className="app-shell"><AmbientEnvironment /><RoutedApp /></div></AppProviders>
}
