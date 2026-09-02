import * as THREE from 'three'

const BLUEPRINT = new THREE.Color('#82a9c7')
const BLUEPRINT_DARK = new THREE.Color('#243b49')

type MaterialSnapshot = {
  material: THREE.MeshStandardMaterial
  color: THREE.Color
  targetColor: THREE.Color
  emissive: THREE.Color
  targetEmissive: THREE.Color
  metalness: number
  targetMetalness: number
  roughness: number
  targetRoughness: number
  emissiveIntensity: number
  targetEmissiveIntensity: number
}

/**
 * Three.Color does not expose a luminance helper in the supported Three.js API.
 * This normalized RGB weighting is sufficient for the visual question we ask:
 * whether the source material is very dark before choosing a blueprint target.
 */
export function getColorLuminance(color: THREE.Color) {
  return 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b
}

export function captureMechanicalMaterials(root: THREE.Object3D) {
  const snapshots: MaterialSnapshot[] = []
  const seen = new WeakMap<THREE.Material, MaterialSnapshot>()

  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return
    const materials = Array.isArray(object.material) ? object.material : [object.material]

    materials.forEach((material) => {
      if (!(material instanceof THREE.MeshStandardMaterial)) return
      if (seen.has(material)) return

      // Clone every original value once. These clones are immutable reference
      // values for the lifetime of this representation snapshot.
      const color = material.color.clone()
      const emissive = material.emissive.clone()
      const targetColor = color.clone().lerp(BLUEPRINT, 0.42)
      if (getColorLuminance(color) < 0.16) targetColor.lerp(BLUEPRINT_DARK, 0.2)

      const snapshot: MaterialSnapshot = {
        material,
        color,
        targetColor,
        emissive,
        targetEmissive: emissive.clone().lerp(BLUEPRINT, 0.1),
        metalness: material.metalness,
        targetMetalness: Math.min(0.34, material.metalness * 0.38),
        roughness: material.roughness,
        targetRoughness: Math.min(0.72, material.roughness + 0.2),
        emissiveIntensity: material.emissiveIntensity,
        targetEmissiveIntensity: Math.max(material.emissiveIntensity, 0.025),
      }

      seen.set(material, snapshot)
      snapshots.push(snapshot)
    })
  })

  return snapshots
}

export function applyMechanicalRepresentation(snapshots: MaterialSnapshot[], blueprintAmount: number) {
  const amount = THREE.MathUtils.clamp(blueprintAmount, 0, 1)
  snapshots.forEach(({ material, color, targetColor, emissive, targetEmissive, metalness, targetMetalness, roughness, targetRoughness, emissiveIntensity, targetEmissiveIntensity }) => {
    material.color.copy(color).lerp(targetColor, amount)
    material.metalness = THREE.MathUtils.lerp(metalness, targetMetalness, amount)
    material.roughness = THREE.MathUtils.lerp(roughness, targetRoughness, amount)
    material.emissive.copy(emissive).lerp(targetEmissive, amount)
    material.emissiveIntensity = THREE.MathUtils.lerp(emissiveIntensity, targetEmissiveIntensity, amount)
  })
}
