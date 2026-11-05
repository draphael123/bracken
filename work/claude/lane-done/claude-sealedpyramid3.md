# claude/sealedpyramid3 - SEALED PYRAMID 3 + THE MINI LIFECYCLE (OPUS greybox, code-only, unattended) - 11-05

Branch `claude/sealedpyramid3` off `claude/desertkit` 6dfb815bd. Worktree `C:\Users\Daniel Raphael\.claude\bracken-lanes\bracken-sealedpyramid3`. NOT merged, NOT deployed.
Sources: scratch/plan-desert-1105.md (lane "OPUS Sealed Pyramid 3 + mini lifecycle"; sections 1.10, 2, 3i; Q7 mini band 70-80), scratch/brief-sealedpyramid3-1014.md,
scratch/brief-desertroad-1123.md section 1 (slab -> non-falling trap, accepted 11-04 10:02), the pyramidboss/sptune reports, lane-reports/desertkit.md, heartlevel.md.

## Build plan (as written before building)
1. ONE FLAG FILE `src/sealed-pyramid3.js`: `SP3_SHIPS=false` (level/boss/mini rework) and `MINIS_STAY_DOWN=false` (the shared lifecycle fix); dev switches `?sp3=1` / `?ministay=1`
   (browser), `SP3=1` / `MINISTAY=1` (node), `globalThis.__SP3`. Flag off = master byte-for-byte in behaviour.
2. MINIS NEVER RESPAWN at the shared lifecycle (one place in main.js) + `tools/mini-no-respawn.mjs` across every mini level.
3. THE KING'S STAIR spike pit -> THE WELL'S BREATH (updraft back to the stair's foot, told hp cost, never a death/soft-lock). This pit only.
4. THE SCARAB MOTHER: +2 told moves with their own windup/release and different answers (no number tune: the plan's 70-80 band, she is 78% today).
5. THE COFFIN KING 'ESCAPE + BREAK THE SEALS': new pure fight + hands, the chamber rebuilt as four SEAL TRAPS on the level's own trap engine
   (oil / darts / SAND-POUR / sluice - no slab), THE FLIP kept (flood), the old lure-into-switch-sweep loop gone; lab bot hook.
6. Node tests + the level lints both ways; report (browser owed, art owed, questions).
The heart lane's placeholder `needs: 'sealedpyramid'` is untouched (the level id, its row and its needs are unchanged).

## What was built
| file | what |
|---|---|
| `src/sealed-pyramid3.js` (new) | THE FLAGS + `CK_SLOT` (the chamber's four seal traps, their plates, lines, waiting spots) + `UPDRAFT` (the well) |
| `src/mini-keep.js` (new) | pure `miniKeep(L, prog, rush)` / `miniStaysDown` - what the save says about a level's mini(s) and which gate columns open |
| `src/main.js` | 1) spawnEntities: after its `miniDone = false` reset, `miniKeep` restores a beaten mini (+ its gate) - behind `minisStayOn()`, never in a rush. 2) spikeBite: the well first (spare, told share), 3) `P.spLift` (the lift + set-down), 4) the trap engine's `trapLive` passes the trap (`d.ck`), 5) TKH ctx `floodLevel`. 6 small hunks. |
| `src/sealed-pyramid-tombs.js` / `src/sealed-pyramid.js` | SP3 on: the chamber's traps are `ckTraps()` + the chamber pool + the hopper slot; the stair's sign tells the well; `L.spUpdraft`. Off: master's lines (the old block is the `else`). |
| `src/sealed-pyramid-hands.js` | trap engine: `d.ck` traps live by the King's phase; `d.sand` = THE SAND-POUR rides the gas machine (no venom, own click/name/greybox pour); the well's rising sand drawn (greybox) |
| `src/coffin-king.js` (new, pure) | THE COFFIN KING - seals, escape stages, 7 told moves, THE FLIP, takeBlow (B15), `ckPlan` (the human bot) |
| `src/coffin-king-hands.js` (new) | world binding + greybox drawing of all three stages, the seals over him, the READ, ready-trap lines on the floor |
| `src/tomb-king-hands.js` | `makeTombKingHands` is now a thin switch: arena.ck -> the Coffin King's hands, else master's sarcophagus (renamed inner fn, body unchanged) |
| `src/tomb-king.js` | `tkOpen` also reads SP3's `burst`/`downed` modes (master never sets them); `tkPlan` hands an SP3 fight (S.ck) to `ckPlan` |
| `src/scarab-mother.js` / `-hands.js` | SP3 only (`S.sp3`): `CYCLES_SP3` + THE WING SWEEP / THE DUNG BALL (+bot answers, greybox draw, duckBox for the sweep) |
| `src/lab.js` | tombking branch: passes the burning seal-trap lines, applies `pl.down` (duck the whip); scarabmother branch applies `pl.down` (duck the sweep). Master's planners never set `down` there. |
| `src/marks.js`, `src/hint-lines.js` | rows for the 7 new tells (mark/answer/height); CK_SAY lines in SAY_LINES |
| `tools/mini-no-respawn.mjs`, `tools/sealed-pyramid3.mjs` (new), `tools/sealed-pyramid.mjs` (1 check gated on arena.ck), `tools/check.mjs` (2 own lines, not run) |

### 1. MINIS NEVER RESPAWN (flag `MINIS_STAY_DOWN`; SP3 turns it on too)
Found the actual bug: `spawnEntities()` resets `miniDone = false` on EVERY attempt and on the load itself (after `loadLevel` read PROG) - only the harbour/reverse tower
re-read it. So any single-mini level re-spawned and re-fought a beaten mini after a death (and on a revisit). The save (`PROG[id].mini/.mini2`, written by `miniEnd` the
instant she falls) was right; the reset ignored it. Fix: one hunk after the reset reads the save through `miniKeep` and re-opens her PORT gate; two-mini levels
(Deep Rails) keep their order; the Unburied Field's gate stays the chapel's; boss rush untouched. 15 mini levels pass (`tools/mini-no-respawn.mjs`, 74 checks).

### 2. THE WELL'S BREATH (King's Stair, cols 963-1003, spike row 34)
Falling in: a told 15% of the bar (`spare`: never kills; under a plain spike's 27%), a sand column lifts you (0.75 s) and sets you down at the stair's foot (958, the high
door's landing) as your new safe spot. It runs BEFORE the exam's spikes-kill rule (the King's Stair exam span made this pit a death). The sign at 960 says it. This pit
only (the level's other spike cells keep the shared rule - asserted). Rising sand motes over the well always (the rule told before you fall).

### 3. THE SCARAB MOTHER (+2 told moves; numbers untouched)
- THE WING SWEEP `!` (P1 on): wing cases up and buzzing (windup), a swarm band sweeps the floor at a standing hero's head out from her (release) - DUCK it (8 px crouch
  clears, 14 px standing does not), or block, or be on the ledge.
- THE DUNG BALL `!!` (P2 on): she backs onto a ball (windup), kicks it (release); it rolls to the wall and bursts - JUMP it, or be on the ledge (unblockable).
- P2 now adds the burrow + the ball (STATED CHANGE to B5, like the King's). Master's cycles untouched with the flag off. Poses are placeholder transforms (art owed).

### 4. THE COFFIN KING 'ESCAPE + BREAK THE SEALS'
- LOOK (greybox): a giant upright sealed coffin (44x56) that hops after you; bandaged hands punch out of the lid; the bindings that still hold are drawn ON him (rope bands,
  chain X, red wax, the hourglass) and named over him with the trap that breaks each ("ROPE: OIL", "CHAIN: DARTS" / "HOURGLASS: SAND", "WAX: SLUICE"); the ready trap lines
  glow faintly on the floor. P2 the lid hangs, arms out; P3 a tall bandaged king with a gold mask carrying the coffin.
- THE CHAMBER (master's room, ledges, doors; switches/counterweights/blocks/alcoves removed under SP3): four SEAL TRAPS the PLAYER fires, each plate outside its own line:
  OIL (rope, P1) plate west corner, fire runs 1011-1023 | DARTS (chain, P1) plate on the east ledge's inner end, darts sweep 1024-1046 | SAND-POUR (hourglass, P2) plate
  1032-33, the roof hopper pours on 1024-1029 | SLUICE (wax, P2) plate on the west ledge's inner end, the bore runs the whole floor, then the floor floods to the ledges' top.
  Nothing falls on him (no block/slab/stone - asserted). He CHASES you; you stand so his walk to you carries him into a line, then tread its plate.
- SEALS -> OPENINGS: P1 rope+chain, P2 hourglass+wax. A seal trap on him breaks its seal (told + 0.6 s stagger); all of a phase's -> THE LID BURSTS (3.6 s, x1.7, purse 9%)
  -> he drags himself back in (clamp, told) -> 3 s WARD (traps glance) -> the seals knit. A trap whose seal is already gone = "spent", told which traps bind him now.
  THE FLIP (P2, the payoff): SAND FIRST, THEN THE SLUICE - the bore bursts the lid and the rising water tips the open coffin onto its back: 5.4 s, purse 14%. The other
  order is a plain burst ("HE BOBS: THE HOURGLASS STILL HOLDS HIS LID"). P3 FREE: ANY trap on him = DOWNED (3.0 s, purse 8%) - but he runs (104 px/s).
- THE MOVES (7 told, each own windup + release pose, one windup at a time, picked by where you stand, never twice running): P1 SLAM `!` (block) / TUMBLE `!!` end over end (jump)
  / GRAB `!` hands burst out, a hit HOLDS you (squeeze ticks, strike to tear free, else tossed) / LEAP `!!` anti-crowd (4.5 s on one platform). P2 +CHAIN WHIP `!`
  (duck/block; reaches ledges). P3 new body (STATED CHANGE to B5): LUNGE `!` (claws, the slam's heir), GRAB, WHIP, LEAP, +HURL `!!` the coffin onto your marked spot,
  then he must FETCH it (a gap you can trap him in).
- B15: outside an opening x0.4 (P1) / 0.45 (P2) / 0.6 (P3, fragile); warded/clamp x0.4; a spent purse still x0.4 (master's returned 0 - fixed here). Never invulnerable.
- Numbers start from master's tuned Tomb-King (hp 5000, dmg 40-56 like his 42-66). NOT tuned: the tune lane owns 60-70% with flasks.
- Lab hook: src/lab.js's existing tombking branch drives `ckPlan` through `tkPlan` (S.ck), so `tools/boss-rates.mjs sealedpyramid` runs SP3 with `?sp3=1` once a page may open.

## Node results (one at a time, no page)
- `node tools/sealed-pyramid3.mjs` - **79 ok** (A flag both ways: nothing west of the chamber changes; B chamber lint: one trap per seal, nothing falls, plates on footing outside their lines and on the reach model's route, pool at the ledges' top; C the well: owns all 41 well spikes and no other, sets down on route footing, cost < a spike's, spare + before the exam rule, sign; D the King pure: seals/burst/clamp/ward/knit, FLIP only sand->sluice, bob, P3 downed, min resist x0.4 every mode/phase, every blow told over 3 phases, one new move P2, stated P3 swap, picks by where you stand, anti-crowd leap; E the Mother: both moves told, sweep over a crouch, master's cycles untouched; F toy duel).
- TOY DUEL (node lab hook, NOT the band - a kinematic toy of the trap engine + ckPlan, n=6 x knight/warden/pyro at L41 hp 165/165/153, 3 flasks): the bot opens him in every
  duel (47/22/23 openings, 6 FLIPS for the knight), the knight's runs reach P3; toy wins 0/18 (the toy bot eats the leap/slam; no real dodge/flask timing). Read: THE RULE is
  workable by a bot through all three phases; the band is unmeasured.
- `node tools/mini-no-respawn.mjs` - **74 ok** (15 mini levels).
- `node tools/sealed-pyramid.mjs` - **240 ok** off, **241 ok** with `SP3=1` (one master check now reads "the four seal traps instead" when arena.ck).
- `node tools/level-quality.mjs sealedpyramid` - off: CLEARS THE BAR. `SP3=1`: every row ok EXCEPT pilot + mash = "the level changed since it ran" (hash) -> re-stamp owed (browser tools).
- `anchor-lint` / `floating-geometry` sealedpyramid - identical output both ways (report-only level; SP3 adds 0 floating groups, 0 anchor items).
  FLOAT TRIAGE of the SP3 area (950-1047): the two chamber side ledges hang on drawn chains (master's), the King's Stair courses are corbel-keyed cornices over the well (A14,
  master's), the landing shelf 953-960 is master's - all intended, none new.
- one-new-foe, answer-tags, tells, boss-read, goblin-lint, dressing, platforming-lint, checkpoint-gaps/-stand/-thin/-rule, checkpoints - see "LINTS" below.
- `node --check` every touched file. NOT run: tools/check.mjs (per brief), any page tool.
- New filenames vs ad-block words (ad/admiral/banner/track/pixel/promo/analytics/beacon): `sealed-pyramid3.js`, `mini-keep.js`, `coffin-king.js`, `coffin-king-hands.js`,
  `mini-no-respawn.mjs`, `sealed-pyramid3.mjs` - clean.

LINTS: (filled below)

## Browser owed (none opened; all with `?sp3=1` unless said)
1. `tools/level1-pilot.mjs sealedpyramid --write` then `tools/mash-bot.mjs sealedpyramid --level sealedpyramid --write` with SP3 on (level THEN boss) - the level-quality pilot/mash rows (a flag-on hash; decide whether the stamp is taken at the flag flip).
2. `tools/boss-rates.mjs sealedpyramid` n=6 (knight/warden/pyro, human, flasks=kit, practiced) for THE COFFIN KING (60-70%) and `sealedpyramid:mini` (70-80%) - with SP3 on. Then tune.
3. boss-openings, damage-caps (tombking row: the burst/flip/downed purses), boss-fight-end, untold-told, mark-integrity MI_ONLY=tombking,scarabmother, hint-shown, tells (page part).
4. Walk: the well (fall in at 970 and 995: lift, set-down, hp), the chamber - each seal trap from its plate with him in the line and with him out of it, a hero caught in a line,
   the FLIP (sand then sluice) and the bob (sluice then sand), the swim while flooded, P3 hurl/fetch/downed, the grip + tear-free, co-op 2-4 seats on plates/ledges, every
   hero incl. the reaper (slowest) and the Desert Priest integ.
5. MINIS NEVER RESPAWN with `?ministay=1`: beat a mini, die before the next shrine -> she stays down, her gate open; reload the level -> same; Deep Rails' two minis; a boss rush still fights her.
6. reach-heroes, floaters, hint-shown, untold-told are page tools (not run).

## Art owed (art before live; greybox today)
THE COFFIN KING (the centrepiece): the giant sealed coffin in P1 (rope bands, chains, the false gold face, the real face pressing at the cracks, hands punching out), P2
(lid hanging, arms free, chains whipping, wax and the hourglass seal), P3 the free mummy king (gold mask, linen, wrist chains) + the coffin carried/hurled/lying; every move's
windup + release (slam, tumble x end-over-end, grab/hold, leap/perch/drop, whip, lunge, hurl, fetch), burst, FLIPPED (on its back, swamped), downed, clamp, escape; seal
break fx (rope burns, chain snaps, wax runs, glass fills); his bestiary card (master's sarcophagus poses today). THE CHAMBER: the oil brazier + channel, the
hopper (sand-pour) and its column, the sluice flood surface, the plates' ledge mounts; music (still the tomb theme placeholder). THE WELL: the updraft column + motes, a
wind sound. THE MOTHER: wing sweep windup (wing cases up) + release, the swarm band, the dung ball (+ back-up and kick poses).

## Questions for Daniel (recommended answer first - built as rec)
1. **MINIS_STAY_DOWN is a live bug fix for every mini level** (beaten minis re-spawned after any death and on a revisit). REC: flip `MINIS_STAY_DOWN = true` at the next
   integ merge on its own - it needs no art; SP3 waits for its art. Alt: ship it with SP3.
2. **Seal sets per phase** - REC (built): P1 rope+chain (oil, darts), P2 hourglass+wax (sand, sluice), P3 none (any trap downs him). Alt: all four seals every phase (longer cycles).
3. **THE FLIP needs the sand first, then the sluice** (the bore bursts the lid, the rising water tips the open coffin; the other order is a plain burst). REC yes - it makes the flip
   a skill. Alt: any flood with the wax broken flips him (easier).
4. **Seal four = THE SAND-POUR (an hourglass seal that breaks when its glass fills)**, not a falling slab (plan section 2 / desertroad Q1). REC keep. Alt: a scarab-swarm release.
5. **P3 is a new body** (the slam becomes his claw LUNGE, the tumble goes - the coffin is now the HURL); that is two new moves in P3 (STATED CHANGE to B5). REC keep. Alt: keep the tumble in P3 and drop the lunge.
6. **The Scarab Mother's falling block** (her own `smBlock` "PINNED" opening is a block let go from the roof) - the same falling-object pattern the plan removes from the King. REC: a
   small follow-up swaps it for the sand-pour kind built here (the trap engine has `d.sand` now). Not built (outside this brief; her band is set). Alt: leave her.
7. **The anti-crowd leap at 4.5 s** (master's king 3.5 s): waiting by a plate for his chase IS the rule, so it comes later. REC keep. Alt: 3.5 s.
8. **Her two moves vs her band**: the plan's 70-80% (Q7) overrides the brief's "a lot harder 60-65" - built as moves only, no number change (78% today). REC: tune lane measures and
   holds 70-80. Alt: tune to 60-65 as the brief said.

## Final tip
(filled at the end)
