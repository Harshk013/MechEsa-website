import { forwardRef } from 'react'
import * as THREE from 'three'
import { CORE_MATERIALS } from './mechanicalCore.constants'

export const MechanicalHub = forwardRef<THREE.Group>(function MechanicalHub(_, ref) {
  return <group ref={ref}>
    <mesh castShadow receiveShadow>
      <cylinderGeometry args={[1.08, 1.08, 0.46, 40]} />
      <meshStandardMaterial color={CORE_MATERIALS.graphite} metalness={0.9} roughness={0.3} />
    </mesh>
    <mesh position={[0, 0.27, 0]} castShadow>
      <cylinderGeometry args={[0.82, 0.82, 0.18, 40]} />
      <meshStandardMaterial color={CORE_MATERIALS.steel} metalness={0.94} roughness={0.28} />
    </mesh>
    <mesh position={[0, 0.39, 0]}>
      <torusGeometry args={[0.67, 0.055, 8, 40]} />
      <meshStandardMaterial color={CORE_MATERIALS.accent} metalness={0.88} roughness={0.27} emissive={CORE_MATERIALS.accent} emissiveIntensity={0.025} />
    </mesh>
    <mesh position={[0, 0.47, 0]} castShadow>
      <cylinderGeometry args={[0.23, 0.23, 0.2, 24]} />
      <meshStandardMaterial color={CORE_MATERIALS.steelLight} metalness={0.95} roughness={0.21} />
    </mesh>
    {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle) => (
      <mesh key={angle} position={[Math.cos(angle) * 0.84, 0.27, Math.sin(angle) * 0.84]}>
        <cylinderGeometry args={[0.055, 0.055, 0.035, 12]} />
        <meshStandardMaterial color={CORE_MATERIALS.steelLight} metalness={0.9} roughness={0.28} />
      </mesh>
    ))}
  </group>
})
