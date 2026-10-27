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

## LAUNCHED CARTS (Daniel 10-26 14:35: launch-only, the player never rides)

Branch claude/oreroadminor, on top of the minor pass. NOT merged, NOT deployed. Commit 03daa004 (+ the mash restamp / shots commit after it).

### What changed
- New pure module `src/ore-carts.js` (the rail physics: shove, roll, ram, barricade, buffer, trip, spent -> chain hauls it home; `dryRun` for tools), `src/ore-carts-art.js` (browser-only art: rail, buffers, the cart, the barricade, flying planks, the trip lever+chain; reuses the Deep Rails' `rail`, `buffer`, `tub` from src/redraw/minecart_art.js), hands inside `src/ore-works.js` (OWK), data in `src/ore-road.js` (`OR.CARTS`, `L.oreWorks.carts`), small ctx hooks in main.js (foes, hurtFoe, jetBox, openCell/mendCell, art).
- THE VERB: ATTACK the cart (a running hit rolls it harder, a second hit on a rolling cart speeds it) and it rolls down its short rail, away from you. It is NOT a mover: you cannot stand on it, ride it or be hurt by it. A launched cart: RAMS foes whose feet are on the rail (24 dmg, throws them, keeps 84% of its speed), SMASHES a barricade at >= 100 px/s, and at the end of the line its buffer TRIPS a chain that pulls a cold lamp. A spent cart is hauled home by its chain after 2.6 s; a weak roll thuds ("TOO SLOW: BACK UP AND SHOVE IT") and the barricade stands; a death resets cart, rail and barricade (OWK.reset after mendAll). Sounds: rolling rumble (cartRoll ticks while it rolls), wheel squeal (screech) at a launch and a stop, clank/stone/heavy/thud on a ram, smash or trip.
- TEACH, THE ORE STORE (sorting floor, c164-182): a rail with the cart a few tiles west and a barred rock store at its end (barricade = 2 cells of real rock at build time, drawn as a timber barricade with straps, hazard band and plate; a blade does nothing to it). A standing shove breaks it from the cart's home. Inside: a purse (3 coins that were already on the floor there + 6 more) and the rail runs on to a buffer. Sign at c163. Safe, obvious, nothing hostile near. The store is 3 rows tall (2-row hollow, the hero is 14 px) with a 1-row roof: the route (reach, pacing) is unchanged apart from hopping the roof (first try, 4 rows tall, moved the route through the ambush room and tripped the checkpoint rule: shrunk).
- TEST, THE SORTING RAIL (middle deck, the dark stretch, c179-189): a cart on the deck, the tippler's post (c186) stands ON its rail (a ram), and at the east end a lever with a chain climbs to a SECOND cold lamp ('deck2') in the same dark stretch: a launched cart trips it and the whole stretch lights for good (either lamp lights the stretch; marks persist through a death). Sign at c177. The down line's goblin riders step off at the deck's east end and walk this rail, so the cart rams them too.
- ARROWS and the PYRO FLARE: a ranger's arrow in flight and the pyromancer's flame jet now strike a cold lamp (ember/blade/rock already did). Lamp 'deck2' labels itself "A COLD LAMP: SHOVE THE CART".
- No shrine/checkpoint added. No relic/silver added. Winchmaster and the arena untouched (boss-rates not re-run).
- Tools: `tools/ore-road.mjs` gained a THE LAUNCHED CARTS block (16 checks: a standing shove breaks the barricade, a weak one thuds, a spent cart homes (no soft-lock), the test rail trips even after a ram, lamp over the rail's end, a foe on the rail, no cart is a mover and the hands never board the hero, hint lines routed); new `tools/oreroadcarts-shots.mjs`; `src/hint-lines.js` +6 lines.

### Pictures (work/oreroadminor/, 3x or cropped)
- BEFORE (ab19e935, same spots, no cart): `carts-before/01-teach-rest.png`, `02-teach-rest-close`, `05-test-dark-rest.png`, `06-test-dark-close.png`.
- AFTER, teach: `carts/01-teach-rest.png`, `02-teach-rest-close`, `03-cart-closeup` (12x), `04-barricade-closeup` (12x), `05/06-teach-roll`, `07/08/09-teach-smash-a/b/c` (the barricade breaking, planks flying, the cart rolling in), `10-teach-smash`, `11/12-teach-open` (the store open, purse, rail).
- AFTER, test: `13/14-test-dark-rest/close`, `15/16-test-roll`, `17/18-test-lit` (the tippler rammed, chain pulled, lamp lit, stretch lit), `19-test-chain`.

### Checks (each alone, PORT=6604, RAM >= 1500 MB free before each browser, release gate had started 14:15)
ore-road (node, incl. the 16 new cart checks) PASS; ore-exam PASS; ore-ride PASS; ore-work PASS; reach-heroes oreroad 0 misses for all 9 heroes (pacing route 299 tiles, 3/3 checkpoints); stuck static + runtime PASS; signs (1071, all 2 lines) PASS; level-quality oreroad: misses the bar on `bands` only (pre-existing on master; every other row ok); solid-islands PASS; homepaths PASS; hint-shown PASS; floaters PASS; headless floats 50 levels / 3149 sprites PASS; mash-bot level rows knight/warden/pyro all die (0% hp), boss rows 0/6 mash wins, docs/mash-bot.json restamped level THEN boss; mobile-perf oreroad 51.8 fps (budget OK) on a busy PC; page probes in tools/oreroadcarts-shots.mjs (cart rolls, smashes, resets on W.reset, comes home, bumps when weak; arrow lights the deck lamp; the jet lights the house lamp; the cart trips the deck2 chain and lights the stretch). Not run: boss-rates winchmaster (arena unchanged), runtimefloats (>10 min), level1-pilot (its hash is stale, noted by level-quality as info).

### QUESTIONS FOR DANIEL (rec + what I built)
1. "TIME the launch between the moving buckets": every bucket line sweeps flat over the platform it serves, so a rail inside a lane is always crossed by a bucket (nothing to time) and the pylons/pillars are too small and busy. Rec/built: the TEST rail is on the dark sorting deck where the down line's goblin riders arrive and the tippler stands on the rail, so the timing is the ram and the dark, not a bucket collision. If you want a literal bucket-timed cart (a cart a moving bucket knocks off the rail), it needs a lane built for it (e.g. on the Winch House entry deck beside the ore shaft): say so and a later pass adds it.
2. Required use (A4): both cart uses are OPTIONAL (a purse; a third way to light the deck) because pilots/mash/reach bots cannot shove a cart, and a required barricade would stall them. Rec: leave optional; the existing wall at c468 stays the one required break.
3. The barricades are not struck by a blade (cart only), so they are not in `L.walls` (ore-exam pins 2-4 walls) and use their own cells with the same mend-on-death rule.
4. Whatsnew lines for the deploy (not added): "ORE ROAD: shove the ore carts - they roll down their rails, ram what stands on them and break the barricade at the end" / "ORE ROAD: a cart at the end of its rail pulls a chain and lights the dark sorting deck" / "ORE ROAD: arrows and the pyromancer's flame now light the mine lamps".
