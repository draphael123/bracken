# claude/levelfix — lane report (2026-09-24)

The level review's cross-level fixes and per-level misplacements are all on `claude/levelfix`, which is based on
`claude/batch16` with `origin/master` merged in. Everything is pushed. I did not touch master, did not deploy, and did not run the full suite.
Before/after real-page captures are in `docs/levelfix/`.

## FIRST: the suite on batch16 is partly vacuous

On batch16, `tools/check.mjs` passes seven check names as arguments to every node check:
`['tools/' + t + '.mjs', 'burial-variety', 'buried-dead-art', 'mini-names', 'slopes', 'one-dodge', 'queen-chandelier', 'ambush-reach']`.
This came from a bad merge, first seen in 2607bd2, the geo2 merge into batch15. The effect:
- Every tool that reads argv as a level filter passes on zero input: "floaters 0 checked", "spawns 0 creatures", "deadends 0 in 0 levels", and audit prints nothing.
- Those seven checks never run at all. I ran them alone and all seven pass.

A batch16 green result therefore proved much less than it says. I did not fix this here, to avoid a conflict with the
integrator; a task chip was raised for it. The fix is to put the seven names back into the list literal. Until then, every check in this lane was run directly as
`node tools/<name>.mjs`.

## Commits

| sha | item |
|---|---|
| `e36ae28` | 1. Occluders: each biome gets its own occluder or none, and none indoors (+ `tools/occluders.mjs`) |
| `ed96625` | 2a/2b. No checkpoint inside an arena, mini or ambush room, or on a flight. Gale Moor's kite ride is not filled (extends `tools/checkpoints.mjs`) |
| `056140c` | 2c. A swimmer lights the shrines it swims over (`shrineLights`, + `tools/swim-shrines.mjs`) |
| `07c4000` | 3. Ground shading is taken from the shallowest ground nearby, so there is no seam under a step (`groundDepth`, + `tools/ground-depth.mjs`) |
| `c6c64cd` | 4. No grass roots underground; Burial's pirate corsairs are now husks (extends `tools/skins.mjs`) |
| `b24200b` | 5. Per-level misplacements (extends dressing, bridge-props, spawns, elites, haunted-coast; the deadends rule) |
| `d5e5bbb` | merge origin/master (only docs/slopes-trace.json) |
| `2e43aee` | slopes-trace: re-recorded Bracken Wood only, because the Bramble Ride moved back to its columns |

## What each new or extended check found across ALL levels (on the pre-lane code)

- **occluders** (new): 93 in total.
  - 8 levels drew a forest tree on a village or desert level: underleaf, waymeet, fields, mage, fallingtower, burning, witchlight, caravan.
  - 85 rooms in 21 levels drew an occluder indoors. That includes the forest and rock levels, and the ship holds.
- **checkpoints** (extended): 6.
  - flotilla 304,15: inside the walls and past the trigger. This is B6's own case.
  - storm 304,29, spire 18,29 (the Abbot's floor), and crown 472,63 (grown in behind the Forgemaster's wall).
  - moor 813,12 and 879,9: on the kite ride.
  - Why the old check missed them: the rule lived only in the filler, which judges only the checkpoints it places itself. The check tested footing, and newlevel tested only that *some* checkpoint stands before the trigger.
- **swim-shrines** (new): 14 underwater shrines that the swum route crosses without lighting.
  - Keep 11, Reef 2 (270, 302), Deep 1 (60,198).
  - A second pilot swam the route in the real page with real keys. On the old rule it lit 1 of 15; on the new rule it lit 9. The rest were skipped past or not reached; see `docs/levelfix/keep-swim-pilot.txt`.
- **ground-depth** (new): 15,393 side-by-side depth seams in 43 of 44 levels. The dark forest fill is just where they were visible.
- **skins** (extended): all 3 underground levels (undercrown, burial, oreroad) grew roots. It also found the 5 bone corsairs in Burial, and none anywhere else.
- **dressing** (extended):
  - Sunk props: the Marsh's moss, frog statue and moss at row 21, and the Wood's stump at 438,23.
  - Fire reach: Kingswood's skull totem at 331,24 and Highcrown's spear rack at 609,57.
- **bridge-props** (extended): the Stockade's trophy rack at 122,20.
- **spawns** (extended):
  - HARM: the Hurricane's sailor at 509,33.
  - THORNS: the Wood's Bramble Ride thorn goblin at 308,11.
  - LESSON: proved by mutation, since the old code carries no tag. It found the lurker at 139,21.
- **elites** (extended): Scree troll at 403 (1 tile from its checkpoint) and Witchlight husk at 108,76 (standing on its checkpoint).
- **haunted-coast** (extended): the Peat Wight in the Lamp Island ambush wave.
- **deadends** (rule): 5 pockets under water that is certain death. That is Flotilla 4 (three plunder stashes and a coin cache) and Falling Tower 1.

## Before/after captures (docs/levelfix/)

- **occluders:** `occ-*`. Caravan, Underleaf, Waymeet, Witchlight, Burning, Fields, and the Folly and Falling Tower indoors.
- **checkpoints:** `ck-*`. Flotilla, Storm, Moor spire, Spire boss floor, Crown furnace. The Keep swim evidence is `keep-swim-pilot.txt`; screenshots of the dark rooms showed nothing.
- **ground seams:** `seam-*`. Wood 338 and 384, Marsh, Stockade, Kingswood.
- **underground:** `roots-burial-*`, `roots-oreroad-*`, `pirate-burial-*`.
- **misplacements:** `mp-*`, 28 spots.

## Level changes worth knowing (not only art)

- **Bracken Wood**: the perfect-guard lesson grew the wood by 26 columns at 173 after the final-coordinate tables were written.
  - The REVIEW badger, hives and wasps are moved +26.
  - **THE BRAMBLE RIDE ambush** is also moved +26. Its walls had been shutting around the bramble bed itself, with a thorn goblin standing in the thorns. This changes play there, back to the design.
  - The slopes-trace wood baseline was re-recorded for it.
- **Garrison ripples**: the Hurricane's garrison no longer uses the oil, so 6 garrison creatures moved (same kinds and count). The Long Water's Meltfalls keep sea creatures out, so its siren and a crab are placed elsewhere.
- **Burial**: 7 corsairs in the roster are now husks, which have the same threat (3). Total foes are unchanged, but `curve.mjs` INDEX goes 110 → 107 because one foe *kind* is gone.
- **Flotilla**: the two rigging scouts are lookouts, threat 2 → 1.5 each.

## Skipped, and why

- **Boss Rush `{ lv: 'spire', boss: 'roc' }`**: the Rush is PARKED ("add nothing"), so I left it. The other two stale Roc names (the map node and the store unlock) are fixed.
- **Stale Monastery dialogue**: main.js ~17176 ("THE SUNSPIRE. THE WHOLE MOUNTAIN IS GLASS...") and ~17208 ("THE GLASS GIVES", "THE ROC IS DOWN") are also stale. Changing them means writing new lines, so that is a question below.
- **Hurricane crow's nest over its pennant, air bells under the keel, lone plank**: no clear capture and the fix is unclear. Left.
- **Caravan awning "with no posts"**: the sprite has posts; the see-through shade under it is what reads wrong. That is art for the desert lane.
- **Unburied toppled-tower column, Deep deck on stone, Burial backdrop seams, Hanging arena ledges**: M-size art reworks, not misplacements. Left.
- **Falling Tower "tufts inside the tower"**: they are on the outdoor sand walk and are not drawn at all. Content-audit lists `tuft <- fallingtower` as a kind with no deco entry, and that was already so before this lane.
- **Moor foes in the lees, Kingswood buried board stripes, Scree leftover crystal seam, Reef stale interiors row**: design or unverified. Left.
- **Stockade cook spit and hide rack on the catwalk, Marsh "SPITTERS" sign at 274, Highcrown's two "THE LEADS"**: these are placement or naming decisions. Questions below.

## Checks

Every commit was green on: syntax, comments, homepaths, dangling-paths, floaters, audit, content-audit, dressing, skins,
checkpoints, killzones, traps, collectables, spawns, deadends, signs, map-grammar, pixels and textfit, plus the new checks
(occluders, swim-shrines, ground-depth) and the level checks for every touched level (47 for item 5). Other notes:
- **Re-run:** `undercrown-variety` failed once while the machine's full suite was running, and passed when run alone.
- **slopes-trace:** failed on wood after the Bramble Ride moved. The wood baseline was re-recorded, and all four levels now compare identical.
- **content-audit:** still exits 0, but it flagged `rushes`/`driftwood` as missing from the deco map. That meant my Long Water swap would have been invisible, so I added them to the map.

## Questions for Daniel (each with a recommendation)

1. **Gale Moor's landing checkpoint (952)** is inside the Windcaller's walls, and there is no ground outside them nearer than the kite post, 200 columns back. It is listed as allowed on purpose. *Recommend: keep it, because a respawn at the kite post costs the whole Sky Road. If you want B6 to hold strictly, the arena's west wall would need to move.*
2. **The Long Water sign says "THE MOUNTAIN MELT RUNS SALT"**, which justifies the sea life. The NPC says it is a hundred miles from the sea. The Meltfalls are fresh water now. *Recommend: reword the sign, e.g. "THE MOUNTAIN MELT RUNS DOWN TO THE SEA. FOLLOW THE WATER."*
3. **Stale Monastery squire lines** (THE SUNSPIRE / GLASS / THE ROC IS DOWN). *Recommend: rewrite them to the Abbot and the bells. I can do it if you approve text.*
4. **Burial's poison-pit coin caches**: 21 pockets at the bottom of the ossuary's poison pool each pay 5 coins. I kept them because you can swim out of poison. *Recommend: keep them as a risk and reward, or drop them if they read as bait.*
5. **Fix check.mjs's argument bug before trusting any batch16 green.** *Recommend: the integrator does it first thing (the chip describes it).*
