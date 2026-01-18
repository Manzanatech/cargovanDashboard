# CargoVan Load Console — Design Principles

This document is the authoritative source for UI behavior and hierarchy.
If it conflicts with existing code, update the code — not this document.

## Design Inspiration
This UI is modeled after modern aviation cargo load-planning consoles
(Airbus, airline dispatch systems), not consumer SaaS dashboards.

## Core Philosophy
- The load plan diagram is the primary control surface.
- Everything else exists to validate or block dispatch.
- Spatial reasoning comes before metrics.

## Visual Hierarchy (Strict)
1. Load plan diagram (dominant)
2. Selected position detail panel
3. Dispatch warnings / blocking issues
4. Manifest / inventory tables
5. Navigation (quiet)

## Interaction Model
- Position-first: select a shelf/slot to view contents.
- No item-first workflows.
- Editing is disabled when “Lock load” is active.

## Color Semantics
- Blue: assigned / normal
- Orange: selected
- Gray: empty / unassigned
- Red: blocking / cannot dispatch

## Non-Goals
- No KPI cards as the primary UI pattern
- No charts or gauges in the load planning view
- No “drop image here” placeholders
