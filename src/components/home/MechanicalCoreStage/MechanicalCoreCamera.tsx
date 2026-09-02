import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { CORE_CONFIG } from './mechanicalCore.constants'
import { usePointer } from '../../interaction/PointerProvider'
import { useMotionSettings } from '../../../app/providers/MotionProvider'

export function MechanicalCoreCamera() {
  const { camera } = useThree()
  const { pointerRef } = usePointer()
  const { reducedMotion } = useMotionSettings()
  const lookAt = useRef(new THREE.Vector3(0, -0.05, 0))
  const target = useRef(new THREE.Vector3(0.45, 0.55, CORE_CONFIG.cameraDistance))

  useEffect(() => {
    camera.position.copy(target.current)
    camera.lookAt(lookAt.current)
  }, [camera])

  useFrame((_, delta) => {
    const damping = 1 - Math.pow(0.001, delta)
    const targetX = reducedMotion ? 0.45 : 0.45 + pointerRef.current.nx * 0.22
    const targetY = reducedMotion ? 0.55 : 0.55 - pointerRef.current.ny * 0.16
    target.current.set(targetX, targetY, CORE_CONFIG.cameraDistance)
    camera.position.lerp(target.current, damping * 0.045)
    camera.lookAt(lookAt.current)
  })

  return null
}
