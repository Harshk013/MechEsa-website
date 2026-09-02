# PROMPT 25 IMPLEMENTATION REPORT

## Engineering in Motion // Final Runtime Cleanup

Focused cleanup only. No new feature, dependency, page, or unrelated system was introduced.

## 1. Callback stability

`onStateChange` and `onHistoryChange` are now stored in callback refs and updated independently from the simulation lifecycle. The input-state effect depends only on `inputs`, while the animation/IntersectionObserver lifecycle remains dependent only on `reduced`.

This prevents parent callback identity changes from causing the motion lifecycle effect to recreate the observer/RAF.

## 2. Initial / reset state

The authoritative chain remains:

```text
TRACK_MODEL
  ↓
INITIAL_TRACK_PROGRESS
  ↓
deriveVehicleState()
  ↓
INITIAL_VEHICLE_STATE
```

Reset sets `trackProgressRef` back to `INITIAL_TRACK_PROGRESS`, derives the vehicle state from that same track position, recalculates the initial conceptual motion state, clears the ring-buffer counters, resets the trace to the derived position, and applies the same visual-state helper used elsewhere.

No independent reset coordinate is used.

A single `applyVehicleVisualState()` helper now owns the repeated SVG vehicle/vector/lateral/thermal/front-wheel updates used by runtime, reset, and reduced-motion updates.

## 3. SVG hot path

The simulation still runs every browser RAF, but trace string generation is now visually throttled to approximately 30 updates/sec using a timestamp gate. The simulation itself is not throttled and no second RAF is introduced.

The trace remains one SVG polyline and remains capped by the existing 80-point history.

The trace builder uses a single string builder rather than allocating a temporary points array on each visual update.

## 4. RAF lifecycle

Engineering Motion retains **ONE RAF**.

Lifecycle:

```text
mount / reduced-motion change
        ↓
IntersectionObserver
        ↓
one RAF chain while visible
        ↓
cleanup → cancelAnimationFrame + disconnect observer
```

Input changes, telemetry publication, active-station changes, and parent callback identity changes do not recreate the RAF lifecycle.

## 5. Reduced motion

When reduced motion is active, the animation effect does not start a RAF. Input changes still derive the vehicle from the current track progress plus steering offset and update the visual state deterministically.

Reset remains deterministic and uses the same track-derived initialization.

## 6. Representation

Reality / Blueprint remains a visual representation concern. `useRepresentation()` continues to determine the rendered class only; it does not participate in the animation lifecycle dependencies.

The same precomputed `TRACK_MODEL` and station markers are used in both representations.

## 7. Performance

Confirmed by source inspection:

```text
ONE RAF
ONE TRACK MODEL
ONE RING BUFFER
ONE TELEMETRY SNAPSHOT PIPELINE
BOUNDED HISTORY (80)
NO RANDOM DATA
NO PHYSICS ENGINE
NO EXTRA DEPENDENCIES
```

Hot-path cleanup also removed the per-frame `Object.assign()` object literal used for history samples. History samples are now mutated field-by-field in the existing ring buffer.

Track and station geometry remain module-scope/precomputed. No new geometry, Three.js object, or animation loop was introduced.

## 8. Build

`npm run build` was attempted.

**BUILD NOT VERIFIED**

The supplied project has an incomplete dependency tree: TypeScript cannot resolve packages including `react`, `react-router-dom`, `vite`, and related type/runtime modules. The resulting compiler output also cascades into JSX/type errors across the existing project.

No new dependency was added during Prompt 25.

## Changed files

- `src/components/home/EngineeringMotion/MotionInstrument.tsx`
- `PROMPT_25_IMPLEMENTATION_REPORT.md`

No unrelated systems were modified.
