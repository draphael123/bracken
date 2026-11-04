# STONEWALL lane report (11-04) - claude/stonewall, worktree bracken-stonewall, base claude/batch143 e9f7015c (includes geofix)
Branch tip: `git -C bracken-stonewall log -1` (this report is committed last). NOT merged, NOT deployed. CODE-FIRST: no browser was launched (suite running; before 19:00).
Plan: scratch/plan-stonewall-1103.md (all 5 recs approved 11-03 12:06).

## The geofix decision (asked of this lane)
Her stones are hero-passable with a one-way top (geofix); foes and every shot still read the plain grid. So THE WALL IS PASSABLE FOR HEROES LIKE ANY OTHER STONE OF HERS (one rule; she can step through her own wall) but, being SOLID to the grid, it is the stone foes cannot walk through and every shot dies in: that is what makes it the cover. Only what changes it: a timer, hp, no cap slot, the burst.
RECALL (tap DOWN) IGNORES THE WALL: recall moves capped board/knee stones only; the wall is uncapped and times out by itself (a recall that dismissed cover would be a trap). Detonate (DOWN+C) and MOUNTAIN COLLAPSE also ignore it (they read capped pieces), and it never fills the 3-stone pips/board.

## Built vs plan
| plan | built |
|---|---|
| 1 input split | C down: the rune-ward rises exactly as before (raise 0.1, beat 0.1-0.2, tap lingers to 0.25). Still held at GEO.wall.holdAt 0.28 s -> the ward drops silently (no lock) and raiseWall({held:true}); released earlier = today's tap ward. Fallback (rec Q2): cooldown / < 20 wind / no floor within 2 rows (pit edge) / swimming / airborne -> the held ward carries on as today (the fizzle says NO GROUND FOR IT once, spends nothing). UP+C and hold-X untouched. (geomancer.js guard(), raiseWall) |
| 2 the wall | GEO.wall = holdAt 0.28, life 3.5, hp 3, cost 20, cd 2.5, shard 5/7, k 0.5, cap 3. 1 column x 2 cells in the first column wholly in front of her; uncapped (place opt.uncapped: no cap eviction, not capped, not `earth`; standing()/pips/recall/detonate/collapse ignore it). One wall at a time. Cooldown counted FROM THE FALL (crumble). Stops every non-red shot (a boss/elite shot costs 1 hp, a common foe's is free); yellow melee from the far side -1 hp (existing wallTakes); red smashes through (existing); beat-raise BOUNCED OFF / STONEFACE / SHRAPNEL kept. Cooldown readout: GEO.wallCdLeft() (C-icon drawing owed to art). |
| 3 burst | the first of HER blows whose attackBox overlaps the wall bursts it (per swing), also the FAULT LINE crack reaching it and EARTHFALL's spikes: 5 shards (7 for the fist / a held tier / fault line) fly AWAY from her, each swordDmg x 0.5 (skill-k.js K_GEO.geoWallShard), 'shot' blow through hurtAs (boss floors apply), <= 3 shards on one foe (shared cap), 0.3 s flinch on a common foe, never on a boss/mini. The burst ends the wall (cd starts). Q4: the fist no longer breaks ANY stone (it only ever hit walls since geopop; the old shatter is replaced by the wall burst); wall shards fly through her own stones (the fist plants a knee stone in their path on the same frame). Allies' blows pass through (hers only). |
| 4 readability | placeholder art only: 3-segment drain strip on the wall's top edge (pip colours), the wall shakes 1 px in its last 0.8 s, cracks by hp, 'STONE WALL' number for the first 3 raises (session-wide, not per room - placeholder), amber hold glint on the geode from 0.2 s held. |
| Q1 | the bought STONE WALL skill (id kept, so saves hold) is a PASSIVE UPGRADE now: catalog row active:false, renamed TALL WALL ('a tile taller, 1.5 s longer': 3 cells, life 5.0). Its F cast is gone. |
| texts | hero card (TAP C ward / HOLD C wall), controls card row 'ward / wall: TAP C WARD, HOLD STONE WALL'. |
Test edits: tools/flip-actions.mjs geomancer F skill 'stoneWall' -> 'boulder' (stoneWall is passive now); tools/geomancer.mjs wall case = hold C (blind, page crashes pre-existing).

## Checks run (node only)
node --check on every touched file: green. `node tools/stone-wall.mjs` (NEW, node only: drives makeGeomancer(api) on a stub world): tap vs hold, one uncapped wall, 20 wind, hp 3, life 3.5 / TALL 3 cells + 5.0, cd from the fall, fallback ward (cooldown / no wind / pit edge / swim / air), shots (common free, boss -1), burst 5/7 shards forward, 10 dmg 'shot', <= 3 per foe, flinch vs boss, fist breaks no board stone, board of 3 not evicted, one wall at a time, recall reads capped only, legacy raiseWall() is still a board stone (tools/geo-board.mjs builds its board with it), GEO.draw smoke on a mock canvas: green.

## OWED browser checks (after 19:00 / art + tune lanes)
tools/geo-board.mjs (it builds boards with raiseWall(); expected green, UNVERIFIED), tools/geomancer.mjs (crashes the page on batch143 already; its held-ward cases need a rewrite to fallback-only + the new hold-wall case), geomancer-read (timer strip), geomancer-pilots + bot-profile (bot holds C vs a shot in flight - NOT built), textfit hud/card/hints --strict (hero card + controls row changed), skill-icons / catalog checks (stoneWall now passive, renamed), hero-keys-sheet; a real look: hold feel (0.28 s), the strip, burst direction with a fist knee stone, boss shot -1 hp. TUNE: n=6 x 3 boss with flasks (ranged-heavy first); knobs life / cd / shardK.

## Questions for Daniel (recommended first)
1. Wall is passable for her like all her stones; recall / detonate / collapse ignore it. Rec: yes. Alt: recall dismisses the wall.
2. 'STONE WALL' name teach is the first 3 raises per session (not per room). Rec: fine for now. Alt: per room (needs a per-level counter).
3. Holding the ward 0.2-0.28 s before the wall rises costs ~1 wind of ward-hold drain, so the wall costs ~21 in play. Rec: accept. Alt: zero the drain until holdAt.
4. The bot does not hold C yet (the plan's bot-profile/pilots line). Rec: do it in the TUNE lane with the n=6 runs.
