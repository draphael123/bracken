# claude/fallingtower2 - THE FALLING TOWER 2 + THE ARCHMAGE FIX (Opus, PORT 8790)

Base: origin/master (batch80) 36c83412 + origin/claude/witchfix + origin/claude/reachcore (merged; main.js flip/minecart/MOVE guards
combined, check.mjs lists unioned). Brief: scratch/brief-fallingtower2.md (Daniel 10-08, all picked).

## A. THE ARCHMAGE (pushed on its own first: e928ec46)
- SEND IT BACK: every projectile he fires can be struck back with any blow - firebolt, ice lances, poison orbs, the death hand, bent
  and trapped bolts, his echo's (src/undead-mage.js RETURNABLE/reflectable). The skulls (bone storm) and the orrery's worlds are not
  shots and nothing turns them. Home, a shot STAGGERS him: mode 'reflected', gold ring + timer, x2, MAGE.reflect.openT 2.2 s, then the
  told ward holds 3.5 s (WARD HOLDS).
- INVULNERABLE OTHERWISE - Daniel's explicit B15 exception, him only, commented in src/undead-mage.js and src/boss-greed.js
  (GREED.chipBy.undeadmage = 0). Soft windows (mageSoft, x1): stepTell/decoyTell (into his entry ring), his ring-to-ring blink
  (stage 3), boneTell/boneWait, orbitTell/orbitWait. A turned blow clanks and says SEND IT BACK (src/archmage-acts.js); a hint names the
  answer; his tells say it (FIRE: STRIKE IT BACK ...); bestiary and the spiral sign updated.
- NOT his realm tear (realmTell): measured, it was HALF HIS HEALTH in one tear for the human bot (a 2.8 s stationary set piece) - it
  stays a warded breather (QUESTION 2).
- THE FIRE ROOM: 2 s ARRIVAL GRACE (nothing burns, nothing is cast); the fire wall's tell 1.0 -> 1.4 s with GLOWING VENTS at your
  height + a hiss; the floor tiles' tell 1.0 -> 1.2 s + a hiss; and the hall's floor burn no longer bites under the realm's own drawn
  floor - it was an UNTOLD hit (the realm paints its tiles over it). tools/fire-room.mjs: all 7 heroes, real keys, grace untouched,
  25 s of the room flown by what is drawn: never caught by floor or wall.
- The bot (src/lab.js) returns every reflectable shot (about two in three, as before for the firebolt).

### Rates (L31 campaign level, practiced, 12 seeds, tools/boss-rates.mjs)
| profile | knight | warden | pyro | all |
|---|---|---|---|---|
| human (WITH FLASKS) | 6/12 | 10/12 | 7/12 | **64%** (band 60-70) |
| human+dry | 6/12 | 10/12 | 7/12 | 64% (identical: the carpet bot never drinks - carpetPlayer has no flask hands) |
Mean win 136 s. Tuning path (6 seeds, human): first build 83% -> soft realm tear removed 67% -> 12 seeds 64%. HP stays 2800 (Daniel's).
Mash: 0/6 (re-stamped). Probe (scratchpad probe-mage.mjs): his damage now comes from breached/gather/reflected and the realms' openings.

## B. THE LEVEL
1. THE COLLAPSE CHASES YOU (src/tower-fall2.js, src/tower-ascent.js): floors arm in 1.4 s (was 2.2) and fall 26 rows/s (20); CRACKS
   RUN UP BOTH WALLS from a falling floor; DEBRIS comes down every 4.4 s on the floor you are on, ON A TOLD SHADOW (1.1 s: a dark spot
   widening on the footing ahead of you, grit trickling, a red mark) - never on a hero who stands still, never in a boss/mini fight.
   The crown's stair is GONE: its inside is one broken floor walked west to THE BREACH.
2. EVERY FLOOR ITS OWN ROOM: THE LIBRARY - its books burn (two plank tiers smoulder 1.1 s with a hiss, then flare 1 s), its shelves
   come down (the library's debris is shelving). THE OBSERVATORY (was the orrery cage) - its DOME turns (ribs, the slit, the moonbeam
   sweeping) and its TELESCOPE is a ride: two failing steps replaced by the eyepiece, which HOLDS at each stop and swings step to step.
   THE ALCHEMY LAB (was the burst cistern) - green SYRUP slows the legs (two tiers), pink FIZZ is a BOUNCER on the bank; its stones are
   FOUR wide (see reach). THE TREASURY (the bell loft's upper vault) - the floor TILTS one way then the other (told: a creak, arrows,
   the gold sliding), you slide (the engine's scree zone, its way and pace set each frame) and three treasure CHESTS slide at you.
3. THE TOWER LEANS: half a degree a fallen floor (max 3), the frame going over with it (main.js seaTilt; not in his sky or on his stair,
   off with reduce-motion); the library floor buckled (slope tiles on rock); loose things slide (the treasury).
4. OUTSIDE + THE SNAP: THE OUTER FACE is the tower's WEST face over the world's edge (east of the tower is his stair tower's rock -
   tools/tower-chase.mjs): nine planks in the storm, WIND told 1.3 s by streaks, flags and a callout before it shoves (braced on a plank
   it is a third), LIGHTNING told 1.3 s by a pale column on the plank it strikes, THE DROP a hazard (a quarter, back to safe footing), one
   cracked plank (the failing stone's last use, 'crown'). At the top the wall's broken crown is THE CHUNK: step on it, THE TOWER BREAKS IN
   TWO (told 1.4 s), it carries you across to the parapet and his ring.
- No new foe. Glint + nudge: ft-scope, ft-breach, ft-chunk (src/stuck-spots.js). Signs at each point of use (2 lines each).
- Load-bearing (tools/fallingtower2.mjs): without the face's planks, or without the chunk, the shared fill does not reach his ring.

### Reach (Daniel 10-09: reachcore's four frame-perfect crossings 24..48,149)
The lab's stones were two wide with four-tile poison gaps; three wide still left the paladin 2 px short. FOUR wide (two-tile gaps):
`node tools/reach-heroes.mjs` (every hero, every level): fallingtower 0 crossings for all seven, the four KNOWN lines deleted, nothing new,
nothing stale. (Fixed on the way: reach-heroes.mjs had a syntax error from reachcore's last commit - an apostrophe in "claude/scree2's".)

### Real keys (tools/fallingtower2-keys.mjs, all 7 heroes)
The telescope (board it low, off it high), the outer face plank to plank in the storm (waiting out gusts as a player reads the flags,
climbing on after a fall), the snap and the step up onto the parapet - all seven, each into his ring.

## Checks
Node: fallingtower2, undead-moves, undead-realms (Node part), tower-hall, tower-cutouts, tower-flyers, threat-holes, crown-exam, archmage-room,
checkpoints, checkpoint-gaps, checkpoint-stand, deadends, elites, killzones, floating-geometry, slopes, map-spacing, signs, spawns,
collectables, keys, traps, dressing, comments, homepaths, dangling-paths, architecture, occluders, one-new-foe, room-patterns, map-grammar,
content-audit, audit, tells, floaters, readability, light-support, ambient-landmarks, reach-heroes (all levels), boss-read.
Page (8790): fire-room, fallingtower2-keys, undead-realms, archmage-rings, boss-openings, rule-openings, weak-bosses, boss-greed,
archmage-room, tower-ascent, tower-collapse, tower-chase, sexton, flip-actions, stuck, level-reach, mark-integrity, chase, mini-walls,
corpses, courtyard, folly-runtime, undead-foes, death-cost, runtime-footing, footing-art, foe-tactics, small-adds.
Re-stamped (level THEN boss): level1-pilot (knight fresh: 69 hits, 11 deaths, 100% walked) and level1-curve; mash LEVEL (knight/warden/pyro
all die in the level: 6/7/4 deaths) then BOSS: the Archmage 0/6 (mash), the Sexton mini 2/6 (it was 3/6 on master - pre-existing, not this
lane's). level-quality, curve-gate, mash-gate green.
WALKER (tools/level-walk.mjs, L31, human+first): knight 4 deaths (the pendulum gallery's spikes), warden 0, pyro 1 - but it measures only
2% of the route: its hands stick at the library stair, the observatory, the pendulums, the loft/treasury, the crown and the spiral. The
same on the A-only base (e928ec46: 2-4% measured, the same stuck nodes) - a walker-hands gap, not this rework (QUESTION 8).
REDS: none standing. Flakes seen once each under load, green on the re-run: stuck (runtime: rw-lean-2, the Rootway - not this
level) and tower-collapse (in play: the lesson tier's drop timing).
Not run: the full suite (40 min; a suite was already running on the PC).

## Tests changed (deliberate design changes - each a question below)
- tools/undead-moves.mjs: "only his firebolt can be struck back" -> every shot of his can, he is chipBy 0, his soft windows (Daniel's design).
- tools/tower-collapse.mjs: "the failing stair is one chain of five" -> two chains of four round the telescope; the race runs on the
  chain under it.
- tools/tower-ascent.mjs: the tome-per-floor exemption names THE ALCHEMY LAB (renamed from THE BURST CISTERN).
- tools/slopes.mjs: the falling tower may hold slopes (its buckled floor); the "no slopes -> same object" pass skips levels WITH slopes.
- tools/reach-heroes.mjs: the four fixed fallingtower KNOWN lines removed (the list only shrinks).

## QUESTIONS FOR DANIEL
1. His invulnerability outside openings (B15 exception, his call) - built exactly so (chipBy 0, commented). REC: keep.
2. His realm tear is NOT a soft window (measured: half his health in one tear). REC: keep warded; "into a portal" = his step/decoy into his
   entry ring and the ring-to-ring blink. Built.
3. Shots in his three realms are NOT returnable (each realm has its own opening, and a stagger there would skip it). REC: keep. Built.
4. Rates with flasks equal dry: the carpet bot never drinks. REC: a small harness lane to give the carpet hands a flask; the band reads
   64% either way. Built: noted.
5. The failing stair in the observatory is two short chains round the telescope (one chain would fail the steps over it while you ride).
   REC: keep. Built (test updated).
6. The outer face is on the WEST face (the east is his stair tower's rock, held by tower-chase). REC: keep. Built.
7. The lab's stones four wide (two-tile poison gaps) - the paladin was 2 px short at three. REC: keep. Built.
8. The walker cannot measure the Falling Tower (2-4% of the route, before and after this lane): REC a walker-hands lane (ropes through
   dividers, the flip, pendulums, the telescope, the chunk). Built: nothing; the level is proved by fallingtower2-keys (real keys, 7 heroes),
   reach-heroes and the pilot instead.

## ART / SOUND FOLLOW-UPS (the Sonnet pass)
Greybox drawing only (src/tower-fall2.js ftDraw): debris stones/shelf/brass chunks; the burning book piles and flames; the syrup and fizz
spills (the fizz is drawn over the engine's BOUNCER tile); the treasury's gold, arrows and chests; the observatory dome (ribs, slit,
moonbeam) and the telescope (tube, mount, eyepiece); the outer face's planks (plain PLANK tiles), flags, rain, the drop, the lightning
column/strike; the chunk and THE SNAP itself (a crack across the tower, the top half going over, more shake/dust). Sounds: no 'creak'
(mapped to clank) or 'whoosh' (throwWhoosh); a wind bed on the outer face; the snap wants its own crack-and-groan.
