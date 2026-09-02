import type { MotionState } from './engineeringMotion.types'
import { getInterpretation } from './engineeringMotion.model'
export function EngineeringInterpretation({state}:{state:MotionState}){const interpretation=getInterpretation(state);return <div className="motion-interpretation"><div><span className="technical-small">ENGINEERING INTERPRETATION</span><h3>{interpretation.title}</h3><p>{interpretation.body}</p></div><div className="motion-interpretation__note"><span>CONCEPTUAL TELEMETRY</span><span>NORMALIZED / NOT A PHYSICAL MEASUREMENT</span></div></div>}
