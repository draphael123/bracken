# Lane report: `claude/caravan2` (2026-10-09) - THE SUNKEN CARAVAN level pass + THE DUNE WORM rework

Daniel's live playtest of 10-09 (scratch/brief-caravan2.md, the photo scratch/caravan-logs-1009.jpg). Base: origin/master 36c83412 (batch80).
One Opus lane: level mechanics + the boss, greybox; the art follow-ups are listed at the end. (The SEPTEMBER lane of the same name -
ruins, a harsher sun, bandits - is in this file's history: commit 3de7bdc8.)

## B. THE DUNE WORM (src/dune-worm.js, his hands in src/main.js, the lab bot in src/lab.js)

| brief | built |
|---|---|
| B1 invulnerable except head-on-ledge (Daniel's B15 exception) | `wormTake` is x1.5 while STUNNED and 0 otherwise. A blow on him up out of the sand CLANKS (boss-read `turned`) and says **HIDE TOO THICK** + **MAKE HIM HIT A LEDGE** (and a hint line the first three times); through the sand nothing (and nothing said). His breach under a standing ledge = **STUNNED 3 s** (gold ring + timer bar + stars, B10), then a told **3 s WARD** (pale shell, WARDED; a breach under a ledge in the ward stuns nothing and says WARDED: NOT YET, B3). The ledge he hit cracks and sinks. |
| B2 more ledges, random | `WORM.LEDGE`: **2 up at once (3 in phase two - the arena changes, B5)**, each 3 tiles of sandstone 3 rows up, rising at a random slot on whole tiles, clear of the walls, the rim's overhang and the gate (`L.arena.stoneAvoid`), never within 44 px of the hero, 24 px apart; **told rise 1.0 s** (the sand cracks along it, dust, a grinding rumble `stoneRise`, A LEDGE RISES), standing 11-15 s on the dice, sinking 0.7 s. Longest stretch with none up in the Node fight: **1.0 s** (cap 6). |
| B3 ledges give shade | a standing ledge is a shade box handed to `cvCanopies()` (the sun is off under it) and one-way **rock-shelf footing** (tiles set while it stands, restored on sink / death / retry / his death). A breach that catches a ledge stops at its underside: a hero standing ON it is never hit. **Integ note:** claude/ksar2's sun v2 builds its shade from `cvShaded` + `zones()` = `CV.zones + cvCanopies()` - the ledges are already in `cvCanopies`, so drain.js needs no change; the merge only has to keep my `.concat(dwStoneShade())` on the `cvCanopies` line. |
| B4 kill attack slower | lunge coil 0.6 -> **0.9 s**, sinkhole 0.8 -> **1.2 s** (+50%), told twice (word HE COILS TO LUNGE / THE SAND GIVES WAY, red, the hiss + a churn of sand), a count bar under his shadow; no one-shot (31 dmg at L32 vs ~300 hp). |
| B5 SAND BREATH replaces the projectiles | `breathTell` 0.8 s (throat glows, sand drawn in, a faint cone on the sand where it will go, HE DRAWS BREATH, yellow `!`), then `breath` 0.9 s: a cone 130 px from his mouth to the floor, the direction locked at the tell; **blockable** (a shield facing him) or got behind / rolled; a landed blast = 18 dmg + **GRIT IN YOUR EYES** (1.4 s sand vignette). Marks rows: MARK `!`, ANSWER block, HEIGHT low. The spit and its clots are gone. |
| B6 quicksand in the arena | two 3-tile patches at +11..+13 and +27..+29 (the draft's QS columns, src/quicksand.js rules); ledges may rise over them (a choice: wade and mash out, or go round). No soft-lock: quicksand never kills. |
| B7 less damage | -25% on every move (breach/lunge/bite 41->31, tail 46->35, crash 37->28). |
| B8 numbers | **hp 2150**, WITH FLASKS (human, L32): see Numbers. |

The hollow's winch + great awning are gone (the ledges are the opening now); the hollow's middle wreck's lee was an INVISIBLE shade patch
(shadeZones ran before the wreck was removed) - fixed. Sounds: `wormBreath`, `wormStun`, `stoneRise`, `stoneSink` (src/audio.js).

## A. THE LEVEL (src/draft/sunken-caravan.js, src/sunken-caravan.js, src/main.js desert hands)

1. **THE LOGS ARE GONE.** The photo was THE GREAT RIBCAGE: its ribs were NET (drawn as wooden ladders), its spine a ONEWAY plank and two
   roped SWING planks over the basin. All out. The basin is now **THE SINKING WAGONS**: a half-buried WAGON BED (`pad` with `wreck: true` -
   it sinks under you like a lily pad and drops you into the sand at the bottom, told by its flashing lip) and a SLAB of the old road lying on
   the quicksand (`L.crumbles`, src/tower-collapse.js: three beats, it cracks and goes in, back 4 s later). The lead wagon's plank, the
   trader's platform (planks in the air) are a **sandstone shelf on two ruined piers drawn behind the play** (masonry + facades, held as a
   lintel - tools/architecture.mjs green); the market stall's board is gone (the yard's floor stays clear for THE OLD STINGER's fight). `L.timberPlanks` is empty: no wood in the level but
   the wagon beds. The sinking way's first island is under the sand: nine tiles crossed on a wagon bed + a slab under the twin tower's slinger.
2. **QUICKSAND, TAUGHT -> TESTED -> REMIXED -> EXAM (A4), each with an encounter (A5):** TEACH the ox line's first pit (a sign
   QUICKSAND HOLDS YOU. JUMP, AND KEEP JUMPING., a calm zone - nobody to fight); TEST the second pit + THE SINKING WAGONS basin (a vulture
   over it, a sandworm on the far shore whose dome drives you back toward the sand, torn lean-tos at each shore); REMIX the slide pits, the
   sunken wagons under the slinger, the third slide's wagon-bed run (a vulture); EXAM the rim's island pits + the exam slide (slinger,
   ambusher, a vulture, THE FIRST KNIFE). ruleFight 16 of 30 encounters stand where the rule is active.
3. **DUNE SLIDE-JUMPS** (rec built: **DOWN to slide**, the game's own slide - src/slopes.js slideStep; auto-slide was not built).
   `L.duneSlides` = `[{ id, x, crest, foot, gap, use }]` - **the hook the game-wide SLOPE MOMENTUM lane absorbs**. Four uses: `teach` (the
   first dune, a 5-tile pit a running jump falls into; sign + glint), `long` (THE LONG SLIDE is a ten-row hill now - Daniel's "big hills" -
   into 5 tiles, an ambusher where you land), `beds` (remix: down into six tiles with a wagon bed in the middle - hop it, or carry the slide over
   the lot; optional), `exam` (the rim's last dune, 5 tiles, the First Knife past it). Three are REQUIRED. **tools/caravan-slides.mjs** (new,
   real keys) drives all SEVEN heroes over each required one: a plain run + jump from any frame never clears it; the slide-jump clears it by
   ~1.7 tiles at 180 px/s with a ~20-frame take-off window (a 14-frame press still clears). Stall glints + nudges at each (src/stuck-spots.js
   `caravan`: the first quicksand, the basin's bed, the three slides).
4. **THE MINI SAND WORMS: WHY NOTHING SHOWED.** No row ever placed one: the caravan's GARRISON is scorpion/cutthroat/vulture and the draft
   placed none - the sandworm (src/desert-foes2.js) was the Underwell's. Now three PLACED worms (the road by the first wagon, the basin's far
   shore, under the arch), each on a firm bed. **tools/caravan-worms.mjs** (new, real keys, knight/warden/pyro, no god): each EMERGES (drawn on
   its sand), is TOLD (its dome `lungeTell`, `!!`, heard), LANDS on a hero standing on the dome, and DIES (step off the dome, cut it while it
   sways) in 12-22 s. tools/one-new-foe.mjs: the sandworm is met first in the caravan now, so the Underwell's `NEW_EXACTLY` is `[]` (QUESTION 1).
5. **Difficulty v2.** Shrines: the picker's five stand (~111 route tiles apart; the start, the ox line, the yard door, the sinking way, the
   arena door) - A10b's report lists the caravan as DENSE (58 from the start; report-only, 38 levels); QUESTION 4. Mash, walker, pilot/curve:
   Numbers. level-quality: mechanics (5 kinds / 4 developed), roles (the vulture and sandworm are hit-and-run RUNNERS, as the raptor is),
   secrets (the ribcage's silver moved to THE WATCHTOWER's roof), route bands (5, thanks to the ten-row dune) all CLEAR NOW; the one miss is the
   MULTI-HEIGHT share (18%, the bar is 40%) - **not gated** (QUESTION 3). Wall-walks through the town (`wallWalk` helper, kept, uncalled) got it to
   31% and were taken out: the walked route climbed them, the level-1 pilot was lifted over the whole road (6 hits / 3 runs, out of act 5's
   curve band) and their shade took the exam's sun under its warning.

## Numbers
**THE DUNE WORM** (hp **2150**, L32 = the caravan's campaign level, normal health, tools/boss-rates.mjs `practiced`, 10 seeds a hero):
| profile | knight | warden | pyro | total | fight length |
|---|---|---|---|---|---|
| **human (WITH flasks)** - the target 60-70% | 8/10 | 2/10 | 9/10 | **19/30 = 63%** | 75-172 s, median ~120 |
| human+dry | 4/10 | 2/10 | 8/10 | 14/30 = 47% | |
| MASH (tools/mash-bot.mjs, re-stamped after the level row) | 0/2 | 0/2 | 0/2 | **0/6** - boss left 100%, 0-1 blows of ~1000 landed | 35-46 s |

The tuning walk (the dice are not seeded - ledges, stun timing - so 18-fight samples swing +-12 points): hp 1500 83% (6) -> 2100 72% (18) ->
2300 67% / 44% / 47% (66 fights, 52%) -> 2000 77% (30) -> **2150 63% (30)**. In the scripted Node fight (tools/caravan.mjs) the baiter stuns
him 9 times and kills him in 90 s; with no ledge up, 400+ blows take nothing.

**THE LEVEL** (level hash after the last edit; rows re-stamped LEVEL then BOSS):
- mash LEVEL (L32, machines): knight 2 deaths / lowest 0%, warden 4 / 0%, pyro 2 / 0% - **the mash bot cannot clear it** (mash-gate green).
- level-1 pilot curve row: **182% lost a run, 3 deaths in 3 runs** - inside act 5's band (150-700%, 2-12); curve-gate green.
- campaign WALKER (tools/level-walk.mjs, L32 typical build, human+first, 2 seeds): knight 0 deaths, arrive 96% (min 84) - LOCKED in the
  Traders' Yard both seeds: his duel hands lose THE OLD STINGER (20 s cap; pyro and warden win it), so the room stays shut; warden 0 / 82%
  (min 44); pyro 0 / 93% (min 74). **MISS** against brief-levelsweep v2's 1-2 deaths / < 50% - see QUESTION 6. Its STUCK points: the yard (the
  duel), 266,23 (the arch's lintel top - the route hops it), 426,30 (past the second twin tower).
- the dune slides (tools/caravan-slides.mjs, all 7 heroes x 3 required slides): a plain run + jump never clears (41 take-offs, all in the
  sand); the slide-jump lands 1.70-1.75 tiles past the far lip at 180 px/s; 20-frame windows (a 14-frame press: ~1.0 tile, 17-18 frames).
- the sandworms (tools/caravan-worms.mjs, 3 worms x knight/warden/pyro): all emerge, are told (`lungeTell`, `!!`, heard), land (24) and die
  in 12-22 s.
- level-quality caravan: flat 4%, bands 5, mechanics 5 kinds / 4 developed (quicksand, duneSlides, pad, crumbles; awningwinch), music,
  secrets 2, checks 5 (one per 111 route tiles), density 1.36, roles 3, ruleFight 16/30, curve ok - **misses only the multi-height share**
  (18% vs 40%): not gated (QUESTION 3).

## Checks run (this lane, PORT 8787; never the full suite - the PC is loaded)
Node: caravan, caravan-level, tells, comments, dangling-paths, audit, content-audit, traps, signs, killzones, collectables, keys, elites,
spawns, deadends, architecture, ambush-listed, ambush-reach, checkpoint-gaps, sprinkle-cap, answer-tags, arena-supplies, boss-greed,
weak-bosses, level-quality (every gated level clears), floating-geometry, one-new-foe, curve-gate, mash-gate, mash-carry, stuck --static - all green.
Page: dune-worm, boss-openings, caravan-slides (new), caravan-worms (new), desert-ledge-art, slide, floaters, footing-art, runtime-footing
(one launch flake, green on the rerun), boss-fight-end, boss-read, boss-jump, bandits, desert-foes2, duck, boss-navigation - green.
**RED, not this lane's** (no Rootway / Undead Mage file touched): `stuck` runtime fails ONE Rootway spot, a different one each run
(rw-lean-2, then rw-cellar-span) - every caravan spot passes; `mark-integrity` reports `undeadmage|markTell: PHANTOM POSE` (the Dune Worm's
ripple / breath / tail marks are posed and land). One slip: boss-greed + weak-bosses ran once on the checkout's own port (before the runner
pinned PORT=8787) - their own server, closed by the tool. Not run: the full suite (the PC was loaded all afternoon).

## Tests changed (each to Daniel's 10-09 design, same strictness - never weakened)
- tools/caravan.mjs worm section rewritten: five told attacks (the breath for the spit), the opening caused (bait 9 stuns / no stone 0 /
  stand-and-mash 0), the hide takes nothing from 400+ blows, every stun ends in a ward, ledges 2/3 never more, never under the hero, never in
  the overhang/gate, never none for > 6 s, the caught breach misses a hero on the ledge, the breath cone front-only + blockable, the kill
  tells +50%, -25% damage, the other beats unchanged, the tail/crash checks kept.
- tools/dune-worm.mjs (page): the plates-by-angle block became the HIDE block (0 from every side, answered; stunned x1.5); new: the ledges
  are footing + shade + gone on sink, the stun for real (BK.bossOpen), the breath's grit, a retry clears every ledge; the winch is gone.
- tools/boss-openings.mjs worm row: open sand / a ledge in the ward / a standing ledge (stunned >= 2.4 s, the ledge goes down).
- tools/caravan-level.mjs: A7 (the hollow is level ground, sand + floor-height quicksand), B2 (a wagon bed rests on the quicksand), S2 (a
  basin crossed on beds/slabs is judged by its widest hop; a pit over 3.0 is allowed only at a declared dune slide's foot, <= 5, and >= 3
  slide pits must exist - the slide-jump itself is proved per hero by tools/caravan-slides.mjs).
- tools/level-quality.mjs: `duneSlides` is a system array; ROLES.runner + vulture, sandworm (data, with reasons).
- tools/one-new-foe.mjs: NEW_EXACTLY.underwell `['sandworm']` -> `[]` (QUESTION 1 - this is a design-rule row Daniel set on 10-05).

## QUESTIONS FOR DANIEL (each: rec + what I built)
1. **The sandworm now debuts in the caravan** (the brief's "mini sand worms must appear"), so THE UNDERWELL no longer brings a brand-new foe
   (its 10-05 row said: the sandworm). Rec + built: keep the debut here (the Dune Worm's kin foreshadows him, B8); the Underwell keeps its
   many + FAST worms and its four scorpion skins; `NEW_EXACTLY.underwell = []`. Alternative: a new caravan-only "wormling" kind.
2. **The rule line** stays "THE SUN IS OUT HERE. SHADE IS LIFE." - quicksand and the slides are the level's verbs with their own A4 runs.
   Rec + built: keep it. Alternative: "THE SUN BURNS AND THE SAND SWALLOWS".
3. **level-quality's multi-height bar (40%)** - the caravan's ground is dunes, pits and slides; 18%. Rec: leave it ungated and give the art/
   upper-route pass a ruined upper road through the town (the `wallWalk` helper is there); built: nothing gated.
4. **Shrines**: five, ~111 route tiles apart (A10b wants 140-260; report-only). Rec: drop the road-head shrine (x62) when the act-5 sweep
   lands; built: unchanged (tools/caravan-level.mjs's old S4 40-72 rule would need retiring first).
5. **The Dune Worm with flasks lands at 63%** but the WARDEN trails (2/10 vs knight 8/10, pyro 9/10): the tail sweep is most of what kills
   her (the bot's jump timing). Rec: accept (no hero at 0); a bot pass if you want her closer.
6. **The campaign walker never dies here** (0 deaths, arrives 80-96%) while the level-1 pilot sits inside act 5's curve and the mash bot dies
   2-4 times. Rec: let the act-5 difficulty sweep take it after ksar2's sun v2 lands (its drain is the act's pressure); built here: foes at
   the platforming moments (vultures over the basin, the third slide and the exam slide, worms at the basin's shore, an ambusher at the long
   slide's landing). Alternatively make the exam's slide pit a real death (A10 amended).
7. **Sun v2 (claude/ksar2)** is not on this branch: the level and the boss were measured on today's sun. Rec: re-measure the Dune Worm and
   the walker after the integ merges ksar2 (its drain is stronger; the ledges' shade is the answer in his hollow).

## Integration notes
- claude/ksar2 adds torn awnings at caravan columns [20, 62, 123, 285, 441]: **285 is now the big dune's slope** (move it to 286 - I put a
  torn lean-to on that crest already, so DROP 285) and 441 is the third slide's crest (fine). Its `tools/caravan.mjs` sun hunks and mine (the
  worm section) do not overlap. main.js: my hunks are the worm block (20544-...), `cvCanopies`, `caravanReset`, `updateCaravan` (the crumbles
  step + the quicksand-on-a-mover guard), the pad spawn/update/draw, the hurt line, DMG/bestiary - ksar2 rewrites the sun loop in
  `updateCaravan` next to them: keep both.
- docs/mash-bot.json, docs/level1-curve.json re-stamped (level THEN boss).

## For the SONNET ART LANE
Everything is greybox. Sonnet lane, in this order:
1. **THE DUNE WORM**: a STUNNED pose (head down against the ledge's underside, dazed - today the old `tangled` frame), the SAND BREATH (a
   rear-and-inhale `breathTell`, a jaws-wide blast `breath` - today the spit's two frames) and a proper cone/stream sprite (today a filled
   polygon + particles), the WARD's sand-shell, the GRIT vignette's texture.
2. **THE RISING LEDGES**: a slab of old-town sandstone on two piers that come up out of the sand (cracking crust, sand pouring off), a
   cracked variant for the one he hit, the piers drawn BEHIND the play (today in the boss FX pass, over the hero).
3. **THE WAGON BED** (`pad` + `wreck`, `cvWreckBed` in main.js): a half-buried wagon bed with a wheel rim, three sink states, the lip's
   warning (today 6 px of boards + an arc).
4. **THE SLABS** on the quicksand (cracked sandstone lying on the sand; the crumble cracks draw over it today) and the two ruined-pier
   SHELVES (the lead wagon's, the trader's) - their piers are facades behind the play.
5. **THE GREAT RIBCAGE** as a landmark again: big ox bones arching BEHIND the sinking-wagons basin (dressing - nothing to climb); today two
   small `oxRibs` props.
6. **THE BIG DUNE** (ten rows): a crest silhouette / wind-blown lip, a sand spray while sliding, the glint art on the three slide crests.
7. Optional: an UPPER RUIN ROUTE through the town (the `wallWalk` helper) if Daniel wants the multi-height bar (QUESTION 3).
