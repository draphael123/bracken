# claude/hanging3: THE HANGING VILLAGE 3, CUT IT AND RIDE IT

Branch `claude/hanging3`, worktree `bracken-hanging3`, based on master 7f5e3b5e (BATCH118). Daniel approved the recs on 10-24.
Not merged and not deployed.

## What changed (the layout is kept: seven floors, the hollow, the checkpoints, the hoists)

**The verb is on every floor.**
- A red-and-gold knot is a rope you can cut. Any blow cuts it, with every hero.
- Ranged and body hits cut it too: bolts, embers, thrown hammers, shots, a plunge or a dash, and the pyromancer's jet. `ropeStruck` in src/main.js uses the same projectile lists as the Reeve's lamps.
- What the rope holds is drawn first in gold dots: the landing, the span, the top stop or the end of the line, with an arrow.
- Everything is re-tied after a death.
- New module `src/hanging-ropes.js` (logic plus greybox-plus art in the village's hemp and plank palette). The level data is `L.ropes`.

| floor | rope | role |
|---|---|---|
| roots | cargo net over the road (knot at 86) | taught, safe, with a sign: cut it as the shield comes under; if you miss, it becomes a step |
| ropewalk | swing bridge over 28-33 (was a sliding bough) | first required cut, under the archer, with a sign |
| market | cargo net over the snuffer's walk to the lamp | tested, no sign |
| windy bough | swing bridge over 36-40 (was a sliding bough), gusts behind you | tested; the vine swing stays |
| trunk (T3 to T4) | counterweight deck beside the snapping branches | taught, safe, with a sign |
| upper boughs | pulley line off the springy-bough ledge, over the spiders to 76,49 | taught, one-way ride, optional |
| lantern stair (the exam) | net over the bridge-cutter's post; a bridge over 52-57 tied up high, cut only from a counterweight deck | remix: rope against rope, and ride a deck to cut a bridge mid-ride |

**The Owl Reeve, rebuilt on ropes.**
- **Hanging perches.** Her three perches hang on ropes tied to knots on the floor at 37, 58 and 62.
  - Cut a perch's knot while she sits on it and she falls with it (`perchFall`, then `perchDown`).
  - That is her opening: gold ring and bar (B10), x2 damage for 2.6 s (2.3 s in phase 2), then her told ward (B3). boss-greed counts `perchDown` as open.
  - A downed perch is hauled back up after 12 s. If all three are down, she has NOWHERE TO SIT and comes down.
- **Counterweight decks.** Two decks (at 45-46 and 68-69) take you up level with the outer perches. Her hoot still knocks you off.
- **Phase 2: she cuts ropes herself.**
  - She lands on the rope, says SHE CUTS THE ROPE, and you get a red ring, the creak and the fray for 0.8 s. It is QUIET (it hits nobody).
  - Target order: the deck you are riding, then the ledge you stand on, then the hung ledge nearest you.
  - It is a bag move (weight 3) with a 7 s cooldown, and it is her first act in phase 2.
  - The two ledges over THE DROP are fixed.
- **Kept:** swoop, skim, wing beat, pellets, plunge and bough shake. The lamps stay as a minor extra.
- **Removed:** the dead boughs and the crown hoist. The perches and decks replace them.
- Her frames: `perchDown` uses the pinned frame, `perchFall` the tumble frame, `ropeTell` the beak frame. The bestiary card is rewritten.
- **Bot (src/lab.js):** while she sits on a tied perch, the bot walks to that perch's knot and cuts it.

**Numbers:**
- BOSS_HIT.owl 1.2 → 1.5; her health 1450 → 1750.
- OWL_PERCH: take 2.0, open 2.6/2.3 s, fall 2%, rope cooldown 7 s, tell 0.8 s.
- Perch haul time 12 s.
- The windy bough's west checkpoint (20,65) is removed. Level-quality was already failing `checks` on master (one per 89 route tiles); it now has 5 checkpoints, one per 107. The worst walked gap is 170.
- CHECK_DROP moves 12,51 → 13,51, because the counterweight shaft took columns 10-11.

## Rates (BOT_PROFILE=human, campaign L10, practiced, n=12)
| | knight | warden | pyro | total |
|---|---|---|---|---|
| **with flasks** | 8/12 | 10/12 | 6/12 | **67% (in band)** |
| dry | 4/12 | 8/12 | 4/12 | 44% |

- Fight length (flasks): median win 139 s, median of all fights 111 s, range 42-183 s, 0 timeouts.
- Mash: boss 0/6, mini 0/6. The level mash rows were restamped level first, then boss; every mash hero died, lowest HP 0%.
- Never fully invulnerable: chip 0.4 outside openings. Her ward after an opening is the existing B3 ward.
- The tuning path, for the record (flasks, n=12):
  - 69% / 69% at BOSS_HIT 1.2 with health 1450. In these runs boss-greed was not yet counting `perchDown` as open (a bug, now fixed).
  - 72-83% at 1.25-1.35 once fixed.
  - 53% at 1.6, 69% at 1.45, 67% at 1.5.

## Checks (single runs on this branch; I did not run the full suite)
Green:
- level-quality hanging: CLEARS THE BAR. Pilot (24 blows, walked 100%), curve and mash rows restamped.
- solid-islands: 0 left.
- reach-heroes: all 9 heroes route hanging with 0 crossings.
- checkpoint-gaps, hanging-hoist (rewritten for the ropes and the perch fight), hanging-exam.
- hanging-hoist-walk: page, real keys; every rope walked by knight, warden and pyro; 95 ok.
- stuck: static and runtime, with new glint spots on the three route ropes.
- tells, untold-told, told-sweep12, floaters, answer-tags.
- owl-lamps, owl-swoop, owl-gust, boss-openings, boss-greed, boss-read, hint-shown.
- boss-fight-end: 66/66.
- textfit bestiary + levelcard: 0 problems.
- mobile-perf at 4x: hanging 43.5 fps, crown 50.6 fps, inside budget.

Tool changes:
- tools/stuck.mjs now reads rope knots from L.ropes as the guide's `hvrope` props.
- tools/hint-shown-silent.txt was rewritten; it only shrank (4 dead owl or hoist lines are gone).
- Four new owl lines were added to CALL_LINES.

Reds: none.

## Pictures (docs/hanging3/)
Before (master) and after, at the same spots:
- `before-/after-net-roots`, `bridge-rope`, `net-market`, `bridge-wind`, `cw-trunk`, `line-rook`, `net-cutter`, `stair-remix`, `crown`.
- Each after spot also has a `-cut` shot. The stair also has `after-stair-remix-bridge`.
- The Reeve: `after-owl-perch-sit`, `after-owl-perch-down`, `after-owl-p2-ropetell`.

## QUESTIONS FOR DANIEL
1. **Pyro is the weak hero at 6/12; warden is at 10/12.**
   - Rec (built): leave it. No hero is at 0, and pyro was also the weak hero in owl3 (3/12).
   - Alternative: a slightly longer perch opening for low-health heroes.
2. **The perch opening is 2.6 s, not 3 s.** Three seconds put her at 72-83% even at higher hit numbers.
   - Rec (built): 2.6 s, still x2. Keep it unless it reads short in your hands.
3. **The pulley line on the upper boughs is optional** (a shortcut over the spiders). The required ropes are the ropewalk bridge and the exam's deck-to-bridge.
   - Rec (built): keep it optional.
   - Alternative: make it the only way past the archer.
4. **I removed one checkpoint (the windy bough's west end).** Level-quality wanted one per 90 route tiles. The cliff hall's shrine and the top of the rookery climb now bracket a 170-tile run.
   - Rec (built): accept it, in line with your "fewer checkpoints".
5. **Art.** The new rope props are greybox-plus, drawn in the level's own hemp and plank palette (knots, nets, standing bridges, decks with sandbags, the line seat).
   - Rec: a short Sonnet polish pass (net bundle detail, a cut-rope stub on spent knots, her sawing pose) before or with BATCH119. Nothing is placeholder-grey.
