# MECHESA // PATCH UI-03

## Status

PATCH APPLIED

## Purpose

Applied the eight-system identity color language to the existing engineering systems network and inspector without replacing the existing architecture.

## System Colors

- Design → neutral steel
- Materials → bronze
- Manufacturing → signal amber
- Mechatronics → violet-blue
- Robotics → blueprint blue
- Automotive → burnt orange-red
- Thermodynamics → rose
- Fluid Mechanics → teal

## Updated

- System node identity markers
- System hover/focus state
- Selected system state
- Selected network connector
- Connector selection response
- Inspector system identity marker
- Inspector readout identity color

## Preserved

- Homepage structure
- Existing system data
- Existing scroll choreography
- Existing Mechanical Core
- Engineering Motion
- Existing animations
- Blueprint architecture
- Teammate changes

## Features Added

None.

## Dependencies Added

None.

## Notes

The supplied repository's actual rendered engineering network/inspector is implemented as the existing `systems-map` / `system-inspector` in `src/pages/About/AboutPage.tsx`; UI-03 targets that existing implementation rather than creating a duplicate network on the homepage.

The homepage systems teaser receives the same canonical identity-token variables without changing its structure.

## Next

PATCH UI-04 will refine the homepage hero atmosphere and Mechanical Core hub lighting.