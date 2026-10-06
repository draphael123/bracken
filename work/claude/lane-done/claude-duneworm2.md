# DUNEWORM2 report - claude/duneworm2 (base master 85e13368)

Brief (Daniel, 10-05): the Dune Worm is good in conception but "incredibly easy" next to the Djinn, and his invulnerability is "just
waiting". Do: no waiting-room invulnerability (B13, guard by angle B11), ~10-15% faster with tells >= 0.5 s, one more told attack, a bit
more health; land him at 50-60% (human bot, campaign level), no hero at 0, mash 0/6.

## What changed (src/dune-worm.js unless said)

1. **NO WAITING ROOM (B13) - HE GUARDS BY ANGLE (B11).** Before, every hero blow outside the tangle was a twentieth (the global chip:
   "A SCRATCH: WAIT FOR HIS OPENING") - you waited for the awning. Now he is a beast, not a puzzle: whenever he is up out of the sand he
   can be hurt.
   - His **crown plates** face you and **turn a blow from the front**: it CLANKS, sparks, flashes a ring and says **GO ROUND** (B10's turned-
     blow read; first three times a hint explains it) - main.js `dwPlated`.
   - The **hide behind the plates** takes a blow **whole**, and so does his **pale belly while he rears** (the spit's tell and the tail's
     tell) - from the front too.
   - **He turns**: a hero behind him for 0.5 s while he is up has him round to face her (told: the plates' scrape + sand thrown off him).
     So "go round" is a dance, not a parking spot.
   - Tangled in the awning (the player-made opening, kept - it is a verb of his level, the allowed kind of B13 immunity) he takes double
     from anywhere; its read is now B10's **gold ring + a timer bar** over him (was a green ring).
   - Only under the sand is he out of reach, and under the sand he is always attacking (ripple, sinkhole) - never resting.
   - The chip no longer applies to him: `duneworm` joined `OWN_WARD` in src/boss-greed.js (his plates are his own ward, like the
     Puppeteer's twentieth). Greed still counts outside the tangle, so the mash reprisal stands. A plate-turned blow counts nothing.
   - The sand smothers a burn when he goes under (main.js: it ticked through the sand before).
2. **A LITTLE FASTER: 12%.** Every beat x~0.88 (ripple track 1.0->0.88 s, ripple speed 150->170, commit speed 190->215, surfaced 1.2->1.0,
   spit tell 0.7->0.6, lunge tell 0.7->0.6, lunge 0.9->0.8, swallow tell 0.9->0.8, swallow 1.8->1.6, under 0.4->0.35, dive 0.5->0.44,
   breach 0.35->0.3). The ripple's commit (0.45 s, his signature's read) is unchanged; every tell >= 0.5 s (asserted in tools/caravan.mjs).
3. **ONE MORE ATTACK: THE TAIL (!!, jump).** He surfaces, rears (belly bare), and his tail breaks the sand ~90 px PAST you on the far side
   from his head (0.65 s tell: the tail rising under a red !! with the JUMP lane, its own sound `wormTail`, "HIS TAIL: JUMP IT, AND
   AGAIN"); then it scythes along the floor through you to his head (0.45 s) and whips back out (0.38 s). Low (16 px): jump it, twice.
   It comes twice a round (the chain is ripple x5 + spit, lunge, swallow, tail, tail, shuffled each round). marks.js: MARK/BY_HAND `!!`,
   ANSWER `jump`, HEIGHT `low`.
   - Plus a follow-through on his lunge, **THE CRASH**: where he comes down, two low waves of sand run out along the floor (120 px/s,
     0.9 s) - told by the lunge's own shadow; jump them or stand clear.
4. **MORE HEALTH + WEIGHT.** hp 1100 -> **2600** and heavier blows (breach/lunge/bite 30/30/32 -> 64, spit 9 -> 14, tail 72, crash 58).
   Big number, but read it against the old fight: at 1100 almost every blow he took was a twentieth; now most blows behind him land
   whole. See question 1.

## Numbers (campaign level L29, `PORT=8642 node tools/harnesscard-rates.mjs caravan --mode=new --seeds=20 --secs=240`, normal health)

| | knight | warden | pyro | overall | median fight |
|---|---|---|---|---|---|
| before (botlevel, master 2423ff42, 6 seeds) | 6/6 | 1/6 | 6/6 | 13/18 = 72% | ~110 s |
| **after (20 seeds)** | **9/20** | **7/20** | **20/20** | **36/60 = 60%** | **133 s** |

In band (50-60%, top edge), no hero at 0. Noise at n=20/hero is about +-11 points per hero. Stopped retuning once in band (house rule).
Pyro is untouched by him (see question 2). The Djinn on the same tool was knight 4/6, warden 1/6, pyro 5/6 = 56%: the shape is the same
(warden weakest, pyro strongest); the Worm now kills ~the same share of knights and wardens.

Tuning path (8-seed checks, each L29): plates only, hp 1100 -> knight 4/4 in 40 s with 0 damage taken; + turn, hp 1500 -> 6/6; the
bot was then reading lunge/swallow/spit on the frame they began (see LAB below) - fixed; + the tail's return and the crash, hp 1700-2500,
heavier blows -> 75-88%; tail twice a round -> 62%; hp 2350 (20 seeds) 68%; hp 2600 + blows +10% (20 seeds) 60%.

## LAB BOT (src/lab.js, the Dune Worm branch) - so the measure is the human bot, not a frame-perfect one

- Goes ROUND him (his plates face it), swings only from behind, on his reared belly, or while he is tangled.
- Jumps the tail (there and back) and the crash's waves at a distance a hand judges (18-64 px, a fresh guess each time), and holds its
  swing while a low blow is coming (a swing it could not jump out of).
- Answers the lunge's shadow, the sinkhole and the spit **0.25 s after they show** (the breach's commit already waited 12 frames; these
  three were answered on the frame they began - 0 ms - which no human does). Waves too. Keeps 84 px clear of his landing (was 60, inside
  the crash).
- Stops a blow short of his greed (the bosun's rule), and steps out of the ring.

## Checks

GREEN on this branch: caravan (Node), dune-worm (page), boss-greed, tells, answer-tags, hint-shown, audio-assets, boss-openings, slopes-trace (unchanged), desert-foes, caravan-walk, architecture, checkpoints, skins, dangling-paths, boss-fight-end (green alone; one run lost its dev server under load), npc-removal, mash-gate, zoom-coverage, weapon-skins. Not run: the full suite (coordinator).

New assertions (each fails on master's dune-worm.js: no angle, no tail, four tells): caravan.mjs - plates by angle (front 0 / back 1 /
reared 1 / turned round), B13 "he is up and hittable from behind 71% of the fight, and out of reach only in a tell he is running", the 12%
speed-up with every tell >= 0.5 s, THE TAIL told 90 px past you, crossing twice, THE CRASH's two waves; dune-worm.mjs - the tail forced
and landed with its !! and sound, and the plates through the game's own blow (hurtAs: front 0, back 20 of 20 - no chip, reared 20,
tangled 40, under 0). The old "four told attacks" / "WORM_TELLS.length === 4" / "all three of spit, lunge and swallow" lines became five /
5 / all four (+ the tail twice) - the brief's new attack, not a loosened test.

MASH: re-stamped via tools/mash-bot.mjs, level first then boss (docs/mash-bot.json, caravan only). Boss: **0/6** (knight/warden/pyro x2, all dead in 19-34 s, boss left 93-99%). Level: best mash hero knight lowest hp 0%, 1 death. caravan: boss holds (0/6 mash wins); level: best mash hero knight lowest hp 0%, 1 deaths, walked 100%, 4 rides, 1 pulls, 49 lifts, HELD in a room it could not finish (8 lifts put back): holds.

## UNVERIFIED

- **Daniel's playtest gate** (B9) - not played by a human. The plate read (GO ROUND clank + ring), the turn's scrape and the tail art are
  procedural and were not screenshot-reviewed; the sprite has no new frames (the tail tell reuses the recoil frame, the tail itself is
  drawn as rings like the lunge's arc).
- marks.js's generated MARK table re-flowed by one row (`node tools/tells.mjs --write`): a merge conflict there is fixed by re-running it.

## QUESTIONS FOR DANIEL (built: the recommendation)

1. **hp 1100 -> 2600 is not "a bit more".** Rec (built): keep it - with the plates his old 1100 was paid at a twentieth per blow; now a blow
   from behind lands whole, so the same hp died in 40 s. The fight is 133 s median (standard 90-150). Alternative: 2000 hp and heavier
   blows still (tail ~90) - shorter, deadlier.
2. **Pyro 20/20.** Her floaty jump clears the tail and waves whatever her timing. Rec (built): leave it (the Djinn has the same spread;
   bosses are judged overall + no zero). Alternative: a pyro-specific answer (e.g. the spit's grit dousing her heat) - a kit question.
3. **The turn (0.5 s behind him and he faces you)** keeps "go round" a dance. Rec: keep. If it reads as cheap in your playtest, 0.8 s.
4. **The touch rule** (touching him never hurts) is kept, so you walk through him to get behind. Rec: keep (a roll-through cost would
   make the warden's fight longer still).
5. **The lab bot's 0.25 s reaction on lunge/swallow/spit** (they were answered in 0 ms) - a measuring fix, called out so the coordinator
   can apply the same beat to other bosses' branches. Rec: adopt it as the house rule for every branch.

## Music
No music change (he keeps "Negev Fight Loop" - Dizzy Crow).

## Note
src/main.js MEDALS.caravan still assumes ~110 s for him; the lab median is now 133 s (an estimate either way - left for the medals pass).
