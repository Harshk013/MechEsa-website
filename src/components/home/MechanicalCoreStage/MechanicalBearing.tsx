import { useMemo } from 'react'
import { CORE_MATERIALS } from './mechanicalCore.constants'

type BearingProps = { position?: [number, number, number]; scale?: number; axis?: 'y' | 'x' | 'z' }

export function MechanicalBearing({ position = [0, 0, 0], scale = 1, axis = 'y' }: BearingProps) {
  const balls = useMemo(() => Array.from({ length: 8 }, (_, index) => {
    const angle = (index / 8) * Math.PI * 2
    return [Math.cos(angle) * 0.36, Math.sin(angle) * 0.36, 0] as [number, number, number]
  }), [])
  const rotation: [number, number, number] = axis === 'x' ? [0, Math.PI / 2, 0] : axis === 'z' ? [Math.PI / 2, 0, 0] : [Math.PI / 2, 0, 0]
  return <group position={position} scale={scale}>
    <group rotation={rotation}>
      <mesh>
        <torusGeometry args={[0.48, 0.12, 10, 32]} />
        <meshStandardMaterial color={CORE_MATERIALS.graphite} metalness={0.92} roughness={0.34} />
      </mesh>
      <mesh>
        <torusGeometry args={[0.29, 0.055, 8, 32]} />
        <meshStandardMaterial color={CORE_MATERIALS.steel} metalness={0.94} roughness={0.28} />
      </mesh>
      {balls.map((ball) => <mesh key={ball.join('-')} position={ball}>
        <sphereGeometry args={[0.052, 8, 8]} />
        <meshStandardMaterial color={CORE_MATERIALS.steelLight} metalness={0.95} roughness={0.2} />
      </mesh>)}
    </group>
    <mesh position={axis === 'y' ? [0, 0.035, 0] : [0, 0, 0.035]}>
      <torusGeometry args={[0.53, 0.025, 6, 32]} />
      <meshStandardMaterial color={CORE_MATERIALS.graphiteDark} metalness={0.85} roughness={0.4} />
    </mesh>
  </group>
}
