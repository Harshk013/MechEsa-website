# PROMPT 20 — IMPLEMENTATION REPORT

## 1. Known error reproduced / inspected
Inspected the current Prompt 19 codebase before changing it. The reported failure was present in `src/components/home/MechanicalCoreStage/mechanicalRepresentation.ts`: material capture called a luminance method that is not available on the supported `THREE.Color` API.

The failure path matched the reported Mechanical Core representation-capture path. No other source reference to that unsupported API remains after the fix.

## 2. Root cause
`captureMechanicalMaterials()` assumed `THREE.Color` exposed a `getLuminance()` helper. The installed project targets Three.js `^0.179.1`, where that assumption is invalid. The exception occurs while the Mechanical Core scene is mounting, so the R3F canvas can fail before the machine becomes usable.

## 3. Luminance fix
Added a small pure `getColorLuminance(color)` helper using normalized RGB weighting:

`0.2126 * r + 0.7152 * g + 0.0722 * b`

The helper is only used to decide whether an original material is very dark before selecting its blueprint target color. No color-management dependency or package was introduced.

## 4. Material robustness changes
`captureMechanicalMaterials()` now:
- accepts a single material or material array from a mesh;
- captures only `THREE.MeshStandardMaterial` instances;
- safely skips unsupported material types;
- clones original color/emissive values once;
- derives target values from those immutable snapshot clones.

`applyMechanicalRepresentation()` clamps the interpolation amount to `[0, 1]` and only writes properties known to exist on the captured `MeshStandardMaterial`.

## 5. Material deduplication changes
A `WeakMap<THREE.Material, MaterialSnapshot>` now tracks captured material instances. A shared material used by multiple meshes produces one snapshot instead of repeated snapshots. This keeps representation work proportional to unique supported material instances.

## 6. Representation restoration test
The implementation was audited for the repeated sequence:

`REALITY → BLUEPRINT → REALITY → BLUEPRINT → REALITY`

The snapshot stores original color, emissive, metalness, roughness, and emissive intensity separately from all target values. Applying a representation therefore never overwrites the source snapshot, so returning to `blueprintAmount = 0` restores the original values rather than a progressively mutated approximation.

`targetColor` and other target properties are created once during capture and are not recalculated in `useFrame()`.

## 7. WebGL / context investigation
The primary context was the uncaught material exception during Mechanical Core initialization. The project has a single Mechanical Core `<Canvas>` and no second canvas in the Engineering Lab. No unstable Canvas key, renderer recreation, or manual renderer disposal was found.

The existing R3F `fallback` remains intact for unavailable WebGL. A small React error boundary was added around the Mechanical Core scene so a genuine scene/render-time exception has a contained visible `WEBGL / CORE ERROR` fallback instead of making the surrounding homepage unusable. No manual renderer recreation or `webglcontextlost` handler was added because there was no evidence requiring one.

## 8. Mechanical Core audit
Inspected `MechanicalCoreScene.tsx`, `MechanicalCoreStage.tsx`, camera, lighting, gear, shafts, bearings, hub, piston, and representation code.

Findings:
- one existing machine-motion `useFrame` plus one camera `useFrame`;
- representation interpolation stays inside the existing machine render loop;
- no React state updates occur inside `useFrame()`;
- existing refs are reused for moving objects;
- geometry creation is memoized where dynamically constructed (`MechanicalGear`);
- camera vectors are held in refs rather than recreated per frame;
- telemetry is throttled rather than emitted every render frame;
- no new renderer/canvas is created.

No unrelated Mechanical Core rewrite was made.

## 9. Robotics audit
Inspected `robotics.ts` and `RoboticsInstrument.tsx`.

Forward kinematics remains:

`x = L1 cos(θ1) + L2 cos(θ1 + θ2)`

`y = L1 sin(θ1) + L2 sin(θ1 + θ2)`

Angles are converted from degrees to radians before calculation. SVG conversion correctly inverts mathematical Y. The normalized workspace remains `L1 + L2 = 210` maximum and `|L1 - L2| = 30` minimum.

Two concrete visual robustness fixes were made during the audit:
- the SVG origin/scale was adjusted so the maximum workspace remains inside the normal `660 × 420` viewBox;
- angle-arc sweep direction now follows the sign of the actual angle change, preventing negative-angle arcs from taking the long path. The angle labels are positioned from the actual arc mid-angle.

No inverse kinematics or dynamics were introduced.

## 10. Engineering Lab audit
Verified the selector routing:
- Thermodynamics → `ThermodynamicsInstrument`
- Fluid Mechanics → `FluidMechanicsInstrument`
- Manufacturing → `ManufacturingInstrument`
- Robotics → `RoboticsInstrument`
- all other systems → informational `MechanicalPanel` preview.

The existing selection architecture was preserved.

## 11. Thermodynamics audit
The existing visibility observer disconnects on cleanup. Its animation frame is cancelled on cleanup. The existing reduced-motion path renders without a continuing animation loop. No model logic was changed.

## 12. Fluid Mechanics audit
The existing visibility observer disconnects on cleanup. Its SVG particle RAF is cancelled on cleanup and only schedules another frame while visible and motion is allowed. No model logic was changed.

## 13. Manufacturing audit
The existing manufacturing model remains deterministic from progress. The tool position is derived from the normalized toolpath and no continuous RAF exists. Its progress timeout is cleared during unmount and before replacement, preventing stale cutting-state timers.

## 14. Representation audit
`RepresentationMode` remains exactly:

`'reality' | 'blueprint'`

It remains separate from `MechanicalCoreState`. No second representation context was introduced.

The Mechanical Core representation uses the same `useRepresentation()` provider as the Engineering Lab modules. Blueprint interpolation is driven by one `blueprintAmountRef` in the existing R3F loop.

## 15. Console audit
A source-wide search found no remaining unsupported luminance API call. The Mechanical Core representation path now performs only supported material operations.

No blanket warning suppression was added. The error boundary is intentionally quiet and only provides a visible containment state if a future render-time exception actually occurs.

## 16. TypeScript / build result
**BUILD NOT VERIFIED.**

The current environment does not contain `node_modules`, and previous npm installation attempts for this project have timed out. Per the stabilization scope, no extended reinstall attempt was made. A production build therefore could not be honestly reported as passing.

Static checks performed instead:
- source-wide unsupported luminance API search;
- source inspection of the Mechanical Core hot path;
- source inspection of all four Engineering Lab interactive modules;
- forward-kinematics numerical spot checks;
- workspace/bounds reasoning;
- ZIP integrity verification after packaging.

## 17. Responsive audit
The existing responsive structure was preserved. The only Robotics geometry adjustment was to keep its conceptual workspace inside the existing SVG bounds at normal joint limits. No page-level responsive redesign was made.

## 18. Accessibility audit
Existing Engineering Lab controls remain real buttons/range inputs with labels, exposed values, keyboard operation, and visible focus treatment. The Robotics SVG remains supplementary (`aria-hidden`) because the important joint, coordinate, reach, target-offset, and forward-kinematics information is present in the DOM readout.

The new Mechanical Core failure boundary uses `role="status"` for its visible fallback.

## 19. Performance findings
No new continuous loop was introduced. The Mechanical Core continues to use its existing render loops. Material representation work now iterates unique captured supported materials rather than duplicate references.

No geometry/material allocations were added to the Mechanical Core `useFrame()` hot path.

## 20. Files changed
- `src/components/home/MechanicalCoreStage/mechanicalRepresentation.ts`
  - compatible luminance helper;
  - supported-material safety;
  - shared-material deduplication;
  - immutable representation snapshots;
  - clamped interpolation.
- `src/components/home/MechanicalCoreStage.tsx`
  - contained React error boundary around the Mechanical Core scene.
- `src/components/home/EngineeringLab/RoboticsInstrument.tsx`
  - SVG bounds adjustment;
  - signed angle-arc handling;
  - angle-label positioning.
- `PROMPT_20_IMPLEMENTATION_REPORT.md`
  - this stabilization report.

No other feature modules or global architecture were changed.

## 21. Known remaining issues
- Production build remains unverified because dependencies are not installed in the execution environment.
- Actual browser/WebGL runtime verification could not be performed here, so the original context-loss symptom cannot be independently observed after the root exception fix.
- The Mechanical Core fallback contains render-time failures; it is not intended to recover an actual GPU/browser context-loss event by recreating the renderer.
- Existing canvas-based Thermodynamics and SVG particle animation remain intentionally present because they are part of the established Engineering Lab architecture.

## 22. Future recommendations
Before adding another major experience:
1. install dependencies in a network-capable environment and run `npm run build`;
2. open the homepage in a browser and exercise the Mechanical Core representation toggle repeatedly;
3. test all four Engineering Lab instruments through Reality/Blueprint and repeated selector changes;
4. inspect the browser console for any runtime warnings after the corrected Mechanical Core mount;
5. verify mobile and reduced-motion behavior on representative devices/settings.

No next feature was implemented in this pass.
