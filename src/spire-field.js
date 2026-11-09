/* src/spire-field.js - FALLING TOWER 5: THE SPIRE FIELD (the boss arena OUTSIDE, phase 1 on foot -> the fade -> the carpet). LANE FT5B FILLS THIS FILE
   (scratch/lane-reports/ft5-plan.md sec 3; branch claude/ft5b). The level (src/tower-fall5.js, lane ft5a) calls buildSpireField(L, FT5_ARENA, kit) once,
   after the run is built and before the ropes are hung, with the shared box FT5_ARENA = { x0, x1, y0, y1, sea, crownSpot, runFloor, check } (tiles) and
   kit = { T, rect, ledge, ent, set } (the builder's own painters). Return a truthy object when the field is built; returning null/undefined makes the
   level lay its greybox placeholder (six spire tops and a gate), so FT5 can be walked end to end before ft5b lands. */
export function buildSpireField(L, A, kit) { void L; void A; void kit; return null; }
