# claude/reachcore - REACHCORE RESUME (2026-10-09, opus, PORT 8788)

Per-hero, slide-aware reach model on the game's own movement code (design-standard A7, B12). Resumed after Daniel stopped the lane on 10-08;
the 15 uncommitted files were read, checked and committed; origin/master (batch80) merged clean.

## Branches
- `claude/reachcore` - the lane (off batch80 master). Merge this.
- `claude/reachcore-b81` - a TRIAL: origin/claude/batch81 + claude/reachcore, conflicts resolved (reachcore.js towpath + glass blocks both kept,
  main.js imports, check list). docs json oreroad rows there are batch81's (winch5) - the Ore Road plug changes oreroad's hash, so the BATCH81 INTEG
  must re-stamp oreroad level1-curve / level1-pilot / mash-bot rows. reach-heroes is green on it (church + towpath + zip lines included).

## What it is
- `src/hero-move.js` (ddfc7ddf): every base-movement number main.js moves the hero by; `src/reach-hero.js` flies them frame by frame per hero.
- `floodReach(L, T, { hero })` - each hero's own arc from the run-up the floor gives (sprint carried), slides off slopes with the game's slideStep,
  a landing counts only with a hand's slack past the lip. OPT-IN: no opts.hero = the shared fill, unchanged (builds and stamps hash the same).
- NEW this resume:
  - flights must FIT the columns they cross (`hAt`): a jump no longer passes over a wall after its arc has come down.
  - THE KEEP CEILING HAS ONE COPY: `src/slopes.js slideKeepAt(L, x, kind)`. main.js and glass-sea-hands ask it; reach-hero slides with it. The
    SLOPE MOMENTUM lane changes this one function and the reach model follows (1.3 on glass is RIDE_MOVE.GLASS_SLIDE_CAP, read, not copied).
  - glideFrom dx=0 (SKYROAD2's note): a glide straight down needs the column open (ddfc7ddf; skyroad + skyroad-stuck green).
  - Glass Sea: the hero audits fuse the sand beds and open the shard vault (every hero does in play) - the hero fill now reaches every Glass Sea
    target; the shared fill still stops at the slide gap (col 147), which is the point of the slide model.
  - opt-ins: `REACH_HERO=<hero>` for reach, elites, deadends, checkpoint-stand, death-cost (static), route-breaks; `pacing(lv, { hero })`;
    `tools/level-walk.mjs --reach-hero` (each hero walks the route his own legs reach).
  - NEW `tools/reach-heroes.mjs` (in check.mjs): A the numbers per hero (+ `--page`: the game's real-key jumps match the model to 0.5 px - 21/21 ok);
    B the Slick Slope: as it stood before claude/slickslope NO hero crosses, today EVERY hero crosses (17 px past a hand's slack);
    C every level x hero: each route crossing the shared fill takes that a hero's own legs cannot - each listed in KNOWN with a reason; a new one
    fails, a stale one fails.
- LEVEL FIX: THE ORE ROAD's breakable ore plug at 468 had open air over it - a running jump off the drum house's shed roof cleared it onto
  checkpoint 470, every hero (found by the per-hero fill). Rock from the roof's height up over the seam. oreroad curve/pilot/mash rows re-stamped.

## Checks (claude/reachcore 544a3e16+, after the master merge)
Node: reach-heroes (all levels, 8 min) ok; ore-road, ore-exam, elites, checkpoint-stand, deadends, curve-gate, mash-gate, level-quality,
floating-geometry, slopes, glasssea, skyroad, modulepreload, checkpoints, checkpoint-gaps ok.
Page (8788): glasssea-slide ok (the keep refactor plays the same), reach-heroes --page ok (21/21), ore-ride ok.
batch81 trial: reach-heroes ok (46 levels incl. church, towpath).
Not run: the full suite (40 min; PC load) - the coordinator's integ run covers it.

## DEFAULT? NO - stays opt-in
Turning opts.hero on by default would (a) change the build's own fills (coin sprinkler, payDeadEnds stamps -> every hash, every re-stamp) and
(b) flip these 12 levels red. The gate is reach-heroes in the suite: nothing NEW may appear.

## Per hero: route crossings his own legs cannot make (all TIGHT: a frame-perfect take-off lands a toe, a hand's slack past the lip does not)
| crossing | heroes | margin |
|---|---|---|
| scree 220,2>226,3 / 231,2>237,3 | all 7 | gap 3-4; still there after scree2 |
| scree 226,3>231,2 | all but pyro | gap 3 up 1 |
| hanging 103,38>98,37 | paladin | 9 px |
| spire 60,137>55,136 | all 7 | 15 px |
| crown 168,59>174,59 | all but pyro | 18 px |
| crown 134,63>139,62 | paladin, reaper | < 2 px (a hair) |
| reef 457,16>462,15 | all but pyro | 24 px |
| waymeet 138,35>143,34 | paladin, reaper | < 2 px |
| fields 33,33>39,33 / 126,23>131,22 / 142,23>147,22 | all but pyro | 6-12 px |
| mage 568,10>574,10 | paladin | < 2 px |
| fallingtower 24..48,149 (four 5-gaps) | all 7 | 18 px |
| witchlight 463,26>468,25 | all but pyro | 8 px |
| unburied 33,36>39,36 | paladin | < 2 px |
| fair 586,14>591,13 / 587,14>592,13 | all but pyro | 8 px |
| fair 257,27>262,26 / 279,25>285,27 | paladin, reaper | 2 / 12 px |

So: knight/warden/pirate/geomancer 16 crossings each, pyro 7 (scree x2, spire, fallingtower x4), reaper 20, paladin 23 (23 distinct crossings in 12 levels). REC: narrow each a tile
(or lower the landing a row) - a level pass per level; the < 2 px ones can be accepted.

## STORMHOLD walker (the "10% in 600 s" note)
Not reproduced, and not the reach model: every hero's own fill reaches all 13 Stormhold targets (batch81 trial, zip lines in).
level-walk storm knight 1 seed: master 237 s, walked 90%, measured 18%, 5 stuck; batch81 trial 284 s, walked 90%, measured 34%, 4 stuck.
Every stuck spot is the walker's HANDS: the iron key up the Bell Watch tower (299,20; the bot only fetches keys on its own floor) -> lockgate 346;
the brass key (41,24) likewise; climbing the rope NETs out of the 1-wide chimney slots (233,38); the zigzag one-way stair 484-499 rows 29-43;
dropping off the one-way plank over checkpoint 571 (572,26). REC: a small walker-hands lane (off-floor key fetch, NET climb, drop-through).

## Known limits
- The slide model covers DOWN-held slides; a game-wide slope momentum on a plain RUN downhill would need its own launch speed (SLOPE MOMENTUM lane).
- Ksar: every fill stops at col 256 (a ksar verb the model does not follow) - its sweep sees 1 target. Ore Road 470 sits behind the ore wall (a verb).
- The hero sweep (C) only compares against what the shared fill reaches; where the hero model reaches MORE (Glass Sea), nothing is checked.

## QUESTIONS FOR DANIEL
1. The 23 TIGHT crossings above (12 levels): narrow each a tile / lower the landing (REC, one level pass), or accept a frame-perfect jump? Built: listed + gated, no level changed.
2. Make the per-hero model the default? REC: no - keep it opt-in with reach-heroes gating; revisit after the tight list is fixed. Built: opt-in.
3. Stormhold walker hands lane (sonnet, small)? REC: yes. Built: diagnosis only.
