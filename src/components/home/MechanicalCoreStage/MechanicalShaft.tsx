import { forwardRef } from 'react'
import * as THREE from 'three'
import { CORE_MATERIALS } from './mechanicalCore.constants'

type MechanicalShaftProps = {
  length: number
  radius: number
  position?: [number, number, number]
  axis?: 'y' | 'x' | 'z'
  detail?: boolean
}

export const MechanicalShaft = forwardRef<THREE.Group, MechanicalShaftProps>(function MechanicalShaft({ length, radius, position = [0, 0, 0], axis = 'y', detail = true }, ref) {
  const rotation: [number, number, number] = axis === 'x' ? [0, 0, Math.PI / 2] : axis === 'z' ? [Math.PI / 2, 0, 0] : [0, 0, 0]
  return <group ref={ref} position={position}>
    <group rotation={rotation}>
      <mesh castShadow>
        <cylinderGeometry args={[radius, radius, length, 24]} />
        <meshStandardMaterial color={CORE_MATERIALS.steelLight} metalness={0.94} roughness={0.24} />
      </mesh>
      {detail && <>
        <mesh position={[0, length * 0.28, 0]}>
          <cylinderGeometry args={[radius * 1.28, radius * 1.28, 0.13, 24]} />
          <meshStandardMaterial color={CORE_MATERIALS.graphite} metalness={0.9} roughness={0.34} />
        </mesh>
        <mesh position={[0, -length * 0.25, 0]}>
          <cylinderGeometry args={[radius * 1.16, radius * 1.16, 0.09, 24]} />
          <meshStandardMaterial color={CORE_MATERIALS.steel} metalness={0.92} roughness={0.3} />
        </mesh>
      </>}
    </group>
  </group>
})
