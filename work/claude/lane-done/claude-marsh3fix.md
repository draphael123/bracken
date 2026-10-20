# claude/marsh3fix (sonnet) - marsh2-beats red, re-stamps, Frog King n=24, walker

Branch claude/marsh3art (continued). Files: src/marsh3.js, docs/level1-pilot.json, docs/level1-curve.json, docs/mash-bot.json.

## 1. marsh2-beats green
The wasp is NOT in ROLES.ranged (it counts as melee); the ranged ones are archer, spit, thorn. 25/79 -> one swap leaves 24/79 = 30.4% (still red), so TWO swaps:
- reed run: the spitter on the first reed tuft (col 474, row 12) -> a yellow hopper (the run keeps its bowman lookout + the stand frog; it now has frogs, not a second thrower, over the middle).
- night pads: the spitter on the high tuft over the reed bed (col 631) -> a yellow hopper holding the reed bed (the rest becomes a frog stop between the eel gaps; the wasp stays).
Result: ranged 23/79 = 29.1%, marsh2-beats ok. LQ marsh CLEARS, solid-islands 0, stuck static + runtime ok (270 spots), hint-shown ok, visible-supports checked.

## 4. Walker geometry fix (one)
Reach fill (tools/pacing.mjs, hero legs) reaches the whole marsh for knight/pyro/warden/paladin. Walker run (pyro, warden, paladin, 2 seeds) showed 3 of 3 heroes stuck/drowned at 628-629,15/19:
the night reed bed (cols 628-629, row 16) was a 4-wide gap and 2 rows up from the firm pad at 624 - heroes fell into the water under it.
FIX: the bed lowered one row (reeds(X(184), 17, 2); its hopper to row 16). Re-run: 629,15 STUCK gone for all three heroes, no DROWNED@628 (paladin deaths 1.0/run was 1.5, warden 2.0 was 3.0).
Remaining new-section walker stops (NOT geometry - hero positions differ run to run, 490-570, i.e. the bot leaving the raft / missing a pad): next-tile 522,17 (the dock after the reed run) and 591/595,17 (the far bank after the boom). Human route is unaffected.
Art untouched (the tuft support pole follows the tile).

## 2. Re-stamps (level hash moved, twice: swaps, then the bed)
- pilot: knight L1 30 hits, 3 deaths, 163% hp a run; curve: 124%, 0 deaths (band 40-250 / 0-3 ok); mash: boss 0/6 (mash loses), level knight/warden/pyro all die (16/12/13).

## 3. FROG KING at n=24 (boss-rates practiced, profile human, flasks kit, campaign L3, measured after the swaps, BEFORE the bed lowering)
knight 19/24, warden 22/24, pyro 11/24 = 52/72 = **72%** (band 60-70, HIGH +2). Under the 75% trigger so NOT tuned (the earlier 77% at n=16 was noise; n=24 reads 72%). Not re-measured after the one-row bed change (the fight is not on that geometry).

## Reds
None new. Walker still MISSes target (arrive% 72-80 >= 65, warden deaths 2.0 > 1.5): pre-existing band reading, not a check.
## Questions
1. Frog King 72% (+2 over band): leave, or hp bump? REC leave.
