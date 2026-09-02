# Prompt 19 — Robotics / Kinematic Arm Implementation Report

## 1. Robotics architecture
Added `RoboticsInstrument.tsx` and `robotics.ts` under the existing Engineering Lab. The instrument uses one SVG, two native range controls, deterministic model calculations, and the existing mechanical panel/readout language.

## 2. EngineeringLab integration
`EngineeringLab.tsx` now routes the existing `robotics` system record to `RoboticsInstrument`. Thermodynamics, Fluid Mechanics, Manufacturing, and all informational systems retain their existing branches.

## 3. Forward kinematics implementation
`calculateForwardKinematics()` implements the 2-link planar equations for joint angles θ1 and θ2. Link lengths are normalized visual values of 120 and 90.

## 4. Coordinate conversion
Mathematical +Y is converted to SVG's downward Y axis by `toSvgPoint()` in `robotics.ts`. JSX contains no kinematic coordinate calculations.

## 5. Joint controls
Joint 01 and Joint 02 each use an accessible native range input from -150° to +150°, 1° steps, plus/minus buttons, visible values, focus treatment, and a rotary-encoder-inspired visual dial.

## 6. Arm visualization
A single SVG contains the base, two links, J1/J2, end effector, angle arcs, centerline, target, and engineering annotations. The arm geometry is derived directly from the model.

## 7. Workspace visualization
Two concentric conceptual rings represent the 2-link minimum and maximum theoretical reach for the normalized link lengths. The UI labels the region as conceptual.

## 8. Target relationship
A fixed technical target marker and a thin relationship line connect the target to the current end effector. Target offset is calculated with Euclidean distance in visual coordinates and explicitly labeled conceptual.

## 9. Readout
The readout exposes joint angles, end-effector X/Y, reach, target offset, current state, visual scale, and the `FORWARD KINEMATICS / 2-LINK PLANAR MODEL` designation. No physical units or fabricated robot specifications are shown.

## 10. Reality mode
Reality uses restrained mechanical surfaces, neutral metal-like geometry, joint highlights, and a subtle physical-depth suggestion while keeping the visualization intentionally simplified.

## 11. Blueprint mode
Blueprint mode reveals technical axes, construction/workspace rings, centerlines, angle arcs, joint centers, target annotations, and blueprint linework through the existing global representation context.

## 12. Accessibility
All controls are real buttons/range inputs with labels, keyboard support, visible focus, and exposed current values. The SVG is redundant with the DOM readout and is marked `aria-hidden`.

## 13. Mobile behavior
Controls stack on small screens, readout fields become two columns, annotations are reduced, and the SVG remains contained within the instrument to prevent horizontal page overflow.

## 14. Reduced motion
The existing reduced-motion hook and Framer Motion preference are used to remove geometry transition duration. Model updates remain immediate and readable.

## 15. Performance
No RAF, Canvas, Three.js, physics engine, or new dependency was added. SVG element count is intentionally small and all kinematic calculations are pure functions.

## 16. Existing module compatibility
No Thermodynamics, Fluid Mechanics, Manufacturing model logic, Mechanical Core, RepresentationProvider, RepresentationToggle, navigation, or homepage scroll architecture was modified. Only the Engineering Lab routing was extended.

## 17. Build result
A production build could not be executed in the provided environment because project dependencies are not installed and npm installation has previously timed out. The implementation was checked structurally and the project archive was integrity-tested.

## 18. Known limitations
This is a conceptual 2-link planar forward-kinematics visualization. It does not solve inverse kinematics, dynamics, collisions, torque, motor behavior, path planning, or physical robot specifications. Workspace rings represent theoretical normalized reach rather than a joint-limit-aware industrial workspace.
