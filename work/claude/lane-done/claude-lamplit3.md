# claude/lamplit3 (opus) - THE LAMPLIT STREET 3: geometry + verb rework (BUILD PHASE)

Brief: scratch/brief-lamplit3-1018.md (Daniel 10-18: "I still see the wood platforms"; "there's no fire for the most part, so you can't actually do much").
Base: master e0436ee8 + origin/claude/airpockets merged in (its bell housings and Tollmaster hp 3450 are kept untouched; airpockets is in batch101, so the
merge into master after BATCH101 is mechanical). Built with NO BROWSER (PC memory rule): node checks only, see "Checks".

## 1. What replaced the wood (geometry, per section)
The wood came from two places: the swing hoists were drawn with `TILE.log`, and every `plat()` was a generic one-way. Now every one-way in the level is laid with
`ledge(x, y, len, kind)` and drawn by the new city kit **src/redraw/lamplit3_tiles.js** (`L.lpKit`, hooked first in `resolveTiles`): a ledge nobody named is a
cobbled lip, never a plank. The one swing left is an **iron gantry cradle** on chains (`cradle: true`).

| kind | what it is | where |
|---|---|---|
| cobble | broken cobbled lip of the old street, weed off the break | vault lips, courtyard steps, the arcade's broken cornices (default) |
| balcony | grated wrought-iron deck on a scroll bracket (brackets drawn back to the wall: `L.lpBrackets`) | house fronts, storeys, the square's cornices |
| awning | drowned striped canvas on an iron rod | the fish-market stalls (a high road over the market) |
| crossbar | the iron arm of a lamp standard; its post drawn down to the paving (`L.lpPosts`) | the market canal (three standards), courtyard 1 |
| gantry | riveted lattice girder | the wreck's davit, the lamp works' floors and gallery, the cradle |

Per section (route now 8 height bands, was 3; it walked the roof road start to boss before):
1. **Descent** - the lamplighters' brazier, two dead roof lamps (TEACH: E lights), and **TAR NET 1** across the roof at 74 with oil at its foot (TEACH THROW; a pier shuts the street under it: required once).
2. **Fish market** - **THE MARKET HOUSE** (a blind front 100-104 up to row 3) shuts the roof: down the shaft at 94, through the dark street under the watch, up the new stair at 114 (right beside the WATCH HATE LIGHT teach). The courtyard is now **THE MARKET CANAL** (water 125-139) crossed on three **lamp standards** whose lamps are out. Awnings over the stalls. First **WICKLING** with a dripping **oil cask**. **THE NETMENDER'S LOFT** (secret: a tar-net door, silver inside).
3. **Market hall / Lampreeve** - unchanged; the street under it is now silted shut (pier) so the road goes through him.
4. **Counting house** - REMIX: **THE SEAL GATE** (PORT at 346) lifts for its lamp, which stands BEHIND the gate; an oil **gutter** runs under the gate to it (a fuse), with a **valve** wheel that refills it; oil **floats** on the flooded vaults (burn it: the pocket lamps light). The key-and-swim way under the vaults still works (two roads).
5. **Lamp works** - gantry floors, two casks and a valve on the bellows floor, a wickling in the gallery; the east door is bricked to a **window** high in the wall (route band 3); the street under it is shut.
6. **Procession road (EXAM)** - **THE PROCESSION WALL** (480-482, rows 5-21) shuts the roof: dive from courtyard 1 under the road, lamp to lamp (LIGHT THE WAY pockets or the beam), up out of courtyard 2 (cobble step, balcony, chain). Then **TAR NET 3** at 552 with a gutter + valve, a cask, a brazier and a wickling between you and them. Secret: a silver behind the wall (reached back from courtyard 2).
7. **Toll gate / Tollmaster** - unchanged square, housings, braziers; the approach lamps start dead; its last snuffer is a wickling.

Secrets: exactly the 3 silvers the save counts (loft 181, the lamp works vault 386 - VAULT_SILVER moves silver idx 1 there - and behind the wall 486); the pocket/tribute silvers became plunder dressing. Checkpoints 7 (one per 96 route tiles). level-quality: **lamplit is on the GATE now and CLEARS THE BAR** (bands 8, gadgets 7 kinds / 4 developed: oilcask x5, mover x5, tarnet x3, oilvalve x3; secrets 2; flat 0%). pilot + mash rows are REPORT_ONLY until measured (see TUNE).

## 2. Dark until lit
`dark` 0.32 -> **0.8**, street zones 0.86-0.88, the works 0.82 (the mini hall and the Tollmaster's square keep 0.66 - tuned fights). A city lamp's light radius 66 -> **96** (`L.lpDark.lampR`) plus `palette.lampGlow` (warm light laid into each pool). Half the roof lamps start dead; each section has ONE fire source (a brazier or a lit lamp). Burning oil, a cask going up, a burning net, thrown fire and every wickling are holes in the dark. The edge lips are under the dark, so the route shows only round what you have lit.

## 3. The fire verbs (src/lamplit-fire.js, new; wired in main.js)
- **LIGHT (E)**: fire in hand (P.wick) and a dead lamp within 26 px: INTERACT lights it with the full relight (`relightFlare`: the watch blind, the Lampreeve stunned, the Tollmaster's robes) - so E is now a boss verb too. Striking a lamp still works (the bot and the old tests).
- **THROW (E)**: anywhere else E throws the fire in a TOLD ARC (UP lobs, DOWN tosses short; the arc + landing ring drawn over the dark while you carry fire). Thrown fire: lights a dead lamp it strikes (plain light, no flare), catches oil, burns a foe (14 + burn), burns a tar net, bursts a wickling; water takes it; on bare stone it lies burning 6 s (walk onto it to take it up).
- **OIL** (`L.lpOil`): puddles, gutters (fuses), floating slicks. A cell catches (0.25 s), burns 6 s (gutter 4), spreads to its 8 neighbours; a burning pool lights dead lamps over it, burns heroes (9 / 0.5 s, unblockable) and foes (16 / 0.5 s), catches tar nets, bursts casks, and hands a hero with no fire a flame; spent oil seeps back in 18 s (6 under a cask).
- **OIL CASKS** (riveted iron tanks, no staves): drip-feed the oil under them; a blow SPILLS a wide slick; fire beside one is TOLD (dashed red ring, 0.5 s, "THE CASK IS GOING UP") then it bursts (r 44: oil, lamps, nets, 14 hero / 34 foe); refills in 22 s.
- **OIL VALVES**: E or a blow refills their gutter (no spent fuse is ever a softlock).
- **TAR NETS** (`L.lpSnags`, solid): fire takes them (0.8 s), gone for the run (marks `lpsnag:<id>`); reachcore counts them burnt (like the gorge's jams) - every net has oil and fire on the road before it (tools/lamplit3.mjs proves it).
- Glint + stall nudge spots: lp-net1, lp-house, lp-sealgate, lp-window, lp-wall, lp-net3 (src/stuck-spots.js).
- Teach -> test -> remix -> exam: E light + net 1 (teach) -> market wickling + cask, canal standards (test) -> seal-gate fuse, floating oil, works casks/valve (remix) -> wall dive + net 3 with gutter/cask/wickling (exam). Required uses: net 1, the toll gate lamp (+ the seal gate or the key).

## 4. THE WICKLING (src/wickling.js, new foe, reusable)
A living lamp-flame on a wax stub (EHP 12, THREAT 2). Pure rules + `makeWicklingHands(ctx)` so the Lit Church / Fog Canal / manor can host it.
- drifts to the nearest lit lamp and DRINKS it (snuffTell 0.9 s, "IT DRINKS THE LAMP"; the host's told gutter), burning brighter (fed, max 3); never a boss's or mini's lamps.
- a carried flame first: flares (stealTell 0.45 s, red !!) and darts; a touch takes the flame (P.wick and the church's lcFlame); no flame = a 5 scorch.
- ANY blow / thrown fire / burning oil: it SWELLS (burstTell 0.38 s, red !!, a dashed ring) and BURSTS: r 34 (+25% per flame drunk) - oil catches, dead lamps light, nets catch, 12 hero / 26 foe. A chain: wicklings in the burst swell too.
- in the dark only its flame is drawn (the body where lit / in your glow); in water it is doused.
- marks.js rows (BY_HAND, MARK, answers dodge/dodge, heights), bestiary entry + BEAST_SHORT, lines routed (WK_SAY in hint-lines SAY_LINES). Replaces the level's 4 snuffers, +2.

## 5. src/flame.js additions (ADDITIVE ONLY - for the CHURCH3 merge)
Inserted BETWEEN `flameHoles` and `drawFlameHand` (church3 appends at the END of the file, so the hunks do not touch). Nothing renamed, no signature changed. New exports:
`FLAME_THROW`, `throwFlame(x, y, face, keys)`, `stepThrownFlame(f, dt, solidAt)`, `thrownHoles(hole, list, cx, cy)`, `drawThrownFlame(g, list, cx, cy, time)`.

## 6. Other files touched
src/level.js (theLamplitStreet rewritten; arcade keeps piers out of shafts), src/main.js (imports, tile hook, spawn cases oilcask/oilvalve/tarnet/wickling, EHP.wickling, lamp light radius, reset/update/E/holes/draw hooks, cradle draw, hurtEnemy0 wickling, bestiary), src/reachcore.js (tar nets count burnt), src/threat.js, src/marks.js, src/hint-lines.js (LP3_SAY + WK_SAY; **also routes claude/airpockets' two housing lines, which failed hint-shown on batch101**), src/stuck-spots.js, tools/level-quality.mjs (lamplit on GATE; pilot/mash REPORT_ONLY TODO), tools/check.mjs (+lamplit3), new tools/lamplit3.mjs.

## 7. Checks
Run (node, green): **tools/lamplit3.mjs** (new: no wood, dark, route + reach, every net's oil/fire, the fire on the built level, E light / throw / water / lamp hit / told arc, the Wickling), level-quality lamplit (CLEARS, pilot/mash report-only), tells, hint-shown, stuck --static, signs, checkpoints, reach (everything reachable), boss-read, boss-fight-end, ground-depth, deadends, ambush-listed, sea-requests, geom-report, node --check on every touched file. Static map renders of every section reviewed (work/tmp, not committed).
By mistake: tools/corpses.mjs turned out to open a page (cdp) - it ran once at ~13:05, green ("every reskinned foe ... own skin"), and left no process behind.
dangling-paths: red only on the citation master already carries in batch100-integ.md (the cast-poses tool, never committed; not this lane).
PAGE (after 14:30, the BATCH101 gate done at 14:01, free RAM 5-7 GB, PORT 8739, one page at a time, every browser closed - none of mine left running):
- **tools/lamplit2.mjs: all green** (the Lampreeve, the Tollmaster, the bell housings, LIGHT THE WAY, the toll/seal gate, the watch, the fuse).
- a page smoke of the street (work-private): no page errors; E lit the dead lamp at 52; a thrown flame burnt net 1; a struck wickling burst; both bosses spawn; 9 spots across the level walked.
- **stuck (static + runtime): OK** (259 spots, the six new lamplit ones included). **reach-heroes lamplit: 0 crossings for all 9 heroes.**
- **mash-bot**: LEVEL k/w/p all die (3/2/3 deaths, 302/209/305% hp lost) = the mash bot does NOT clear the level; BOSS 0/6 (dead 41 s, 93% left), MINI 0/6. Rows written to docs/mash-bot.json.
- **level1-pilot lamplit --write and --curve**: fresh L1 knight 9 / 8 deaths, 337 / 331% hp a run, walked 100% (act III band 100-500%, 1-9 deaths: in band). Rows written; the REPORT_ONLY TODO is lifted: **level-quality lamplit CLEARS every row on the gate**. (The full gate's one miss is FLOTILLA's stale pilot/mash rows on master - not this lane.)
- real-page screenshots reviewed: the lamp works' gantries and the told arc read; the canal standards' crossbar ends drew as legs in the lamp wash - fixed to round bosses.
NOT run: textfit, mobile-perf, mark-integrity, untold-told, answer-tags, weak-bosses, boss-greed, solid-islands, floaters, visible-supports, footing-art, frame-cost, readability, boss-rates (the TUNE lane).

## 8. What the TUNE lane (sonnet) must measure
1. (done here: pilot, curve and mash rows are stamped and in band) - re-stamp them after any tuning change; walker deaths vs the act-III band.
2. tools/lamplit2.mjs and boss-rates lamplit/lampreeve `--profile=human` 12 seeds k/w/p: the bosses' numbers are unchanged, but (a) **E now relights with the flare** (easier openings for a human; the bot still swings), (b) the approach is darker and has wicklings, (c) thrown fire chips 14 on bosses. Band: Tollmaster 60-70 with flasks, Lampreeve 75-85.
3. The level's darkness (0.8/0.86) vs readability (tools/readability) and the walker deaths; the wickling's steal cadence (stealCd 2.4 s) and burst damage; oil burn damage (9 / 0.5 s); the procession dive's breath without lighting (~44 tiles).
4. The bot (src/lab.js lampPlan) does not use E, throw, oil or the wickling: teach it to throw onto net oil (else pilot/mash may stall at net 1 - the reach model counts nets burnt).

## 9. What the ART lane (sonnet) must draw (everything here is GREYBOX)
The ledge kit is real pixel art but first-pass (check in the real dark); the lamp-standard post; brackets (cast scrolls); the gantry cradle; oil (sheen, floating slick, gutter channel, catching, burning, spent char); the cask (iron tank, drip, spill, tell ring, burst); the valve wheel; the tar net (whole, catching, falling ash); thrown fire in flight + lying; the told arc colour; the Wickling's six poses (drift, snuffTell drinking, stealTell windup, dart release, recoil, burstTell swollen) + its burst; the market house front, the procession wall, the works window, the netmender's loft as landmarks; dark-until-lit lamp pools. Art-before-live: this rework ships only after that pass.

## QUESTIONS FOR DANIEL (rec first; what I built)
1. **E relights with the full flare (stuns the Lampreeve / burns the Tollmaster).** Rec: keep - it is your "light a lamp with E" and the bosses' openings are the level's verb. Built. Alt: E lights without the flare; the flare only from a strike.
2. **E is one key for two things: beside a dead lamp it lights, anywhere else it throws your fire.** Rec: keep (one verb, the arc shows before you press). Built. Alt: throw on UP+E only.
3. **Thrown fire that hits a dead lamp lights it, but with no flare.** Rec: keep (no ranged boss stuns). Built.
4. **Two roads stay**: the street and the roofs both reach the end; three barriers force the street (the market house, the works' shut street, the procession wall) and three force fire (net 1, the seal gate or the key, net 3). Rec: keep. Built.
5. **The bosses' rooms keep their 0.66 dark** (only the road is near-black). Rec: keep until the TUNE lane measures them. Built.
6. **Silvers**: the save counts three; the loft, the works vault and behind the wall are the three now (the LIGHT THE WAY pockets pay no silver any more). Rec: keep. Built.
