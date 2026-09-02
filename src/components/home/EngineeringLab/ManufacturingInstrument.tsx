import { motion, useReducedMotion as useFramerReducedMotion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useRepresentation } from '../../../app/providers/RepresentationProvider'
import { useReducedMotion } from '../../../hooks/useReducedMotion'
import { MechanicalPanel } from '../../mechanical/MechanicalPanel'
import { TechnicalLabel } from '../../typography/TechnicalLabel'
import { calculateManufacturing, manufacturingToolpath } from './manufacturing'

const stock = { x: 70, y: 88, width: 620, height: 190 }
const finalProfile = 'M70 88 H286 V118 H354 V148 H500 V118 H570 V88 H690 V278 H570 V248 H500 V218 H354 V248 H286 V278 H70 Z'
const topRemoval = 'M70 88 H690 V88 H570 V118 H500 V148 H354 V118 H286 V88 Z'
const bottomRemoval = 'M70 278 H286 V248 H354 V218 H500 V248 H570 V278 H690 V278 H70 Z'

function pathD(points: { x: number; y: number }[]) {
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${(stock.x + p.x * stock.width).toFixed(1)} ${(stock.y + p.y * stock.height).toFixed(1)}`).join(' ')
}

function ManufacturingReadout({ model, cutting }: { model: ReturnType<typeof calculateManufacturing>; cutting: boolean }) {
  return <MechanicalPanel variant="highlighted" className="manufacturing-readout">
    <div className="manufacturing-readout__head">
      <TechnicalLabel prefix="MFG">MANUFACTURING</TechnicalLabel>
      <span className={`manufacturing-status ${cutting ? 'is-cutting' : ''}`}><i />{cutting ? 'CUTTING ACTIVE' : 'TOOL / HOLD'}</span>
    </div>
    <div className="manufacturing-readout__grid">
      <div><span>STATE</span><strong>{model.state}</strong></div>
      <div><span>MACHINING PROGRESS</span><strong>{model.progress} %</strong></div>
      <div><span>TOOLPATH</span><strong>{model.pass}</strong></div>
      <div><span>MATERIAL</span><strong>REMOVAL / CONCEPTUAL</strong></div>
      <div><span>PROFILE</span><strong>{model.progress >= 100 ? 'FINISHED' : 'FORMING'}</strong></div>
    </div>
    <p className="technical-small manufacturing-readout__note">CONCEPTUAL MACHINING MODEL / NORMALIZED VISUALIZATION / NOT A CNC SIMULATOR</p>
  </MechanicalPanel>
}

export function ManufacturingInstrument() {
  const [progress, setProgress] = useState(15)
  const [visible, setVisible] = useState(true)
  const [cutting, setCutting] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const stopTimer = useRef<number | null>(null)
  const { isBlueprint } = useRepresentation()
  const reducedMotion = useReducedMotion()
  const framerReduced = useFramerReducedMotion()
  const model = useMemo(() => calculateManufacturing(progress), [progress])
  const path = useMemo(() => pathD(manufacturingToolpath), [])

  useEffect(() => {
    const node = rootRef.current
    if (!node) return
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: '180px 0px' })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const updateProgress = (next: number) => {
    setProgress(Math.max(0, Math.min(100, Math.round(next))))
    setCutting(true)
    if (stopTimer.current) window.clearTimeout(stopTimer.current)
    stopTimer.current = window.setTimeout(() => setCutting(false), 320)
  }

  useEffect(() => () => { if (stopTimer.current) window.clearTimeout(stopTimer.current) }, [])

  const toolX = stock.x + model.toolPosition.x * stock.width
  const toolY = stock.y + model.toolPosition.y * stock.height
  const removalOpacity = Math.min(0.92, model.removalIndex / 100)
  const profileReveal = model.progress / 100
  const animate = visible && !reducedMotion && !framerReduced

  return <div ref={rootRef} className={`manufacturing-instrument ${isBlueprint ? 'is-blueprint' : 'is-reality'}`}>
    <div className="manufacturing-instrument__visual" aria-hidden="true">
      <svg viewBox="0 0 760 360" role="presentation">
        <defs>
          <clipPath id="mfg-profile-reveal"><rect x={stock.x} y={stock.y} width={stock.width * Math.max(profileReveal, 0.001)} height={stock.height + 4} /></clipPath>
          <pattern id="mfg-hatch" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(28)"><line x1="0" y1="0" x2="0" y2="9" /></pattern>
          <linearGradient id="mfg-metal" x1="0" x2="1"><stop offset="0"/><stop offset=".5"/><stop offset="1"/></linearGradient>
        </defs>
        <g className="manufacturing-grid">
          <path d="M70 62 H690 M70 304 H690" />
          <path d="M100 54 V314 M660 54 V314" />
        </g>
        <path className="manufacturing-stock" d={`M${stock.x} ${stock.y} H${stock.x + stock.width} V${stock.y + stock.height} H${stock.x} Z`} fill="url(#mfg-metal)" />
        <path className="manufacturing-removal" d={topRemoval} opacity={removalOpacity} /><path className="manufacturing-removal" d={bottomRemoval} opacity={removalOpacity} />
        <path className="manufacturing-hatch" d={topRemoval} clipPath="url(#mfg-profile-reveal)" opacity={removalOpacity * .72} /><path className="manufacturing-hatch" d={bottomRemoval} clipPath="url(#mfg-profile-reveal)" opacity={removalOpacity * .72} />
        <path className="manufacturing-profile" d={finalProfile} clipPath="url(#mfg-profile-reveal)" />
        <path className="manufacturing-centerline" d="M70 183 H690" />
        <motion.path className="manufacturing-toolpath" d={path} initial={false} animate={{ opacity: animate ? 1 : .82 }} />
        <motion.path className="manufacturing-active-path" d={path} pathLength={1} initial={false} animate={{ pathLength: animate ? model.progress / 100 : model.progress / 100 }} />
        <g className="manufacturing-tool" transform={`translate(${toolX} ${toolY})`}>
          <rect x="-13" y="-74" width="26" height="52" rx="2" />
          <rect x="-19" y="-82" width="38" height="10" />
          <path d="M-8 -22 H8 L4 10 H-4 Z" />
          <path d="M-4 10 L0 19 L4 10" />
        </g>
        {[0,1,2,3].map(i => {
          const dx = toolX + (i - 1.5) * 11
          const dy = toolY + 18 + (i % 2) * 5
          return <motion.path key={i} className="manufacturing-chip" d="M0 0 l7 3 -4 4 -7 -3 Z" transform={`translate(${dx} ${dy})`} initial={{ opacity: 0, y: 4 }} animate={{ opacity: animate && cutting ? .75 : 0, y: animate && cutting ? 0 : 4 }} transition={{ duration: .18, ease: 'easeOut' }} />
        })}
      </svg>
      <span className="manufacturing-annotation manufacturing-annotation--stock">RAW STOCK / WORKPIECE</span>
      <span className="manufacturing-annotation manufacturing-annotation--path">TOOLPATH / T01</span>
      <span className="manufacturing-annotation manufacturing-annotation--pass">{model.pass}</span>
      <span className="manufacturing-annotation manufacturing-annotation--finish">FINISHED PROFILE</span>
      <span className="manufacturing-annotation manufacturing-annotation--cut">MATERIAL REMOVAL</span>
    </div>

    <div className="manufacturing-control" aria-label="Machining progress control">
      <div className="manufacturing-control__head"><TechnicalLabel prefix="FEED">MACHINING PROGRESS</TechnicalLabel><output htmlFor="machining-progress">{progress} %</output></div>
      <div className="manufacturing-control__rail">
        <button type="button" onClick={() => updateProgress(progress - 5)} aria-label="Decrease machining progress">−</button>
        <span className="manufacturing-control__knob" aria-hidden="true" />
        <input id="machining-progress" type="range" min="0" max="100" step="1" value={progress} onChange={e => updateProgress(Number(e.target.value))} aria-label="Machining progress" />
        <button type="button" onClick={() => updateProgress(progress + 5)} aria-label="Increase machining progress">+</button>
      </div>
      <div className="manufacturing-control__scale"><span>0 / RAW</span><span>50 / PROFILE</span><span>100 / FINISH</span></div>
    </div>

    <ManufacturingReadout model={model} cutting={cutting} />
  </div>
}
