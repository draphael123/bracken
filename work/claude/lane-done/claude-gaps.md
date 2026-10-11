# claude/gaps - GAPS PASS (2026-10-10, sonnet, PORT 8812)

Closes REACHCORE's frame-perfect crossings. 18 of the 19 KNOWN entries are fixed (the 19th, witchlight 463,26>468,25, is the witchlight lane's and stays in KNOWN).
All fixes are in ONE new file, `src/reach-gaps.js` (a table of per-level edits applied to the FINISHED level, hooked after the MIX loop at the end of `src/level.js`; no build
coordinate moves, nothing else in level.js touched). `tools/reach-heroes.mjs` KNOWN lost 18 lines (stricter: only witchlight remains).

Margin = px past a hand's slack past the lip (negative / `!` = short), per hero k/w/pyro/pal/pir/reap/geo, from the model (`heroMargin`, exact at full game speed; the 0.6 default carries ~1.5 px further). Pass bar: > 2 px every hero.

| level | crossing | was (k/w/y/pal/pir/rea/geo) | fix (final coords) | now (k/w/y/pal/pir/rea/geo) |
|---|---|---|---|---|
| scree | 220>226, 226>231, 231>237 | -11 / -2 / -16 (pal -15/-8/-20, rea -16/-2/-16) | the three ridge ledges sat on row 3/4 UNDER THE MAP TOP: a ceiling capped the jump to 2 rows. LOWERED to one row (4) and the gaps 3 -> 2: ledges 218-220, 223-226, 229-232, 235-238 | 28/28/36/22/28/20/29 (all three, flat) |
| hanging | 103,38>98,37 (net > rock) | -3 .. pal -9 | the rope net a column wider (102-104). (Rock lip a tile out shortened the route and broke hanging-exam's pacing window, so the net was widened instead) | 13/13/20/7/13/13/13 |
| spire | 60,137>55,136 | -11 (pal -15) | the corridor floor (row 137) runs on to 59: the 2-wide gap under the low floor (ceiling capped the arc) is a one-row step | 37/37/42/33/37/36/37 |
| crown | 168,59>174,59 | -4 (pal -18, rea -12) | scaffold plank + ent x1 a tile (169): gap 4 -> 3. Kept an exam jump | 12/12/20/6/12/4/13 |
| crown | 134,63>139,62 | pal 0, rea -2 | rampart rock a column out (136, copied from 135) | 21/21/28/16/21/14/22 |
| reef | 457,16>462,15 | -18 (pal -24) | rock shelf two columns toward the net (460-461) | 14/14/21/8/14/14/14 |
| waymeet | 138,35>143,34 | pal 0, rea -2 | first spike tile of the pit (140,36) paved | 21/21/28/16/21/14/22 |
| fields | 33,33>39,33 | -4 (pal -10, rea -12) | pit 34-37 one column narrower (34, rows 34-36 rock): gap 4 -> 3 | 12/12/20/6/12/4/13 |
| fields | 126>131, 142>147 | -1/-2 (pal -6/-8) | the bough ledge (row 23) a tile longer on the near end: 130, 146 | 15/15/21/10/15/14/16 ; 14/14/21/8/14/14/14 |
| mage | 568,10>574,10 | pal -2 | ledge 574-576 a tile longer (573) | 20/20/28/14/20/20/20 |
| unburied | 33,36>39,36 | pal -2 | first spike tile (34,37) paved | 20/20/28/14/20/20/20 |
| fair | 586>591, 587>592 (gallery) | -2 (pal -8) | the far plank (row 14) a tile longer (590) | 14/14/21/8/14/14/14 |
| fair | 257,27>262,26 | pal 0, rea -2 | stall pit's first spike tile paved (259, rows 28-29) | 21/21/28/16/21/14/22 |
| fair | 279,25>285,27 | -1 (pal -9, rea -12) | carousel pit: the block's lip two columns out (280-281, rows 26-27) | 31/31/44/23/31/20/31 |

KEPT frame-perfect: none (no deliberate secret among them). Thinnest margins left: crown 168 and fields 33 reaper 4 px (gap 3 flat, left as the exam jump), paladin 6.

## Checks (alone, after the last change; node unless noted)
reach-heroes (all levels: 0 new, 0 stale; only witchlight known), level-reach, solid-islands (no island count moved), checkpoint-stand, elites, signs, floating-geometry, deadends,
collectables, killzones, checkpoints, checkpoint-gaps, scree-rework, scree-chase (page), pixels = `headless.mjs floats` (page, 46 levels ok), hanging-exam, harvest-fair (page),
unburied, waymeet-cleanup, folly-library (page), reef-walk, crown-route/crown-exam, level-quality (only minecart's pre-existing curve), curve-gate, mash-gate: green.
Not green and NOT ours: `fair-route` FAILs the same three walks on the untouched master (checked on the unmodified bracken tree, PORT 8813) - pre-existing.
Re-stamped (level1-pilot, --curve, mash-bot --level, mash-bot boss) for all 10 levels, committed per level. The pilot is noisy: scree/reef/crown curve rows needed re-runs to land
in band (scree 5 -> 7/7/6/6 deaths, reef 5 -> 0/4, crown 4 -> 8/6/6/5 deaths; crown's UNMODIFIED build measures 476-483% / 6-8 deaths on this PC, so that is the machine/bot, not the gaps).

## Default check? YES for reach-heroes as a gate: it is already in check.mjs and now has an almost empty KNOWN list (witchlight only). Keep it opt-in as a MODEL (hero fills are not the build's fills - hashes unchanged); it costs ~8 min.
## QUESTIONS FOR DANIEL
1. Crown 168 and fields 33 left at gap 3 (reaper 4 px, paladin 6): want gap 2 (reaper ~20) for a comfier read? REC: no, keep the exam; the model is exact to ~1.5 px.
2. Witchlight 463,26>468,25 still in KNOWN (its lane): same one-tile fix (a plank/ledge a tile longer) - REC: add to src/reach-gaps.js when that lane merges.
