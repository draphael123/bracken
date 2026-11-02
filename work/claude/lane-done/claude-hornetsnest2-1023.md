# claude/hornetsnest2 - THE HORNET'S NEST 2 (Daniel's 10-23 playtest, scratch/brief-hornetsnest2-1023.md, all four items)

Base master 7cc06bae (BATCH116). Branch claude/hornetsnest2. Not merged, not deployed. Lane: opus.

## What changed, per item
1. **MAIN ROAD LEVEL 2.** The road is now THE LUMBER TRAIL -> THE HORNET'S NEST -> MARSH WOOD.
   - In the data: `hornetsnest.needs = 'wood'` with no spur, and `marsh.needs = 'hornetsnest'`.
   - The map node moved onto the road's own bend at (122,79), between the trail and the store/marsh. It is no longer a spur.
   - **Old saves:** `progDefaults` gets `nestRoadMig`. A save with the Lumber Trail or the marsh cleared keeps MARSH WOOD open (`PROG.marshOpen`, once). `levelLocked` honours it.
   - TIER (0 / 0.1 / 0.15) was already monotonic. TIER_BOSS is frozen and unchanged. The campaign level is L3.
   - **Transitions** are draw-only, so no neighbour's hash moves:
     - The great pine with its paper nest appears on the Lumber Trail's horizon past the felling clearing, and behind MARSH WOOD's first screens.
     - Paper scraps lie in the old pines at the nest's foot.
     - The level's end is the new **THE MARSH EDGE** (cols 354-419): roots, two shallow pools (the first water), reeds, cattails, lily pads, low mist, and the gate.
   - The level card sub now reads "up the great pine, through the paper nest, down to the marsh".
   - tools/map-forks now checks the new road at runtime (the trail opens the nest; the marsh waits for it) and the grandfathering of old saves.
2. **ONE ARENA.** The great-pine P2 room is deleted. The Queen fights both phases in THE BROOD HALL.
   - **P1** is unchanged: comb perches, smoke daze, wing-buzz, brood cells, sweep.
   - **The tear (55%)** is told: she rears and the inner perches shake.
     - The inner perches tear loose and hang as two TORN COMBS. THE LAST COMB, the royal comb, sags out of the vault.
     - HONEY floods the floor: it is sticky, using the nest's own rule (`addHoney`).
     - Her brood's drones drown, so there are no adds in P2.
   - **P2 THE HONEY HALL** keeps her loop, dive, stinger volley and swarm cloak (smoke strips the cloak).
     - **Cut a torn comb.** It drops as dry footing out of the honey (her stoop sticks in it). Cut it as she passes under and it lands on her: PINNED (x2, capped 22%).
     - **From a cut comb's inner end, cut THE LAST COMB.** It is the big pin (capped 30%, held 4.4 s).
     - A comb dropped on her while she is STUCK or DAZED turns that opening into the pin.
     - A thrown smoke pot now cuts a hanging comb too, so every hero can reach a high comb.
   - **The old separating section is now the level's own end.** After her death the nest tears loose (`hqDown`): you climb down THE FALLING NEST (crumbling ledges, falling comb told by red rings) past the shrine to THE MARSH EDGE and the gate (`gateAfterBoss`).
     - A death on the way down wakes you at the hall's torn side, and she stays dead.
   - **Old P2 pine/outside art:** the pine room's code and data are gone (pines, bough, arena2, escape). The great-pine sprites belong to Old Tusker / the backdrop, so they were kept.
3. **The mage-looking foe was the VENOM SPITTER, and it is removed.**
   - Removed with it: its skin, bestiary row, short name, colours, voice, and its props-sheet row.
   - The level kept a ranged foe that is a hornet: THE STINGER HORNET (cnSkin 'stinger').
     - It is the spitter's machine drawn as a nest hornet clinging to the comb (abdomen curled, a venom bead).
     - It holds 5 of the old 6 posts: hollow, cells, wax, exam, nursery.
     - Without a ranged foe the level-1 curve read EASY (30% hp lost a run); with it the curve reads 88%.
4. **THE FAT HONEY HORNET** (src/honey-hornet.js, pure; reusable in later levels).
   - It is slow and tanky (54 hp).
   - **ARMOURED abdomen:** a cut from behind lands at x0.5 and is told (clank and ARMOURED). The head takes it whole.
   - **The told DRIP:** its sac swells, a yellow `!`, and it drops a HONEY GLOB. Where the glob splashes it leaves a sticky patch for 6 s. It does not drip when a ledge would catch the glob; it comes down to ram instead.
   - **The told RAM:** a wind-up buzz and a lean back, a yellow `!`, then it rams at your height. A shield makes it reel.
   - **SMOKE makes it DROWSY:** it sinks to the ground and lies open (x2).
   - Five sit on the climb (nest hornets 0.6 -> 0.85): the cells chamber (taught near the throat's stand, with a sign), the waxed floor, the span, the stair exam, and the nursery.
   - Registries: EHP, KNOCK_SKIP, HAS_HURT/C3_DEAD, bestiary, short name, colours, threat 2.2, voice, marks / answers / heights, told signature (ramTell parry), level-quality roles (ranged + heavy), one-new-foe (hornetsnest brings swarm + honeyhornet: Daniel's ask), blow-tags.

## Rates (boss-rates, practiced, L3, campaign kit)
| Run | knight | warden | pyro | Total |
|---|---|---|---|---|
| With flasks (`human`, 6 seeds) | 4/6 | 4/6 | 4/6 | **67%, in band** |
| Dry (`human+dry`, 4 seeds) | 4/4 | 1/4 | 2/4 | 58% |
| Mash bot (boss) | 0/2 | 0/2 | 0/2 | **0/6**, stamped |

- The level mash bot dies with every hero (stamped).
- **The bot uses the kit.** Probe counters over 12 fights:
  - every fight tears the hall;
  - the knight pins 2 torn combs per fight;
  - the pyro drops THE LAST COMB (pinLast 1) and dazes her 2-4 times with a carried pot;
  - stuck-in-heap (the cut comb) happens 1-3 times a fight;
  - every hero smokes the cloak.
- **Walker** (`level-walk`, 3 seeds, L3, human+first):

  | Hero | Deaths | Mean shrine arrival | Note |
  |---|---|---|---|
  | knight | 1.0 | 62% | on target |
  | warden | 0.3 | 46% | |
  | pyro | 0.3 | 78% | |
  | **Mean** | **0.53** | | **inside the act-I band (0.5-1.5)** |

  The warden and pyro sit under 0.5 each.

## Checks
- **hornets-nest:** 165 ok, rewritten for the new structure.
  - The road and the old-save migration; one arena; the tear; the P2 combs (reach geometry, pins, caps, the daze-to-pin upgrade).
  - The fat honey hornet: drip, ram, armour, drowsy, and B16 poses.
  - The bot cuts the torn comb and the last comb on her pass.
- **level-quality hornetsnest:** every row ok after the re-stamps.
- **Subset gate** (all green): signs, solid-islands, reach-heroes (to the new gate, all 9 heroes, every comb lock), deadends, elites, answer-tags, map-grammar, map-forks (new road + grandfathering), map-spacing, curve-shape, one-new-foe, blow-tags, tells (MARK regenerated: `--write`), told, dangling, rule-state, skins, sprinkle-cap, ambient, island, stuck (static + runtime), level-reach.
- **Re-stamped:** docs/level1-pilot.json, level1-curve.json, mash-bot.json (level + boss).
- **Page checks:**
  - Green: corpses (every nest reskin, including the stinger, dies in its own skin), mobile-perf, map-scale, foe-pass + foe-pass-page, boss-music, boss-select, hint-shown, untold-told, map-forks.
  - textfit: TIMED OUT in its "store" and "levelcard" scopes (480 s, and again with the limit raised). The PC is loaded and memguard was killing headless Chromes. The bestiary, plates and hints scopes passed. Re-run it in integration.

## Pictures (work/claude/lane-done/)
- **Before:** hornetsnestart-after-hall / -fall / -pine / -foe-hollow (the venom spitter), from the BATCH116 art lane.
- **After:** hornetsnest2-q2-p1, -q2-tearTell, -q2-tear, -q2-honey, -q2-heap, -q2-pinLast, -q2-dead, -q2-falling, -foot, -hall, -edge-roots, -edge-water, -edge-gate, -stinger (THE STINGER HORNET), -hh-* (each honey hornet pose in play: patrol, dripTell, drop, ramTell, ram, reel, drowsy, dead, patch), -honeyhornet-sheet.
- **Tools:** tools/hornetsnest2-shots.mjs, tools/honeyhornet-sheet.mjs.

## Reds
- **Walker:** the mean is in band (0.53), but the warden and pyro read 0.3 each.
  - The walker STUCKs at the nest-guard gate (169,31): it cannot beat the shield elite from the front in 20 s. This is a known limit from the first nest lane.
  - It also STUCKs once each at the throat (82,53 / 83,43), the bridge (120,32) and the nursery (284,9). Coverage is 33-76%.
- **textfit store/levelcard scope timeouts** (see Checks; the previous nest lanes saw the same levelcard timer).
- **The full suite was not run** (BATCH117 gate and the COOPBALANCE lane share this PC); subsets only.
- **src/marks.js MARK was regenerated** by `tools/tells.mjs --write`. The whole table rewrapped, so integration should re-run `--write` after merging.

## Art follow-up (a small sonnet lane; no level-hash changes needed)
1. **FAT HONEY HORNET:** a real redraw on the HONEY_POSE contract (10 frames). It needs readable armour plates, a ram smear, the drowsy and dead poses, and a card portrait. Also the glob sprite and the splash patch (rects now).
2. **THE HONEY HALL:**
   - the flood (a band and drips now);
   - the vault's tear (a ragged hole with light through it);
   - torn-comb stalks up to the tear, and THE LAST COMB as a royal comb;
   - the queen PINNED UNDER the comb (the comb drawn over her);
   - a honey splash when a comb lands.
3. **The tear transition:** comb shards and debris during the told rear-up.
4. **Transition dressing:**
   - the paper scraps, reeds, cattails, pads and mist (greybox rects);
   - the far great-pine silhouette on the Lumber Trail and Marsh horizons;
   - a muddy-bank / reed tile variant for THE MARSH EDGE (it uses the nest's outside duff/bark kit now).
5. **Map:** a landmark beside the new node (a little pine with a paper nest; LANDMARKS + map-scale).
6. **Audio:** a distant hum in the old pines. The honey hornet's voice is the bug kit at rate 0.6.

## QUESTIONS FOR DANIEL (rec first; what I built)
1. **The venom spitter's machine is kept under a hornet skin (THE STINGER HORNET).** The level needs a ranged foe (level-quality ranged row, and the curve read EASY without it).
   - Rec: keep it; if it still reads as not-a-hornet in play, the art follow-up redraws it.
   - Built: 5 stingers on the old spitter posts.
2. **Five fat honey hornets** (to replace the spitters' pressure).
   - Rec: keep 4-5.
   - Built: 5.
3. **P2 pins are limited:** two torn combs plus THE LAST COMB, and they do not re-hang. The rest of P2 runs on stuck, smoke and shield openings.
   - Rec: keep.
   - Built: that.
4. **THE MARSH EDGE walk-out has two stragglers** (a hornet and a drone).
   - Rec: keep it light.
   - Built: that.
