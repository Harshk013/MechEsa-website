import { motion, useReducedMotion as useFramerReducedMotion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { useRepresentation } from '../../../app/providers/RepresentationProvider'
import { useReducedMotion } from '../../../hooks/useReducedMotion'
import { MechanicalPanel } from '../../mechanical/MechanicalPanel'
import { TechnicalLabel } from '../../typography/TechnicalLabel'
import { calculateRobotics, LINK_1, LINK_2, toSvgPoint } from './robotics'

const origin = { x: 330, y: 220 }
const scale = 0.88
const target = { x: 118, y: 92 }

function svgPolarPoint(center: { x: number; y: number }, radius: number, degrees: number) {
  const radians = degrees * Math.PI / 180
  return {
    x: center.x + radius * Math.cos(radians),
    y: center.y - radius * Math.sin(radians),
  }
}

function arcPath(center: { x: number; y: number }, radius: number, startDeg: number, endDeg: number) {
  const p1 = svgPolarPoint(center, radius, startDeg)
  const p2 = svgPolarPoint(center, radius, endDeg)
  const delta = endDeg - startDeg
  const large = Math.abs(delta) > 180 ? 1 : 0
  const sweep = delta >= 0 ? 0 : 1
  return `M ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} A ${radius} ${radius} 0 ${large} ${sweep} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`
}

function RoboticsReadout({ model }: { model: ReturnType<typeof calculateRobotics> }) {
  return <MechanicalPanel variant="highlighted" className="robotics-readout">
    <div className="robotics-readout__head">
      <TechnicalLabel prefix="ROBOTICS">KINEMATIC ARM</TechnicalLabel>
      <span className="robotics-status"><i />STATE / {model.state}</span>
    </div>
    <div className="robotics-readout__grid">
      <div><span>JOINT 01</span><strong>{model.joint1 >= 0 ? '+' : ''}{model.joint1}°</strong></div>
      <div><span>JOINT 02</span><strong>{model.joint2 >= 0 ? '+' : ''}{model.joint2}°</strong></div>
      <div><span>END EFFECTOR X</span><strong>{model.endEffector.x.toFixed(1)} / CONCEPTUAL</strong></div>
      <div><span>END EFFECTOR Y</span><strong>{model.endEffector.y.toFixed(1)} / CONCEPTUAL</strong></div>
      <div><span>REACH</span><strong>{model.reach.toFixed(1)} / CONCEPTUAL</strong></div>
      <div><span>TARGET OFFSET</span><strong>{model.targetOffset.toFixed(1)} / CONCEPTUAL</strong></div>
    </div>
    <div className="robotics-readout__formula"><span>FORWARD KINEMATICS</span><strong>2-LINK PLANAR MODEL</strong></div>
    <p className="technical-small robotics-readout__note">VISUAL SCALE / L1 {LINK_1} · L2 {LINK_2} &nbsp; | &nbsp; CONCEPTUAL VISUALIZATION / NO PHYSICAL ROBOT SPECIFICATIONS</p>
  </MechanicalPanel>
}

export function RoboticsInstrument() {
  const [joint1, setJoint1] = useState(25)
  const [joint2, setJoint2] = useState(40)
  const { isBlueprint } = useRepresentation()
  const reducedMotion = useReducedMotion()
  const framerReduced = useFramerReducedMotion()
  const model = useMemo(() => calculateRobotics(joint1, joint2), [joint1, joint2])
  const fk = model
  const p1 = toSvgPoint(fk.link1End, origin, scale)
  const p2 = toSvgPoint(fk.endEffector, origin, scale)
  const pt = toSvgPoint(target, origin, scale)
  const transition = reducedMotion || framerReduced ? { duration: 0 } : { duration: .22, ease: 'easeInOut' as const }
  const targetLine = `M ${p2.x.toFixed(1)} ${p2.y.toFixed(1)} L ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`
  const joint1Label = svgPolarPoint(origin, 56, model.joint1 / 2)
  const joint2Label = svgPolarPoint(p1, 43, model.joint1 + model.joint2 / 2)

  return <div className={`robotics-instrument ${isBlueprint ? 'is-blueprint' : 'is-reality'}`}>
    <div className="robotics-instrument__visual" aria-hidden="true">
      <svg viewBox="0 0 660 420" role="presentation">
        <g className="robotics-workspace">
          <circle cx={origin.x} cy={origin.y} r={model.maxReach * scale} />
          <circle cx={origin.x} cy={origin.y} r={model.minReach * scale} />
        </g>
        <g className="robotics-axes">
          <path d={`M ${origin.x - 175} ${origin.y} H ${origin.x + 175} M ${origin.x} ${origin.y + 145} V ${origin.y - 155}`} />
          <text x={origin.x + 164} y={origin.y - 8}>X</text><text x={origin.x + 8} y={origin.y - 139}>Y</text><text x={origin.x + 8} y={origin.y + 16}>O</text>
        </g>
        <g className="robotics-target">
          <path d={`M ${pt.x - 9} ${pt.y} H ${pt.x + 9} M ${pt.x} ${pt.y - 9} V ${pt.y + 9}`} />
          <circle cx={pt.x} cy={pt.y} r="4" />
          <text x={pt.x + 12} y={pt.y - 9}>TARGET / T01</text>
        </g>
        <motion.path className="robotics-target-line" d={targetLine} initial={false} animate={{ opacity: .72 }} transition={transition} />
        <path className="robotics-centerline" d={`M ${origin.x} ${origin.y} L ${p2.x} ${p2.y}`} />
        <path className="robotics-angle-arc" d={arcPath(origin, 42, 0, model.joint1)} />
        <path className="robotics-angle-arc robotics-angle-arc--elbow" d={arcPath({ x: 0, y: 0 }, 29, model.joint1, model.joint1 + model.joint2)} transform={`translate(${p1.x} ${p1.y})`} />
        <text className="robotics-angle-label" x={joint1Label.x + 3} y={joint1Label.y - 3}>θ1</text>
        <text className="robotics-angle-label" x={joint2Label.x + 3} y={joint2Label.y - 3}>θ2</text>
        <motion.line className="robotics-link robotics-link--one" x1={origin.x} y1={origin.y} x2={p1.x} y2={p1.y} initial={false} animate={{ x2: p1.x, y2: p1.y }} transition={transition} />
        <motion.line className="robotics-link robotics-link--two" x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} initial={false} animate={{ x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y }} transition={transition} />
        <g className="robotics-base"><rect x={origin.x - 43} y={origin.y + 8} width="86" height="18" rx="2" /><path d={`M ${origin.x - 27} ${origin.y + 26} v8 h54 v-8`} /></g>
        <g className="robotics-joint"><circle cx={origin.x} cy={origin.y} r="15" /><circle cx={origin.x} cy={origin.y} r="5" /><text x={origin.x - 9} y={origin.y + 34}>J1</text></g>
        <g className="robotics-joint"><circle cx={p1.x} cy={p1.y} r="13" /><circle cx={p1.x} cy={p1.y} r="4" /><text x={p1.x + 16} y={p1.y + 5}>J2</text></g>
        <g className="robotics-effector"><path d={`M ${p2.x - 8} ${p2.y - 8} L ${p2.x + 10} ${p2.y} L ${p2.x - 8} ${p2.y + 8} Z`} /><circle cx={p2.x} cy={p2.y} r="3" /></g>
      </svg>
      <span className="robotics-annotation robotics-annotation--kinematic">FORWARD KINEMATICS / JOINT ANGLES → END EFFECTOR POSITION</span>
      <span className="robotics-annotation robotics-annotation--workspace">REACHABLE REGION / CONCEPTUAL</span>
      <span className="robotics-annotation robotics-annotation--offset">TARGET OFFSET / CONCEPTUAL</span>
    </div>

    <div className="robotics-controls">
      {[['JOINT 01', joint1, setJoint1], ['JOINT 02', joint2, setJoint2]].map(([label, value, setter], index) => {
        const set = setter as (value: number) => void
        const numeric = value as number
        return <div className="robotics-control" key={label as string}>
          <div className="robotics-control__head"><TechnicalLabel prefix={`J0${index + 1}`}>{label as string}</TechnicalLabel><output>{numeric >= 0 ? '+' : ''}{numeric}°</output></div>
          <div className="robotics-control__rail">
            <button type="button" onClick={() => set(Math.max(-150, numeric - 1))} aria-label={`Decrease ${label as string} angle`}>−</button>
            <span className="robotics-control__dial" aria-hidden="true"><i style={{ transform: `rotate(${numeric}deg)` }} /></span>
            <input type="range" min="-150" max="150" step="1" value={numeric} onChange={e => set(Number(e.target.value))} aria-label={`${label as string} angle`} />
            <button type="button" onClick={() => set(Math.min(150, numeric + 1))} aria-label={`Increase ${label as string} angle`}>+</button>
          </div>
          <div className="robotics-control__scale"><span>−150°</span><span>0°</span><span>+150°</span></div>
        </div>
      })}
    </div>
    <div className="robotics-live"><span><i />ARM / READY</span><span>VISUAL SCALE / CONCEPTUAL</span></div>
    <RoboticsReadout model={model} />
  </div>
}
