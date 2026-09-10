import { useMemo, useState } from 'react'
import { useRepresentation } from '../../../app/providers/RepresentationProvider'
import { MechanicalButton } from '../../mechanical/MechanicalButton'
import { MechanicalPanel } from '../../mechanical/MechanicalPanel'
import { TechnicalLabel } from '../../typography/TechnicalLabel'

type SupportedSystem = 'design' | 'automotive' | 'materials' | 'mechatronics'
type InstrumentConfig = { title: string; label: string; unit: string; min: number; max: number; initial: number; start: string; middle: string; end: string; note: string }

const configs: Record<SupportedSystem, InstrumentConfig> = {
  design: { title: 'FOUR-BAR LINKAGE', label: 'DRIVE ANGLE', unit: '°', min: 20, max: 160, initial: 62, start: '20° / RETRACT', middle: '90° / TRANSFER', end: '160° / EXTEND', note: 'A planar mechanism study. Move the input crank to inspect how rotary motion transfers through the linkage.' },
  automotive: { title: 'DRIVETRAIN LOAD', label: 'THROTTLE INPUT', unit: '%', min: 0, max: 100, initial: 38, start: '0 / IDLE', middle: '50 / CRUISE', end: '100 / LOAD', note: 'A simplified power-transfer study. Throttle changes the relative engine, transmission and wheel response.' },
  materials: { title: 'BEAM RESPONSE', label: 'APPLIED LOAD', unit: '%', min: 0, max: 100, initial: 42, start: '0 / CLEAR', middle: '50 / TEST', end: '100 / LIMIT', note: 'A normalized bending study. Increase the load to compare deflection and stress trends without implying material specifications.' },
  mechatronics: { title: 'CLOSED-LOOP ACTUATOR', label: 'TARGET POSITION', unit: '%', min: 0, max: 100, initial: 58, start: '0 / HOME', middle: '50 / TRACK', end: '100 / END', note: 'A position-control study. The target and sensed carriage positions illustrate a small, intentional control error.' },
}

type Readout = { label: string; value: string }
const clamp = (value: number, config: InstrumentConfig) => Math.min(config.max, Math.max(config.min, Math.round(value)))

function getReadouts(system: SupportedSystem, value: number): Readout[] {
  if (system === 'design') return [
    { label: 'INPUT CRANK', value: `${value}°` }, { label: 'OUTPUT ROCKER', value: `${Math.round(18 + value * .31)}°` },
    { label: 'TRANSMISSION INDEX', value: (0.62 + Math.abs(Math.sin(value * Math.PI / 180)) * .34).toFixed(2) }, { label: 'STATE', value: value < 70 ? 'RETRACT' : value > 125 ? 'EXTEND' : 'TRANSFER' },
  ]
  if (system === 'automotive') return [
    { label: 'ENGINE SPEED', value: `${Math.round(820 + value * 46)} RPM` }, { label: 'DRIVE TORQUE INDEX', value: `${Math.round(value * .86)} %` },
    { label: 'OUTPUT SPEED INDEX', value: `${Math.round(value * .58)} %` }, { label: 'STATE', value: value < 8 ? 'IDLE' : value > 78 ? 'HIGH LOAD' : 'DRIVE' },
  ]
  if (system === 'materials') {
    const deflection = Math.pow(value / 100, 2) * 28
    return [{ label: 'LOAD INDEX', value: `${value} %` }, { label: 'DEFLECTION INDEX', value: `${deflection.toFixed(1)} mm` }, { label: 'STRESS TREND', value: `${Math.round(Math.pow(value / 100, 1.35) * 100)} %` }, { label: 'STATE', value: value > 78 ? 'HIGH RESPONSE' : value > 35 ? 'ELASTIC STUDY' : 'LOW LOAD' }]
  }
  const sensed = Math.max(0, Math.min(100, value - 4 + (value > 78 ? 2 : 0)))
  return [{ label: 'TARGET', value: `${value} %` }, { label: 'SENSED POSITION', value: `${sensed.toFixed(0)} %` }, { label: 'TRACKING ERROR', value: `${Math.abs(value - sensed).toFixed(0)} %` }, { label: 'ACTUATOR DUTY', value: `${Math.round(Math.min(96, value * .8 + 14))} %` }]
}

function LinkageDiagram({ value }: { value: number }) {
  const angle = value * Math.PI / 180, pivot = { x: 168, y: 194 }, crank = { x: pivot.x + Math.cos(angle) * 84, y: pivot.y - Math.sin(angle) * 84 }, rocker = { x: 456, y: 194 }, outputAngle = (18 + value * .31) * Math.PI / 180, output = { x: rocker.x + Math.cos(Math.PI - outputAngle) * 90, y: rocker.y - Math.sin(Math.PI - outputAngle) * 90 }
  return <svg viewBox="0 0 620 350" role="img" aria-label="Four-bar linkage diagram responding to the drive angle"><Grid /><path className="mechanical-study__datum" d={`M${pivot.x} ${pivot.y} H${rocker.x} M${pivot.x} ${pivot.y - 132}V${pivot.y + 78} M${rocker.x} ${rocker.y - 132}V${rocker.y + 78}`} /><path className="mechanical-study__ground" d="M104 234 H518" /><line className="mechanical-study__link mechanical-study__link--input" x1={pivot.x} y1={pivot.y} x2={crank.x} y2={crank.y} /><line className="mechanical-study__link" x1={crank.x} y1={crank.y} x2={output.x} y2={output.y} /><line className="mechanical-study__link mechanical-study__link--output" x1={rocker.x} y1={rocker.y} x2={output.x} y2={output.y} />{[pivot, crank, output, rocker].map((point, index) => <g key={index}><circle className="mechanical-study__joint" cx={point.x} cy={point.y} r={index === 1 || index === 2 ? 8 : 11} /><circle className="mechanical-study__joint-core" cx={point.x} cy={point.y} r="3" /></g>)}<path className="mechanical-study__angle" d={`M ${pivot.x + 32} ${pivot.y} A 32 32 0 0 0 ${pivot.x + Math.cos(angle) * 32} ${pivot.y - Math.sin(angle) * 32}`} /><Label x="104" y="52">INPUT / CRANK</Label><Label x="402" y="52">OUTPUT / ROCKER</Label><Label x="282" y="296">COUPLER / MOTION TRANSFER</Label></svg>
}

function DrivetrainDiagram({ value }: { value: number }) {
  const engineRotation = value * 2.4, wheelRotation = value * 1.16
  return <svg viewBox="0 0 620 350" role="img" aria-label="Drivetrain response to throttle input"><Grid /><path className="mechanical-study__shaft" d="M132 180 H488" /><g transform={`rotate(${engineRotation} 166 180)`}><circle className="mechanical-study__wheel" cx="166" cy="180" r="57" /><Spokes cx={166} cy={180} r={54} /></g><g transform={`rotate(${-engineRotation * .58} 314 180)`}><circle className="mechanical-study__gear" cx="314" cy="180" r="42" /><Spokes cx={314} cy={180} r={37} /></g><g transform={`rotate(${wheelRotation} 468 180)`}><circle className="mechanical-study__wheel" cx="468" cy="180" r="66" /><Spokes cx={468} cy={180} r={61} /></g><path className="mechanical-study__flow" d="M235 154H270 M358 154H402" /><Label x="119" y="75">ENGINE / INPUT</Label><Label x="273" y="99">GEAR SET</Label><Label x="425" y="75">WHEEL / OUTPUT</Label><Label x="228" y="294">TORQUE FLOW →</Label></svg>
}

function BeamDiagram({ value }: { value: number }) {
  const deflection = Math.pow(value / 100, 2) * 30
  return <svg viewBox="0 0 620 350" role="img" aria-label="Beam bending response to applied load"><Grid /><path className="mechanical-study__datum" d="M110 193 H510" /><path className="mechanical-study__beam" d={`M110 193 Q310 ${193 + deflection} 510 193`} /><path className="mechanical-study__support" d="M110 193 l-22 42 h44z M510 193 l-22 42 h44z" /><path className="mechanical-study__ground" d="M72 241 H548" /><path className="mechanical-study__load" d="M310 83V154 M298 143L310 155L322 143" /><path className="mechanical-study__dimension" d={`M543 193 V${193 + deflection} M534 193H552 M534 ${193 + deflection}H552`} /><Label x="270" y="64">APPLIED LOAD</Label><Label x="449" y="288">RESPONSE / Δ</Label><Label x="100" y="300">SIMPLY SUPPORTED BEAM</Label></svg>
}

function ActuatorDiagram({ value }: { value: number }) {
  const target = 132 + value * 3.56, sensed = 132 + Math.max(0, Math.min(100, value - 4 + (value > 78 ? 2 : 0))) * 3.56
  return <svg viewBox="0 0 620 350" role="img" aria-label="Closed-loop actuator showing target and sensed position"><Grid /><rect className="mechanical-study__rail" x="112" y="148" width="396" height="65" rx="3" /><path className="mechanical-study__shaft" d="M132 180H488" /><path className="mechanical-study__target" d={`M${target} 96V239`} /><Label x={Math.min(458, target - 32)} y="81">TARGET</Label><g transform={`translate(${sensed} 180)`}><rect className="mechanical-study__carriage" x="-31" y="-39" width="62" height="78" rx="3" /><circle className="mechanical-study__joint-core" r="10" /><path className="mechanical-study__spokes" d="M-19 0H19 M0-19V19" /></g><path className="mechanical-study__flow" d="M108 273H508" /><Label x="104" y="295">CONTROLLER → ACTUATOR → SENSOR</Label><Label x="135" y="130">LINEAR STAGE</Label><Label x="401" y="130">SENSED CARRIAGE</Label></svg>
}

function Grid() { return <path className="mechanical-study__grid" d="M72 64H548 M72 120H548 M72 176H548 M72 232H548 M72 288H548 M116 40V310 M216 40V310 M316 40V310 M416 40V310 M516 40V310" /> }
function Label({ x, y, children }: { x: number | string; y: number | string; children: string }) { return <text className="mechanical-study__svg-label" x={x} y={y}>{children}</text> }
function Spokes({ cx, cy, r }: { cx: number; cy: number; r: number }) { return <path className="mechanical-study__spokes" d={`M${cx} ${cy - r}V${cy + r} M${cx - r} ${cy}H${cx + r} M${cx - r * .7} ${cy - r * .7}L${cx + r * .7} ${cy + r * .7} M${cx + r * .7} ${cy - r * .7}L${cx - r * .7} ${cy + r * .7}`} /> }

function StudyDiagram({ system, value }: { system: SupportedSystem; value: number }) { if (system === 'design') return <LinkageDiagram value={value} />; if (system === 'automotive') return <DrivetrainDiagram value={value} />; if (system === 'materials') return <BeamDiagram value={value} />; return <ActuatorDiagram value={value} /> }

export function MechanicalSystemsInstrument({ system }: { system: SupportedSystem }) {
  const config = configs[system], [value, setValue] = useState(config.initial), { isBlueprint } = useRepresentation(), readouts = useMemo(() => getReadouts(system, value), [system, value])
  const adjust = (amount: number) => setValue(current => clamp(current + amount, config))
  return <div className={`mechanical-systems-instrument ${isBlueprint ? 'is-blueprint' : 'is-reality'}`}><div className="mechanical-systems-instrument__visual"><StudyDiagram system={system} value={value} /></div><div className="mechanical-systems-instrument__control"><div className="mechanical-systems-instrument__control-head"><TechnicalLabel prefix="ADJUST">{config.label}</TechnicalLabel><output htmlFor={`mechanical-control-${system}`}>{value}{config.unit}</output></div><div className="mechanical-systems-instrument__rail"><button type="button" onClick={() => adjust(-5)} aria-label={`Decrease ${config.label.toLowerCase()} by 5`}>−</button><input id={`mechanical-control-${system}`} type="range" min={config.min} max={config.max} step="1" value={value} onChange={event => setValue(Number(event.target.value))} aria-label={config.label} /><button type="button" onClick={() => adjust(5)} aria-label={`Increase ${config.label.toLowerCase()} by 5`}>+</button><MechanicalButton variant="technical" className="mechanical-systems-instrument__reset" onClick={() => setValue(config.initial)}>RESET</MechanicalButton></div><div className="mechanical-systems-instrument__scale technical-small"><span>{config.start}</span><span>{config.middle}</span><span>{config.end}</span></div></div><MechanicalPanel variant="highlighted" className="mechanical-systems-instrument__readout" aria-live="polite"><div className="mechanical-systems-instrument__readout-head"><TechnicalLabel prefix="MECHESA">{config.title}</TechnicalLabel><span className="mechanical-systems-instrument__ready"><i />MODEL / ACTIVE</span></div><div className="mechanical-systems-instrument__readout-grid">{readouts.map(readout => <div key={readout.label}><span>{readout.label}</span><strong>{readout.value}</strong></div>)}</div><p className="technical-small mechanical-systems-instrument__note">{config.note} NORMALIZED STUDY / NOT A LABORATORY MEASUREMENT.</p></MechanicalPanel></div>
}
