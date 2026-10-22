# claude/stockade3 - THE STOCKADE: FLARES + LEVEL VISUALS + CHIEFTAIN HP x1.5 (Sonnet, base 5e44cddd)

Level hash `74827c0946e6` before AND after (art only). PORT 8783 only; no merge, no deploy.

## 1. THE FLARES - cause and fix
Daniel's photo is THE YARD / the kennel yard (tiles ~170-190: sign + ladder tower left, the lookout deck on two posts, "THE ARCHER CAPTAIN" elite plate).
- **Cause (not the blast FX, not a torch without a torch, not a screen-x seed):** the ground-dressing sprinkler (`src/main.js` resolveTiles, GROUND_KITS `stockade` = tuft / skullPost / tent / cart / rock / **campfire**) drops a
  scattered `campfire` decor at random tiles and pushed a light for each: `lights.push({x, y, r: 30})` with no flags. A dressing campfire is a 14 px flame; its light is a **30 px additive radial glow**
  (night pass: `glow()` at 0.32, `lighter`). The dice put three of them in a row (tiles 171/174/177 in the photo spot, 194/196 next) and they sat on top of the placed torches' r46 halos, so the sum read as big soft
  orange/pink blobs on the ground with hardly a flame in them. (28 of them in the level.) Verified by removing lights one class at a time in the page (exp A all / B no dressing fires / C no torches / D none).
- **Blast FX checked:** `drawBlast` blasts live on their own clock (`b.t < BLAST_LIFE[kind]`) and are filtered out - no leak. Torch glows always carry their torch sprite (`lt.torch && !lt.bare`). Not a seeding-by-screen-x bug.
- **Fix** (`src/main.js`, the one line): a dressing fire keeps a flame-sized glow (r 22) only when it is the only light within 8 tiles (no other dressing fire, no placed torch / brazier / lamp ent); next to another light it is a tight r 13 ember
  glow. The flame is drawn either way. It is the shared sprinkler, so every level that scatters campfires gets the rule; a load-sweep of every level (BK.load each, count lights flagged dress) found scattered-campfire lights only in the Stockade (28), so no other level has the leak.
- **Before / after PNG of the photo spot:** `work/claude/stockade3/flares/before-x176.png` -> `after-x176.png` (flare fix alone) and `after-final-x176.png` (with the new visuals); second angle `before-x186.png` / `after-x186.png` / `after-final-x186.png`.

## 2. LEVEL VISUALS (art only; no tile kind, hitbox or ent changed; dressing is `decor`, never hashed)
- `src/redraw/stockade3_backdrop.js` (new; wired in `drawWorld`'s backdrop chain as `L.stockade`): its own **dusk** (banded horizon glow + drifting violet cloud streaks), a **far palisade** (0.15: lashed wall runs, a barred gate now and
  then, watch towers with a lit deck + pennant; it thickens with the Yard and is unbroken by the kennels), **far fires with smoke columns**, and a **mid camp** (0.30: tents with a lit door, hide racks, kennel roofs, skull war-poles,
  log stacks, a nearer wall run with a torch, big towers). Zone-aware by `L.stockade.areas`. Near **smoke** (`drawSmoke`) rises from the dressing fires, braziers, cook spits and cauldrons.
- `src/redraw/stockade3_art.js` (new): the **palisade wall with depth** (4 px logs of uneven tone with dark seams, a lashed rail with its shadow every other row, stones and earth at the foot; tips = a back row of taller dark stakes behind pale cut
  points, every run different), **ground variety** baked into the surface tiles (trodden paths with ruts + boot scuffs + pebbles, wet mud with a puddle sheen) and **camp life** on the floor (stake clusters, kennels by the hounds, a war tent, chop
  blocks, wood piles, stretched hides, bone scatter, a water trough), all seeded and spaced away from anything placed.
- `index.html`: two modulepreload lines. Before/after sheets: `work/claude/stockade3/visuals-before/` and `visuals-after/` (x20 x90 x150 x176 x230 x300 x350).
- mobile-perf (4x CPU, 915x412 phone, scene `stockade`): **51.1 fps** (p95 18.5 ms, busy 13.4 ms/frame), budget >= 40: green.

## 3. CHIEFTAIN HP x1.5 (Daniel's explicit call, brief "STOCKADE 3"): `EHP.chief` 390 -> **585** (src/main.js). Nothing else about him changed.
Measured at his campaign level (L3), normal health, profile human, practiced, via `tools/boss-rates.mjs stockade`:
| build | knight | warden | pyro | all |
|---|---|---|---|---|
| 390, WITH flasks (n=12 each, run today for comparison) | 10/12 | 9/12 | 4/12 | 23/36 = 64% (in band) |
| **585, WITH flasks (n=12 each)** | **5/12** | **11/12** | **2/12** | **18/36 = 50%** (band 60-70: LOW -10) |
| **585, DRY (human+dry; n=6 each, knight s4 hung and was killed: 5 fights)** | 2/5 | 4/6 | **0/6** | 6/17 |
| mash bot (boss, 2 seeds x 3 heroes, written to docs/mash-bot.json) | 0/2 | 0/2 | 0/2 | **0/6** - mash still loses |
- **FLAG: pyro is under 2/6 - 2/12 with flasks and 0/6 dry** (it was already the weakest at 390: 4/12). Knight dropped hardest (10/12 -> 5/12). Per Daniel's call the hp is NOT undone; the band is read as overridden.
- Mash row re-stamped (`docs/mash-bot.json`, boss part only; carryRows kept the rest). No boss-hp assertion/row existed for the Chieftain (searched tools/, docs/, src/): nothing else to update.
- Checks that touch him: chief3 (horn, kegs, tower, barrel verb), stockade-horns, stockade2: all exit 0.

## CHECKS (PORT 8783, this tree)
level hash same (`74827c0946e6`); dressing (incl. "no sprinkled decoration within three tiles of a fire"); signs; solid-islands (ok); level-quality (every gated level clears); chief3 / stockade-horns / stockade2 (green);
mash-gate: 1 FAIL = `oreroad: the level changed since the mash bot ran` - **pre-existing on master 5e44cddd** (same output run in the master tree), not this lane; mobile-perf stockade 51.1 fps.
Not run: the full suite (nightly), mark-integrity chief (timed out at my 115 s cap), pixels.

## QUESTIONS FOR DANIEL
1. Pyro at the Chieftain is 2/12 with flasks (0/6 dry) at 585 hp (4/12 at 390), knight 5/12. Built (rec, as you said): hp x1.5, nothing undone. If you want the band back without un-doing the hp, the cheaper lever is pyro-friendly: give the horn opening a little more time, or the kegs a little less sting - not touched.
2. The warden is now the strongest hero here (11/12). Fine, or should the horn opening favour melee less? Not touched.
