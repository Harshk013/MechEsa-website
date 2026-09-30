import { useMemo, useState } from 'react'
import { useRepresentation } from '../../../app/providers/RepresentationProvider'
import { MechanicalButton } from '../../mechanical/MechanicalButton'
import { MechanicalPanel } from '../../mechanical/MechanicalPanel'
import { TechnicalLabel } from '../../typography/TechnicalLabel'

type SupportedSystem = 'design' | 'automotive' | 'materials' | 'mechatronics'
type InstrumentConfig = {
  title: string
  label: string
  unit: string
  min: number
  max: number
  initial: number
  start: string
  middle: string
  end: string
  note: string
}

const configs: Record<SupportedSystem, InstrumentConfig> = {
  design: {
    title: 'FOUR-BAR LINKAGE',
    label: 'DRIVE ANGLE',
    unit: '°',
    min: 20,
    max: 160,
    initial: 62,
    start: '20° / RETRACT',
    middle: '90° / TRANSFER',
    end: '160° / EXTEND',
    note: 'A planar mechanism study. Move the input crank to inspect how rotary motion transfers through the linkage.',
  },
  automotive: {
    title: 'DRIVETRAIN LOAD',
    label: 'THROTTLE INPUT',
    unit: '%',
    min: 0,
    max: 100,
    initial: 38,
    start: '0 / IDLE',
    middle: '50 / CRUISE',
    end: '100 / LOAD',
    note: 'A simplified power-transfer study. Throttle changes the relative engine, transmission and wheel response.',
  },
  materials: {
    title: 'BEAM RESPONSE',
    label: 'APPLIED LOAD',
    unit: '%',
    min: 0,
    max: 100,
    initial: 42,
    start: '0 / CLEAR',
    middle: '50 / TEST',
    end: '100 / LIMIT',
    note: 'A normalized bending study. Increase the load to compare deflection and stress trends without implying material specifications.',
  },
  mechatronics: {
    title: 'CLOSED-LOOP ACTUATOR',
    label: 'TARGET POSITION',
    unit: '%',
    min: 0,
    max: 100,
    initial: 58,
    start: '0 / HOME',
    middle: '50 / TRACK',
    end: '100 / END',
    note: 'A position-control study. The target and sensed carriage positions illustrate a small, intentional control error.',
  },
}

type Readout = { label: string; value: string }
const clamp = (value: number, config: InstrumentConfig) =>
  Math.min(config.max, Math.max(config.min, Math.round(value)))

function getReadouts(system: SupportedSystem, value: number): Readout[] {
  if (system === 'design')
    return [
      { label: 'INPUT CRANK', value: `${value}°` },
      { label: 'OUTPUT ROCKER', value: `${Math.round(18 + value * 0.31)}°` },
      {
        label: 'TRANSMISSION INDEX',
        value: (0.62 + Math.abs(Math.sin((value * Math.PI) / 180)) * 0.34).toFixed(2),
      },
      {
        label: 'STATE',
        value: value < 70 ? 'RETRACT' : value > 125 ? 'EXTEND' : 'TRANSFER',
      },
    ]
  if (system === 'automotive')
    return [
      { label: 'ENGINE SPEED', value: `${Math.round(820 + value * 46)} RPM` },
      { label: 'DRIVE TORQUE INDEX', value: `${Math.round(value * 0.86)} %` },
      { label: 'OUTPUT SPEED INDEX', value: `${Math.round(value * 0.58)} %` },
      {
        label: 'STATE',
        value: value < 8 ? 'IDLE' : value > 78 ? 'HIGH LOAD' : 'DRIVE',
      },
    ]
  if (system === 'materials') {
    const deflection = Math.pow(value / 100, 2) * 28
    return [
      { label: 'LOAD INDEX', value: `${value} %` },
      { label: 'DEFLECTION INDEX', value: `${deflection.toFixed(1)} mm` },
      {
        label: 'STRESS TREND',
        value: `${Math.round(Math.pow(value / 100, 1.35) * 100)} %`,
      },
      {
        label: 'STATE',
        value: value > 78 ? 'HIGH RESPONSE' : value > 35 ? 'ELASTIC STUDY' : 'LOW LOAD',
      },
    ]
  }
  const sensed = Math.max(0, Math.min(100, value - 4 + (value > 78 ? 2 : 0)))
  return [
    { label: 'TARGET', value: `${value} %` },
    { label: 'SENSED POSITION', value: `${sensed.toFixed(0)} %` },
    { label: 'TRACKING ERROR', value: `${Math.abs(value - sensed).toFixed(0)} %` },
    { label: 'ACTUATOR DUTY', value: `${Math.round(Math.min(96, value * 0.8 + 14))} %` },
  ]
}

/* ─── 1. DESIGN: Four-Bar Linkage ────────────────────────────────────────── */
function LinkageDiagram({ value, isBlueprint }: { value: number; isBlueprint: boolean }) {
  const angle = (value * Math.PI) / 180
  const pivot = { x: 168, y: 194 }
  const crank = {
    x: pivot.x + Math.cos(angle) * 84,
    y: pivot.y - Math.sin(angle) * 84,
  }
  const rocker = { x: 456, y: 194 }
  const outputAngle = ((18 + value * 0.31) * Math.PI) / 180
  const output = {
    x: rocker.x + Math.cos(Math.PI - outputAngle) * 90,
    y: rocker.y - Math.sin(Math.PI - outputAngle) * 90,
  }

  return (
    <svg viewBox="0 0 620 350" role="img" aria-label="Four-bar linkage diagram responding to the drive angle">
      <Grid isBlueprint={isBlueprint} />

      {/* Blueprint Construction & Dimensions Layer */}
      {isBlueprint && (
        <g className="blueprint-overlay" aria-hidden="true">
          {/* Coordinate Datum Origin at Pivot A */}
          <path d={`M ${pivot.x - 24} ${pivot.y} H ${pivot.x + 24} M ${pivot.x} ${pivot.y - 24} V ${pivot.y + 24}`} stroke="var(--representation-blueprint-line)" strokeWidth="0.8" strokeDasharray="3 3" />
          <text x={pivot.x - 38} y={pivot.y + 16} className="blueprint-dimension-text">DATUM [A]</text>
          
          {/* Ground link dimension line */}
          <path d={`M ${pivot.x} ${pivot.y + 40} H ${rocker.x} M ${pivot.x} ${pivot.y + 34} V ${pivot.y + 46} M ${rocker.x} ${rocker.y + 34} V ${rocker.y + 46}`} stroke="var(--representation-blueprint-line)" strokeWidth="0.8" />
          <text x={(pivot.x + rocker.x) / 2 - 26} y={pivot.y + 54} className="blueprint-dimension-text">L0 = 288 mm</text>

          {/* Crank dimension callout */}
          <text x={pivot.x - 18} y={pivot.y - 48} className="blueprint-annotation-text">L1 = 84 mm (r)</text>

          {/* Coupler dimension callout */}
          <text x={(crank.x + output.x) / 2 - 20} y={(crank.y + output.y) / 2 - 12} className="blueprint-annotation-text">L2 = 320 mm</text>

          {/* Rocker dimension callout */}
          <text x={rocker.x + 14} y={rocker.y - 48} className="blueprint-annotation-text">L3 = 90 mm</text>

          {/* Joint Pin Center Crosshairs */}
          {[pivot, crank, output, rocker].map((pt, i) => (
            <path key={i} d={`M ${pt.x - 5} ${pt.y} H ${pt.x + 5} M ${pt.x} ${pt.y - 5} V ${pt.y + 5}`} stroke="var(--representation-blueprint-accent)" strokeWidth="1" />
          ))}

          {/* Angle θ dimension arc readout */}
          <text x={pivot.x + 42} y={pivot.y - 18} className="blueprint-angle-callout">θ = {value}°</text>

          {/* Drawing Title Block */}
          <text x="24" y="28" className="blueprint-title-block">DWG: MECH-LINK-01 // REV C</text>
          <text x="24" y="42" className="blueprint-subtitle-block">KINEMATIC CHAIN / 1-DOF PLANAR</text>
        </g>
      )}

      {/* Mechanical Datum Lines */}
      <path
        className="mechanical-study__datum"
        d={`M${pivot.x} ${pivot.y} H${rocker.x} M${pivot.x} ${pivot.y - 132}V${pivot.y + 78} M${rocker.x} ${rocker.y - 132}V${rocker.y + 78}`}
      />
      <path className="mechanical-study__ground" d="M104 234 H518" />

      {/* Links */}
      <line className="mechanical-study__link mechanical-study__link--input" x1={pivot.x} y1={pivot.y} x2={crank.x} y2={crank.y} />
      <line className="mechanical-study__link" x1={crank.x} y1={crank.y} x2={output.x} y2={output.y} />
      <line className="mechanical-study__link mechanical-study__link--output" x1={rocker.x} y1={rocker.y} x2={output.x} y2={output.y} />

      {/* Link Centerlines in Blueprint Mode */}
      {isBlueprint && (
        <g className="blueprint-centerlines" stroke="var(--representation-blueprint-line)" strokeWidth="1" strokeDasharray="6 3 2 3" aria-hidden="true">
          <line x1={pivot.x} y1={pivot.y} x2={crank.x} y2={crank.y} />
          <line x1={crank.x} y1={crank.y} x2={output.x} y2={output.y} />
          <line x1={rocker.x} y1={rocker.y} x2={output.x} y2={output.y} />
        </g>
      )}

      {/* Kinematic Joints */}
      {[pivot, crank, output, rocker].map((point, index) => (
        <g key={index}>
          <circle
            className="mechanical-study__joint"
            cx={point.x}
            cy={point.y}
            r={index === 1 || index === 2 ? 8 : 11}
          />
          <circle className="mechanical-study__joint-core" cx={point.x} cy={point.y} r="3" />
        </g>
      ))}

      {/* Drive Angle Arc */}
      <path
        className="mechanical-study__angle"
        d={`M ${pivot.x + 32} ${pivot.y} A 32 32 0 0 0 ${pivot.x + Math.cos(angle) * 32} ${pivot.y - Math.sin(angle) * 32}`}
      />

      <Label x="104" y="52">INPUT / CRANK</Label>
      <Label x="402" y="52">OUTPUT / ROCKER</Label>
      <Label x="282" y="296">COUPLER / MOTION TRANSFER</Label>
    </svg>
  )
}

/* ─── 2. AUTOMOTIVE: Drivetrain Load ─────────────────────────────────────── */
function DrivetrainDiagram({ value, isBlueprint }: { value: number; isBlueprint: boolean }) {
  const engineRotation = value * 2.4
  const wheelRotation = value * 1.16

  return (
    <svg viewBox="0 0 620 350" role="img" aria-label="Drivetrain response to throttle input">
      <Grid isBlueprint={isBlueprint} />

      {/* Blueprint Vehicle / Chassis Schematics */}
      {isBlueprint && (
        <g className="blueprint-overlay" aria-hidden="true">
          {/* Chassis Reference Datum Line */}
          <path d="M 80 110 H 540" stroke="var(--representation-blueprint-line)" strokeWidth="0.8" strokeDasharray="6 4" />
          <text x="82" y="102" className="blueprint-dimension-text">CHASSIS DATUM REF: CL-01</text>
          
          {/* Wheelbase Dimension */}
          <path d="M 166 260 H 468 M 166 254 V 266 M 468 254 V 266" stroke="var(--representation-blueprint-line)" strokeWidth="0.8" />
          <text x="280" y="274" className="blueprint-dimension-text">WHEELBASE = 1850 mm</text>

          {/* Engine Flywheel PCD */}
          <circle cx="166" cy="180" r="57" fill="none" stroke="var(--representation-blueprint-accent)" strokeWidth="0.7" strokeDasharray="3 3" />
          <text x="130" y="248" className="blueprint-annotation-text">PCD ⌀114</text>

          {/* Transmission Pinion PCD */}
          <circle cx="314" cy="180" r="42" fill="none" stroke="var(--representation-blueprint-accent)" strokeWidth="0.7" strokeDasharray="3 3" />
          <text x="290" y="235" className="blueprint-annotation-text">PCD ⌀84</text>

          {/* Wheel Rim PCD */}
          <circle cx="468" cy="180" r="66" fill="none" stroke="var(--representation-blueprint-accent)" strokeWidth="0.7" strokeDasharray="3 3" />
          <text x="444" y="258" className="blueprint-annotation-text">PCD ⌀132</text>

          {/* Center Crosshairs */}
          {[166, 314, 468].map((cx, idx) => (
            <path key={idx} d={`M ${cx - 7} 180 H ${cx + 7} M ${cx} 173 V 187`} stroke="var(--representation-blueprint-accent)" strokeWidth="1" />
          ))}

          {/* Bearing Blocks */}
          <rect x="220" y="170" width="16" height="20" fill="none" stroke="var(--representation-blueprint-line)" strokeWidth="1" />
          <rect x="375" y="170" width="16" height="20" fill="none" stroke="var(--representation-blueprint-line)" strokeWidth="1" />
          <text x="214" y="164" className="blueprint-dimension-text">BRG-01</text>
          <text x="370" y="164" className="blueprint-dimension-text">BRG-02</text>

          {/* Drawing Title Block */}
          <text x="24" y="28" className="blueprint-title-block">DWG: AUTO-DRV-02 // REV B</text>
          <text x="24" y="42" className="blueprint-subtitle-block">POWERTRAIN TRANSMISSION SCHEMATIC</text>
        </g>
      )}

      {/* Shaft */}
      <path className="mechanical-study__shaft" d="M132 180 H488" />
      {isBlueprint && (
        <path d="M 120 180 H 500" stroke="var(--representation-blueprint-accent)" strokeWidth="1" strokeDasharray="8 4 2 4" />
      )}

      {/* Engine Wheel */}
      <g transform={`rotate(${engineRotation} 166 180)`}>
        <circle className="mechanical-study__wheel" cx="166" cy="180" r="57" />
        <Spokes cx={166} cy={180} r={54} />
      </g>

      {/* Gear */}
      <g transform={`rotate(${-engineRotation * 0.58} 314 180)`}>
        <circle className="mechanical-study__gear" cx="314" cy="180" r="42" />
        <Spokes cx={314} cy={180} r={37} />
      </g>

      {/* Output Wheel */}
      <g transform={`rotate(${wheelRotation} 468 180)`}>
        <circle className="mechanical-study__wheel" cx="468" cy="180" r="66" />
        <Spokes cx={468} cy={180} r={61} />
      </g>

      <path className="mechanical-study__flow" d="M235 154H270 M358 154H402" />
      <Label x="119" y="75">ENGINE / INPUT</Label>
      <Label x="273" y="99">GEAR SET</Label>
      <Label x="425" y="75">WHEEL / OUTPUT</Label>
      <Label x="228" y="294">TORQUE FLOW →</Label>
    </svg>
  )
}

/* ─── 3. MATERIALS: Beam Bending ─────────────────────────────────────────── */
function BeamDiagram({ value, isBlueprint }: { value: number; isBlueprint: boolean }) {
  const deflection = Math.pow(value / 100, 2) * 30

  return (
    <svg viewBox="0 0 620 350" role="img" aria-label="Beam bending response to applied load">
      <Grid isBlueprint={isBlueprint} />

      {/* Blueprint Structural Dimensions & Free-Body Vectors */}
      {isBlueprint && (
        <g className="blueprint-overlay" aria-hidden="true">
          {/* Neutral Axis */}
          <path d="M 90 193 H 530" stroke="var(--representation-blueprint-line)" strokeWidth="0.8" strokeDasharray="8 4 2 4" />
          <text x="40" y="196" className="blueprint-dimension-text">N.A. ℄</text>

          {/* Span Dimension L = 400mm */}
          <path d="M 110 264 H 510 M 110 258 V 270 M 510 258 V 270" stroke="var(--representation-blueprint-line)" strokeWidth="0.8" />
          <text x="278" y="278" className="blueprint-dimension-text">SPAN L = 400 mm</text>

          {/* Reaction Force Vectors */}
          <path d="M 110 236 V 205 M 105 214 L 110 203 L 115 214" stroke="var(--representation-blueprint-accent)" strokeWidth="1.5" />
          <text x="88" y="218" className="blueprint-annotation-text">RA</text>

          <path d="M 510 236 V 205 M 505 214 L 510 203 L 515 214" stroke="var(--representation-blueprint-accent)" strokeWidth="1.5" />
          <text x="518" y="218" className="blueprint-annotation-text">RB</text>

          {/* Applied Load Dimension */}
          <text x="326" y="112" className="blueprint-angle-callout">F = {value} kN</text>

          {/* Midspan Deflection Callout */}
          <text x="324" y={204 + deflection} className="blueprint-dimension-text">
            δ = {deflection.toFixed(1)} mm
          </text>

          {/* Theoretical Formula Callout */}
          <text x="24" y="28" className="blueprint-title-block">DWG: MAT-BEAM-03 // ELASTIC</text>
          <text x="24" y="42" className="blueprint-subtitle-block">δ_max = FL³ / 48EI · σ = My / I</text>
        </g>
      )}

      {/* Physical / Reality Beam Geometry */}
      <path className="mechanical-study__datum" d="M110 193 H510" />
      <path className="mechanical-study__beam" d={`M110 193 Q310 ${193 + deflection} 510 193`} />
      <path className="mechanical-study__support" d="M110 193 l-22 42 h44z M510 193 l-22 42 h44z" />
      <path className="mechanical-study__ground" d="M72 241 H548" />
      <path className="mechanical-study__load" d="M310 83V154 M298 143L310 155L322 143" />
      <path className="mechanical-study__dimension" d={`M543 193 V${193 + deflection} M534 193H552 M534 ${193 + deflection}H552`} />

      <Label x="270" y="64">APPLIED LOAD</Label>
      <Label x="449" y="288">RESPONSE / Δ</Label>
      <Label x="100" y="300">SIMPLY SUPPORTED BEAM</Label>
    </svg>
  )
}

/* ─── 4. MECHATRONICS: Closed-Loop Actuator ─────────────────────────────── */
function ActuatorDiagram({ value, isBlueprint }: { value: number; isBlueprint: boolean }) {
  const target = 132 + value * 3.56
  const sensed = 132 + Math.max(0, Math.min(100, value - 4 + (value > 78 ? 2 : 0))) * 3.56

  return (
    <svg viewBox="0 0 620 350" role="img" aria-label="Closed-loop actuator showing target and sensed position">
      <Grid isBlueprint={isBlueprint} />

      {/* Blueprint Electromechanical Schematics */}
      {isBlueprint && (
        <g className="blueprint-overlay" aria-hidden="true">
          {/* Encoder Graduation Scale along rail */}
          <path d="M 112 142 H 508" stroke="var(--representation-blueprint-line)" strokeWidth="0.8" />
          {Array.from({ length: 21 }, (_, i) => {
            const x = 112 + i * 19.8
            return (
              <line key={i} x1={x} y1="138" x2={x} y2={i % 5 === 0 ? "146" : "143"} stroke="var(--representation-blueprint-line)" strokeWidth="0.8" />
            )
          })}
          <text x="108" y="132" className="blueprint-dimension-text">0 mm</text>
          <text x="488" y="132" className="blueprint-dimension-text">100 mm</text>

          {/* Limit Switches */}
          <rect x="94" y="168" width="14" height="24" fill="none" stroke="var(--representation-blueprint-accent)" strokeWidth="1" />
          <text x="82" y="204" className="blueprint-dimension-text">LS-MIN</text>

          <rect x="512" y="168" width="14" height="24" fill="none" stroke="var(--representation-blueprint-accent)" strokeWidth="1" />
          <text x="506" y="204" className="blueprint-dimension-text">LS-MAX</text>

          {/* Live Position & Error Readout Overlay */}
          <text x="24" y="28" className="blueprint-title-block">DWG: MECH-ACT-04 // CLOSED-LOOP</text>
          <text x="24" y="42" className="blueprint-subtitle-block">
            PID CONTROL LOOP // ENCODER: OPTICAL 1000 CPR
          </text>
          <text x="420" y="28" className="blueprint-angle-callout">
            POS: {sensed.toFixed(1)} mm
          </text>
          <text x="420" y="42" className="blueprint-annotation-text">
            ERROR e(t): {Math.abs(target - sensed).toFixed(1)} mm
          </text>
        </g>
      )}

      {/* Rail & Shaft */}
      <rect className="mechanical-study__rail" x="112" y="148" width="396" height="65" rx="3" />
      <path className="mechanical-study__shaft" d="M132 180H488" />
      <path className="mechanical-study__target" d={`M${target} 96V239`} />

      <Label x={Math.min(458, target - 32)} y="81">TARGET</Label>

      {/* Sensed Carriage */}
      <g transform={`translate(${sensed} 180)`}>
        <rect className="mechanical-study__carriage" x="-31" y="-39" width="62" height="78" rx="3" />
        <circle className="mechanical-study__joint-core" r="10" />
        <path className="mechanical-study__spokes" d="M-19 0H19 M0-19V19" />
      </g>

      <path className="mechanical-study__flow" d="M108 273H508" />
      <Label x="104" y="295">CONTROLLER → ACTUATOR → SENSOR</Label>
      <Label x="135" y="130">LINEAR STAGE</Label>
      <Label x="401" y="130">SENSED CARRIAGE</Label>
    </svg>
  )
}

function Grid({ isBlueprint }: { isBlueprint?: boolean }) {
  if (isBlueprint) {
    return (
      <g className="blueprint-cad-grid" aria-hidden="true">
        {/* Dual-cad grid lines */}
        <path
          className="mechanical-study__grid"
          d="M72 64H548 M72 120H548 M72 176H548 M72 232H548 M72 288H548 M116 40V310 M216 40V310 M316 40V310 M416 40V310 M516 40V310"
        />
        {/* Corner Datum Crosshairs */}
        <path d="M 72 40 H 84 M 72 40 V 52" stroke="var(--representation-blueprint-line)" strokeWidth="1" />
        <path d="M 548 40 H 536 M 548 40 V 52" stroke="var(--representation-blueprint-line)" strokeWidth="1" />
        <path d="M 72 310 H 84 M 72 310 V 298" stroke="var(--representation-blueprint-line)" strokeWidth="1" />
        <path d="M 548 310 H 536 M 548 310 V 298" stroke="var(--representation-blueprint-line)" strokeWidth="1" />
      </g>
    )
  }
  return (
    <path
      className="mechanical-study__grid"
      d="M72 64H548 M72 120H548 M72 176H548 M72 232H548 M72 288H548 M116 40V310 M216 40V310 M316 40V310 M416 40V310 M516 40V310"
    />
  )
}

function Label({ x, y, children }: { x: number | string; y: number | string; children: string }) {
  return (
    <text className="mechanical-study__svg-label" x={x} y={y}>
      {children}
    </text>
  )
}

function Spokes({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <path
      className="mechanical-study__spokes"
      d={`M${cx} ${cy - r}V${cy + r} M${cx - r} ${cy}H${cx + r} M${cx - r * 0.7} ${cy - r * 0.7}L${cx + r * 0.7} ${cy + r * 0.7} M${cx + r * 0.7} ${cy - r * 0.7}L${cx - r * 0.7} ${cy + r * 0.7}`}
    />
  )
}

function StudyDiagram({
  system,
  value,
  isBlueprint,
}: {
  system: SupportedSystem
  value: number
  isBlueprint: boolean
}) {
  if (system === 'design') return <LinkageDiagram value={value} isBlueprint={isBlueprint} />
  if (system === 'automotive') return <DrivetrainDiagram value={value} isBlueprint={isBlueprint} />
  if (system === 'materials') return <BeamDiagram value={value} isBlueprint={isBlueprint} />
  return <ActuatorDiagram value={value} isBlueprint={isBlueprint} />
}

export function MechanicalSystemsInstrument({ system }: { system: SupportedSystem }) {
  const config = configs[system]
  const [value, setValue] = useState(config.initial)
  const { isBlueprint } = useRepresentation()
  const readouts = useMemo(() => getReadouts(system, value), [system, value])

  const adjust = (amount: number) => setValue((current) => clamp(current + amount, config))

  return (
    <div className={`mechanical-systems-instrument ${isBlueprint ? 'is-blueprint' : 'is-reality'}`}>
      <div className="mechanical-systems-instrument__visual">
        <StudyDiagram system={system} value={value} isBlueprint={isBlueprint} />
      </div>

      <div className="mechanical-systems-instrument__control">
        <div className="mechanical-systems-instrument__control-head">
          <TechnicalLabel prefix="ADJUST">{config.label}</TechnicalLabel>
          <output htmlFor={`mechanical-control-${system}`}>
            {value}
            {config.unit}
          </output>
        </div>

        <div className="mechanical-systems-instrument__rail">
          <button
            type="button"
            onClick={() => adjust(-5)}
            aria-label={`Decrease ${config.label.toLowerCase()} by 5`}
          >
            −
          </button>
          <input
            id={`mechanical-control-${system}`}
            type="range"
            min={config.min}
            max={config.max}
            step="1"
            value={value}
            onChange={(event) => setValue(Number(event.target.value))}
            aria-label={config.label}
          />
          <button
            type="button"
            onClick={() => adjust(5)}
            aria-label={`Increase ${config.label.toLowerCase()} by 5`}
          >
            +
          </button>
          <MechanicalButton
            variant="technical"
            className="mechanical-systems-instrument__reset"
            onClick={() => setValue(config.initial)}
          >
            RESET
          </MechanicalButton>
        </div>

        <div className="mechanical-systems-instrument__scale technical-small">
          <span>{config.start}</span>
          <span>{config.middle}</span>
          <span>{config.end}</span>
        </div>
      </div>

      <MechanicalPanel
        variant="highlighted"
        className="mechanical-systems-instrument__readout"
        aria-live="polite"
      >
        <div className="mechanical-systems-instrument__readout-head">
          <TechnicalLabel prefix="MECHESA">{config.title}</TechnicalLabel>
          <span className="mechanical-systems-instrument__ready">
            <i />MODEL / ACTIVE
          </span>
        </div>
        <div className="mechanical-systems-instrument__readout-grid">
          {readouts.map((readout) => (
            <div key={readout.label}>
              <span>{readout.label}</span>
              <strong>{readout.value}</strong>
            </div>
          ))}
        </div>
        <p className="technical-small mechanical-systems-instrument__note">
          {config.note} NORMALIZED STUDY / NOT A LABORATORY MEASUREMENT.
        </p>
      </MechanicalPanel>
    </div>
  )
}
