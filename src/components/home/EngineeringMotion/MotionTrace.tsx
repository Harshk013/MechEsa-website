import { forwardRef, type Ref } from 'react'
export const MotionTrace = forwardRef<SVGPolylineElement, { points: string }>(({points}, ref:Ref<SVGPolylineElement>) => <polyline ref={ref} className="motion-trace__path" points={points} fill="none" vectorEffect="non-scaling-stroke" />)
MotionTrace.displayName='MotionTrace'
