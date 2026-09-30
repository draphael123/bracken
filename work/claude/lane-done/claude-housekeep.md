# Lane housekeep - report

## What changed
1. MAYPOLE RIBBON relic (kind `maypole`, "THE MAYPOLE RIBBON": your look reaches half as far again).
   - src/mummer.js: `RIBBON_REACH = 1.5`; `looks()` scales sight and sightY by a hero's `reach` (default 1). Mummers, hobby-horses and the Wicker Queen all go through `looks()`, so the queen's phase-2 cone goes 96 px to 144 px, and normal sight 300 to 450. No hp anywhere.
   - src/main.js: RELICS entry; the two places that build the `heroes` list for the facing rule pass `reach` from `P.relic === 'maypole'`.
   - src/harvest-fair.js: the Wicker Queen's boss-drop relic is now `maypole` (was `soles`). tools/harvest-fair.mjs asserts it, plus new reach assertions; tools/npc-removal.mjs allows the kind.
   - The felted soles are untouched in the two levels that hold them (src/level.js).
2. Hurricane refrain: the check's known entry was really the SAME-sentence rule (three split-deck signs said one line; each already fit two lines). src/storm-ship.js now gives each split its own line (first, "IT SPLITS AGAIN", "THE LAST SPLIT"), still saying the hold is below and the ropes lead back up. The `SAME_KNOWN` entry is removed (list now empty).
3. docs/DESIGN.md B7: 2.5-4.5 foes a screen (sprinklecut design, asserted by burning-village).

## Checks
See the final message for the green list.

## UNVERIFIED
No in-browser play of the ribbon; the facing rule is proved in the pure harvest-fair check and the wiring is two one-line hero-list changes.

## QUESTIONS FOR DANIEL
- Placement: I made the ribbon the Wicker Queen's reward, replacing the soles as the fair's one relic (soles stay in their other two levels). Recommendation: keep. Alternative: put the ribbon on the top roof of the roof cache (x~113) and keep soles as her drop.
- Strength: +50% reach. Recommendation: keep; nothing else changes.
- Hurricane signs: my wording for the three splits is placeholder-quality; edit freely in src/storm-ship.js.
