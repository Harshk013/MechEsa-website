# MECHESA — Prompt 05 Implementation Report

## 1. Files created

- `src/components/home/MechanicalCoreStage/MechanicalCoreScene.tsx`
- `src/components/home/MechanicalCoreStage/MechanicalCoreCamera.tsx`
- `src/components/home/MechanicalCoreStage/MechanicalCoreLighting.tsx`
- `src/components/home/MechanicalCoreStage/MechanicalCoreOverlay.tsx`
- `src/components/home/MechanicalCoreStage/MechanicalGear.tsx`
- `src/components/home/MechanicalCoreStage/MechanicalShaft.tsx`
- `src/components/home/MechanicalCoreStage/MechanicalBearing.tsx`
- `src/components/home/MechanicalCoreStage/MechanicalHub.tsx`
- `src/components/home/MechanicalCoreStage/MechanicalPiston.tsx`
- `src/components/home/MechanicalCoreStage/mechanicalCore.types.ts`
- `src/components/home/MechanicalCoreStage/mechanicalCore.constants.ts`
- `src/components/home/MechanicalCoreStage/gearMath.ts`
- `src/components/home/MechanicalCoreStage/useCoreQuality.ts`
- `src/components/home/MechanicalCoreStage/mechanicalCore.css`
- `PROMPT_05_IMPLEMENTATION_REPORT.md`

## 2. Files modified

- `src/components/home/MechanicalCoreStage.tsx` — replaced the CSS placeholder with the R3F scene boundary and machine controls.
- `src/components/interaction/DebugOverlay.tsx` — exposes development-only core state, RPM, ratio and focus information.
- `DEVELOPER_DESIGN_SYSTEM.md` — documented Prompt 05 mechanical-core rules.
- `package.json` — added Three.js, React Three Fiber and Drei dependencies.

## 3. Dependencies added

- `three` `^0.179.1`
- `@react-three/fiber` `^9.3.0`
- `@react-three/drei` `^10.7.6`

No physics, audio, postprocessing or additional simulation dependency was added.

## 4. Mechanical components

The first procedural assembly contains:

- machined central hub
- central rotating shaft
- toothed primary gear
- toothed secondary gear
- toothed output gear
- simplified bearing rings and rolling elements
- crank
- connecting rod
- constrained piston
- outer structural rings

The geometry is generated from primitives and procedural gear outlines. No external GLTF asset is used.

## 5. Gear relationship logic

The machine has one shared angular time source. The primary gear velocity is derived from the machine RPM. Secondary and tertiary gear velocities are calculated from tooth counts and reverse direction when meshed:

`omega_out = -(omega_in * teeth_in) / teeth_out`

The current primary/secondary ratio is 32:16 = 2.00, so the secondary rotates at approximately twice the angular speed in the opposite direction.

## 6. Piston kinematics

The piston uses a simplified crank-slider solution rather than a pure sine wave. Given crank radius `r`, rod length `L` and crank angle `theta`:

`x = r cos(theta)`

`y = r sin(theta) + sqrt(L² - x²)`

The connecting rod is positioned and rotated from the calculated crank pin to the slider position each frame, keeping the mechanism geometrically constrained.

## 7. Machine state architecture

States supported:

`off | idle | initializing | active | interacting | engaged | blueprint`

The homepage defaults to `idle`. Entering the core promotes idle to active. Clicking the core or the core-control button changes the state to `engaged` for a short controlled interval and increases the derived RPM from 120 to 168.

## 8. Interaction

- Pointer motion subtly damps the camera orientation.
- Hovering gears changes their accent/emissive response.
- Hovering major 3D parts updates the centralized engineering cursor intent.
- Clicking a major mechanism engages the machine.
- The existing DOM cursor system is reused; no second cursor system was created.
- DOM telemetry displays derived RPM, gear ratio, actuator cycle and current focus.

## 9. Responsive behavior

Desktop receives the full procedural assembly. At mobile widths, the secondary/output gears and bearing details are omitted and DPR is reduced. The central hub, shaft and actuator remain so the machine still reads as a mechanical system.

## 10. Reduced motion

Reduced-motion mode changes the R3F render loop to demand mode, drastically slows mechanical progression and removes pointer-driven camera movement. The assembly remains visible and functional.

## 11. WebGL fallback

The R3F Canvas has a visible fallback panel for environments where WebGL cannot initialize. The homepage remains usable because the title, copy and CTA remain normal DOM content outside the canvas.

## 12. Performance decisions

- Procedural low/moderate geometry instead of GLTF assets.
- Controlled DPR: desktop `[1, 1.75]`, mobile `[1, 1.2]`.
- No postprocessing or physics engine.
- A single central assembly `useFrame` drives mechanical transforms.
- Rapid values are refs rather than React state.
- React telemetry updates are throttled to roughly 120 ms.
- Only a single controlled shadow-casting directional light is used.
- Contact shadows use a 256px map and one frame.

## 13. Build result

A full `npm run build` could not be completed in this environment because external npm package installation timed out. The requested R3F dependencies were therefore added to `package.json`, but a local dependency-resolved production build cannot be honestly reported as successful here.

## 14. Known limitations

- The crank is driven from the same angular source as the main shaft but is currently represented as a visually separate actuator module rather than a fully modeled mechanical coupling shaft.
- Mobile intentionally reduces the gear train detail rather than attempting the full desktop assembly.
- The WebGL fallback is a static engineering panel rather than a second rendered CSS machine.
- No audio, physics, blueprint mode, exploded mode, or cinematic scroll choreography was added.

## 15. Preserve for future prompts

Keep `MechanicalCoreStage` as the stable homepage API. Future 3D enhancements should extend the dedicated `MechanicalCoreStage/` module rather than moving Three.js code into `HomePage.tsx`. Continue deriving mechanical motion from shared machine state and maintain the existing graphite/steel/accent visual language.
