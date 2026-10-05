# claude/unburied4 - THE UNBURIED FIELD after Daniel's live playtest (Mon 10-05 ~07:45)

Base: master 2423ff42. Opus. Four notes from Daniel's phone photos (not committed): the background that "looks odd", every floating thing,
a larger section between the Barrow Rider and the Death Knight (a mud field under arrow volleys with cover you move between), and the
Death Knight a bit slower and a little less damage.

## 1. THE BACKGROUND THAT LOOKED ODD (photo 1) - REMOVED (Daniel's answer, 10-05)
It was the ghost army: `ghostRank` in src/unburied-foes.js drew rows of pale, see-through cloaked men with shields and spears as a band across the
SKY over the camp, with the play layer, so it sat in front of the tent and the camp props. A first pass redrew it as dark men on a backdrop ridge;
Daniel's answer was to remove it entirely, so it is gone (no `ghostRank`, no ridge, no main.js hook).
- WHICH STRETCHES STILL FIGHT is now read from the stretch itself, which already says it: only a stretch that still fights blows its horn, washes
  the play red and lights its cover green; a quiet one never does, and "THAT STRETCH OF RIDGE GOES QUIET" is said when its bearer is cut. No
  backdrop replacement was added - nothing else fitted without putting figures back in the sky.

## 2. NOTHING FLOATS
Fixed, each traced in the art:
- **the cart wheel in the sky** (photo 2): the toppled tower's facade drew its second wheel at row 26 "thrown up on the debris" with no debris.
  It lies on the ground now against the fallen base, its broken axle in the spoil; the crest ledge it hid gets a knee brace into the base.
- **the gallery** (photo 3): the gatehouse had no middle - two towers and the sky between them over the gate arch, so the drawbridge's walk and the
  gallery crossed open air with their braces ending on nothing. The gate passage's block of ashlar now fills the gap from the wall-walk to the arch
  (portcullis slot, two murder holes). The gallery's east end over the yard got a post down to the yard wall.
- **the Death Knight's tomb slabs** (photo 4): stepped corbels "in the wall" read as pedestals hung in the air in front of the dark arcades. Each
  lid stands on two stone piers to the floor now (R.structures 'ubpierCold'; the crypt tomb's two 'ubpier'), drawn in the play layer.
- the sweep found more: the Barrow Rider's two **cart beds** hung a row over their low wrecks (now a chassis and wheels under each, 'ubcart'; the old
  wreck decos removed), the **coin shelf over the crossing** (106-110, row 25) stood on nothing (a trestle now), and two of the **toppled tower's low
  decks** (236-240, 241-245) get raking shores ('ubprop').
New drawers: src/redraw/unburied_siege.js drawPier / drawCartFrame / drawShores, dispatched by src/redraw/unburied_sets.js drawStructure
(main.js drawStructures: one line, every 'ub' structure kind).

**THE CHECK: tools/unburied-aloft.mjs** (in the suite). It takes nobody's word (unburied-look 2 let a ledge pass when a set piece CLAIMED to hold
it - all of Daniel's floating things were inside a claimed box). It paints the backdrop one flat colour and then another (new: `BK.hide.back`,
one main.js line; `BK.hide.facades` may now be a list of kinds) - where the two frames differ, the sky shows through.
- A: every ONEWAY/PLANK run is keyed into rock, or each end stands on an L.structures support that reaches rock, or on play-layer/timber-frame
  pixels drawn from it down to rock (a stone back wall painted behind does not count), or on a declared wall (UF.WALLS); a walk of 6+ tiles not on
  structures may not show the sky through a third of the two rows under it for more than 20 px.
- B: the scenery alone is cut into connected pieces; every piece wholly on screen must come down to a standing surface.
- RED ON MASTER (a worktree of 2423ff42 with only the two HIDE hooks added to main.js and this tool): A `53 ledge runs ..., 14 on nothing` - 14 ends
  over 9 runs: the gallery 354-362@24, the shelf 106-110@25, the tower decks 241-245@30 and 236-240@33, the cart beds 332-334/346-348@34, the tomb
  lids 380-384, 442-445, 462-465@34; and on my tree with only the gatehouse art put back, `354-362@24 (a walk with the sky under it for 46 px at col 357)`;
  B `a 49x51 px piece at col 263.3, its foot at row 28.1` - the wheel. Green now: A 53 runs / 0 on nothing, B 45 screens / 0 in the air.
  (On a page without the HIDE.back hook it fails its own sanity line, "the sky can be seen", instead of passing everything.)

## 3. THE BAILEY - a new section between the Barrow Rider and the Death Knight
Seventy-two columns cut in at final column 364 (a second grow(); src/unburied-field.js 5b), at the foot of the gallery's rope ladder: the outer
ward inside the Order's wall, churned to mud by the host that got over it, under the Order's dead bowmen on the breach at its far end. Everything
east of it (the yard, the crypt, the nave, the arena) slides 72 east; the level is 552 columns. Sections: standard 325-363, **bailey 364-435**,
chapel 436-505, arena 506-551.
- **ONE RULE:** a horn on the breach, then the volley out of the east; what stops it is a thing between you and the breach.
- **THE VERB: PUSH A WHEELED MANTLET** (a pushblock 20x24 with `mantlet` set: the host's tall plank shield on two small wheels). It is cover
  you move, at the pace of what covers you (push 26 px/s; wading is 46), and it is a STEP: the barricade and the breach are four rows over the mud
  - no hero's base jump (3.17 tiles, measured for knight/warden/pyro/paladin/reaper/geomancer) makes four, a mantlet at the wall's foot makes it three.
- **DRAWN STATE:** the horn (1.8 s of a 5.2 s clock) washes the zone red, the Order's three ghost bowmen on the breach's timber hoarding raise their
  bows with red points, every wagon/shield-heap/mantlet in reach is outlined green and its LEE (the strip on its west side) laid pale on the mud;
  the arrows come in slanted out of the east and stand in the mud after. The clock waits while you are outside the zone.
- **TEACH (0-21):** firm ground and a wagon at the ladder's foot, the sign at the point of use ("...PUSH A MANTLET AND KEEP BEHIND IT."), mantlet A
  in the mud, a heap of shields halfway, the barricade (an earth bank drawn as gabions and fascines): push A to it and climb. No foe.
- **TEST (22-44):** mantlet B, a long reach of mud and THE MIRE (zombie, grave hound, husk) coming through it while the volleys fall - and the volley
  hits ANY creature in the open, so the dead you draw out of cover are the bowmen's too (a remix: the rule used on the foes). A broken cart.
- **EXAM (45-71):** mantlet C under THE BREACH (a banner-bearer and two fallen in the mud, two bone archers on the breach itself - the ranged foe),
  the breach four rows high: push C to its foot under the volleys with the dead getting up round you, climb out, drop to the yard.
- GLINT + 10 s STALL NUDGE on each mantlet (src/stuck-spots.js ub-mantlet-a/b/c, glint 'stall').
- UNBLOCKABLE (Daniel's answer, 10-05): no guard turns the bailey's volley - only cover (wagons, shield heaps, mantlets). It is told red like every
  !! in the game: a red !! over each bowman while the horn blows, the red wash, and the first horn says "A HORN ON THE BREACH: NO GUARD TURNS IT,
  GET BEHIND COVER". tools/unburied-bailey.mjs 2 asserts a guard held toward the breach in the open is hit. Checkpoints: none added - the yard's at 362 is just before it, the next is 484 (worst gap on the route 144).
- Art: the inner ward's wall behind it is the Order's yard wall run on west (bakeWall takes o.gap); the breach's facade 'ubbreach' (the gate tower's
  stump, the hoarding on four posts that stand on the rubble, the Order's red banner); the bailey's ground is the field's mud kit, not the chapel's flags.
- ENGINE FIXES it needed: src/push-blocks.js - a hero faster than the block (any run, even a wade) walked into it a little more each frame until his
  side passed its edge and was popped out on the FAR side; he is now carried with it but never past its edge (tools/push-blocks.mjs green, the fair's
  bale and test green). src/reachcore.js - a pushblock with `stepAt` is a step there (one walk, done, like a laid gun's hole), so every route tool
  sees the bailey crossed with the mantlets and not without them.
- **CHECKS:** tools/unburied.mjs 5c (the volley is told and the bailey's own; 50+ columns of mud; three mantlets; both walls four rows; with a REAL
  jump (maxUp 3) from the ladder's foot the fill stops at column 383 without the mantlets and crosses with them; two encounters and a bowman).
  **tools/unburied-bailey.mjs** (new, in the suite, page): told (1.80 s horn, then 1 hit in the open), cover (shields: turned 1, hit 0; mantlet:
  turned 1, hit 0; a guard in the open: hit 1), push (206 px in 12 s, 0 hits on the hero pushing), a step (over with the mantlet at the foot; not over without), the dead
  (a zombie in the open hit, 70 -> 57), glint (ub-mantlet-a nudges once after 10 s). It was red before the push-blocks fix (the mantlet moved 7 px).
- slopes-trace: unchanged for every level including this one (no rebase).

## 4. THE DEATH KNIGHT: a bit slower, a little less damage (Daniel's call: he won)
src/unburied-foes.js UNB.bk: every tell x1.12 (swing 0.42 -> 0.47, cleave 1.0 -> 1.12, commit 0.32 -> 0.36, ...), his pause cd 0.5 -> 0.56 and
recovery swingRec 0.3 -> 0.34, walk 80 -> 70; every blow x0.85 (swing 20 -> 17, cleave 27 -> 23, bolt 13 -> 11, grip/boil 9 -> 8, coil 15 -> 13,
tide 19 -> 16, nova 16 -> 14 (+4 -> +3 a blow), surge 19 -> 16). Health untouched (1700).
Re-measured, tools/combat-pilots.mjs unburied --salts=1..7 (the human bot, L-by-depth via BKT.setHeroLevel, 21 fights each):
| | knight | warden | pyro | all |
| before (master 2423ff42, same harness) | 7/7, 65 s, took 81 | 7/7, 52 s, took 110 | 7/7, 81 s, took 166 | 21/21 |
| after | 7/7, 63 s, took 69 | 7/7, 60 s, took 110 | 7/7, 86 s, took 155 | 21/21 |
The bot was ALREADY at 100% on master before this change (integ67's 57% was measured on another tree/harness), so it is above ~65% both before
and after: per the brief, a question rather than a counter-tune (no health change). See Q1.

## Mash rows (tools/mash-bot.mjs, level THEN boss, --write)
docs/mash-bot.json re-stamped by the bot, level then boss (only unburied's rows). LEVEL: knight dies (hp lost 162%), warden dies (175%), pyro
ends on 3% (140% lost) - the mash bot loses the level with all three (44/42/42 lifts, the bailey's walls among them). BOSS (the Death Knight, after
the softening): 0/6 - he is left on 87/83% (knight), 86/85% (warden), 48/53% (pyro). MINI (the Barrow Rider): pyro still wins 2/2 as before
(the unburied mini is MASH_REPORT_ONLY on master, list unchanged). mash-gate and level-quality green.

## Checks run (named, not the suite) - all GREEN
unburied, unburied-fights, unburied-look (all 11), unburied-engines, unburied-aloft (new), unburied-bailey (new), push-blocks, stuck (static +
runtime), architecture, checkpoints, checkpoint-gaps (after shifting the unburied drop 412 -> 484 in src/checkpoint-thin.js), skins, npc-removal,
hint-shown, signs, deadends, sprinkle-cap, goblin-lint, corpses, boss-greed, boss-openings, boss-fight-end, footing-art, ground-depth, floaters,
render-layers, slopes-trace, level-quality, mash-gate (after the re-stamp), ambush-reach, ambush-single, ambush-listed, mini-walls,
deathknight-unlock, boss-music, ambient-landmarks, harvest-fair, audio-assets, dangling-paths.
Tests touched (none weakened): tools/unburied.mjs counts the mantlets among "siege engines you work" (the brief's prop-every-3-screens bar, now over
23 screens) and gains 5c; tools/push-blocks.mjs PLACED gains unburied: 3; tools/stuck.mjs reads a pushblock ent as the mover main.js builds from it.

## UNVERIFIED
- Not played by a human. The bailey was driven by tools/unburied-bailey.mjs and looked at in stills only: the volley's feel (5.2 s clock, 10 dmg),
  the push speed through 40-odd tiles of mud (it is slow on purpose: ~13 s for the exam's 20 tiles) and the archers' readability want a real play.
- The Death Knight change was measured by the bot only (which already won every fight before it).
- The level-1 pilot (docs/level1-pilot.json) was not re-stamped (not in the brief; no check failed on it).

## DANIEL'S ANSWERS (10-05, via the coordinator) - done
1. The mantlet stays required (four-row walls): kept.
2. A guard does NOT stop the bailey's arrows: the volley is unblockable now (hurtP), told red with a !! over the bowmen and the first horn's line.
   Re-run: unburied-bailey (guard in the open is hit), unburied, unburied-fights, unburied-look (all 11), unburied-aloft, hint-shown - green. The
   level's data did not change (mash-gate: same hash, green) and the mash bot never guards, so its level row stands as stamped.
3. The ridge army is removed from the background entirely; the "which stretch still fights" read is left to each stretch's own horn, red wash and
   green cover (no backdrop replacement - see section 1).
4. The Death Knight keeps this lane's change, no health counter-tune; the bot gap is its own lane.

## QUESTIONS FOR DANIEL
None open.
