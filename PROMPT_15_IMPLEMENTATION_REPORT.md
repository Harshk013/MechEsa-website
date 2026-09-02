# Prompt 15 Implementation Report — Mechanical Core Reality ↔ Blueprint

## 1. MechanicalCore architecture inspected

Inspected the existing `MechanicalCoreScene`, camera, lighting, gear, shaft, bearing, hub, piston, constants/types, stage wrapper, existing telemetry/engagement logic, and `BlueprintMachineOverlay`. The existing machine geometry and motion architecture were retained.

## 2. Representation integration

The existing global `useRepresentation()` context remains the single authority. `CoreAssembly` consumes `isBlueprint` and maintains a local interpolation ref only for render-time material treatment. Representation is not added to `MechanicalCoreState`.

## 3. Reality material behavior

Reality remains the existing physical material hierarchy: graphite, steel, steel-light and accent materials retain their original colors, metalness and roughness when the representation amount returns to zero.

## 4. Blueprint material behavior

Added `mechanicalRepresentation.ts`, which captures the existing `MeshStandardMaterial` instances once and derives restrained blueprint targets. During a mode change, materials interpolate toward a desaturated blueprint-blue technical treatment, lower metalness, higher roughness and a very small emissive lift. Dark structural materials remain darker, so Blueprint is not a uniform blue wash.

The interpolation is performed inside the existing CoreAssembly `useFrame` loop; no second animation loop or React state update loop was introduced. The normal transition is tuned to settle in roughly the requested 300–700 ms range, while reduced motion switches directly to the target representation.

## 5. Edge / linework implementation

The primary, secondary and tertiary gears now use lightweight Drei `Edges` linework, visible only in Blueprint representation. This follows the actual gear geometry and therefore rotates with the existing gear groups. The existing DOM/SVG Blueprint overlay remains in place and provides the broader construction/documentation layer.

## 6. Blueprint overlay refinement

`BlueprintMachineOverlay` was preserved rather than replaced. Its symbolic labels and construction geometry remain intentionally non-dimensional: `AXIS / A`, `Ø SHAFT`, `PRIMARY GEAR / G32`, `CRANK / C01`, `PISTON / P01`, and `REF / MACHINE CORE`. No fabricated millimetre dimensions were introduced.

## 7. Camera behavior

The existing `MechanicalCoreCamera` remains the sole authoritative camera. No second camera or camera mode was introduced.

## 8. Machine-state separation

Removed the obsolete `blueprint` value from `MechanicalCoreState`; representation is already modeled globally as `reality | blueprint`. Idle/active/engaged behavior therefore remains independent from representation mode.

## 9. Hover behavior

Existing `hoveredObject` / focus behavior and pointer intent remain unchanged. Gear edge visibility follows the representation mode while the existing focus and engagement callbacks continue to operate independently.

## 10. Telemetry behavior

RPM, ratio, cycle and active-object telemetry are untouched. Representation does not alter or fabricate telemetry values.

## 11. Performance strategy

No new canvas, post-processing, shader pass, dependency, state library, or animation loop was introduced. Materials are traversed once after the assembly mounts; subsequent representation changes mutate existing material properties directly inside the already-required render loop. Only three primary gear objects receive edge linework.

## 12. Responsive behavior

The existing mobile quality path remains authoritative. No additional scene or annotation-heavy mobile composition was introduced. Existing Blueprint overlay mobile density rules continue to hide lower-priority labels, while the 3D machine remains the same responsive core.

## 13. Reduced motion

When reduced motion is enabled, representation amount switches directly between reality and blueprint instead of running the interpolation. Existing mechanical motion behavior is preserved. The Blueprint overlay also retains its existing no-animation treatment under reduced-motion CSS.

## 14. Accessibility

The representation control remains the existing keyboard-accessible control with `aria-pressed` and contextual accessible labels. The Blueprint SVG remains supplementary and `aria-hidden`. The existing core engagement control and machine label were not replaced.

## 15. Build result

`npm install --no-audit --no-fund` was attempted but timed out in the environment after 120 seconds, leaving `node_modules` unavailable. `npm run build` was then attempted. The TypeScript syntax errors introduced during the first edit were corrected; the remaining build output is dominated by missing installed dependencies (`react`, `react-router-dom`, `three`, Vite, etc.) because installation did not complete. Therefore a successful production build cannot be claimed.

## 16. Known limitations

- The environment prevented a dependency-complete production build verification.
- Blueprint edge linework currently targets the three principal gears rather than every structural mesh, deliberately avoiding heavy outlining.
- Blueprint lighting uses a representation-aware intensity reduction rather than a separate lighting rig.
- The existing camera remains shared between representations; no perspective adjustment was added because the current composition already reads clearly in both states.

## 17. Preparation for future exploded view

The representation treatment is isolated in `mechanicalRepresentation.ts` and applied at the existing `CoreAssembly` boundary. Existing component refs and transforms remain intact, so a future exploded-view layer can manipulate component groups without coupling explosion transforms to material/representation logic. No components were moved apart in this prompt.

## Scope confirmation

Only the Mechanical Core representation behavior was deepened. Events, Team, Blogs, About, Contact, global navigation, global representation provider, page transitions and Lenis were not redesigned. Exploded view, simulations, telemetry expansion and other future Phase 2 systems were not implemented.
