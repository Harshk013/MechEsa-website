# MECHESA // ENGINEERED MOTION — Foundation Notes

## Design tokens
- Semantic colors live in `src/styles/tokens.css`; keep components on semantic variables so the eventual logo-derived accent can be changed centrally.
- Typography roles live in `src/styles/typography.css`: display, heading, body, technical, label, telemetry.
- Spacing, radius, shadow, duration and easing tokens are centralized in `tokens.css`.

## Component conventions
- Mechanical primitives live under `src/components/mechanical`.
- Technical text lives under `components/typography`; status/telemetry primitives under `components/telemetry`.
- Components accept typed variants and standard HTML attributes where appropriate.
- Prefer composition over one-off visual components.

## Motion levels
1. Micro: hover, press, focus, indicators.
2. UI: panels, navigation, page transitions.
3. Cinematic: future mechanical/3D sequences.

Cinematic motion is intentionally not implemented in the foundation stage.

## Responsive philosophy
- Desktop: full visual experience.
- Tablet: reduced visual complexity.
- Mobile: curated experience, not compressed desktop.
- Reduced motion: all future animation systems must honor `prefers-reduced-motion`.

## Architecture
- Routes are prepared in `src/app/routes.tsx`.
- Content types are data-driven under `src/data`.
- `src/scenes` is reserved for future Three.js/R3F scenes; no 3D dependency is installed yet.
- `src/animations` contains reusable motion primitives and tokens.
- `usePointerState` provides a lightweight future cursor hook without driving global component renders.

## Dependency policy
Do not add Framer Motion, GSAP, Lenis, Three.js/R3F, physics libraries, or other large dependencies until a later stage genuinely needs them.

## Prompt 02 — Visual Identity Layer

The neutral foundation is now extended with a restrained industrial language. Accent color remains intentionally neutral until an official MechESA logo asset is available. Replace `--color-accent` and related accent tokens in `src/styles/tokens.css` only.

### Rules
- Use graphite surfaces with small contrast steps; avoid pure black as the only surface.
- Accent is scarce and semantic: active, selected, status, telemetry and focus details.
- Technical typography is an annotation layer, not the default voice.
- Mechanical cards are modules: metadata → title → description → action.
- Machined/chamfer details are used selectively.
- Decorative engineering marks must remain subordinate to content.
- Micro motion is tactile and short; cinematic motion is deferred to later prompts.
- Prefer reusable tokens/components over page-specific visual effects.

### Prompt 02 additions
- `TechnicalCorner`, `MeasurementMark`, `SectionMarker`, `ReferenceLine`
- `MechanicalCard`
- `MechanicalSwitch`, `MechanicalDial`, `MechanicalGauge`
- `/design-system` visual laboratory route
- additional industrial surface and 3D-compatible semantic tokens

### Future preservation
Future 3D scenes should consume the same semantic color language (`--color-metal-*`, `--color-accent`, `--color-blueprint`) rather than introducing an unrelated palette. Blueprint mode should eventually be implemented as a theme-level token swap.

## Prompt 03 — Global Machine Interaction Layer

- **Cursor:** desktop-only precision crosshair. Use `data-cursor` / `CursorTarget` for contextual intent; cursor is never required for comprehension.
- **Navigation:** `MechanicalNavigation` is global, fixed, keyboard-accessible, and route-aware. Mobile uses an engineering control-panel overlay.
- **Motion:** Framer Motion owns UI/presence transitions. GSAP is reserved for future timeline choreography; do not duplicate simple UI motion in GSAP. Lenis owns optional global smooth scrolling.
- **Pointer:** pointer coordinates live in refs and are updated outside React render flow. Global visual consumers should prefer the pointer ref rather than state updates per frame.
- **Ambient:** `AmbientEnvironment` owns background lighting/grid atmosphere. Keep decorative layers pointer-events-none and lightweight.
- **Scroll:** use `useSectionProgress`, `clamp`, `mapRange`, `rotateWithProgress`, `slideWithResistance`, and `dampedValue` for future cinematic sections.
- **Transitions:** `PageTransition` is intentionally restrained. Future page-specific choreography can extend it without replacing browser navigation.
- **Initialization:** `InitializationOverlay` is a lightweight first-visit system check, not a fake loading delay. Session storage prevents repeated interruption.
- **Z-index:** use semantic z-index tokens: background → content → navigation → cursor → overlay → transition.
- **Reduced motion:** disable Lenis, cursor motion, ambient movement, and simplify transitions when `prefers-reduced-motion: reduce` is active.
- **Failure safety:** visual effects must never be required for navigation or content comprehension.

## Prompt 04 — Homepage architecture

The homepage is composed as one continuous engineering environment rather than independent landing-page blocks. Major sections are isolated under `src/pages/Home/` and reusable homepage primitives live under `src/components/home/`.

### Section registry
`HomePage.tsx` uses stable section IDs/data-section values for initialization handoff, machine core, engineering identity, systems, events, team, logs, motion, join, and footer handoff. Future scroll choreography can target these stable boundaries without rewriting the composition.

### Future simulation insertion points
- `MechanicalCoreStage` — reserved for the future mechanical-core scene.
- `EngineeringSystemNode` + systems network — reserved for future domain-specific system previews.
- `MotionSection` viewport — reserved for racing/engineering-motion simulation and live telemetry.
- Join-stage ring — reserved for a future convergence/core visual.

### Content model
Homepage preview content is kept in `src/data/home.ts`. Placeholder copy is explicitly marked as replaceable; no institutional claims, member identities, achievements, or live measurements are fabricated.

### Motion contract
The homepage currently uses restrained Framer Motion section reveals and lightweight CSS ambient motion. Complex GSAP timelines, pinned scroll sequences, WebGL scenes, and simulations are intentionally deferred. All decorative loops have a reduced-motion fallback.


## Prompt 05 — Mechanical Core

The homepage MechanicalCoreStage now hosts the first real R3F mechanical system. Keep `HomePage.tsx` unaware of Three.js internals. The 3D scene is isolated under `src/components/home/MechanicalCoreStage/`. Use a single machine time source for gear, shaft, crank and piston motion; derive gear velocities from tooth counts and derive piston travel from crank-slider geometry. Do not introduce physics libraries, audio, postprocessing or arbitrary independent animation loops without a clear mechanical relationship. The scene uses the existing graphite/steel/accent language and must retain a graceful WebGL fallback.

## Prompt 06 mechanical-core refinement
The Mechanical Core now uses an explicit open-frame/cutaway visual hierarchy: central power hub and shaft, meshed gear transmission, output supports, and a side-mounted crank-slider actuator. Material hierarchy separates graphite structure from machined steel moving parts. The crank drive is visually coupled to the primary shaft while preserving one authoritative angular/time source.
