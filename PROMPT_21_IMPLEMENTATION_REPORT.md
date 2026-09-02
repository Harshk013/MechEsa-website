# PROMPT 21 — RUNTIME HARDENING, PERFORMANCE AUDIT & INTERACTION QA

## 1. Build result

**BUILD NOT VERIFIED**

`node_modules` was not available in the supplied project. A dependency installation attempt was made with `npm install --no-audit --no-fund --ignore-scripts`, but it timed out in the environment before dependencies became available. Therefore `npm run build` / `tsc -b` could not be truthfully reported as passing.

## 2. Runtime issues found

- Confirmed that the invalid `material.color.getLuminance()` API usage is absent from implementation source.
- Audited Mechanical Core material access and retained the Prompt 20 safe `MeshStandardMaterial` filtering, array handling, WeakMap deduplication, and immutable snapshots.
- Found a lifecycle bug in the development `DebugOverlay`: its delayed RAF chain could lose the RAF id after the timeout fired. Cleanup now tracks both the timeout and the active RAF.
- Found a one-shot mobile-navigation focus RAF without cleanup. It is now cancelled when the menu effect unmounts/re-runs.
- Found a Contact form validation timeout created directly inside the submit handler. Validation timing is now effect-managed and cleaned up on state changes/unmount.
- Found a concrete Mechanical Core crank-slider geometry issue: the piston position omitted the crank-pin vertical component, so the connecting rod was not guaranteed to retain its declared length. The pure crank-slider helper now preserves the fixed rod constraint.

No blanket console suppression was added.

## 3. Animation audit

Audited all implementation occurrences of:
- `requestAnimationFrame`
- R3F `useFrame`
- `setTimeout` / `setInterval`
- `IntersectionObserver`
- DOM/window event listeners

Intentional continuous loops remain:
- Lenis
- global Engineering Cursor
- pointer interpolation
- ambient pointer light
- HomeScrollController
- Mechanical Core R3F animation
- Mechanical Core camera

These remain lifecycle-cleaned. Engineering Lab particle loops remain visibility-aware.

Thermodynamics and Fluid Mechanics custom RAF loops:
- pause when not visible;
- stop under reduced motion;
- cancel their RAF on cleanup;
- recreate only when their relevant control/representation/visibility dependencies change.

Manufacturing and Robotics do not use custom RAF loops.

## 4. Mechanical Core

- Representation remains `reality | blueprint`.
- `blueprintAmount` remains the only interpolated representation state.
- Material snapshots remain immutable.
- Unsupported materials are skipped safely.
- Material arrays are normalized safely.
- Shared material instances are deduplicated with `WeakMap`.
- No `getLuminance` call remains.
- Existing gear, shaft, crank, rod, piston, engagement and telemetry architecture was preserved.
- Crank-slider geometry was corrected to maintain the connecting-rod constraint.
- No renderer recreation or speculative WebGL context-loss handler was introduced.
- Existing R3F `Canvas` remains the single Mechanical Core canvas.
- Existing React error boundary remains in place.

Browser GPU context-loss behavior could not be directly reproduced because a dependency-complete browser runtime was unavailable in this environment.

## 5. Robotics

- Forward kinematics remains authoritative in `calculateRobotics()`.
- Removed redundant component-level `calculateForwardKinematics()` recalculation.
- Model remains:
  - L1 = 120 visual units
  - L2 = 90 visual units
  - maximum reach = 210
  - minimum theoretical reach = 30
  - angle clamp = -150° to +150°
- SVG Y inversion remains centralized in `toSvgPoint()`.
- Numerical spot checks were performed for default and boundary-angle cases.
- Workspace remains centered on the base.
- Target relationship continues to derive from the same end-effector result.
- No RAF, inverse kinematics, dynamics, or physics was introduced.

## 6. Engineering Lab

Verified the selector routing:
- Thermodynamics → `ThermodynamicsInstrument`
- Fluid Mechanics → `FluidMechanicsInstrument`
- Manufacturing → `ManufacturingInstrument`
- Robotics → `RoboticsInstrument`
- Other systems → informational preview

Module lifecycle was audited so only the mounted selected module owns its local observers/animation loop. Existing instrument models were not rewritten.

## 7. Routing

- Existing route-level page RAF effects all cancel their pending RAF on cleanup.
- Page event listeners use matching cleanup.
- Navigation mobile-menu keyboard listener is cleaned up.
- Mobile-menu focus RAF is now also cancelled.
- Existing PageTransition architecture was preserved.

## 8. Reduced motion

Existing reduced-motion behavior was preserved:
- Mechanical Core reduces motion.
- Engineering Lab particle loops stop where applicable.
- Manufacturing/Robotics transitions become immediate/minimal.
- Cursor and ambient motion stop/reduce.
- Initialization and page animations retain reduced durations.
- Scroll progress remains functional.

## 9. Responsive

Source/CSS architecture was audited for desktop/tablet/mobile behavior, especially:
- Mechanical Core
- Engineering Lab
- Robotics SVG
- controls/readouts
- navigation

No responsive redesign was introduced. The existing mobile-specific quality and particle reductions were preserved.

A live browser overflow test could not be performed without a dependency-complete runtime.

## 10. Console

- `getLuminance` implementation usage: **none**.
- No `console.clear()` was introduced.
- No global warning/error suppression was introduced.
- Existing intentional browser/dev diagnostics remain available.

A live browser console session could not be run in the blocked build environment.

## 11. Dependencies

**No new dependencies added.**

No new state library, animation library, physics engine, WebGL engine, or canvas system was introduced.

## 12. Remaining limitations

- Production TypeScript/Vite build remains **not verified** because dependency installation timed out.
- Browser-level runtime, GPU context-loss, responsive overflow, and console behavior could not be executed end-to-end in this environment.
- The audit therefore distinguishes source-level verification from browser verification rather than claiming unsupported runtime results.

## 13. Files changed

- `src/components/home/EngineeringLab/RoboticsInstrument.tsx`
- `src/components/home/MechanicalCoreStage/gearMath.ts`
- `src/components/interaction/DebugOverlay.tsx`
- `src/components/navigation/MechanicalNavigation.tsx`
- `src/pages/Contact/ContactPage.tsx`
- `PROMPT_21_IMPLEMENTATION_REPORT.md`

## 14. Scope

No new feature, page, Engineering Lab system, telemetry system, F1 experience, exploded view, inverse kinematics, physics, or redesign was implemented.

**PROMPT 21 COMPLETE**
