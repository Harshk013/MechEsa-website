import { useState, useMemo } from 'react'
import { useRepresentation } from '../../../app/providers/RepresentationProvider'
import {
  ROBOT_ARM_CONFIG,
  calculateRoboticsKinematics,
  calculateInverseKinematics,
  ROBOTICS_LEVEL_TARGETS,
  type Point,
  type Obstacle,
} from './roboticsModel'
import './robotics.css'

interface RoboticsExperimentViewProps {
  shoulderAngle: number
  elbowAngle: number
  onAngleChange: (shoulder: number, elbow: number) => void
  activeLevel?: number
  isChallengeMode?: boolean
}

export function RoboticsExperimentView({
  shoulderAngle,
  elbowAngle,
  onAngleChange,
  activeLevel = 1,
  isChallengeMode = false,
}: RoboticsExperimentViewProps) {
  const { isBlueprint } = useRepresentation()
  const [autoSolved, setAutoSolved] = useState(false)

  // Get active target configuration for level (or level 1 default)
  const levelConfig = ROBOTICS_LEVEL_TARGETS[activeLevel] || ROBOTICS_LEVEL_TARGETS[1]
  const target: Point = levelConfig.target
  const targetRadius: number = levelConfig.radius
  const obstacle: Obstacle | undefined = levelConfig.obstacle

  // Calculate forward kinematics
  const kinematics = useMemo(
    () => calculateRoboticsKinematics(shoulderAngle, elbowAngle, target, targetRadius, obstacle),
    [shoulderAngle, elbowAngle, target, targetRadius, obstacle]
  )

  // SVG coordinate transformation
  const svgOrigin = { x: 130, y: 270 }
  const toSvgX = (x: number) => svgOrigin.x + x
  const toSvgY = (y: number) => svgOrigin.y - y

  const shoulderSvg = { x: toSvgX(0), y: toSvgY(0) }
  const elbowSvg = { x: toSvgX(kinematics.elbow.x), y: toSvgY(kinematics.elbow.y) }
  const handSvg = { x: toSvgX(kinematics.hand.x), y: toSvgY(kinematics.hand.y) }
  const targetSvg = { x: toSvgX(target.x), y: toSvgY(target.y) }

  // Hand orientation angle in degrees for gripper jaws
  const handAngleDeg = shoulderAngle + elbowAngle
  const handAngleRad = (handAngleDeg * Math.PI) / 180

  // Gripper jaw tips
  const jawLength = 16
  const jawSpread = kinematics.isTargetReached ? 0.22 : 0.42
  const jaw1 = {
    x: handSvg.x + jawLength * Math.cos(handAngleRad - jawSpread),
    y: handSvg.y - jawLength * Math.sin(handAngleRad - jawSpread),
  }
  const jaw2 = {
    x: handSvg.x + jawLength * Math.cos(handAngleRad + jawSpread),
    y: handSvg.y - jawLength * Math.sin(handAngleRad + jawSpread),
  }

  // Auto position button handler using inverse kinematics
  const handleAutoPosition = () => {
    // Prefer elbow up for obstacle avoidance if level 3
    const preferElbowUp = activeLevel === 3 ? true : true
    const ik = calculateInverseKinematics(target, preferElbowUp)
    if (ik.isReachable) {
      onAngleChange(ik.shoulderAngle, ik.elbowAngle)
      setAutoSolved(true)
      setTimeout(() => setAutoSolved(false), 2000)
    }
  }

  const handleResetArm = () => {
    onAngleChange(35, 45)
  }

  // Distance in meters formatted (100 mm = 0.10 m)
  const distanceMeters = (kinematics.distanceToTarget / 1000).toFixed(2)
  const reachMeters = (kinematics.reach / 1000).toFixed(2)

  return (
    <div className="robotics-exp">
      {/* ── Top Header Bar ───────────────────────────────────────── */}
      <div className="robotics-header-bar">
        <div className="robotics-header-bar__title-group">
          <div className="robotics-badge">
            <span className="robotics-badge-dot" aria-hidden="true" />
            <span>ROBOTICS LAB</span>
          </div>
          <p className="robotics-title">
            Control the arm. Reach the target. Learn how robots move.
          </p>
          <span className="robotics-tech-sub">
            Move the joints and see how the robot&apos;s hand responds. Can you guide it to the target?
          </span>
        </div>

        {/* Status Pill */}
        <div className="robotics-viewport-card__top-tags">
          <span
            className={`robotics-viewport-tag ${
              kinematics.hasObstacleCollision
                ? 'robotics-viewport-tag--alert'
                : kinematics.isTargetReached
                ? 'robotics-viewport-tag--success'
                : ''
            }`}
          >
            {kinematics.hasObstacleCollision
              ? '⚠ OBSTACLE HIT'
              : kinematics.isTargetReached
              ? 'TARGET REACHED ✓'
              : 'NAVIGATING'}
          </span>
        </div>
      </div>

      {/* ── Main Hero Layout: Interactive Arm on Left, Controls & Vision on Right ── */}
      <div className="robotics-hero-grid">
        {/* Left: Robotic Arm Interactive Playground */}
        <div className={`robotics-viewport-card${isBlueprint ? ' is-blueprint' : ''}`}>
          <div className="robotics-viewport-card__top-tags">
            <span className="robotics-viewport-tag">
              WORKSPACE: R_max {ROBOT_ARM_CONFIG.link1Length + ROBOT_ARM_CONFIG.link2Length} mm
            </span>
            <span className="robotics-viewport-tag">
              {isChallengeMode ? `MISSION // LEVEL ${String(activeLevel).padStart(2, '0')}` : 'SANDBOX PLAYGROUND'}
            </span>
          </div>

          <div className="robotics-svg-stage">
            <svg
              viewBox="0 0 520 370"
              className="robotics-svg"
              role="img"
              aria-label="2-link planar robotic arm interactive visualization"
            >
              <defs>
                {/* Striped hazard pattern for obstacle */}
                <pattern id="hazardPattern" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                  <rect width="6" height="12" fill="rgba(217, 138, 61, 0.4)" />
                  <rect x="6" width="6" height="12" fill="rgba(20, 26, 32, 0.8)" />
                </pattern>
                {/* Glow filter for target and hand */}
                <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <filter id="successGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Coordinate Grid Lines */}
              <g opacity={isBlueprint ? 0.3 : 0.15}>
                {[60, 120, 180, 240, 300, 360, 420, 480].map((x) => (
                  <line key={`gx-${x}`} x1={x} y1="30" x2={x} y2="340" stroke="#9da6aa" strokeDasharray="3 4" />
                ))}
                {[80, 140, 200, 260, 320].map((y) => (
                  <line key={`gy-${y}`} x1="40" y1={y} x2="490" stroke="#9da6aa" strokeDasharray="3 4" />
                ))}
              </g>

              {/* Workspace Reach Boundaries */}
              <circle
                cx={shoulderSvg.x}
                cy={shoulderSvg.y}
                r={ROBOT_ARM_CONFIG.link1Length + ROBOT_ARM_CONFIG.link2Length}
                fill="none"
                stroke={isBlueprint ? '#5d9cec' : '#6fb3b8'}
                strokeWidth="1.2"
                strokeDasharray="4 4"
                opacity={0.35}
              />
              <circle
                cx={shoulderSvg.x}
                cy={shoulderSvg.y}
                r={Math.abs(ROBOT_ARM_CONFIG.link1Length - ROBOT_ARM_CONFIG.link2Length)}
                fill="none"
                stroke="#697276"
                strokeWidth="1"
                strokeDasharray="2 3"
                opacity={0.3}
              />

              {/* Ground Datum Line */}
              <line x1="30" y1={shoulderSvg.y + 24} x2="490" y2={shoulderSvg.y + 24} stroke="#3a4852" strokeWidth="2" />

              {/* Obstacle Zone for Level 3 */}
              {obstacle && (
                <g>
                  <rect
                    x={toSvgX(obstacle.x)}
                    y={toSvgY(obstacle.y + obstacle.height)}
                    width={obstacle.width}
                    height={obstacle.height}
                    className={`robotics-obstacle-rect${kinematics.hasObstacleCollision ? ' robotics-obstacle-rect--hit' : ''}`}
                    rx="3"
                  />
                  <rect
                    x={toSvgX(obstacle.x)}
                    y={toSvgY(obstacle.y + obstacle.height)}
                    width={obstacle.width}
                    height={obstacle.height}
                    fill="url(#hazardPattern)"
                    opacity={0.4}
                    rx="3"
                  />
                  <text
                    x={toSvgX(obstacle.x + obstacle.width / 2)}
                    y={toSvgY(obstacle.y + obstacle.height / 2)}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={kinematics.hasObstacleCollision ? '#ff4433' : '#d98a3d'}
                    fontFamily="monospace"
                    fontSize="9"
                    fontWeight="700"
                  >
                    {obstacle.label}
                  </text>
                </g>
              )}

              {/* Target Pointer Line from Hand to Target */}
              <line
                x1={handSvg.x}
                y1={handSvg.y}
                x2={targetSvg.x}
                y2={targetSvg.y}
                className={`robotics-target-line${kinematics.isTargetReached ? ' robotics-target-line--success' : ''}`}
              />

              {/* Target Indicator with Rings and Crosshairs */}
              <g transform={`translate(${targetSvg.x}, ${targetSvg.y})`}>
                {/* Target Tolerance Zone Ring */}
                <circle
                  r={targetRadius}
                  className={`robotics-target-outer${kinematics.isTargetReached ? ' robotics-target-outer--success' : ''}`}
                />
                {/* Target Inner Ring */}
                <circle
                  r={targetRadius * 0.4}
                  fill="none"
                  stroke={kinematics.isTargetReached ? '#79b89a' : '#d98a3d'}
                  strokeWidth="1.2"
                />
                {/* Target Center Point */}
                <circle
                  r="3.5"
                  className={`robotics-target-center${kinematics.isTargetReached ? ' robotics-target-center--success' : ''}`}
                />
                {/* Crosshairs */}
                <line x1={-targetRadius - 6} y1="0" x2={-targetRadius + 6} y2="0" stroke={kinematics.isTargetReached ? '#79b89a' : '#d98a3d'} strokeWidth="1.5" />
                <line x1={targetRadius - 6} y1="0" x2={targetRadius + 6} y2="0" stroke={kinematics.isTargetReached ? '#79b89a' : '#d98a3d'} strokeWidth="1.5" />
                <line x1="0" y1={-targetRadius - 6} x2="0" y2={-targetRadius + 6} stroke={kinematics.isTargetReached ? '#79b89a' : '#d98a3d'} strokeWidth="1.5" />
                <line x1="0" y1={targetRadius - 6} x2="0" y2={targetRadius + 6} stroke={kinematics.isTargetReached ? '#79b89a' : '#d98a3d'} strokeWidth="1.5" />
                {/* Target Label */}
                <text
                  x="0"
                  y={-targetRadius - 10}
                  textAnchor="middle"
                  fill={kinematics.isTargetReached ? '#79b89a' : '#d98a3d'}
                  fontFamily="monospace"
                  fontSize="10"
                  fontWeight="800"
                >
                  {kinematics.isTargetReached ? 'TARGET ACQUIRED ✓' : '🎯 TARGET'}
                </text>
              </g>

              {/* Industrial Robot Base Mount */}
              <path
                d={`M ${shoulderSvg.x - 36} ${shoulderSvg.y + 24} L ${shoulderSvg.x - 22} ${shoulderSvg.y} L ${shoulderSvg.x + 22} ${shoulderSvg.y} L ${shoulderSvg.x + 36} ${shoulderSvg.y + 24} Z`}
                fill="#1c252c"
                stroke="#475763"
                strokeWidth="2"
              />
              <circle cx={shoulderSvg.x - 24} cy={shoulderSvg.y + 16} r="2.5" fill="#697276" />
              <circle cx={shoulderSvg.x + 24} cy={shoulderSvg.y + 16} r="2.5" fill="#697276" />

              {/* ── Link 1: Upper Arm (Shoulder to Elbow) ─────────────── */}
              <line
                x1={shoulderSvg.x}
                y1={shoulderSvg.y}
                x2={elbowSvg.x}
                y2={elbowSvg.y}
                className="robotics-link--primary"
              />
              <line
                x1={shoulderSvg.x}
                y1={shoulderSvg.y}
                x2={elbowSvg.x}
                y2={elbowSvg.y}
                className="robotics-link--primary-core"
              />

              {/* ── Link 2: Forearm (Elbow to Hand) ───────────────────── */}
              <line
                x1={elbowSvg.x}
                y1={elbowSvg.y}
                x2={handSvg.x}
                y2={handSvg.y}
                className="robotics-link--secondary"
              />
              <line
                x1={elbowSvg.x}
                y1={elbowSvg.y}
                x2={handSvg.x}
                y2={handSvg.y}
                className="robotics-link--secondary-core"
              />

              {/* Shoulder Joint Pivot Bearing */}
              <circle cx={shoulderSvg.x} cy={shoulderSvg.y} r="14" className="robotics-joint-outer" />
              <circle cx={shoulderSvg.x} cy={shoulderSvg.y} r="5" className="robotics-joint-pin" />

              {/* Elbow Joint Pivot Bearing */}
              <circle cx={elbowSvg.x} cy={elbowSvg.y} r="11" className="robotics-joint-outer" />
              <circle cx={elbowSvg.x} cy={elbowSvg.y} r="4" className="robotics-joint-pin" />

              {/* ── End Effector / Robot Gripper Hand ─────────────────── */}
              <g className={`robotics-hand${kinematics.isTargetReached ? ' robotics-hand--success' : ' robotics-hand--active'}`}>
                {/* Wrist Joint Hub */}
                <circle
                  cx={handSvg.x}
                  cy={handSvg.y}
                  r="7"
                  fill={kinematics.isTargetReached ? '#79b89a' : '#6fb3b8'}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
                {/* Gripper Jaws */}
                <line
                  x1={handSvg.x}
                  y1={handSvg.y}
                  x2={jaw1.x}
                  y2={jaw1.y}
                  stroke={kinematics.isTargetReached ? '#79b89a' : '#edf1f2'}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <line
                  x1={handSvg.x}
                  y1={handSvg.y}
                  x2={jaw2.x}
                  y2={jaw2.y}
                  stroke={kinematics.isTargetReached ? '#79b89a' : '#edf1f2'}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </g>

              {/* Blueprint Annotations */}
              {isBlueprint && (
                <>
                  <text x={shoulderSvg.x + 8} y={shoulderSvg.y - 18} fill="#5d9cec" fontFamily="monospace" fontSize="9">
                    BASE (0, 0)
                  </text>
                  <text x={elbowSvg.x + 8} y={elbowSvg.y - 8} fill="#5d9cec" fontFamily="monospace" fontSize="9">
                    L1: {ROBOT_ARM_CONFIG.link1Length}mm
                  </text>
                  <text x={handSvg.x + 8} y={handSvg.y + 16} fill="#5d9cec" fontFamily="monospace" fontSize="9">
                    L2: {ROBOT_ARM_CONFIG.link2Length}mm
                  </text>
                </>
              )}
            </svg>
          </div>

          <div className="robotics-viewport-card__bottom-tags">
            <span className="robotics-viewport-tag">
              SHOULDER: θ₁ = {shoulderAngle}°
            </span>
            <span className="robotics-viewport-tag">
              ELBOW: θ₂ = {elbowAngle}°
            </span>
            <span className="robotics-viewport-tag">
              POSTURE: {kinematics.posture.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Right: Beginner-Friendly Controls & Robot Vision Status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Controls Card */}
          <div className="robotics-controls-card">
            <div className="robotics-controls-head">
              <h3 className="robotics-controls-title">ROBOT ARM CONTROLS</h3>
              <button
                type="button"
                className="robotics-controls-reset"
                onClick={handleResetArm}
                aria-label="Reset arm to default posture"
              >
                RESET ARM
              </button>
            </div>

            {/* Slider 1: SHOULDER */}
            <div className="robotics-control-slider-group">
              <div className="robotics-control-label-row">
                <label htmlFor="shoulder-slider" className="robotics-control-name">
                  <span>SHOULDER</span>
                  <span className="robotics-control-subtext">(Base Joint θ₁)</span>
                </label>
                <output htmlFor="shoulder-slider" className="robotics-control-value">
                  {shoulderAngle}°
                </output>
              </div>

              <input
                id="shoulder-slider"
                type="range"
                className="lab-control-slider"
                min={ROBOT_ARM_CONFIG.shoulderMinAngle}
                max={ROBOT_ARM_CONFIG.shoulderMaxAngle}
                step="1"
                value={shoulderAngle}
                onChange={(e) => onAngleChange(Number(e.target.value), elbowAngle)}
                aria-label={`Shoulder joint angle, currently ${shoulderAngle} degrees`}
              />

              <div className="lab-control-item__range-scale" aria-hidden="true">
                <span>{ROBOT_ARM_CONFIG.shoulderMinAngle}°</span>
                <span>0°</span>
                <span>{ROBOT_ARM_CONFIG.shoulderMaxAngle}°</span>
              </div>
            </div>

            {/* Slider 2: ELBOW */}
            <div className="robotics-control-slider-group">
              <div className="robotics-control-label-row">
                <label htmlFor="elbow-slider" className="robotics-control-name">
                  <span>ELBOW</span>
                  <span className="robotics-control-subtext">(Forearm Joint θ₂)</span>
                </label>
                <output htmlFor="elbow-slider" className="robotics-control-value">
                  {elbowAngle}°
                </output>
              </div>

              <input
                id="elbow-slider"
                type="range"
                className="lab-control-slider"
                min={ROBOT_ARM_CONFIG.elbowMinAngle}
                max={ROBOT_ARM_CONFIG.elbowMaxAngle}
                step="1"
                value={elbowAngle}
                onChange={(e) => onAngleChange(shoulderAngle, Number(e.target.value))}
                aria-label={`Elbow joint angle, currently ${elbowAngle} degrees`}
              />

              <div className="lab-control-item__range-scale" aria-hidden="true">
                <span>{ROBOT_ARM_CONFIG.elbowMinAngle}°</span>
                <span>0°</span>
                <span>{ROBOT_ARM_CONFIG.elbowMaxAngle}°</span>
              </div>
            </div>

            {/* Inverse Kinematics Auto Position & Presets Toolbar */}
            <div className="robotics-actions-toolbar">
              <button
                type="button"
                className="robotics-auto-btn"
                onClick={handleAutoPosition}
                title="Automatically calculate joint angles to reach the target using inverse kinematics"
              >
                <span>🤖 AUTO POSITION</span>
                {autoSolved && <span>✓ SOLVED</span>}
              </button>

              <button
                type="button"
                className="robotics-preset-btn"
                onClick={() => onAngleChange(15, 0)}
              >
                EXTEND
              </button>
              <button
                type="button"
                className="robotics-preset-btn"
                onClick={() => onAngleChange(65, 90)}
              >
                FOLD
              </button>
            </div>

            {/* "TRY THIS" Interaction Prompt */}
            <div className="robotics-try-this">
              <span className="robotics-try-this__title">TRY THIS:</span>
              <p className="robotics-try-this__text">
                Move the <strong>Shoulder</strong> to aim the arm direction $\rightarrow$ then adjust the <strong>Elbow</strong> to reach the target circle!
              </p>
            </div>
          </div>

          {/* Robot Vision & Status Card */}
          <div className="robotics-vision-card">
            <div className="robotics-vision-head">
              <h3 className="robotics-vision-title">ROBOT STATUS</h3>
              <span
                className={`robotics-vision-badge ${
                  kinematics.isTargetReached ? 'robotics-vision-badge--success' : ''
                }`}
              >
                {kinematics.isTargetReached ? 'TARGET REACHED ✓' : 'SEEKING TARGET'}
              </span>
            </div>

            <div className="robotics-vision-grid">
              <div className="robotics-vision-stat">
                <span className="robotics-vision-label">DISTANCE TO TARGET</span>
                <span
                  className={`robotics-vision-value ${
                    kinematics.isTargetReached ? 'robotics-vision-value--success' : ''
                  }`}
                >
                  {kinematics.distanceToTarget.toFixed(1)} <small style={{ fontSize: '0.75rem' }}>mm</small>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-dim)', marginLeft: '4px' }}>
                    ({distanceMeters} m)
                  </span>
                </span>
              </div>

              <div className="robotics-vision-stat">
                <span className="robotics-vision-label">ARM REACH</span>
                <span className="robotics-vision-value">
                  {kinematics.reach.toFixed(1)} <small style={{ fontSize: '0.75rem' }}>mm</small>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-dim)', marginLeft: '4px' }}>
                    ({reachMeters} m)
                  </span>
                </span>
              </div>

              <div className="robotics-vision-stat">
                <span className="robotics-vision-label">HAND COORDINATE (X, Y)</span>
                <span className="robotics-vision-value" style={{ fontSize: '1rem' }}>
                  X {kinematics.hand.x.toFixed(1)} / Y {kinematics.hand.y.toFixed(1)}
                </span>
              </div>

              <div className="robotics-vision-stat">
                <span className="robotics-vision-label">TARGET COORDINATE</span>
                <span className="robotics-vision-value" style={{ fontSize: '1rem', color: 'var(--color-signal)' }}>
                  X {target.x} / Y {target.y}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
