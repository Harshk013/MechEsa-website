import { useMemo } from 'react'
import './heroMechanicalEnvironment.css'

function createGearPath(cx: number, cy: number, teeth: number, pitchRadius: number, addendum: number, dedendum: number) {
  const ra = pitchRadius + addendum
  const rd = pitchRadius - dedendum
  const dTheta = (2 * Math.PI) / teeth
  let path = ''
  for (let i = 0; i < teeth; i++) {
    const th0 = i * dTheta
    const th1 = th0 + dTheta * 0.22
    const th2 = th0 + dTheta * 0.38
    const th3 = th0 + dTheta * 0.62
    const th4 = th0 + dTheta * 0.78
    const th5 = th0 + dTheta

    const p0 = [cx + rd * Math.cos(th0), cy + rd * Math.sin(th0)]
    const p1 = [cx + rd * Math.cos(th1), cy + rd * Math.sin(th1)]
    const p2 = [cx + ra * Math.cos(th2), cy + ra * Math.sin(th2)]
    const p3 = [cx + ra * Math.cos(th3), cy + ra * Math.sin(th3)]
    const p4 = [cx + rd * Math.cos(th4), cy + rd * Math.sin(th4)]
    const p5 = [cx + rd * Math.cos(th5), cy + rd * Math.sin(th5)]

    if (i === 0) path += `M ${p0[0].toFixed(1)} ${p0[1].toFixed(1)} `
    path += `L ${p1[0].toFixed(1)} ${p1[1].toFixed(1)} `
    path += `L ${p2[0].toFixed(1)} ${p2[1].toFixed(1)} `
    path += `L ${p3[0].toFixed(1)} ${p3[1].toFixed(1)} `
    path += `L ${p4[0].toFixed(1)} ${p4[1].toFixed(1)} `
    path += `L ${p5[0].toFixed(1)} ${p5[1].toFixed(1)} `
  }
  path += 'Z'
  return path
}

export function HeroMechanicalEnvironment() {
  const mainGearPath = useMemo(() => createGearPath(800, 480, 32, 370, 16, 18), [])
  const pinionGearPath = useMemo(() => createGearPath(1260, 240, 18, 160, 13, 14), [])
  const idlerGearPath = useMemo(() => createGearPath(340, 720, 16, 135, 11, 12), [])

  // Angular degree ticks for the large outer dial
  const dialTicks = useMemo(() => {
    const ticks = []
    const cx = 800
    const cy = 480
    const r1 = 580
    for (let deg = 0; deg < 360; deg += 5) {
      const isMajor = deg % 30 === 0
      const isSemi = deg % 15 === 0 && !isMajor
      const len = isMajor ? 14 : isSemi ? 9 : 5
      const rad = (deg * Math.PI) / 180
      const x1 = cx + r1 * Math.cos(rad)
      const y1 = cy + r1 * Math.sin(rad)
      const x2 = cx + (r1 + len) * Math.cos(rad)
      const y2 = cy + (r1 + len) * Math.sin(rad)
      ticks.push({
        id: deg,
        x1: x1.toFixed(1),
        y1: y1.toFixed(1),
        x2: x2.toFixed(1),
        y2: y2.toFixed(1),
        isMajor,
        label: isMajor ? `${deg.toString().padStart(3, '0')}°` : null,
        labelX: (cx + (r1 + 24) * Math.cos(rad)).toFixed(1),
        labelY: (cy + (r1 + 24) * Math.sin(rad) + 4).toFixed(1),
      })
    }
    return ticks
  }, [])

  return (
    <div className="home-hero__mechanical-env" aria-hidden="true">
      <div className="mech-env__atmosphere" />
      <svg
        className="mech-env__svg"
        viewBox="0 0 1600 1000"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Subtle gradient sweeps */}
          <radialGradient id="hubGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#151b20" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0c1013" stopOpacity="0.2" />
          </radialGradient>
          <linearGradient id="blueprintLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(130, 169, 199, 0.03)" />
            <stop offset="50%" stopColor="rgba(130, 169, 199, 0.16)" />
            <stop offset="100%" stopColor="rgba(130, 169, 199, 0.03)" />
          </linearGradient>
          <linearGradient id="axisGradH" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(205, 214, 219, 0.02)" />
            <stop offset="25%" stopColor="rgba(130, 169, 199, 0.14)" />
            <stop offset="75%" stopColor="rgba(130, 169, 199, 0.14)" />
            <stop offset="100%" stopColor="rgba(205, 214, 219, 0.02)" />
          </linearGradient>
          <linearGradient id="axisGradV" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(205, 214, 219, 0.02)" />
            <stop offset="25%" stopColor="rgba(130, 169, 199, 0.14)" />
            <stop offset="75%" stopColor="rgba(130, 169, 199, 0.14)" />
            <stop offset="100%" stopColor="rgba(205, 214, 219, 0.02)" />
          </linearGradient>
        </defs>

        {/* ── Layer 1: Blueprint Drafting Axes & Coordinate Guides ── */}
        <g className="mech-env__layer-axes">
          {/* Main Horizontal Datum */}
          <line x1="80" y1="480" x2="1520" y2="480" stroke="url(#axisGradH)" strokeWidth="1" strokeDasharray="8 6 2 6" />
          {/* Main Vertical Datum */}
          <line x1="800" y1="60" x2="800" y2="920" stroke="url(#axisGradV)" strokeWidth="1" strokeDasharray="8 6 2 6" />

          {/* Intersecting Pitch Center Axes */}
          <line x1="800" y1="480" x2="1260" y2="240" stroke="rgba(130, 169, 199, 0.11)" strokeWidth="1" strokeDasharray="3 4" />
          <line x1="800" y1="480" x2="340" y2="720" stroke="rgba(130, 169, 199, 0.09)" strokeWidth="1" strokeDasharray="3 4" />

          {/* Calibration grid lines */}
          <line x1="280" y1="120" x2="280" y2="860" stroke="rgba(205, 214, 219, 0.03)" strokeWidth="1" />
          <line x1="1320" y1="120" x2="1320" y2="860" stroke="rgba(205, 214, 219, 0.03)" strokeWidth="1" />
          <line x1="180" y1="260" x2="1420" y2="260" stroke="rgba(205, 214, 219, 0.03)" strokeWidth="1" />
          <line x1="180" y1="700" x2="1420" y2="700" stroke="rgba(205, 214, 219, 0.03)" strokeWidth="1" />
        </g>

        {/* ── Layer 2: Concentric Circular Precision Scales & Arcs ── */}
        <g className="mech-env__layer-concentric">
          {/* Large outer drafting dials */}
          <circle cx="800" cy="480" r="720" fill="none" stroke="rgba(130, 169, 199, 0.05)" strokeWidth="1" />
          <circle cx="800" cy="480" r="650" fill="none" stroke="rgba(130, 169, 199, 0.07)" strokeWidth="1" strokeDasharray="12 8" />
          <circle cx="800" cy="480" r="580" fill="none" stroke="rgba(205, 214, 219, 0.08)" strokeWidth="1" />

          {/* Angular Dial Ticks */}
          <g className="mech-env__dial-ticks">
            {dialTicks.map(t => (
              <g key={t.id}>
                <line
                  x1={t.x1}
                  y1={t.y1}
                  x2={t.x2}
                  y2={t.y2}
                  stroke={t.isMajor ? 'rgba(130, 169, 199, 0.22)' : 'rgba(205, 214, 219, 0.08)'}
                  strokeWidth={t.isMajor ? 1.5 : 1}
                />
                {t.label && (
                  <text
                    x={t.labelX}
                    y={t.labelY}
                    fill="rgba(130, 169, 199, 0.35)"
                    fontSize="8"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {t.label}
                  </text>
                )}
              </g>
            ))}
          </g>

          {/* Faint sweeping radar sweep segment */}
          <g className="mech-env__radar-sweep">
            <path
              d="M 800 480 L 1320 280 A 550 550 0 0 1 1350 480 Z"
              fill="rgba(130, 169, 199, 0.02)"
            />
          </g>

          {/* Dimension lead lines and callouts */}
          <circle cx="800" cy="480" r="480" fill="none" stroke="rgba(130, 169, 199, 0.09)" strokeWidth="1" strokeDasharray="4 6" />
          <circle cx="800" cy="480" r="280" fill="none" stroke="rgba(130, 169, 199, 0.08)" strokeWidth="1" strokeDasharray="2 5" />
        </g>

        {/* ── Layer 3: Rotating Large Planetary Gear (Central) ── */}
        <g className="mech-env__gear-cluster mech-env__gear--main">
          {/* Main Gear Teeth Profile */}
          <path
            d={mainGearPath}
            fill="none"
            stroke="rgba(205, 214, 219, 0.12)"
            strokeWidth="1.25"
            strokeLinejoin="round"
          />

          {/* Pitch Circle */}
          <circle
            cx="800"
            cy="480"
            r="370"
            fill="none"
            stroke="rgba(130, 169, 199, 0.18)"
            strokeWidth="1"
            strokeDasharray="6 4"
          />

          {/* Addendum & Dedendum Circles */}
          <circle cx="800" cy="480" r="386" fill="none" stroke="rgba(205, 214, 219, 0.05)" strokeWidth="1" />
          <circle cx="800" cy="480" r="352" fill="none" stroke="rgba(205, 214, 219, 0.06)" strokeWidth="1" />

          {/* Gear Rim Inner Wall */}
          <circle cx="800" cy="480" r="315" fill="none" stroke="rgba(130, 169, 199, 0.1)" strokeWidth="1.5" />

          {/* Bolt Circle with 8 Machined Bores */}
          <circle cx="800" cy="480" r="240" fill="none" stroke="rgba(130, 169, 199, 0.08)" strokeWidth="1" strokeDasharray="4 4" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => {
            const rad = (deg * Math.PI) / 180
            const bx = 800 + 240 * Math.cos(rad)
            const by = 480 + 240 * Math.sin(rad)
            return (
              <g key={deg}>
                <circle cx={bx} cy={by} r="14" fill="none" stroke="rgba(205, 214, 219, 0.1)" strokeWidth="1" />
                <circle cx={bx} cy={by} r="7" fill="none" stroke="rgba(130, 169, 199, 0.14)" strokeWidth="1" />
              </g>
            )
          })}

          {/* 6 Structural Web Spoke Cutouts */}
          {[0, 60, 120, 180, 240, 300].map(deg => {
            const rad = (deg * Math.PI) / 180
            const x1 = 800 + 90 * Math.cos(rad)
            const y1 = 480 + 90 * Math.sin(rad)
            const x2 = 800 + 190 * Math.cos(rad)
            const y2 = 480 + 190 * Math.sin(rad)
            return (
              <line
                key={deg}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="rgba(205, 214, 219, 0.09)"
                strokeWidth="2"
              />
            )
          })}

          {/* Central Hub */}
          <circle cx="800" cy="480" r="85" fill="none" stroke="rgba(130, 169, 199, 0.18)" strokeWidth="1.5" />
          <circle cx="800" cy="480" r="50" fill="none" stroke="rgba(205, 214, 219, 0.12)" strokeWidth="1" />
        </g>

        {/* ── Layer 4: Upper-Right Counter-Rotating Pinion Gear ── */}
        <g className="mech-env__gear-cluster mech-env__gear--pinion">
          {/* Pinion Teeth */}
          <path
            d={pinionGearPath}
            fill="none"
            stroke="rgba(205, 214, 219, 0.12)"
            strokeWidth="1.25"
            strokeLinejoin="round"
          />

          {/* Pitch Circle */}
          <circle
            cx="1260"
            cy="240"
            r="160"
            fill="none"
            stroke="rgba(130, 169, 199, 0.16)"
            strokeWidth="1"
            strokeDasharray="5 3"
          />

          {/* Rim & Hub */}
          <circle cx="1260" cy="240" r="130" fill="none" stroke="rgba(205, 214, 219, 0.08)" strokeWidth="1" />
          <circle cx="1260" cy="240" r="55" fill="none" stroke="rgba(130, 169, 199, 0.15)" strokeWidth="1.2" />
          <circle cx="1260" cy="240" r="28" fill="none" stroke="rgba(205, 214, 219, 0.1)" strokeWidth="1" />

          {/* Keyway Notch on Pinion Hub */}
          <rect x="1256" y="208" width="8" height="10" fill="rgba(130, 169, 199, 0.16)" />
        </g>

        {/* ── Layer 5: Lower-Left Counter-Rotating Idler Gear ── */}
        <g className="mech-env__gear-cluster mech-env__gear--idler">
          <path
            d={idlerGearPath}
            fill="none"
            stroke="rgba(205, 214, 219, 0.1)"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          <circle cx="340" cy="720" r="135" fill="none" stroke="rgba(130, 169, 199, 0.14)" strokeWidth="1" strokeDasharray="4 3" />
          <circle cx="340" cy="720" r="110" fill="none" stroke="rgba(205, 214, 219, 0.07)" strokeWidth="1" />
          <circle cx="340" cy="720" r="42" fill="none" stroke="rgba(130, 169, 199, 0.12)" strokeWidth="1.2" />
        </g>

        {/* ── Layer 6: Engineering Callouts & Drafting Annotations ── */}
        <g className="mech-env__layer-annotations" fontFamily="monospace">
          {/* Top-Center Dimension Line */}
          <g transform="translate(800, 100)">
            <line x1="-180" y1="0" x2="180" y2="0" stroke="rgba(130, 169, 199, 0.2)" strokeWidth="1" />
            <line x1="-180" y1="-5" x2="-180" y2="5" stroke="rgba(130, 169, 199, 0.3)" strokeWidth="1" />
            <line x1="180" y1="-5" x2="180" y2="5" stroke="rgba(130, 169, 199, 0.3)" strokeWidth="1" />
            <text x="0" y="-8" fill="rgba(130, 169, 199, 0.38)" fontSize="8.5" textAnchor="middle" letterSpacing="0.16em">
              PITCH DIAMETER Ø 740.00 mm · MODULE m = 12.0
            </text>
          </g>

          {/* Left Reference Coordinate Crosshair */}
          <g transform="translate(240, 360)">
            <line x1="-12" y1="0" x2="12" y2="0" stroke="rgba(205, 214, 219, 0.2)" strokeWidth="1" />
            <line x1="0" y1="-12" x2="0" y2="12" stroke="rgba(205, 214, 219, 0.2)" strokeWidth="1" />
            <circle cx="0" cy="0" r="6" fill="none" stroke="rgba(130, 169, 199, 0.2)" strokeWidth="0.8" />
            <text x="16" y="3" fill="rgba(205, 214, 219, 0.3)" fontSize="8" letterSpacing="0.12em">
              DATUM REF: PT-01
            </text>
          </g>

          {/* Right Pitch Line Mesh Point Indicator */}
          <g transform="translate(1085, 335)">
            <circle cx="0" cy="0" r="3.5" fill="none" stroke="rgba(217, 138, 61, 0.45)" strokeWidth="1" />
            <circle cx="0" cy="0" r="1.5" fill="rgba(217, 138, 61, 0.65)" />
            <text x="12" y="3" fill="rgba(217, 138, 61, 0.5)" fontSize="7.5" letterSpacing="0.14em">
              PITCH CONTACT POINT
            </text>
          </g>

          {/* Bottom Precision Standard Specification */}
          <g transform="translate(800, 930)">
            <text x="0" y="0" fill="rgba(130, 169, 199, 0.28)" fontSize="8" textAnchor="middle" letterSpacing="0.18em">
              STANDARDS: ISO 1328-1 CL-5 · DIN 3962 · AGMA 2015-1-A01
            </text>
          </g>
        </g>
      </svg>
    </div>
  )
}
