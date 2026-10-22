# claude/fenroad2 - THE FEN ROAD 2: LAY THE ROAD + the stomping STILT-WALKER + THE BOG LEECH (opus greybox, LANE B of scratch/brief-fenroad2-1022.md)

Base master 5e44cddd. PORT 8781, one headless Chrome at a time. Helpers in work/tmp-fenroad2/ (uncommitted). Not merged, not deployed. THE BOG TROLL untouched
(src/bog-troll*.js unchanged; bog-troll check 39/39).

## WHAT LANDED

### 1. LAY THE ROAD - the level's second verb (src/fen-planks.js, src/fen-road-hands.js slots/lay)
- The work crews leave PLANK BUNDLES (L.bundles; never run out). **E takes a plank** (P.carry, THROW_KIND.plank: carry speed 64 vs run 92, no swing, no climbing).
  **E at a broken edge lays it** (stood at the near edge, facing it: a ghost plank + "E: LAY IT" shows where before you press). **ATTACK throws it** (carry-throw's
  told arc, KINDS.plank: UP lobs, DOWN short): a foe staggers (a small 'throw' blow), **a stilt-walker loses his stilts** (cutStilt -> topple -> finisher). E with
  no edge sets it down; a blow drops it; the water takes it.
- A LAID PLANK IS ROAD THAT SAGS LIKE THE REST: a bowed section of its own (hold SAG.holdLaid 2.2 s), goes under, floats back still laid.
- What takes a plank: a BROKEN stretch over a **PEAT HOLE** (mud pool: the bog sucks you down and hands you back to the last sound board - no swimming across, so
  each hole is a real LOCK), a crew gap not yet laid (piles kept), a bowed section gone under (laid back at once).
- **Teach -> test -> exam, with a CP after:**
  | beat | where | what |
  |---|---|---|
  | TEACH | THE WORK CREWS, hole p1 (111-117) | bundle 107 on the bank, sign 105, nobody hunting you |
  | TEST | plank yard + hole p2 (173-179) | sign 151 (throw), bundle 153, the yard's stilt-walker stomping between the bundle and the hole (throw it at him or carry past), a spitter on the far bank, a leech in the hole |
  | REMIX | crew gap g3 (352), any sunk bowed section | your plank instead of the crew's; a section a stilt-walker stomped under laid back |
  | EXAM (A14) | THE PALISADE ROAD's broken road: p3 (380-386), p4 (392-398) | sign 358, bundle 371 under the horn stilt-walker and the bowman, a leech in p3, a bowed section (k, 388-390) over the leeches' water, bundle 391, then p4; **shrine 400 after** |
  All four holes required (tools/fen-road.mjs: each a lock for all 9 heroes by floodReach opts.hero, each with its bundle before it). Rule line now:
  "BOWED BOARDS SINK UNDER YOU. LAY A CREW PLANK WHERE THE ROAD IS BROKEN." (FEN_RULE). The crews' first two crew gaps became p1/p2; g3 stays.
- Reach model: L.reachSpans (src/reachcore.js, full fill has each hole laid, plain fill not). Guides: src/stuck-spots.js two steps per hole (no plank: the bundle
  glints; plank on: the near edge glints) via FRH.props 'broken' {on: laid, held}. Walker: src/walk-hints.js fenroad (bundle -> edge -> E; a leech on him -> roll).
- Peat gas: NOT built (did not fit the rhythm cleanly; QUESTION 3).

### 2. THE STILT-WALKER IS A MOVER (src/stilt-walker.js; general foe, still reusable)
- **Stomp gait**: slow high steps (stride 18 px, lift 0.42 s, plant 0.36 s), walks a **beat** (home +- `beat` tiles, ent option; every Fen Road walker has one)
  when he has not seen you, steps toward a gaff's length when he has. **Every step is told** (a shadow where the lifted stilt will come down: main.js drawStiltTells)
  and lands as a 'step' event: dust + thud + **FRH.stomp** - the section under it bows (+0.45 s of its hold), one already bowing goes under ("HIS STOMP SINKS IT").
- **Told stomp on a hero under him** (inside stompAt 15 px): stompTell 0.6 s (red !!, red ring + column where it lands, pose 13), driven down (pose 14),
  unblockable 13 dmg, box +-11 px; answer = step out / roll (marks: '!!', ANSWER dodge, HEIGHT low).
- Kept: the told gaff jab (duck/parry), the low-blow stilt cut + topple + finisher, the horn.

### 3. THE BOG LEECH (src/bog-leech.js; the one new foe, NEW_EXACTLY fenroad [stiltwalker, leech])
- Lurks a hand under the water by the boards (eyes + ripple; untouchable). **Wakes** when a section within 72 px bows under a hero or has just gone under, or a hero
  swims near. **Told rear** (red !!, ring, 0.45 s) -> **lunge** (aimed where you'll be, chest height; swimmer met low) -> **latch**: bite 4 + a QUIET DRAIN
  (shared drain BRD 'leech', 3.5% max hp/s, no stagger, A13) -> **ROLL/DODGE shakes it off** onto the boards (x2 damage there, 1.5 s), or it drops off sated at 7 s.
  Missed lunge lands it on the boards (weak) or back in. Struck while rearing it's knocked back under.
- 7 placed: 91 (taught, sign 85), 176 (in p2), 263, 284 (stilt posts), 324, 383 (in p3), 389 (under k). hp 12, threat 1.8, role runner (grab), voices slime,
  SIG {rear: jump}, bestiary card, COLS, AMPHIB + KNOCK_SKIP.

## CHECKS (PORT 8781) - GREEN
- **tools/fen-road.mjs 150/150** (was 56; new F/G/H blocks: locks x9 heroes, bundles, lay/sag/float, crew gap + sunk lay, stomp bow/sink, astir, planks take/lay/throw-topple, gait/beat/told steps, told unblockable stomp, leech lurk/rear/latch/roll/sated). bog-troll 39/39.
- **level-quality fenroad: CLEARS THE BAR** (mechanics 6 kinds: sag/lashing/broken/rotten/undertow/crewgap; secrets 2; roles 4; pilot/mash/curve re-stamped).
- **solid-islands ok (0 new)**, **reach-heroes: all 9 heroes reach every fenroad route target**, stuck --static ok (311 steps), signs, tells (MARK regenerated),
  answer-tags, one-new-foe, threat-holes, voices-check, deadends (peat-hole beds skipped: src/deadends.js), lethal-water (fenroad 10 -> 9), foe-pass, hint-shown,
  comments, floaters, killzones, collectables, checkpoints, spawns, elites, curve-shape, curve-gate, checkpoint-gaps, content-audit (no new).
- **textfit --strict (TEXTFIT_LEVELS=fenroad) hud,talk,levelcard,hints,bestiary,plates: 0 issues** (516 screens).
- Page smoke (work/tmp-fenroad2/smoke.mjs): take/lay/cross, throw topples, stilt-walker walks his beat + stompTell, leech rear -> latch -> drain -> roll shakes it off; 0 page errors.

## STAMPS
- docs/level1-pilot.json fenroad: 31 hits, 3 deaths in 3 runs, 228% hp lost a run. docs/level1-curve.json: **209% hp, 3 deaths / 3 runs** (act I band 40-250% / 0-3).
- docs/mash-bot.json: LEVEL k/w/p 21-22 deaths, lowest hp 0%; BOSS still 0/6 (assert ok).

## LEVEL WALK (tools/level-walk.mjs, campaign L3, human+first)
2 seeds x 9 heroes (18 runs; JSON work/tmp-fenroad2/w9b.json):
| hero | deaths/run | mean arrival / min |
|---|---|---|
| knight | 0.5 | 49 / 15 |
| warden | 0.0 | 54 / 26 |
| pyro | 0.0 | 76 / 50 |
| paladin | 0.5 | 42 / 7 |
| pirate | 1.0 | 51 / 3 |
| reaper | 2.0 | 45 / 14 |
| geomancer | 1.0 | 32 / 4 |
| berserker | 1.5 | 45 / 2 |
| ranger | 0.0 | 72 / 38 |
| **all** | **0.72 (13/18) - IN the act I band 0.5-1.5** (was 0.11-0.28) | **~52%** (target <= 65) |
All 9 reach the boss in every run (walked 95%). Hurt-by shows the new foes pulling weight (leech 4-9 hits a run on the slow-rolling bot; a human who rolls takes far less) and the Palisade Road exam costing 30-80% hp. Spread: reaper 2.0 high, warden/pyro/ranger 0 (the strong-kit heroes) - noise at n=2 is +-0.5.

## REDS / NOT MINE
- **textfit levelcard / hud (unscoped)**: Runtime.evaluate hang at 480 s - same on base master 5e44cddd (ran it there: same hang) - the KNOWN pre-existing nightly hang;
  killed only my run's PIDs (textfit 19348, its serve 22432, its chrome 26064 tree). Scoped to fenroad: green.
- **mash-gate: oreroad stale** - same on base master (pre-existing, not mine).
- Walker STUCK spots are the known bot limits from the fenroad lanes (208,17 after the elite; 250,7 / 229,15 lookout walk; 130,17 by lashing e) - not the plank holes.
- NOT RUN: full suite / QUICK gate, mobile-perf, boss rates (troll untouched; his fight arena unchanged).

## ART HOOKS (the sonnet art lane; reference stills work/claude/lane-done/fenroad2-*.png via tools/fenroad2-shots.mjs)
- **STILT-WALKER** sheet (src/redraw/stilt_walker_art.js, contract SW_POSE in src/stilt-walker.js, 15 frames): 0 idle, **1 liftA / 2 liftB (HIGH STEP: one stilt
  lifted high and forward - the walk cycle; greybox poles only)**, 3 jabTell, 4 jab, 5 horn, 6 topple, 7 down, 8-9 stiltless walk, 10 stabTell, 11 stab, 12 hurt,
  **13 stompTell (a stilt reared over the hero, leaning back)**, **14 stomp (driven down, dust)**. Ground tells drawn in main.js drawStiltTells (foot shadow, stomp ring) - restyle freely; stilt flex / board bow under his step: FRH s.jolt.
- **BOG LEECH** sheet (src/bog-leech.js bakeLeech, LEECH_POSE): 0 lurk, 1 rear, 2 lunge, 3 latched, 4 flop, 5 hurt (24x16 greybox); the lurking eyes/ripple
  (main.js drawLeechFx); bestiary card text in main.js.
- **PLANKS** (src/fen-planks.js draw): the BUNDLE (stack on trestles, roped, glint), the carried / flying / resting plank, the ghost plank + "E: LAY IT", the laid
  section's look (src/fen-road-hands.js: FRA.drawBoard + a pale fresh edge on s.laid), the BROKEN stretch (snapped board ends, sunk boards) and the **peat hole**
  (pools mud+peat: today drawn by the generic mud painter - wants a black sucking bog).
- **HERO POSES for every hero**: P.plankPose = 'carry' (plank on the shoulder/overhead, both hands), 'lay' (crouched, PLANK.layT 0.35 s), 'throw' (two-handed
  heave, PLANK.throwT 0.25 s) - set by fen-planks.js, read by nothing yet (PLANK_POSES).

## QUESTIONS FOR DANIEL (rec first; what I built)
1. **Peat holes hand you back (hurt ~25-30%) rather than kill**, even in the exam. REC + BUILT: hand back (walker deaths already in band). ALT: the exam's two holes
   (p3/p4) are real deaths (A10 amended allows it once taught).
2. **Plank carry rules**: slower (64), no swing, no climb, you CAN jump with it. REC + BUILT. ALT: no jumping while carrying (harder; would need the exam re-checked).
3. **Peat gas** (brief's optional spice): not built - the level already has two verbs plus the leech, and gas + torches would be a third system. REC: skip. ALT: two
   gas pockets on the Palisade Road that a thrown burning plank sets off.
4. **Leech placement 7** (one taught at 91). REC + BUILT; ALT: thin to 5 if the art lane's playtest finds it naggy (Sporewood's lesson: an answer exists - roll).
5. Barricade/lashing verb kept as is alongside the plank (the level now has two verbs: sinking boards + laying them). REC + BUILT.
