CARPET DONE 11-06 11:45 READY (code-only greybox, behind its flag; browser walk / tune / art / music owed - listed below)

# claude/carpet - THE FLYING CARPET + THE SPHINX OF THE HIGH GATE (OPUS greybox, code-only, 11-06)

Branch `claude/carpet` off `claude/colossus4` 5f28d2603 (contains claude/desertkit). Worktree `C:\Users\Daniel Raphael\.claude\bracken-lanes\bracken-carpet`. Pushed. NOT merged, NOT deployed.
Code tip **8cfbb1b1d** (this report is the commit after it). Sources: plan-desert-1105 s1.6 / s3.g / s4 (the plan won over brief-flyingcarpet where they differed), lane-reports kingspyramid / suntemple / ksar3 (the flag pattern).
No browser was opened and no puppeteer tool run (GATE-RUNNING.flag). Node only, >= 1500 MB free each time.

## DEV FLAG / URL
`src/flying-carpet.js` `CARPET_SHIPS = false`. OFF: `src/level.js` does not append the row, so LEVELS is master's array cell-for-cell (proved: a clean child process sees no row and ksar.needs is still 'glasssea').
ON: `?carpet=1&level=carpet`, or `globalThis.BRACKEN_CARPET = true`, or `CARPET=1` for Node tools. The row is appended LAST and HIDDEN (no map node), needs 'glasssea'.
**Road insert: not written here.** GREATDUNE's shared `src/route-insert.js` (+ tools/route-insert.mjs) already has a carpet entry, off until this flag is on: switch that entry on at the merge (glasssea > carpet > ksar). No save migration of my own.

## What was built
| file | what |
|---|---|
| `src/carpet.js` (EXTENDED, not forked) | **CARPET 2 - the ride**, appended below the Falling Tower's code (the first 100 lines are byte-identical to the base; tower-ascent / tower-hall / undead-moves / undead-realms node tools still pass). `RIDE`, `newRide`, `stepRide`, `rideBox`, `newRug`, `rugStep` |
| `src/flying-carpet.js` (new) | flag + the level, 640 x 60 |
| `src/sphinx.js` (new, pure) | THE SPHINX OF THE HIGH GATE + `sxPlan` (the human bot) |
| `src/carpet-hands.js` (new) | binds them to the world, plus the greybox drawing (rugs, thermals, mist, stones, tells, storm view, speed and fray bars, riddle panel, her pose names) |
| `src/main.js` | 13 one-line hunks, all gated by `FCH.on()` (only a level with `L.flyingCarpet`). The hunks: import, clear, spawn case 'sphinx', wardedDamage take, world draw, owns/update, ctx, strike+update, boss draw, drawOver, bar name, and 2 lines in carpetPlayer (the sky box + the ride call). Anchors are chosen 2+ lines away from claude/kingspyramid's hunks so it merges cleanly beside them and greatdune |
| `src/level.js` | 1 import + the flagged hidden row, both placed away from KP's lines |
| `tools/carpet.mjs` (new) | 93-118 ok (the count varies with how many storm gusts get probed) + toy duel (`--sim=N`) |

### THE RULE - "THE CARPET RIDES THE WIND - IT ONLY HOLDS YOU WHILE IT'S MOVING"
- **Always forward.** The carpet itself is the auto-scroll, and it cannot hover. UP climbs and costs speed (it is free inside a thermal). DOWN dives and gains speed. RIGHT pushes, LEFT brakes. In level flight it drifts back to cruise.
- **Stalling.** Under the stall speed it SAGS: a told flutter and 'IT SAGS - DIVE!' for 0.7 s, then it DROPS you. The rug hangs for 0.45 s and then follows under you for 1.1 s. Using the game's real gravity it catches you about 260 px lower, so **height is the margin**. A stall low over the mist is a death (proved); six rows up you are caught. This is taught first on the dunes, where a drop costs only the walk back.
- **JUMP** hops off and you land back on the carpet. On footing it comes and lies beside you, and you walk onto it to board.
- **BLOCK = lie flat.** Your box shrinks from 22 to 9 px for the two-row arch holes, and it halves a headwind.
- **Stone frays it.** Each scrape takes a quarter of the fray bar, with a 0.6 s grace between scrapes and a speed cost. It mends after 3 quiet seconds. Frayed through, it tears and drops you, and comes back at 40%.
- **Landing ledges.** Flying over a shrine, the carpet SETS YOU DOWN on it, so the shrine lights. A respawn puts the rug beside the shrine.
- **Kit on the carpet** is what the Falling Tower carpet already had: swing, dodge (i-frames and a jink; it cannot pass through stone), block, flask (you keep flying while you drink).

### THE LEVEL (5 parts, 2 checkpoints)
- **Launch (0-21).** The Glass Sea's cliff edge, where the Djinn's carpet waits.
- **THE SAFE DUNES (22-147).** Teaches pitch, the stall on sand, thermals, a ROCK ARCH (lie flat through it, or ride a thermal over), and hawks.
- **THE NECROPOLIS SPIRES (148-351).** Two fields over the mist: tomb spires, 4 sky-to-abyss GATE WALLS (the arch is the only way on; one is low near the mist, with a thermal after it), 2 TOMB BRIDGE tunnels, downdrafts in the lee of tall spires, hawks, vultures, slingers.
- **LEDGE 1 (352-364).** Shrine.
- **THE STORM (366-571).** The SANDSTORM rule (`desert-rules.js` `stormStep`, reused): a hiss warning, then a headwind gust that eats speed (dive, or lie flat), and the view closes. 2 fields, 4 arches.
- **LEDGE 2 (572-584).** Shrine.
- **THE HIGH GATE (585-619).** The arena: sky over the gate's stone apron. Wheeling is allowed here: brake and it turns, and a wall turns it.
- **The Ksar's cliff gate (620).** The level gate; it opens on her death, and the carpet sets you down.
- **Cast: 0 new foes.** Hawk scouts, vultures circling spire tops, and rooftop slingers on spire tops. No goblins. No wood: limestone spires, sandstone mesas.
- **Pickups:** coins, plus 3 silvers off the line (over the arch crown, low in tomb bridge 1, high over the last storm thermal).

### THE SPHINX OF THE HIGH GATE (numbers untuned, hp 3200)
- **THE OPENING.** Every 8/7/6 s (by phase) she speaks a riddle: her glyph shows on her chest and a plain riddle stays on screen (sun, moon, water, eye, key, scarab).
- **Stones.** 3 GLYPH STONES float, only one of them hers. Strike it or fly through it and she is STRUCK DUMB: OPEN 3 s at x1.8, for a purse of 10% of her hp; then a told ward of 2.2 s at x0.4.
- **WRONG stone = a told POUNCE**: roar plus a ring on your spot for 0.8 s.
- **No answer in 7 s**: she laughs. No punishment.
- **B15:** stone hide x0.5 outside openings, including during the pounce, the gust, breathers and the storm; x0.4 when warded. The min probed is 0.4, so she is never 0.
- **P1:** SWOOP RAKE (a drawn line, then she stoops along it; blockable).
- **P2:** adds the WING GUST (wings raised 1 s, then a speed-eating headwind; lying flat halves it).
- **P3:** adds the GLYPH STORM, which is the sandstorm rule's own cycle: the view closes, a gust drives the carpet, and THE STONES WHIRL.
- **Phase changes** are 2.2 s breathers (sky dusk, then night, then storm), and nothing is cast.
- **B16:** every move has a windup pose, a release pose and 2 sound keys (`SX_POSES`). The greybox prints the pose name under her.

## Checks (node, one at a time; no tools/check.mjs, no browser)
- `node tools/carpet.mjs` **ok**:
  - the flag both ways
  - level geometry: 2 shrines on footing and both are landings, arch holes, gate walls run sky-to-abyss, the abyss is open, thermals and downdrafts, 0 new foes, no goblins, no wood
  - the ride: every rule above proved, including lie-flat-clean vs sit-up-scrapes in an arch
  - the rug: stall catch 260 px, hop, mist = death, park and walk-on
  - **THE ROUTE BOT** flies the real grid with the real ride, the level's air and the storm, launch to arena: **78 s, 0 drops, 0 tears, 10 scrapes, min speed 61** (the stall line is 52)
  - the Sphinx: B15/B16, riddle/answer/wrong/late, one new move a phase, breathers, storm whirl
  - **HANDS SMOKE** on the real level: board at the launch, ride, hop and land back, set down at ledge 1, respawn rug, 3 min of her through the hands and every draw, win sets you down
- **TOY DUEL** (point hero moving free in 2D, hp 300, 3 flasks, n=6): **6/6, avg 260 s, about 14 opens a fight, 0 damage taken.** That is NOT the rate: the toy hero dodges freely, while a carpet must keep moving. The pace says the fight runs long. REC start the tune at hp 3200 -> ~2400.
- `CARPET=1 node tools/level-quality.mjs carpet`: **MISSES bands, mechanics, music.**
  - These come from the walking route model: 0% of the width offers a second height to walking reach, and 0 gadget kinds because thermals and arches are data markers (crthermal / crdowndraft / crarch).
  - Music is borrowed placeholders: skyroad for the level, rocphoenix for the boss.
  - ok: flat, secrets, checks (1 per 314), encounters, density, ranged (slingers), roles 3, unlocks, blocking, route.
- `CARPET=1 checkpoint-stand` **FAILS for carpet**: the walking fill can't reach the ledges, because they are reached by flight. Same class as KP's lift; see Q3.
- `CARPET=1`: checkpoint-gaps / -thin / -rule / checkpoints / floaters / floating-geometry / goblin-lint / anchor-lint are ok, or carpet is not listed.
- **one-new-foe FAILS for carpet (flag on only)**: by design (plan: 0 new foes). With the flag off the level does not exist, so nothing in the suite moves.
- `node --check` passes on every touched file. Filenames (flying-carpet, carpet-hands, sphinx, carpet.mjs) are clean of ad/banner/track/pixel/promo/analytics/admiral.

## Owed
1. **Browser walk** (one at a time, >= 1500 MB, memguard first, `?carpet=1&level=carpet`):
   - the ride's feel: cruise 110, stall 52, pitch 100, thermal lift 90, arch tolerance
   - camera at ride speed; the dodge on the carpet; hawk and vulture stoops on a flying hero; slinger arcs at a flier
   - set-down at the shrines; the drop/catch told well enough; the mist line readable
   - arena entry (y0 trigger) and the setWall columns; co-op seats (a rug per hero)
   - knight + reaper + a ranged hero
2. **Tune:** a bossLab hook for 'sphinx' driving `sxPlan`, then boss-rates n=6 WITH flasks (60-70%), mash 0/6. REC hp 3200 -> ~2400 for 3 min. Also boss-openings / damage-caps / untold-told / mark-integrity / hint-shown. level1-pilot + mash-bot (page tools). The QUICK gate on the branch.
3. **Art (art before live):**
   - the level kit: sky indigo dusk, limestone necropolis spires, tomb bridges, rock arch, mesas, gate apron, the Ksar cliff gate on the horizon, mist, thermal shimmer
   - the Djinn's carpet as its own rug (the Falling Tower rug is drawn now); fray states
   - THE SPHINX: lion body, wings, woman's head, glyph breast; every pose (rakeCrouch/Stoop, pounceRear/Leap, wingsRaised/Beat, riddleSpeak/Wait, struckDumb/wardRise, stormCall/Ride); the 6 carved glyph stones; storm overlay; bestiary card
   - hawk/vulture/slinger skins as sky raiders if wanted
4. **Music:** the level's own track and the boss's own track (CC0 candidates for Daniel).
5. **Road:** switch on the carpet entry in GREATDUNE's `src/route-insert.js` at the merge (its own test covers saves).

## Questions for Daniel (recommended answer first; built as rec)
1. **Kit on the carpet** = the Falling Tower carpet's (swing, dodge as i-frames, block = lie flat, flask). REC keep it for this level; heroes' skills/ranged on the carpet is a later lane. Alt: the full kit (skills, bows) on the carpet now.
2. **The shrines SET YOU DOWN** as you fly over them (the shrine lights; walk back onto the rug). REC yes: a sure checkpoint, a breath, Salt & Sanctuary-honest. Alt: shrines only light if you choose to hop off and land.
3. **checkpoint-stand / level-quality bands + mechanics** read the walking model. REC the carpet fix lane (11-30) teaches the tools a flight ride (an L.cr ride band like rigBands) and counts the L.cr thermals/arches. Alt: list carpet REPORT_ONLY for those rows.
4. **Hawk scouts here debut the Ksar's own bird** (once carpet sits before the Ksar, F10 credits the hawk to the carpet). REC keep the hawks (plan: foreshadows the Hawk-Mistress); the Ksar's new foe is then KSAR 3's SUN-SHADE STALKER. Alt: vultures only here.
5. **one-new-foe for carpet**: REC list it as a vehicle level ("0 where a vehicle/boss is the novelty", plan s1). Alt: add a sky-raider reskin as a new kind.
6. **Falls in her fight** land on the gate's stone apron (no deaths from falling there; her danger is her). REC yes. Alt: mist under the arena too.
7. **Boss length**: the toy duel runs 260 s. REC tune hp 3200 -> ~2400 first. Alt: shorter riddle gaps.
8. **Music**: placeholders are skyroad + rocphoenix. REC CC0 candidates at the art lane.
