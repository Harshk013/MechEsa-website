import { forwardRef, useMemo, useState } from 'react'
import * as THREE from 'three'
import { Edges } from '@react-three/drei'
import { CORE_MATERIALS } from './mechanicalCore.constants'
import { useRepresentation } from '../../../app/providers/RepresentationProvider'

type MechanicalGearProps = {
  radius: number
  teeth: number
  thickness: number
  material?: 'graphite' | 'steel' | 'accent'
  position?: [number, number, number]
  scale?: number
  onPointerEnter?: () => void
  onPointerLeave?: () => void
  onClick?: () => void
}

function createGearShape(radius: number, teeth: number, toothDepth = 0.16) {
  const shape = new THREE.Shape()
  const innerRadius = radius * 0.62
  const rootRadius = radius
  const outerRadius = radius + toothDepth
  const steps = teeth * 4
  for (let i = 0; i < steps; i += 1) {
    const angle = (i / steps) * Math.PI * 2
    const phase = i % 4
    const r = phase === 1 || phase === 2 ? outerRadius : rootRadius
    const x = Math.cos(angle) * r
    const y = Math.sin(angle) * r
    if (i === 0) shape.moveTo(x, y)
    else shape.lineTo(x, y)
  }
  shape.closePath()
  const hole = new THREE.Path()
  hole.absarc(0, 0, innerRadius, 0, Math.PI * 2, true)
  shape.holes.push(hole)
  return shape
}

export const MechanicalGear = forwardRef<THREE.Group, MechanicalGearProps>(function MechanicalGear({ radius, teeth, thickness, material = 'graphite', position = [0, 0, 0], scale = 1, onPointerEnter, onPointerLeave, onClick }, ref) {
  const [hovered, setHovered] = useState(false)
  const { isBlueprint } = useRepresentation()
  const geometry = useMemo(() => new THREE.ExtrudeGeometry(createGearShape(radius, teeth), {
    depth: thickness,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: 0.035,
    bevelThickness: 0.03,
    curveSegments: 1,
  }), [radius, teeth, thickness])
  const color = material === 'steel' ? CORE_MATERIALS.steel : material === 'accent' ? CORE_MATERIALS.accent : CORE_MATERIALS.graphite

  return <group ref={ref} position={position} scale={scale}
    onPointerEnter={(event) => { event.stopPropagation(); setHovered(true); onPointerEnter?.() }}
    onPointerLeave={(event) => { event.stopPropagation(); setHovered(false); onPointerLeave?.() }}
    onClick={(event) => { event.stopPropagation(); onClick?.() }}>
    <mesh geometry={geometry} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
      <meshStandardMaterial color={color} metalness={0.9} roughness={hovered ? 0.24 : 0.32} emissive={CORE_MATERIALS.accent} emissiveIntensity={hovered ? 0.055 : 0.008} />
      <Edges threshold={24} color={CORE_MATERIALS.blueprint} linewidth={0.7} visible={isBlueprint} />
    </mesh>
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, thickness * 0.52]}>
      <ringGeometry args={[radius * 0.28, radius * 0.38, 32]} />
      <meshStandardMaterial color={CORE_MATERIALS.steelLight} metalness={0.95} roughness={0.25} />
    </mesh>
    <mesh position={[0, 0, -thickness * 0.04]} rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[radius * 0.58, radius * 0.61, 32]} />
      <meshStandardMaterial color={CORE_MATERIALS.graphiteDark} metalness={0.86} roughness={0.38} />
    </mesh>
  </group>
})
