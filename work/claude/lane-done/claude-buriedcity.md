# claude/buriedcity - THE BURIED CITY + THE HOURGLASS KING (Opus greybox, resume pass 2026-10-09)

The first run died mid-work on 10-08 after 72c9645a (level, hands, construct, king, wiring, greybox art, synth music, tools/buried-city.mjs 156 checks,
tools/buried-city-route.mjs). This pass pushed that commit, found what was still red, and finished the greybox to today's rules.

## Road order
`needs:` chain: caravan > welltown > underwell > redgorge > glasssea > ksar > **buriedcity** (needs 'ksar'). Past the Goblin Queen, so the draft's
sand-goblin slingers are SAND-FOLK SLINGERS (men; the slinger AI under cnSkin 'sandslinger'). The Sealed Pyramid, when it is built, needs 'buriedcity'.

## What this pass changed
- **The sun was burning the hero all through the city** (the route pilot's "hazard" deaths). src/sunstroke.js reads a 5-row roof and the city's rooms are
  10+ rows tall. Now the sun reaches only L.sun's columns (the dunes, 0-34): `sunAt` / `noSun` in src/buried-city-hands.js. **This is the local sun hook
  for A13**: when claude/ksar2's src/drain.js lands, point the drain at `L.sun` / `BCH.sunAt` (listed in tools/dangling-paths.mjs as on a branch).
- **Level quality (was red on bands, mechanics, secrets, roles), now CLEARS THE BAR and is GATED** (tools/level-quality.mjs GATE):
  - ROTTEN BALCONIES: src/tower-collapse.js crumbles in three places (72, 286, 508). Stand on one and it counts three, gives way, and is back 4 s later. None is the main route's only footing.
  - DRIFTS: src/quicksand.js patches, one-row pits of loose sand in four places (82, 158, 397, 476). They hold you; jump, and keep jumping. A sign at the first drift.
  - Second heights: balconies across the long streets. The multi-height share is now over 40%.
  - Silver: the spire top (6,15) and the dome's lantern (166,19) are off the route, and the vault pays the third. The cornice and tower silvers moved, to keep the cap of 3.
  - The construct is listed as the HEAVY role (it is the level's heavy by design).
  - The crumbles update is hooked into the BCH update in main.js.
- **Elite**: THE THRONE'S WARDEN, an elite construct at 486 holding a gate at 493 on the throne street. It is the exam's peak: the trap hall is behind
  you and checkpoint four comes after. tools/elites.mjs is green: the gate opens onto the route.
- **Architecture**: the laid stone (L.masonry) now starts under the sand roof, column by column, and the roof is the dunes' rock. Sand was added over the throne room's roof.
- **The walker stuck at the lower bulb's floor**: the lower bulb counts full in the reach model (`need`), since the upper bulb's sand is always in it by then. GEAR THREE was
  on that floor, buried for good, so it moved to the upper bulb's floor (the drain leaves it lying there).
- **B15 hole closed**: once an opening's 13% cap was reached, a blow did NOTHING. It now pays at least the brass floor (x0.45).
- **The city is weightier**: foeHit is drowned 3.8, slinger 1.8, scorpion 3.4. foeHp is 2.8, 2.0 and 2.8. The construct has 105 hp and hits 21 (poke) and 25 (sweep).
- **Registered**:
  - tools/check.mjs runs 'buried-city'.
  - tools/one-new-foe.mjs: buriedcity's one new foe is the construct.
  - src/foe-react.js: act 5.
  - tools/boss-rows.mjs.
  - The map node moved to (116,72) with its plate above: tools/map-spacing.mjs failed on the Ksar's plate with the old node.
- **The route pilot** (tools/buried-city-route.mjs) now jumps out of a drift, as the play bot does (src/playtest.js).

## THE HOURGLASS KING (B1-B15)
- **What kind of boss:** a puzzle/construct king. His opening is THE LEVEL'S VERB: pull a throne-room sand-gate while his glass runs low, and he STALLS, OPEN (gold ring + bar). The sand drags him to you, so the opening comes to you (B12).
- **Never a wall (B13/B15):**
  - his brass takes x0.45 outside openings;
  - his told ward takes x0.40;
  - while he turns his glass over, a blow lands whole;
  - the opening pays x2.0 (13% cap, then the floor).
- **Phases:**
  - P2: sand banks at both walls; new move: THE TIME SLIP.
  - P3: his glass cracks (it runs in 8 s); two steady pours; new move: THE HOUR STRIKES.
- **No adds.**
- **Numbers now:** 1750 hp; glass 12 s, low window 48% (5.8 s); the slip told 1.0 s; blows pend 24 / gear 23 / stream 28 / slip 24 / hour 26 / pour 6.

| L36, practiced, 6 seeds | knight | warden | pyro | all |
|---|---|---|---|---|
| WITH FLASKS (human) | 6/6 | 1/6 | 4/6 | **61%** (band 60-70) |
| DRY (human+dry) | 3/6 | 1/6 | 3/6 | 39% |
| MASH (boss) | 0/2 | 0/2 | 0/2 | 0/6 |

**Tuning history (with flasks):**

| Setting | Result |
|---|---|
| The first run's numbers | 33% |
| 1800 hp, blows -18% | 33% (knight and warden 0/4) |
| 1550 hp | 86%, but only 7 valid fights on the loaded machine |
| 1650 hp | 44% |
| + low window 0.48, slip 24 | 76% |
| 1750 hp + slip told 1.0 s | 61% |

The warden's deaths are mostly THE TIME SLIP and the sand stream. In the probe the knight with the old 4.3 s window never reached a lever before the window shut.

## The level, measured
- **Route pilot (no foes, knight):** all 8 legs walked, 0 lifts, 0 deaths. Before the sun fix: 4 legs lifted and 9 deaths.
- **Walker (L36, typical build, human+first, 1 seed each):**
  - knight: 1 death (THE FALL at the trap hall); arrivals 100%.
  - warden: 0 deaths; arrives 93% mean; it was STUCK at the lower bulb before the fix above. This run was not repeated after the fix.
  - pyro: 0 deaths; arrives 98%.
  - **The target (1-2 deaths, arrive under 50%) is MISSED on arrival.** The walker takes 3-4 blows in the whole level and kills 22-27.
- **Level-1 pilot:** 14 hits, 3 deaths over 3 runs (98 lifts: the pilot cannot work the sand-gates). Stamped in docs/level1-pilot.json.
- **Mash LEVEL:** knight, warden and pyro all die (lowest hp 0%). Stamped, LEVEL then BOSS, in docs/mash-bot.json.

## Checks run (all green at the end)
- **Level and boss checks:** buried-city (156), level-quality (gated: CLEARS), elites, architecture, map-spacing, map-grammar, dangling-paths, collectables, keys, deadends, audit, spawns, killzones, signs, floaters, checkpoints, checkpoint-gaps, checkpoint-stand, death-cost, relics, sprinkle-cap.
- **Foe and fight checks:** goblin-lint, one-new-foe, tells, boss-read, boss-greed, boss-music, answer-tags, threat-holes, hint-shown, stuck, rule-openings, corpses, skins.
- **Infrastructure checks:** comments, homepaths, npc-removal, audio-assets, shop-gates, mash-gate, curve-gate.
- **Not run:** the full suite. The machine was out of memory (fork failures, about half the page loads timed out), so every tool was run alone on PORT 8776.

## QUESTIONS FOR DANIEL (each rec is what is built)
1. **Walker arrival is about 95%, not under 50%.** This is the same miss as the Ksar: the L36 walker's skills clear squads before they swing.
   - Rec: judge on deaths and the exam, and leave it to the act-5 level sweep.
   - Alt: double the squads in sections 2 and 4.
2. **The warden wins 1/6 against the king (the knight 6/6).**
   - Rec: keep; the band is met and no hero is at 0.
   - Alt: shorten the slip's reach (slipR 22 to 18) for everyone.
3. **The king's opening is gated by his glass running low.** The low window is a timer, but the opening is something you DO (pull a lever), and he is always hittable (x0.45).
   - Rec: keep. It reads as B14's "the rule makes the opening", not a waiting room.
4. **Drifts and rotten balconies** are the city's sand as platforming, added for the gadget bar.
   - Rec: keep; both are told and drawn.
   - Alt: cut the drifts and accept fewer gadget kinds.
5. **An elite construct holds the throne street** (the concept said no minis; an elite is not a mini).
   - Rec: keep.
6. **MUSIC (list only, nothing downloaded; please re-read each licence on its page):** the level plays its synth bed today.
   - "Loopable Dungeon Ambience" (CC0, opengameart.org/content/loopable-dungeon-ambience). This is my rec, for the buried halls.
   - "Ancient Ruins" by Wolfgang_ (CC-BY 3.0, opengameart.org/content/ancient-ruins).
   - "Desert Loop (Lo-Fi Remaster)" by iamoneabe (CC0). It is a remaster of the Ksar's own track, so it is too close.
   - The king's theme stays composed in code.

## For a read-only reviewer
- The level is src/buried-city.js; the rule is src/buried-city-hands.js; the boss is src/hourglass-king.js plus its hands; the construct is src/construct.js.
- Check the opening's reach for a melee hero: the levers are at the throne room's walls and the king walks to you.
- Check the drift and rotten-balcony placement against A10: no untold death.
- The trap hall is a real death in the exam: is it told enough?
- Identity against Mage's Folly: greybox art only (src/redraw/buried_city_art.js). It still needs a Sonnet art pass and a real track.
- level-quality's crumble places count `x0 / 16` on tile columns (SYSTEM_ARRAYS reads `it.x0 / TS`). That is why the crumbles are spread so far apart: a quirk of the tool, not changed here.
