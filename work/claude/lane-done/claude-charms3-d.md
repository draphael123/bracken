# charms3-d - the eight dark charms are READY TO SHIP (flag still false) + 7 further charms proposed
Branch `claude/charms3-d` off origin/master 7699a5ffb. Worktree `wt-charms3`. Not merged, not deployed. `CHARMS2_SHIP` stays `false`. Daniel's folder: `bracken-scratch/desktop-out/charms3/` (icon-sheet.png, shop shots, salt shots, charms3-results.json).

## What was owed, and what I found
1. **ICON SHEET** (`icon-sheet.png`, from the real `art.js bakeCharms` in a browser, 1x + 4x, name / price / unlock / effect). Findings:
   - **RUNNER'S RIBBON (one of the shop's original six) has NO icon**: the shop draws the generic bolt for it today. Fixed (blue award rosette with two tails). This changes the live shop (flag off) by one icon; no logic.
   - Four of the eight new icons read badly and were redrawn: THORN (green stem read as a cactus; now a green bramble ring with cream thorns), GAMBLER'S COIN (was LUCKY's gold disc with a red stripe; now two coins, red pip, no cord), SALT (round potion-looking flask with a checker; now a shaker: silver cap with holes, white-filled jar), PILGRIM'S KNOT (yellow bell; now a woven rope ball with loop and two tails).
   - Still weak, honestly: **THORN** at 1x is a dotted green ring (a "spiked wreath", not a bramble; best of three tries), **PILGRIM'S KNOT** reads as a rope ball / pine cone more than a knot, **SALT** still reads as a jar before a shaker. STONE (grey stone on a cord with a hole), HOUND'S TOOTH (fang), QUIET BOOTS (boot), LANTERN (lantern), GAMBLER (coins) read at 1x.
2. **SHOP SMOKE, flag ON** (new tool `tools/charms3.mjs`; the flag is `window.__CHARMS2 = true`, a page-only switch in `src/charms2.js`, plus env `BRACKEN_CHARMS2=1` in `tools/cdp.mjs` so textfit can run it). 33 checks, all pass. 15 rows (NONE + 14); the eight are locked on a fresh save and the panel says what to do ('FALL 10 TIMES TO EARN IT'); with every gate met all eight are buyable (RUNNER'S RIBBON stays locked at 45 medals); buy THORN pays 80 and wears it; buying STONE swaps it in (THORN kept, not worn); swapping back to an owned charm is free; exactly one worn; NONE takes it off; a locked row cannot be bought; one charm per hero holds (knight THORN, pyromancer QUIET, each comes back on swap).
   - Desktop 1280x720: rows fit (9 visible, `v`/`^` marks, price + coin right-aligned, no clipping); bottom (PILGRIM'S KNOT) and the long-description panel fit.
   - Phone 844x390 landscape (the repo's phone viewport, touch on): same 9-row list at integer scale 2 with the on-screen BACK / MORE / SELECT pads clear of the rows; a touch on the ninth row selects it. **Portrait 390x844 shows the "TURN IT SIDEWAYS" screen** (the game is landscape only), captured once as `phone-upright-rotate-screen.png`; the shop is not reachable upright.
   - textfit **store scope with the flag ON** (`BRACKEN_CHARMS2=1 node tools/textfit.mjs store`, 900 screens, 9 heroes x map/menu x all tabs incl. the 15-row CHARMS tab): OFFCENTRE 0 OVERFLOW 0 OFFSCREEN 0 CLIPPED 0 TRUNCATED 0 COVERS 0 COLLIDE 0 OVERDRAWN 0 SMUDGE 0 ERROR 0. (It took 5 s; the 30 min was for the whole suite.)
3. **EACH EFFECT IN PLAY** (probes in tools/charms3.mjs, real level, real damage/xp/coin paths): all PASS.
   - THORN: melee blow returns 1; 0 on a boss-flagged foe (maxHp), 0 from a bolt 9 tiles off, 0 from a hazard (geo), 0 without the charm.
   - STONE: blows taking <=10 hp (10% of max, floor 6, after the armour chain) do not throw you; 11 and 25 still do; without it every blow throws.
   - HOUND: first blow 10 -> 12, second 10, mini 10, boss 10, no charm 10.
   - GAMBLER: 20 coins pay 25; the same 20-point blow costs 18 vs 16 (+10%).
   - QUIET: notice radius 164/236, 136/196, 152/216 on hound / drone / sapper = 0.69-0.70.
   - LANTERN: glints within 5 tiles of an Ore Road wall, none at 8 tiles, none without.
   - PILGRIM: gap 18: 230 vs 200; gap 5: 46 vs 40; gap 4 and 2: no bonus; a hero pushed 1e9 xp stops at the cap (83400).
   - SALT: died with a purse (wood), purse off screen right: with SALT the right-edge strip differs from the same frame with another charm (88 px vs frame noise 12); on the world map the bag shows by its wood. See the two fixes below.
4. **SAVE ROUND TRIP**: an old save (iron) loads with the flag on and off; a save wearing THORN with c2 migrates + validates with the flag on; with the flag off THORN reads as nothing, no rows, nothing written, the save keeps the charm id.

## Two bugs found and fixed (both only visible with the flag on)
- **LANTERN's gate could never be earned.** "find 10 secrets" counted breakable walls of kind 'secret'; the game has TWO (harvest-fair cellars). Replaced by **'find 12 silver'** (feat `silver:12`, reads the persisted silver bitmask, `silverTotal()`; 3 hide in every wood), so it is reachable, says what to do, and a veteran's silver already counts. The secret-wall counter and its hook in breakWall are removed.
- **SALT's world-map bag hid behind the hero's own token** (at node +8,-6, 55-80% alpha; barely visible). Now left of the node at -13,-8, 85-100%. Looked at in a screenshot: clearly visible.

## THE UNLOCK GATES (all reachable, all say what to do)
| charm | gate (shop words) | reachable? |
|---|---|---|
| THORN | clear the Lumber Trail | the first wood |
| STONE | clear the Stockade | real level, after Fenroad |
| HOUND'S TOOTH | win 15 medals | 171 medals exist, ~6 woods at gold/silver |
| GAMBLER'S COIN | clear Gale Moor | real level, after the Monastery |
| SALT | fall 10 times | see below |
| QUIET BOOTS | clear the Monastery | real level |
| LANTERN | find 12 silver (was 10 secrets: unreachable) | 3 silver per wood |
| PILGRIM'S KNOT | own 3 heroes | heroes are 10 silver each: two buys (or any device-roster hero) |
shop-gates.mjs still passes (every gate names a real level).

## VETERAN COUNTERS: the answer
Only **falls** needed a counter, and it started at the flip (`PROG.c2.deaths`, written only with the flag on): a 50-wood veteran would have seen "0 OF 10 FALLS". There is no lifetime death count anywhere in the save (the `deaths` fields in main.js are per-run scores). Built the cheap fair option: until the counter exists (and when it is first written) the save is credited **one fall per cleared level, capped at 9** (`creditDeaths`, written once, never grows), so a veteran sees "9 OF 10 FALLS" and still has to fall once; a brand-new save is credited 0. Silver and hero count were never counters (they read the save), so veterans already count for those. `tools/charms2.mjs` asserts the credit, the cap, "written once" and a flag-off no-op.

## What I could NOT prove / caveats
- QUIET BOOTS: proven on hound, drone, sapper. The sprig does NOT change (it is not one of the 7 stock chase sites), and my movement probe was inconclusive on brute / archer / shaman. The most common foes may ignore the boots; Daniel should know "foes notice you 30% later" is true of some foes, not all. Not audited across the roster.
- SALT in-level edge bag is faint and clamps to the bottom of the screen when the purse is below you; it is there (pixel diff, screenshot) but modest. The "glows bigger" halo is not distinguishable by eye in my crops.
- THORN vs a REAL boss: tested with the `maxHp` flag the hook reads (`!tw.maxHp`), not a spawned boss. HOUND the same for boss and mini (maxHp / mini flags).
- Textfit ran the store scope only, not the other 40 scopes. check.mjs and the gates were not run (per the brief).

## Checks run (all exit 0)
node: charms2 (extended), unlocks, shop-gates, traits, talents, coop-progress, progression, architecture; `node --check` main/art/charms2/store/unlocks. Browser, one at a time: tools/charms3.mjs (33 checks), tools/store.mjs, tools/store-ui.mjs (flag off, shipped state), textfit store scope with the flag on. Red or not run: none red; check.mjs and the full textfit not run.

## What changed in the repo
`src/charms2.js` (page-only flag switch; feat kinds deaths / silver / heroes; veteran credit; secrets counter removed), `src/art.js` (ribbon icon; thorn, gambler, salt, pilgrim redrawn), `src/main.js` (silver fact in the two featDone / featProgress sites; breakWall hook removed; salt map bag position), `src/unlocks.js` + `src/store.js` (feat words), `tools/charms2.mjs` (updated), NEW `tools/charms3.mjs`, NEW `tools/charms3-sheet.mjs`, `tools/cdp.mjs` (+1 line: `BRACKEN_CHARMS2=1`).

## QUESTIONS (rec first; built where cheap, lanes never block)
1. Flip `CHARMS2_SHIP` now? REC: yes after Daniel looks at icon-sheet.png and accepts THORN / PILGRIM as "good enough"; independent of TRAITS_SHIP. Ship note: the flip adds the RUNNER'S RIBBON icon too.
2. Replace LANTERN's gate with silver:12 (built)? REC yes. The alternative, more secret walls, is level work.
3. Veteran credit = one fall per cleared level, capped at 9 (built)? REC yes; raise the cap to 10 if Daniel wants veterans to get SALT free (it is a 40-gold comfort charm).
4. QUIET BOOTS reaching the whole roster? REC: a follow-up lane that routes every chase check through `qm()`; out of scope here.

# PROPOSAL: further charms (design only, nothing built)
## What the 14 cover
| lane | charms |
|---|---|
| income | LUCKY (gold drifts in), GAMBLER (+25% gold, +10% taken) |
| survival | IRON (-20% taken), HEART (kill heals 3), STONE (small blows do not throw) |
| offence | HOUND (first blow +15%), THORN (melee attacker takes 1) |
| movement | FEATHER (jump higher), SWIFT (run faster) |
| clock | RIBBON (medal clock 10% slower) |
| exploration / info | LANTERN (walls glint), SALT (purse shown) |
| stealth | QUIET (foes notice 30% later) |
| progression | PILGRIM (+15% xp when behind) |
Not covered: finding **silver and loose pickups** (only walls glint), **navigation** when lost, **platforming forgiveness** (timing windows, as opposed to jump height), **camera / seeing ahead**, **hazard readability** (spikes, deadly water), **enemy information** (health of common foes), **co-op** (no charm touches it at all).
Shared traits that a charm must not duplicate (src/traits.js): AIR ROLL, LIGHT STEP, MOMENTUM, HANGING CUT, SLIPSTREAM, EXECUTIONER (and each hero's own passives). None of the seven below is a move, a hit rule or a damage rule.

## The seven (pick any; 1 and 4 are the cheapest)
| name | one-line effect | unlock | price | hook it needs | gap it fills |
|---|---|---|---|---|---|
| MAGPIE'S EYE | uncollected silver within 8 tiles shimmers, and a small pip rides the screen edge toward the nearest one | find 25 silver (reads `silverTotal()`, like LANTERN) | 70 | `silvers` array + the LANTERN glint block in wallsStep + saltEdge's edge drawing | silver is the game's secret reward and nothing helps find it |
| NORTH STAR | after 20 s without getting nearer the exit, a soft arrow at the screen edge points to it | win 30 medals | 60 | `gate` position + a no-progress timer in the play loop + saltEdge's arrow (levels with no gate show nothing) | lost in a big level (landmark lesson) |
| SURE FOOT | coyote time and jump buffer x1.5 | fall 25 times (reuses `c2.deaths`) | 80 | `MOVE.COYOTE` at main.js ~12133 and `P.jbuf` ~11962 | forgiveness without more jump height; note SET.assist already has COYOTE_ASSIST: keep the charm at or below that value |
| SCOUT'S CAP | the camera leads 30% further ahead of your motion | clear 10 levels | 60 | camera target `tx` at main.js ~33484 | seeing ahead on a 320-wide view (helps phones) |
| RED THREAD | spikes, deadly water and pit edges draw a thin pulsing red line within 5 tiles | clear the Monastery | 70 | `dcHazard(x, y)` (already answers "is this a hazard") + a draw pass | hazard readability in murky biomes; information, no power |
| BONE-READER | a foe you have hit shows a thin health bar (commons and elites; never a boss: they have their own) | log 25 beasts in the bestiary | 70 | foe draw + `PROG.beasts` for the unlock; needs a start-hp field on common foes (to check) | enemy information |
| BROTHERHOOD KNOT | a downed ally revives in 70% of the time and bleeds out 20% slower; nothing alone | finish one level in co-op (a new one-line flag) | 80 | the co-op `goDown` / bleed-out timer (BACK IN THE FIGHT) | co-op has no charm |
Rules kept: one charm per hero; none adds damage or mitigation; none is a flask charm; all work in play (not only in the shop).
## Considered and rejected
- **A shop discount (HAGGLER)**: swapping charms in the shop is free, so a player wears it to buy and wears the real one outside: a permanent 10% off for nothing. Any charm whose effect is only on the shop or a checkpoint has this hole.
- **Swim speed**: swim cap is 54 vs 58 on foot already; nothing to gain.
- **Death-cost insurance** (the first death in a level never drops the purse): that is mitigation of the death economy in all but name; too strong next to IRON.
- **Anything touching flasks**: bosses are tuned with flasks.
