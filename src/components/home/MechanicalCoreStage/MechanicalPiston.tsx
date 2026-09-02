import { forwardRef } from 'react'
import * as THREE from 'three'
import { CORE_MATERIALS } from './mechanicalCore.constants'

export const MechanicalPiston = forwardRef<THREE.Group, { position?: [number, number, number]; compact?: boolean }>(function MechanicalPiston({ position = [0, 0, 0], compact = false }, ref) {
  const s = compact ? 0.88 : 1
  return <group ref={ref} position={position} scale={s}>
    <mesh castShadow>
      <cylinderGeometry args={[0.34, 0.36, 0.5, 28]} />
      <meshStandardMaterial color={CORE_MATERIALS.steel} metalness={0.93} roughness={0.3} />
    </mesh>
    {[0.12, 0, -0.12].map((y) => <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.33, 0.018, 6, 24]} />
      <meshStandardMaterial color={CORE_MATERIALS.graphiteDark} metalness={0.8} roughness={0.4} />
    </mesh>)}
    <mesh position={[0, 0.31, 0]} castShadow>
      <cylinderGeometry args={[0.29, 0.29, 0.1, 28]} />
      <meshStandardMaterial color={CORE_MATERIALS.steelLight} metalness={0.95} roughness={0.22} />
    </mesh>
    <mesh position={[0, -0.31, 0]}>
      <cylinderGeometry args={[0.1, 0.1, 0.28, 18]} />
      <meshStandardMaterial color={CORE_MATERIALS.steelLight} metalness={0.95} roughness={0.23} />
    </mesh>
    <mesh position={[0, 0, 0.08]} rotation={[0, Math.PI / 2, 0]}>
      <cylinderGeometry args={[0.105, 0.105, 0.82, 18]} />
      <meshStandardMaterial color={CORE_MATERIALS.graphite} metalness={0.9} roughness={0.3} />
    </mesh>
  </group>
})
