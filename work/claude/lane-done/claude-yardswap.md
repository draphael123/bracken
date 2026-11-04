# claude/yardswap - the Arena Yard replaces the practice yard (Daniel 11-03 18:34)

## Removed
- Practice list screen (state 'practice', updatePractice/drawPractice/YARDS/YARD_DRILLS), the store PRACTICE tab (+ its two rows, portal icon; store.js tab, tools/store-stock.json golden), startTrial/hasTrial/PROG.tried-gated trial entry, the Arena Yard's TRIALS DOOR (spot, deco, verb, openTrials), the open yard builder (openYard) and trialYard() (all 9 hero trial yards).
- LEVELS rows trial_open + trial_<hero> are RETIRED, not deleted (append-log: indices/ids never shift): `retiredYard(id)` rows, hidden, build the Arena Yard.
- dune-yard.js: NOT a level (standalone slope fixture, only tools/slopes.mjs uses it) - left alone. trialSteps() kept in level.js (the Move Board's data).

## Every entry now leads to the Arena Yard
Title row PRACTICE -> "ARENA YARD"; tavern door (station id still 'practice'; name THE ARENA YARD, verb TRAIN, new hung ARENA YARD board over the arch in tavern-art.js gate()); hero card Z ("Z TO THE ARENA YARD"); new-game hero pick prompt ("SEE THE ARENA YARD FIRST?"); pause row "Hero trial" -> "Arena Yard" (hidden in the inn and inside the yard); store message; co-op guide line. Leaving: inn-entered -> inn with party, else map.

## Moved / XP
Nothing earned XP in the yards (xp.js: yards pay nothing). Only persistent hook: PROG.taught / PROG.trial_x.cleared suppressed repeat wood lesson hints. New players now get the wood hints (limit 2 each) - Arena Yard does not set `taught`. Old keys stay in saves as inert data. Move lists live on the Move Board (all 9 heroes, 7-18 lines).

## Save migration
No save stood in the yard (entered from title/inn, left to map); saves are id-keyed. Retired ids still resolve (build the Arena Yard) so no old id/index can crash. Nothing to migrate. arena_yard stays `hidden:true`: un-hiding would put it in campaign lists (restamp, curve-gate, level-quality, xpWood); it is reachable from title/tavern regardless. level-reach passes. No level hashes changed (no restamp).

## Tests
Updated: arena-yard (retired rows, no door, title row/hero card routes, source checks), tavern (door name/verb, practice->Arena Yard, entry-other-way -> map), tavern-menu, ui-hud, save-safety, store (+golden), textfit (practice scope = title row + hero cards), hero-trials (REWRITTEN: retired rows, board lines, straw swing per hero), berserker / blood-kit / foe-pass-page (trial stations -> Arena Yard board / flash station), attack-animation, attack-buffer, verb-matrix (trial_open -> arena_yard).
Run green: tavern-menu, ui-hud, arena-yard (all sections, in chunks), tavern (all but 'fixes'; 'fixes' win-card loop crashes headless Chrome on baseline batch142 too - the changed asserts verified with that loop stubbed), titlescene, save-safety, store, hero-trials, textfit (practice,trial,title,menu,arena,store,settings), demo-transitions, whatsnew, level-reach.
NOT RUN (owed to the gate): berserker, blood-kit, foe-pass-page, attack-*, verb-matrix, slopes, check.mjs full. Dropped coverage: blood-kit's lent-BLOODWORMS trial step (trial-only feature) and the station-by-station trial playthroughs in hero-trials (kits have their own tools). Known: headless Chrome crashes randomly on this PC (also on baseline); textfit settings shows a COLLIDE on controls [ranger] not in my diff.
Dead code left: L.trial / trialEvent / trialLend machinery in main.js (no level sets it now) - safe follow-up deletion.

## Screenshots
scratch/lane-reports/yardswap/: title-before/after.png, tavern-door-before/after.png (+ -far-), shots.mjs.

## Questions (recommended answer first)
1. Tavern has THE ARENA PIT (PvP, coming soon) next to the ARENA YARD door - confusing. Rec: rename the Pit "THE DUEL PIT" (text only).
2. Delete the dead L.trial machinery + retired rows after the demo? Rec: yes, next cleanup lane.
3. Add a what's-new line (coordinator at merge): "The practice yard and hero trials are gone: train in the Arena Yard (title, tavern door)."
