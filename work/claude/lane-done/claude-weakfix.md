# claude/weakfix (SONNET) - 2026-10-14

## Fixes
- WITCHLIGHT: the 463>468 crossing closed: ledge(462,27) is 4 wide, not 3 (src/witchlight.js), so the gap is 2. reach-heroes: 0 known crossings; its KNOWN list is now empty (tools/reach-heroes.mjs). The guides on the rune columns / glyphs / slabs already existed (stuckguides, 20 spots) - no new ones needed.
- SPOREWOOD: the first bud nudges now say STOP ON A BUD (sp-bud-37, sp-bud-250, sp-bud-257). The guide had no "first 3 uses" counter, so the three earliest bud spots carry the wording and the later one keeps its own. The spots already existed.
- HURRICANE: 3 new guides in src/stuck-spots.js: hu-line-150 (swing line over the flooded waist), hu-breech-264 (the last gun / magazine wall), hu-line-504 (the oil ropes). Pump, bulkhead, davit and loose gun already had spots. Signs 30 -> 15 (src/level.js: 14 flavour signs cut, plus the oil-ropes sign now covered by its guide; the three storm-ship split signs stay).

## Checks (PORT 8909, one page at a time)
reach-heroes (full, node) green, 0 known; stuck static + runtime green (253 spots); signs green (908, 2 lines); hint-shown green; textfit hints + talk --strict: 0 on every row except COVERS 2 (fallingtower sign@34,300 and fair sign@405,12 - not my levels, not touched); mash re-stamps hurricane (level then boss) and witchlight (level then boss+mini): mash-gate 47 campaign levels green; pilots green: storm-ship, witchlight, witchlight-v2, spore-caps, spore-exam; solid-islands green; route-breaks has no new findings on the three levels. level-quality hurricane/witchlight/spore: the same FAIL rows as before (bands/route/mechanics/encounters/secrets) - these levels are not in GATE and are the opus reworks' job; unchanged.

## Reds / questions
No reds. Nothing weakened.
## QUESTIONS FOR DANIEL
1. The hurricane signs were cut (flavour lore lost); "hint toasts" has no per-position mechanism, so teaching is carried by the stall-nudge guides. Want any of the cut lore (bell, galley, the eye) back as a toast later?
2. A "first 3 uses" counter for the Sporewood nudge was not built (guide has none); the first three bud spots carry the STOP ON A BUD wording instead.
