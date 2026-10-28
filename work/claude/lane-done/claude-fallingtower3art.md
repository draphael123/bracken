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
