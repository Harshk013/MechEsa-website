import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import type { RefObject } from 'react'
import * as THREE from 'three'
import { useReducedMotion } from '../../../hooks/useReducedMotion'
import { usePointer } from '../../interaction/PointerProvider'
import { CORE_CONFIG, CORE_MATERIALS } from './mechanicalCore.constants'
import { calculateGearAngularVelocity, calculateGearRatio, solveCrankSlider } from './gearMath'
import { MechanicalGear } from './MechanicalGear'
import { MechanicalShaft } from './MechanicalShaft'
import { MechanicalBearing } from './MechanicalBearing'
import { MechanicalHub } from './MechanicalHub'
import { MechanicalPiston } from './MechanicalPiston'
import { MechanicalCoreCamera } from './MechanicalCoreCamera'
import { MechanicalCoreLighting } from './MechanicalCoreLighting'
import type { MechanicalCoreStageProps } from './mechanicalCore.types'
import { useCoreQuality } from './useCoreQuality'

function MachineFrame({ mobile }: { mobile: boolean }) {
  return <group>
    <mesh position={[0, -2.28, -0.52]} castShadow receiveShadow>
      <boxGeometry args={[5.75, 0.16, 0.48]} />
      <meshStandardMaterial color={CORE_MATERIALS.graphite} metalness={0.86} roughness={0.4} />
    </mesh>
    {!mobile && <>
      <mesh position={[-2.65, 0.15, -0.52]}>
        <boxGeometry args={[0.14, 4.55, 0.42]} />
        <meshStandardMaterial color={CORE_MATERIALS.graphite} metalness={0.86} roughness={0.4} />
      </mesh>
      <mesh position={[2.68, 0.15, -0.52]}>
        <boxGeometry args={[0.14, 4.55, 0.42]} />
        <meshStandardMaterial color={CORE_MATERIALS.graphite} metalness={0.86} roughness={0.4} />
      </mesh>
      <mesh position={[0, 2.37, -0.52]}>
        <boxGeometry args={[5.75, 0.12, 0.42]} />
        <meshStandardMaterial color={CORE_MATERIALS.graphiteDark} metalness={0.88} roughness={0.42} />
      </mesh>
    </>}
    {[-2.05, 0, 2.05].map((x) => <group key={x} position={[x, -2.38, -0.2]}>
      <mesh>
        <boxGeometry args={[0.48, 0.08, 0.58]} />
        <meshStandardMaterial color={CORE_MATERIALS.steel} metalness={0.88} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.05, 12]} />
        <meshStandardMaterial color={CORE_MATERIALS.steelLight} metalness={0.94} roughness={0.25} />
      </mesh>
    </group>)}
  </group>
}

function ActuatorHousing({ mobile }: { mobile: boolean }) {
  return <group position={[-2.2, 0.05, -0.32]}>
    <mesh position={[0, 0, 0]}>
      <cylinderGeometry args={[0.62, 0.62, 2.05, 32, 1, true]} />
      <meshStandardMaterial color={CORE_MATERIALS.graphite} metalness={0.78} roughness={0.42} transparent opacity={mobile ? 0.12 : 0.2} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
    <mesh position={[0, 1.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.62, 0.055, 8, 32]} />
      <meshStandardMaterial color={CORE_MATERIALS.steel} metalness={0.88} roughness={0.34} />
    </mesh>
    <mesh position={[0, -1.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.62, 0.045, 8, 32]} />
      <meshStandardMaterial color={CORE_MATERIALS.graphiteDark} metalness={0.88} roughness={0.4} />
    </mesh>
    {!mobile && [-0.58, 0.58].map((x) => <mesh key={x} position={[x, 0, 0]}>
      <boxGeometry args={[0.07, 2.1, 0.08]} />
      <meshStandardMaterial color={CORE_MATERIALS.graphiteDark} metalness={0.84} roughness={0.44} />
    </mesh>)}
  </group>
}

function CrankAssembly({ crankRef, rodRef, pistonRef, mobile, onPointerEnter, onPointerLeave, onClick }: {
  crankRef: RefObject<THREE.Group | null>
  rodRef: RefObject<THREE.Group | null>
  pistonRef: RefObject<THREE.Group | null>
  mobile: boolean
  onPointerEnter?: () => void
  onPointerLeave?: () => void
  onClick?: () => void
}) {
  return <>
    <group ref={crankRef} position={[-2.2, -1.25, 0.08]} onPointerEnter={onPointerEnter} onPointerLeave={onPointerLeave} onClick={onClick}>
      <mesh rotation={[0, Math.PI / 2, 0]} castShadow>
        <cylinderGeometry args={[0.38, 0.38, 0.18, 28]} />
        <meshStandardMaterial color={CORE_MATERIALS.graphite} metalness={0.92} roughness={0.32} />
      </mesh>
      <mesh position={[0, 0, 0.12]} rotation={[0, Math.PI / 2, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.25, 24]} />
        <meshStandardMaterial color={CORE_MATERIALS.steel} metalness={0.94} roughness={0.27} />
      </mesh>
      <mesh position={[0, 0.03, CORE_CONFIG.crankRadius * 0.52]} castShadow>
        <boxGeometry args={[0.16, 0.18, CORE_CONFIG.crankRadius * 1.04]} />
        <meshStandardMaterial color={CORE_MATERIALS.steel} metalness={0.92} roughness={0.31} />
      </mesh>
      <mesh position={[0, 0.13, CORE_CONFIG.crankRadius]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <cylinderGeometry args={[0.105, 0.105, 0.26, 20]} />
        <meshStandardMaterial color={CORE_MATERIALS.steelLight} metalness={0.96} roughness={0.22} />
      </mesh>
      {!mobile && <mesh position={[0, 0, 0.14]}>
        <torusGeometry args={[0.28, 0.025, 6, 28]} />
        <meshStandardMaterial color={CORE_MATERIALS.accent} metalness={0.85} roughness={0.3} />
      </mesh>}
    </group>

    <group ref={rodRef}>
      <mesh position={[0, CORE_CONFIG.connectingRodLength / 2, 0]} castShadow>
        <boxGeometry args={[0.13, CORE_CONFIG.connectingRodLength, 0.12]} />
        <meshStandardMaterial color={CORE_MATERIALS.steelLight} metalness={0.95} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0, 0.01]}>
        <cylinderGeometry args={[0.18, 0.18, 0.1, 20]} />
        <meshStandardMaterial color={CORE_MATERIALS.graphite} metalness={0.9} roughness={0.32} />
      </mesh>
      <mesh position={[0, CORE_CONFIG.connectingRodLength, 0.01]}>
        <cylinderGeometry args={[0.17, 0.17, 0.1, 20]} />
        <meshStandardMaterial color={CORE_MATERIALS.graphite} metalness={0.9} roughness={0.32} />
      </mesh>
      <mesh position={[0, 0, 0.065]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.09, 0.018, 6, 20]} />
        <meshStandardMaterial color={CORE_MATERIALS.steelLight} metalness={0.92} roughness={0.25} />
      </mesh>
      <mesh position={[0, CORE_CONFIG.connectingRodLength, 0.065]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.08, 0.016, 6, 20]} />
        <meshStandardMaterial color={CORE_MATERIALS.steelLight} metalness={0.92} roughness={0.25} />
      </mesh>
    </group>
    <group onPointerEnter={onPointerEnter} onPointerLeave={onPointerLeave} onClick={onClick}><MechanicalPiston ref={pistonRef} compact={mobile} /></group>
  </>
}

function CoreAssembly({ state, onTelemetry, onHover, onEngage, mobile }: MechanicalCoreStageProps & { mobile: boolean }) {
  const hubRef = useRef<THREE.Group>(null)
  const primaryRef = useRef<THREE.Group>(null)
  const secondaryRef = useRef<THREE.Group>(null)
  const tertiaryRef = useRef<THREE.Group>(null)
  const shaftRef = useRef<THREE.Group>(null)
  const secondaryShaftRef = useRef<THREE.Group>(null)
  const tertiaryShaftRef = useRef<THREE.Group>(null)
  const crankShaftRef = useRef<THREE.Group>(null)
  const crankRef = useRef<THREE.Group>(null)
  const rodRef = useRef<THREE.Group>(null)
  const pistonRef = useRef<THREE.Group>(null)
  const reducedMotion = useReducedMotion()
  const timeRef = useRef(0)
  const currentRpmRef = useRef(0)
  const lastTelemetryRef = useRef(0)
  const cycleRef = useRef(0)
  const focusRef = useRef('CORE')
  const { setIntent, clearIntent } = usePointer()
  const ratio = useMemo(() => calculateGearRatio(CORE_CONFIG.primaryTeeth, CORE_CONFIG.secondaryTeeth), [])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    const targetRpm = state === 'engaged' ? CORE_CONFIG.engagedRpm : state === 'active' || state === 'interacting' ? CORE_CONFIG.baseRpm : 0
    currentRpmRef.current += (targetRpm - currentRpmRef.current) * Math.min(1, dt * (state === 'engaged' ? 2.2 : 1.35))
    const motionScale = reducedMotion ? 0.04 : 1
    const angularVelocity = currentRpmRef.current * (Math.PI * 2) / 60
    timeRef.current += dt * motionScale
    const theta = timeRef.current * angularVelocity
    const primaryVelocity = angularVelocity
    const secondaryVelocity = calculateGearAngularVelocity(primaryVelocity, CORE_CONFIG.primaryTeeth, CORE_CONFIG.secondaryTeeth)
    const tertiaryVelocity = calculateGearAngularVelocity(secondaryVelocity, CORE_CONFIG.secondaryTeeth, CORE_CONFIG.tertiaryTeeth)

    if (hubRef.current) hubRef.current.rotation.y = theta
    if (shaftRef.current) shaftRef.current.rotation.y = theta
    if (primaryRef.current) primaryRef.current.rotation.y = theta
    if (secondaryRef.current) secondaryRef.current.rotation.y = secondaryVelocity * timeRef.current
    if (tertiaryRef.current) tertiaryRef.current.rotation.y = tertiaryVelocity * timeRef.current
    if (crankRef.current) {
      crankRef.current.rotation.x = -theta
      crankRef.current.position.z = 0.08
    }
    if (crankShaftRef.current) crankShaftRef.current.rotation.x = -theta
    if (secondaryShaftRef.current) secondaryShaftRef.current.rotation.y = secondaryVelocity * timeRef.current
    if (tertiaryShaftRef.current) tertiaryShaftRef.current.rotation.y = tertiaryVelocity * timeRef.current

    const crank = solveCrankSlider(theta, CORE_CONFIG.crankRadius, CORE_CONFIG.connectingRodLength)
    const pistonX = -2.2
    const crankCenterY = -1.25
    // The crank pin traces a circle in the Y/Z plane around the horizontal crank axle.
    const crankY = crankCenterY + crank.y
    const crankZ = 0.08 + crank.x
    // Slider constraint: the rod length is fixed, so piston travel is solved from the
    // right triangle between the crank pin and the piston wrist-pin axis.
    const targetY = crankCenterY + crank.pistonY
    const targetZ = 0.08
    const dz = targetZ - crankZ
    const dy = targetY - crankY
    const length = Math.sqrt(dz * dz + dy * dy)

    if (rodRef.current) {
      rodRef.current.position.set(pistonX, crankY, crankZ)
      rodRef.current.rotation.x = Math.atan2(dz, dy)
      rodRef.current.scale.set(1, length / CORE_CONFIG.connectingRodLength, 1)
    }
    if (pistonRef.current) pistonRef.current.position.set(pistonX, targetY, targetZ)

    cycleRef.current = Math.floor((((theta % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) / (Math.PI * 2) * 16)
    if (onTelemetry && performance.now() - lastTelemetryRef.current > 120) {
      lastTelemetryRef.current = performance.now()
      onTelemetry({ rpm: Math.round(currentRpmRef.current), ratio, cycle: cycleRef.current, activeObject: focusRef.current })
    }

  })

  const focus = (name: string | null) => {
    focusRef.current = name ?? 'CORE'
    onHover?.(name)
    if (name) setIntent('view', name, 0)
    else clearIntent()
  }

  const primaryPos: [number, number, number] = [0, 0.05, 0.32]
  const secondaryPos: [number, number, number] = [2.05, 0.05, 0.42]
  const tertiaryPos: [number, number, number] = [2.05, -1.66, 0.38]

  return <group>
    <MachineFrame mobile={mobile} />
    <ActuatorHousing mobile={mobile} />

    <group position={[0, 0.18, -0.52]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <torusGeometry args={[2.62, 0.075, 10, 64]} />
        <meshStandardMaterial color={CORE_MATERIALS.graphite} metalness={0.9} roughness={0.36} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.82, 0.018, 6, 64]} />
        <meshStandardMaterial color={CORE_MATERIALS.steel} metalness={0.84} roughness={0.44} />
      </mesh>
    </group>

    <MechanicalHub ref={hubRef} />
    <MechanicalShaft ref={shaftRef} length={4.55} radius={0.12} position={[0, 0.04, -0.08]} />
    {!mobile && <>
      <MechanicalBearing position={[0, -0.74, -0.08]} scale={0.7} />
      <MechanicalBearing position={[0, 0.82, -0.08]} scale={0.7} />
    </>}

    <MechanicalGear ref={primaryRef} radius={1.35} teeth={CORE_CONFIG.primaryTeeth} thickness={0.22} position={primaryPos} material="steel" onPointerEnter={() => focus('PRIMARY GEAR')} onPointerLeave={() => focus(null)} onClick={onEngage} />
    {!mobile && <>
      <MechanicalGear ref={secondaryRef} radius={0.72} teeth={CORE_CONFIG.secondaryTeeth} thickness={0.18} position={secondaryPos} material="graphite" onPointerEnter={() => focus('SECONDARY GEAR')} onPointerLeave={() => focus(null)} onClick={onEngage} />
      <MechanicalGear ref={tertiaryRef} radius={0.98} teeth={CORE_CONFIG.tertiaryTeeth} thickness={0.18} position={tertiaryPos} material="steel" onPointerEnter={() => focus('OUTPUT GEAR')} onPointerLeave={() => focus(null)} onClick={onEngage} />
    </>}

    <MechanicalShaft ref={crankShaftRef} axis="x" length={2.55} radius={0.095} position={[-1.05, -1.25, 0.08]} detail={!mobile} />
    {!mobile && <MechanicalBearing axis="x" position={[-1.04, -1.25, 0.08]} scale={0.5} />}
    {!mobile && <>
      <MechanicalShaft ref={secondaryShaftRef} length={1.15} radius={0.075} position={secondaryPos} detail={false} />
      <MechanicalShaft ref={tertiaryShaftRef} length={1.15} radius={0.08} position={tertiaryPos} detail={false} />
      <MechanicalBearing position={[secondaryPos[0], secondaryPos[1] - 0.46, secondaryPos[2] - 0.02]} scale={0.42} />
      <MechanicalBearing position={[tertiaryPos[0], tertiaryPos[1] + 0.46, tertiaryPos[2] - 0.02]} scale={0.48} />
    </>}
    <mesh position={[-0.72, -1.25, 0.08]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.25, 0.25, 0.12, 24]} />
      <meshStandardMaterial color={CORE_MATERIALS.steel} metalness={0.93} roughness={0.3} />
    </mesh>
    <CrankAssembly crankRef={crankRef} rodRef={rodRef} pistonRef={pistonRef} mobile={mobile}
      onPointerEnter={() => focus('CRANK DRIVE')} onPointerLeave={() => focus(null)} onClick={onEngage} />

    <mesh position={[-1.2, -1.25, -0.42]}>
      <boxGeometry args={[2.65, 0.08, 0.08]} />
      <meshStandardMaterial color={CORE_MATERIALS.graphiteDark} metalness={0.84} roughness={0.42} />
    </mesh>
  </group>
}

export function MechanicalCoreScene({ state, onTelemetry, onHover, onEngage }: MechanicalCoreStageProps) {
  const reducedMotion = useReducedMotion()
  const { mobile, dpr } = useCoreQuality()
  return <Canvas
    camera={{ fov: 38, position: [0.55, 0.7, CORE_CONFIG.cameraDistance], near: 0.1, far: 50 }}
    dpr={dpr}
    gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    shadows
    frameloop={reducedMotion ? 'demand' : 'always'}
    fallback={<div className="core-stage__webgl-fallback"><span className="technical-small">WEBGL / UNAVAILABLE</span><strong>MECHANICAL CORE</strong><span className="technical-small">STATIC ENGINEERING VIEW</span></div>}
    onCreated={({ gl }) => { gl.setClearColor(0x000000, 0) }}
  >
    <MechanicalCoreCamera />
    <MechanicalCoreLighting />
    <CoreAssembly state={state} onTelemetry={onTelemetry} onHover={onHover} onEngage={onEngage} mobile={mobile} />
    <ContactShadows position={[0, -2.42, -0.35]} opacity={0.24} scale={7.5} blur={2.5} far={4.5} resolution={256} frames={1} />
  </Canvas>
}
