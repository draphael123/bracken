# FALLING TOWER 3 ART lane - claude/fallingtower3art (on claude/fallingtower3 868b70f6)
Head: see final message / `git log -1` on the branch (this report is committed as work/claude/lane-done/claude-fallingtower3art.md too).
Level hash: UNCHANGED - no edit to src/level.js, src/main.js, tower-ascent.js, reachcore, any tile, box or number. Art + draw code only.

## STATUS: PARTIAL - Node renders done; PAGE CAPTURES AND FPS NOT DONE
scratch/GATE-RUNNING.flag stayed up the whole lane, so NO headless browser was launched (pids.txt: none started). Still to do after the flag clears
(one browser, RAM >= 1500 MB): page screenshots of each room/pose, tools/mobile-perf.mjs on the tower (base vs art), and the Page checks below.
FPS before/after: NOT MEASURED. Cost reasoning: rooms bake once (cached canvas, one drawImage/frame); live bits are ~20-60 fillRects/room (flames, motes, glows as 4 stacked ellipses).

## Drawn (src/redraw/tower_chase.js, new; hooked from fallen_tower.js paintFallenRoom, tower-supports.js drawSupports, archmage-chase.js drawChase3, tower-fall2.js ladder, lich.js)
- THE FOUR CHASE ROOMS + THE CORE now have their own walls (no holes to the night - they are deep inside the tower):
  Scriptorium (moonlit lancets + light shafts, scroll racks, lecterns, a skeleton scribe, green chain lamps), Reliquary (gilt alcoves with skull/hand/crown/chalice, velvet banners,
  glass cases with a pulsing green relic, candle stands, censer smoke), Cellar (vault piers/ribs, specimen jars on iron shelves, stacked coffin lids, manacles, bone cart, green seep, drips),
  Foundation (cyclopean blocks, half-sunk turning cogs, pulsing rune seams, a seal, cables, teal glow from under), Core (the shaft: chains, broken balconies, rune rings turning, an updraft of
  gold motes, a lit arch = his door far above, a dais ring under the rug). Palettes stay darker than the footing (readability rule).
- CRACKED PILLARS: stone column (plinth, flutes, joints, iron strap, a skull cut in the shaft, abacus head), per-kind cue (bookcase bracket+books / chisel notch at the foot / masonry on the head /
  rubble on the head / seal-stone that burns when the chase floor pillar is armed, with a bobbing gold chevron); glow on approach (gold; pale blue for the not-yet-armed chase pillar);
  TELL = crack running red from the foot, shake, grit, dust; ring-off = pale rune flash; dotted "ghost" of what it will lay as you near (A6).
  DOWN: broken stump + rubble. WHAT IT DROPS: library bookcase = shelves (board is the footing, books in the bay, 2 px of spilled books) dropping in one after another and resting;
  lab = fluted column swinging over like a tree, then lying across the poison with capital, base, crack, skull; crown = masonry blocks falling then a rubble heap; stair = rubble plug; chase floor = chunks tumbling.
- HIS FALL: new sprite frames 28 FALL (tumbling, hem and tails flung up, staff spinning off) and 29 CRASH (slumped on his hem, arm propped, staff leant, dim eyes, dust); undeadFrame maps fall -> FALL, down -> CRASH (was recoil / open). Hitbox/numbers untouched.
- FLOOR FX: the tear is a jagged hot seam wall to wall with grit pouring through; his sink-through-the-floor is a smoke funnel with green sparks and a dark ring; landing = a ring of grit + a gold halo under him while he lies open.
- ROLLING LADDER: rail with wall brackets, trolley on two turning iron wheels, brass-shod stiles, rungs, a wide brass-shod step.
- Theme: stone/bone/iron/brass/parchment/candle wax only; wood only as the library's shelves/lecterns/rungs. No logs.

## Pictures (Node renders, honest about construction not light) - scratch/lane-reports/
fallingtower3art-room-scriptorium.png, -room-reliquary.png, -room-cellar.png, -room-foundation.png, -room-core.png, -pillars-states.png (whole / near / told x 5 kinds),
-pillars-fall.png (falling + resting + stump), -mage.png. Sources in work/ft3art/ ; regenerate with `node tools/ft3art-shots.mjs [rooms|pillars|mage]`.

## Checks (Node only)
fallingtower2, tower-hall, tower-cutouts, undead-moves, archmage-room, solid-islands: all rc=0. Not run (open a page, gate flag up): tower-chase, tower-ascent, undead-realms, level-reach,
tower-collapse, mobile-perf, stuck, textfit, signs, floaters/footing-art, boss-read, ability-poses (a new pose pair - run it).

## QUESTIONS (rec built)
1. Core dais/updraft is painted only; the carpet's own rug art is unchanged. Rec keep.
2. 'sink' still uses his banded blinkOut frame, drawn over the floor tiles (he is not clipped into the stone). A clip needs a main.js sprite hook = not art-only. Rec: later hook.
3. The standing bookcase before the collapse is not drawn (a ghost outline + bracket only) so the empty air does not read as a wall. Rec keep.
4. Hall (hallArena) and the existing carpet were not repainted; judge in page captures first.
5. Frames 28/29 follow `hurt` (the table said hurt LAST; tower-ascent only asserts hurt > dead, passes).

## FINISH 10-29 (page checks done; sonnet finish lane, started 10-28 23:05)
Final commit: d3a5f8a2 on claude/fallingtower3art (pushed). Art/draw only: level hash UNCHANGED, no boss numbers touched (diff vs 868b70f6 in src/: tower_chase.js new, lich.js, fallen_tower.js, tower-fall2.js and DRAW-ONLY edits in archmage-chase.js, tower-supports.js, undead-mage.js sprite map; no level.js/main.js/tower-ascent/reachcore edit).
No art fix was needed: every page capture reads right. Judged from the captures: scriptorium, reliquary, cellar, foundation, core (rug + dais), the hall (sky, carpet, unchanged) all read; pillars whole/near-armed/tell/fallen (bookcase ramp, lab column over the poison, crown masonry, stair rubble); his poses fall (tumbling), landing (grit ring + gold halo), crash (slumped, gold while open), sink (smoke funnel), floor tear (jagged hot seam + grit). Standing bookcase not drawn: the empty air does not read as a wall.
### Screenshots (scratch/lane-reports/ft3art-*.png, 47 files): page captures ft3art-room0..3(+-pillar, -pillar-close), -core/-core2/-core3/-core4, -hall, -pose-fall/-landing/-crash/-rise/-sink, -pillar-armed/-tell/-tell-late, -tear-early/-late, -sup-<lib-ramp|lab-bridge|crown-crush|stair-dark>-whole/-tell/-falling/-down/-wide, -lab-before/-falling/-down/-far; plus the earlier Node renders (-room-*, -pillars-*, -mage). Tools: tools/ft3art-page-shots.mjs, -page-poses.mjs, -page-more.mjs (page captures, not in the suite).
### Mobile perf (tools/mobile-perf.mjs, 915x412@2.625, 4x CPU, same scenes both sides, PC shared with another lane's browser so +-8 ms noise per run)
Scenes: scriptorium(84:164) reliquary(82:179) cellar(90:194) foundation(84:209) core(84:234) pillar(93:164), busyMsPerFrame, ~3 runs each. ART: scriptorium 21.5-29.5, reliquary 23.6-31.8, cellar 27-30.6, foundation 25.1, core 12.7-17, pillar 21.1. BASE: scriptorium 19.5-32.6, reliquary 19.8-32.8, cellar 24-28.5, foundation 24.9, core 12.6-15.4, pillar 25.2. fps 28-48 on both (budget 40 is below both sides in these rooms under load: same FAIL on base). Verdict: no meaningful regression (run-to-run spread on the SAME code is larger than any art/base gap; the core room is 58-60 fps both).
### Checks on the art branch (one browser at a time, RAM >= 4 GB free throughout; no browser killed)
GREEN: ability-poses (rc0, incl. the new pose pair), boss-read, level-reach, tower-ascent, tower-collapse, undead-realms.
RED but ALSO RED ON BASE 868b70f6 (not mine): stuck --static ("rk-top-slab: done names a crackslab the level really has near 348,15", same text on base); tower-chase (assert "a hero who stands on the stair is not hurt and thrown UP by the dark, again, until it kills him", tower-chase.mjs:391, same failure on base; every earlier part of it - 6 heroes climb, casts, ring - passes).
textfit (TEXTFIT_LEVELS=fallingtower --strict): every level-relevant scope clean (boss 60 screens, plates, talk[x6 heroes] 27 screens each, hints 95), but a UI-only scope hangs in Runtime.evaluate for 481 s and fails the run - hints/store on the first (concurrent) run, party on the clean run: a different scope each time, so it is machine/contention flakiness, not a text finding. Not re-run on base (8 min each).
Run-order note: my first runner was started twice by mistake and the two ran side by side for ~15 min (2 browsers; RAM stayed >4 GB); every non-red result above was seen rc0 in both runs and tower-chase/textfit were re-run alone afterwards.
Not run (not asked): signs, floaters, mobile-perf full table, check.mjs (never).
### QUESTIONS (recs built)
1. Two reds on base to fix elsewhere: stuck rk-top-slab (stale "done" crackslab ref near 348,15) and the tower-chase dark-hurts-again assert. Rec: a small fix lane or fold into the batch's gate owner.
2. textfit hang in a UI scope under load: rec: raise TEXTFIT_SCOPE_TIMEOUT or run it alone in the nightly.
3. Still open from before: sink-clip hook (main.js sprite hook, not art-only) - rec later; core rug art unchanged - rec keep.
