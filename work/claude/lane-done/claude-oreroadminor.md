# claude/oreroadminor - THE ORE ROAD, MINOR PASS (Daniel 10-26: "a good level, additions only")

Branch `claude/oreroadminor` off master 72bb1c7b (BATCH122 live). NOT merged, NOT deployed. Scope was Daniel's three picks only (no carts, no riders, no cable lash, no shrines).

## What changed

### 1. DARK STRETCHES + LAMPS YOU STRIKE (new `src/ore-works.js`; data in `src/ore-road.js` buildOreRoad -> `L.oreWorks`; reuses the engine's own dark pass, `L.darkZones` + `hole()`, and the existing `minerlamp` props)
- Three dark stretches (zone dark 0.84 until lit, falls back to the level's own 0.34 when lit):
  - THE LOADING HOUSE (yard, c52-67) - TAUGHT SAFE: a cold hanging lamp at chest height, a sword/ember strikes it. Sign at c46.
  - THE SORTING DECK (tower middle deck, c141-196) - TESTED: the lamp hangs under the top deck, out of sword reach; take a rock from the pile at c148 (E) and throw it up (ATTACK). Sign at c145.
  - THE STEEP LINE (c354-408) - REMIXED: the lamp hangs over the brakeman's pillar edge (c352); throw a rock from the pillar (pile at c348), light it to read the skips. The pillar-B lamps stay lit as islands. Sign at c347.
- A lit lamp lights its stretch FOR GOOD (a mark `orelamp:<id>`, kept through a death) and the dim stretches' own pit lamps catch one after another (ripple by distance). Their pit lamps start out (a pit lamp's light reaches through a floor).
- READABLE: a dark stretch glints on every standable edge (run starts/ends/every 5th tile), every rope top, every skip's ore (gold; a RUST skip glints red), the hero carries a slightly wider lamp-hand (r52), and a cold lamp shows one dull ember + a "A COLD LAMP: STRIKE IT" label when near. Glints are drawn OVER the dark pass. No blind jump.
- Strikes: blade (attackBox), an ember (pyro), or a thrown ORE ROCK.

### 2. ORE ROCKS + COUNTERWEIGHT LIFTS (`src/ore-works.js`, mover kind `orecw`; reuses the existing `orerock` carry/throw kind + told arc from `src/carry-throw.js`)
- Ore piles (E takes a rock, ATTACK throws it, the told arc's ring closes on a lamp or a lift bucket, a blow drops it, E sets it down). The rock stays outside the drum house (the Winchmaster keeps his own rocks off his skips).
- Two COUNTERWEIGHT LIFTS in the sorting tower, standing on what is already there (NO new solid, so the route and pacing are unchanged - a first design with stone piers blocked the floor route and was dropped):
  - TEACH (c160): floor -> middle deck, ONE rock, flat throw. Sign at c154, pile at c155.
  - TEST (c170): middle deck -> top deck, TWO rocks, the bucket hangs out of a flat throw's reach (hold UP to lob), the gauge holds 16 s. Sign at c164.
  - Drawn: iron post + beam, two sheaves, rope over them down to a weighted bucket (the high one) and a studded pan (the low one you stand on), brass ring, a WEIGHT GAUGE tube on the post (one pip a rock; once up it runs down as the hold runs out). Loaded -> the pan rises with a 2:1 block; the ore tips out when the gauge empties and the pan comes home. A hero standing on the pan is carried (the engine only catches a falling one).
  - Landing purses: 4 coins.

### 3. WINCHMASTER (`src/winchmaster.js`)
- The SEND (the launched platform rush): speed 300 -> 210 px/s (30% slower); tell 0.8 s -> 1.1 s (the longest that still lets SEND and THE HOOK alternate on one rider - `sendMin` follows it); clearer: the dashed line fills out from the drum as the tell runs, chevrons march down it the way the bucket will go, the drum mouth flares faster and faster.
- ORE ARMOUR redrawn as armour on his body (ART ONLY, no number moved): riveted ore slabs (breastplate, two pauldrons, backplate, belly slab, two thigh guards) with lit edge, gold seam and rivets, held by a leather cross-strap, a belt with a brass buckle and thigh bands; packing slides the slabs on one by one; blades CRACK it (`armHit`: more seams per chip); a rock or a jam SHATTERS it and the slabs fall away turning (1.2 s) in a dust puff.

### Tools/data touched
`tools/ore-road.mjs` (the rotation check's rider distance follows `sendMin`; the zone check allows the three ore-works zones), `src/hint-lines.js` (5 routed lines), `docs/mash-bot.json` (restamped), new `tools/oreroadminor-shots.mjs` + `tools/oreroadminor-boss-shots.mjs`.
Main.js hooks (small): import/construct/reset/update/E-press/draw/holes for `OWK`, `orecw` skipped in the mover loops, `winchChip` on a blade on his ore.

## Before / after pictures (3x, `work/oreroadminor/`)
- BEFORE (master): `before/01-house-dark.png`, `before/02-house-lit.png` (same spot: the loading house was simply lit), `before/03-deck-dark.png`, `before/05-lift-spot.png`, `before/07-steep-dark.png`, `before-boss/01-armoured.png`, `before-boss/02-plating-half.png`, `before-boss/03-send-tell-wide.png`.
- AFTER: `after/01-house-dark.png` -> `after/02-house-lit.png`; `after/03-deck-dark.png` -> `after/04-deck-lit.png`; lifts `after/05-lift-teach-rest.png`, `after/06-lift-test-rest.png`, `after/07-lift-test-landing.png`, `after/08-lift-teach-top.png`; steep `after/09-steep-edge.png`, `after/10-steep-dark.png`, `after/11-steep-lit.png`.
- AFTER boss: `after-boss/01-armoured.png`, `02-plating-half`, `04-cracked-1`, `05-cracked-3`, `06/07/08-shatter-a/b/c`, `03-send-tell-wide.png`.

## Rates (`tools/boss-rates.mjs oreroad --profile=human`, practiced, flasks = kit, campaign L15, normal health, human bot)
| | knight | warden | pyro | all |
|---|---|---|---|---|
| master, seeds 1-12 | 6/12 | 9/12 | 10/12 | 69% in band |
| this branch, seeds 1-12 | 7/12 | 8/12 | 12/12 | 75% (+5) |
| this branch, seeds 13-24 | 9/12 | 7/12 | 8/12 | 67% in band |
| this branch, seeds 1-24 | 16/24 | 15/24 | 20/24 | 71% (51/72) |
Judgement: the slower rush moved it +2 points on the pooled n=72 against master's 69% (noise at this n is +-8); on the band edge but no re-tune was applied (the brief says re-tune only if it moves out; the first 36 read +5 and the second 36 read in band). The other six heroes: geomancer 1/4, ranger 3/4, berserker 2/4, reaper 2/4, paladin 5/12, pirate 7/12 (master n=4: ge 2, ra 3, be 3, pa 0, pi 1, re 3) - no hero at 0 once n grows (n=4 zeros hit the pirate here and the paladin on master). Dry not measured.
mash-bot: level rows knight/warden/pyro all die (lowest hp 0%), boss rows 0/6 mash wins; `docs/mash-bot.json` restamped (level, then boss).

## Checks (each alone, PORT=6604, RAM >= 1500 MB before each browser)
- `node tools/ore-road.mjs` PASS (all level + Winchmaster checks); `ore-exam`, `ore-ride`, `ore-work` PASS; `winchmaster-art` sprite sheet untouched.
- level-quality oreroad: MISSES THE BAR on `bands` (6 bands, 36% second-height) - IDENTICAL on master (pre-existing, not touched; every other row ok).
- reach-heroes oreroad: 0 misses for all 9 heroes (no solid was added). pacing route unchanged (298 tiles, 3/3 checkpoints).
- stuck (static + runtime) PASS, signs (1069, all 2 lines) PASS, textfit bestiary --strict PASS (0 findings), hint-shown PASS (5 lines routed in `src/hint-lines.js`), homepaths PASS, whatsnew PASS, floaters PASS, headless floats/pixels PASS (50 levels, 3147 sprites), `oreroad-walk` identical to master (STUCK@72 pre-existing), floating-geometry reports the level's old groups (not gated).
- mobile-perf oreroad: noisy PC (other lanes running). This branch: 37.4 fps (a miss of the 40-fps budget) then 45.6 (pass); master on the same PC: 55.4 then 36.5 (also a miss); this branch with the new module switched off: 44.3. The spread is load, not the darkness: no new full-screen pass (the dark pass already ran in this level), the module adds a few holes and small rects. Re-run on a quiet PC before deploy if in doubt.

## QUESTIONS FOR DANIEL (rec + what I built)
1. Required use (design standard A4: one REQUIRED use before the boss). Rec: leave the lamps and lifts OPTIONAL (a lamp makes the stretch easy, the lifts are shortcuts with a purse) - a required lift needs new solid footing, and the first try blocked the sorting floor's route. Built: optional. Say if you want the steep lamp required (the stretch would then have no lit islands).
2. Rangers' arrows / pyro's jet do not strike a lamp (blade, ember, rock only). Rec: add arrows later. Built: no.
3. level-quality `bands` is red on master already. Rec: a later pass adds a few jumpable ledges over the long flat floors; not done here (additions that don't change routes).
4. Whatsnew lines for the deploy (not added, the coordinator batches): "ORE ROAD: three stretches of the mine now go dark - strike or throw a rock at the cold lamp to light them for good" / "ORE ROAD: take ore rocks from the piles (E) and throw them into the counterweight lifts in the sorting tower" / "THE WINCHMASTER: his launched bucket is 30% slower with a longer tell; his ore armour is redrawn".
