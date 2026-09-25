# Lane report: claude/burning (THE BURNING VILLAGE rework)

Branch `claude/burning`: master (391cba2) plus the commits below. `origin/master` was merged again at the end; nothing new
had landed. The design is in `docs/briefs/burning-village-rework.md`. It was written first, and §8 records what changed
while building. The level keeps its id, `needs: 'stockade'`, its spur, its six villagers, its three silvers, its width
(508) and its boss.

| chunk | sha | what |
|---|---|---|
| brief | 385f818 | the design; the before pictures; a pilot that salts each pass |
| 1 | 507c994 | platforming: THE FALLEN HOUSE, THE ROOFTOPS (cellars, a burning beam, rising smoke); a roof-placement rule |
| 2 | cb8c6e0 | the bucket from the well: five buckets, five uses |
| 3 | dfc00f3 | THE BARN ambush; the barn's wall drawn; the elite moved to the Crofts |
| 4 | c13d343 | the town's roof fires as flames; the Pyromancer's plate; the OVERDRAWN rule and the `plates` screen |
| F9 | af1fa71 | what walking it found: gaps too wide for real jumps, a fire on the road at the well, a pillar in the teaching yard |
| report | (this commit) | after pictures, this report |

## The sentence

**THE FIRE HOLDS THE STREET. GO OVER IT, OR CARRY WATER THROUGH IT.** The banner line is unchanged.

## Chunk 1: rooftop routes

- **THE FALLEN HOUSE (Long Street, 229–231).** A burning heap lies across the street. It is four rows high, one more than
  any jump.
  - **With no water:** go up the gable of the house before it, along its roof, and jump three tiles over the fire onto
    the next roof.
  - **With water:** the bucket burns it down to a step (chunk 2).
- **THE ROOFTOPS (248–314, a new seventh section).** The street has fallen into its cellars.
  - The trench is four rows deep, with fire patches on its floor and a ladder out of every cellar (C5).
  - The route runs up the Hall's ledge, along THE HALL's roof, down to the second house, and across **THE BURNING BEAM**.
    The beam spans nine tiles over the second cellar and is too wide to jump.
  - The beam burns through 1.8 s after you stand on it and grows back after 5 s. It is told from the frame you step on:
    it flashes, and a `!` shows over every tile. The paladin runs it in 1.73 s.
  - From the third house, go down its gable to the street.
- **THE SMOKE RISES** out of four cellar gaps on a clock. It is thin, then thickens (the tell), then becomes a plume.
  The plume carries a hero who is in the air up past the eaves. It is a second way out of a cellar, never the only way.
  The smoke is drawn under the creatures, the fires and every mark, so no tell is ever hidden.
- **Rule fixed:** every roof in the level drew its thatch two rows under the slab you stand on. `tools/skins.mjs` now
  checks every house in every level. It failed 10 of 38 on the old builder and passes 38 now.

## Chunk 2: the bucket's uses, in route order

1. **Taught safely: THE CROFT WELL (90).** The yard is calm: no creature, no pillar. A root cellar under the road beside
   the well is sealed by a smouldering hatch. Carry the bucket over it and the hatch falls in, revealing four coins.
2. **Save a villager: the first hot door (101).** It is a short carry from the same well. The trough stays as the other
   way.
3. **Open a way: THE STREET WELL (210) and THE FALLEN HOUSE.** Carry the bucket up the street, under a burning goblin and
   a roof archer, into the heap. It burns down to a step.
4. **Up high: THE HALL'S RAIN BUTT (255, on the roof).** The dormer villager is behind a hot door now, and this pail is
   the only water on the roofs. It also makes a burning beam hold for 12 s.
5. **Paid off: THE SQUARE'S PUMP (456, inside his arena).** The bucket puts out a patch of his burning floor. The patch
   stays out for 8 s even with his heat at 100 (`quench`).

How it works: DOWN takes the bucket. You walk at the load speed (`P.ballast`). Any blow that costs blood spills it. Carry
it *into* a fire to pour it, so there is no new button. A spent or spilled bucket goes back to its well.

**What changed in the Pyromancer's fight, and why.** His kit, heat, vent and overheat are unchanged. Nothing adds an
opening; his overheat is still the only caused opening (A11). The pump gives the room its own water (A4, A12), so the
fight's existing choice gets a third answer: you can punish him *and* buy floor back, at the price of carrying a slow,
spillable bucket through his jet. The bot never carries a bucket, so the pilot cannot see this.

## Chunk 3: the barn ambush

- **THE BARN** is the barn's east half, walls 358–398. Its captain is the brute who used to hold the far door as the
  level's elite. His crew is a burning goblin, a sprig, and an archer on the hayloft. The burning goblin lights the hay
  they fight in.
- **A hay-screen at 358** seals the column from the hayloft to the roof. A gate only rises to the first floor over the
  room, so without the screen you could leave over the lofts.
- **The level's gated elite** is now the Crofts' shield (156, gate 166), which is not on the ambush's doorstep (Q2).
- **The barn is drawn now.** It used to render as open sky, because `drawFacades` ran before the town backdrop and the
  backdrop painted over it. The burning house fronts were hidden the same way, and they show now too.
- **Measured with the ambush lab** (`tools/burning-ambush-lab.mjs`, 6 heroes, 2 reps, captain health ×3.0):
  - 12/12 opened, median **19.8 s**, range 8.8–28.8 s; 7 of 12 inside Q's 15–35 s window.
  - By hero: knight 21–27 s, pyromancer 21–24, paladin 18–29, death knight 13–20, warden 14, freebooter 9.
  - The freebooter clears every room fast. He took 36–39 s on the Kennel Yard and the King's Road, against 55–82 s for
    the other heroes.
  - At ×2.2 the room opened in 7.6–22 s. At ×3.2 two heroes ran past 35 s.
- **Proved in the page:** it locks with all four present; jumping and rolling at both gates keeps you in; the captain's
  death opens it; a death inside resets it. `ambush-single` and `ambush-reach` are green.

## Chunk 4: the look

- **The roof fires behind the town** were three solid 5 px bars. They are now rows of tapering flame tongues, each on its
  own clock. They lean in the wind, shade from white-yellow to a red tip, have a glow on the thatch and sparks, and grow
  with the fire near the camera. Compare `before-01`/`after-01` and `before-04`/`after-04`.
- **The Pyromancer's plate:** the plate grows 7 rows, so his name, heat and health each get their own line (`after-13`).
- **Rule fixed:** `tools/textfit.mjs` now records thin fills as meters. It reports **OVERDRAWN** when a meter is drawn
  across a word after the word.
  - A new `plates` screen draws every boss and mini fight's plate. The suite's textfit now runs it (about 2 minutes).
  - On the old plate, the only finding across 46 fights was the Pyromancer's name. The count is now 0.

## Pilot and INDEX, before and after

- **The Pyromancer** (`tools/pyromancer-pilot.mjs`, bossLab, dice pinned, 2 salted passes, 12 fights):
  - Before: 8/12 (67%), median win 64.9 s.
  - After: 12/12 (100%), median win 67.5 s.
  - His code did not change. The only change to his room is the pump. The swing is dice: bossLab pins a seed per row, and
    any change in how the page draws random numbers moves every fight. 12 fights cannot resolve this; he needs a person
    to play him.
  - **Pilot bug fixed along the way:** the pilot never salted its passes, so pass two replayed pass one exactly.
- **pyre-pilot:** green at every push.
- **INDEX** (`tools/curve.mjs`): **89 before, 89 after.** Threat went from 139 to 137 (the barn's foes now arrive with
  its lock), and the hazard term is still 0. INDEX has no weight for fire, which is this level's hazard.
- **Pacing** (`tools/pacing.mjs`): platforming stretches 0 → 2, alternations 2 → 8, set pieces 1 → 2 (the barn).
  - Before: `----F----F---F-F--S--F-R------F-FS--F-R---R--F-SF-R---FRBBBB`
  - After: `----FF--F-----F--S-FF-FP-F-F---R---F-F--PFR--AAAAAR---FR-BBB`
- **F9:**
  - **Route walk** (`tools/burning-route-walk.mjs`, new): real keys, no god mode, start to his square. All six heroes
    reach the square after the F9 fixes. The knight fell short of the first roof jump before them.
  - **Play bot** (`tools/burning-walk.mjs`, knight and warden): it walked 48% before and 33% after, reported STUCK both
    times. The bot cannot climb a gable (RULES M) and now stops at the Crofts' elite gate. Its before-run also showed a
    RUNTIMEFLOAT sapper, which is no longer reported. Its after-run showed a DOUBLE burning goblin and 4 LOSTGOLD coins;
    both are fixed.

## Captures

All real page, 2x: `docs/burning/before-01..13` and `after-01..17`. The after set adds the bucket (dropping into the root
cellar), the beam's tell with the hero on it, the smoke, and THE BARN at its lock.

## Checks

Subsets only, never the full suite. At every push, this set was green: audit (and content-audit), traps, killzones,
collectables, spawns, deadends, floaters, checkpoints, checkpoint-gaps, skins, dressing, signs, pixels, map-grammar,
one-new-foe, threat-holes, elites, ambush-single, ambush-reach, occluders, ground-depth, architecture, pyre-pilot, tells,
boss-openings, boss-fight-end, arena-supplies, textfit, comments, syntax, homepaths, dangling-paths, burning-village and
village-stakes.

- **Re-runs:**
  - Chunk 2: signs failed on a 3-line sign and pixels on a sign at the cellar's lip. Both were fixed and passed when
    re-run alone.
  - Chunk 3: textfit failed only on chunk 4's new rule, which was in the tree during the run.
  - Chunk 4: boss-fight-end failed once when its page never came up (cdp). It passed re-run alone.
- **New assertions, each seen red on the old code first:**
  - burning-village's rooftops block.
  - burning-village's bucket blocks.
  - burning-village's barn block.
  - skins' roof rule.
  - textfit's OVERDRAWN rule (on the `plates` screen).

## Questions for Daniel

1. **The reach model's jump is six tiles, but the game's is four (the knight), 3.6 (the paladin) and 3.0 (the
   pyromancer).** Every level's reach check trusts six, so a gap that is "reachable" can be one no hero clears. This
   level's gaps are now 3 tiles, or 4 with a drop.
   - Recommendation: a lane to measure each hero's real jump and add a "comfortable jump" check next to reachcore.
   - Don't change JUMP_ACROSS inside a level lane: it moves every level's checks.
2. **The pump in his square is untested by the bot**, and the pilot's win rate moved from 67% to 100% on dice alone.
   - Recommendation: play him once with the pump.
   - If the square feels too safe, shorten `QUENCH.secs` from 8 to 5. Don't touch his health.
3. **The barn's times split by hero**: the warden takes 14 s and the freebooter 9 s, against Q's 15 s floor.
   - Recommendation: keep ×3.0. The freebooter is fast in every room, and ×3.2 pushed two heroes past 35 s.
4. **INDEX cannot see fire.** Hazard is 0 in a level about fire, so 89 undercounts it.
   - Recommendation: weight cellar fires, heaps and flame pillars in `src/threat.js`.
   - That moves the campaign ramp, so it is your call.
5. **The burning house fronts behind the street now show.** A draw-order bug had hidden them since the level was built.
   Worth a look to confirm you want them.
6. **The play bot can't do F9 here.** It can't climb or fight an elite.
   - Recommendation (as the hanging lane asked): give it pacing's route to follow.
7. **The music is still the Quarry's** ("Cavern and Blade").
